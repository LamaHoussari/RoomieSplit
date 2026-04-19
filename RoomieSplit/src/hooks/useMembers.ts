import { useEffect, useState } from "react";
import type { GroupMember, NewGroupMember } from "../types/Member";
import { addGroupMember, getMembersByGroup, getMembersByGroups } from "../services/memberService";
import { friendlyError } from "../lib/friendlyError";

export function useMembers(groupId: string | null, allGroupIds?: string[]) {
  const [members, setMembers] = useState<GroupMember[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadMembers() {
    if (!groupId && (!allGroupIds || allGroupIds.length === 0)) {
      setMembers([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = groupId
      ? await getMembersByGroup(groupId)
      : await getMembersByGroups(allGroupIds!);

    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return;
    }

    // Deduplicate by user_id when fetching across multiple groups
    const list = data ?? [];
    if (!groupId && allGroupIds) {
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

    setLoading(false);
  }

  useEffect(() => {
    async function loadMembersWrapper() {
      await loadMembers();
    }
    loadMembersWrapper();
  }, [groupId, allGroupIds?.join()]);

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

  async function addMember(member: NewGroupMember) {
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
  }

  return {
    members,
    loading,
    error,
    successMessage,
    addMember,
    loadMembers,
  };
}
