import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input, Select } from '../components/FormField';
import { MOCK_EXPENSES, MOCK_MEMBERS } from '../data/mockData';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(() =>
    MOCK_EXPENSES.map((e, idx) => ({ ...e, paid: idx % 3 === 0 }))
  );
  const [showModal, setShowModal] = useState(false);
  const [paidFilter, setPaidFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '', amount: '', payer: '', date: '', split: [] });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [payTarget, setPayTarget] = useState(null); // { expense }
  const [payDraft, setPayDraft] = useState({ person: '', amount: '' });

  const [addDraft, setAddDraft] = useState({ title: '', amount: '', payer: MOCK_MEMBERS[0]?.name || '', date: '', split: [] });

  // Deterministic avatar colour from name
  const memberHue = (name) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  };
  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Reusable split picker — renders member toggle pills
  const SplitPicker = ({ value, onChange }) => (
    <div className="flex flex-wrap gap-2">
      {MOCK_MEMBERS.map(m => {
        const active = value.includes(m.name);
        const h = memberHue(m.name);
        return (
          <button
            key={m.name}
            type="button"
            onClick={() => onChange(
              active ? value.filter(n => n !== m.name) : [...value, m.name]
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
              {initials(m.name)}
            </span>
            {m.name}
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

  const openPay = (expense) => {
    setPayTarget(expense);
    setPayDraft({ person: expense.split[0] || '', amount: '' });
  };

  const submitPay = () => {
    if (!payDraft.person || !payDraft.amount) return;
    // Mark the expense as paid (you can extend this to per-person tracking)
    setExpenses(expenses.map(x =>
      x.id === payTarget.id ? { ...x, paid: true } : x
    ));
    setPayTarget(null);
  };

  const visibleExpenses = expenses.filter(e => {
    if (paidFilter === 'paid') return Boolean(e.paid);
    if (paidFilter === 'unpaid') return !e.paid;
    return true;
  });

  const formatMoney = value =>
    Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const paidAmount = expenses.reduce((sum, e) => sum + (e.paid ? Number(e.amount || 0) : 0), 0);
  const unpaidAmount = totalAmount - paidAmount;

  const expenseToDelete = expenses.find(e => e.id === confirmDeleteId);
  const editingExpense = expenses.find(e => e.id === editingId);

  const openEdit = (expense) => {
    setEditingId(expense.id);
    setEditDraft({
      title: expense.desc || '',
      amount: String(expense.amount ?? ''),
      payer: expense.payer || MOCK_MEMBERS[0]?.name || '',
      date: expense.date || '',
      split: expense.split || [],
    });
  };

  const saveEdit = () => {
    const amount = Number(editDraft.amount);
    if (!editDraft.title.trim() || Number.isNaN(amount)) return;
    setExpenses(expenses.map(x =>
      x.id === editingId
        ? { ...x, desc: editDraft.title.trim(), amount, payer: editDraft.payer, date: editDraft.date, split: editDraft.split }
        : x
    ));
    setEditingId(null);
  };

  const togglePaid = (id) =>
    setExpenses(expenses.map(x => x.id === id ? { ...x, paid: !x.paid } : x));

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="All shared expenses"
        actions={
          <>
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
            <Button size="sm" onClick={() => setShowModal(true)}>+ Add expense</Button>
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
          <p className="text-sm text-purple-700/60 dark:text-purple-200/60 mt-1">{expenses.filter(e => !e.paid).length} items</p>
        </div>
        <div className="bg-white/90 dark:bg-purple-950/70 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 shadow-sm border-l-4 border-l-emerald-400/70 dark:border-l-emerald-400/40">
          <p className="text-sm font-semibold text-purple-700/70 dark:text-purple-200/70 mb-2">Paid</p>
          <p className="font-display text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">${formatMoney(paidAmount)}</p>
          <p className="text-sm text-purple-700/60 dark:text-purple-200/60 mt-1">{expenses.filter(e => e.paid).length} items</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-purple-100/80 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-900/20">
                {['Title', 'Paid by', 'Date', 'Split', 'Amount', ''].map((h, i) => (
                  <th
                    key={h || i}
                    className={`text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-purple-600/70 dark:text-purple-200/70
                      ${i === 5 ? 'w-[140px] min-w-[140px]' : ''}`}
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
                  <td className="py-4 px-4 font-semibold text-purple-900 dark:text-purple-100">{e.desc}</td>
                  <td className="py-4 px-4"><Badge variant="purple">{e.payer}</Badge></td>
                  <td className="py-4 px-4 text-purple-700/70 dark:text-purple-200/70 whitespace-nowrap">{e.date}</td>
                  <td className="py-4 px-4 text-purple-700/70 dark:text-purple-200/70 text-sm">{e.split.join(', ')}</td>
                  <td className="py-4 px-4 font-semibold text-purple-900 dark:text-purple-100 whitespace-nowrap">${e.amount}</td>

                  {/* Fixed-width action cell */}
                  <td className="py-4 px-4 w-[140px] min-w-[140px]">
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
              {MOCK_MEMBERS.map(m => <option key={m.name}>{m.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
            <Input type="date" value={addDraft.date} onChange={e => setAddDraft(d => ({ ...d, date: e.target.value }))} />
          </FormField>
          <FormField label="Split between">
            <SplitPicker value={addDraft.split} onChange={split => setAddDraft(d => ({ ...d, split }))} />
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              const amount = Number(addDraft.amount);
              if (!addDraft.title.trim() || isNaN(amount)) return;
              setExpenses(prev => [...prev, {
                id: Date.now(),
                desc: addDraft.title.trim(),
                amount,
                payer: addDraft.payer,
                date: addDraft.date,
                split: addDraft.split,
                paid: false,
              }]);
              setAddDraft({ title: '', amount: '', payer: MOCK_MEMBERS[0]?.name || '', date: '', split: [] });
              setShowModal(false);
            }}>Add</Button>
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
              {MOCK_MEMBERS.map(m => <option key={m.name}>{m.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
            <Input type="date" value={editDraft.date} onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))} />
          </FormField>
          <FormField label="Split between">
            <SplitPicker value={editDraft.split} onChange={split => setEditDraft(d => ({ ...d, split }))} />
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
            <span className="font-semibold text-purple-900 dark:text-purple-100">"{expenseToDelete.desc}"</span>{' '}
            from the list.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => { setExpenses(expenses.filter(x => x.id !== confirmDeleteId)); setConfirmDeleteId(null); }}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}