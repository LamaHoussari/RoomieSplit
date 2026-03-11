import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { MOCK_MEMBERS, MOCK_GROUPS } from '../data/mockData';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const group = MOCK_GROUPS.find(g => g.id === Number(id)) || MOCK_GROUPS[0];

  return (
    <>
      <button
        className="flex items-center gap-1 text-sm text-purple-500 dark:text-purple-400 hover:text-purple-700 mb-6 transition-colors"
        onClick={() => navigate('/groups')}
      >
        ← Back to Groups
      </button>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-purple-900 dark:text-purple-100 tracking-tight">
          {group.name}
        </h1>
        <p className="text-sm text-purple-400 mt-1">{group.members} members · Created {group.created}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Members">
          {MOCK_MEMBERS.map((m, i) => (
            <div key={m.name} className="flex items-center gap-3 py-3 border-b border-purple-50 dark:border-purple-800/40 last:border-0">
              <Avatar initials={m.initials} colorClass={m.colorClass} />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{m.name}</p>
                <p className="text-xs text-purple-400">{i === 0 ? 'Admin' : 'Member'}</p>
              </div>
              <span className={`ml-auto font-semibold text-sm ${m.balance > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {m.balance > 0 ? '+' : ''}${Math.abs(m.balance)}
              </span>
            </div>
          ))}
          <Button variant="outline" size="sm" className="mt-4">+ Invite member</Button>
        </Card>

        <Card title="Group Stats">
          {[
            { label: 'Total Expenses',  value: '$1,705', color: 'text-purple-700 dark:text-purple-300' },
            { label: 'This Month',      value: '$1,650', color: 'text-purple-700 dark:text-purple-300' },
            { label: 'Settled',         value: '$0',     color: 'text-emerald-500' },
          ].map(s => (
            <div key={s.label} className="flex justify-between py-3 border-b border-purple-50 dark:border-purple-800/40 last:border-0">
              <span className="text-sm text-purple-500 dark:text-purple-400">{s.label}</span>
              <span className={`font-semibold text-sm ${s.color}`}>{s.value}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-800/60 text-sm text-purple-400">
            Invite code:{' '}
            <span className="font-semibold text-purple-700 dark:text-purple-300">{group.code}</span>
          </div>
        </Card>
      </div>
    </>
  );
}
