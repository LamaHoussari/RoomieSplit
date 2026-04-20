import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import MetricCard from '../components/MetricCard';
import FormField, { Input, Select } from '../components/FormField';
import ChoreRow from '../components/ChoreRow';
import { useGroups } from '../hooks/useGroups';
import { useChores } from '../hooks/useChores';
import { useMembers } from '../hooks/useMembers';
import { SkeletonRow } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

interface ChoresPageProps {
  userId: string;
  chosenGroup: string;
  setChosenGroup: (id: string) => void;
}

export default function ChoresPage({ userId, chosenGroup, setChosenGroup }: ChoresPageProps) {
  const { groups } = useGroups(userId);
  const allGroupIds = useMemo(() => groups.map(g => g.id), [groups]);
  const groupId = chosenGroup || null;
  const [showArchived, setShowArchived] = useState(false);

  const {
    chores,
    loading,
    error,
    successMessage,
    addChore,
    archiveChore,
    unarchiveChore,
    removeChore,
    toggleChore,
  } = useChores(groupId, allGroupIds, showArchived);
  const { members } = useMembers(groupId, allGroupIds);

  const currentMember = members.find(member => member.user_id === userId);
  const isAdmin = currentMember?.role === 'admin';

  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [choreSort, setChoreSort] = useState('name-asc');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [confirmUnarchiveId, setConfirmUnarchiveId] = useState<string | null>(null);

  const [choreName, setChoreName] = useState('');
  const [choreFrequency, setChoreFrequency] = useState('Daily');
  const [choreAssignee, setChoreAssignee] = useState('');

  const visibleChores = chores.filter(chore => {
    if (statusFilter === 'completed') return Boolean(chore.is_completed);
    if (statusFilter === 'pending') return !chore.is_completed;
    return true;
  });

  const sortedChores = useMemo(() => {
    const [key, dir] = choreSort.split('-') as [string, string];
    return [...visibleChores].sort((a, b) => {
      let cmp = 0;
      switch (key) {
        case 'name': cmp = (a.name ?? '').localeCompare(b.name ?? ''); break;
        case 'frequency': {
          const order: Record<string, number> = { Daily: 0, Weekly: 1, 'Bi-weekly': 2, Monthly: 3 };
          cmp = (order[a.frequency] ?? 99) - (order[b.frequency] ?? 99);
          break;
        }
        case 'assignee': {
          const nameA = members.find(m => m.user_id === a.assigned_to)?.profiles?.name ?? 'zzz';
          const nameB = members.find(m => m.user_id === b.assigned_to)?.profiles?.name ?? 'zzz';
          cmp = nameA.localeCompare(nameB);
          break;
        }
        case 'status': cmp = (a.is_completed ? 1 : 0) - (b.is_completed ? 1 : 0); break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  }, [visibleChores, choreSort, members]);

  const {
    pageItems: paginatedChores,
    currentPage: chorePage,
    totalPages: choreTotalPages,
    totalItems: choreTotalItems,
    pageSize: chorePageSize,
    hasNextPage: choreHasNext,
    hasPrevPage: choreHasPrev,
    goToPage: choreGoToPage,
    setPageSize: choreSetPageSize,
  } = usePagination(sortedChores);

  const choreToRemove = chores.find(chore => chore.id === confirmRemoveId);
  const choreToArchive = chores.find(chore => chore.id === confirmArchiveId);
  const choreToUnarchive = chores.find(chore => chore.id === confirmUnarchiveId);
  const pendingCount = chores.filter(chore => !chore.is_completed).length;
  const completedCount = chores.filter(chore => chore.is_completed).length;
  const assignedCount = chores.filter(chore => Boolean(chore.assigned_to)).length;

  const handleAddChore = async () => {
    if (!choreName.trim() || !groupId) return;
    const success = await addChore({
      group_id: groupId,
      name: choreName.trim(),
      frequency: choreFrequency,
      assigned_to: choreAssignee || null,
      created_by: userId,
    });
    if (success) {
      setShowModal(false);
      setChoreName('');
      setChoreFrequency('Daily');
      setChoreAssignee('');
    }
  };

  const handleRemoveChore = async () => {
    if (!confirmRemoveId) return;
    await removeChore(confirmRemoveId);
    setConfirmRemoveId(null);
  };

  const handleArchiveChore = async () => {
    if (!confirmArchiveId) return;
    const success = await archiveChore(confirmArchiveId);
    if (success) setConfirmArchiveId(null);
  };

  const handleUnarchiveChore = async () => {
    if (!confirmUnarchiveId) return;
    const success = await unarchiveChore(confirmUnarchiveId);
    if (success) setConfirmUnarchiveId(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Household flow"
        title="Chores"
        subtitle={showArchived ? 'Archived household tasks' : 'Track household tasks and assignments'}
        filters={
          <>
            <div className="w-44">
              <Select
                value={chosenGroup}
                onChange={e => setChosenGroup(e.target.value)}
                className="py-2.5 text-sm"
              >
                <option value="">All Groups</option>
                {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
              </Select>
            </div>
            <div className="w-44">
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="py-2.5 text-sm"
              >
                <option value="all">All chores</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div className="w-44">
              <Select
                value={choreSort}
                onChange={e => setChoreSort(e.target.value)}
                className="py-2.5 text-sm"
              >
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="frequency-asc">Frequency ↑</option>
                <option value="frequency-desc">Frequency ↓</option>
                <option value="assignee-asc">Assignee A–Z</option>
                <option value="status-asc">Pending first</option>
                <option value="status-desc">Completed first</option>
              </Select>
            </div>
          </>
        }
        actions={
          <>
            <Button
              variant={showArchived ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowArchived(current => !current)}
            >
              {showArchived ? 'Back to active' : 'See archived'}
            </Button>
            {!showArchived && (
              <div className="group/add relative">
                <Button size="sm" onClick={() => setShowModal(true)} disabled={!groupId}>+ Add chore</Button>
                {!groupId && (
                  <span className="pointer-events-none absolute -bottom-9 right-0 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/add:opacity-100 dark:bg-gray-700">
                    Select a group first
                  </span>
                )}
              </div>
            )}
          </>
        }
      />

      {(error || successMessage) && (
        <div className={`mb-6 rs-alert ${error ? 'rs-alert-error' : 'rs-alert-success'}`}>
          {error || successMessage}
        </div>
      )}

      {showArchived && (
        <div className="mb-4 rs-alert rs-alert-warning">Archived chores stay out of the active task list until restored.</div>
      )}

      {!showArchived && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Pending" value={String(pendingCount)} detail="Still needs attention." tone="warning" />
          <MetricCard label="Completed" value={String(completedCount)} detail="Already checked off." tone="success" />
          <MetricCard label="Assigned" value={String(assignedCount)} detail="Currently owned by a roommate." tone="accent" />
        </div>
      )}

      <Card
        eyebrow={showArchived ? 'History' : 'Task list'}
        title={showArchived ? 'Archived chores' : 'Active chores'}
        description={showArchived ? 'Restore chores here if they belong back in the working rotation.' : 'Sort, complete, archive, and rebalance task ownership from one list.'}
        className={`overflow-hidden ${
          showArchived
            ? 'border-amber-200/80 bg-amber-50/55 dark:border-amber-900/30 dark:bg-amber-950/10'
            : ''
        }`}
      >
        <div className="-mx-2">
          {loading ? (
            <div className="space-y-2 py-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : visibleChores.length === 0 ? (
            <p className="py-12 text-center text-sm text-stone-400 dark:text-slate-500">
              {showArchived ? 'No archived chores.' : 'No chores yet. Add one to get started!'}
            </p>
          ) : (
          paginatedChores.map(chore => (
            <ChoreRow
              key={chore.id}
              chore={chore}
              members={members}
              userId={userId}
              isAdmin={isAdmin}
              showArchived={showArchived}
              onToggleDone={toggleChore}
              onArchive={() => setConfirmArchiveId(chore.id)}
              onUnarchive={() => setConfirmUnarchiveId(chore.id)}
              onRemove={() => setConfirmRemoveId(chore.id)}
            />
          ))
          )}
        </div>

        <Pagination
          currentPage={chorePage}
          totalPages={choreTotalPages}
          totalItems={choreTotalItems}
          pageSize={chorePageSize}
          hasNextPage={choreHasNext}
          hasPrevPage={choreHasPrev}
          onPageChange={choreGoToPage}
          onPageSizeChange={choreSetPageSize}
        />
      </Card>

      {showModal && (
        <Modal title="Add Chore" onClose={() => setShowModal(false)}>
          <form onSubmit={e => { e.preventDefault(); handleAddChore(); }}>
          <FormField label="Chore name">
            <Input placeholder="e.g. Take out trash" value={choreName} onChange={e => setChoreName(e.target.value)} />
          </FormField>
          <FormField label="Frequency">
            <Select value={choreFrequency} onChange={e => setChoreFrequency(e.target.value)}>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
            </Select>
          </FormField>
          <FormField label="Assigned to">
            <Select value={choreAssignee} onChange={e => setChoreAssignee(e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(member => <option key={member.id} value={member.user_id}>{member.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" type="submit">Add</Button>
          </div>
          </form>
        </Modal>
      )}

      {choreToRemove && (
        <Modal title="Remove chore?" onClose={() => setConfirmRemoveId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleRemoveChore(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will permanently remove{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{choreToRemove.name}"</span>{' '}
            from the list.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmRemoveId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" type="submit">
              Remove
            </Button>
          </div>
          </form>
        </Modal>
      )}

      {choreToArchive && (
        <Modal title="Archive chore?" onClose={() => setConfirmArchiveId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleArchiveChore(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will hide{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{choreToArchive.name}"</span>{' '}
            from the active chore list.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmArchiveId(null)}>Cancel</Button>
            <Button size="sm" type="submit">Archive</Button>
          </div>
          </form>
        </Modal>
      )}

      {choreToUnarchive && (
        <Modal title="Restore chore?" onClose={() => setConfirmUnarchiveId(null)}>
          <form onSubmit={e => { e.preventDefault(); handleUnarchiveChore(); }}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will move{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{choreToUnarchive.name}"</span>{' '}
            back into the active chore list.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirmUnarchiveId(null)}>Cancel</Button>
            <Button size="sm" type="submit">Unarchive</Button>
          </div>
          </form>
        </Modal>
      )}
    </>
  );
}

