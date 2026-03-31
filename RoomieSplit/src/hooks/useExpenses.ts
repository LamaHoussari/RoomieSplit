import { useEffect, useState } from "react";
import type { NewExpense, Expense, NewExpenseSplit } from "../types/Expense";
import { createExpense, getExpensesByGroup } from "../services/expensesService";

export function useExpenses(groupId: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadExpenses() {
    if (!groupId) {
      setExpenses([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getExpensesByGroup(groupId);

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
  }, [groupId]);

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

  return {
    expenses,
    loading,
    error,
    successMessage,
    addExpense,
  };
}
