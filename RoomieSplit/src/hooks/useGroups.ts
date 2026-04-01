import { useEffect, useState } from "react";
import type { NewGroup, Group } from "../types/Group";
import { getGroupsByUser, createGroup, joinGroupByCode } from "../services/groupService";

// Custom hook for loading and adding groups for one specific user
export function useGroups(userId: string | null) {
  // Stores the current user's groups
  const [groups, setGroups] = useState<Group[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loads groups for the current user
  async function loadGroups() {
    // If there is no user, clear groups and stop
    if (!userId) {
      setGroups([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getGroupsByUser(userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setGroups(data ?? []);

    setLoading(false);
  }

  // Reload groups whenever userId changes
  useEffect(() => {
    async function loadGroupsWrapper() {
      await loadGroups();
    }
    loadGroupsWrapper();
  }, [userId]);

  // Adds a new group
  async function addGroup(group: NewGroup) {
    setError("");
    setSuccessMessage("");

    const { error } = await createGroup(group);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Group added successfully.");

    await loadGroups();

    return true;
  }

  async function joinGroup(code: string) {
    setError("");
    setSuccessMessage("");
    const { error } = await joinGroupByCode(code);
    if (error) {
      setError(error.message);
      return false;
    }
    setSuccessMessage("Joined group successfully.");
    await loadGroups();
    return true;
  }

  return {
    groups,
    loading,
    error,
    successMessage,
    addGroup,
    joinGroup,
  };
}
