import type { Animal } from "./animal.types"
import type { GeoJSONPoint } from "./geo.types"

export interface Pin {
  id: number
  location: GeoJSONPoint
  animal_id: number
  observed_at: string
  photo_url: string | null
  is_verified: boolean
  created_at: string
  user_id: string | null
  park_id: number
}

export interface PinWithAnimal extends Pin {
  animals: Pick<Animal, 'common_name' | 'species' | 'icon_url'>
}
