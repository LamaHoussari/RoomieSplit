import { useCallback, useEffect, useState } from "react";
import {
  getAdminDashboardSnapshot,
  adminSetUserActive,
  adminArchiveGroup,
  type AdminDashboardSnapshot,
} from "../services/adminService";

export function useAdminDashboard() {
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await getAdminDashboardSnapshot();

    if (loadError) {
      setError(loadError.message);
      setSnapshot({ groups: [], members: [], profiles: [], expenses: [], chores: [], settlements: [] });
      setLoading(false);
      return;
    }

    setSnapshot(data);
    setLoading(false);
  }, []);

  const deactivateUser = useCallback(async (userId: string) => {
    const { error: rpcError } = await adminSetUserActive(userId, false);
    if (rpcError) return { error: rpcError.message };
    setSnapshot((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === userId ? { ...p, is_active: false } : p
        ),
      };
    });
    return { error: null };
  }, []);

  const activateUser = useCallback(async (userId: string) => {
    const { error: rpcError } = await adminSetUserActive(userId, true);
    if (rpcError) return { error: rpcError.message };
    setSnapshot((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === userId ? { ...p, is_active: true } : p
        ),
      };
    });
    return { error: null };
  }, []);

  useEffect(() => {
    async function fetchData() {
      await refresh();
    }
    fetchData();
  }, [refresh]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(id);
  }, [error]);

  const archiveGroup = useCallback(async (groupId: string) => {
    const { error: rpcError } = await adminArchiveGroup(groupId);
    if (rpcError) return { error: rpcError.message };
    setSnapshot((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: prev.groups.filter((g) => g.id !== groupId),
        members: prev.members.filter((m) => m.group_id !== groupId),
      };
    });
    return { error: null };
  }, []);

  return {
    snapshot,
    loading,
    error,
    refresh,
    deactivateUser,
    activateUser,
    archiveGroup,
  };
}
