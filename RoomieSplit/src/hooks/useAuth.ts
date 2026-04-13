import { useEffect, useState } from "react";
import type { AppUser } from "../types/auth";
import {
  getCurrentSession,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges,
} from "../services/authService";
import { checkIsSystemAdmin } from "../lib/adminAuth";

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
      try {
        const { data, error } = await getCurrentSession();

        if (error) {
          setError(error.message);
          return;
        }

        const sessionUser = data.session?.user ?? null;

        if (!sessionUser) {
          setUser(null);
          return;
        }

        // Set basic user immediately so the app is usable
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? null,
          name: sessionUser.email?.split("@")[0] ?? null,
          isAdmin: false,
        });

        // Load admin status in background — don't block auth
        checkIsSystemAdmin(sessionUser.id).then((isAdmin) => {
          setUser((prev) =>
            prev && prev.id === sessionUser.id ? { ...prev, isAdmin } : prev
          );
        }).catch(() => {});
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    const {
      data: { subscription },
    } = subscribeToAuthChanges(async (_event, session) => {
      const sessionUser = session?.user ?? null;

      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Set basic user immediately
      setUser({
        id: sessionUser.id,
        email: sessionUser.email ?? null,
        name: sessionUser.email?.split("@")[0] ?? null,
        isAdmin: false,
      });
      setLoading(false);

      // Load admin status in background
      checkIsSystemAdmin(sessionUser.id).then((isAdmin) => {
        setUser((prev) =>
          prev && prev.id === sessionUser.id ? { ...prev, isAdmin } : prev
        );
      }).catch(() => {});
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
