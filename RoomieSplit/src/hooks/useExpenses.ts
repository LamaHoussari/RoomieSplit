import { useEffect, useState } from "react";
import type { NewExpense, Expense, NewExpenseSplit } from "../types/Expense";
import { createExpense, getExpensesByGroup, getExpensesByGroups, deleteExpense as deleteExpenseService, updateExpenseWithSplits, updateExpense } from "../services/expensesService";
import { createSettlement, deleteSettlementsByExpense } from "../services/settlementService";

export function useExpenses(groupId: string | null, allGroupIds?: string[]) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadExpenses() {
    if (!groupId && (!allGroupIds || allGroupIds.length === 0)) {
      setExpenses([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = groupId
      ? await getExpensesByGroup(groupId)
      : await getExpensesByGroups(allGroupIds!);

    if (error) {
      setError(error.message);
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
  }, [groupId, allGroupIds?.join()]);

  async function addExpense(expense: NewExpense, splits: NewExpenseSplit[]) {
    setError("");
    setSuccessMessage("");

    const { error } = await createExpense(expense, splits);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Expense added successfully.");

    await loadExpenses();

    return true;
  }

  async function removeExpense(expenseId: string) {
    setError("");
    setSuccessMessage("");
    // Remove auto-settlements linked to this expense first
    await deleteSettlementsByExpense(expenseId);
    const { error } = await deleteExpenseService(expenseId);
    if (error) {
      setError(error.message);
      return false;
    }
    setSuccessMessage("Expense deleted.");
    await loadExpenses();
    return true;
  }

  async function editExpense(expenseId: string, updates: Partial<NewExpense>, splits: NewExpenseSplit[]) {
    setError("");
    setSuccessMessage("");
    const { error } = await updateExpenseWithSplits(expenseId, updates, splits);
    if (error) {
      setError(error.message);
      return false;
    }
    // If this expense was marked paid, re-sync auto-settlements with new splits
    const expense = expenses.find(e => e.id === expenseId);
    if (expense?.is_paid) {
      await deleteSettlementsByExpense(expenseId);
      const payerId = updates.payer_id ?? expense.payer_id;
      const groupId = expense.group_id;
      for (const split of splits) {
        if (split.user_id === payerId || !split.share_amount) continue;
        await createSettlement({
          group_id: groupId,
          from_user_id: split.user_id,
          to_user_id: payerId,
          amount: split.share_amount,
          paid: 0,
          created_by: payerId,
          expense_id: expenseId,
        });
      }
    }
    setSuccessMessage("Expense updated.");
    await loadExpenses();
    return true;
  }

  async function togglePaid(expenseId: string, currentlyPaid: boolean, expense?: Expense) {
    setError("");
    const { error } = await updateExpense(expenseId, { is_paid: !currentlyPaid });
    if (error) {
      setError(error.message);
      return false;
    }

    if (!currentlyPaid && expense) {
      // Marking as paid → auto-create settlements for each split member (except payer)
      const splits = expense.expense_splits ?? [];
      for (const split of splits) {
        if (split.user_id === expense.payer_id || !split.share_amount) continue;
        await createSettlement({
          group_id: expense.group_id,
          from_user_id: split.user_id,
          to_user_id: expense.payer_id,
          amount: split.share_amount,
          paid: 0,
          created_by: expense.payer_id,
          expense_id: expenseId,
        });
      }
    } else if (currentlyPaid) {
      // Marking as unpaid → remove auto-created settlements for this expense
      await deleteSettlementsByExpense(expenseId);
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
    removeExpense,
    editExpense,
    togglePaid,
  };
}
