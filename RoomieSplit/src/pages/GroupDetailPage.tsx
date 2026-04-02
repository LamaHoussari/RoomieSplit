import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { useMembers } from '../hooks/useMembers';
import { useExpenses } from '../hooks/useExpenses';
import { useSettlements } from '../hooks/useSettlements';
import { getGroupById } from '../services/groupService';
import type { Group } from '../types/Group';
import type { Expense } from '../types/Expense';
import type { Settlement } from '../types/Settlement';

const getInitials = (name?: string) =>
  (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

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

interface GroupDetailPageProps {
  userId: string;
}

export default function GroupDetailPage(_props: GroupDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const groupId = id ?? null;

  const [group, setGroup] = useState<Group | null>(null);
  useEffect(() => {
    if (!groupId) return;
    getGroupById(groupId).then(({ data }) => setGroup(data));
  }, [groupId]);

  const { members } = useMembers(groupId);
  const { expenses } = useExpenses(groupId);
  const { settlements } = useSettlements(groupId);

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalSettled = settlements.reduce((s, st) => s + Number(st.paid || 0), 0);
  const formatMoney = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 text-base font-semibold text-purple-700 hover:text-purple-900 dark:text-purple-200 dark:hover:text-white mb-6 transition-colors"
        onClick={() => navigate('/groups')}
      >
        <span className="h-9 w-9 rounded-2xl bg-white/70 dark:bg-purple-950/40 border border-purple-100/80 dark:border-purple-900/60 shadow-sm flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M11.78 4.22a.75.75 0 0 1 0 1.06L7.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        Back to Groups
      </button>

      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold text-purple-900 dark:text-purple-100 tracking-tight">
          {group?.name ?? 'Loading...'}
        </h1>
        <p className="text-base text-purple-700/70 dark:text-purple-200/70 mt-2">
          {members.length} members · Created {group?.created_at ?? ''}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Members" className="overflow-hidden">
          <div className="-mx-2">
            {members.map(m => {
              const balance = computeBalance(m.user_id, expenses, settlements);
              const name = m.profiles?.name ?? 'Unknown';
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-purple-50/70 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <Avatar initials={getInitials(name)} colorClass={m.color_class || ''} />
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-purple-900 dark:text-purple-100 truncate">
                      {name}
                    </p>
                    <p className="text-sm text-purple-700/70 dark:text-purple-200/70">
                      {m.role === 'admin' ? 'Admin' : 'Member'}
                    </p>
                  </div>
                  <span
                    className={`ml-auto font-semibold text-base ${
                      balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                    }`}
                  >
                    {balance > 0 ? '+' : ''}${Math.abs(balance)}
                  </span>
                </div>
              );
            })}
          </div>

          <Button variant="outline" size="sm" className="mt-4">
            + Invite member
          </Button>
        </Card>

        <Card title="Group Stats">
          {[
            { label: 'Total Expenses', value: `$${formatMoney(totalExpenses)}`, color: 'text-purple-900 dark:text-purple-100' },
            { label: 'Expenses Count', value: String(expenses.length), color: 'text-purple-900 dark:text-purple-100' },
            { label: 'Settled', value: `$${formatMoney(totalSettled)}`, color: 'text-emerald-600 dark:text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="flex justify-between py-3">
              <span className="text-base text-purple-700/70 dark:text-purple-200/70">{s.label}</span>
              <span className={`font-semibold text-base ${s.color}`}>{s.value}</span>
            </div>
          ))}

          <div className="mt-6 pt-5 border-t border-purple-100/80 dark:border-purple-900/60">
            <p className="text-sm font-medium text-purple-700/70 dark:text-purple-200/70">Invite code</p>
            <div className="mt-2 inline-flex items-center rounded-2xl px-4 py-2 bg-purple-100/70 dark:bg-purple-900/30 border border-purple-200/70 dark:border-purple-900/60 text-purple-900 dark:text-purple-100 font-semibold">
              {group?.code ?? '—'}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
