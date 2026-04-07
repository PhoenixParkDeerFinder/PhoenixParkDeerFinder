export interface GeoJSONPoint {
  type: 'Point'
  coordinates: [number, number]  // [lng, lat]
}

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: [number, number][][]
}