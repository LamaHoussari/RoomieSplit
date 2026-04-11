import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { SkeletonRow } from '../components/Skeleton';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { Input } from '../components/FormField';
import Button from '../components/Button';
import type { Profile } from '../types/Profile';

type UserDetailsModalProps = {
  user: Profile;
  onClose: () => void;
};

type ConfirmDeactivateModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "No activity";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No activity";
  return parsed.toLocaleDateString();
}

const UserDetailsModal = ({ user, onClose }: UserDetailsModalProps) => {
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

        <Button onClick={onClose} variant="outline" className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
};

const ConfirmDeactivateModal = ({ onConfirm, onCancel, isLoading }: ConfirmDeactivateModalProps) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isLoading ? onCancel : undefined} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-2 text-stone-900 dark:text-white">Confirm Deactivation</h2>
        <p className="text-sm text-stone-600 dark:text-slate-400 mb-6">
          Are you sure you want to deactivate this user? They will immediately lose access to the platform and their active sessions will be terminated.
        </p>

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger" className="flex-1" disabled={isLoading}>
            {isLoading ? 'Deactivating...' : 'Yes, Deactivate'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Users() {
  const { snapshot, loading, deactivateUser, activateUser } = useAdminDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [userToDeactivateId, setUserToDeactivateId] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivateClick = (id: string) => {
    setUserToDeactivateId(id);
  };

  const confirmDeactivation = async () => {
    if (!userToDeactivateId) return;
    setIsDeactivating(true);
    await deactivateUser(userToDeactivateId);
    setIsDeactivating(false);
    setUserToDeactivateId(null);
    setSelectedProfileId(null); // Close user details modal if it's open as well
  };

  const handleActivate = async (id: string) => {
    await activateUser(id);
  };

  const profiles = snapshot?.profiles ?? [];
  const filteredProfiles = !searchQuery.trim()
    ? profiles
    : profiles.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
      (p.name?.toLowerCase() || '').includes(query) || 
      (p.email?.toLowerCase() || '').includes(query)
        );
      });

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  if (loading) {
    return (
      <>
        <PageHeader
          eyebrow="Administration"
          title="Users Management"
          subtitle="Manage all users here: view, edit, or deactivate users."
        />
        <Card title="Users">
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </Card>
      </>
    );
  }

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
          {filteredProfiles.map(profile => {
            const isActive = profile.is_active !== false;

            return (
              <div
                key={profile.id}
                className={`flex justify-between items-center p-3 border rounded-lg transition-colors ${
                  isActive 
                    ? 'border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800/50' 
                    : 'border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 opacity-75'
                }`}
              >
                <div>
                  <p className="text-stone-900 dark:text-white font-medium">{profile.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{profile.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <Badge variant="purple">ACTIVE</Badge>
                  ) : (
                    <Badge variant="red">DEACTIVATED</Badge>
                  )}
                  
                  <Button size="sm" variant="outline" onClick={() => setSelectedProfileId(profile.id)}>View</Button>
                  
                  {isActive ? (
                    <Button size="sm" variant="danger" onClick={() => handleDeactivateClick(profile.id)}>Deactivate</Button>
                  ) : (
                    <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => handleActivate(profile.id)}>Activate</Button>
                  )}
                </div>
              </div>
            );
          })}
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
        />
      )}

      {userToDeactivateId && (
        <ConfirmDeactivateModal
          isLoading={isDeactivating}
          onConfirm={confirmDeactivation}
          onCancel={() => setUserToDeactivateId(null)}
        />
      )}
    </>
  );
}