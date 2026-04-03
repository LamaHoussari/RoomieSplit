import type { ExpenseSplit, NewExpenseSplit } from "../types/Expense";
import type { Settlement } from "../types/Settlement";

const CURRENCY_SCALE = 100;

function toCents(value: number | null | undefined) {
  return Math.round((Number(value) || 0) * CURRENCY_SCALE);
}

function buildSplitShareMap(
  splits: Array<Pick<ExpenseSplit | NewExpenseSplit, "user_id" | "share_amount">>,
) {
  const shareMap = new Map<string, number>();

  for (const split of splits) {
    if (!split.user_id) continue;

    shareMap.set(
      split.user_id,
      roundCurrency(
        (shareMap.get(split.user_id) ?? 0) + Number(split.share_amount ?? 0),
      ),
    );
  }

  return shareMap;
}

export function roundCurrency(value: number | null | undefined) {
  return toCents(value) / CURRENCY_SCALE;
}

export function getSplitTotal(
  splits: Array<Pick<ExpenseSplit | NewExpenseSplit, "share_amount">>,
) {
  return roundCurrency(
    splits.reduce((sum, split) => sum + Number(split.share_amount ?? 0), 0),
  );
}

export function splitAmountEvenly(total: number, userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueUserIds.length) return [] as NewExpenseSplit[];

  const totalCents = toCents(total);
  const baseShare = Math.floor(totalCents / uniqueUserIds.length);
  let remainder = totalCents % uniqueUserIds.length;

  return uniqueUserIds.map((userId) => {
    const shareCents = baseShare + (remainder > 0 ? 1 : 0);
    remainder = Math.max(remainder - 1, 0);

    return {
      user_id: userId,
      share_amount: shareCents / CURRENCY_SCALE,
    };
  });
}

export function areSplitConfigsEqual(
  currentSplits: Array<Pick<ExpenseSplit, "user_id" | "share_amount">>,
  nextSplits: Array<Pick<NewExpenseSplit, "user_id" | "share_amount">>,
) {
  const currentMap = buildSplitShareMap(currentSplits);
  const nextMap = buildSplitShareMap(nextSplits);

  if (currentMap.size !== nextMap.size) {
    return false;
  }

  for (const [userId, currentShare] of currentMap) {
    if (nextMap.get(userId) !== currentShare) {
      return false;
    }
  }

  return true;
}

export function getSettlementPaidAmount(
  settlement: Pick<Settlement, "amount" | "paid">,
) {
  const amount = roundCurrency(settlement.amount);
  const paid = roundCurrency(settlement.paid);

  return Math.min(amount, Math.max(0, paid));
}

export function getSettlementRemaining(
  settlement: Pick<Settlement, "amount" | "paid">,
) {
  return roundCurrency(
    Math.max(0, roundCurrency(settlement.amount) - getSettlementPaidAmount(settlement)),
  );
}

export function isSettlementSettled(
  settlement: Pick<Settlement, "amount" | "paid">,
) {
  return getSettlementRemaining(settlement) === 0;
}

export function hasRecordedSettlementPayments(
  settlements: Array<Pick<Settlement, "amount" | "paid">>,
) {
  return settlements.some((settlement) => getSettlementPaidAmount(settlement) > 0);
}

export function computeMemberBalance(userId: string, settlements: Settlement[]) {
  let balance = 0;

  for (const settlement of settlements) {
    const remaining = getSettlementRemaining(settlement);
    if (!remaining) continue;

    if (settlement.from_user_id === userId) {
      balance -= remaining;
    }

    if (settlement.to_user_id === userId) {
      balance += remaining;
    }
  }

  return roundCurrency(balance);
}
