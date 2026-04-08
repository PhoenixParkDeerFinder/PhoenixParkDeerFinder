import { useState } from 'react'

type Status = 'idle' | 'requesting' | 'success' | 'denied' | 'unavailable' | 'error'

interface GeolocationResult {
  status: Status
  request: () => Promise<{ lat: number; lng: number; accuracy: number } | null>
}

export function useGeolocation(): GeolocationResult {
  const [status, setStatus] = useState<Status>('idle')

  async function request() {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return null
    }

    setStatus('requesting')

    return new Promise<{ lat: number; lng: number; accuracy: number } | null>(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => {
          setStatus('success')
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
          })
        },
        error => {
          if (error.code === error.PERMISSION_DENIED) {
            setStatus('denied')
          } else {
            setStatus('error')
          }
          resolve(null)
        },
        {
          enableHighAccuracy: true,  // requests GPS rather than IP fallback
          timeout: 10000,
          maximumAge: 0,             // always fetch fresh, don't use cached position
        }
      )
    })
  }

  return { status, request }
}