import { useEffect, useState } from "react";
import type { AppUser } from "../types/auth";
import {
  getCurrentUser,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges,
} from "../services/authService";
import {
  ADMIN_EMAIL,
  clearAdminSession,
  createLocalAdminUser,
  getStoredAdminSession,
  isAdminCredentials,
  isReservedAdminEmail,
  storeAdminSession,
} from "../lib/adminAuth";

function mapUser(
  user: { id: string; email?: string | null } | null,
): AppUser | null {
  if (!user) return null;
  const normalizedEmail = user.email?.trim().toLowerCase() ?? null;
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.email?.split("@")[0] ?? null,
    isAdmin: normalizedEmail === ADMIN_EMAIL,
    authSource: "supabase",
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
      setUser(mapUser(data.user) ?? getStoredAdminSession());
      setLoading(false);
    }
    loadUser();
    const {
      data: { subscription },
    } = subscribeToAuthChanges((_event, session) => {
      setUser(mapUser(session?.user ?? null) ?? getStoredAdminSession());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  async function signUp(email: string, passowrd: string) {
    setError("");
    setsuccessMessage("");
    if (isReservedAdminEmail(email)) {
      setError("This email is reserved for the admin dashboard.");
      return false;
    }
    const { error } = await signUpWithEmail(email, passowrd);
    if (error) {
      setError(error.message);
      return false;
    }
    setsuccessMessage("Account created successfully!!!");
    return true;
  }

  async function signIn(email: string, passowrd: string) {
    setError("");
    setsuccessMessage("");

    if (isAdminCredentials(email, passowrd)) {
      clearAdminSession();

      const adminSignInResult = await signInWithEmail(email, passowrd);
      if (!adminSignInResult.error) {
        setsuccessMessage("Signed in as admin.");
        return true;
      }

      const localAdminUser = createLocalAdminUser();
      storeAdminSession(localAdminUser);
      setUser(localAdminUser);
      setsuccessMessage("Signed in as local admin.");
      return true;
    }

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
    const localAdminSession = getStoredAdminSession();

    if (user?.authSource === "local-admin" || localAdminSession) {
      clearAdminSession();
      setUser(null);
      setsuccessMessage("Signed out successfully!");
      return true;
    }

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
