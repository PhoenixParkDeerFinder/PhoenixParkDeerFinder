import { useEffect, useState } from "react";
import {
  dbGetSession,
  dbSignInWithPassword,
  dbSignOut,
  dbSignUp,
  dbSubscribeToAuthStateChange,
} from "../lib/databaseClient";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      dbGetSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = await dbSubscribeToAuthStateChange(setUser);

      return () => subscription.unsubscribe();
    }
    getData()
  }, []);

  async function authSignUp(
    email: string,
    password: string,
  ): Promise<string | null> {
    const { error } = await dbSignUp(email, password);
    return error?.message ?? null;
  }

  async function authSignIn(
    email: string,
    password: string,
  ): Promise<string | null> {
    const { error } = await dbSignInWithPassword(email, password);
    return error?.message ?? null;
  }

  async function authSignOut() {
    await dbSignOut();
  }

  return { user, loading, signUp: authSignUp, signIn: authSignIn, signOut: authSignOut };
}
