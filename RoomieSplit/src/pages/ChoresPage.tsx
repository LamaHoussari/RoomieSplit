import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input, Select } from '../components/FormField';
import { MOCK_CHORES, MOCK_MEMBERS } from '../data/mockData';
import type { Chore } from '../types/Chore';

interface ChoreItem extends Chore {
  id: number;
  completed: boolean;
}

export default function ChoresPage() {
  const [chores, setChores] = useState<ChoreItem[]>(() =>
    MOCK_CHORES.map((c, idx) => ({ id: idx + 1, ...c, completed: idx % 4 === 0 }))
  );
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);

  const visibleChores = chores.filter(c => {
    if (statusFilter === 'completed') return Boolean(c.completed);
    if (statusFilter === 'pending') return !c.completed;
    return true;
  });

  const choreToRemove = chores.find(c => c.id === confirmRemoveId);

  return (
    <>
      <PageHeader
        title="Chores"
        subtitle="Track household tasks and assignments"
        actions={
          <>
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
                  ${c.completed
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-purple-200/60 dark:bg-purple-900/40 text-purple-800 dark:text-purple-100'}`}>
                  <span className="text-lg">{c.icon || (c.completed ? '✓' : '•')}</span>
                </span>
                <div className="min-w-0">
                  <p className={`text-base font-semibold truncate ${c.completed ? 'text-purple-900/60 dark:text-purple-100/60 line-through' : 'text-purple-900 dark:text-purple-100'}`}>
                    {c.name}
                  </p>
                  <p className="text-sm text-purple-700/70 dark:text-purple-200/70 mt-0.5">{c.freq}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <div className="w-24 flex justify-end shrink-0">
                  <Badge variant="violet">{c.assigned}</Badge>
                </div>
                <div className="w-24 flex justify-center shrink-0">
                  {c.completed ? <Badge variant="green">Completed</Badge> : <Badge variant="orange">Pending</Badge>}
                </div>

                {/* Checkbox toggle */}
                <button
                  type="button"
                  title={c.completed ? 'Mark undone' : 'Mark done'}
                  onClick={() => setChores(chores.map(x => x.id === c.id ? { ...x, completed: !x.completed } : x))}
                  className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-150 shrink-0
                    ${c.completed
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
            <Input placeholder="e.g. Take out trash" />
          </FormField>
          <FormField label="Frequency">
            <Select>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </Select>
          </FormField>
          <FormField label="Assigned to">
            <Select>
              {MOCK_MEMBERS.map(m => <option key={m.name}>{m.name}</option>)}
            </Select>
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setShowModal(false)}>Add</Button>
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
              onClick={() => {
                setChores(chores.filter(x => x.id !== confirmRemoveId));
                setConfirmRemoveId(null);
              }}
            >
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
