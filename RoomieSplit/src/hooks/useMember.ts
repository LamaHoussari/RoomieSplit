import { useEffect, useState } from "react";
import type { Member } from "../types/Member";
import { createMember, getMembersByUser  } from "../services/memberService";

// Custom hook for loading and adding members for one specific user
export function useMembers(userId: string | null) {
  // Stores the current user's members
  const [members, setMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loads members for the current user
  async function loadMembers() {
    // If there is no user, clear members and stop
    if (!userId) {
      setMembers([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getMembersByUser(userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMembers(data ?? []);

    setLoading(false);
  }

  // Reload members whenever userId changes
  useEffect(() => {
    async function loadMembersWrapper() {
      await loadMembers();
    }
    loadMembersWrapper();
  }, [userId]);

  // Adds a new member
  async function addMember(member: Member) {
    setError("");
    setSuccessMessage("");

    const { error } = await createMember(member);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Member added successfully.");

    await loadMembers();

    return true;
  }

  return {
    members, // user's members
    loading, // loading state
    error, // member error
    successMessage, // member success feedback
    addMember, // action to insert a new member
  };
}
