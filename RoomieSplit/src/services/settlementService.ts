import { supabase } from "../lib/supabaseClient";
import type { NewSettlement } from "../types/Settlement";

export async function createSettlement(settlement: NewSettlement) {
    return await supabase.from("settlements").insert([settlement]);
}

export async function getSettlementsByGroup(groupId: string, archived = false) {
    let query = supabase
        .from("settlements")
        .select("*, from_profile:from_user_id(name), to_profile:to_user_id(name), expense:expense_id(description)")
        .eq("group_id", groupId);

    query = archived
        ? query.not("archived_at", "is", null)
        : query.is("archived_at", null);

    return await query
        .order("created_at", { ascending: false });
}

export async function getSettlementsByGroups(groupIds: string[], archived = false) {
    let query = supabase
        .from("settlements")
        .select("*, from_profile:from_user_id(name), to_profile:to_user_id(name), expense:expense_id(description)")
        .in("group_id", groupIds);

    query = archived
        ? query.not("archived_at", "is", null)
        : query.is("archived_at", null);

    return await query
        .order("created_at", { ascending: false });
}

export async function getSettlementsByExpense(
    expenseId: string,
    archivedFilter: "active" | "archived" | "all" = "active",
) {
    let query = supabase
        .from("settlements")
        .select("*, from_profile:from_user_id(name), to_profile:to_user_id(name), expense:expense_id(description)")
        .eq("expense_id", expenseId);

    if (archivedFilter === "active") {
        query = query.is("archived_at", null);
    } else if (archivedFilter === "archived") {
        query = query.not("archived_at", "is", null);
    }

    return await query
        .order("created_at", { ascending: true });
}

export async function updateSettlement(
    settlementId: string,
    updates: Partial<NewSettlement> & { paid?: number; archived_at?: string | null },
) {
    return await supabase.from("settlements").update(updates).eq("id", settlementId);
}

export async function recordSettlementPayment(
    settlementId: string,
    paymentAmount: number,
) {
    return await supabase.rpc("record_settlement_payment", {
        p_settlement_id: settlementId,
        p_amount: paymentAmount,
    });
}

export async function syncExpenseSettlements(expenseId: string) {
    return await supabase.rpc("sync_expense_settlements", {
        p_expense_id: expenseId,
    });
}

export async function setSettlementArchivedAt(
    settlementId: string,
    archivedAt: string | null,
) {
    return await supabase.from("settlements").update({ archived_at: archivedAt }).eq("id", settlementId);
}

export async function setSettlementsArchivedAt(
    settlementIds: string[],
    archivedAt: string | null,
) {
    if (!settlementIds.length) return { error: null };

    return await supabase
        .from("settlements")
        .update({ archived_at: archivedAt })
        .in("id", settlementIds);
}

export async function deleteSettlementsByExpense(expenseId: string) {
    return await supabase.from("settlements").delete().eq("expense_id", expenseId);
}
