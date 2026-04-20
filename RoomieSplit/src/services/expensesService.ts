import { supabase } from "../lib/supabaseClient";
import type { NewExpense, NewExpenseSplit } from "../types/Expense";

export async function createExpense(expense: NewExpense, splits: NewExpenseSplit[]) {
    return await supabase.rpc("create_expense_with_splits", {
        p_group_id: expense.group_id,
        p_description: expense.description,
        p_amount: expense.amount,
        p_payer_id: expense.payer_id,
        p_date: expense.date,
        p_is_paid: expense.is_paid ?? false,
        p_splits: splits.map(s => ({ user_id: s.user_id, share_amount: Number(s.share_amount ?? 0) })),
    });
}

export async function getExpensesByGroup(groupId: string, archived = false) {
    let query = supabase
        .from("expenses")
        .select("*, profiles:payer_id(name), expense_splits(*, profiles:user_id(name))")
        .eq("group_id", groupId);

    query = archived
        ? query.not("archived_at", "is", null)
        : query.is("archived_at", null);

    return await query
        .order("date", { ascending: false });
}

export async function getExpensesByGroups(groupIds: string[], archived = false) {
    let query = supabase
        .from("expenses")
        .select("*, profiles:payer_id(name), expense_splits(*, profiles:user_id(name))")
        .in("group_id", groupIds);

    query = archived
        ? query.not("archived_at", "is", null)
        : query.is("archived_at", null);

    return await query
        .order("date", { ascending: false });
}

export async function deleteExpense(expenseId: string) {
    return await supabase.from("expenses").delete().eq("id", expenseId);
}

export async function setExpenseArchivedAt(expenseId: string, archivedAt: string | null) {
    return await supabase.from("expenses").update({ archived_at: archivedAt }).eq("id", expenseId);
}

export async function updateExpense(expenseId: string, updates: Partial<NewExpense>) {
    return await supabase.from("expenses").update(updates).eq("id", expenseId);
}

export async function updateExpenseWithSplits(
    expenseId: string,
    updates: Partial<NewExpense>,
    newSplits: NewExpenseSplit[]
) {
    return await supabase.rpc("update_expense_with_splits", {
        p_expense_id: expenseId,
        p_description: updates.description ?? null,
        p_amount: updates.amount ?? null,
        p_payer_id: updates.payer_id ?? null,
        p_date: updates.date ?? null,
        p_is_paid: updates.is_paid ?? null,
        p_splits: newSplits.map(s => ({ user_id: s.user_id, share_amount: Number(s.share_amount ?? 0) })),
    });
}

export async function getExpenseById(expenseId: string) {
    return await supabase
        .from("expenses")
        .select("*, profiles:payer_id(name), expense_splits(*, profiles:user_id(name))")
        .eq("id", expenseId)
        .single();
}
