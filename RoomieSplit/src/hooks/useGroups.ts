import { useEffect, useState } from "react";
import type { NewGroup, Group } from "../types/Group";
import { getGroupsByUser, createGroup, joinGroupByCodeWithFallback } from "../services/groupService";
import { friendlyError } from "../lib/friendlyError";

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
      return [] as Group[];
    }
    setLoading(true);
    setError("");

    const { data, error } = await getGroupsByUser(userId);

    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return [] as Group[];
    }

    const nextGroups = data ?? [];
    setGroups(nextGroups);

    setLoading(false);
    return nextGroups;
  }

  // Reload groups whenever userId changes
  useEffect(() => {
    async function loadGroupsWrapper() {
      await loadGroups();
    }
    loadGroupsWrapper();
  }, [userId]);

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

  // Adds a new group
  async function addGroup(group: NewGroup) {
    setError("");
    setSuccessMessage("");

    const { data, error } = await createGroup(group, userId);

    if (error) {
      setError(friendlyError(error.message));
      return null;
    }

    setSuccessMessage("Group added successfully.");

    const nextGroups = await loadGroups();

    return data ?? nextGroups.find(existingGroup => existingGroup.code === group.code) ?? null;
  }

  async function joinGroup(code: string) {
    setError("");
    setSuccessMessage("");
    const { error } = await joinGroupByCodeWithFallback(code, userId);
    if (error) {
      setError(friendlyError(error.message));
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
