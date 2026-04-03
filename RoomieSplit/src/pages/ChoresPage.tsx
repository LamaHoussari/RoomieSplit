import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input, Select } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { useChores } from '../hooks/useChores';
import { useMembers } from '../hooks/useMembers';

interface ChoresPageProps {
  userId: string;
  chosenGroup: string;
  setChosenGroup: (id: string) => void;
}

export default function ChoresPage({ userId, chosenGroup, setChosenGroup }: ChoresPageProps) {
  const { groups } = useGroups(userId);
  const allGroupIds = useMemo(() => groups.map(g => g.id), [groups]);
  const groupId = chosenGroup || null;

  const { chores, addChore, removeChore, toggleChore } = useChores(groupId, allGroupIds);
  const { members } = useMembers(groupId, allGroupIds);

  const currentMember = members.find(member => member.user_id === userId);
  const isAdmin = currentMember?.role === 'admin';

  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const [choreName, setChoreName] = useState('');
  const [choreFrequency, setChoreFrequency] = useState('Daily');
  const [choreAssignee, setChoreAssignee] = useState('');

  const visibleChores = chores.filter(chore => {
    if (statusFilter === 'completed') return Boolean(chore.is_completed);
    if (statusFilter === 'pending') return !chore.is_completed;
    return true;
  });

  const choreToRemove = chores.find(chore => chore.id === confirmRemoveId);

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

  return (
    <>
      <PageHeader
        title="Chores"
        subtitle="Track household tasks and assignments"
        actions={
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
            <div className="group/add relative">
              <Button size="sm" onClick={() => setShowModal(true)} disabled={!groupId}>+ Add chore</Button>
              {!groupId && (
                <span className="pointer-events-none absolute -bottom-9 right-0 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/add:opacity-100 dark:bg-gray-700">
                  Select a group first
                </span>
              )}
            </div>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="-mx-2">
          {visibleChores.map(chore => (
            <div
              key={chore.id}
              className="flex flex-col gap-4 rounded-2xl px-2 py-4 transition-colors hover:bg-stone-100/80 dark:hover:bg-white/5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl
                  ${chore.is_completed
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                    : 'bg-stone-200/80 text-stone-700 dark:bg-slate-800 dark:text-slate-200'}`}
                >
                  <span className="text-lg">{chore.icon || (chore.is_completed ? '✓' : '•')}</span>
                </span>
                <div className="min-w-0">
                  <p className={`truncate text-base font-semibold ${chore.is_completed ? 'text-stone-500 line-through dark:text-slate-400' : 'text-stone-900 dark:text-slate-100'}`}>
                    {chore.name}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-slate-400">{chore.frequency}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <div className="flex w-24 justify-end shrink-0">
                  <Badge variant="violet">{chore.profiles?.name ?? 'Unknown'}</Badge>
                </div>
                <div className="flex w-24 justify-center shrink-0">
                  {chore.is_completed ? <Badge variant="green">Completed</Badge> : <Badge variant="orange">Pending</Badge>}
                </div>

                <button
                  type="button"
                  title={chore.is_completed ? 'Mark undone' : 'Mark done'}
                  onClick={() => toggleChore(chore.id, !chore.is_completed)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150
                    ${chore.is_completed
                      ? 'border-emerald-500 bg-emerald-500 text-white hover:border-emerald-600 hover:bg-emerald-600'
                      : 'border-stone-300 bg-white text-transparent hover:border-stone-500 dark:border-slate-600 dark:bg-transparent dark:hover:border-slate-400'
                    }`}
                >
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3 w-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                </button>

                {(isAdmin || chore.created_by === userId) && (
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => setConfirmRemoveId(chore.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showModal && (
        <Modal title="Add Chore" onClose={() => setShowModal(false)}>
          <FormField label="Chore name">
            <Input placeholder="e.g. Take out trash" value={choreName} onChange={e => setChoreName(e.target.value)} />
          </FormField>
          <FormField label="Frequency">
            <Select value={choreFrequency} onChange={e => setChoreFrequency(e.target.value)}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </Select>
          </FormField>
          <FormField label="Assigned to">
            <Select value={choreAssignee} onChange={e => setChoreAssignee(e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(member => <option key={member.id} value={member.user_id}>{member.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddChore}>Add</Button>
          </div>
        </Modal>
      )}

      {choreToRemove && (
        <Modal title="Remove chore?" onClose={() => setConfirmRemoveId(null)}>
          <p className="text-base text-stone-600 dark:text-slate-300">
            This will permanently remove{' '}
            <span className="font-semibold text-stone-900 dark:text-slate-100">"{choreToRemove.name}"</span>{' '}
            from the list.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmRemoveId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleRemoveChore}>
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
