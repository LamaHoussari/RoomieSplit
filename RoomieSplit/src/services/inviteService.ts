import { supabase } from "../lib/supabaseClient";

function createError(message: string) {
  return { message };
}

/** Look up a registered user by email */
export async function lookupUserByEmail(email: string) {
  return await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("email", email)
    .maybeSingle();
}

/**
 * Admin adds an existing user directly to the group.
 * Re-uses the existing RPC so the DB-level permission check stays in one place.
 */
export async function addMemberByEmail(groupId: string, userId: string) {
  const rpcResult = await supabase.rpc("add_group_member_by_admin", {
    p_group_id: groupId,
    p_user_id: userId,
    p_role: "member",
    p_nickname: null,
  });

  if (!rpcResult.error) {
    return rpcResult;
  }

  const fallbackResult = await supabase
    .from("group_members")
    .insert([{
      group_id: groupId,
      user_id: userId,
      role: "member",
      nickname: null,
    }]);

  if (!fallbackResult.error) {
    return fallbackResult;
  }

  return {
    data: null,
    error: createError(`Unable to add the member. RPC failed: ${rpcResult.error.message}. Direct Supabase fallback failed: ${fallbackResult.error.message}.`),
  };
}

/**
 * Send an invitation email via Resend API directly.
 *
 * SECURITY NOTE: In production the Resend API key is sent from the browser,
 * which exposes it in DevTools. For a production deployment, move this call
 * to a Supabase Edge Function or backend proxy so the key never leaves the
 * server. The Vite dev-server proxy already hides it during local development.
 */
export async function sendInviteEmail(
  email: string,
  groupName: string,
  groupCode: string,
  inviterName: string,
): Promise<{ error: string | null }> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    return { error: "Resend API key is not configured." };
  }

  const endpoint = import.meta.env.DEV ? "/api/resend/emails" : "https://api.resend.com/emails";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#6b21a8">You're invited to RoomieSplit!</h2>
      <p><strong>${inviterName}</strong> invited you to join the group <strong>"${groupName}"</strong>.</p>
      <p>Use this code to join:</p>
      <div style="background:#f3e8ff;border-radius:12px;padding:16px;text-align:center;font-size:24px;font-weight:bold;letter-spacing:4px;color:#6b21a8">
        ${groupCode}
      </div>
      <p style="margin-top:16px">
        1. Sign up or log in to RoomieSplit<br/>
        2. Go to <strong>Groups -&gt; Join Group</strong><br/>
        3. Enter the code above
      </p>
      <p style="color:#888;font-size:12px;margin-top:24px">
        If you didn't expect this email you can safely ignore it.
      </p>
    </div>
  `;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "RoomieSplit <onboarding@resend.dev>",
        to: [email],
        subject: `You're invited to join "${groupName}" on RoomieSplit!`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      try {
        const data = JSON.parse(body);
        return { error: data?.message ?? data?.error?.message ?? `Failed to send email (${res.status}).` };
      } catch {
        return { error: body || `Failed to send email (${res.status}).` };
      }
    }

    return { error: null };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
