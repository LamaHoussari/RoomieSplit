import { describe, it, expect, vi, beforeEach } from "vitest";

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
        data: { publicUrl: "https://test.supabase.co/storage/v1/object/public/test.svg" },
      }),
    }),
  },
}));
vi.mock("../../lib/supabaseClient", () => ({
  supabase: mockSupabase,
}));

import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  getCurrentSession,
  requestPasswordReset,
  updateUserPassword,
} from "../../services/authService";

// Mock avatar generation to avoid side effects
vi.mock("../../services/avatarService", () => ({
  generateAndUploadAvatar: vi.fn().mockResolvedValue("user-1/avatar.svg"),
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUpWithEmail", () => {
    it("creates user, generates avatar, and upserts profile", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-1", email: "test@test.com" } },
        error: null,
      });
      const mockChain = {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await signUpWithEmail("test@test.com", "password123");

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
      expect(mockChain.upsert).toHaveBeenCalledWith({
        id: "user-1",
        name: "test",
        email: "test@test.com",
        avatar_path: "user-1/avatar.svg",
      });
      expect(result.error).toBeNull();
    });

    it("returns error when auth.signUp fails", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: "User already registered" },
      });

      const result = await signUpWithEmail("existing@test.com", "password123");
      expect(result.error).toBeTruthy();
    });

    it("returns profile error if profile upsert fails", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-2", email: "new@test.com" } },
        error: null,
      });
      const mockChain = {
        upsert: vi.fn().mockResolvedValue({
          error: { message: "Profile creation failed" },
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await signUpWithEmail("new@test.com", "password123");
      expect(result.error?.message).toBe("Profile creation failed");
    });
  });

  describe("signInWithEmail", () => {
    it("calls signInWithPassword", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: {} },
        error: null,
      });

      await signInWithEmail("test@test.com", "password123");

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });

    it("returns error on invalid credentials", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: "Invalid login credentials" },
      });

      const result = await signInWithEmail("test@test.com", "wrong");
      expect(result.error).toBeTruthy();
    });
  });

  describe("signOutUser", () => {
    it("calls auth.signOut", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      const result = await signOutUser();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe("getCurrentSession", () => {
    it("returns current session", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: "u1" } } },
        error: null,
      });

      const result = await getCurrentSession();
      expect(result.data.session).toBeTruthy();
    });

    it("returns null session when not authenticated", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getCurrentSession();
      expect(result.data.session).toBeNull();
    });
  });

  describe("requestPasswordReset", () => {
    it("calls resetPasswordForEmail with redirect", async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await requestPasswordReset("test@test.com", "http://localhost/reset");

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "test@test.com",
        { redirectTo: "http://localhost/reset" }
      );
    });
  });

  describe("updateUserPassword", () => {
    it("calls updateUser with new password", async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null });

      await updateUserPassword("newPassword123");

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: "newPassword123",
      });
    });
  });
});
