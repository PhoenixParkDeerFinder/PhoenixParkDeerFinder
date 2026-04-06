import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Animal } from '../types'

export function useAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('animals')
      .select('*')
      .order('common_name')
      .then(({ data, error }) => {
        if (!error && data) setAnimals(data)
        setLoading(false)
      })
  }, [])

  return { animals, loading }
}