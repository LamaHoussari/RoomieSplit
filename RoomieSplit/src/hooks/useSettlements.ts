import { useEffect, useState } from "react";
import type { NewSettlement, Settlement } from "../types/Settlement";
import { createSettlement, getSettlementsByGroup, updateSettlement as updateSettlementService } from "../services/settlementService";

export function useSettlements(groupId: string | null) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadSettlements() {
    if (!groupId) {
      setSettlements([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getSettlementsByGroup(groupId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSettlements(data ?? []);

    setLoading(false);
  }

  useEffect(() => {
    async function loadSettlementsWrapper() {
      await loadSettlements();
    }
    loadSettlementsWrapper();
  }, [groupId]);

  async function addSettlement(settlement: NewSettlement) {
    setError("");
    setSuccessMessage("");

    const { error } = await createSettlement(settlement);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Settlement added successfully.");

    await loadSettlements();

    return true;
  }

  async function recordPayment(settlementId: string, paidAmount: number) {
    setError("");
    setSuccessMessage("");
    const { error } = await updateSettlementService(settlementId, { paid: paidAmount });
    if (error) {
      setError(error.message);
      return false;
    }
    setSuccessMessage("Payment recorded.");
    await loadSettlements();
    return true;
  }

  return {
    settlements,
    loading,
    error,
    successMessage,
    addSettlement,
    recordPayment,
  };
}
