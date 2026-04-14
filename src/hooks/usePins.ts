import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { FilterState } from "../components/map/FilterBar";
import type { PinWithAnimal } from "../types/pin.types";

export function usePins(parkId: number | null, filters: FilterState) {
  const [pins, setPins] = useState<PinWithAnimal[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchWithProfiles(parkId: number): Promise<PinWithAnimal[]> {
    const cutoff = new Date(
      Date.now() - filters.maxAgeHours * 60 * 60 * 1000,
    ).toISOString();

    let query = supabase
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
        pinsData
          .map((p) => p.user_id)
          .filter((id): id is string => id !== null),
      ),
    ];

    const profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
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

  useEffect(() => {
    if (parkId === null) return;

    fetchWithProfiles(parkId).then((data) => {
      setPins(data);
      setLoading(false);
    });

    const channel = supabase
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
          const { data } = await supabase
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
            const { data: profile } = await supabase
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
      supabase.removeChannel(channel);
    };
  }, [
    parkId,
    filters.animalId,
    filters.verifiedOnly,
    filters.maxAgeHours,
    filters,
  ]);

  return { pins, loading };
}
