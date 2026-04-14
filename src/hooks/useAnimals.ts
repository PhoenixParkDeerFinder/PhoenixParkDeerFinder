import { useEffect, useState } from "react";
import { dbGetAnimals } from "../lib/databaseClient";
import type { Animal } from "../types/animal.types";

export function useAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbGetAnimals()
      .then(({ data, error }) => {
        if (!error && data) setAnimals(data);
        setLoading(false);
      });
  }, []);

  return { animals, loading };
}
