import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { SkeletonTableRow } from '../components/Skeleton';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

function parseTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

export default function AuditLog() {
  const { snapshot, loading } = useAdminDashboard();

  const auditEvents = snapshot
    ? (() => {
        const profileById = new Map(snapshot.profiles.map((profile) => [profile.id, profile]));
        const resolveEmail = (profileId: string | null | undefined) =>
          profileById.get(profileId ?? '')?.email || 'System';

        return [
          ...snapshot.expenses.map((expense) => ({
            id: `exp-${expense.id}`,
            timestamp: parseTimestamp(expense.created_at),
            email: resolveEmail(expense.created_by),
            action: 'Created expense',
            target: expense.description || 'Unknown Expense',
          })),
          ...snapshot.chores.map((chore) => ({
            id: `chore-${chore.id}`,
            timestamp: parseTimestamp(chore.created_at),
            email: resolveEmail(chore.created_by),
            action: 'Created chore',
            target: chore.name || 'Unknown Chore',
          })),
          ...snapshot.settlements.map((settlement) => ({
            id: `set-${settlement.id}`,
            timestamp: parseTimestamp(settlement.created_at),
            email: resolveEmail(settlement.from_user_id),
            action: 'Updated balance',
            target: settlement.groups?.name || 'Group Balance',
          })),
        ].sort((left, right) => {
          const leftTime = left.timestamp?.getTime() ?? 0;
          const rightTime = right.timestamp?.getTime() ?? 0;
          return rightTime - leftTime;
        });
      })()
    : [];

  if (loading) {
    return (
      <>
        <PageHeader
          eyebrow="Security"
          title="Audit Log"
          subtitle="Track all system actions performed by users and admins."
        />
        <Card title="Activity Stream">
          <table className="w-full text-left mt-2">
            <thead>
              <tr className="border-b border-stone-100 dark:border-slate-800">
                <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Timestamp</th>
                <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">User</th>
                <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Action</th>
                <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Target</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonTableRow key={i} cols={4} />
              ))}
            </tbody>
          </table>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        eyebrow="Security" 
        title="Audit Log" 
        subtitle="Track all system actions performed by users and admins." 
      />
      <Card title="Activity Stream">
        <table className="w-full text-left mt-2">
          <thead>
            <tr className="border-b border-stone-100 dark:border-slate-800">
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Timestamp</th>
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">User</th>
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Action</th>
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
            {auditEvents.map(event => (
              <tr key={event.id}>
                <td className="py-4 text-stone-500 dark:text-slate-400">
                  {event.timestamp
                    ? event.timestamp.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                    : '—'}
                </td>
                <td className="py-4 font-medium text-stone-900 dark:text-white">
                  {event.email}
                </td>
                <td className="py-4 text-stone-700 dark:text-stone-300">
                  {event.action}
                </td>
                <td className="py-4 text-stone-500 dark:text-slate-400">
                  {event.target}
                </td>
              </tr>
            ))}
            {auditEvents.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-stone-500">No events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}