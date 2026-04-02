import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { Select } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import { useMembers } from '../hooks/useMembers';
import { useSettlements } from '../hooks/useSettlements';
import type { Expense } from '../types/Expense';
import type { Settlement } from '../types/Settlement';
import { useProfile } from '../hooks/useProfile';

interface StatCardProps {
  label: string;
  value: string;
  colorClass: string;
  accentClass: string;
}

function StatCard({ label, value, colorClass, accentClass }: StatCardProps) {
  return (
    <div
      className={`bg-white/90 dark:bg-purple-950/70 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow
      border-l-4 ${accentClass}`}
    >
      <p className="text-sm font-semibold text-purple-700/70 dark:text-purple-200/70 mb-2">
        {label}
      </p>
      <p className={`font-display text-4xl font-extrabold tracking-tight ${colorClass}`}>
        {value}
      </p>
    </div>
  );
}

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

interface DashboardPageProps {
  userId: string;
  chosenGroup: string;
  setChosenGroup: (id: string) => void;
}

export default function DashboardPage({ userId, chosenGroup, setChosenGroup }: DashboardPageProps) {
  const navigate = useNavigate();
  const { groups } = useGroups(userId);
  const allGroupIds = useMemo(() => groups.map(g => g.id), [groups]);
  const groupId = chosenGroup || null;
  
  const { name } = useProfile(userId);

  const { expenses } = useExpenses(groupId, allGroupIds);
  const { members } = useMembers(groupId, allGroupIds);
  const { settlements } = useSettlements(groupId, allGroupIds);

  const totalSpend = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const myBalance = computeBalance(userId, expenses, settlements);
  const formatMoney = (v: number) => '$' + Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <>
      <PageHeader
        title="Dashboard"
         subtitle={name ? `Welcome, ${name} 👋 
          Overview of your shared expenses` : "Overview of your shared expenses"}
        actions={
          <div className="w-44">
            <Select value={chosenGroup} onChange={e => setChosenGroup(e.target.value)} className="py-2.5 text-sm">
              <option value="">All Groups</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={myBalance >= 0 ? 'You are owed' : 'You owe'}
          value={formatMoney(myBalance)}
          colorClass={myBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}
          accentClass={myBalance >= 0 ? 'border-l-emerald-400/60 dark:border-l-emerald-400/40' : 'border-l-red-400/60 dark:border-l-red-400/40'}
        />
        <StatCard
          label="Total group spend"
          value={formatMoney(totalSpend)}
          colorClass="text-purple-800 dark:text-purple-200"
          accentClass="border-l-purple-400/60 dark:border-l-purple-400/40"
        />
        <StatCard
          label="Active groups"
          value={String(groups.length)}
          colorClass="text-purple-900 dark:text-purple-100"
          accentClass="border-l-violet-400/60 dark:border-l-violet-400/40"
        />
        <StatCard
          label="Total expenses"
          value={String(expenses.length)}
          colorClass="text-purple-700 dark:text-purple-300"
          accentClass="border-l-fuchsia-400/60 dark:border-l-fuchsia-400/40"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="My Expenses" className="overflow-hidden">
          <div className="-mx-2">
            {expenses.slice(0, 3).map(e => (
              <div
                key={e.id}
                className="flex items-center justify-between px-2 py-3 rounded-2xl hover:bg-purple-50/70 dark:hover:bg-purple-900/20 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-base font-semibold text-purple-900 dark:text-purple-100 truncate">
                    {e.description}
                  </p>
                  <p className="text-sm text-purple-600/70 dark:text-purple-300/70 mt-0.5">
                    {e.date} · paid by {e.profiles?.name ?? 'Unknown'}
                  </p>
                </div>
                <span className="font-semibold text-base text-purple-800 dark:text-purple-200">
                  ${e.amount}
                </span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/expenses')}>
            View all →
          </Button>
        </Card>

        <Card title="Balances" className="overflow-hidden">
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
                    <p className="text-sm text-purple-600/70 dark:text-purple-300/70">
                      {balance > 0 ? 'is owed' : 'owes'}
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
        </Card>
      </div>
    </>
  );
}
