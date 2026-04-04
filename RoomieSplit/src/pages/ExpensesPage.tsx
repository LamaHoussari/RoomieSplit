import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
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
  return Boolean(expense.date) && expense.date > getTodayDateKey();
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
    error,
    successMessage,
    addExpense,
    archiveExpense,
    unarchiveExpense,
    removeExpense,
    editExpense,
  } = useExpenses(groupId, allGroupIds, showArchived);
  const { settlements } = useSettlements(groupId, allGroupIds, showArchived);
  const { members: selectedGroupMembers } = useMembers(groupId);
  const addMemberIds = useMemo(
    () => new Set(selectedGroupMembers.map(member => member.user_id)),
    [selectedGroupMembers],
  );
  const addFallbackPayer = selectedGroupMembers[0]?.user_id ?? userId;

  const currentMember = selectedGroupMembers.find(member => member.user_id === userId);
  const isAdmin = currentMember?.role === 'admin';

  const [showModal, setShowModal] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('all');
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
    setAddDraft(draft => sanitizeDraft(draft, addMemberIds, addFallbackPayer));
  }, [addMemberIds, addFallbackPayer]);

  useEffect(() => {
    setEditDraft(draft => sanitizeDraft(draft, editMemberIds, editFallbackPayer));
  }, [editMemberIds, editFallbackPayer]);

  const visibleExpenses = expenses.filter(expense => {
    if (showArchived) return true;
    if (expenseFilter === 'paid') return Boolean(expense.is_paid);
    if (expenseFilter === 'scheduled') return isScheduledExpense(expense);
    return true;
  });
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
    if (!editDraft.title.trim() || Number.isNaN(rawAmount) || !editingId) return;
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
    if (!addDraft.title.trim() || Number.isNaN(rawAmount) || !groupId) return;
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
    if (!confirmDeleteId) return;
    const success = await removeExpense(confirmDeleteId);
    if (success) setConfirmDeleteId(null);
  };

  const handleArchive = async () => {
    if (!confirmArchiveId) return;
    const success = await archiveExpense(confirmArchiveId);
    if (success) setConfirmArchiveId(null);
  };

  const handleUnarchive = async () => {
    if (!confirmUnarchiveId) return;
    const success = await unarchiveExpense(confirmUnarchiveId);
    if (success) setConfirmUnarchiveId(null);
  };

  const canManageExpense = (expense: typeof expenses[number]) =>
    isAdmin || expense.created_by === userId || expense.payer_id === userId;

  return (
    <>
      <PageHeader
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
        <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
          error
            ? 'border-red-200/80 bg-red-50/70 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300'
            : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300'
        }`}>
          {error || successMessage}
        </div>
      )}

      {showArchived && (
        <h2 className="mb-4 text-lg font-display font-semibold text-amber-700 dark:text-amber-300">
          Archived Expenses
        </h2>
      )}

      {!showArchived && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-stone-200/80 border-l-4 border-l-[#8c74aa]/70 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:border-l-[#b59ad6]/45 dark:bg-slate-900/78">
            <p className="mb-2 text-sm font-semibold text-stone-500 dark:text-slate-400">Total spend</p>
            <p className="font-display text-3xl font-extrabold tracking-tight text-stone-900 dark:text-slate-100">${formatMoney(totalAmount)}</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">{expenses.length} expenses</p>
          </div>
          <div className="rounded-3xl border border-stone-200/80 border-l-4 border-l-violet-400/70 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:border-l-violet-300/40 dark:bg-slate-900/78">
            <p className="mb-2 text-sm font-semibold text-stone-500 dark:text-slate-400">Scheduled</p>
            <p className="font-display text-3xl font-extrabold tracking-tight text-violet-600 dark:text-violet-400">${formatMoney(scheduledAmount)}</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">{scheduledExpenses.length} items</p>
          </div>
          <div className="rounded-3xl border border-stone-200/80 border-l-4 border-l-emerald-400/70 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:border-l-emerald-400/40 dark:bg-slate-900/78">
            <p className="mb-2 text-sm font-semibold text-stone-500 dark:text-slate-400">Paid</p>
            <p className="font-display text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">${formatMoney(paidAmount)}</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">{expenses.filter(expense => expense.is_paid).length} items</p>
          </div>
        </div>
      )}

      <Card
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
                  'Title',
                  'Paid by',
                  'Date',
                  'Split',
                  'Status',
                  'Amount',
                  '',
                ].map((header, i) => (
                  <th
                    key={header || i}
                    className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400
                      ${i === 6 ? 'w-[180px] min-w-[180px]' : ''}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleExpenses.map(expense => {
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
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              canManageExpense(expense)
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                                : 'cursor-not-allowed text-stone-300 dark:text-slate-700'
                            }`}
                          >
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
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
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                              >
                                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.586 3.586a2 2 0 1 1 2.828 2.828L7 15.828 3 17l1.172-4L13.586 3.586Z" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmArchiveId(expense.id)}
                                title={archiveAllowed ? 'Archive' : 'Settle all balances first'}
                                disabled={!archiveAllowed}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                  archiveAllowed
                                    ? 'text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                                    : 'cursor-not-allowed text-stone-300 dark:text-slate-700'
                                }`}
                              >
                                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h14M5 4.5h10a1 1 0 0 1 1 1v2H4v-2a1 1 0 0 1 1-1Zm0 3v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7m-7 3h4" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(expense.id)}
                                title="Delete"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                              >
                                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
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
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal title="Add Expense" onClose={() => setShowModal(false)}>
          <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
          <FormField label="Title">
            <Input value={addDraft.title} onChange={e => setAddDraft(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Electric bill" />
          </FormField>
          <FormField label="Amount ($)">
            <Input type="number" value={addDraft.amount} onChange={e => setAddDraft(d => ({ ...d, amount: e.target.value }))} placeholder="0.00" />
          </FormField>
          <FormField label="Paid by">
            <Select value={addDraft.payer} onChange={e => setAddDraft(d => ({ ...d, payer: e.target.value }))}>
              {selectedGroupMembers.map(member => <option key={member.id} value={member.user_id}>{member.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
            <DatePicker value={addDraft.date} onChange={date => setAddDraft(d => ({ ...d, date }))} />
          </FormField>
          <FormField label="Split between">
            <SplitPicker value={addDraft.splitUserIds} onChange={splitUserIds => setAddDraft(d => ({ ...d, splitUserIds }))} members={selectedGroupMembers} />
          </FormField>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" type="submit">Add</Button>
          </div>
          </form>
        </Modal>
      )}

      {editingExpense && (
        <Modal title="Edit Expense" onClose={() => setEditingId(null)}>
          <form onSubmit={e => { e.preventDefault(); saveEdit(); }}>
          <FormField label="Title">
            <Input value={editDraft.title} onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Electric bill" />
          </FormField>
          <FormField label="Amount ($)">
            <Input type="number" value={editDraft.amount} onChange={e => setEditDraft(d => ({ ...d, amount: e.target.value }))} placeholder="0.00" />
          </FormField>
          <FormField label="Paid by">
            <Select value={editDraft.payer} onChange={e => setEditDraft(d => ({ ...d, payer: e.target.value }))}>
              {editMembers.map(member => <option key={member.id} value={member.user_id}>{member.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
            <DatePicker value={editDraft.date} onChange={date => setEditDraft(d => ({ ...d, date }))} />
          </FormField>
          <FormField label="Split between">
            <SplitPicker value={editDraft.splitUserIds} onChange={splitUserIds => setEditDraft(d => ({ ...d, splitUserIds }))} members={editMembers} />
          </FormField>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button size="sm" type="submit">Save</Button>
          </div>
          </form>
        </Modal>
      )}

      {expenseToDelete && (
        <Modal title="Delete expense?" onClose={() => setConfirmDeleteId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleDelete(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will permanently remove{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{expenseToDelete.description}"</span>{' '}
            from the list.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" type="submit">
              Delete
            </Button>
          </div>
          </form>
        </Modal>
      )}

      {expenseToArchive && (
        <Modal title="Archive expense?" onClose={() => setConfirmArchiveId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleArchive(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will hide{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{expenseToArchive.description}"</span>{' '}
            and any linked balances from the active lists.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmArchiveId(null)}>Cancel</Button>
            <Button size="sm" type="submit">
              Archive
            </Button>
          </div>
          </form>
        </Modal>
      )}

      {expenseToUnarchive && (
        <Modal title="Restore expense?" onClose={() => setConfirmUnarchiveId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleUnarchive(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will move{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{expenseToUnarchive.description}"</span>{' '}
            back into the active expenses list and restore its linked balances.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmUnarchiveId(null)}>Cancel</Button>
            <Button size="sm" type="submit">
              Unarchive
            </Button>
          </div>
          </form>
        </Modal>
      )}
    </>
  );
}
