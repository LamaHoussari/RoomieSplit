import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("../../services/settlementService", () => ({
  createSettlement: vi.fn(),
  getSettlementsByGroup: vi.fn(),
  getSettlementsByGroups: vi.fn(),
  recordSettlementPayment: vi.fn(),
  setSettlementArchivedAt: vi.fn(),
}));

import { useSettlements } from "../../hooks/useSettlements";
import {
  createSettlement,
  getSettlementsByGroup,
  recordSettlementPayment,
  setSettlementArchivedAt,
} from "../../services/settlementService";
import { mockSettlements, TEST_GROUP_ID, TEST_USER_ID, TEST_USER_ID_2 } from "../fixtures";

const mockedGetSettlements = vi.mocked(getSettlementsByGroup);
const mockedCreateSettlement = vi.mocked(createSettlement);
const mockedRecordPayment = vi.mocked(recordSettlementPayment);
const mockedSetArchived = vi.mocked(setSettlementArchivedAt);

describe("useSettlements", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads settlements on mount", async () => {
    mockedGetSettlements.mockResolvedValue({ data: mockSettlements, error: null } as never);

    const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settlements).toEqual(mockSettlements);
  });

  it("returns empty for null groupId", async () => {
    const { result } = renderHook(() => useSettlements(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settlements).toEqual([]);
  });

  it("loading terminates on error", async () => {
    mockedGetSettlements.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    } as never);

    const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  describe("addSettlement", () => {
    it("validates amount > 0", async () => {
      mockedGetSettlements.mockResolvedValue({ data: [], error: null } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.addSettlement({
          group_id: TEST_GROUP_ID,
          from_user_id: TEST_USER_ID,
          to_user_id: TEST_USER_ID_2,
          amount: 0,
          created_by: TEST_USER_ID,
        });
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("valid amount");
    });

    it("validates from != to user", async () => {
      mockedGetSettlements.mockResolvedValue({ data: [], error: null } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.addSettlement({
          group_id: TEST_GROUP_ID,
          from_user_id: TEST_USER_ID,
          to_user_id: TEST_USER_ID,
          amount: 50,
          created_by: TEST_USER_ID,
        });
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("different members");
    });

    it("validates paid <= amount", async () => {
      mockedGetSettlements.mockResolvedValue({ data: [], error: null } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.addSettlement({
          group_id: TEST_GROUP_ID,
          from_user_id: TEST_USER_ID,
          to_user_id: TEST_USER_ID_2,
          amount: 50,
          paid: 100,
          created_by: TEST_USER_ID,
        });
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("more than the total");
    });

    it("creates settlement on valid input", async () => {
      mockedGetSettlements.mockResolvedValue({ data: [], error: null } as never);
      mockedCreateSettlement.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.addSettlement({
          group_id: TEST_GROUP_ID,
          from_user_id: TEST_USER_ID,
          to_user_id: TEST_USER_ID_2,
          amount: 50,
          created_by: TEST_USER_ID,
        });
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toBeTruthy();
    });
  });

  describe("recordPayment", () => {
    it("rejects payment from non-owing user", async () => {
      mockedGetSettlements.mockResolvedValue({
        data: mockSettlements,
        error: null,
      } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        // mockSettlement.from_user_id is TEST_USER_ID_2
        // Acting as TEST_USER_ID (who is the creditor, not debtor) should fail
        success = await result.current.recordPayment(
          mockSettlements[0],
          10,
          TEST_USER_ID
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("person who owes");
    });

    it("rejects payment exceeding remaining", async () => {
      mockedGetSettlements.mockResolvedValue({
        data: mockSettlements,
        error: null,
      } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.recordPayment(
          mockSettlements[0], // amount=25, paid=0, remaining=25
          50,
          TEST_USER_ID_2
        );
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("exceed the remaining");
    });

    it("records valid payment", async () => {
      mockedGetSettlements.mockResolvedValue({
        data: mockSettlements,
        error: null,
      } as never);
      mockedRecordPayment.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.recordPayment(
          mockSettlements[0],
          10,
          TEST_USER_ID_2
        );
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toContain("Payment recorded");
    });
  });

  describe("archiveSettlement", () => {
    it("rejects archiving unsettled balance", async () => {
      mockedGetSettlements.mockResolvedValue({
        data: mockSettlements,
        error: null,
      } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        // mockSettlements[0] has paid=0, amount=25 → not settled
        success = await result.current.archiveSettlement("settlement-001");
      });

      expect(success).toBe(false);
      expect(result.current.error).toContain("fully settled");
    });

    it("archives fully settled balance", async () => {
      mockedGetSettlements.mockResolvedValue({
        data: mockSettlements,
        error: null,
      } as never);
      mockedSetArchived.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useSettlements(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        // mockSettlements[1] has paid=50, amount=50 → settled
        success = await result.current.archiveSettlement("settlement-002");
      });

      expect(success).toBe(true);
    });
  });
});
