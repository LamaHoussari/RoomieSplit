import { supabase } from "../lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export async function signUpWithEmail(email:string, password:string){
    return await supabase.auth.signUp({
        email,password
    });
}

export async function signInWithEmail(email:string, password:string){
    return await supabase.auth.signInWithPassword({
        email,password
    });
}
export async function signOutUser(){
    return await supabase.auth.signOut();
}

export async function getCuurentUser(){
    return await supabase.auth.getUser();
}

export function subscribeToAuthChanges(
    callback: (event:AuthChangeEvent, session: Session| null) => void
){
    return supabase.auth.onAuthStateChange(callback);
}