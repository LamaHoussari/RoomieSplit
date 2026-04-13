/**
 * Shared mock factory for Supabase client.
 * Import and use in tests that need to mock service-layer Supabase calls.
 */
import { vi } from "vitest";

// Builder pattern mock for chained Supabase queries
export function createQueryMock(resolveWith: { data: unknown; error: unknown }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const terminal = vi.fn().mockResolvedValue(resolveWith);

  // Each method returns the chain so .select().eq().single() etc. works
  for (const method of [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "eq",
    "neq",
    "in",
    "is",
    "not",
    "order",
    "single",
    "maybeSingle",
    "limit",
  ]) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  // The last method in any chain should resolve
  chain.single = terminal;
  chain.maybeSingle = terminal;

  // For queries that don't end with .single(), make the chain itself thenable
  const thenable = {
    ...chain,
    then: (resolve: (v: unknown) => void) => resolve(resolveWith),
  };

  for (const method of Object.keys(chain)) {
    if (method !== "single" && method !== "maybeSingle") {
      chain[method]!.mockReturnValue(thenable);
    }
  }

  return chain;
}

export function createMockSupabase() {
  return {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://test.supabase.co/storage/v1/object/public/profile_images/test.svg" },
        }),
      }),
    },
  };
}
