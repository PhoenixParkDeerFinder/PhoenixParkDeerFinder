import { createClient, type User } from "@supabase/supabase-js";
import type { FilterState } from "../components/map/FilterBar";
import type { PinWithAnimal } from "../types/pin.types";
import type { Dispatch, SetStateAction } from "react";

const database = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export async function dbGetPinsWithProfiles(
  parkId: number,
  filters: FilterState,
): Promise<PinWithAnimal[]> {
  const cutoff = new Date(
    Date.now() - filters.maxAgeHours * 60 * 60 * 1000,
  ).toISOString();

  let query = database
    .from("pins")
    .select("*, animals(common_name, species, icon_url)")
    .eq("park_id", parkId)
    .gte("observed_at", cutoff);

  if (filters.animalId !== null)
    query = query.eq("animal_id", filters.animalId);
  if (filters.verifiedOnly) query = query.eq("is_verified", true);
  if (filters.hasPhoto) {
    query = query.not("photo_name", "is", null);
  }

  const { data: pinsData, error } = await query;
  if (error || !pinsData) return [];

  // Collect non-null user_ids and fetch their profiles in one query
  const userIds = [
    ...new Set(
      pinsData.map((p) => p.user_id).filter((id): id is string => id !== null),
    ),
  ];

  const profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await database
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    profiles?.forEach((p) => {
      profileMap[p.id] = p.username;
    });
  }

  return pinsData.map((pin) => ({
    ...pin,
    profiles: pin.user_id
      ? { username: profileMap[pin.user_id] ?? "unknown" }
      : null,
  })) as PinWithAnimal[];
}

export async function dbSubscribeToPinChanges(
  parkId: number | null,
  filters: FilterState,
  setPins: Dispatch<SetStateAction<PinWithAnimal[]>>,
) {
  const channel = database
    .channel(`pins-${parkId}-${JSON.stringify(filters)}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "pins",
        filter: `park_id=eq.${parkId}`,
      },
      async (payload) => {
        const { data } = await database
          .from("pins")
          .select("*, animals(common_name, species, icon_url)")
          .eq("id", payload.new.id)
          .single();

        if (!data) return;

        const ageHours =
          (Date.now() - new Date(data.observed_at).getTime()) / 3_600_000;
        if (ageHours > filters.maxAgeHours) return;
        if (filters.verifiedOnly && !data.is_verified) return;
        if (filters.animalId !== null && data.animal_id !== filters.animalId)
          return;

        let username: string | null = null;
        if (data.user_id) {
          const { data: profile } = await database
            .from("profiles")
            .select("username")
            .eq("id", data.user_id)
            .single();
          username = profile?.username ?? "unknown";
        }

        setPins((prev) => [
          ...prev,
          {
            ...data,
            profiles: username ? { username } : null,
          } as PinWithAnimal,
        ]);
      },
    )
    .subscribe();

  return () => {
    database.removeChannel(channel);
  };
}

export async function dbGetPark(parkId: number) {
  return database.from("parks").select("*").eq("id", parkId).single();
}

export async function dbGetAnimals() {
  return database.from("animals").select("*").order("common_name");
}

export async function dbGetSession() {
  return database.auth.getSession();
}

export async function dbSubscribeToAuthStateChange(
  setUser: Dispatch<SetStateAction<User | null>>,
) {
  return database.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
}

export async function dbSignUp(email: string, password: string) {
  return database.auth.signUp({ email, password });
}

export async function dbSignInWithPassword(email: string, password: string) {
  return database.auth.signInWithPassword({ email, password });
}

export async function dbSignOut() {
  return database.auth.signOut();
}

export async function dbUploadPhoto(photoFile: File) {
  const ext = photoFile.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  return database.storage
    .from("public_assets")
    .upload(`pin_photos/${filename}`, photoFile, { upsert: false });
}

export async function dbUploadPin(
  location: string,
  animalId: number,
  parkId: number,
  photoPath: string | null,
) {
  return database.from("pins").insert({
    location: location,
    animal_id: animalId,
    park_id: parkId,
    photo_name: photoPath,
    is_verified: false,
  });
}

export async function dbGetUserProfile(userId: string | null) {
  return database
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
}

export async function dbUpdateUsername(username: string, userId: string) {
  return database
    .from("profiles")
    .update({ username, updated_at: new Date().toISOString() })
    .eq("id", userId);
}
