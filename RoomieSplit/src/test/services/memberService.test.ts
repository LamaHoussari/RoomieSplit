import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { supabase } from "../../lib/supabaseClient";
import * as memberService from "../../services/memberService";

// Mock Supabase
vi.mock("../../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("memberService", () => {
  const mockMembers = [
    {
      id: "member-001",
      group_id: "group-1",
      user_id: "user-001",
      role: "admin",
      nickname: "John",
      joined_at: "2024-01-01",
      profiles: {
        name: "John Doe",
        nickname: "JD",
        email: "john@example.com",
        phone: "123-456-7890",
        payment_method: "card",
      },
    },
    {
      id: "member-002",
      group_id: "group-1",
      user_id: "user-002",
      role: "member",
      nickname: "Jane",
      joined_at: "2024-01-02",
      profiles: {
        name: "Jane Smith",
        nickname: "JS",
        email: "jane@example.com",
        phone: "098-765-4321",
        payment_method: "bank",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getMembersByGroup", () => {
    it("should query group_members with profile relationships", async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: mockMembers,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        data: mockMembers,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect.mockReturnValue({ eq: mockEq }),
      });

      const result = await memberService.getMembersByGroup("group-1");

      expect(supabase.from).toHaveBeenCalledWith("group_members");
      expect(mockSelect).toHaveBeenCalled();
      expect(result.data).toEqual(mockMembers);
      expect(result.error).toBeNull();
    });

    it("should return error when query fails", async () => {
      const mockError = { message: "Query failed" };
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await memberService.getMembersByGroup("group-1");

      expect(result.error).toEqual(mockError);
    });
  });

  describe("getMembersByGroups", () => {
    it("should query members across multiple groups", async () => {
      const mockIn = vi.fn().mockResolvedValue({
        data: mockMembers,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        in: mockIn,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await memberService.getMembersByGroups([
        "group-1",
        "group-2",
      ]);

      expect(supabase.from).toHaveBeenCalledWith("group_members");
      expect(mockSelect).toHaveBeenCalled();
      expect(mockIn).toHaveBeenCalledWith("group_id", ["group-1", "group-2"]);
      expect(result.data).toEqual(mockMembers);
    });
  });

  describe("addGroupMember", () => {
    it("should call RPC with correct parameters", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: { id: "member-new" },
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      const newMember = {
        group_id: "group-1",
        user_id: "user-new",
        nickname: "NewMember",
      };

      await memberService.addGroupMember(newMember, "user-001");

      expect(mockRpc).toHaveBeenCalledWith("add_group_member_by_admin", {
        p_group_id: "group-1",
        p_user_id: "user-001",
        p_role: "member",
        p_nickname: "NewMember",
      });
    });

    it("should handle RPC error when user not admin", async () => {
      const mockError = { message: "Permission denied" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const newMember = {
        group_id: "group-1",
        user_id: "user-new",
        nickname: null,
      };

      const result = await memberService.addGroupMember(newMember, "user-001");

      expect(result.error).toEqual(mockError);
    });
  });

  describe("removeMember", () => {
    it("should delete member by ID", async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await memberService.removeMember("member-001");

      expect(supabase.from).toHaveBeenCalledWith("group_members");
      expect(mockDelete).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it("should return error on permission denied", async () => {
      const mockError = { message: "Permission denied" };
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await memberService.removeMember("member-001");

      expect(result.error).toEqual(mockError);
    });
  });

  describe("updateMemberRole", () => {
    it("should call RPC to update member role", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: { updated: true },
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      await memberService.updateMemberRole("member-001", "admin");

      expect(mockRpc).toHaveBeenCalledWith("change_member_role", {
        p_member_id: "member-001",
        p_new_role: "admin",
      });
    });

    it("should handle RPC error when invalid role", async () => {
      const mockError = { message: "Invalid role" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await memberService.updateMemberRole("member-001", "superuser");

      expect(result.error).toEqual(mockError);
    });
  });
});
