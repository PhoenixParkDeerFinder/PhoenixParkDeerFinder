import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Park } from "../types/park.types";

export function usePark() {
  const [park, setPark] = useState<Park | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("parks")
      .select("*")
      .single() // assumes one park row
      .then(({ data, error }) => {
        if (!error) setPark(data);
        setLoading(false);
      });
  }, []);

  return { park, loading };
}
