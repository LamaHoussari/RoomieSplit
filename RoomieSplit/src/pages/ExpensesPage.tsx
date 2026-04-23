import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import MetricCard from '../components/MetricCard';
import FormField, { Input, Select } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import { useMembers } from '../hooks/useMembers';
import { useSettlements } from '../hooks/useSettlements';
import type { Expense } from '../types/Expense';
import type { GroupMember } from '../types/Member';
import type { Settlement } from '../types/Settlement';
import DatePicker from '../components/DatePicker';
import { isSettlementSettled, roundCurrency, splitAmountEvenly } from '../lib/finance';
import { SkeletonCard, SkeletonTableRow } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

interface ExpenseDraft {
  title: string;
  amount: string;
  payer: string;
  date: string;
  splitUserIds: string[];
}

interface ExpensesPageProps {
  userId: string;
  chosenGroup: string;
  setChosenGroup: (id: string) => void;
}

const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

function isScheduledExpense(expense: Pick<Expense, 'is_paid' | 'date'>) {
  return Boolean(expense.date) && expense.date > getTodayDateKey() && !expense.is_paid;
}

const memberHue = (name: string) => {
  let hue = 0;
  for (let i = 0; i < name.length; i++) hue = (hue * 31 + name.charCodeAt(i)) % 360;
  return hue;
};

const getInitials = (name: string) => name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();

function sanitizeDraft(
  draft: ExpenseDraft,
  memberIds: Set<string>,
  fallbackPayer: string,
) {
  if (!memberIds.size) return draft;

  const payer = memberIds.has(draft.payer) ? draft.payer : fallbackPayer;
  const splitUserIds = [...new Set(draft.splitUserIds.filter(id => memberIds.has(id)))];
  const nextSplitUserIds = splitUserIds.length ? splitUserIds : [payer];

  if (payer === draft.payer && nextSplitUserIds.join('|') === draft.splitUserIds.join('|')) {
    return draft;
  }

  return {
    ...draft,
    payer,
    splitUserIds: nextSplitUserIds,
  };
}

function SplitPicker({ value, onChange, members }: { value: string[]; onChange: (v: string[]) => void; members: GroupMember[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map(member => {
        const name = member.profiles?.name ?? 'Unknown';
        const active = value.includes(member.user_id);
        const hue = memberHue(name);
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onChange(active ? value.filter(id => id !== member.user_id) : [...value, member.user_id])}
            className={[
              'flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-sm font-medium transition-all duration-150 select-none',
              active
                ? 'border-[#6f4f8b] bg-[#6f4f8b] text-white shadow-sm dark:border-[#4a375e] dark:bg-[#2b2136] dark:text-[#e2d4f0]'
                : 'border-stone-200/80 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-100/80 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-800/80',
            ].join(' ')}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
              style={{
                background: active ? 'rgba(255,255,255,0.22)' : `hsl(${hue},55%,88%)`,
                color: active ? '#fff' : `hsl(${hue},45%,35%)`,
              }}
            >
              {getInitials(name)}
            </span>
            {name}
            {active && (
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 opacity-80">
                <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06L6.25 10.69l6.47-6.47a.75.75 0 0 1 1.06 0Z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

function getExpenseStatus(
  expense: Expense,
  settlementsByExpenseId: Map<string, Settlement[]>,
) {
  const splitUserIds = [
    ...new Set(
      (expense.expense_splits ?? [])
        .map(split => split.user_id)
        .filter(userId => userId && userId !== expense.payer_id),
    ),
  ];
  const totalPayments = splitUserIds.length;
  const linkedSettlements = settlementsByExpenseId.get(expense.id) ?? [];
  const settlementsByUserId = new Map(
    linkedSettlements.map(settlement => [settlement.from_user_id, settlement]),
  );
  const completedPayments = splitUserIds.filter(userId => {
    const settlement = settlementsByUserId.get(userId);
    return settlement ? isSettlementSettled(settlement) : false;
  }).length;

  if (isScheduledExpense(expense)) {
    return {
      detail: `Scheduled for ${expense.date}`,
      label: 'Scheduled',
      variant: 'violet' as const,
    };
  }

  if (!totalPayments) {
    return {
      detail: 'Nothing to collect',
      label: 'No balances',
      variant: 'violet' as const,
    };
  }

  if (!expense.is_paid) {
    return {
      detail: `0/${totalPayments} payments done`,
      label: 'Expense unpaid',
      variant: 'orange' as const,
    };
  }

  if (completedPayments === totalPayments) {
    return {
      detail: `${completedPayments}/${totalPayments} payments done`,
      label: 'Settled',
      variant: 'green' as const,
    };
  }

  if (completedPayments > 0) {
    return {
      detail: `${completedPayments}/${totalPayments} payments done`,
      label: 'In progress',
      variant: 'purple' as const,
    };
  }

  return {
    detail: `0/${totalPayments} payments done`,
    label: 'Pending',
    variant: 'orange' as const,
  };
}

function canArchiveExpense(
  expense: Expense,
  settlementsByExpenseId: Map<string, Settlement[]>,
) {
  if (!expense.is_paid) {
    return false;
  }

  const owingSplitUserIds = [
    ...new Set(
      (expense.expense_splits ?? [])
        .filter(
          (split) =>
            split.user_id !== expense.payer_id &&
            roundCurrency(split.share_amount ?? 0) > 0,
        )
        .map((split) => split.user_id),
    ),
  ];

  if (!owingSplitUserIds.length) {
    return true;
  }

  const settlementsByUserId = new Map(
    (settlementsByExpenseId.get(expense.id) ?? []).map((settlement) => [
      settlement.from_user_id,
      settlement,
    ]),
  );

  return owingSplitUserIds.every((userId) => {
    const settlement = settlementsByUserId.get(userId);
    return settlement ? isSettlementSettled(settlement) : false;
  });
}

export default function ExpensesPage({ userId, chosenGroup, setChosenGroup }: ExpensesPageProps) {
  const { groups } = useGroups(userId);
  const allGroupIds = useMemo(() => groups.map(g => g.id), [groups]);
  const groupId = chosenGroup || null;
  const [showArchived, setShowArchived] = useState(false);

  const {
    expenses,
    loading: expensesLoading,
    saving: expensesSaving,
    error,
    successMessage,
    addExpense,
    archiveExpense,
    unarchiveExpense,
    removeExpense,
    editExpense,
  } = useExpenses(groupId, allGroupIds, showArchived);
  const { settlements, loading: settlementsLoading } = useSettlements(groupId, allGroupIds, showArchived);
  const { members: selectedGroupMembers, loading: membersLoading } = useMembers(groupId);

  const dataLoading = expensesLoading || settlementsLoading || membersLoading;
  const addMemberIds = useMemo(
    () => new Set(selectedGroupMembers.map(member => member.user_id)),
    [selectedGroupMembers],
  );
  const addFallbackPayer = selectedGroupMembers[0]?.user_id ?? userId;

  const currentMember = selectedGroupMembers.find(member => member.user_id === userId);
  const isAdmin = currentMember?.role === 'admin';

  const [showModal, setShowModal] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('all');
  const [sortKey, setSortKey] = useState<'title' | 'payer' | 'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ExpenseDraft>({ title: '', amount: '', payer: '', date: '', splitUserIds: [] });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [confirmUnarchiveId, setConfirmUnarchiveId] = useState<string | null>(null);
  const [addDraft, setAddDraft] = useState<ExpenseDraft>({ title: '', amount: '', payer: userId, date: '', splitUserIds: [userId] });
  const editingExpense = expenses.find(expense => expense.id === editingId);
  const editGroupId = editingExpense?.group_id ?? null;
  const { members: editMembers } = useMembers(editGroupId);
  const editMemberIds = useMemo(
    () => new Set(editMembers.map(member => member.user_id)),
    [editMembers],
  );
  const editFallbackPayer = editMembers[0]?.user_id ?? userId;

  useEffect(() => {
    async function updateAddDraft() {
      setAddDraft(draft => sanitizeDraft(draft, addMemberIds, addFallbackPayer));
    }
    updateAddDraft( );
  }, [addMemberIds, addFallbackPayer]);

  useEffect(() => {
    async function updateEditDraft() {
      setEditDraft(draft => sanitizeDraft(draft, editMemberIds, editFallbackPayer));
    }
    updateEditDraft();
  }, [editMemberIds, editFallbackPayer]);

  const visibleExpenses = expenses.filter(expense => {
    if (showArchived) return true;
    if (expenseFilter === 'paid') return Boolean(expense.is_paid);
    if (expenseFilter === 'scheduled') return isScheduledExpense(expense);
    return true;
  });

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortedExpenses = useMemo(() => {
    const sorted = [...visibleExpenses].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'title': cmp = (a.description ?? '').localeCompare(b.description ?? ''); break;
        case 'payer': cmp = (a.profiles?.name ?? '').localeCompare(b.profiles?.name ?? ''); break;
        case 'date': cmp = (a.date ?? '').localeCompare(b.date ?? ''); break;
        case 'amount': cmp = Number(a.amount || 0) - Number(b.amount || 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [visibleExpenses, sortKey, sortDir]);
  const {
    pageItems: paginatedExpenses,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage,
    hasPrevPage,
    goToPage,
    setPageSize,
  } = usePagination(sortedExpenses);

  const settlementsByExpenseId = useMemo(() => {
    const grouped = new Map<string, typeof settlements>();

    for (const settlement of settlements) {
      if (!settlement.expense_id) continue;
      grouped.set(settlement.expense_id, [
        ...(grouped.get(settlement.expense_id) ?? []),
        settlement,
      ]);
    }

    return grouped;
  }, [settlements]);

  const formatMoney = (value: number | string) =>
    Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const paidAmount = expenses.reduce((sum, expense) => sum + (expense.is_paid ? Number(expense.amount || 0) : 0), 0);
  const scheduledExpenses = expenses.filter(expense => isScheduledExpense(expense));
  const scheduledAmount = scheduledExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );

  const expenseToDelete = expenses.find(expense => expense.id === confirmDeleteId);
  const expenseToArchive = expenses.find(expense => expense.id === confirmArchiveId);
  const expenseToUnarchive = expenses.find(expense => expense.id === confirmUnarchiveId);

  const openEdit = (expense: typeof expenses[0]) => {
    setEditingId(expense.id);
    setEditDraft({
      title: expense.description || '',
      amount: String(expense.amount ?? ''),
      payer: expense.payer_id || userId,
      date: expense.date || '',
      splitUserIds: expense.expense_splits?.length
        ? expense.expense_splits.map(split => split.user_id)
        : [expense.payer_id || userId],
    });
  };

  const saveEdit = async () => {
    const rawAmount = Number(editDraft.amount);
    const amount = roundCurrency(rawAmount);
    if (expensesSaving || !editDraft.title.trim() || Number.isNaN(rawAmount) || !editingId) return;
    const success = await editExpense(
      editingId,
      { description: editDraft.title.trim(), amount, payer_id: editDraft.payer, date: editDraft.date },
      splitAmountEvenly(amount, editDraft.splitUserIds).map(split => ({
        expense_id: editingId,
        ...split,
      })),
    );
    if (success) setEditingId(null);
  };

  const handleAdd = async () => {
    const rawAmount = Number(addDraft.amount);
    const amount = roundCurrency(rawAmount);
    if (expensesSaving || !addDraft.title.trim() || Number.isNaN(rawAmount) || !groupId) return;
    const success = await addExpense(
      { group_id: groupId, description: addDraft.title.trim(), amount, payer_id: addDraft.payer, created_by: userId, date: addDraft.date },
      splitAmountEvenly(amount, addDraft.splitUserIds),
    );
    if (success) {
      setAddDraft({ title: '', amount: '', payer: addFallbackPayer, date: '', splitUserIds: [addFallbackPayer] });
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    if (expensesSaving || !confirmDeleteId) return;
    const success = await removeExpense(confirmDeleteId);
    if (success) setConfirmDeleteId(null);
  };

  const handleArchive = async () => {
    if (expensesSaving || !confirmArchiveId) return;
    const success = await archiveExpense(confirmArchiveId);
    if (success) setConfirmArchiveId(null);
  };

  const handleUnarchive = async () => {
    if (expensesSaving || !confirmUnarchiveId) return;
    const success = await unarchiveExpense(confirmUnarchiveId);
    if (success) setConfirmUnarchiveId(null);
  };

  const canManageExpense = (expense: typeof expenses[number]) =>
    isAdmin || expense.created_by === userId || expense.payer_id === userId;

  return (
    <>
      <PageHeader
        eyebrow="Shared ledger"
        title="Expenses"
        subtitle={showArchived ? 'Archived shared expenses' : 'All shared expenses'}
        filters={
          <>
            <div className="w-44">
              <Select value={chosenGroup} onChange={e => setChosenGroup(e.target.value)} className="py-2.5 text-sm">
                <option value="">All Groups</option>
                {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
              </Select>
            </div>
            {!showArchived && (
              <div className="w-44">
                <Select value={expenseFilter} onChange={e => setExpenseFilter(e.target.value)} className="py-2.5 text-sm">
                  <option value="all">All expenses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="paid">Paid</option>
                </Select>
              </div>
            )}
          </>
        }
        actions={
          <>
            <Button
              variant={showArchived ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowArchived(current => !current)}
            >
              {showArchived ? 'Back to active' : 'See archived'}
            </Button>
            {!showArchived && (
              <div className="group/add relative">
                <Button size="sm" onClick={() => setShowModal(true)} disabled={!groupId}>+ Add expense</Button>
                {!groupId && (
                  <span className="pointer-events-none absolute -bottom-9 right-0 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/add:opacity-100 dark:bg-gray-700">
                    Select a group first
                  </span>
                )}
              </div>
            )}
          </>
        }
      />

      {(error || successMessage) && (
        <div className={`mb-6 rs-alert ${error ? 'rs-alert-error' : 'rs-alert-success'}`}>
          {error || successMessage}
        </div>
      )}

      {showArchived && (
        <div className="mb-4 rs-alert rs-alert-warning">Archived expenses are hidden from the active ledger and totals.</div>
      )}

      {!showArchived && (
        dataLoading ? (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="Total spend"
            value={`$${formatMoney(totalAmount)}`}
            detail={`${expenses.length} expenses recorded.`}
            tone="accent"
          />
          <MetricCard
            label="Scheduled"
            value={`$${formatMoney(scheduledAmount)}`}
            detail={`${scheduledExpenses.length} upcoming items.`}
            tone="warning"
          />
          <MetricCard
            label="Paid"
            value={`$${formatMoney(paidAmount)}`}
            detail={`${expenses.filter(expense => expense.is_paid).length} items already covered.`}
            tone="success"
          />
        </div>
        )
      )}

      <Card
        eyebrow={showArchived ? 'History' : 'Ledger'}
        title={showArchived ? 'Archived expense ledger' : 'Expense ledger'}
        description={showArchived ? 'Restore archived items when they need to return to the active ledger.' : 'Sort the ledger, track progress, and manage expenses from one place.'}
        className={`overflow-hidden ${
          showArchived
            ? 'border-amber-200/80 bg-amber-50/55 dark:border-amber-900/30 dark:bg-amber-950/10'
            : ''
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr
                className={`border-b ${
                  showArchived
                    ? 'border-amber-200/80 bg-amber-100/70 dark:border-amber-900/30 dark:bg-amber-950/20'
                    : 'border-stone-200/80 bg-stone-100/70 dark:border-slate-800 dark:bg-slate-800/60'
                }`}
              >
                {[
                  { label: 'Title', key: 'title' as const },
                  { label: 'Paid by', key: 'payer' as const },
                  { label: 'Date', key: 'date' as const },
                  { label: 'Split', key: null },
                  { label: 'Status', key: null },
                  { label: 'Amount', key: 'amount' as const },
                  { label: '', key: null },
                ].map((col, i) => (
                  <th
                    key={col.label || i}
                    className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400
                      ${i === 6 ? 'w-[180px] min-w-[180px]' : ''} ${col.key ? 'cursor-pointer select-none hover:text-stone-700 dark:hover:text-slate-200' : ''}`}
                    onClick={col.key ? () => toggleSort(col.key!) : undefined}
                  >
                    {col.label}
                    {col.key && sortKey === col.key && (
                      <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)
              ) : (
              paginatedExpenses.map(expense => {
                const status = getExpenseStatus(expense, settlementsByExpenseId);
                const archiveAllowed = canArchiveExpense(expense, settlementsByExpenseId);

                return (
                  <tr
                    key={expense.id}
                    className={`border-b transition-colors last:border-0 ${
                      showArchived
                        ? 'border-amber-100/90 hover:bg-amber-50/80 dark:border-amber-950/20 dark:hover:bg-amber-950/10'
                        : 'border-stone-200/60 hover:bg-stone-100/70 dark:border-slate-800/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="px-4 py-4 font-semibold text-stone-900 dark:text-slate-100">{expense.description}</td>
                    <td className="px-4 py-4"><Badge variant="purple">{expense.profiles?.name ?? 'Unknown'}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-4 text-stone-500 dark:text-slate-400">{expense.date}</td>
                    <td className="px-4 py-4 text-sm text-stone-500 dark:text-slate-400">{expense.expense_splits?.map(split => split.profiles?.name ?? 'Unknown').join(', ')}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <p className="text-xs font-medium text-stone-500 dark:text-slate-400">{status.detail}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-stone-900 dark:text-slate-100">${expense.amount}</td>
                    <td className="w-[180px] min-w-[180px] px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {showArchived ? (
                          <button
                            type="button"
                            onClick={canManageExpense(expense) ? () => setConfirmUnarchiveId(expense.id) : undefined}
                            title={canManageExpense(expense) ? 'Unarchive' : 'Only the expense owner or an admin can unarchive this expense'}
                            disabled={!canManageExpense(expense)}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                              canManageExpense(expense)
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                                : 'cursor-not-allowed text-stone-300 dark:text-slate-700'
                            }`}
                          >
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 13V5m0 0-3 3m3-3 3 3M4 13.5v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
                            </svg>
                          </button>
                        ) : (
                          canManageExpense(expense) && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(expense)}
                                title="Edit"
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                              >
                                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.586 3.586a2 2 0 1 1 2.828 2.828L7 15.828 3 17l1.172-4L13.586 3.586Z" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmArchiveId(expense.id)}
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
                                onClick={() => setConfirmDeleteId(expense.id)}
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
              })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      {showModal && (
        <Modal title="Add Expense" onClose={() => !expensesSaving && setShowModal(false)}>
          <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
          <FormField label="Title">
            <Input value={addDraft.title} onChange={e => setAddDraft(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Electric bill" />
          </FormField>
          <FormField label="Amount ($)">
            <Input type="number" value={addDraft.amount} onChange={e => setAddDraft(d => ({ ...d, amount: e.target.value }))} placeholder="0.00" />
          </FormField>
          <FormField label="Date">
            <DatePicker value={addDraft.date} onChange={date => setAddDraft(d => ({ ...d, date }))} />
          </FormField>
          <FormField label="Paid by">
            <Select value={addDraft.payer} onChange={e => setAddDraft(d => ({ ...d, payer: e.target.value }))}>
              {selectedGroupMembers.map(member => <option key={member.id} value={member.user_id}>{member.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <FormField label="Split between">
            <SplitPicker value={addDraft.splitUserIds} onChange={splitUserIds => setAddDraft(d => ({ ...d, splitUserIds }))} members={selectedGroupMembers} />
          </FormField>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)} disabled={expensesSaving}>Cancel</Button>
            <Button size="sm" type="submit" disabled={expensesSaving}>
              {expensesSaving ? 'Adding...' : 'Add'}
            </Button>
          </div>
          </form>
        </Modal>
      )}

      {editingExpense && (
        <Modal title="Edit Expense" onClose={() => !expensesSaving && setEditingId(null)}>
          <form onSubmit={e => { e.preventDefault(); saveEdit(); }}>
          <FormField label="Title">
            <Input value={editDraft.title} onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Electric bill" />
          </FormField>
          <FormField label="Amount ($)">
            <Input type="number" value={editDraft.amount} onChange={e => setEditDraft(d => ({ ...d, amount: e.target.value }))} placeholder="0.00" />
          </FormField>
          <FormField label="Date">
            <DatePicker value={editDraft.date} onChange={date => setEditDraft(d => ({ ...d, date }))} />
          </FormField>
          <FormField label="Paid by">
            <Select value={editDraft.payer} onChange={e => setEditDraft(d => ({ ...d, payer: e.target.value }))}>
              {editMembers.map(member => <option key={member.id} value={member.user_id}>{member.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <FormField label="Split between">
            <SplitPicker value={editDraft.splitUserIds} onChange={splitUserIds => setEditDraft(d => ({ ...d, splitUserIds }))} members={editMembers} />
          </FormField>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setEditingId(null)} disabled={expensesSaving}>Cancel</Button>
            <Button size="sm" type="submit" disabled={expensesSaving}>
              {expensesSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          </form>
        </Modal>
      )}

      {expenseToDelete && (
        <Modal title="Delete expense?" onClose={() => !expensesSaving && setConfirmDeleteId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleDelete(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will permanently remove{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{expenseToDelete.description}"</span>{' '}
            from the list.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmDeleteId(null)} disabled={expensesSaving}>Cancel</Button>
            <Button variant="danger" size="sm" type="submit" disabled={expensesSaving}>
              {expensesSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
          </form>
        </Modal>
      )}

      {expenseToArchive && (
        <Modal title="Archive expense?" onClose={() => !expensesSaving && setConfirmArchiveId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleArchive(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will hide{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{expenseToArchive.description}"</span>{' '}
            and any linked balances from the active lists.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmArchiveId(null)} disabled={expensesSaving}>Cancel</Button>
            <Button size="sm" type="submit" disabled={expensesSaving}>
              {expensesSaving ? 'Archiving...' : 'Archive'}
            </Button>
          </div>
          </form>
        </Modal>
      )}

      {expenseToUnarchive && (
        <Modal title="Restore expense?" onClose={() => !expensesSaving && setConfirmUnarchiveId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleUnarchive(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will move{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{expenseToUnarchive.description}"</span>{' '}
            back into the active expenses list and restore its linked balances.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmUnarchiveId(null)} disabled={expensesSaving}>Cancel</Button>
            <Button size="sm" type="submit" disabled={expensesSaving}>
              {expensesSaving ? 'Restoring...' : 'Unarchive'}
            </Button>
          </div>
          </form>
        </Modal>
      )}
    </>
  );
}
