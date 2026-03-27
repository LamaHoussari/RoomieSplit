import { supabase } from "../lib/supabaseClient";

import type { Member } from "../types/Member";
export async function createMember(member:Member){
    return await supabase.from("members").insert([member])
}
export async function getMembersByUser(userId:string){
    return await supabase
    .from("members")
    .select("*")
    .eq("user_id", userId)
}