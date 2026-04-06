import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormField, { Input } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { lookupUserByEmail, addMemberByEmail, sendInviteEmail } from '../services/inviteService';
import { SkeletonCard } from '../components/Skeleton';

interface GroupsPageProps {
  userId: string;
}

export default function GroupsPage({ userId }: GroupsPageProps) {
  const { groups, loading, error, successMessage, addGroup, joinGroup } = useGroups(userId);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [creating, setCreating] = useState(false);
  const [pageFeedback, setPageFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const canCreate = groupName.trim() !== '' && inviteEmails.length > 0 && !creating;

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email address');
      return;
    }
    if (inviteEmails.includes(email)) {
      setEmailError('Email already added');
      return;
    }
    setInviteEmails(prev => [...prev, email]);
    setEmailInput('');
    setEmailError('');
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);
    setPageFeedback(null);
    const trimmedGroupName = groupName.trim();
    const code = trimmedGroupName.toUpperCase().replace(/\s+/g, '-').slice(0, 4) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const newGroup = await addGroup({ name: trimmedGroupName, code });
    if (newGroup) {
      let addedCount = 0;
      let emailCount = 0;
      const inviteFailures: string[] = [];

      for (const email of inviteEmails) {
        const { data: user, error: lookupError } = await lookupUserByEmail(email);

        if (lookupError) {
          inviteFailures.push(`${email}: ${lookupError.message}`);
          continue;
        }

        if (user) {
          const { error: memberError } = await addMemberByEmail(newGroup.id, user.id);
          if (memberError) {
            inviteFailures.push(`${email}: ${memberError.message}`);
            continue;
          }
          addedCount += 1;
          continue;
        }

        const { error: inviteError } = await sendInviteEmail(email, trimmedGroupName, code, 'A group admin');
        if (inviteError) {
          inviteFailures.push(`${email}: ${inviteError}`);
          continue;
        }
        emailCount += 1;
      }

      if (inviteFailures.length > 0) {
        setPageFeedback({
          type: 'error',
          message: `Group created, but some invites failed: ${inviteFailures.join(' ')}`,
        });
      } else {
        const details: string[] = [];
        if (addedCount > 0) details.push(`${addedCount} member${addedCount === 1 ? '' : 's'} added`);
        if (emailCount > 0) details.push(`${emailCount} invite email${emailCount === 1 ? '' : 's'} sent`);
        setPageFeedback({
          type: 'success',
          message: details.length ? `Group created. ${details.join(' and ')}.` : 'Group created successfully.',
        });
      }

      setShowCreate(false);
      setGroupName('');
      setInviteEmails([]);
      setEmailInput('');
      setEmailError('');
    }
    setCreating(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setPageFeedback(null);
    const success = await joinGroup(joinCode.trim());
    if (success) {
      setShowJoin(false);
      setJoinCode('');
    }
  };

  const handleClose = () => {
    setShowCreate(false);
    setGroupName('');
    setInviteEmails([]);
    setEmailInput('');
    setEmailError('');
    setCreating(false);
  };

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

      {(error || pageFeedback || successMessage) && (
        <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
          error || pageFeedback?.type === 'error'
            ? 'border-red-200/80 bg-red-50/70 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300'
            : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300'
        }`}>
          {error || pageFeedback?.message || successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="min-h-[140px]" />)
        ) : (
          <>
        {groups.map(group => (
          <div
            key={group.id}
            className="cursor-pointer rounded-3xl border border-stone-200/80 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_24px_56px_-34px_rgba(28,25,23,0.5)] dark:border-slate-800/70 dark:bg-slate-900/78 dark:hover:border-slate-700 sm:p-7"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-xl font-extrabold leading-tight text-stone-900 dark:text-slate-100">
                  {group.name}
                </h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">
                  Since {new Date(group.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f4eef8] text-[#6f4f8b] dark:bg-[#2b2136] dark:text-[#d4c0ea]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </span>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                Invite code
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-stone-900 dark:text-slate-100">{group.code}</p>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <span className="text-sm font-semibold text-[#6f4f8b] dark:text-[#d4c0ea]">
                Open -&gt;
              </span>
            </div>
          </div>
        ))}

        <div
          className="flex min-h-[140px] cursor-pointer items-center justify-center rounded-3xl border-2 border-dashed border-stone-300/80 bg-white/50 p-6 transition-colors hover:border-stone-400 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600 sm:p-7"
          onClick={() => setShowCreate(true)}
        >
          <span className="text-base font-semibold text-stone-600 dark:text-slate-300">
            + Create new group
          </span>
        </div>
          </>
        )}
      </div>

      {showCreate && (
        <Modal title="Create Group" onClose={handleClose}>
          <form onSubmit={e => { e.preventDefault(); handleCreate(); }}>
          <FormField label="Group name">
            <Input
              placeholder="e.g. Hamra Flat"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
          </FormField>

          <div className="mt-4">
            <FormField label="Invite members by email">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. roomie@email.com"
                  value={emailInput}
                  onChange={e => {
                    setEmailInput(e.target.value);
                    setEmailError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                />
                <Button variant="outline" size="sm" type="button" onClick={handleAddEmail}>
                  Add
                </Button>
              </div>
            </FormField>
            <p className="mt-1 text-sm text-stone-500 dark:text-slate-400">
              You will be added as the admin automatically. Add at least one roommate to create the group.
            </p>
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
            {inviteEmails.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {inviteEmails.map(email => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/70 bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {email}
                    <button
                      type="button"
                      className="text-stone-400 transition-colors hover:text-stone-700 dark:hover:text-white"
                      onClick={() => setInviteEmails(prev => prev.filter(item => item !== email))}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={!canCreate}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
          </form>
        </Modal>
      )}

      {showJoin && (
        <Modal title="Join Group" onClose={() => setShowJoin(false)}>
          <form onSubmit={e => { e.preventDefault(); handleJoin(); }}>
          <FormField label="Invite code">
            <Input placeholder="e.g. FLAT-4KX2" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
          </FormField>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowJoin(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Join
            </Button>
          </div>
          </form>
        </Modal>
      )}
    </>
  );
}
