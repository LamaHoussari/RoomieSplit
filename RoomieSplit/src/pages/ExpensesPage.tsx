import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input, Select } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import { useMembers } from '../hooks/useMembers';
import type { GroupMember } from '../types/Member';
import DatePicker from '../components/DatePicker';

interface ExpenseDraft {
  title: string;
  amount: string;
  payer: string;
  date: string;
  splitUserIds: string[];
}

interface ExpensesPageProps {
  userId: string;
  chosenGroup: string;
  setChosenGroup: (id: string) => void;
}

// Deterministic avatar colour from name
const memberHue = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
};
const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// Reusable split picker — renders member toggle pills
function SplitPicker({ value, onChange, members }: { value: string[]; onChange: (v: string[]) => void; members: GroupMember[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map(m => {
        const name = m.profiles?.name ?? 'Unknown';
        const active = value.includes(m.user_id);
        const h = memberHue(name);
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(
              active ? value.filter(id => id !== m.user_id) : [...value, m.user_id]
            )}
            className={[
              'flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-sm font-medium transition-all duration-150 select-none',
              active
                ? 'border-purple-500 bg-purple-600 text-white shadow-sm'
                : 'border-purple-100 dark:border-purple-800 bg-white dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/40',
            ].join(' ')}
          >
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold shrink-0"
              style={{
                background: active ? 'rgba(255,255,255,0.22)' : `hsl(${h},55%,88%)`,
                color: active ? '#fff' : `hsl(${h},45%,35%)`,
              }}
            >
              {getInitials(name)}
            </span>
            {name}
            {active && (
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-80">
                <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06L6.25 10.69l6.47-6.47a.75.75 0 0 1 1.06 0Z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function ExpensesPage({ userId, chosenGroup, setChosenGroup }: ExpensesPageProps) {
  const { groups } = useGroups(userId);
  const allGroupIds = useMemo(() => groups.map(g => g.id), [groups]);
  const groupId = chosenGroup || null;

  const { expenses, addExpense, removeExpense, editExpense, togglePaid } = useExpenses(groupId, allGroupIds);
  const { members } = useMembers(groupId, allGroupIds);

  const currentMember = members.find(m => m.user_id === userId);
  const isAdmin = currentMember?.role === 'admin';

  const [showModal, setShowModal] = useState(false);
  const [paidFilter, setPaidFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ExpenseDraft>({ title: '', amount: '', payer: '', date: '', splitUserIds: [] });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [addDraft, setAddDraft] = useState<ExpenseDraft>({ title: '', amount: '', payer: userId, date: '', splitUserIds: [] });

  const visibleExpenses = expenses.filter(e => {
    if (paidFilter === 'paid') return Boolean(e.is_paid);
    if (paidFilter === 'unpaid') return !e.is_paid;
    return true;
  });

  const formatMoney = (value: number | string) =>
    Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const paidAmount = expenses.reduce((sum, e) => sum + (e.is_paid ? Number(e.amount || 0) : 0), 0);
  const unpaidAmount = totalAmount - paidAmount;

  const expenseToDelete = expenses.find(e => e.id === confirmDeleteId);
  const editingExpense = expenses.find(e => e.id === editingId);

  const openEdit = (expense: typeof expenses[0]) => {
    setEditingId(expense.id);
    setEditDraft({
      title: expense.description || '',
      amount: String(expense.amount ?? ''),
      payer: expense.payer_id || userId,
      date: expense.date || '',
      splitUserIds: expense.expense_splits?.map(s => s.user_id) ?? [],
    });
  };

  const saveEdit = async () => {
    const amount = Number(editDraft.amount);
    if (!editDraft.title.trim() || Number.isNaN(amount) || !editingId || !groupId) return;
    const splitCount = editDraft.splitUserIds.length || 1;
    const success = await editExpense(
      editingId,
      { description: editDraft.title.trim(), amount, payer_id: editDraft.payer, date: editDraft.date },
      editDraft.splitUserIds.map(uid => ({ expense_id: editingId, user_id: uid, share_amount: amount / splitCount }))
    );
    if (success) setEditingId(null);
  };

  const handleAdd = async () => {
    const amount = Number(addDraft.amount);
    if (!addDraft.title.trim() || isNaN(amount) || !groupId) return;
    const splitCount = addDraft.splitUserIds.length || 1;
    const success = await addExpense(
      { group_id: groupId, description: addDraft.title.trim(), amount, payer_id: addDraft.payer, created_by: userId, date: addDraft.date, is_paid: false },
      addDraft.splitUserIds.map(uid => ({ expense_id: '', user_id: uid, share_amount: amount / splitCount }))
    );
    if (success) {
      setAddDraft({ title: '', amount: '', payer: userId, date: '', splitUserIds: [] });
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const success = await removeExpense(confirmDeleteId);
    if (success) setConfirmDeleteId(null);
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="All shared expenses"
        actions={
          <>
            <div className="w-44">
              <Select value={chosenGroup} onChange={e => setChosenGroup(e.target.value)} className="py-2.5 text-sm">
                <option value="">All Groups</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select>
            </div>
            <div className="w-44">
              <Select
                value={paidFilter}
                onChange={e => setPaidFilter(e.target.value)}
                className="py-2.5 text-sm"
              >
                <option value="all">All expenses</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </Select>
            </div>
            <div className="relative group/add">
              <Button size="sm" onClick={() => setShowModal(true)} disabled={!groupId}>+ Add expense</Button>
              {!groupId && (
                <span className="pointer-events-none absolute -bottom-9 right-0 whitespace-nowrap rounded-lg bg-gray-900 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-white opacity-0 group-hover/add:opacity-100 transition-opacity shadow-lg">
                  Select a group first
                </span>
              )}
            </div>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/90 dark:bg-purple-950/70 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 shadow-sm border-l-4 border-l-purple-400/70 dark:border-l-purple-400/40">
          <p className="text-sm font-semibold text-purple-700/70 dark:text-purple-200/70 mb-2">Total spend</p>
          <p className="font-display text-3xl font-extrabold tracking-tight text-purple-900 dark:text-purple-100">${formatMoney(totalAmount)}</p>
          <p className="text-sm text-purple-700/60 dark:text-purple-200/60 mt-1">{expenses.length} expenses</p>
        </div>
        <div className="bg-white/90 dark:bg-purple-950/70 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 shadow-sm border-l-4 border-l-amber-400/70 dark:border-l-amber-400/40">
          <p className="text-sm font-semibold text-purple-700/70 dark:text-purple-200/70 mb-2">Unpaid</p>
          <p className="font-display text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">${formatMoney(unpaidAmount)}</p>
          <p className="text-sm text-purple-700/60 dark:text-purple-200/60 mt-1">{expenses.filter(e => !e.is_paid).length} items</p>
        </div>
        <div className="bg-white/90 dark:bg-purple-950/70 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 shadow-sm border-l-4 border-l-emerald-400/70 dark:border-l-emerald-400/40">
          <p className="text-sm font-semibold text-purple-700/70 dark:text-purple-200/70 mb-2">Paid</p>
          <p className="font-display text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">${formatMoney(paidAmount)}</p>
          <p className="text-sm text-purple-700/60 dark:text-purple-200/60 mt-1">{expenses.filter(e => e.is_paid).length} items</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-purple-100/80 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-900/20">
                {['', 'Title', 'Paid by', 'Date', 'Split', 'Amount', ''].map((h, i) => (
                  <th
                    key={h || i}
                    className={`text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-purple-600/70 dark:text-purple-200/70
                      ${i === 0 ? 'w-10' : ''} ${i === 6 ? 'w-[140px] min-w-[140px]' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleExpenses.map(e => (
                <tr
                  key={e.id}
                  className="border-b border-purple-50/80 dark:border-purple-800/30 last:border-0 hover:bg-purple-50/70 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <td className="py-4 px-4 w-10">
                    {(isAdmin || e.payer_id === userId || e.created_by === userId) ? (
                      <button
                        type="button"
                        title={e.is_paid ? 'Mark as unpaid' : 'Mark as paid'}
                        onClick={() => togglePaid(e.id, e.is_paid, e)}
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                          e.is_paid
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400'
                        }`}
                      >
                        {e.is_paid && (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <span
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 ${
                          e.is_paid
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {e.is_paid && (
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-semibold text-purple-900 dark:text-purple-100">{e.description}</td>
                  <td className="py-4 px-4"><Badge variant="purple">{e.profiles?.name ?? 'Unknown'}</Badge></td>
                  <td className="py-4 px-4 text-purple-700/70 dark:text-purple-200/70 whitespace-nowrap">{e.date}</td>
                  <td className="py-4 px-4 text-purple-700/70 dark:text-purple-200/70 text-sm">{e.expense_splits?.map(s => s.profiles?.name ?? 'Unknown').join(', ')}</td>
                  <td className="py-4 px-4 font-semibold text-purple-900 dark:text-purple-100 whitespace-nowrap">${e.amount}</td>

                  {/* Fixed-width action cell */}
                  <td className="py-4 px-4 w-[140px] min-w-[140px]">
                    {(isAdmin || e.created_by === userId || e.payer_id === userId) && (
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEdit(e)}
                        title="Edit"
                        className="flex items-center justify-center w-8 h-8 rounded-lg
                          text-purple-500 dark:text-purple-400
                          hover:bg-purple-100 dark:hover:bg-purple-800/50 transition-colors"
                      >
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.586 3.586a2 2 0 1 1 2.828 2.828L7 15.828 3 17l1.172-4L13.586 3.586Z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(e.id)}
                        title="Delete"
                        className="flex items-center justify-center w-8 h-8 rounded-lg
                          text-red-400 dark:text-red-400
                          hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
                        </svg>
                      </button>
                    </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add modal */}
      {showModal && (
        <Modal title="Add Expense" onClose={() => setShowModal(false)}>
          <FormField label="Title">
            <Input value={addDraft.title} onChange={e => setAddDraft(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Electric bill" />
          </FormField>
          <FormField label="Amount ($)">
            <Input type="number" value={addDraft.amount} onChange={e => setAddDraft(d => ({ ...d, amount: e.target.value }))} placeholder="0.00" />
          </FormField>
          <FormField label="Paid by">
            <Select value={addDraft.payer} onChange={e => setAddDraft(d => ({ ...d, payer: e.target.value }))}>
              {members.map(m => <option key={m.id} value={m.user_id}>{m.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
           <DatePicker value={addDraft.date} onChange={date => setAddDraft(d => ({ ...d, date }))} />
          </FormField>
          <FormField label="Split between">
            <SplitPicker value={addDraft.splitUserIds} onChange={splitUserIds => setAddDraft(d => ({ ...d, splitUserIds }))} members={members} />
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Add</Button>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editingExpense && (
        <Modal title="Edit Expense" onClose={() => setEditingId(null)}>
          <FormField label="Title">
            <Input value={editDraft.title} onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Electric bill" />
          </FormField>
          <FormField label="Amount ($)">
            <Input type="number" value={editDraft.amount} onChange={e => setEditDraft(d => ({ ...d, amount: e.target.value }))} placeholder="0.00" />
          </FormField>
          <FormField label="Paid by">
            <Select value={editDraft.payer} onChange={e => setEditDraft(d => ({ ...d, payer: e.target.value }))}>
              {members.map(m => <option key={m.id} value={m.user_id}>{m.profiles?.name ?? 'Unknown'}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
            <Input type="date" value={editDraft.date} onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))} />
          </FormField>
          <FormField label="Split between">
            <SplitPicker value={editDraft.splitUserIds} onChange={splitUserIds => setEditDraft(d => ({ ...d, splitUserIds }))} members={members} />
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button size="sm" onClick={saveEdit}>Save</Button>
          </div>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {expenseToDelete && (
        <Modal title="Delete expense?" onClose={() => setConfirmDeleteId(null)}>
          <p className="text-base text-purple-700/80 dark:text-purple-200/80">
            This will permanently remove{' '}
            <span className="font-semibold text-purple-900 dark:text-purple-100">"{expenseToDelete.description}"</span>{' '}
            from the list.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
