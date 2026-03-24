import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Badge from '../components/Badge';
import FormField, { Input } from '../components/FormField';
import { MOCK_GROUPS, MOCK_MEMBERS } from '../data/mockData';

export default function GroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Groups"
        subtitle="Your roommate groups"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>
              Join group
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + New group
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {MOCK_GROUPS.map(g => (
          <div
            key={g.id}
            className="bg-white/90 dark:bg-purple-950/70 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 sm:p-7 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
            onClick={() => navigate(`/groups/${g.id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display font-extrabold text-purple-900 dark:text-purple-100 text-xl leading-tight truncate">
                  {g.name}
                </h3>
                <p className="text-sm text-purple-700/70 dark:text-purple-200/70 mt-1">
                  {g.members} members · since {g.created}
                </p>
              </div>
              <span className="h-10 w-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </span>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-600/70 dark:text-purple-200/70">
                Members
              </p>
              <div className="mt-2 flex items-center gap-3 min-w-0">
                <div className="flex -space-x-2">
                  {MOCK_MEMBERS.slice(0, g.members).map(m => (
                    <span
                      key={m.name}
                      title={m.name}
                      className={`inline-flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full ring-2 ring-white dark:ring-purple-950 ${m.colorClass}`}
                    >
                      {m.initials}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-purple-700/80 dark:text-purple-200/80 truncate">
                  {MOCK_MEMBERS.slice(0, g.members).map(m => m.name).join(', ')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <Badge variant="purple">${g.total} total</Badge>
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-200">
                Open →
              </span>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div
          className="border-2 border-dashed border-purple-200/80 dark:border-purple-800 rounded-3xl p-6 sm:p-7 flex items-center justify-center cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors min-h-[140px] bg-white/50 dark:bg-purple-950/30"
          onClick={() => setShowCreate(true)}
        >
          <span className="text-base font-semibold text-purple-700/70 dark:text-purple-200/70">
            + Create new group
          </span>
        </div>
      </div>

      {showCreate && (
        <Modal title="Create Group" onClose={() => setShowCreate(false)}>
          <FormField label="Group name">
            <Input placeholder="e.g. Hamra Flat" />
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setShowCreate(false)}>
              Create
            </Button>
          </div>
        </Modal>
      )}

      {showJoin && (
        <Modal title="Join Group" onClose={() => setShowJoin(false)}>
          <FormField label="Invite code">
            <Input placeholder="e.g. FLAT-4KX2" />
          </FormField>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setShowJoin(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setShowJoin(false)}>
              Join
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
