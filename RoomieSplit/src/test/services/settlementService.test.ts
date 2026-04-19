import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { supabase } from "../../lib/supabaseClient";
import * as settlementService from "../../services/settlementService";

vi.mock("../../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("settlementService", () => {
  const mockSettlement = {
    id: "settlement-1",
    group_id: "group-1",
    from_user_id: "user-001",
    to_user_id: "user-002",
    amount: 50,
    expense_id: "expense-1",
    paid: 0,
    paid_at: null,
    archived_at: null,
    created_at: "2024-01-01",
    from_profile: { name: "John" },
    to_profile: { name: "Jane" },
    expense: { description: "Dinner" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createSettlement", () => {
    it("should insert settlement record", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: mockSettlement,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const newSettlement = {
        group_id: "group-1",
        from_user_id: "user-001",
        to_user_id: "user-002",
        amount: 50,
        expense_id: "expense-1",
      };

      await settlementService.createSettlement(newSettlement as any);

      expect(supabase.from).toHaveBeenCalledWith("settlements");
      expect(mockInsert).toHaveBeenCalledWith([newSettlement]);
    });

    it("should return error on invalid amount", async () => {
      const mockError = { message: "Amount must be positive" };
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const invalidSettlement = {
        group_id: "group-1",
        from_user_id: "user-001",
        to_user_id: "user-002",
        amount: -50,
        expense_id: "expense-1",
      };

      const result = await settlementService.createSettlement(invalidSettlement as any);

      expect(result.error).toEqual(mockError);
    });

    it("should return error when from_user equals to_user", async () => {
      const mockError = { message: "Cannot settle with self" };
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const invalidSettlement = {
        group_id: "group-1",
        from_user_id: "user-001",
        to_user_id: "user-001",
        amount: 50,
        expense_id: "expense-1",
      };

      const result = await settlementService.createSettlement(invalidSettlement as any);

      expect(result.error).toEqual(mockError);
    });
  });

  describe("getSettlementsByGroup", () => {
    it("should query active settlements for group by default", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSettlement],
        error: null,
      });

      const mockIs = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockEq = vi.fn().mockReturnValue({
        is: mockIs,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await settlementService.getSettlementsByGroup("group-1");

      expect(supabase.from).toHaveBeenCalledWith("settlements");
      expect(mockEq).toHaveBeenCalledWith("group_id", "group-1");
      expect(mockIs).toHaveBeenCalledWith("archived_at", null);
      expect(result.data).toEqual([mockSettlement]);
    });

    it("should query archived settlements when flag set", async () => {
      const archivedSettlement = { ...mockSettlement, archived_at: "2024-01-15" };
      const mockOrder = vi.fn().mockResolvedValue({
        data: [archivedSettlement],
        error: null,
      });

      const mockNot = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockEq = vi.fn().mockReturnValue({
        not: mockNot,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      await settlementService.getSettlementsByGroup("group-1", true);

      expect(mockNot).toHaveBeenCalledWith("archived_at", "is", null);
    });
  });

  describe("getSettlementsByGroups", () => {
    it("should query settlements across multiple groups", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSettlement],
        error: null,
      });

      const mockIs = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockIn = vi.fn().mockReturnValue({
        is: mockIs,
      });

      const mockSelect = vi.fn().mockReturnValue({
        in: mockIn,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      await settlementService.getSettlementsByGroups(
        ["group-1", "group-2"],
        false
      );

      expect(mockIn).toHaveBeenCalledWith("group_id", ["group-1", "group-2"]);
    });
  });

  describe("getSettlementsByExpense", () => {
    it("should query settlements linked to expense", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSettlement],
        error: null,
      });

      const mockIs = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockEq = vi.fn().mockReturnValue({
        is: mockIs,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await settlementService.getSettlementsByExpense("expense-1", "active");

      expect(mockEq).toHaveBeenCalledWith("expense_id", "expense-1");
      expect(result.data).toEqual([mockSettlement]);
    });

    it("should handle archived filter option", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockNot = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockEq = vi.fn().mockReturnValue({
        not: mockNot,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      await settlementService.getSettlementsByExpense("expense-1", "archived");

      expect(mockNot).toHaveBeenCalledWith("archived_at", "is", null);
    });
  });

  describe("recordSettlementPayment", () => {
    it("should call RPC to record payment", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: { paid: 50, paid_at: "2024-01-10" },
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      await settlementService.recordSettlementPayment("settlement-1", 50);

      expect(mockRpc).toHaveBeenCalledWith("record_settlement_payment", {
        p_settlement_id: "settlement-1",
        p_amount: 50,
      });
    });

    it("should return error on permission denied", async () => {
      const mockError = { message: "Permission denied" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await settlementService.recordSettlementPayment("settlement-1", 50);

      expect(result.error).toEqual(mockError);
    });

    it("should return error when settlement already settled", async () => {
      const mockError = { message: "Settlement already paid" };
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await settlementService.recordSettlementPayment("settlement-1", 50);

      expect(result.error).toEqual(mockError);
    });
  });

  describe("setSettlementArchivedAt", () => {
    it("should set archived_at timestamp", async () => {
      const now = new Date().toISOString();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      await settlementService.setSettlementArchivedAt("settlement-1", now);

      expect(mockUpdate).toHaveBeenCalledWith({ archived_at: now });
      expect(mockEq).toHaveBeenCalledWith("id", "settlement-1");
    });

    it("should clear archived_at with null", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      await settlementService.setSettlementArchivedAt("settlement-1", null);

      expect(mockUpdate).toHaveBeenCalledWith({ archived_at: null });
    });
  });

  describe("syncExpenseSettlements", () => {
    it("should call RPC to sync settlements for expense", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: { synced: true },
        error: null,
      });

      (supabase.rpc as any).mockImplementation(mockRpc);

      await settlementService.syncExpenseSettlements("expense-1");

      expect(mockRpc).toHaveBeenCalledWith("sync_expense_settlements", {
        p_expense_id: "expense-1",
      });
    });
  });

  describe("deleteSettlementsByExpense", () => {
    it("should delete all settlements for expense", async () => {
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

      await settlementService.deleteSettlementsByExpense("expense-1");

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("expense_id", "expense-1");
    });
  });
});
