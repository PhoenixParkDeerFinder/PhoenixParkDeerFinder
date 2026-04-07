import type { GeoJSONPolygon, GeoJSONPoint } from "./geo.types"

export interface Park {
  id: number
  name: string
  default_zoom: number
  bounds: GeoJSONPolygon | null
  center_location: GeoJSONPoint
  created_at: string
}