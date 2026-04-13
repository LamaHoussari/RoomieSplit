import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormField, { Input } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { lookupUserByEmail, addMemberByEmail, sendInviteEmail } from '../services/inviteService';
import { SkeletonCard } from '../components/Skeleton';
import { friendlyError } from '../lib/friendlyError';

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

  useEffect(() => {
    if (!pageFeedback) return;
    const id = setTimeout(() => setPageFeedback(null), 5000);
    return () => clearTimeout(id);
  }, [pageFeedback]);

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
          inviteFailures.push(`${email}: ${friendlyError(lookupError.message)}`);
          continue;
        }

        if (user) {
          const { error: memberError } = await addMemberByEmail(newGroup.id, user.id);
          if (memberError) {
            inviteFailures.push(`${email}: ${friendlyError(memberError.message)}`);
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
          message: `Group created, but some invites couldn't be sent. Please try inviting them again from the group page.`,
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
        eyebrow="Shared homes"
        title="Groups"
        subtitle="Create a home, invite roommates, or jump back into an existing space."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>
              Join group
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              New group
            </Button>
          </>
        }
      />

      {(error || pageFeedback || successMessage) && (
        <div className={`mb-6 rs-alert ${error || pageFeedback?.type === 'error' ? 'rs-alert-error' : 'rs-alert-success'}`}>
          {error || pageFeedback?.message || successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="min-h-[220px]" />)
        ) : (
          <>
            {groups.map(group => (
              <button
                key={group.id}
                type="button"
                className="rs-panel text-left transition hover:-translate-y-px hover:border-[#d7cae4] hover:bg-white dark:hover:border-[#4a375e] dark:hover:bg-[#211a2a]"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <div className="flex h-full flex-col p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="rs-kicker">Group</p>
                      <h3 className="mt-2 truncate font-display text-2xl font-semibold text-stone-950 dark:text-white">
                        {group.name}
                      </h3>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#ddd0e9] bg-[#f4eef8] text-[#6f4f8b] dark:border-[#4a375e] dark:bg-[#2b2136] dark:text-[#d4c0ea]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0 1 16 0" />
                      </svg>
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rs-panel-muted px-4 py-3">
                      <p className="rs-kicker">Invite code</p>
                      <p className="mt-2 font-mono text-sm font-semibold text-stone-950 dark:text-white">{group.code}</p>
                    </div>
                    <div className="rs-panel-muted px-4 py-3">
                      <p className="rs-kicker">Created</p>
                      <p className="mt-2 text-sm font-semibold text-stone-950 dark:text-white">
                        {new Date(group.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-stone-200/75 pt-4 text-sm dark:border-slate-800/80">
                    <span className="text-stone-500 dark:text-slate-400">Open details, members, and permissions</span>
                    <span className="font-semibold text-[#6f4f8b] dark:text-[#d4c0ea]">Open</span>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              className="flex min-h-[220px] items-center justify-center border border-dashed border-stone-300/80 bg-white/55 px-6 py-8 text-center text-stone-600 transition hover:border-[#6f4f8b] hover:bg-[#faf7fd] hover:text-[#6f4f8b] dark:border-slate-700 dark:bg-slate-900/45 dark:text-slate-300 dark:hover:border-[#8d70b0] dark:hover:bg-[#211a2a] dark:hover:text-[#d4c0ea]"
              onClick={() => setShowCreate(true)}
            >
              <div>
                <p className="rs-kicker">Start fresh</p>
                <p className="mt-2 font-display text-2xl font-semibold">Create another home</p>
              </div>
            </button>
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
              <FormField label="Invite members by email" hint="You will be added as the admin automatically. Add at least one roommate to create the group.">
                <div className="flex flex-col gap-2 sm:flex-row">
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

              {emailError && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  {emailError}
                </p>
              )}

              {inviteEmails.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {inviteEmails.map(email => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-2 border border-stone-200/70 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
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
            <FormField label="Invite code" hint="Use the code shared by a roommate or admin.">
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
