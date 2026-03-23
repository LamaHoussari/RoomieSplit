import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { MOCK_MEMBERS } from '../data/mockData';

export default function BalancesPage() {
  return (
    <>
      <PageHeader title="Balances" subtitle="Who owes whom in Hamra Flat" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {MOCK_MEMBERS.map(m => (
          <div
            key={m.name}
            className="bg-white/90 dark:bg-purple-950/70 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-sm font-semibold text-purple-700/70 dark:text-purple-200/70 mb-2">{m.name}</p>
            <p className={`font-display text-4xl font-extrabold tracking-tight ${m.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {m.balance > 0 ? '+' : ''}${Math.abs(m.balance)}
            </p>
            <p className="text-sm text-purple-700/70 dark:text-purple-200/70 mt-1">{m.balance > 0 ? 'is owed' : 'owes'}</p>
          </div>
        ))}
      </div>

      <Card title="Settlement Plan" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-purple-100/80 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-900/20">
                {['From', 'To', 'Amount', 'Paid', 'Status'].map(h => (
                  <th key={h} className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-purple-600/70 dark:text-purple-200/70">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { from: 'Reem', to: 'Rand', amount: 120, paid: 0 },
                { from: 'Lama', to: 'Rand', amount: 115, paid: 0 },
              ].map(s => (
                <tr key={s.from} className="border-b border-purple-50/80 dark:border-purple-800/30 last:border-0 hover:bg-purple-50/70 dark:hover:bg-purple-900/20 transition-colors">
                  <td className="py-4 px-4"><Badge variant="red">{s.from}</Badge></td>
                  <td className="py-4 px-4"><Badge variant="purple">{s.to}</Badge></td>
                  <td className="py-4 px-4 font-semibold text-purple-900 dark:text-purple-100">${s.amount}</td>
                  <td className="py-4 px-4 text-purple-700/70 dark:text-purple-200/70 whitespace-nowrap">
                    ${s.paid} / ${s.amount}
                  </td>
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
