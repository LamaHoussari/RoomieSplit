import { useEffect, useState } from "react";
import type { NewChore, Chore } from "../types/Chore";
import { createChore, getChoresByGroup } from "../services/choreService";

export function useChores(groupId: number | null) {
  const [chores, setChores] = useState<Chore[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadChores() {
    if (!groupId) {
      setChores([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getChoresByGroup(groupId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setChores(data ?? []);

    setLoading(false);
  }

  useEffect(() => {
    async function loadChoresWrapper() {
      await loadChores();
    }
    loadChoresWrapper();
  }, [groupId]);

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
    chores,
    loading,
    error,
    successMessage,
    addChore,
  };
}
