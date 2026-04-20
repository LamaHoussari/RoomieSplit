import { supabase } from "../lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { generateAndUploadAvatar } from "./avatarService";

export async function signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
        return { data, error };
    }

    return { data, error: null };
}

export async function createUserProfile(userId: string, email: string) {
    const name = email.split("@")[0];
    const avatarUrl = await generateAndUploadAvatar(userId, name);

    const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        name,
        email,
        avatar_path: avatarUrl,
    });

    return { error: profileError };
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

export async function getCurrentSession() {
    return await supabase.auth.getSession();
}

export async function requestPasswordReset(email: string, redirectTo: string) {
    return await supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function updateUserPassword(password: string) {
    return await supabase.auth.updateUser({ password });
}

export function subscribeToAuthChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
) {
    return supabase.auth.onAuthStateChange(callback);
}
