import { describe, it, expect } from "vitest";
import {
  roundCurrency,
  getSplitTotal,
  splitAmountEvenly,
  areSplitConfigsEqual,
  getSettlementPaidAmount,
  getSettlementRemaining,
  isSettlementSettled,
  hasRecordedSettlementPayments,
  computeMemberBalance,
} from "../../lib/finance";
import type { Settlement } from "../../types/Settlement";

describe("roundCurrency", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundCurrency(10.005)).toBe(10.01);
    expect(roundCurrency(10.004)).toBe(10);
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
  });

  it("handles null/undefined as 0", () => {
    expect(roundCurrency(null)).toBe(0);
    expect(roundCurrency(undefined)).toBe(0);
  });

  it("handles negative values", () => {
    // Math.round(-555) = -555 → -5.55 (rounds toward zero)
    expect(roundCurrency(-5.555)).toBe(-5.55);
    expect(roundCurrency(-5.556)).toBe(-5.56);
  });
});

describe("getSplitTotal", () => {
  it("sums share_amount values", () => {
    const splits = [
      { share_amount: 10 },
      { share_amount: 20.5 },
      { share_amount: 5.25 },
    ];
    expect(getSplitTotal(splits)).toBe(35.75);
  });

  it("returns 0 for empty splits", () => {
    expect(getSplitTotal([])).toBe(0);
  });

  it("treats null share_amount as 0", () => {
    const splits = [{ share_amount: 10 }, { share_amount: null }];
    expect(getSplitTotal(splits)).toBe(10);
  });
});

describe("splitAmountEvenly", () => {
  it("splits evenly among users", () => {
    const result = splitAmountEvenly(100, ["a", "b", "c", "d"]);
    expect(result).toHaveLength(4);
    expect(result.map((r) => r.share_amount)).toEqual([25, 25, 25, 25]);
  });

  it("distributes remainder cents correctly", () => {
    const result = splitAmountEvenly(10, ["a", "b", "c"]);
    const amounts = result.map((r) => r.share_amount);
    // 10 / 3 = 3.33 each, but 3.33 * 3 = 9.99, so 1 cent remainder
    expect(amounts.reduce((a, b): number => (a && b) ? a + b : 0, 0)).toBeCloseTo(10, 2);
    // First user gets the extra cent
    expect(amounts[0]).toBe(3.34);
    expect(amounts[1]).toBe(3.33);
    expect(amounts[2]).toBe(3.33);
  });

  it("returns empty for no users", () => {
    expect(splitAmountEvenly(100, [])).toEqual([]);
  });

  it("deduplicates user IDs", () => {
    const result = splitAmountEvenly(100, ["a", "a", "b"]);
    expect(result).toHaveLength(2);
    expect(result[0].share_amount).toBe(50);
    expect(result[1].share_amount).toBe(50);
  });

  it("filters empty string user IDs", () => {
    const result = splitAmountEvenly(100, ["a", "", "b"]);
    expect(result).toHaveLength(2);
  });
});

describe("areSplitConfigsEqual", () => {
  it("returns true for identical configs", () => {
    const current = [
      { user_id: "a", share_amount: 50 },
      { user_id: "b", share_amount: 50 },
    ];
    const next = [
      { user_id: "a", share_amount: 50 },
      { user_id: "b", share_amount: 50 },
    ];
    expect(areSplitConfigsEqual(current, next)).toBe(true);
  });

  it("returns false when amounts differ", () => {
    const current = [{ user_id: "a", share_amount: 50 }];
    const next = [{ user_id: "a", share_amount: 60 }];
    expect(areSplitConfigsEqual(current, next)).toBe(false);
  });

  it("returns false when user sets differ", () => {
    const current = [{ user_id: "a", share_amount: 50 }];
    const next = [
      { user_id: "a", share_amount: 25 },
      { user_id: "b", share_amount: 25 },
    ];
    expect(areSplitConfigsEqual(current, next)).toBe(false);
  });
});

describe("settlement helpers", () => {
  const unsettled: Pick<Settlement, "amount" | "paid"> = { amount: 100, paid: 30 };
  const settled: Pick<Settlement, "amount" | "paid"> = { amount: 100, paid: 100 };
  const overpaid: Pick<Settlement, "amount" | "paid"> = { amount: 100, paid: 120 };

  it("getSettlementPaidAmount clamps to amount", () => {
    expect(getSettlementPaidAmount(unsettled)).toBe(30);
    expect(getSettlementPaidAmount(settled)).toBe(100);
    expect(getSettlementPaidAmount(overpaid)).toBe(100);
  });

  it("getSettlementRemaining returns correct remaining", () => {
    expect(getSettlementRemaining(unsettled)).toBe(70);
    expect(getSettlementRemaining(settled)).toBe(0);
    expect(getSettlementRemaining(overpaid)).toBe(0);
  });

  it("isSettlementSettled detects fully paid", () => {
    expect(isSettlementSettled(unsettled)).toBe(false);
    expect(isSettlementSettled(settled)).toBe(true);
    expect(isSettlementSettled(overpaid)).toBe(true);
  });

  it("hasRecordedSettlementPayments detects any paid > 0", () => {
    expect(hasRecordedSettlementPayments([unsettled])).toBe(true);
    expect(hasRecordedSettlementPayments([{ amount: 50, paid: 0 }])).toBe(false);
    expect(hasRecordedSettlementPayments([])).toBe(false);
  });
});

describe("computeMemberBalance", () => {
  it("computes net balance across settlements", () => {
    const settlements: Settlement[] = [
      {
        id: "s1",
        group_id: "g1",
        from_user_id: "user-a",
        to_user_id: "user-b",
        amount: 50,
        paid: 0,
        created_by: "user-b",
        created_at: "",
      },
      {
        id: "s2",
        group_id: "g1",
        from_user_id: "user-b",
        to_user_id: "user-a",
        amount: 20,
        paid: 0,
        created_by: "user-a",
        created_at: "",
      },
    ];

    // user-a: owes 50 in s1 (-50), is owed 20 in s2 (+20) = -30
    expect(computeMemberBalance("user-a", settlements)).toBe(-30);
    // user-b: is owed 50 in s1 (+50), owes 20 in s2 (-20) = +30
    expect(computeMemberBalance("user-b", settlements)).toBe(30);
  });

  it("ignores fully settled settlements", () => {
    const settlements: Settlement[] = [
      {
        id: "s1",
        group_id: "g1",
        from_user_id: "user-a",
        to_user_id: "user-b",
        amount: 50,
        paid: 50,
        created_by: "user-b",
        created_at: "",
      },
    ];
    expect(computeMemberBalance("user-a", settlements)).toBe(0);
    expect(computeMemberBalance("user-b", settlements)).toBe(0);
  });
});
