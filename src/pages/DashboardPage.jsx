import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { MOCK_EXPENSES, MOCK_MEMBERS } from '../data/mockData';

function StatCard({ label, value, colorClass }) {
  return (
    <div className="bg-white dark:bg-purple-950/80 border border-purple-100 dark:border-purple-900/60 rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-purple-400 dark:text-purple-500 mb-2">{label}</p>
      <p className={`font-display text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your shared expenses" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="You are owed"        value="$235"   colorClass="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Total group spend"   value="$1,705" colorClass="text-purple-700 dark:text-purple-300" />
        <StatCard label="Active groups"       value="2"      colorClass="text-purple-800 dark:text-purple-200" />
        <StatCard label="Expenses this month" value="8"      colorClass="text-purple-500 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Recent Expenses">
          {MOCK_EXPENSES.slice(0, 3).map(e => (
            <div key={e.id} className="flex items-center justify-between py-3 border-b border-purple-50 dark:border-purple-900/40 last:border-0">
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{e.desc}</p>
                <p className="text-xs text-purple-400 mt-0.5">{e.date} · paid by {e.payer}</p>
              </div>
              <span className="font-semibold text-sm text-purple-700 dark:text-purple-300">${e.amount}</span>
            </div>
          ))}
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/expenses')}>
            View all →
          </Button>
        </Card>

        <Card title="Balances">
          {MOCK_MEMBERS.map(m => (
            <div key={m.name} className="flex items-center gap-3 py-3 border-b border-purple-50 dark:border-purple-900/40 last:border-0">
              <Avatar initials={m.initials} colorClass={m.colorClass} />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{m.name}</p>
                <p className="text-xs text-purple-400">{m.balance > 0 ? 'is owed' : 'owes'}</p>
              </div>
              <span className={`ml-auto font-semibold text-sm ${m.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {m.balance > 0 ? '+' : ''}${Math.abs(m.balance)}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
