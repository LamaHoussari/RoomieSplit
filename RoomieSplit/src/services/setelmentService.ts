import { supabase } from "../lib/supabaseClient";

import type { NewSetelment } from "../types/Setelment";
export async function createSetelment(setelment:NewSetelment){
    return await supabase.from("setelements").insert([setelment])
}
export async function getSetelmentsByUser(userId:string){
    return await supabase
    .from("setelements")
    .select("*")
    .eq("user_id", userId)
}