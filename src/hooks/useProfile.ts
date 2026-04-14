import { useEffect, useState } from 'react'
import { dbGetUserProfile, dbUpdateUsername } from '../lib/databaseClient'
import type { Profile } from '../types/profile.types'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dbGetUserProfile(userId)
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })
  }, [userId])

  async function updateUsername(username: string): Promise<string | null> {
    if (!userId) return 'Not signed in.'
    if (!USERNAME_REGEX.test(username)) {
      return 'Username must be 3–20 characters and contain only letters, numbers, or underscores.'
    }

    const { error } = await dbUpdateUsername(username, userId)

    if (error) {
      if (error.code === '23505') return 'That username is already taken.'
      return error.message
    }

    setProfile(prev => prev ? { ...prev, username } : null)
    return null
  }

  return { profile, loading, updateUsername }
}