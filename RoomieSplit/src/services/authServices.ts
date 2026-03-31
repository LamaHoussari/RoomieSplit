import { supabase } from "../lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export async function signUpWithEmail(email: string, password: string) {
    const result = await supabase.auth.signUp({ email, password });
    if (result.data.user) {
        await supabase.from("profiles").upsert({
            id: result.data.user.id,
            name: email.split("@")[0],
            email: email,
        });
    }
    return result;
}

export async function signInWithEmail(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser() {
    return await supabase.auth.signOut();
}

export async function getCurrentUser() {
    return await supabase.auth.getUser();
}

export function subscribeToAuthChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
) {
    return supabase.auth.onAuthStateChange(callback);
}