import { supabase } from "../lib/supabaseClient";

import type { NewChore } from "../types/Chore";
export async function createChore(chore:NewChore){
    return await supabase.from("chores").insert([chore])
}
export async function getChoresByUser(userId:string){
    return await supabase
    .from("chores")
    .select("*")
    .eq("user_id", userId)
}