import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { PinWithAnimal } from '../types'

export function usePins(parkId: number | null) {
  const [pins, setPins] = useState<PinWithAnimal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (parkId === null) return

    // Initial fetch
    supabase
      .from('pins')
      .select('*, animals(common_name, species, icon_url)')
      .eq('park_id', parkId)
      .then(({ data, error }) => {
        if (!error && data) setPins(data as PinWithAnimal[])
        setLoading(false)
      })

    // Realtime subscription — new pins appear live
    const channel = supabase
      .channel('pins-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pins', filter: `park_id=eq.${parkId}` },
        async (payload) => {
          // Re-fetch the new pin with its animal join
          const { data } = await supabase
            .from('pins')
            .select('*, animals(common_name, species, icon_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) setPins(prev => [...prev, data as PinWithAnimal])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [parkId])

  return { pins, loading }
}