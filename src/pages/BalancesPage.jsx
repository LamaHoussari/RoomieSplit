import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { MOCK_MEMBERS } from '../data/mockData';

export default function BalancesPage() {
  return (
    <>
      <PageHeader title="Balances" subtitle="Who owes whom in Hamra Flat" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {MOCK_MEMBERS.map(m => (
          <div key={m.name} className="bg-white dark:bg-purple-950 border border-purple-100 dark:border-purple-800/60 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">{m.name}</p>
            <p className={`font-display text-3xl font-extrabold ${m.balance > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {m.balance > 0 ? '+' : ''}${Math.abs(m.balance)}
            </p>
            <p className="text-xs text-purple-400 mt-1">{m.balance > 0 ? 'is owed' : 'owes'}</p>
          </div>
        ))}
      </div>

      <Card title="Settlement Plan">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 dark:border-purple-800/60">
                {['From', 'To', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-purple-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { from: 'Reem', to: 'Rand', amount: 120 },
                { from: 'Lama', to: 'Rand', amount: 115 },
              ].map(s => (
                <tr key={s.from} className="border-b border-purple-50 dark:border-purple-800/30 last:border-0">
                  <td className="py-4 px-4"><Badge variant="red">{s.from}</Badge></td>
                  <td className="py-4 px-4"><Badge variant="purple">{s.to}</Badge></td>
                  <td className="py-4 px-4 font-semibold text-purple-700 dark:text-purple-300">${s.amount}</td>
                  <td className="py-4 px-4"><Badge variant="orange">Pending</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
