import { useCallback, useEffect, useState } from "react";
import {
  getAdminDashboardSnapshot,
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
      setLoading(false);
      return;
    }

    setSnapshot(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    snapshot,
    loading,
    error,
    refresh,
  };
}
