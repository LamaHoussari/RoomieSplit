import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { MOCK_EXPENSES, MOCK_MEMBERS } from '../data/mockData';

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

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your shared expenses" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="You are owed"
          value="$235"
          colorClass="text-emerald-600 dark:text-emerald-400"
          accentClass="border-l-emerald-400/60 dark:border-l-emerald-400/40"
        />
        <StatCard
          label="Total group spend"
          value="$1,705"
          colorClass="text-purple-800 dark:text-purple-200"
          accentClass="border-l-purple-400/60 dark:border-l-purple-400/40"
        />
        <StatCard
          label="Active groups"
          value="2"
          colorClass="text-purple-900 dark:text-purple-100"
          accentClass="border-l-violet-400/60 dark:border-l-violet-400/40"
        />
        <StatCard
          label="Total expenses"
          value="8"
          colorClass="text-purple-700 dark:text-purple-300"
          accentClass="border-l-fuchsia-400/60 dark:border-l-fuchsia-400/40"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="My Expenses" className="overflow-hidden">
          <div className="-mx-2">
            {MOCK_EXPENSES.slice(0, 3).map(e => (
              <div
                key={e.id}
                className="flex items-center justify-between px-2 py-3 rounded-2xl hover:bg-purple-50/70 dark:hover:bg-purple-900/20 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-base font-semibold text-purple-900 dark:text-purple-100 truncate">
                    {e.desc}
                  </p>
                  <p className="text-sm text-purple-600/70 dark:text-purple-300/70 mt-0.5">
                    {e.date} · paid by {e.payer}
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
            {MOCK_MEMBERS.map(m => (
              <div
                key={m.name}
                className="flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-purple-50/70 dark:hover:bg-purple-900/20 transition-colors"
              >
                <Avatar initials={m.initials} colorClass={m.colorClass} />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-purple-900 dark:text-purple-100 truncate">
                    {m.name}
                  </p>
                  <p className="text-sm text-purple-600/70 dark:text-purple-300/70">
                    {m.balance > 0 ? 'is owed' : 'owes'}
                  </p>
                </div>
                <span
                  className={`ml-auto font-semibold text-base ${
                    m.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {m.balance > 0 ? '+' : ''}${Math.abs(m.balance)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
