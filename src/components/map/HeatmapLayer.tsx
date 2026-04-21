import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import type { PinWithAnimal } from '../../types/pin.types'

interface Props {
  pins: PinWithAnimal[]
  mode: 'actual' | 'predicted'
}

const ACTUAL_GRADIENT = {
  0.0: '#313695',
  0.2: '#4575b4',
  0.4: '#74add1',
  0.6: '#fdae61',
  0.8: '#f46d43',
  1.0: '#d73027',
}

const PREDICTED_GRADIENT = {
  0.0: '#1a3a1a',
  0.2: '#2d6a2d',
  0.4: '#52a852',
  0.6: '#a8d96c',
  0.8: '#d4f07a',
  1.0: '#f5ff82',
}

function pinToHeatPoint(pin: PinWithAnimal): [number, number, number] {
  const [lng, lat] = pin.location.coordinates
  // Verified pins count more in the heatmap
  const intensity = pin.is_verified ? 1.0 : 0.5
  return [lat, lng, intensity]
}

export default function HeatmapLayer({ pins, mode }: Props) {
  const map = useMap()
  const layerRef = useRef<L.HeatLayer | null>(null)

  useEffect(() => {
    const points = pins.map(pinToHeatPoint)

    const gradient = mode === 'predicted' ? PREDICTED_GRADIENT : ACTUAL_GRADIENT

    if (layerRef.current) {
      layerRef.current.setLatLngs(points)
      layerRef.current.setOptions({ gradient })
      layerRef.current.redraw()
    } else {
      layerRef.current = L.heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        max: 1.0,
        minOpacity: 0.3,
        gradient,
      }).addTo(map)
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [pins, map, mode])

  return null
}