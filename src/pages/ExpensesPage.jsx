import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input, Select } from '../components/FormField';
import { MOCK_EXPENSES, MOCK_MEMBERS } from '../data/mockData';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="All shared expenses"
        actions={<Button size="sm" onClick={() => setShowModal(true)}>+ Add expense</Button>}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100 dark:border-purple-800/60">
                {['Description', 'Paid by', 'Date', 'Split', 'Amount', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-purple-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b border-purple-50 dark:border-purple-800/30 last:border-0 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                  <td className="py-4 px-4 font-medium text-purple-900 dark:text-purple-100">{e.desc}</td>
                  <td className="py-4 px-4"><Badge variant="purple">{e.payer}</Badge></td>
                  <td className="py-4 px-4 text-purple-400">{e.date}</td>
                  <td className="py-4 px-4 text-purple-400 text-xs">{e.split.join(', ')}</td>
                  <td className="py-4 px-4 font-semibold text-purple-700 dark:text-purple-300 text-right">${e.amount}</td>
                  <td className="py-4 px-4 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setExpenses(expenses.filter(x => x.id !== e.id))}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal title="Add Expense" onClose={() => setShowModal(false)}>
          <FormField label="Description">
            <Input placeholder="e.g. Electric bill" />
          </FormField>
          <FormField label="Amount ($)">
            <Input type="number" placeholder="0.00" />
          </FormField>
          <FormField label="Paid by">
            <Select>
              {MOCK_MEMBERS.map(m => <option key={m.name}>{m.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Date">
            <Input type="date" />
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setShowModal(false)}>Add</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
