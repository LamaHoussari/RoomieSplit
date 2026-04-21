import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock all service dependencies
vi.mock("../../services/authService", () => ({
  getCurrentSession: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithEmail: vi.fn(),
  signOutUser: vi.fn(),
  createUserProfile: vi.fn().mockResolvedValue({ error: null }),
  subscribeToAuthChanges: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}));

vi.mock("../../lib/adminAuth", () => ({
  checkIsSystemAdmin: vi.fn().mockResolvedValue(false),
}));

import { useAuth } from "../../hooks/useAuth";
import {
  getCurrentSession,
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
} from "../../services/authService";
import { checkIsSystemAdmin } from "../../lib/adminAuth";

const mockedGetSession = vi.mocked(getCurrentSession);
const mockedSignUp = vi.mocked(signUpWithEmail);
const mockedSignIn = vi.mocked(signInWithEmail);
const mockedSignOut = vi.mocked(signOutUser);
const mockedCheckAdmin = vi.mocked(checkIsSystemAdmin);

describe("useAuth", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in loading state", () => {
    mockedGetSession.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("sets user after session loads", async () => {
    mockedGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: "u1", email: "alice@test.com" },
        },
      },
      error: null,
    } as never);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(
      expect.objectContaining({
        id: "u1",
        email: "alice@test.com",
      })
    );
  });

  it("sets user to null when no session", async () => {
    mockedGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it("sets error when session fetch fails", async () => {
    mockedGetSession.mockResolvedValue({
      data: { session: null },
      error: { message: "Failed to fetch" },
    } as never);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it("loading always ends even on unexpected errors", async () => {
    mockedGetSession.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it("checks admin status in background", async () => {
    mockedCheckAdmin.mockResolvedValue(true);
    mockedGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: "admin-1", email: "admin@test.com" },
        },
      },
      error: null,
    } as never);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user?.isAdmin).toBe(true);
    });
  });

  describe("signUp", () => {
    beforeEach(() => {
      mockedGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as never);
    });

    it("returns true on success", async () => {
      mockedSignUp.mockResolvedValue({ data: {}, error: null } as never);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.signUp("new@test.com", "password123");
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toBeTruthy();
      expect(result.current.error).toBe("");
    });

    it("returns false and sets error on failure", async () => {
      mockedSignUp.mockResolvedValue({
        data: null,
        error: { message: "User already registered" },
      } as never);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.signUp("existing@test.com", "password123");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("signIn", () => {
    beforeEach(() => {
      mockedGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as never);
    });

    it("returns true on success", async () => {
      mockedSignIn.mockResolvedValue({ data: {}, error: null } as never);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.signIn("alice@test.com", "password123");
      });

      expect(success).toBe(true);
    });

    it("returns false and sets friendly error on failure", async () => {
      mockedSignIn.mockResolvedValue({
        data: null,
        error: { message: "Invalid login credentials" },
      } as never);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.signIn("alice@test.com", "wrong");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Incorrect email or password. Please try again.");
    });
  });

  describe("signOut", () => {
    beforeEach(() => {
      mockedGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as never);
    });

    it("returns true on success", async () => {
      mockedSignOut.mockResolvedValue({ error: null } as never);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.signOut();
      });

      expect(success).toBe(true);
    });
  });

  describe("clearFeedback", () => {
    it("clears both error and success messages", async () => {
      mockedGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as never);
      mockedSignIn.mockResolvedValue({
        data: null,
        error: { message: "test error" },
      } as never);

      const { result } = renderHook(() => useAuth());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await waitFor(async () => {
        await result.current.signIn("a@b.com", "x");
      });
      expect(result.current.error).toBeTruthy();

      await waitFor(() => {
        result.current.clearFeedback();
      });
      expect(result.current.error).toBe("");
      expect(result.current.successMessage).toBe("");
    });
  });
});
