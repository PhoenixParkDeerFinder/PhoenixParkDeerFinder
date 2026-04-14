import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
import type { GeoJSONPoint } from "../types/geo.types";

L.Icon.Default.mergeOptions({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconRetinaUrl: iconUrl,
});

export const PARK_ZOOM = 14;

export function postgisPointToLatLng(geom: GeoJSONPoint): [number, number] {
  return [geom.coordinates[1], geom.coordinates[0]]; // flip lng/lat → lat/lng
}

export function getPhotoUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/public_assets/pin_photos/${path}`;
}
