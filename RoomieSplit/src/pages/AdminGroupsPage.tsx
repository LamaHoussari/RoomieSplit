import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { SkeletonTableRow } from '../components/Skeleton';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import Button from '../components/Button';
import { Input } from '../components/FormField';
import type { AdminGroupMember } from '../services/adminService';
import type { Group } from '../types/Group';

type GroupDetailsModalProps = {
  group: Group;
  members: AdminGroupMember[];
  adminName: string | null;
  onClose: () => void;
};

type ConfirmArchiveModalProps = {
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString();
}

const GroupDetailsModal = ({ group, members, adminName, onClose }: GroupDetailsModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">{group.name}</h2>
          {group.description && (
            <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">{group.description}</p>
          )}
        </div>

        {/* Details */}
        <div className="px-6 py-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500 dark:text-slate-400">Created</span>
            <span className="font-medium text-stone-800 dark:text-white">{formatDate(group.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 dark:text-slate-400">Admin</span>
            <span className="font-medium text-stone-800 dark:text-white">{adminName || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 dark:text-slate-400">Members</span>
            <span className="font-medium text-stone-800 dark:text-white">{members.length}</span>
          </div>
        </div>

        {/* Members List */}
        {members.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-2">Members</p>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-slate-800">
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-white">
                      {m.profiles?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-slate-400">{m.profiles?.email || ''}</p>
                  </div>
                  <Badge variant={m.role === 'admin' ? 'violet' : 'purple'}>
                    {m.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const ConfirmArchiveModal = ({ groupName, onConfirm, onCancel, isLoading }: ConfirmArchiveModalProps) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isLoading ? onCancel : undefined} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-2 text-stone-900 dark:text-white">Archive Group</h2>
        <p className="text-sm text-stone-600 dark:text-slate-400 mb-6">
          Are you sure you want to archive <strong>"{groupName}"</strong>? This will remove it from the active groups list.
        </p>
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger" className="flex-1" disabled={isLoading}>
            {isLoading ? 'Archiving...' : 'Yes, Archive'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Groups() {
  const { snapshot, loading, archiveGroup } = useAdminDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupToArchiveId, setGroupToArchiveId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const groups = snapshot?.groups ?? [];
  const filteredGroups = !searchQuery.trim()
    ? groups
    : groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const groupToArchive = groups.find((group) => group.id === groupToArchiveId);

  const getMembersForGroup = (groupId: string) =>
    snapshot?.members.filter((m) => m.group_id === groupId) ?? [];

  const getAdminName = (groupId: string) => {
    const adminMember = snapshot?.members.find(
      (m) => m.group_id === groupId && m.role === 'admin'
    );
    return adminMember?.profiles?.name ?? null;
  };

  const confirmArchive = async () => {
    if (!groupToArchiveId) return;
    setIsArchiving(true);
    await archiveGroup(groupToArchiveId);
    setIsArchiving(false);
    setGroupToArchiveId(null);
  };

  if (loading) {
    return (
      <>
        <PageHeader
          eyebrow="Administration"
          title="Groups Management"
          subtitle="Manage all groups here: view details or archive groups."
        />
        <Card title="Groups">
          <table className="w-full text-left mt-2">
            <thead>
              <tr className="border-b border-stone-100 dark:border-slate-800">
                <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Group</th>
                <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Members</th>
                <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Created</th>
                <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
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
        eyebrow="Administration"
        title="Groups Management"
        subtitle="Manage all groups here: view details or archive groups."
        filters={
          <div className="w-64">
            <Input
              type="search"
              placeholder="Search by group name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 text-sm"
            />
          </div>
        }
      />

      <Card title="Groups">
        <table className="w-full text-left mt-2">
          <thead>
            <tr className="border-b border-stone-100 dark:border-slate-800">
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Group</th>
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Members</th>
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white">Created</th>
              <th className="pb-3 text-sm font-semibold text-stone-900 dark:text-white text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
            {filteredGroups.map((group) => {
              const members = getMembersForGroup(group.id);
              return (
                <tr key={group.id} className="hover:bg-stone-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 text-stone-900 dark:text-white font-medium">{group.name}</td>
                  <td className="py-4 text-stone-600 dark:text-slate-400 text-sm">{members.length} member{members.length !== 1 ? 's' : ''}</td>
                  <td className="py-4 text-stone-600 dark:text-slate-400 text-sm">{formatDate(group.created_at)}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedGroupId(group.id)}>
                        View
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setGroupToArchiveId(group.id)}>
                        Archive
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filteredGroups.length && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-stone-500">
                  {searchQuery ? 'No groups match your search.' : 'No groups found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          members={getMembersForGroup(selectedGroup.id)}
          adminName={getAdminName(selectedGroup.id)}
          onClose={() => setSelectedGroupId(null)}
        />
      )}

      {groupToArchive && (
        <ConfirmArchiveModal
          groupName={groupToArchive.name}
          isLoading={isArchiving}
          onConfirm={confirmArchive}
          onCancel={() => setGroupToArchiveId(null)}
        />
      )}
    </>
  );
}
