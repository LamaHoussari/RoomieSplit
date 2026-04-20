import { supabase } from "../lib/supabaseClient";
import { getChoreIcon } from "../lib/choreIcons";
import type { NewChore } from "../types/Chore";

export async function createChore(chore: NewChore) {
    return await supabase.from("chores").insert([{
        ...chore,
        icon: chore.icon?.trim() || getChoreIcon(chore.name),
    }]);
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

export async function getChoreById(choreId: string) {
    return await supabase
        .from("chores")
        .select("*, assigned_profile:assigned_to(name)")
        .eq("id", choreId)
        .single();
}
