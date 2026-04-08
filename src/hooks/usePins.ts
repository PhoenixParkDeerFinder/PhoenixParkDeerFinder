import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { PinWithAnimal } from '../types'
import type { FilterState } from '../components/map/FilterBar'

export function usePins(parkId: number | null, filters: FilterState) {
  const [pins, setPins] = useState<PinWithAnimal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (parkId === null) return

    const cutoff = new Date(
      Date.now() - filters.maxAgeHours * 60 * 60 * 1000
    ).toISOString()

    let query = supabase
      .from('pins')
      .select('*, animals(common_name, species, icon_url)')
      .eq('park_id', parkId)
      .gte('observed_at', cutoff)

    if (filters.animalId !== null) {
      query = query.eq('animal_id', filters.animalId)
    }

    if (filters.verifiedOnly) {
      query = query.eq('is_verified', true)
    }

    if (filters.hasPhoto) {
      query = query.not("photo_name", "is", null)
    }

    query.then(({ data, error }) => {
      if (!error && data) setPins(data as PinWithAnimal[])
      setLoading(false)
    })

    const channel = supabase
      .channel(`pins-${parkId}-${JSON.stringify(filters)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pins', filter: `park_id=eq.${parkId}` },
        async (payload) => {
          const { data } = await supabase
            .from('pins')
            .select('*, animals(common_name, species, icon_url)')
            .eq('id', payload.new.id)
            .single()

          if (!data) return

          const pinAge = Date.now() - new Date(data.observed_at).getTime()
          const ageHours = pinAge / (1000 * 60 * 60)

          if (ageHours > filters.maxAgeHours) return
          if (filters.verifiedOnly && !data.is_verified) return
          if (filters.animalId !== null && data.animal_id !== filters.animalId) return

          setPins(prev => [...prev, data as PinWithAnimal])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [parkId, filters.animalId, filters.verifiedOnly, filters.maxAgeHours, filters])

  return { pins, loading }
}