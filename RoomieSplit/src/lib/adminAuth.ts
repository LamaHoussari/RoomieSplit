import { supabase } from "./supabaseClient";

export async function checkIsSystemAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_system_admin")
    .eq("id", userId)
    .single();
  return data?.is_system_admin === true;
}
