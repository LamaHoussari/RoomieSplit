import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { supabase } from "../../lib/supabaseClient";
import * as groupService from "../../services/groupService";

vi.mock("../../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("groupService", () => {
  const mockGroup = {
    id: "group-1",
    name: "Test Group",
    code: "INVITE123",
    description: "Test description",
    currency: "USD",
    created_by: "user-001",
    created_at: "2024-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createGroup", () => {
    it("should call RPC with group data", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: mockGroup,
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      const newGroup = {
        name: "Test Group",
        code: "INVITE123",
        description: "Test description",
        currency: "USD",
      };

      const result = await groupService.createGroup(newGroup, "user-001");

      expect(mockRpc).toHaveBeenCalledWith("create_group_with_admin_member", {
        p_name: "Test Group",
        p_code: "INVITE123",
        p_description: "Test description",
        p_currency: "USD",
      });
      expect(result.data).toEqual(mockGroup);
    });

    it("should fallback to direct creation on RPC failure", async () => {
      const mockRpcError = { message: "RPC failed" };
      
      // Mock RPC call
      const mockRpcCall = vi.fn().mockResolvedValue({
        data: null,
        error: mockRpcError,
      });

      // Mock the from() query for fallback
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockGroup,
            error: null,
          }),
        }),
      });

      (supabase.rpc as any).mockImplementation(mockRpcCall);
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const newGroup = {
        name: "Test Group",
        code: "INVITE123",
        description: "Test description",
        currency: "USD",
      };

      const result = await groupService.createGroup(newGroup, "user-001");

      // Should have called RPC first
      expect(mockRpcCall).toHaveBeenCalledWith("create_group_with_admin_member", expect.any(Object));
      // Should fallback and insert directly
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe("getGroupsByUser", () => {
    it("should query groups for user with member relationships", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [mockGroup],
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await groupService.getGroupsByUser("user-001");

      expect(supabase.from).toHaveBeenCalledWith("groups");
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("group_members.user_id", "user-001");
      expect(result.data).toEqual([mockGroup]);
    });

    it("should return error when query fails", async () => {
      const mockError = { message: "Query failed" };
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await groupService.getGroupsByUser("user-001");

      expect(result.error).toEqual(mockError);
    });

    it("should return empty array when user not in any group", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await groupService.getGroupsByUser("user-no-groups");

      expect(result.data).toEqual([]);
    });
  });

  describe("getGroupById", () => {
    it("should fetch single group by ID", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockGroup,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await groupService.getGroupById("group-1");

      expect(result.data).toEqual(mockGroup);
    });
  });

  describe("joinGroupByCode", () => {
    it("should call RPC with invite code", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      const result = await groupService.joinGroupByCode("INVITE123");

      expect(mockRpc).toHaveBeenCalledWith("join_group_by_code", {
        input_code: "INVITE123",
      });
    });

    it("should return error when code invalid", async () => {
      const mockError = { message: "Invalid invite code" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await groupService.joinGroupByCode("INVALID");

      expect(result.error).toEqual(mockError);
    });
  });

  describe("joinGroupByCodeWithFallback", () => {
    it("should try RPC first, then fallback to direct join", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      const result = await groupService.joinGroupByCodeWithFallback(
        "INVITE123",
        "user-001"
      );

      expect(mockRpc).toHaveBeenCalledWith("join_group_by_code", {
        input_code: "INVITE123",
      });
    });

    it("should handle RPC failure gracefully", async () => {
      const mockError = { message: "Code not found" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await groupService.joinGroupByCodeWithFallback(
        "INVALID",
        null
      );

      // When userId is null, should return the RPC error without trying fallback
      expect(result.error?.message).toContain("Code not found");
    });
  });

  describe("deleteGroup", () => {
    it("should delete group by ID", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await groupService.deleteGroup("group-1");

      expect(supabase.from).toHaveBeenCalledWith("groups");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "group-1");
      expect(result.error).toBeNull();
    });

    it("should return error on permission denied", async () => {
      const mockError = { message: "Permission denied" };
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await groupService.deleteGroup("group-1");

      expect(result.error).toEqual(mockError);
    });
  });
});
