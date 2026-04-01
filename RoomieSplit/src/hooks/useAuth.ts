import { useEffect, useState } from "react";
import type { AppUser } from "../types/auth";
import {
  getCurrentUser,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges,
} from "../services/authService";

function mapUser(
  user: { id: string; email?: string | null } | null,
): AppUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.email?.split("@")[0] ?? null,
  };
}
export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setsuccessMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      setError("");
      const { data, error } = await getCurrentUser();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setUser(mapUser(data.user));
      setLoading(false);
    }
    loadUser();
    const {
      data: { subscription },
    } = subscribeToAuthChanges((_event, session) => {
      setUser(mapUser(session?.user ?? null));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  async function signUp(email: string, passowrd: string) {
    setError("");
    setsuccessMessage("");
    const { error } = await signUpWithEmail(email, passowrd);
    if (error) {
      setError(error.message);
      return false;
    }
    setsuccessMessage("Account Created!!!");
    return true;
  }
  async function signIn(email: string, passowrd: string) {
    setError("");
    setsuccessMessage("");
    const { error } = await signInWithEmail(email, passowrd);
    if (error) {
      setError(error.message);
      return false;
    }
    setsuccessMessage("Signed in successfully!!!");
    return true;
  }

  async function signOut() {
    setError("");
    setsuccessMessage("");
    const { error } = await signOutUser();
    if (error) {
      setError(error.message);
      return false;
    }
    setsuccessMessage("Signed out successfully!!!");
    return true;
  }

  return {
    user,
    loading,
    error,
    successMessage,
    signUp,
    signIn,
    signOut,
  };
}
