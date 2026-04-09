import React from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

export default function Users() {
  const { snapshot, loading, error } = useAdminDashboard();

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading users: {error}</div>;

  return (
    <>
      <PageHeader 
        eyebrow="Administration" 
        title="Users Management" 
        subtitle="Manage all users here: view, edit, or deactivate users." 
      />
      <Card title="Users">
        <div className="space-y-4 pt-2">
          {snapshot?.profiles.map(profile => (
            <div
              key={profile.id}
              className="flex justify-between items-center"
            >
              <div>
                <p className="text-stone-900 dark:text-white font-medium">{profile.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{profile.email}</p>
              </div>
              <Badge variant="purple">ACTIVE</Badge>
            </div>
          ))}
          {!snapshot?.profiles.length && (
            <div className="text-center text-stone-500 py-4">No users found.</div>
          )}
        </div>
      </Card>
    </>
  );
}