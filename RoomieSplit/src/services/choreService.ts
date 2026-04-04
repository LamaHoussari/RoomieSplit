import { supabase } from "../lib/supabaseClient";
import type { NewChore } from "../types/Chore";

export async function createChore(chore: NewChore) {
    return await supabase.from("chores").insert([chore]);
}

export async function getChoresByGroup(groupId: string, archived = false) {
    let query = supabase
        .from("chores")
        .select("*")
        .eq("group_id", groupId);

    query = archived
        ? query.not("archived_at", "is", null)
        : query.is("archived_at", null);

    return await query;
}

export async function getChoresByGroups(groupIds: string[], archived = false) {
    let query = supabase
        .from("chores")
        .select("*")
        .in("group_id", groupIds);

    query = archived
        ? query.not("archived_at", "is", null)
        : query.is("archived_at", null);

    return await query;
}

export async function updateChore(choreId: string, updates: Partial<NewChore & { is_completed: boolean }>) {
    return await supabase.from("chores").update(updates).eq("id", choreId);
}

export async function deleteChore(choreId: string) {
    return await supabase.from("chores").delete().eq("id", choreId);
}

export async function setChoreArchivedAt(choreId: string, archivedAt: string | null) {
    return await supabase.from("chores").update({ archived_at: archivedAt }).eq("id", choreId);
}
