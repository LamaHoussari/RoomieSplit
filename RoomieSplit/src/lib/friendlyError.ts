/**
 * Maps raw Supabase / API error messages to user-friendly strings.
 * Falls back to a generic message if nothing matches.
 */

const PATTERNS: [RegExp, string][] = [
  // Auth
  [/invalid login credentials/i, "Incorrect email or password. Please try again."],
  [/email not confirmed/i, "Please verify your email address before signing in."],
  [/user already registered/i, "An account with this email already exists. Try signing in instead."],
  [/password.*too short|at least 6/i, "Password must be at least 6 characters."],
  [/email.*required|invalid.*email/i, "Please enter a valid email address."],
  [/signup.*disabled/i, "New registrations are temporarily unavailable. Please try again later."],
  [/rate limit|too many requests/i, "Too many attempts. Please wait a moment and try again."],
  [/jwt expired|token.*expired|refresh_token/i, "Your session has expired. Please sign in again."],

  // Database / RLS
  [/violates row level security/i, "You don't have permission to perform this action."],
  [/violates unique constraint/i, "This record already exists."],
  [/violates foreign key constraint/i, "This action references data that no longer exists."],
  [/violates not-null constraint/i, "A required field is missing. Please fill in all required fields."],
  [/permission denied/i, "You don't have permission to perform this action."],
  [/PGRST/i, "Something went wrong loading data. Please try again."],

  // Network
  [/fetch|network|failed to fetch|load failed/i, "Unable to connect. Please check your internet and try again."],
  [/timeout|timed out/i, "The request took too long. Please try again."],

  // Groups / Members
  [/already a member/i, "This person is already a member of the group."],
  [/group not found|no.*group/i, "Group not found. It may have been deleted."],
  [/invalid.*code|code.*not found/i, "The invite code is invalid or has expired."],
];

export function friendlyError(raw: string | undefined | null): string {
  if (!raw) return "Something went wrong. Please try again.";

  for (const [pattern, friendly] of PATTERNS) {
    if (pattern.test(raw)) return friendly;
  }

  // If the message is already short and doesn't look like a stack trace, pass it through
  if (raw.length < 120 && !/\bat\b.*\(|stack|trace|supabase|postgrest/i.test(raw)) {
    return raw;
  }

  return "Something went wrong. Please try again.";
}
