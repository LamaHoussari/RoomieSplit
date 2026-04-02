import { useEffect, useState } from "react";
import type { NewExpense, Expense, NewExpenseSplit } from "../types/Expense";
import { createExpense, getExpensesByGroup, getExpensesByGroups, deleteExpense as deleteExpenseService, updateExpenseWithSplits } from "../services/expensesService";

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
    setSuccessMessage("Expense updated.");
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
  };
}
