import { useState } from 'react';
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
}

export default function ChoresPage({ userId }: ChoresPageProps) {
  const { groups } = useGroups(userId);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const groupId = selectedGroupId ?? groups[0]?.id ?? null;

  const { chores, addChore, removeChore, toggleChore } = useChores(groupId);
  const { members } = useMembers(groupId);

  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Add chore form state
  const [choreName, setChoreName] = useState('');
  const [choreFrequency, setChoreFrequency] = useState('Daily');
  const [choreAssignee, setChoreAssignee] = useState('');

  const visibleChores = chores.filter(c => {
    if (statusFilter === 'completed') return Boolean(c.is_completed);
    if (statusFilter === 'pending') return !c.is_completed;
    return true;
  });

  const choreToRemove = chores.find(c => c.id === confirmRemoveId);

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
                value={groupId ?? ''}
                onChange={e => setSelectedGroupId(e.target.value)}
                className="py-2.5 text-sm"
              >
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
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
            <Button size="sm" onClick={() => setShowModal(true)}>+ Add chore</Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="-mx-2">
          {visibleChores.map(c => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-2 py-4 rounded-2xl hover:bg-purple-50/70 dark:hover:bg-purple-900/20 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className={`h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0
                  ${c.is_completed
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-purple-200/60 dark:bg-purple-900/40 text-purple-800 dark:text-purple-100'}`}>
                  <span className="text-lg">{c.icon || (c.is_completed ? '✓' : '•')}</span>
                </span>
                <div className="min-w-0">
                  <p className={`text-base font-semibold truncate ${c.is_completed ? 'text-purple-900/60 dark:text-purple-100/60 line-through' : 'text-purple-900 dark:text-purple-100'}`}>
                    {c.name}
                  </p>
                  <p className="text-sm text-purple-700/70 dark:text-purple-200/70 mt-0.5">{c.frequency}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <div className="w-24 flex justify-end shrink-0">
                  <Badge variant="violet">{c.profiles?.name ?? 'Unknown'}</Badge>
                </div>
                <div className="w-24 flex justify-center shrink-0">
                  {c.is_completed ? <Badge variant="green">Completed</Badge> : <Badge variant="orange">Pending</Badge>}
                </div>

                {/* Checkbox toggle */}
                <button
                  type="button"
                  title={c.is_completed ? 'Mark undone' : 'Mark done'}
                  onClick={() => toggleChore(c.id, !c.is_completed)}
                  className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-150 shrink-0
                    ${c.is_completed
                      ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600'
                      : 'bg-white dark:bg-transparent border-purple-300 dark:border-purple-600 text-transparent hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                >
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                </button>

                {/* Remove */}
                <button
                  type="button"
                  title="Remove"
                  onClick={() => setConfirmRemoveId(c.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg
                    text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
                  </svg>
                </button>
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
              {members.map(m => <option key={m.id} value={m.user_id}>{m.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddChore}>Add</Button>
          </div>
        </Modal>
      )}

      {choreToRemove && (
        <Modal title="Remove chore?" onClose={() => setConfirmRemoveId(null)}>
          <p className="text-base text-purple-700/80 dark:text-purple-200/80">
            This will permanently remove{' '}
            <span className="font-semibold text-purple-900 dark:text-purple-100">"{choreToRemove.name}"</span>{' '}
            from the list.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setConfirmRemoveId(null)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemoveChore}
            >
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
