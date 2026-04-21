import { useEffect, useState, useCallback, useEffectEvent } from 'react'
import type { PinWithAnimal } from '../types/pin.types'
import { database } from '../lib/databaseClient' //TODO: Temporary

export type VerifiedFilter = 'all' | 'pending' | 'verified'
export type SortField    = 'observed_at' | 'created_at' | 'animal'
export type SortDir      = 'asc' | 'desc'

export interface AdminPinFilters {
  verified:  VerifiedFilter
  animalId:  number | null
  sortField: SortField
  sortDir:   SortDir
  search:    string
  maxAgeHours:       number
}

export const DEFAULT_ADMIN_FILTERS: AdminPinFilters = {
  verified:  'pending',
  animalId:  null,
  sortField: 'created_at',
  sortDir:   'desc',
  search:    '',
  maxAgeHours:       48,
}

const PAGE_SIZE = 20

export function useAdminPins(parkId: number | null, filters: AdminPinFilters) {
  const [pins, setPins]       = useState<PinWithAnimal[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async (pageIndex: number) => {
    if (parkId === null) return
    setLoading(true)

    const cutoff = new Date(
    Date.now() - filters.maxAgeHours * 60 * 60 * 1000,
  ).toISOString();

    let query = database
      .from('pins')
      .select('*, animals(common_name, species, icon_url), profiles(username)', { count: 'exact' })
      .eq('park_id', parkId)
    .gte("observed_at", cutoff);

    if (filters.verified === 'pending')  query = query.eq('is_verified', false)
    if (filters.verified === 'verified') query = query.eq('is_verified', true)
    if (filters.animalId !== null)       query = query.eq('animal_id', filters.animalId)

    // Sort — animal name requires a join alias trick so we sort client-side for that case
    if (filters.sortField !== 'animal') {
      query = query.order(filters.sortField, { ascending: filters.sortDir === 'asc' })
    }

    query = query.range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)

    const { data, error, count } = await query

    if (error || !data) { setLoading(false); return }

    // Fetch usernames
    const userIds = [...new Set(
      data.map(p => p.user_id).filter((id): id is string => id !== null)
    )]

    const profileMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await database
        .from('profiles')
        .select('id, username')
        .in('id', userIds)
      profiles?.forEach(p => { profileMap[p.id] = p.username })
    }

    let result = data.map(pin => ({
      ...pin,
      profiles: pin.user_id ? { username: profileMap[pin.user_id] ?? 'unknown' } : null,
    })) as PinWithAnimal[]

    // Client-side animal sort
    if (filters.sortField === 'animal') {
      result.sort((a, b) => {
        const nameA = a.animals?.common_name ?? ''
        const nameB = b.animals?.common_name ?? ''
        return filters.sortDir === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA)
      })
    }

    // Client-side username search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(p =>
        p.animals?.common_name.toLowerCase().includes(q) ||
        p.profiles?.username?.toLowerCase().includes(q)
      )
    }

    setPins(result)
    setTotal(count ?? 0)
    setLoading(false)
  }, [parkId, filters])

  const onMount = useEffectEvent(() => {
    setPage(0)
    fetch(0)
  })

  useEffect(() => {
    onMount()
  }, [fetch, filters, parkId])


  function nextPage() {
    const next = page + 1
    setPage(next)
    fetch(next)
  }

  function prevPage() {
    const prev = Math.max(0, page - 1)
    setPage(prev)
    fetch(prev)
  }

  async function verifyPin(id: number): Promise<boolean> {
    const { error } = await database
      .from('pins')
      .update({ is_verified: true })
      .eq('id', id)

    if (error) return false
    setPins(prev => prev.filter(p => p.id !== id))
    setTotal(t => t - 1)
    return true
  }

  async function deletePin(id: number): Promise<boolean> {
    const { error } = await database
      .from('pins')
      .delete()
      .eq('id', id)

    if (error) return false
    setPins(prev => prev.filter(p => p.id !== id))
    setTotal(t => t - 1)
    return true
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return { pins, total, loading, page, totalPages, nextPage, prevPage, verifyPin, deletePin }
}