import { supabase } from "../lib/supabaseClient";
import type { NewChore } from "../types/Chore";

export async function createChore(chore: NewChore) {
    return await supabase.from("chores").insert([chore]);
}

export async function getChoresByGroup(groupId: string) {
    return await supabase
        .from("chores")
        .select("*, profiles:assigned_to(name)")
        .eq("group_id", groupId);
}

export async function updateChore(choreId: number, updates: Partial<NewChore & { is_completed: boolean }>) {
    return await supabase.from("chores").update(updates).eq("id", choreId);
}

export async function deleteChore(choreId: number) {
    return await supabase.from("chores").delete().eq("id", choreId);
}