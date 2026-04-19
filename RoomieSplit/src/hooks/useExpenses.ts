import { useEffect, useState } from "react";
import type { Expense, NewExpense, NewExpenseSplit } from "../types/Expense";
import {
  areSplitConfigsEqual,
  getSplitTotal,
  hasRecordedSettlementPayments,
  isSettlementSettled,
  roundCurrency,
} from "../lib/finance";
import {
  createExpense,
  deleteExpense as deleteExpenseService,
  getExpensesByGroup,
  getExpensesByGroups,
  setExpenseArchivedAt,
  updateExpense,
  updateExpenseWithSplits,
} from "../services/expensesService";
import {
  deleteSettlementsByExpense,
  getSettlementsByExpense,
  setSettlementsArchivedAt,
  syncExpenseSettlements,
} from "../services/settlementService";
import { friendlyError } from "../lib/friendlyError";

const SUCCESS_MESSAGE_DURATION_MS = 4000;
const ERROR_MESSAGE_DURATION_MS = 5000;
const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

function isFutureDatedExpense(date?: string | null) {
  return typeof date === "string" && date.length > 0 && date > getTodayDateKey();
}

export function useExpenses(
  groupId: string | null,
  allGroupIds?: string[],
  showArchived = false,
) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function normalizeSplits(splits: NewExpenseSplit[]) {
    const shareMap = new Map<string, number>();

    for (const split of splits) {
      if (!split.user_id) continue;

      shareMap.set(
        split.user_id,
        roundCurrency(
          (shareMap.get(split.user_id) ?? 0) + Number(split.share_amount ?? 0),
        ),
      );
    }

    return [...shareMap.entries()].map(([user_id, share_amount]) => ({
      user_id,
      share_amount,
    }));
  }

  function validateExpenseSplits(amount: number, splits: NewExpenseSplit[]) {
    const normalizedAmount = roundCurrency(amount);
    const normalizedSplits = normalizeSplits(splits).filter(
      (split) => roundCurrency(split.share_amount ?? 0) > 0,
    );

    if (!normalizedAmount || normalizedAmount <= 0) {
      return "Enter a valid expense amount.";
    }

    if (!normalizedSplits.length) {
      return "Select at least one member to split this expense with.";
    }

    if (getSplitTotal(normalizedSplits) !== normalizedAmount) {
      return "Split amounts must add up to the full expense amount.";
    }

    return null;
  }

  function getOwingSplitUserIds(
    expense: Pick<Expense, "payer_id" | "expense_splits">,
  ) {
    return [
      ...new Set(
        (expense.expense_splits ?? [])
          .filter(
            (split) =>
              split.user_id !== expense.payer_id &&
              roundCurrency(split.share_amount ?? 0) > 0,
          )
          .map((split) => split.user_id),
      ),
    ];
  }

  async function loadExpenses() {
    if (!groupId && (!allGroupIds || allGroupIds.length === 0)) {
      setExpenses([]);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = groupId
      ? await getExpensesByGroup(groupId, showArchived)
      : await getExpensesByGroups(allGroupIds!, showArchived);

    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return;
    }

    setExpenses(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    async function loadExpensesWrapper() {
      await loadExpenses();
    }

    loadExpensesWrapper();
  }, [groupId, allGroupIds?.join(), showArchived]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, SUCCESS_MESSAGE_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    if (!error) return;
    const id = window.setTimeout(() => setError(""), ERROR_MESSAGE_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [error]);

  async function addExpense(expense: NewExpense, splits: NewExpenseSplit[]) {
    setError("");
    setSuccessMessage("");

    const normalizedExpense = {
      ...expense,
      amount: roundCurrency(expense.amount),
      is_paid: expense.is_paid ?? !isFutureDatedExpense(expense.date),
    };
    const normalizedSplits = normalizeSplits(splits);
    const validationError = validateExpenseSplits(
      normalizedExpense.amount,
      normalizedSplits,
    );

    if (validationError) {
      setError(validationError);
      return false;
    }

    const { error } = await createExpense(normalizedExpense, normalizedSplits);

    if (error) {
      setError(friendlyError(error.message));
      return false;
    }

    setSuccessMessage("Expense added successfully.");
    await loadExpenses();
    return true;
  }

  async function removeExpense(expenseId: string) {
    setError("");
    setSuccessMessage("");

    const expense = expenses.find((item) => item.id === expenseId);
    if (!expense) {
      setError("Expense not found.");
      return false;
    }

    const { data: linkedSettlements, error: linkedError } =
      await getSettlementsByExpense(expenseId);

    if (linkedError) {
      setError(friendlyError(linkedError.message));
      return false;
    }

    if (hasRecordedSettlementPayments(linkedSettlements ?? [])) {
      setError(
        "This expense has recorded payments. Please remove or adjust those payments first.",
      );
      return false;
    }

    const { error: settlementError } = await deleteSettlementsByExpense(expenseId);
    if (settlementError) {
      setError(friendlyError(settlementError.message));
      return false;
    }

    const { error } = await deleteExpenseService(expenseId);
    if (error) {
      if (expense.is_paid) {
        await syncExpenseSettlements(expenseId);
      }

      setError(friendlyError(error.message));
      return false;
    }

    setSuccessMessage("Expense deleted.");
    await loadExpenses();
    return true;
  }

  async function archiveExpense(expenseId: string) {
    setError("");
    setSuccessMessage("");

    const expense = expenses.find((item) => item.id === expenseId);
    if (!expense) {
      setError("Expense not found.");
      return false;
    }

    const { data: linkedSettlements, error: linkedError } =
      await getSettlementsByExpense(expenseId);

    if (linkedError) {
      setError(friendlyError(linkedError.message));
      return false;
    }

    if (!expense.is_paid) {
      setError("Only paid expenses can be archived.");
      return false;
    }

    const owingSplitUserIds = getOwingSplitUserIds(expense);
    const settlementsByUserId = new Map(
      (linkedSettlements ?? []).map((settlement) => [
        settlement.from_user_id,
        settlement,
      ]),
    );
    const hasUnsettledBalances = owingSplitUserIds.some((userId) => {
      const settlement = settlementsByUserId.get(userId);
      return !settlement || !isSettlementSettled(settlement);
    });

    if (hasUnsettledBalances) {
      setError("Please settle all linked balances before archiving this expense.");
      return false;
    }

    const archivedAt = new Date().toISOString();
    const linkedSettlementIds = (linkedSettlements ?? []).map(
      (settlement) => settlement.id,
    );

    const { error: expenseError } = await setExpenseArchivedAt(expenseId, archivedAt);
    if (expenseError) {
      setError(friendlyError(expenseError.message));
      return false;
    }

    const { error: settlementError } = await setSettlementsArchivedAt(
      linkedSettlementIds,
      archivedAt,
    );
    if (settlementError) {
      await setExpenseArchivedAt(expenseId, null);
      setError(friendlyError(settlementError.message));
      return false;
    }

    setSuccessMessage("Expense archived.");
    await loadExpenses();
    return true;
  }

  async function unarchiveExpense(expenseId: string) {
    setError("");
    setSuccessMessage("");

    const expense = expenses.find((item) => item.id === expenseId);
    if (!expense) {
      setError("Expense not found.");
      return false;
    }

    const previousArchivedAt = expense.archived_at ?? new Date().toISOString();
    const { data: linkedSettlements, error: linkedError } =
      await getSettlementsByExpense(expenseId, "archived");

    if (linkedError) {
      setError(friendlyError(linkedError.message));
      return false;
    }

    const { error: expenseError } = await setExpenseArchivedAt(expenseId, null);
    if (expenseError) {
      setError(friendlyError(expenseError.message));
      return false;
    }

    const { error: settlementError } = await setSettlementsArchivedAt(
      (linkedSettlements ?? []).map((settlement) => settlement.id),
      null,
    );
    if (settlementError) {
      await setExpenseArchivedAt(expenseId, previousArchivedAt);
      setError(friendlyError(settlementError.message));
      return false;
    }

    setSuccessMessage("Expense restored.");
    await loadExpenses();
    return true;
  }

  async function editExpense(
    expenseId: string,
    updates: Partial<NewExpense>,
    splits: NewExpenseSplit[],
  ) {
    setError("");
    setSuccessMessage("");

    const expense = expenses.find((item) => item.id === expenseId);
    if (!expense) {
      setError("Expense not found.");
      return false;
    }

    const normalizedUpdates = {
      ...updates,
      amount:
        updates.amount == null ? expense.amount : roundCurrency(updates.amount),
    };
    const normalizedSplits = normalizeSplits(splits);
    const validationError = validateExpenseSplits(
      normalizedUpdates.amount,
      normalizedSplits,
    );

    if (validationError) {
      setError(validationError);
      return false;
    }

    const nextPayerId = normalizedUpdates.payer_id ?? expense.payer_id;
    const financialChanged =
      roundCurrency(expense.amount) !== normalizedUpdates.amount ||
      expense.payer_id !== nextPayerId ||
      !areSplitConfigsEqual(expense.expense_splits ?? [], normalizedSplits);

    if (expense.is_paid && financialChanged) {
      const { data: linkedSettlements, error: linkedError } =
        await getSettlementsByExpense(expenseId);

      if (linkedError) {
        setError(friendlyError(linkedError.message));
        return false;
      }

      if (hasRecordedSettlementPayments(linkedSettlements ?? [])) {
        setError(
          "You can't change the amount, payer, or split after payments have been recorded.",
        );
        return false;
      }
    }

    const { error } = await updateExpenseWithSplits(
      expenseId,
      normalizedUpdates,
      normalizedSplits,
    );

    if (error) {
      setError(friendlyError(error.message));
      return false;
    }

    if (expense.is_paid && financialChanged) {
      const { error: syncError } = await syncExpenseSettlements(expenseId);

      if (syncError) {
        setError(friendlyError(syncError.message));
        return false;
      }
    }

    setSuccessMessage("Expense updated.");
    await loadExpenses();
    return true;
  }

  async function togglePaid(
    expenseId: string,
    currentlyPaid: boolean,
    expense?: Expense,
  ) {
    setError("");
    setSuccessMessage("");

    const targetExpense = expense ?? expenses.find((item) => item.id === expenseId);
    if (!targetExpense) {
      setError("Expense not found.");
      return false;
    }

    const currentSplits = targetExpense.expense_splits ?? [];
    const { data: linkedSettlements, error: linkedError } =
      await getSettlementsByExpense(expenseId);

    if (linkedError) {
      setError(friendlyError(linkedError.message));
      return false;
    }

    if (!currentlyPaid) {
      const validationError = validateExpenseSplits(
        targetExpense.amount,
        currentSplits,
      );

      if (validationError) {
        setError(validationError);
        return false;
      }

      if (hasRecordedSettlementPayments(linkedSettlements ?? [])) {
        setError(
          "This expense has recorded payments. Please refresh and try again.",
        );
        return false;
      }

      const { error } = await updateExpense(expenseId, { is_paid: true });
      if (error) {
        setError(friendlyError(error.message));
        return false;
      }

      const { error: syncError } = await syncExpenseSettlements(expenseId);

      if (syncError) {
        await updateExpense(expenseId, { is_paid: false });
        setError(friendlyError(syncError.message));
        return false;
      }

      setSuccessMessage("Expense marked paid.");
    } else {
      if (hasRecordedSettlementPayments(linkedSettlements ?? [])) {
        setError(
          "You can't mark this expense as unpaid after payments have been recorded.",
        );
        return false;
      }

      const { error: settlementError } = await deleteSettlementsByExpense(expenseId);
      if (settlementError) {
        setError(friendlyError(settlementError.message));
        return false;
      }

      const { error } = await updateExpense(expenseId, { is_paid: false });
      if (error) {
        await syncExpenseSettlements(expenseId);
        setError(friendlyError(error.message));
        return false;
      }

      setSuccessMessage("Expense marked unpaid.");
    }

    await loadExpenses();
    return true;
  }

  return {
    expenses,
    loading,
    error,
    successMessage,
    addExpense,
    archiveExpense,
    unarchiveExpense,
    removeExpense,
    editExpense,
    togglePaid,
  };
}
