import Badge from './Badge';
import type { Settlement } from '../types/Settlement';
import { isSettlementSettled, getSettlementRemaining } from '../lib/finance';

interface SettlementRowProps {
  settlement: Settlement;
  showArchived: boolean;
  canPaySettlement: boolean;
  canManageSettlement: boolean;
  onPay: (settlement: Settlement) => void;
  onArchive: (settlement: Settlement) => void;
  onUnarchive: (settlement: Settlement) => void;
}

export default function SettlementRow({
  settlement,
  showArchived,
  canPaySettlement,
  canManageSettlement,
  onPay,
  onArchive,
  onUnarchive,
}: SettlementRowProps) {
  const settled = isSettlementSettled(settlement);
  const fromName = settlement.from_profile?.name ?? 'Unknown';
  const toName = settlement.to_profile?.name ?? 'Unknown';
  const expenseTitle = settlement.expense?.description?.trim() || '-';
  const archiveAllowed = canManageSettlement && settled;

  const formatMoney = (value: number | null | undefined) => {
    return Math.abs(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <tr
      className={`border-b transition-colors last:border-0 ${
        showArchived
          ? 'border-amber-100/90 hover:bg-amber-50/80 dark:border-amber-950/20 dark:hover:bg-amber-950/10'
          : 'border-stone-200/60 hover:bg-stone-100/70 dark:border-slate-800/50 dark:hover:bg-white/5'
      }`}
    >
      <td className="px-4 py-4">
        <Badge variant="red">{fromName}</Badge>
      </td>
      <td className="px-4 py-4">
        <Badge variant="purple">{toName}</Badge>
      </td>
      <td className="px-4 py-4 text-sm font-medium text-stone-600 dark:text-slate-300">{expenseTitle}</td>
      <td className="px-4 py-4 font-semibold text-stone-900 dark:text-slate-100">${formatMoney(settlement.amount)}</td>
      <td className="whitespace-nowrap px-4 py-4 text-stone-500 dark:text-slate-400">
        ${formatMoney(settlement.paid)} / ${formatMoney(settlement.amount)}
      </td>
      <td className="px-4 py-4">{settled ? <Badge variant="green">Settled</Badge> : <Badge variant="orange">Pending</Badge>}</td>
      <td className="px-4 py-4">
        {settlement.expense_id ? <Badge variant="purple">Expense</Badge> : <Badge variant="violet">External</Badge>}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          {!showArchived && !settled && (
            <button
              type="button"
              onClick={() => onPay(settlement)}
              title={canPaySettlement ? 'Record payment' : 'Only the member who owes this balance can pay it'}
              disabled={!canPaySettlement}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                canPaySettlement
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                  : 'cursor-not-allowed bg-stone-100 text-stone-300 dark:bg-slate-800 dark:text-slate-600'
              }`}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 7h16M2 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2M2 7v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M6 11h.01M10 11h.01" />
              </svg>
              Pay
            </button>
          )}
          {showArchived ? (
            <button
              type="button"
              onClick={() => onUnarchive(settlement)}
              title={canManageSettlement ? 'Unarchive' : 'Only members involved in this balance or an admin can unarchive it'}
              disabled={!canManageSettlement}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                canManageSettlement
                  ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                  : 'cursor-not-allowed text-stone-300 dark:text-slate-700'
              }`}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 13V5m0 0-3 3m3-3 3 3M4 13.5v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
              </svg>
            </button>
          ) : (
            canManageSettlement && (
              <button
                type="button"
                onClick={() => onArchive(settlement)}
                title={archiveAllowed ? 'Archive' : 'Only settled balances can be archived'}
                disabled={!archiveAllowed}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  archiveAllowed
                    ? 'text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                    : 'cursor-not-allowed text-stone-300 dark:text-slate-700'
                }`}
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h14M5 4.5h10a1 1 0 0 1 1 1v2H4v-2a1 1 0 0 1 1-1Zm0 3v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7m-7 3h4" />
                </svg>
              </button>
            )
          )}
        </div>
      </td>
    </tr>
  );
}
