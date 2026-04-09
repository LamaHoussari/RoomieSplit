import React from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import Button from '../components/Button'

export default function Groups() {
  const { snapshot, loading, error } = useAdminDashboard();

  if (loading) return <div className="p-6">Loading groups...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading groups: {error}</div>;

  return (
    <>
      <PageHeader 
        eyebrow="Administration" 
        title="Groups Management" 
        subtitle="Manage all groups here: view, edit, or assign users to groups." 
      />
      
      <Card title="Groups">
        <table className="w-full text-left mt-2">
          <thead>
            <tr className="border-b border-stone-100 dark:border-slate-800">
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Group</th>
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
            {snapshot?.groups.map((group) => (
              <tr key={group.id}>
                <td className="py-4 text-stone-900 dark:text-white font-medium">{group.name}</td>
                <td className="py-4 text-right">
                  <Button>
                    View
                  </Button>
                  <Button >
                    Archive
                  </Button>
                </td>
              </tr>
            ))}
            {!snapshot?.groups.length && (
              <tr>
                <td colSpan={2} className="py-6 text-center text-stone-500">No groups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}