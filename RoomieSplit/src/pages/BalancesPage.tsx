import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import MetricCard from '../components/MetricCard';
import FormField, { Input, Select } from '../components/FormField';
import SettlementRow from '../components/SettlementRow';
import { useGroups } from '../hooks/useGroups';
import { useMembers } from '../hooks/useMembers';
import { useSettlements } from '../hooks/useSettlements';
import type { Settlement } from '../types/Settlement';
import {
  computeMemberBalance,
  getSettlementRemaining,
  isSettlementSettled,
} from '../lib/finance';
import { SkeletonCard, SkeletonTableRow } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const memberHue = (name: string) => {
  let hue = 0;
  for (let i = 0; i < name.length; i++) hue = (hue * 31 + name.charCodeAt(i)) % 360;
  return hue;
};

const initials = (name: string) => name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
const formatMoney = (value: number) => Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 });

interface BalancesPageProps {
  userId: string;
  chosenGroup: string;
  setChosenGroup: (id: string) => void;
}

export default function BalancesPage({ userId, chosenGroup, setChosenGroup }: BalancesPageProps) {
  const { groups, loading: groupsLoading } = useGroups(userId);
  const groupId = chosenGroup || null;
  const [showArchived, setShowArchived] = useState(false);

  const { members, loading: membersLoading } = useMembers(groupId, groups);
  const {
    settlements,
    loading: settlementsLoading,
    error,
    successMessage,
    archiveSettlement,
    unarchiveSettlement,
    recordPayment,
    addSettlement,
  } = useSettlements(groupId, groups, showArchived);

  const [payTarget, setPayTarget] = useState<Settlement | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Settlement | null>(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState<Settlement | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [showNewSettlement, setShowNewSettlement] = useState(false);
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [pageFeedback, setPageFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  useEffect(() => {
    if (!pageFeedback) return;
    const id = setTimeout(() => setPageFeedback(null), 5000);
    return () => clearTimeout(id);
  }, [pageFeedback]);

  const openPay = (settlement: Settlement) => {
    if (settlement.from_user_id !== userId) {
      return;
    }
    setPayTarget(settlement);
    setPayAmount(String(getSettlementRemaining(settlement)));
  };

  const submitPay = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0 || !payTarget) return;
    const remaining = getSettlementRemaining(payTarget);
    if (amount > remaining) {
      setPageFeedback({ type: 'error', message: `Amount exceeds the remaining balance of $${formatMoney(remaining)}.` });
      return;
    }
    const success = await recordPayment(payTarget, amount, userId);
    if (success) setPayTarget(null);
  };

  const submitArchive = async () => {
    if (!archiveTarget) return;
    const success = await archiveSettlement(archiveTarget.id);
    if (success) setArchiveTarget(null);
  };

  const submitUnarchive = async () => {
    if (!unarchiveTarget) return;
    const success = await unarchiveSettlement(unarchiveTarget.id);
    if (success) setUnarchiveTarget(null);
  };

  const submitNewSettlement = async () => {
    const amount = parseFloat(newAmount);
    if (!newFrom || !newTo || !amount || amount <= 0 || !groupId) return;
    if (newFrom === newTo) return;
    const success = await addSettlement({
      group_id: groupId,
      from_user_id: newFrom,
      to_user_id: newTo,
      amount,
      paid: 0,
      created_by: userId,
    });
    if (success) {
      setShowNewSettlement(false);
      setNewFrom('');
      setNewTo('');
      setNewAmount('');
    }
  };

  const currentMember = groupId
    ? members.find(member => member.user_id === userId)
    : null;
  const isAdmin = currentMember?.role === 'admin';
  const canManageSettlement = (settlement: Settlement) =>
    isAdmin ||
    settlement.created_by === userId ||
    settlement.from_user_id === userId ||
    settlement.to_user_id === userId;
  const canPaySettlement = (settlement: Settlement) =>
    settlement.from_user_id === userId;

  const [sortKey, setSortKey] = useState<'from' | 'to' | 'amount' | 'paid' | 'status'>('amount');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortedSettlements = useMemo(() => {
    return [...settlements].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'from': cmp = (a.from_profile?.name ?? '').localeCompare(b.from_profile?.name ?? ''); break;
        case 'to': cmp = (a.to_profile?.name ?? '').localeCompare(b.to_profile?.name ?? ''); break;
        case 'amount': cmp = Number(a.amount || 0) - Number(b.amount || 0); break;
        case 'paid': cmp = Number(a.paid || 0) - Number(b.paid || 0); break;
        case 'status': cmp = (isSettlementSettled(a) ? 1 : 0) - (isSettlementSettled(b) ? 1 : 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [settlements, sortKey, sortDir]);

  const {
    pageItems: paginatedSettlements,
    currentPage: settlementPage,
    totalPages: settlementTotalPages,
    totalItems: settlementTotalItems,
    pageSize: settlementPageSize,
    hasNextPage: settlementHasNext,
    hasPrevPage: settlementHasPrev,
    goToPage: settlementGoToPage,
    setPageSize: settlementSetPageSize,
  } = usePagination(sortedSettlements);

  return (
    <>
      <PageHeader
        eyebrow="Settlement plan"
        title="Balances"
        subtitle={showArchived
          ? chosenGroup
            ? `${groups.find(group => group.id === chosenGroup)?.name ?? 'Selected group'} archived balances`
            : 'Archived balances'
          : chosenGroup
            ? (groups.find(group => group.id === chosenGroup)?.name ?? 'Select a group')
            : 'All Groups'}
        filters={
          <div className="w-44">
            <Select value={chosenGroup} onChange={e => setChosenGroup(e.target.value)} className="py-2.5 text-sm">
              <option value="">All Groups</option>
              {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
            </Select>
          </div>
        }
        actions={
          <Button
            variant={showArchived ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(current => !current)}
          >
            {showArchived ? 'Back to active' : 'See archived'}
          </Button>
        }
      />

      {(error || pageFeedback || successMessage) && (
        <div className={`mb-6 rs-alert ${error || pageFeedback?.type === 'error' ? 'rs-alert-error' : 'rs-alert-success'}`}>
          {error || pageFeedback?.message || successMessage}
        </div>
      )}

      {showArchived && (
        <div className="mb-4 rs-alert rs-alert-warning">Archived balances stay out of the active settlement plan until restored.</div>
      )}

      {!showArchived && (
        (groupsLoading || membersLoading) ? (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map(member => {
            const balance = computeMemberBalance(member.user_id, settlements);
            const name = member.profiles?.name ?? 'Unknown';
            return (
              <MetricCard
                key={member.id}
                label={name}
                value={`${balance > 0 ? '+' : balance < 0 ? '-' : ''}$${formatMoney(balance)}`}
                detail={balance > 0 ? 'Is owed' : balance < 0 ? 'Owes' : 'All settled'}
                tone={balance > 0 ? 'success' : balance < 0 ? 'danger' : 'neutral'}
              />
            );
          })}
        </div>
        )
      )}

      <div className="mt-4">
        {!showArchived && (
          <div className="group/settle relative inline-block bottom-2 left-3">
            <Button size="sm" onClick={() => { setShowNewSettlement(true); setNewFrom(''); setNewTo(''); setNewAmount(''); }} disabled={!groupId}>
              + New Settlement
            </Button>
            {!groupId && (
              <span className="pointer-events-none absolute left-38 top-1  whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/settle:opacity-100 dark:bg-gray-700">
                Select a group first
              </span>
            )}
          </div>
        )}
      </div>

      <Card
        eyebrow={showArchived ? 'History' : 'Plan'}
        title="Settlement Plan"
        description={showArchived ? 'Restore archived settlements when they belong back in the active plan.' : 'Track who owes who, record payments, and archive balances once they are fully settled.'}
        className={`overflow-hidden ${
          showArchived
            ? 'border-amber-200/80 bg-amber-50/55 dark:border-amber-900/30 dark:bg-amber-950/10'
            : ''
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <colgroup>
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-56" />
              <col className="w-28" />
              <col className="w-36" />
              <col className="w-28" />
              <col className="w-20" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr
                className={`border-b ${
                  showArchived
                    ? 'border-amber-200/80 bg-amber-100/70 dark:border-amber-900/30 dark:bg-amber-950/20'
                    : 'border-stone-200/80 bg-stone-100/70 dark:border-slate-800 dark:bg-slate-800/60'
                }`}
              >
                {[
                  { label: 'From', key: 'from' as const },
                  { label: 'To', key: 'to' as const },
                  { label: 'For', key: null },
                  { label: 'Amount', key: 'amount' as const },
                  { label: 'Paid', key: 'paid' as const },
                  { label: 'Status', key: 'status' as const },
                  { label: 'Source', key: null },
                  { label: '', key: null },
                ].map((col, i) => (
                  <th
                    key={col.label || i}
                    className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400 ${col.key ? 'cursor-pointer select-none hover:text-stone-700 dark:hover:text-slate-200' : ''}`}
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
              {settlementsLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={8} />)
              ) : (
              paginatedSettlements.map(settlement => (
                <SettlementRow
                  key={settlement.id}
                  settlement={settlement}
                  showArchived={showArchived}
                  canPaySettlement={settlement.from_user_id === userId}
                  canManageSettlement={canManageSettlement(settlement)}
                  onPay={() => openPay(settlement)}
                  onArchive={() => setArchiveTarget(settlement)}
                  onUnarchive={() => setUnarchiveTarget(settlement)}
                />
              ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={settlementPage}
          totalPages={settlementTotalPages}
          totalItems={settlementTotalItems}
          pageSize={settlementPageSize}
          hasNextPage={settlementHasNext}
          hasPrevPage={settlementHasPrev}
          onPageChange={settlementGoToPage}
          onPageSizeChange={settlementSetPageSize}
        />
      </Card>

      {showNewSettlement && (
        <Modal title="New Settlement" onClose={() => setShowNewSettlement(false)}>
          <form onSubmit={e => { e.preventDefault(); submitNewSettlement(); }}>
          <FormField label="From (who owes)">
            <Select value={newFrom} onChange={e => setNewFrom(e.target.value)}>
              <option value="">Select member</option>
              {members.map(member => <option key={member.user_id} value={member.user_id}>{member.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <FormField label="To (who is owed)">
            <Select value={newTo} onChange={e => setNewTo(e.target.value)}>
              <option value="">Select member</option>
              {members.filter(member => member.user_id !== newFrom).map(member => <option key={member.user_id} value={member.user_id}>{member.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <FormField label="Amount ($)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              placeholder="0.00"
              className="font-semibold"
            />
          </FormField>
          {newFrom && newTo && newFrom === newTo && (
            <p className="mt-1 text-sm text-red-500">From and To must be different members</p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowNewSettlement(false)}>Cancel</Button>
            <Button size="sm" type="submit" disabled={!newFrom || !newTo || newFrom === newTo || !parseFloat(newAmount)}>Create</Button>
          </div>
          </form>
        </Modal>
      )}

      {payTarget && (
        <Modal title="Record payment" onClose={() => setPayTarget(null)}>
          <form onSubmit={e => { e.preventDefault(); submitPay(); }}>
          <div className="mb-6 flex items-center gap-3">
            {[payTarget.from_profile?.name ?? 'Unknown', payTarget.to_profile?.name ?? 'Unknown'].map((name, i) => {
              const hue = memberHue(name);
              return (
                <React.Fragment key={name}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{ background: `hsl(${hue},55%,88%)`, color: `hsl(${hue},45%,35%)` }}
                    >
                      {initials(name)}
                    </span>
                    <span className="text-sm font-semibold text-stone-900 dark:text-slate-100">{name}</span>
                  </div>
                  {i === 0 && (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 shrink-0 text-stone-400 dark:text-slate-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m0 0l-4-4m4 4l-4 4" />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
            <span className="ml-auto whitespace-nowrap text-sm font-bold text-stone-900 dark:text-slate-100">
              ${formatMoney(getSettlementRemaining(payTarget))} remaining
            </span>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-slate-500">
            Amount
          </p>
          <div className="relative mb-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-stone-400 dark:text-slate-500">$</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              className="pl-8 pr-4 font-semibold"
            />
          </div>
          <p className="mb-6 text-xs text-stone-400 dark:text-slate-500">
            Remaining balance: ${formatMoney(getSettlementRemaining(payTarget))}
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setPayTarget(null)}>Cancel</Button>
            <Button size="sm" type="submit">Confirm payment</Button>
          </div>
          </form>
        </Modal>
      )}

      {archiveTarget && (
        <Modal title="Archive balance?" onClose={() => setArchiveTarget(null)}>
          <form onSubmit={e => { e.preventDefault(); submitArchive(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will hide the balance from{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">
              {archiveTarget.from_profile?.name ?? 'Unknown'}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">
              {archiveTarget.to_profile?.name ?? 'Unknown'}
            </span>
            .
          </p>
          <div className="mt-3 rounded-2xl bg-stone-100/70 px-4 py-3 text-sm text-stone-500 dark:bg-slate-800/60 dark:text-slate-400">
            For: {archiveTarget.expense?.description?.trim() || 'Manual balance'}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setArchiveTarget(null)}>Cancel</Button>
            <Button size="sm" type="submit">Archive</Button>
          </div>
          </form>
        </Modal>
      )}

      {unarchiveTarget && (
        <Modal title="Restore balance?" onClose={() => setUnarchiveTarget(null)}>
          <form onSubmit={e => { e.preventDefault(); submitUnarchive(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will move the balance from{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">
              {unarchiveTarget.from_profile?.name ?? 'Unknown'}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">
              {unarchiveTarget.to_profile?.name ?? 'Unknown'}
            </span>{' '}
            back into the active list.
          </p>
          <div className="mt-3 rounded-2xl bg-stone-100/70 px-4 py-3 text-sm text-stone-500 dark:bg-slate-800/60 dark:text-slate-400">
            For: {unarchiveTarget.expense?.description?.trim() || 'Manual balance'}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setUnarchiveTarget(null)}>Cancel</Button>
            <Button size="sm" type="submit">Unarchive</Button>
          </div>
          </form>
        </Modal>
      )}
    </>
  );
}
