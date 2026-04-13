import { supabase } from "./supabaseClient";

export async function checkIsSystemAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_system_admin")
      .eq("id", userId)
      .single();
    if (error) {
      return false;
    }
    return data?.is_system_admin === true;
  } catch {
    return false;
  }
}
