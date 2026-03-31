import { supabase } from "../lib/supabaseClient";
import type { NewExpense, NewExpenseSplit } from "../types/Expense";

export async function createExpense(expense: NewExpense, splits: NewExpenseSplit[]) {
    const { data, error } = await supabase
        .from("expenses")
        .insert([expense])
        .select()
        .single();

    if (error || !data) return { data, error };

    const splitsWithId = splits.map((s) => ({ ...s, expense_id: data.id }));
    const { error: splitError } = await supabase
        .from("expense_splits")
        .insert(splitsWithId);

    return { data, error: splitError };
}

export async function getExpensesByGroup(groupId: number) {
    return await supabase
        .from("expenses")
        .select("*, profiles:payer_id(name), expense_splits(*, profiles:user_id(name))")
        .eq("group_id", groupId)
        .order("date", { ascending: false });
}

export async function deleteExpense(expenseId: number) {
    return await supabase.from("expenses").delete().eq("id", expenseId);
}

export async function updateExpense(expenseId: number, updates: Partial<NewExpense>) {
    return await supabase.from("expenses").update(updates).eq("id", expenseId);
}