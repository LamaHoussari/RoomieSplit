import { useEffect, useState } from "react";
import type { GroupMember, NewGroupMember } from "../types/Member";
import { addGroupMember, getMembersByGroup } from "../services/memberService";

export function useMembers(groupId: string | null) {
  const [members, setMembers] = useState<GroupMember[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadMembers() {
    if (!groupId) {
      setMembers([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getMembersByGroup(groupId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMembers(data ?? []);

    setLoading(false);
  }

  useEffect(() => {
    async function loadMembersWrapper() {
      await loadMembers();
    }
    loadMembersWrapper();
  }, [groupId]);

  async function addMember(member: NewGroupMember) {
    setError("");
    setSuccessMessage("");

    const { error } = await addGroupMember(member);

    if (error) {
      setError(error.message);
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
  };
}
