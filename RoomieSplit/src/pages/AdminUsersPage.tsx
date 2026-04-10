import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { Input } from '../components/FormField';
import Button from '../components/Button';

function formatDate(value: string | null | undefined) {
  if (!value) return "No activity";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No activity";
  return parsed.toLocaleDateString();
}

const UserDetailsModal = ({ user, onClose, onDeactivate }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-1 text-stone-900 dark:text-white">{user.name || 'Unknown'}</h2>
        <div className="space-y-2 text-sm text-stone-600 dark:text-slate-400 mb-6">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
          <p><strong>Date Added:</strong> {formatDate(user.created_at)}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onDeactivate(user.id)} variant="danger" className="w-full">
            Deactivate
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Users() {
  const { snapshot, loading, error } = useAdminDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const filteredProfiles = useMemo(() => {
    if (!snapshot?.profiles) return [];
    if (!searchQuery.trim()) return snapshot.profiles;
    
    const query = searchQuery.toLowerCase();
    return snapshot.profiles.filter(p => 
      (p.name?.toLowerCase() || '').includes(query) || 
      (p.email?.toLowerCase() || '').includes(query)
    );
  }, [snapshot?.profiles, searchQuery]);

  const selectedProfile = useMemo(() => {
    return snapshot?.profiles.find(p => p.id === selectedProfileId);
  }, [snapshot?.profiles, selectedProfileId]);

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
        <div className="space-y-3 pt-2">
          {filteredProfiles.map(profile => (
            <div
              key={profile.id}
              className="flex justify-between items-center p-3 border border-stone-200 dark:border-slate-800 rounded-lg hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div>
                <p className="text-stone-900 dark:text-white font-medium">{profile.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{profile.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="purple">ACTIVE</Badge>
                <Button size="sm" variant="outline" onClick={() => setSelectedProfileId(profile.id)}>View</Button>
                <Button size="sm" variant="danger" onClick={() => console.log('Deactivate', profile.id)}>Deactivate</Button>
              </div>
            </div>
          ))}
          {!filteredProfiles.length && (
            <div className="text-center text-stone-500 py-4">
              {searchQuery ? "No matching users found." : "No users found."}
            </div>
          )}
        </div>
      </Card>

      {selectedProfile && (
        <UserDetailsModal 
          user={selectedProfile} 
          onClose={() => setSelectedProfileId(null)} 
          onDeactivate={(id: string) => {
            console.log('Deactivate', id);
          }}
        />
      )}
    </>
  );
}