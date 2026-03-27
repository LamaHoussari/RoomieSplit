import { supabase } from "../lib/supabaseClient";

import type {NewExpense} from "../types/Expense";
export async function createExpense(expense:NewExpense){
    return await supabase.from("expenses").insert([expense])
}
export async function getExpensesByUser(userId:string){
    return await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
}