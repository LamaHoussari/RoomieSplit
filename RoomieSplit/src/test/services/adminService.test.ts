import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { supabase } from "../../lib/supabaseClient";
import { getAdminDashboardSnapshot, adminSetUserActive, adminArchiveGroup } from "../../services/adminService";

vi.mock("../../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("adminService", () => {
  const mockDashboardSnapshot = {
    groups: [
      {
        id: "group-1",
        name: "Test Group",
        code: "INVITE123",
        currency: "USD",
      },
    ],
    members: [
      {
        id: "member-001",
        group_id: "group-1",
        user_id: "user-001",
        role: "admin",
        profiles: { name: "John" },
      },
    ],
    profiles: [
      {
        id: "user-001",
        name: "John Doe",
        email: "john@example.com",
        is_active: true,
        is_system_admin: true,
      },
    ],
    expenses: [],
    chores: [],
    settlements: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminDashboardSnapshot", () => {
    it("should fetch all dashboard data in parallel", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      // Setup for groups query
      const mockGroupsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockDashboardSnapshot.groups,
            error: null,
          }),
        }),
      });

      // Setup for members query
      const mockMembersFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockDashboardSnapshot.members,
            error: null,
          }),
        }),
      });

      // Setup for profiles query
      const mockProfilesFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockDashboardSnapshot.profiles,
            error: null,
          }),
        }),
      });

      // Setup for remaining queries
      const mockOtherFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      let callCount = 0;
      (supabase.from as any).mockImplementation((table) => {
        if (table === "groups") return mockGroupsFrom();
        if (table === "group_members") return mockMembersFrom();
        if (table === "profiles") return mockProfilesFrom();
        return mockOtherFrom();
      });

      const result = await getAdminDashboardSnapshot();

      expect(supabase.from).toHaveBeenCalledWith("groups");
      expect(supabase.from).toHaveBeenCalledWith("group_members");
      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(result.data).toBeTruthy();
      expect(result.data?.groups.length).toBeGreaterThan(0);
    });

    it("should return error when any query fails", async () => {
      const mockError = { message: "Database error" };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await getAdminDashboardSnapshot();

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();
    });
  });

  describe("adminSetUserActive", () => {
    it("should call RPC to set user active status", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: { is_active: true },
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      const result = await adminSetUserActive("user-001", true);

      expect(mockRpc).toHaveBeenCalledWith("admin_set_user_active", {
        p_user_id: "user-001",
        p_is_active: true,
      });
    });

    it("should return error when permission denied", async () => {
      const mockError = { message: "Admin access required" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await adminSetUserActive("user-001", true);

      expect(result.error).toEqual(mockError);
    });

    it("should return error when user not found", async () => {
      const mockError = { message: "User not found" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await adminSetUserActive("nonexistent-user", true);

      expect(result.error).toEqual(mockError);
    });
  });

  describe("adminArchiveGroup", () => {
    it("should call RPC to archive group", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: { archived: true },
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      const result = await adminArchiveGroup("group-1");

      expect(mockRpc).toHaveBeenCalledWith("admin_archive_group", {
        p_group_id: "group-1",
      });
    });

    it("should cascade archive when archiving group", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: { archived: true, cascaded: true },
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      const result = await adminArchiveGroup("group-1");

      expect(result.data?.cascaded).toBe(true);
    });

    it("should return error on permission denied", async () => {
      const mockError = { message: "Permission denied" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await adminArchiveGroup("group-1");

      expect(result.error).toEqual(mockError);
    });
  });
});
