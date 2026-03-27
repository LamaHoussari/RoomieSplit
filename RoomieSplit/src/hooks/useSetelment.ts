import { useEffect, useState } from "react";
import type { NewSetelment, Setelment } from "../types/Setelment";
import { createSetelment, getSetelmentsByUser } from "../services/setelmentService";

// Custom hook for loading and adding setelments for one specific user
export function useSetelment(userId: string | null) {
  // Stores the current user's setelments
  const [setelments, setSetelments] = useState<Setelment[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loads setelments for the current user
  async function loadSetelments() {
    // If there is no user, clear setelments and stop
    if (!userId) {
      setSetelments([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getSetelmentsByUser(userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSetelments(data ?? []);

    setLoading(false);
  }

  // Reload setelments whenever userId changes
  useEffect(() => {
    async function loadSetelmentsWrapper() {
      await loadSetelments();
    }
    loadSetelmentsWrapper();
  }, [userId]);

  // Adds a new setelment
  async function addSetelment(setelment: NewSetelment) {
    setError("");
    setSuccessMessage("");

    const { error } = await createSetelment(setelment);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Setelment added successfully.");

    await loadSetelments();

    return true;
  }

  return {
    setelments, // user's setelments
    loading, // loading state
    error, // setelment error
    successMessage, // setelment success feedback
    addSetelment, // action to insert a new setelment
  };
}
