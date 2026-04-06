import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconRetinaUrl: iconUrl,
})

export const PARK_CENTER: [number, number] = [52.0, 4.35] // update to your park
export const PARK_ZOOM = 15