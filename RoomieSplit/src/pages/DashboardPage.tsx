import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import MetricCard from '../components/MetricCard';
import { Select } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import { useMembers } from '../hooks/useMembers';
import { useSettlements } from '../hooks/useSettlements';
import { useProfile } from '../hooks/useProfile';
import { computeMemberBalance } from '../lib/finance';
import { Skeleton, SkeletonCard, SkeletonRow } from '../components/Skeleton';

const getInitials = (name?: string) =>
  (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

interface DashboardPageProps {
  userId: string;
  chosenGroup: string;
  setChosenGroup: (id: string) => void;
}

export default function DashboardPage({ userId, chosenGroup, setChosenGroup }: DashboardPageProps) {
  const navigate = useNavigate();
  const { groups, loading: groupsLoading } = useGroups(userId);
  const allGroupIds = useMemo(() => groups.map(group => group.id), [groups]);
  const groupId = chosenGroup || null;
  const { name } = useProfile(userId);

  const { expenses, loading: expensesLoading } = useExpenses(groupId, allGroupIds);
  const { members, loading: membersLoading } = useMembers(groupId, allGroupIds);
  const { settlements, loading: settlementsLoading } = useSettlements(groupId, allGroupIds);

  const dataLoading = groupsLoading || expensesLoading || membersLoading || settlementsLoading;

  const totalSpend = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const myBalance = computeMemberBalance(userId, settlements);

  const formatMoney = (value: number) =>
    '$' + Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle={name ? `Welcome back, ${name}. Here's the clearest view of what needs attention across your home.` : 'Here is the clearest view of what needs attention across your home.'}
        filters={
          <div className="w-48">
            <Select value={chosenGroup} onChange={e => setChosenGroup(e.target.value)} className="py-2.5 text-sm">
              <option value="">All Groups</option>
              {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
            </Select>
          </div>
        }
      />

      {dataLoading ? (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rs-panel p-6">
              <Skeleton className="mb-4 h-5 w-32" />
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
            <div className="rs-panel p-6">
              <Skeleton className="mb-4 h-5 w-24" />
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={myBalance > 0 ? 'You are owed' : myBalance < 0 ? 'You owe' : 'You are settled'}
              value={formatMoney(myBalance)}
              detail={myBalance > 0 ? 'Collect what is outstanding.' : myBalance < 0 ? 'Clear what you still owe.' : 'No open personal balance right now.'}
              tone={myBalance > 0 ? 'success' : myBalance < 0 ? 'danger' : 'neutral'}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M16.5 7.5c0-1.933-2.015-3.5-4.5-3.5S7.5 5.567 7.5 7.5 9.515 11 12 11s4.5 1.567 4.5 3.5S14.485 18 12 18s-4.5-1.567-4.5-3.5" />
                </svg>
              }
            />
            <MetricCard
              label="Total spend"
              value={formatMoney(totalSpend)}
              detail={`${expenses.length} expenses recorded.`}
              tone="accent"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 15h5" />
                </svg>
              }
            />
            <MetricCard
              label="Active groups"
              value={String(groups.length)}
              detail="Shared homes on this account."
              tone="warning"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a4 4 0 1 1 8 0" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              }
            />
            <MetricCard
              label="People involved"
              value={String(members.length)}
              detail="Balances update as expenses and settlements change."
              tone="neutral"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card
              eyebrow="Recent activity"
              title="Latest expenses"
              description="The most recent shared charges."
              action={
                <Button variant="outline" size="sm" onClick={() => navigate('/expenses')}>
                 See all
                </Button>
              }
            >
              {expenses.length === 0 ? (
                <p className="py-8 text-sm text-stone-500 dark:text-slate-400">
                  No expenses have been recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {expenses.slice(0, 4).map(expense => (
                    <div
                      key={expense.id}
                      className="flex items-start justify-between gap-4 border border-stone-200/70 bg-white/58 px-4 py-4 transition hover:border-[#ddd0e9] hover:bg-[#faf7fd] dark:border-slate-800/70 dark:bg-slate-950/26 dark:hover:border-[#4a375e] dark:hover:bg-[#211a2a]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-950 dark:text-white">
                          {expense.description}
                        </p>
                        <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">
                          {expense.date} · paid by {expense.profiles?.name ?? 'Unknown'}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-xl font-semibold text-stone-950 dark:text-white">
                        ${expense.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              eyebrow="People"
              title="Current balances"
              description="Who is ahead, who still owes, and who is fully settled."
            >
              {members.length === 0 ? (
                <p className="py-8 text-sm text-stone-500 dark:text-slate-400">
                  Add a group to start seeing member balances.
                </p>
              ) : (
                <div className="space-y-3">
                  {members.map(member => {
                    const balance = computeMemberBalance(member.user_id, settlements);
                    const memberName = member.profiles?.name ?? 'Unknown';

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 border border-stone-200/70 bg-white/58 px-4 py-4 transition hover:border-[#ddd0e9] hover:bg-[#faf7fd] dark:border-slate-800/70 dark:bg-slate-950/26 dark:hover:border-[#4a375e] dark:hover:bg-[#211a2a]"
                      >
                        <Avatar initials={getInitials(memberName)} colorClass={member.color_class || ''} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-950 dark:text-white">
                            {memberName}
                          </p>
                          <p className="text-sm text-stone-500 dark:text-slate-400">
                            {balance > 0 ? 'Is owed' : balance < 0 ? 'Owes' : 'Fully settled'}
                          </p>
                        </div>
                        <span
                          className={`ml-auto font-display text-xl font-semibold ${
                            balance > 0 ? 'text-emerald-700 dark:text-emerald-300' : balance < 0 ? 'text-red-700 dark:text-red-300' : 'text-stone-500 dark:text-slate-400'
                          }`}
                        >
                          {balance > 0 ? '+' : balance < 0 ? '-' : ''}${Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
