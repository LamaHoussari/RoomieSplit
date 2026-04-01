import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Select } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { useMembers } from '../hooks/useMembers';
import { useExpenses } from '../hooks/useExpenses';
import { useSettlements } from '../hooks/useSettlements';
import type { Expense } from '../types/Expense';
import type { Settlement } from '../types/Settlement';

// Deterministic hue from name
const memberHue = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
};
const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

function computeBalance(userId: string, expenses: Expense[], settlements: Settlement[]): number {
  let balance = 0;
  for (const e of expenses) {
    if (e.payer_id === userId) balance += e.amount;
    const mySplit = e.expense_splits?.find(s => s.user_id === userId);
    if (mySplit?.share_amount) balance -= mySplit.share_amount;
  }
  for (const s of settlements) {
    if (s.from_user_id === userId) balance += s.paid;
    if (s.to_user_id === userId) balance -= s.paid;
  }
  return balance;
}

interface BalancesPageProps {
  userId: string;
}

export default function BalancesPage({ userId }: BalancesPageProps) {
  const { groups } = useGroups(userId);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const groupId = selectedGroupId ?? groups[0]?.id ?? null;

  const { members } = useMembers(groupId);
  const { expenses } = useExpenses(groupId);
  const { settlements, recordPayment } = useSettlements(groupId);

  const [payTarget, setPayTarget] = useState<Settlement | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const openPay = (s: Settlement) => {
    setPayTarget(s);
    setPayAmount(String(s.amount - s.paid));
  };

  const submitPay = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0 || !payTarget) return;
    const success = await recordPayment(payTarget.id, Math.min(payTarget.paid + amount, payTarget.amount));
    if (success) setPayTarget(null);
  };

  return (
    <>
      <PageHeader
        title="Balances"
        subtitle={groups.find(g => g.id === groupId)?.name ?? 'Select a group'}
        actions={
          <div className="w-44">
            <Select value={groupId ?? ''} onChange={e => setSelectedGroupId(e.target.value)} className="py-2.5 text-sm">
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </Select>
          </div>
        }
      />

      {/* Member balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {members.map(m => {
          const balance = computeBalance(m.user_id, expenses, settlements);
          const name = m.profiles?.name ?? 'Unknown';
          return (
            <div
              key={m.id}
              className="bg-white/90 dark:bg-purple-950/70 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-semibold text-purple-700/70 dark:text-purple-200/70 mb-2">{name}</p>
              <p className={`font-display text-4xl font-extrabold tracking-tight ${balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {balance > 0 ? '+' : ''}${Math.abs(balance)}
              </p>
              <p className="text-sm text-purple-700/70 dark:text-purple-200/70 mt-1">{balance > 0 ? 'is owed' : 'owes'}</p>
            </div>
          );
        })}
      </div>

      {/* Settlement table */}
      <Card title="Settlement Plan" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <colgroup>
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-36" />
              <col className="w-28" />
              <col className="w-12" />
            </colgroup>
            <thead>
              <tr className="border-b border-purple-100/80 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-900/20">
                {['From', 'To', 'Amount', 'Paid', 'Status', ''].map((h, i) => (
                  <th
                    key={h || i}
                    className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-purple-600/70 dark:text-purple-200/70"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settlements.map(s => {
                const settled = s.paid >= s.amount;
                const fromName = s.from_profile?.name ?? 'Unknown';
                const toName = s.to_profile?.name ?? 'Unknown';
                return (
                  <tr key={s.id} className="border-b border-purple-50/80 dark:border-purple-800/30 last:border-0 hover:bg-purple-50/70 dark:hover:bg-purple-900/20 transition-colors">
                    <td className="py-4 px-4"><Badge variant="red">{fromName}</Badge></td>
                    <td className="py-4 px-4"><Badge variant="purple">{toName}</Badge></td>
                    <td className="py-4 px-4 font-semibold text-purple-900 dark:text-purple-100">${s.amount}</td>
                    <td className="py-4 px-4 text-purple-700/70 dark:text-purple-200/70 whitespace-nowrap">${s.paid} / ${s.amount}</td>
                    <td className="py-4 px-4">
                      {settled ? <Badge variant="green">Settled</Badge> : <Badge variant="orange">Pending</Badge>}
                    </td>
                    <td className="py-4 px-4">
                      {!settled && (
                        <button
                          type="button"
                          onClick={() => openPay(s)}
                          title="Record payment"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 7h16M2 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2M2 7v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M6 11h.01M10 11h.01" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pay modal */}
      {payTarget && (
        <Modal title="Record payment" onClose={() => setPayTarget(null)}>

          {/* From → To summary */}
          <div className="flex items-center gap-3 mb-6">
            {[payTarget.from_profile?.name ?? 'Unknown', payTarget.to_profile?.name ?? 'Unknown'].map((name, i) => {
              const h = memberHue(name);
              return (
                <React.Fragment key={name}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0"
                      style={{ background: `hsl(${h},55%,88%)`, color: `hsl(${h},45%,35%)` }}
                    >
                      {initials(name)}
                    </span>
                    <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">{name}</span>
                  </div>
                  {i === 0 && (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 text-purple-400 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m0 0l-4-4m4 4l-4 4" />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
            <span className="ml-auto text-sm font-bold text-purple-900 dark:text-purple-100 whitespace-nowrap">
              ${payTarget.amount - payTarget.paid} remaining
            </span>
          </div>

          {/* Amount input */}
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 dark:text-purple-500 mb-2">
            Amount
          </p>
          <div className="relative mb-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 dark:text-purple-500 font-semibold text-base pointer-events-none">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-2xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 text-base font-semibold placeholder:text-purple-300 dark:placeholder:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 transition"
            />
          </div>
          <p className="text-xs text-purple-400 dark:text-purple-500 mb-6">
            Full amount: ${payTarget.amount - payTarget.paid}
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setPayTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={submitPay}>Confirm payment</Button>
          </div>
        </Modal>
      )}
    </>
  );
}

