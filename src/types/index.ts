export interface GeoJSONPoint {
  type: 'Point'
  coordinates: [number, number]  // [lng, lat]
}

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: [number, number][][]
}

export interface Park {
  id: number
  name: string
  default_zoom: number
  bounds: GeoJSONPolygon | null
  center_location: GeoJSONPoint
  created_at: string
}

export interface Animal {
  id: number
  common_name: string
  species: string | null
  icon_url: string | null
  description: string | null
  created_at: string
}

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