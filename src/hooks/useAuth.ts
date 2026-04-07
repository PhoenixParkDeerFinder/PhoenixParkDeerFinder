/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export function useAuth(): {
  user: any;
  signIn: any;
  signOut: any;
  loading: any;
} {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is logged in on mount
    const checkUser = async () => {
      try {
        // Replace with actual auth check (e.g., from Firebase, Supabase, etc.)
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      // Replace with actual sign-in logic
      const mockUser = { email: "user@example.com" };
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Replace with actual sign-out logic
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return { user, signIn, signOut, loading };
}
