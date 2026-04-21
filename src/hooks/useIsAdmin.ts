import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { dbGetUserRole } from '../lib/databaseClient'

export function useIsAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { return } //TODO: add setLoading calls to this and other effects where relevant

    dbGetUserRole(user.id)
      .then(({ data }) => {
        setIsAdmin(data?.role === 'admin')
        setLoading(false)
      })
  }, [user])

  return { isAdmin, loading }
}