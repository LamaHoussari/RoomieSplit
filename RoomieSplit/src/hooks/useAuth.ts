import { useEffect, useState } from "react";
import type { AppUser } from "../types/auth";
import {
  getCurrentSession,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges,
  createUserProfile,
} from "../services/authService";
import { checkIsSystemAdmin } from "../lib/adminAuth";
import { friendlyError } from "../lib/friendlyError";

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
          setError(friendlyError(error.message));
          setLoading(false);
          return;
        }

        const sessionUser = data.session?.user ?? null;

        if (!sessionUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Set basic user immediately so the app is usable
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? null,
          name: sessionUser.email?.split("@")[0] ?? null,
          isAdmin: false,
        });

        // Create profile if it doesn't exist (handles new signups)
        if (sessionUser.email) {
          await createUserProfile(sessionUser.id, sessionUser.email).catch(() => {});
        }

        // Load admin status in background — don't block auth
        checkIsSystemAdmin(sessionUser.id).then((isAdmin) => {
          setUser((prev) =>
            prev && prev.id === sessionUser.id ? { ...prev, isAdmin } : prev
          );
        }).catch(() => {});

        setLoading(false);
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
        setLoading(false);
      }
    }
    loadUser();

    try {
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

        // Create profile if it doesn't exist (handles new signups)
        if (sessionUser.email) {
          await createUserProfile(sessionUser.id, sessionUser.email).catch(() => {});
        }

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
    } catch (err) {
      console.error("Subscription error:", err);
    }
  }, []);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(id);
  }, [error]);

  useEffect(() => {
    if (!successMessage) return;
    const id = setTimeout(() => setsuccessMessage(""), 4000);
    return () => clearTimeout(id);
  }, [successMessage]);

  async function signUp(email: string, password: string) {
    setError("");
    setsuccessMessage("");
    const { error } = await signUpWithEmail(email, password);
    if (error) {
      setError(friendlyError(error.message));
      return false;
    }
    setsuccessMessage("Account created successfully.");
    return true;
  }

  async function signIn(email: string, password: string) {
    setError("");
    setsuccessMessage("");
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setError(friendlyError(error.message));
      return false;
    }
    setsuccessMessage("Signed in successfully.");
    return true;
  }

  async function signOut() {
    setError("");
    setsuccessMessage("");
    const { error } = await signOutUser();
    if (error) {
      setError(friendlyError(error.message));
      return false;
    }
    setsuccessMessage("Signed out successfully.");
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
