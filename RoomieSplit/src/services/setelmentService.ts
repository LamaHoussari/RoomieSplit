import { supabase } from "../lib/supabaseClient";
import type { NewSettlement } from "../types/Setelment";

export async function createSettlement(settlement: NewSettlement) {
    return await supabase.from("settlements").insert([settlement]);
}

export async function getSettlementsByGroup(groupId: string) {
    return await supabase
        .from("settlements")
        .select("*, from_profile:from_user_id(name), to_profile:to_user_id(name)")
        .eq("group_id", groupId);
}

export async function updateSettlement(settlementId: number, updates: { paid: number }) {
    return await supabase.from("settlements").update(updates).eq("id", settlementId);
}