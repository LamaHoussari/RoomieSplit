import { supabase } from "../lib/supabaseClient";
import type { NewGroup } from "../types/Group";

export async function createGroup(group: NewGroup) {
  return await supabase.rpc("create_group_with_admin_member", {
    p_name: group.name,
    p_code: group.code,
    p_description: group.description ?? null,
    p_currency: group.currency ?? "USD",
  });
}

export async function getGroupsByUser(userId: string) {
  return await supabase
    .from("groups")
    .select(`
      *,
      group_members!inner (
        user_id,
        role,
        nickname
      )
    `)
    .eq("group_members.user_id", userId);
}

export async function getGroupById(groupId: string) {
  return await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();
}

export async function joinGroupByCode(code: string) {
  return await supabase.rpc("join_group_by_code", {
    input_code: code,
  });
}