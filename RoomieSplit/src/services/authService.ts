import { supabase } from "../lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

function normalizeEmailAddress(email: string) {
    return email.trim().toLowerCase();
}

async function ensureProfileForUser(user: { id: string; email?: string | null }) {
    const normalizedEmail = user.email?.trim().toLowerCase();

    if (!normalizedEmail) {
        return { error: null };
    }

    return await supabase.from("profiles").upsert({
        id: user.id,
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
    });
}

export async function signUpWithEmail(email: string, password: string) {
    const normalizedEmail = normalizeEmailAddress(email);
    const result = await supabase.auth.signUp({ email: normalizedEmail, password });

    if (result.error || !result.data.user || !result.data.session) {
        return result;
    }

    const { error } = await ensureProfileForUser(result.data.user);

    if (error) {
        return { data: result.data, error };
    }

    return result;
}

export async function signInWithEmail(email: string, password: string) {
    const normalizedEmail = normalizeEmailAddress(email);
    const result = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (result.error || !result.data.user) {
        return result;
    }

    const { error } = await ensureProfileForUser(result.data.user);

    if (error) {
        return { data: result.data, error };
    }

    return result;
}

export async function signOutUser() {
    return await supabase.auth.signOut();
}

export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        return { data: { user: null }, error };
    }

    return {
        data: { user: data.session?.user ?? null },
        error: null,
    };
}

export function subscribeToAuthChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
) {
    return supabase.auth.onAuthStateChange(callback);
}
