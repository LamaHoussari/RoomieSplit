import { supabase } from "../lib/supabaseClient";
import type { Chore } from "../types/Chore";
import type { Expense } from "../types/Expense";
import type { Group } from "../types/Group";
import type { GroupMember } from "../types/Member";
import type { Profile } from "../types/Profile";
import type { Settlement } from "../types/Settlement";

type ServiceError = {
  message: string;
};

export type AdminGroupMember = GroupMember;

export interface AdminExpense extends Expense {
  groups?: {
    name: string;
    code: string;
  } | null;
}

export interface AdminChore extends Chore {
  groups?: {
    name: string;
  } | null;
}

export interface AdminSettlement extends Settlement {
  groups?: {
    name: string;
  } | null;
}

export interface AdminDashboardSnapshot {
  groups: Group[];
  members: AdminGroupMember[];
  profiles: Profile[];
  expenses: AdminExpense[];
  chores: AdminChore[];
  settlements: AdminSettlement[];
}

function createError(message: string): ServiceError {
  return { message };
}

export async function getAdminDashboardSnapshot(): Promise<{
  data: AdminDashboardSnapshot | null;
  error: ServiceError | null;
}> {
  const [
    groupsResult,
    membersResult,
    profilesResult,
    expensesResult,
    choresResult,
    settlementsResult,
  ] = await Promise.all([
    supabase.from("groups").select("*").order("created_at", { ascending: false }),
    supabase
      .from("group_members")
      .select("*, profiles(name, email)")
      .order("joined_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, name, email, nickname, phone, payment_method, avatar_path, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("*, groups(name, code)")
      .order("created_at", { ascending: false }),
    supabase
      .from("chores")
      .select("*, groups(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("settlements")
      .select("*, groups(name), from_profile:from_user_id(name), to_profile:to_user_id(name)")
      .order("created_at", { ascending: false }),
  ]);

  const errors = [
    groupsResult.error,
    membersResult.error,
    profilesResult.error,
    expensesResult.error,
    choresResult.error,
    settlementsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    return {
      data: null,
      error: createError(errors.map((error) => error?.message ?? "").filter(Boolean).join(" ")),
    };
  }

  return {
    data: {
      groups: (groupsResult.data ?? []) as Group[],
      members: (membersResult.data ?? []) as AdminGroupMember[],
      profiles: (profilesResult.data ?? []) as Profile[],
      expenses: (expensesResult.data ?? []) as AdminExpense[],
      chores: (choresResult.data ?? []) as AdminChore[],
      settlements: (settlementsResult.data ?? []) as AdminSettlement[],
    },
    error: null,
  };
}
