import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock("../../lib/supabaseClient", () => ({
  supabase: mockSupabase,
}));

import {
  createExpense,
  getExpensesByGroup,
  deleteExpense,
  updateExpense,
  setExpenseArchivedAt,
} from "../../services/expensesService";

describe("expensesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createExpense", () => {
    it("calls RPC with correct parameters", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: { id: "exp-1" }, error: null });

      const expense = {
        group_id: "g1",
        description: "Groceries",
        amount: 50,
        payer_id: "u1",
        created_by: "u1",
        date: "2025-03-15",
        is_paid: true,
      };
      const splits = [
        { user_id: "u1", share_amount: 25 },
        { user_id: "u2", share_amount: 25 },
      ];

      await createExpense(expense, splits);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("create_expense_with_splits", {
        p_group_id: "g1",
        p_description: "Groceries",
        p_amount: 50,
        p_payer_id: "u1",
        p_date: "2025-03-15",
        p_is_paid: true,
        p_splits: [
          { user_id: "u1", share_amount: 25 },
          { user_id: "u2", share_amount: 25 },
        ],
      });
    });

    it("returns error on RPC failure", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "violates row level security policy" },
      });

      const result = await createExpense(
        { group_id: "g1", description: "X", amount: 10, payer_id: "u1", created_by: "u1", date: "2025-01-01" },
        [{ user_id: "u1", share_amount: 10 }]
      );

      expect(result.error).toBeTruthy();
    });
  });

  describe("getExpensesByGroup", () => {
    it("queries active expenses by default", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await getExpensesByGroup("g1");

      expect(mockSupabase.from).toHaveBeenCalledWith("expenses");
      expect(mockChain.eq).toHaveBeenCalledWith("group_id", "g1");
      expect(mockChain.is).toHaveBeenCalledWith("archived_at", null);
    });

    it("queries archived expenses when flag set", async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await getExpensesByGroup("g1", true);

      expect(mockChain.not).toHaveBeenCalledWith("archived_at", "is", null);
    });
  });

  describe("deleteExpense", () => {
    it("calls delete on correct ID", async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await deleteExpense("exp-1");

      expect(mockSupabase.from).toHaveBeenCalledWith("expenses");
      expect(mockChain.eq).toHaveBeenCalledWith("id", "exp-1");
    });
  });

  describe("updateExpense", () => {
    it("updates specified fields", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await updateExpense("exp-1", { is_paid: true });

      expect(mockChain.update).toHaveBeenCalledWith({ is_paid: true });
      expect(mockChain.eq).toHaveBeenCalledWith("id", "exp-1");
    });
  });

  describe("setExpenseArchivedAt", () => {
    it("sets archived_at timestamp", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await setExpenseArchivedAt("exp-1", "2025-03-20T00:00:00Z");

      expect(mockChain.update).toHaveBeenCalledWith({ archived_at: "2025-03-20T00:00:00Z" });
    });

    it("clears archived_at with null", async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await setExpenseArchivedAt("exp-1", null);

      expect(mockChain.update).toHaveBeenCalledWith({ archived_at: null });
    });
  });
});
