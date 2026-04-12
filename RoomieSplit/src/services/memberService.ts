import { supabase } from "../lib/supabaseClient";
import type { NewGroupMember } from "../types/Member";

export async function addGroupMember(member: NewGroupMember, userId: string) {
  return await supabase.rpc("add_group_member_by_admin", {
    p_group_id: member.group_id,
    p_user_id: userId,
    p_role: "member",
    p_nickname: member.nickname ?? null,
  });
}

export async function getMembersByGroup(groupId: string) {
    return await supabase
        .from("group_members")
        .select("*, profiles(name, email, phone, payment_method)")
        .eq("group_id", groupId);
}

export async function getMembersByGroups(groupIds: string[]) {
    return await supabase
        .from("group_members")
        .select("*, profiles(name, email, phone, payment_method)")
        .in("group_id", groupIds);
}

export async function removeMember(memberId: string) {
  return await supabase.from("group_members").delete().eq("id", memberId);
}

export async function updateMemberRole(memberId: string, role: string) {
  return await supabase.rpc("change_member_role", {
    p_member_id: memberId,
    p_new_role: role,
  });
}
