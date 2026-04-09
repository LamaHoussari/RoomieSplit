import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { Input } from '../components/FormField';

export default function Users() {
  const { snapshot, loading, error } = useAdminDashboard();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = useMemo(() => {
    if (!snapshot?.profiles) return [];
    if (!searchQuery.trim()) return snapshot.profiles;
    
    const query = searchQuery.toLowerCase();
    return snapshot.profiles.filter(p => 
      (p.name?.toLowerCase() || '').includes(query) || 
      (p.email?.toLowerCase() || '').includes(query)
    );
  }, [snapshot?.profiles, searchQuery]);

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading users: {error}</div>;

  return (
    <>
      <PageHeader 
        eyebrow="Administration" 
        title="Users Management" 
        subtitle="Manage all users here: view, edit, or deactivate users." 
        filters={
          <div className="w-64">
            <Input 
              type="search" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 text-sm"
            />
          </div>
        }
      />
      <Card title="Users">
        <div className="space-y-4 pt-2">
          {filteredProfiles.map(profile => (
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
          {!filteredProfiles.length && (
            <div className="text-center text-stone-500 py-4">
              {searchQuery ? "No matching users found." : "No users found."}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}