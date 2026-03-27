import { useEffect, useState } from "react";
import type { NewChore, Chore } from "../types/Chore";
import { createChore, getChoresByUser } from "../services/choreService";

// Custom hook for loading and adding chores for one specific user
export function useChores(userId: string | null) {
  // Stores the current user's chores
  const [chores, setChores] = useState<Chore[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loads chores for the current user
  async function loadChores() {
    // If there is no user, clear chores and stop
    if (!userId) {
      setChores([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getChoresByUser(userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setChores(data ?? []);

    setLoading(false);
  }

  // Reload chores whenever userId changes
  useEffect(() => {
    async function loadChoresWrapper() {
      await loadChores();
    }
    loadChoresWrapper();
  }, [userId]);

  // Adds a new chore
  async function addChore(chore: NewChore) {
    setError("");
    setSuccessMessage("");

    const { error } = await createChore(chore);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Chore added successfully.");

    await loadChores();

    return true;
  }

  return {
    chores, // user's chores
    loading, // loading state
    error, // chore error
    successMessage, // chore success feedback
    addChore, // action to insert a new chore
  };
}
