import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input, Select } from '../components/FormField';
import { MOCK_CHORES, MOCK_MEMBERS } from '../data/mockData';

export default function ChoresPage() {
  const [chores, setChores] = useState(MOCK_CHORES);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <PageHeader
        title="Chores"
        subtitle="Track household tasks and assignments"
        actions={<Button size="sm" onClick={() => setShowModal(true)}>+ Add chore</Button>}
      />

      <Card>
        {chores.map((c, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-purple-50 dark:border-purple-800/40 last:border-0">
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{c.name}</p>
              <p className="text-xs text-purple-400 mt-0.5">{c.freq}</p>
            </div>
            <Badge variant="violet">{c.assigned}</Badge>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setChores(chores.filter((_, j) => j !== i))}
            >
              Remove
            </Button>
          </div>
        ))}
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
    </>
  );
}
