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
import { friendlyError } from "../lib/friendlyError";
import { normalizeGroupIds, type GroupReference } from "./groupReferences";

export function useSettlements(
  groupId: string | null,
  groups?: GroupReference[],
  showArchived = false,
) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const allGroupIds = normalizeGroupIds(groups);
  const groupIdsKey = allGroupIds.join("|");

  async function loadSettlements() {
    if (!groupId && allGroupIds.length === 0) {
      setSettlements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = groupId
        ? await getSettlementsByGroup(groupId, showArchived)
        : await getSettlementsByGroups(allGroupIds, showArchived);

      if (error) {
        setError(friendlyError(error.message));
        setSettlements([]);
        return;
      }

      setSettlements(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      setError(friendlyError(message));
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadSettlementsWrapper() {
      await loadSettlements();
    }
    loadSettlementsWrapper();
  }, [groupId, groupIdsKey, showArchived]);

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

  async function addSettlement(settlement: NewSettlement) {
    setError("");
    setSuccessMessage("");

    const amount = roundCurrency(settlement.amount);
    const paid = roundCurrency(settlement.paid ?? 0);

    if (!amount || amount <= 0) {
      setError("Enter a valid amount.");
      return false;
    }

    if (settlement.from_user_id === settlement.to_user_id) {
      setError("The payer and recipient must be different members.");
      return false;
    }

    if (paid > amount) {
      setError("Paid amount can't be more than the total amount.");
      return false;
    }

    const { error } = await createSettlement({
      ...settlement,
      amount,
      paid,
    });

    if (error) {
      setError(friendlyError(error.message));
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
      setError("Only the person who owes this balance can record a payment.");
      return false;
    }

    const amount = roundCurrency(paymentAmount);
    const remaining = getSettlementRemaining(settlement);

    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return false;
    }

    if (amount > remaining) {
      setError("Payment can't exceed the remaining balance.");
      return false;
    }

    const { error } = await recordSettlementPaymentService(settlement.id, amount);

    if (error) {
      setError(friendlyError(error.message));
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
      setError("Only fully settled balances can be archived.");
      return false;
    }

    const archivedAt = new Date().toISOString();
    const { error } = await setSettlementArchivedAt(
      settlementId,
      archivedAt,
    );

    if (error) {
      setError(friendlyError(error.message));
      return false;
    }

    setSuccessMessage("Balance archived.");
    // Optimistic update
    setSettlements(settlements.map(s =>
      s.id === settlementId ? { ...s, archived_at: archivedAt } : s
    ));
    return true;
  }

  async function unarchiveSettlement(settlementId: string) {
    setError("");
    setSuccessMessage("");

    const { error } = await setSettlementArchivedAt(settlementId, null);

    if (error) {
      setError(friendlyError(error.message));
      return false;
    }

    setSuccessMessage("Balance restored.");
    // Optimistic update
    setSettlements(settlements.map(s =>
      s.id === settlementId ? { ...s, archived_at: null } : s
    ));
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
