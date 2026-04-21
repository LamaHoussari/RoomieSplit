import { useEffect, useState } from "react";
import type { NewChore, Chore } from "../types/Chore";
import {
  createChore,
  deleteChore as deleteChoreService,
  getChoresByGroup,
  getChoresByGroups,
  setChoreArchivedAt,
  updateChore as updateChoreService,
} from "../services/choreService";
import { friendlyError } from "../lib/friendlyError";
import { normalizeGroupIds, type GroupReference } from "./groupReferences";

export function useChores(
  groupId: string | null,
  groups?: GroupReference[],
  showArchived = false,
) {
  const [chores, setChores] = useState<Chore[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const allGroupIds = normalizeGroupIds(groups);
  const groupIdsKey = allGroupIds.join("|");

  async function loadChores() {
    if (!groupId && allGroupIds.length === 0) {
      setChores([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = groupId
        ? await getChoresByGroup(groupId, showArchived)
        : await getChoresByGroups(allGroupIds, showArchived);

      if (error) {
        setError(friendlyError(error.message));
        setChores([]);
        return;
      }

      setChores(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      setError(friendlyError(message));
      setChores([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadChoresWrapper() {
      await loadChores();
    }
    loadChoresWrapper();
  }, [groupId, groupIdsKey, showArchived]);

  useEffect(() => {
    if (!successMessage) return;
    const id = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(id);
  }, [successMessage]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(id);
  }, [error]);

  async function addChore(chore: NewChore) {
    setError("");
    setSuccessMessage("");

    const { error } = await createChore(chore);

    if (error) {
      setError(friendlyError(error.message));
      return false;
    }

    setSuccessMessage("Chore added successfully.");

    await loadChores();

    return true;
  }

  async function removeChore(choreId: string) {
    setError("");
    setSuccessMessage("");
    const { error } = await deleteChoreService(choreId);
    if (error) {
      setError(friendlyError(error.message));
      return false;
    }
    setSuccessMessage("Chore removed.");
    await loadChores();
    return true;
  }

  async function archiveChore(choreId: string) {
    setError("");
    setSuccessMessage("");

    const { error } = await setChoreArchivedAt(choreId, new Date().toISOString());
    if (error) {
      setError(friendlyError(error.message));
      return false;
    }

    setSuccessMessage("Chore archived.");
    await loadChores();
    return true;
  }

  async function unarchiveChore(choreId: string) {
    setError("");
    setSuccessMessage("");

    const { error } = await setChoreArchivedAt(choreId, null);
    if (error) {
      setError(friendlyError(error.message));
      return false;
    }

    setSuccessMessage("Chore restored.");
    await loadChores();
    return true;
  }

  async function toggleChore(choreId: string, isCompleted: boolean) {
    setError("");
    // Optimistic update
    setChores(chores.map(c => c.id === choreId ? { ...c, is_completed: isCompleted } : c));
    
    const { error } = await updateChoreService(choreId, { is_completed: isCompleted });
    if (error) {
      setError(friendlyError(error.message));
      // Revert optimistic update on error
      setChores(chores.map(c => c.id === choreId ? { ...c, is_completed: !isCompleted } : c));
      return false;
    }
    return true;
  }

  return {
    chores,
    loading,
    error,
    successMessage,
    addChore,
    archiveChore,
    unarchiveChore,
    removeChore,
    toggleChore,
  };
}
