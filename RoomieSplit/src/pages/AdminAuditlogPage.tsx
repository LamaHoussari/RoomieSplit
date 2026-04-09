import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

export default function AuditLog() {
  const { snapshot, loading, error } = useAdminDashboard();

  const auditEvents = useMemo(() => {
    if (!snapshot) return [];

    const getProfile = (id: string | undefined | null) => 
      snapshot.profiles.find(p => p.id === id);

    const expensesEvents = snapshot.expenses.map(e => {
      const p = getProfile(e.created_by);
      return {
        id: `exp-${e.id}`,
        timestamp: new Date(e.created_at || Date.now()),
        email: p?.email || 'System',
        action: 'Created expense',
        target: e.description || 'Unknown Expense'
      };
    });

    const choresEvents = snapshot.chores.map(c => {
      const p = getProfile(c.created_by);
      return {
        id: `chore-${c.id}`,
        timestamp: new Date(c.created_at || Date.now()),
        email: p?.email || 'System',
        action: 'Created chore',
        target: c.name || 'Unknown Chore'
      };
    });

    const settlementsEvents = snapshot.settlements.map(s => {
      const p = getProfile(s.from_user_id);
      return {
        id: `set-${s.id}`,
        timestamp: new Date(s.created_at || Date.now()),
        email: p?.email || 'System',
        action: 'Updated balance',
        target: s.groups?.name || 'Group Balance'
      };
    });

    const allEvents = [...expensesEvents, ...choresEvents, ...settlementsEvents]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return allEvents;
  }, [snapshot]);

  if (loading) return <div className="p-6">Loading audit events...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading audit log: {error}</div>;

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
                  {event.timestamp.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
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