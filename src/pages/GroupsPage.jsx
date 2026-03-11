import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input } from '../components/FormField';
import { MOCK_GROUPS } from '../data/mockData';

export default function GroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin,   setShowJoin]   = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Groups"
        subtitle="Your roommate groups"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>Join group</Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>+ New group</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {MOCK_GROUPS.map(g => (
          <div
            key={g.id}
            className="bg-white dark:bg-purple-950 border border-purple-100 dark:border-purple-800/60 rounded-2xl p-6 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:-translate-y-0.5 transition-all shadow-sm"
            onClick={() => navigate(`/groups/${g.id}`)}
          >
            <h3 className="font-display font-bold text-purple-900 dark:text-purple-100 text-lg mb-1">{g.name}</h3>
            <p className="text-xs text-purple-400 mb-5">{g.members} members · since {g.created}</p>
            <div className="flex items-center justify-between">
              <Badge variant="purple">${g.total} total</Badge>
              <span className="text-xs text-purple-500 dark:text-purple-400 hover:text-purple-700">Open →</span>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div
          className="border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl p-6 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors min-h-[130px]"
          onClick={() => setShowCreate(true)}
        >
          <span className="text-sm text-purple-400">+ Create new group</span>
        </div>
      </div>

      {showCreate && (
        <Modal title="Create Group" onClose={() => setShowCreate(false)}>
          <FormField label="Group name">
            <Input placeholder="e.g. Hamra Flat" />
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setShowCreate(false)}>Create</Button>
          </div>
        </Modal>
      )}

      {showJoin && (
        <Modal title="Join Group" onClose={() => setShowJoin(false)}>
          <FormField label="Invite code">
            <Input placeholder="e.g. FLAT-4KX2" />
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowJoin(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setShowJoin(false)}>Join</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
