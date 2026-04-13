import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so the variable is available before vi.mock runs
const mockSupabase = vi.hoisted(() => ({
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
}));
vi.mock("../../lib/supabaseClient", () => ({
  supabase: mockSupabase,
}));

import {
  getProfileById,
  updateProfile,
} from "../../services/profileService";

describe("profileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProfileById", () => {
    it("queries profiles table with correct user ID", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: "user-1", name: "Alice", email: "a@b.com" },
          error: null,
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await getProfileById("user-1");

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockChain.select).toHaveBeenCalledWith(
        "id, name, email, nickname, phone, payment_method, avatar_path, created_at"
      );
      expect(mockChain.eq).toHaveBeenCalledWith("id", "user-1");
      expect(result.data).toEqual({ id: "user-1", name: "Alice", email: "a@b.com" });
      expect(result.error).toBeNull();
    });

    it("returns error when supabase fails", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Row not found" },
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await getProfileById("nonexistent");
      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe("updateProfile", () => {
    it("updates profile with provided fields", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await updateProfile("user-1", {
        name: "Alice Updated",
        phone: "555-1234",
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockChain.update).toHaveBeenCalledWith({
        name: "Alice Updated",
        phone: "555-1234",
      });
      expect(mockChain.eq).toHaveBeenCalledWith("id", "user-1");
      expect(result.error).toBeNull();
    });

    it("returns error on RLS denial", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "new row violates row level security policy" },
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await updateProfile("other-user", { name: "Hacked" });
      expect(result.error).toBeTruthy();
      expect(result.error!.message).toContain("row level security");
    });
  });
});
