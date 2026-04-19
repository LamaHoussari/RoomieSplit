import { supabase } from "../lib/supabaseClient";

export async function getProfileById(userId: string) {
  return await supabase
    .from("profiles")
    .select("id, name, email, nickname, phone, payment_method, avatar_path, created_at")
    .eq("id", userId)
    .single();
}

export async function updateProfile(
  userId: string,
  updates: {
    name?: string;
    nickname?: string | null;
    phone?: string | null;
    payment_method?: string | null;
  },
) {
  return await supabase.from("profiles").update(updates).eq("id", userId);
}
