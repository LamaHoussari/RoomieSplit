import { supabase } from "../lib/supabaseClient";
import type { NewGroupMember } from "../types/Member";

export async function addGroupMember(member: NewGroupMember) {
    return await supabase.from("group_members").insert([member]);
}

export async function getMembersByGroup(groupId: number) {
    return await supabase
        .from("group_members")
        .select("*, profiles(name, email)")
        .eq("group_id", groupId);
}

export async function removeMember(memberId: number) {
    return await supabase.from("group_members").delete().eq("id", memberId);
}