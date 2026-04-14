import { useEffect, useState } from "react";
import { dbGetPinsWithProfiles, dbSubscribeToPinChanges } from "../lib/databaseClient";
import type { FilterState } from "../components/map/FilterBar";
import type { PinWithAnimal } from "../types/pin.types";

export function usePins(parkId: number | null, filters: FilterState) {
  const [pins, setPins] = useState<PinWithAnimal[]>([]);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    if (parkId === null) return;

    dbGetPinsWithProfiles(parkId, filters).then((data) => {
      setPins(data);
      setLoading(false);
    });

    dbSubscribeToPinChanges(parkId, filters, setPins)
    
  }, [
    parkId,
    filters.animalId,
    filters.verifiedOnly,
    filters.maxAgeHours,
    filters,
  ]);

  return { pins, loading };
}
