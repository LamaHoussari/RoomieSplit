import { supabase } from "../lib/supabaseClient";
import type { NewGroup } from "../types/Group";

export async function createGroup(group: NewGroup) {
    const { data, error } = await supabase
        .from("groups")
        .insert([group])
        .select()
        .single();

    if (error || !data) return { data, error };

    const { error: memberError } = await supabase
        .from("group_members")
        .insert([{ group_id: data.id, user_id: group.created_by, role: "admin" }]);

    return { data, error: memberError };
}

export async function getGroupsByUser(userId: string) {
    return await supabase
        .from("groups")
        .select("*, group_members!inner(user_id)")
        .eq("group_members.user_id", userId);
}

export async function getGroupById(groupId: number) {
    return await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();
}

export async function joinGroup(code: string, userId: string) {
    const { data: group, error } = await supabase
        .from("groups")
        .select("id")
        .eq("code", code)
        .single();

    if (error || !group) return { data: null, error: error };

    return await supabase
        .from("group_members")
        .insert([{ group_id: group.id, user_id: userId, role: "member" }]);
}