import { useEffect, useState } from "react";
import type { AppUser } from "../types/auth";
import {
  getCurrentUser,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges,
} from "../services/authService";
import { checkIsSystemAdmin } from "../lib/adminAuth";

async function loadUserProfile(
  user: { id: string; email?: string | null } | null,
): Promise<AppUser | null> {
  if (!user) return null;
  const isAdmin = await checkIsSystemAdmin(user.id);
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.email?.split("@")[0] ?? null,
    isAdmin,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setsuccessMessage] = useState("");

  function clearFeedback() {
    setError("");
    setsuccessMessage("");
  }

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
      const appUser = await loadUserProfile(data.user);
      setUser(appUser);
      setLoading(false);
    }
    loadUser();
    const {
      data: { subscription },
    } = subscribeToAuthChanges(async (_event, session) => {
      const appUser = await loadUserProfile(session?.user ?? null);
      setUser(appUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(id);
  }, [error]);

  async function signUp(email: string, password: string) {
    setError("");
    setsuccessMessage("");
    const { error } = await signUpWithEmail(email, password);
    if (error) {
      setError(error.message);
      return false;
    }
    setsuccessMessage("Account created successfully!!!");
    return true;
  }

  async function signIn(email: string, password: string) {
    setError("");
    setsuccessMessage("");
    const { error } = await signInWithEmail(email, password);
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
    clearFeedback,
    signUp,
    signIn,
    signOut,
  };
}
