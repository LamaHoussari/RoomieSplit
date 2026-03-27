import { supabase } from "../lib/supabaseClient";

import type { NewGroup } from "../types/Group";
export async function createGroup(group:NewGroup){
    return await supabase.from("groups").insert([group])
}
export async function getGroupsByUser(userId:string){
    return await supabase
    .from("groups")
    .select("*")
    .eq("user_id", userId)
}