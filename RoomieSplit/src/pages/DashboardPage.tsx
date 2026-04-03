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
import { useProfile } from '../hooks/useProfile';
import { computeMemberBalance } from '../lib/finance';

interface StatCardProps {
  label: string;
  value: string;
  colorClass: string;
  accentClass: string;
}

function StatCard({ label, value, colorClass, accentClass }: StatCardProps) {
  return (
    <div
      className={`rounded-3xl border border-stone-200/80 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] transition-shadow hover:shadow-[0_24px_56px_-34px_rgba(28,25,23,0.5)] dark:border-slate-800/70 dark:bg-slate-900/78 sm:p-7 border-l-4 ${accentClass}`}
    >
      <p className="mb-2 text-sm font-semibold text-stone-500 dark:text-slate-400">
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

  const totalSpend = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const myBalance = computeMemberBalance(userId, settlements);
  const formatMoney = (value: number) =>
    '$' + Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={name ? `Welcome, ${name}. Overview of your shared expenses.` : 'Overview of your shared expenses.'}
        actions={
          <div className="w-44">
            <Select value={chosenGroup} onChange={e => setChosenGroup(e.target.value)} className="py-2.5 text-sm">
              <option value="">All Groups</option>
              {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
            </Select>
          </div>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={myBalance > 0 ? 'You are owed' : myBalance < 0 ? 'You owe' : 'You are settled'}
          value={formatMoney(myBalance)}
          colorClass={myBalance > 0 ? 'text-emerald-600 dark:text-emerald-400' : myBalance < 0 ? 'text-red-500 dark:text-red-400' : 'text-stone-900 dark:text-slate-100'}
          accentClass={myBalance > 0 ? 'border-l-emerald-400/60 dark:border-l-emerald-400/40' : myBalance < 0 ? 'border-l-red-400/60 dark:border-l-red-400/40' : 'border-l-stone-400/70 dark:border-l-slate-500/50'}
        />
        <StatCard
          label="Total group spend"
          value={formatMoney(totalSpend)}
          colorClass="text-stone-900 dark:text-slate-100"
          accentClass="border-l-[#8c74aa]/70 dark:border-l-[#b59ad6]/45"
        />
        <StatCard
          label="Active groups"
          value={String(groups.length)}
          colorClass="text-stone-900 dark:text-slate-100"
          accentClass="border-l-amber-400/70 dark:border-l-amber-300/40"
        />
        <StatCard
          label="Total expenses"
          value={String(expenses.length)}
          colorClass="text-stone-700 dark:text-slate-300"
          accentClass="border-l-slate-400/70 dark:border-l-slate-500/50"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="My Expenses" className="overflow-hidden">
          <div className="-mx-2">
            {expenses.slice(0, 3).map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-2xl px-2 py-3 transition-colors hover:bg-stone-100/80 dark:hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-stone-900 dark:text-slate-100">
                    {expense.description}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-slate-400">
                    {expense.date} - paid by {expense.profiles?.name ?? 'Unknown'}
                  </p>
                </div>
                <span className="text-base font-semibold text-stone-800 dark:text-slate-200">
                  ${expense.amount}
                </span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/expenses')}>
            View all -&gt;
          </Button>
        </Card>

        <Card title="Balances" className="overflow-hidden">
          <div className="-mx-2">
            {members.map(member => {
              const balance = computeMemberBalance(member.user_id, settlements);
              const memberName = member.profiles?.name ?? 'Unknown';
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-stone-100/80 dark:hover:bg-white/5"
                >
                  <Avatar initials={getInitials(memberName)} colorClass={member.color_class || ''} />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-stone-900 dark:text-slate-100">
                      {memberName}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">
                      {balance > 0 ? 'is owed' : balance < 0 ? 'owes' : 'all settled'}
                    </p>
                  </div>
                  <span
                    className={`ml-auto text-base font-semibold ${
                      balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : balance < 0 ? 'text-red-500 dark:text-red-400' : 'text-stone-500 dark:text-slate-400'
                    }`}
                  >
                    {balance > 0 ? '+' : balance < 0 ? '-' : ''}${Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
