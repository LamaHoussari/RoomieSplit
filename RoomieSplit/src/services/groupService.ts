import { supabase } from "../lib/supabaseClient";
import type { Group, NewGroup } from "../types/Group";

type ServiceError = {
  message: string;
};

type GroupMutationResult = {
  data: Group | null;
  error: ServiceError | null;
};

function normalizeGroup(data: unknown): Group | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.length > 0 ? (data[0] as Group) : null;
  }
  return data as Group;
}

function createError(message: string): ServiceError {
  return { message };
}

function mergeErrors(rpcMessage: string, fallbackMessage: string) {
  return createError(`Unable to complete the group action. RPC failed: ${rpcMessage}. Direct Supabase fallback failed: ${fallbackMessage}.`);
}

async function createGroupDirect(group: NewGroup, userId: string): Promise<GroupMutationResult> {
  const { data: createdGroup, error: groupError } = await supabase
    .from("groups")
    .insert([{
      name: group.name,
      code: group.code,
      created_by: userId,
      description: group.description ?? null,
      currency: group.currency ?? "USD",
    }])
    .select("*")
    .single();

  if (groupError || !createdGroup) {
    return {
      data: null,
      error: createError(groupError?.message ?? "The group record could not be created."),
    };
  }

  const { error: memberError } = await supabase
    .from("group_members")
    .insert([{
      group_id: createdGroup.id,
      user_id: userId,
      role: "admin",
      nickname: null,
    }]);

  if (memberError) {
    await supabase.from("groups").delete().eq("id", createdGroup.id);
    return {
      data: null,
      error: createError(memberError.message),
    };
  }

  return { data: createdGroup, error: null };
}

async function joinGroupDirect(code: string, userId: string) {
  const { data: group, error: groupError } = await getGroupByCode(code);

  if (groupError || !group) {
    return {
      data: null,
      error: createError(groupError?.message ?? "No group was found for that invite code."),
    };
  }

  const { error } = await supabase
    .from("group_members")
    .insert([{
      group_id: group.id,
      user_id: userId,
      role: "member",
      nickname: null,
    }]);

  if (error) {
    return {
      data: null,
      error: createError(error.message),
    };
  }

  return { data: null, error: null };
}

export async function createGroup(group: NewGroup, userId: string | null): Promise<GroupMutationResult> {
  const rpcResult = await supabase.rpc("create_group_with_admin_member", {
    p_name: group.name,
    p_code: group.code,
    p_description: group.description ?? null,
    p_currency: group.currency ?? "USD",
  });

  if (!rpcResult.error) {
    return { data: normalizeGroup(rpcResult.data), error: null };
  }

  if (!userId) {
    return { data: null, error: createError(rpcResult.error.message) };
  }

  const fallbackResult = await createGroupDirect(group, userId);
  if (!fallbackResult.error) {
    return fallbackResult;
  }

  return {
    data: null,
    error: mergeErrors(rpcResult.error.message, fallbackResult.error.message),
  };
}

export async function getGroupsByUser(userId: string) {
  return await supabase
    .from("groups")
    .select(`
      *,
      group_members!inner (
        user_id,
        role,
        nickname
      )
    `)
    .eq("group_members.user_id", userId);
}

export async function getGroupById(groupId: string) {
  return await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();
}

export async function getGroupByCode(code: string) {
  return await supabase
    .from("groups")
    .select("*")
    .eq("code", code)
    .single();
}

export async function joinGroupByCode(code: string) {
  return await supabase.rpc("join_group_by_code", {
    input_code: code,
  });
}

export async function joinGroupByCodeWithFallback(code: string, userId: string | null) {
  const rpcResult = await joinGroupByCode(code);

  if (!rpcResult.error) {
    return { data: null, error: null };
  }

  if (!userId) {
    return { data: null, error: createError(rpcResult.error.message) };
  }

  const fallbackResult = await joinGroupDirect(code, userId);
  if (!fallbackResult.error) {
    return fallbackResult;
  }

  return {
    data: null,
    error: mergeErrors(rpcResult.error.message, fallbackResult.error.message),
  };
}

export async function deleteGroup(groupId: string) {
  return await supabase.from("groups").delete().eq("id", groupId);
}
