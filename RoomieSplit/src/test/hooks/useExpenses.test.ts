import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../../services/expensesService", () => ({
  createExpense: vi.fn(),
  getExpensesByGroup: vi.fn(),
  getExpensesByGroups: vi.fn(),
  deleteExpense: vi.fn(),
  setExpenseArchivedAt: vi.fn(),
  updateExpense: vi.fn(),
  updateExpenseWithSplits: vi.fn(),
}));

vi.mock("../../services/settlementService", () => ({
  createSettlement: vi.fn(),
  getSettlementsByExpense: vi.fn(),
  deleteSettlementsByExpense: vi.fn(),
  syncExpenseSettlements: vi.fn(),
  setSettlementsArchivedAt: vi.fn(),
}));

import { useExpenses } from "../../hooks/useExpenses";
import {
  createExpense,
  getExpensesByGroup,
} from "../../services/expensesService";
import {
  createSettlement,
  getSettlementsByExpense,
  syncExpenseSettlements,
} from "../../services/settlementService";
import { mockExpenses, TEST_GROUP_ID } from "../fixtures";

const mockedGetExpenses = vi.mocked(getExpensesByGroup);
const mockedCreateExpense = vi.mocked(createExpense);
const mockedCreateSettlement = vi.mocked(createSettlement);
const mockedGetSettlements = vi.mocked(getSettlementsByExpense);
const mockedSyncExpenseSettlements = vi.mocked(syncExpenseSettlements);

describe("useExpenses", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    mockedGetSettlements.mockResolvedValue({ data: [], error: null } as never);
    mockedSyncExpenseSettlements.mockResolvedValue({ data: null, error: null } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads expenses on mount for a group", async () => {
    mockedGetExpenses.mockResolvedValue({ data: mockExpenses, error: null } as never);

    const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.expenses).toEqual(mockExpenses);
    expect(result.current.error).toBe("");
  });

  it("clears expenses when groupId is null and no allGroupIds", async () => {
    const { result } = renderHook(() => useExpenses(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.expenses).toEqual([]);
  });

  it("sets error on load failure", async () => {
    mockedGetExpenses.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    } as never);

    const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it("loading always terminates on error", async () => {
    mockedGetExpenses.mockResolvedValue({
      data: null,
      error: { message: "Network failure" },
    } as never);

    const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  describe("addExpense", () => {
    it("validates split total must match amount", async () => {
      mockedGetExpenses.mockResolvedValue({ data: [], error: null } as never);

      const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.addExpense(
          {
            group_id: TEST_GROUP_ID,
            description: "Test",
            amount: 100,
            payer_id: "u1",
            created_by: "u1",
            date: "2025-03-15",
          },
          [
            { user_id: "u1", share_amount: 30 },
            { user_id: "u2", share_amount: 30 },
          ]
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("Split amounts must add up");
    });

    it("validates amount must be positive", async () => {
      mockedGetExpenses.mockResolvedValue({ data: [], error: null } as never);

      const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.addExpense(
          {
            group_id: TEST_GROUP_ID,
            description: "Test",
            amount: 0,
            payer_id: "u1",
            created_by: "u1",
            date: "2025-03-15",
          },
          [{ user_id: "u1", share_amount: 0 }]
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("valid expense amount");
    });

    it("creates expense on valid input", async () => {
      mockedGetExpenses.mockResolvedValue({ data: [], error: null } as never);
      mockedCreateExpense.mockResolvedValue({ data: { id: "new" }, error: null } as never);

      const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.addExpense(
          {
            group_id: TEST_GROUP_ID,
            description: "Groceries",
            amount: 100,
            payer_id: "u1",
            created_by: "u1",
            date: "2025-03-15",
          },
          [
            { user_id: "u1", share_amount: 50 },
            { user_id: "u2", share_amount: 50 },
          ]
        );
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toBeTruthy();
    });

    it("creates missing settlement rows when settlement sync is unavailable", async () => {
      mockedGetExpenses.mockResolvedValue({ data: [], error: null } as never);
      mockedCreateExpense.mockResolvedValue({ data: "expense-new", error: null } as never);
      mockedGetSettlements.mockResolvedValue({ data: [], error: null } as never);
      mockedSyncExpenseSettlements.mockResolvedValue({
        data: null,
        error: { message: "function sync_expense_settlements does not exist" },
      } as never);
      mockedCreateSettlement.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.addExpense(
          {
            group_id: TEST_GROUP_ID,
            description: "Groceries",
            amount: 100,
            payer_id: "u1",
            created_by: "u1",
            date: "2025-03-15",
          },
          [
            { user_id: "u1", share_amount: 50 },
            { user_id: "u2", share_amount: 50 },
          ],
        );
      });

      expect(success).toBe(true);
      expect(mockedCreateSettlement).toHaveBeenCalledWith({
        group_id: TEST_GROUP_ID,
        from_user_id: "u2",
        to_user_id: "u1",
        amount: 50,
        paid: 0,
        created_by: "u1",
        expense_id: "expense-new",
      });
    });

    it("sets error when createExpense RPC fails", async () => {
      mockedGetExpenses.mockResolvedValue({ data: [], error: null } as never);
      mockedCreateExpense.mockResolvedValue({
        data: null,
        error: { message: "violates row level security policy" },
      } as never);

      const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.addExpense(
          {
            group_id: TEST_GROUP_ID,
            description: "X",
            amount: 10,
            payer_id: "u1",
            created_by: "u1",
            date: "2025-01-01",
          },
          [{ user_id: "u1", share_amount: 10 }]
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("removeExpense", () => {
    it("blocks deletion when settlements have recorded payments", async () => {
      mockedGetExpenses.mockResolvedValue({ data: mockExpenses, error: null } as never);
      mockedGetSettlements.mockResolvedValue({
        data: [{ id: "s1", amount: 25, paid: 10, from_user_id: "u2", to_user_id: "u1" }],
        error: null,
      } as never);

      const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.removeExpense("expense-001");
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("recorded payments");
    });

    it("returns false for nonexistent expense", async () => {
      mockedGetExpenses.mockResolvedValue({ data: [], error: null } as never);

      const { result } = renderHook(() => useExpenses(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await waitFor(async () => {
        success = await result.current.removeExpense("nonexistent");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Expense not found.");
    });
  });
});
