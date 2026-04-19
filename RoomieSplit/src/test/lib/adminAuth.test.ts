import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
}));
vi.mock("../../lib/supabaseClient", () => ({
  supabase: mockSupabase,
}));

import { checkIsSystemAdmin } from "../../lib/adminAuth";

describe("checkIsSystemAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when profile has is_system_admin = true", async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { is_system_admin: true },
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await checkIsSystemAdmin("admin-1");
    expect(result).toBe(true);
  });

  it("returns false when profile has is_system_admin = false", async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { is_system_admin: false },
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await checkIsSystemAdmin("user-1");
    expect(result).toBe(false);
  });

  it("returns false on supabase error", async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await checkIsSystemAdmin("nonexistent");
    expect(result).toBe(false);
  });

  it("returns false on thrown exception", async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(new Error("Network failure")),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await checkIsSystemAdmin("user-1");
    expect(result).toBe(false);
  });

  it("returns false when is_system_admin field is null/missing", async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { is_system_admin: null },
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await checkIsSystemAdmin("user-1");
    expect(result).toBe(false);
  });
});
