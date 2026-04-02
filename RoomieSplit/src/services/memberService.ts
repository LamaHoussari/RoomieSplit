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
        .select("*, profiles(name, email)")
        .eq("group_id", groupId);
}

export async function getMembersByGroups(groupIds: string[]) {
    return await supabase
        .from("group_members")
        .select("*, profiles(name, email)")
        .in("group_id", groupIds);
}

export async function removeMember(memberId: string) {
  const q = await supabase.from("group_members").delete().eq("id", memberId);
  console.log("removeMember", { memberId, q });
  return await supabase.from("group_members").delete().eq("id", memberId);
}