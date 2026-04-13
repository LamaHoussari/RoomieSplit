import { describe, it, expect } from "vitest";
import { friendlyError } from "../../lib/friendlyError";

describe("friendlyError", () => {
  it("returns generic message for null/undefined", () => {
    expect(friendlyError(null)).toBe("Something went wrong. Please try again.");
    expect(friendlyError(undefined)).toBe("Something went wrong. Please try again.");
    expect(friendlyError("")).toBe("Something went wrong. Please try again.");
  });

  describe("auth errors", () => {
    it("maps invalid login credentials", () => {
      expect(friendlyError("Invalid login credentials")).toBe(
        "Incorrect email or password. Please try again."
      );
    });

    it("maps email not confirmed", () => {
      expect(friendlyError("Email not confirmed")).toBe(
        "Please verify your email address before signing in."
      );
    });

    it("maps user already registered", () => {
      expect(friendlyError("User already registered")).toBe(
        "An account with this email already exists. Try signing in instead."
      );
    });

    it("maps password too short", () => {
      expect(friendlyError("Password should be at least 6 characters")).toBe(
        "Password must be at least 6 characters."
      );
    });

    it("maps rate limit", () => {
      expect(friendlyError("Rate limit exceeded. Too many requests.")).toBe(
        "Too many attempts. Please wait a moment and try again."
      );
    });

    it("maps jwt expired", () => {
      expect(friendlyError("JWT expired")).toBe(
        "Your session has expired. Please sign in again."
      );
    });
  });

  describe("database errors", () => {
    it("maps RLS violation", () => {
      expect(friendlyError("new row violates row level security policy")).toBe(
        "You don't have permission to perform this action."
      );
    });

    it("maps unique constraint", () => {
      expect(friendlyError("violates unique constraint")).toBe(
        "This record already exists."
      );
    });

    it("maps foreign key constraint", () => {
      expect(friendlyError("violates foreign key constraint")).toBe(
        "This action references data that no longer exists."
      );
    });

    it("maps permission denied", () => {
      expect(friendlyError("permission denied for table profiles")).toBe(
        "You don't have permission to perform this action."
      );
    });
  });

  describe("network errors", () => {
    it("maps fetch errors", () => {
      expect(friendlyError("Failed to fetch")).toBe(
        "Unable to connect. Please check your internet and try again."
      );
    });

    it("maps timeout", () => {
      expect(friendlyError("Request timed out")).toBe(
        "The request took too long. Please try again."
      );
    });
  });

  describe("group/member errors", () => {
    it("maps already a member", () => {
      expect(friendlyError("already a member of this group")).toBe(
        "This person is already a member of the group."
      );
    });

    it("maps invalid code", () => {
      expect(friendlyError("invalid invite code")).toBe(
        "The invite code is invalid or has expired."
      );
    });
  });

  describe("passthrough for short messages", () => {
    it("passes through short non-technical messages", () => {
      expect(friendlyError("Custom error message")).toBe("Custom error message");
    });

    it("blocks long stack-trace-like messages", () => {
      const longMessage = "Error at supabase.from('table').select('*') at line 123 in stack trace debugging context that is very long and should not be shown to users directly because it's technical and confusing";
      expect(friendlyError(longMessage)).toBe("Something went wrong. Please try again.");
    });
  });
});
