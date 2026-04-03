import { useEffect, useState } from "react";
import {
  getSettlementPaidAmount,
  getSettlementRemaining,
  roundCurrency,
} from "../lib/finance";
import type { NewSettlement, Settlement } from "../types/Settlement";
import { createSettlement, getSettlementsByGroup, getSettlementsByGroups, updateSettlement as updateSettlementService } from "../services/settlementService";

export function useSettlements(groupId: string | null, allGroupIds?: string[]) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadSettlements() {
    if (!groupId && (!allGroupIds || allGroupIds.length === 0)) {
      setSettlements([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = groupId
      ? await getSettlementsByGroup(groupId)
      : await getSettlementsByGroups(allGroupIds!);

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
  }, [groupId, allGroupIds?.join()]);

  async function addSettlement(settlement: NewSettlement) {
    setError("");
    setSuccessMessage("");

    const amount = roundCurrency(settlement.amount);
    const paid = roundCurrency(settlement.paid ?? 0);

    if (!amount || amount <= 0) {
      setError("Enter a valid settlement amount.");
      return false;
    }

    if (settlement.from_user_id === settlement.to_user_id) {
      setError("The payer and recipient must be different members.");
      return false;
    }

    if (paid > amount) {
      setError("Paid amount cannot exceed the total settlement amount.");
      return false;
    }

    const { error } = await createSettlement({
      ...settlement,
      amount,
      paid,
    });

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Settlement added successfully.");

    await loadSettlements();

    return true;
  }

  async function recordPayment(settlement: Settlement, paymentAmount: number) {
    setError("");
    setSuccessMessage("");

    const amount = roundCurrency(paymentAmount);
    const remaining = getSettlementRemaining(settlement);

    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return false;
    }

    if (amount > remaining) {
      setError("Payment amount cannot exceed the remaining settlement balance.");
      return false;
    }

    const { error } = await updateSettlementService(settlement.id, {
      paid: roundCurrency(getSettlementPaidAmount(settlement) + amount),
    });

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
