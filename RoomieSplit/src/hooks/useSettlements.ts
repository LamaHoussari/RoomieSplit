import { useEffect, useState } from "react";
import {
  getSettlementRemaining,
  isSettlementSettled,
  roundCurrency,
} from "../lib/finance";
import type { NewSettlement, Settlement } from "../types/Settlement";
import {
  createSettlement,
  getSettlementsByGroup,
  getSettlementsByGroups,
  recordSettlementPayment as recordSettlementPaymentService,
  setSettlementArchivedAt,
} from "../services/settlementService";

export function useSettlements(
  groupId: string | null,
  allGroupIds?: string[],
  showArchived = false,
) {
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
      ? await getSettlementsByGroup(groupId, showArchived)
      : await getSettlementsByGroups(allGroupIds!, showArchived);

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
  }, [groupId, allGroupIds?.join(), showArchived]);

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

  async function recordPayment(
    settlement: Settlement,
    paymentAmount: number,
    actingUserId: string,
  ) {
    setError("");
    setSuccessMessage("");

    if (settlement.from_user_id !== actingUserId) {
      setError("Only the member who owes this balance can record its payment.");
      return false;
    }

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

    const { error } = await recordSettlementPaymentService(settlement.id, amount);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Payment recorded.");
    await loadSettlements();
    return true;
  }

  async function archiveSettlement(settlementId: string) {
    setError("");
    setSuccessMessage("");

    const settlement = settlements.find((item) => item.id === settlementId);
    if (!settlement) {
      setError("Balance not found.");
      return false;
    }

    if (!isSettlementSettled(settlement)) {
      setError("Only settled balances can be archived.");
      return false;
    }

    const { error } = await setSettlementArchivedAt(
      settlementId,
      new Date().toISOString(),
    );

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Balance archived.");
    await loadSettlements();
    return true;
  }

  async function unarchiveSettlement(settlementId: string) {
    setError("");
    setSuccessMessage("");

    const { error } = await setSettlementArchivedAt(settlementId, null);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Balance restored.");
    await loadSettlements();
    return true;
  }

  return {
    settlements,
    loading,
    error,
    successMessage,
    addSettlement,
    archiveSettlement,
    unarchiveSettlement,
    recordPayment,
  };
}
