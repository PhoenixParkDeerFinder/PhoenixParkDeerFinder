import { useEffect, useState } from "react";
import { dbGetPark } from "../lib/databaseClient";
import type { Park } from "../types/park.types";

export function usePark(parkId: number = 2) {
  const [park, setPark] = useState<Park | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGetPark(parkId)
      .then(({ data, error }) => {
        if (!error && data) setPark(data);
        setLoading(false);
      });
  }, [parkId]);

  return { park, loading };
}
