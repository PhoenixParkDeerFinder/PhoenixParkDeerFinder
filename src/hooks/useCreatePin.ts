import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { LatLng } from "leaflet";

const RATE_LIMIT = 5; // max pins per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const STORAGE_KEY = "df_anon_pins";

interface Attempt {
  ts: number;
}

function getAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Attempt[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - WINDOW_MS;
    return all.filter((a) => a.ts > cutoff);
  } catch {
    return [];
  }
}

function recordAttempt() {
  const attempts = getAttempts();
  attempts.push({ ts: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}

function isRateLimited(): boolean {
  return getAttempts().length >= RATE_LIMIT;
}

interface CreatePinArgs {
  latlng: LatLng;
  parkId: number;
  animalId: number;
  photoFile: File | null;
}

type CreatePinResult = "success" | "blocked" | "error";

export function useCreatePin() {
  const [error, setError] = useState<string | null>(null);

  async function createPin({
    latlng,
    parkId,
    animalId,
    photoFile,
  }: CreatePinArgs): Promise<CreatePinResult> {
    // Check session — authenticated users skip rate limiting
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    if (!isAuthenticated && isRateLimited()) {
      return "blocked";
    }

    let photoPath: string | null = null;

    // Upload photo if provided
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("public_assets")
        .upload(`pin_photos/${filename}`, photoFile, { upsert: false });

      if (uploadError) {
        setError("Photo upload failed.");
        return "error";
      }
      photoPath = filename;
    }

    // Build PostGIS point — note lng, lat order
    const location = `POINT(${latlng.lng} ${latlng.lat})`;

    const { error: insertError } = await supabase.from("pins").insert({
      location,
      animal_id: animalId,
      park_id: parkId,
      photo_url: photoPath,
      is_verified: false,
    });

    if (insertError) {
      setError(insertError.message);
      return "error";
    }

    // Only record against the rate limit for anonymous submissions
    if (!isAuthenticated) recordAttempt();

    return "success";
  }

  return { createPin, error };
}
