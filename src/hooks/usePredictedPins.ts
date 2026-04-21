import { useEffect, useState } from 'react'
import type { PinWithAnimal } from '../types/pin.types'
import { dbGetPinsPerAnimal } from '../lib/databaseClient'

// Returns 0–1: how close two circular values are (hours wrap at 24, months at 12)
function circularSimilarity(a: number, b: number, range: number): number {
  const diff = Math.abs(a - b) % range
  const dist = Math.min(diff, range - diff)
  return Math.max(0, 1 - dist / (range / 2))
}

function timeOfDayScore(pinHour: number, nowHour: number): number {
  return circularSimilarity(pinHour, nowHour, 24)
}

function timeOfYearScore(pinMonth: number, nowMonth: number): number {
  return circularSimilarity(pinMonth, nowMonth, 12)
}

export function usePredictedPins(parkId: number | null, animalId: number | null) {
  const [pins, setPins] = useState<PinWithAnimal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (parkId === null) return

    const now = new Date()
    const nowHour  = now.getHours()
    const nowMonth = now.getMonth() // 0–11

    dbGetPinsPerAnimal(parkId, animalId).then(({ data, error }) => {
      if (error || !data) { setLoading(false); return }

      // Score and attach weight to each pin
      const weighted = data.map(pin => {
        const observed  = new Date(pin.observed_at)
        const pinHour   = observed.getHours()
        const pinMonth  = observed.getMonth()

        const dayScore    = timeOfDayScore(pinHour, nowHour)
        const seasonScore = timeOfYearScore(pinMonth, nowMonth)
        const verifiedBonus = pin.is_verified ? 1.2 : 1.0

        // Combine scores — season weighted slightly more than time of day
        const weight = ((dayScore * 0.4) + (seasonScore * 0.6)) * verifiedBonus

        return { ...pin, _weight: weight } as PinWithAnimal & { _weight: number }
      })

      // Filter out pins with very low relevance
      const relevant = weighted.filter(p => p._weight > 0.15)

      setPins(relevant)
      setLoading(false)
    })
  }, [parkId, animalId])

  return { pins, loading }
}