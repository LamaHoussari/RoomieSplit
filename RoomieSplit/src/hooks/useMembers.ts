import { useEffect, useState } from "react";
import type { GroupMember, NewGroupMember } from "../types/Member";
import { addGroupMember, getMembersByGroup, getMembersByGroups } from "../services/memberService";
import { friendlyError } from "../lib/friendlyError";
import { normalizeGroupIds, type GroupReference } from "./groupReferences";

export function useMembers(groupId: string | null, groups?: GroupReference[]) {
  const [members, setMembers] = useState<GroupMember[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const allGroupIds = normalizeGroupIds(groups);
  const groupIdsKey = allGroupIds.join("|");

  async function loadMembers() {
    if (!groupId && allGroupIds.length === 0) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = groupId
        ? await getMembersByGroup(groupId)
        : await getMembersByGroups(allGroupIds);

      if (error) {
        setError(friendlyError(error.message));
        setMembers([]);
        return;
      }

      // Deduplicate by user_id when fetching across multiple groups
      const list = data ?? [];
      if (!groupId && allGroupIds.length > 0) {
        const seen = new Set<string>();
        const unique = list.filter(m => {
          if (seen.has(m.user_id)) return false;
          seen.add(m.user_id);
          return true;
        });
        setMembers(unique);
      } else {
        setMembers(list);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      setError(friendlyError(message));
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadMembersWrapper() {
      await loadMembers();
    }
    loadMembersWrapper();
  }, [groupId, groupIdsKey]);

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

  async function runSaving<T>(operation: () => Promise<T>) {
    setSaving(true);
    try {
      return await operation();
    } finally {
      setSaving(false);
    }
  }

  async function addMember(member: NewGroupMember) {
    return runSaving(async () => {
      setError("");
      setSuccessMessage("");

      const { error } = await addGroupMember(member, groupId!);

      if (error) {
        setError(friendlyError(error.message));
        return false;
      }

      setSuccessMessage("Member added successfully.");

      await loadMembers();

      return true;
    });
  }

  return {
    members,
    loading,
    saving,
    error,
    successMessage,
    addMember,
    loadMembers,
  };
}
