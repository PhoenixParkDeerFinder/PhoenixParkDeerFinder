import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
import type { GeoJSONPoint, GeoJSONPolygon } from "../types";
import { supabase } from "./supabaseClient";

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

export async function getParkBounds(parkId: number) {
  const { data } = await supabase
    .from("parks")
    .select("bounds")
    .eq("id", parkId)
    .single();

  if (!data?.bounds) return null;

  const geom = data.bounds as GeoJSONPolygon;
  return geom.coordinates[0].map(
    ([lng, lat]) => [lat, lng] as [number, number],
  );
}
