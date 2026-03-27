import { useEffect, useState } from "react";
import type { NewExpense, Expense } from "../types/Expense";
import { createExpense, getExpensesByUser } from "../services/expensesService";

// Custom hook for loading and adding expenses for one specific user
export function useExpenses(userId: string | null) {
  // Stores the current user's expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loads expenses for the current user
  async function loadExpenses() {
    // If there is no user, clear expenses and stop
    if (!userId) {
      setExpenses([]);
      return;
    }
    setLoading(true);
    setError("");

    const { data, error } = await getExpensesByUser(userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setExpenses(data ?? []);

    setLoading(false);
  }

  // Reload expenses whenever userId changes
  useEffect(() => {
    async function loadExpensesWrapper() {
      await loadExpenses();
    }
    loadExpensesWrapper();
  }, [userId]);

  // Adds a new expense 
  async function addExpense(expense: NewExpense) {
    setError("");
    setSuccessMessage("");

    const { error } = await createExpense(expense);

    if (error) {
      setError(error.message);
      return false;
    }

    setSuccessMessage("Expense added successfully.");

    await loadExpenses();

    return true;
  }

  return {
    expenses, // user's expenses
    loading, // loading state
    error, // expense error
    successMessage, // expense success feedback
    addExpense, // action to insert a new expense
  };
}
