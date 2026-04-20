import Badge from './Badge';
import type { Expense } from '../types/Expense';

interface ExpenseRowProps {
  expense: Expense;
  showArchived: boolean;
  status: {
    detail: string;
    label: string;
    variant: 'violet' | 'orange' | 'green';
  };
  canManageExpense: boolean;
  archiveAllowed: boolean;
  onEdit: (expense: Expense) => void;
  onArchive: (expenseId: string) => void;
  onUnarchive: (expenseId: string) => void;
  onDelete: (expenseId: string) => void;
}

export default function ExpenseRow({
  expense,
  showArchived,
  status,
  canManageExpense,
  archiveAllowed,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: ExpenseRowProps) {
  const formatMoney = (value: string | number | null | undefined) => {
    return value ? Math.abs(Number(value)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00';
  };

  return (
    <tr
      className={`border-b transition-colors last:border-0 ${
        showArchived
          ? 'border-amber-100/90 hover:bg-amber-50/80 dark:border-amber-950/20 dark:hover:bg-amber-950/10'
          : 'border-stone-200/60 hover:bg-stone-100/70 dark:border-slate-800/50 dark:hover:bg-white/5'
      }`}
    >
      <td className="px-4 py-4 font-semibold text-stone-900 dark:text-slate-100">{expense.description}</td>
      <td className="px-4 py-4">
        <Badge variant="purple">{expense.profiles?.name ?? 'Unknown'}</Badge>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-stone-500 dark:text-slate-400">{expense.date}</td>
      <td className="px-4 py-4 text-sm text-stone-500 dark:text-slate-400">
        {expense.expense_splits?.map(split => split.profiles?.name ?? 'Unknown').join(', ')}
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <Badge variant={status.variant}>{status.label}</Badge>
          <p className="text-xs font-medium text-stone-500 dark:text-slate-400">{status.detail}</p>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-4 font-semibold text-stone-900 dark:text-slate-100">
        ${formatMoney(expense.amount)}
      </td>
      <td className="w-[180px] min-w-[180px] px-4 py-4">
        <div className="flex items-center justify-end gap-1.5">
          {showArchived ? (
            <button
              type="button"
              onClick={canManageExpense ? () => onUnarchive(expense.id) : undefined}
              title={canManageExpense ? 'Unarchive' : 'Only the expense owner or an admin can unarchive this expense'}
              disabled={!canManageExpense}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                canManageExpense
                  ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                  : 'cursor-not-allowed text-stone-300 dark:text-slate-700'
              }`}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 13V5m0 0-3 3m3-3 3 3M4 13.5v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
              </svg>
            </button>
          ) : (
            canManageExpense && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  title="Edit"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.586 3.586a2 2 0 1 1 2.828 2.828L7 15.828 3 17l1.172-4L13.586 3.586Z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => onArchive(expense.id)}
                  title={archiveAllowed ? 'Archive' : 'Settle all balances first'}
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

                <button
                  type="button"
                  onClick={() => onDelete(expense.id)}
                  title="Delete"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
                  </svg>
                </button>
              </>
            )
          )}
        </div>
      </td>
    </tr>
  );
}
