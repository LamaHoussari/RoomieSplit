import { supabase } from "../lib/supabaseClient";
import type { NewGroupMember } from "../types/Member";

function createError(message: string) {
  return { message };
}

export async function addGroupMember(member: NewGroupMember, userId: string) {
  const rpcResult = await supabase.rpc("add_group_member_by_admin", {
    p_group_id: member.group_id,
    p_user_id: userId,
    p_role: "member",
    p_nickname: member.nickname ?? null,
  });

  if (!rpcResult.error) {
    return rpcResult;
  }

  const fallbackResult = await supabase
    .from("group_members")
    .insert([{
      group_id: member.group_id,
      user_id: userId,
      role: member.role ?? "member",
      nickname: member.nickname ?? null,
    }]);

  if (!fallbackResult.error) {
    return fallbackResult;
  }

  return {
    data: null,
    error: createError(`Unable to add the member. RPC failed: ${rpcResult.error.message}. Direct Supabase fallback failed: ${fallbackResult.error.message}.`),
  };
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
  return await supabase.from("group_members").delete().eq("id", memberId);
}
