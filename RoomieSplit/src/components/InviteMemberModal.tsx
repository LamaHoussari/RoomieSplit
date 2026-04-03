import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import {
  lookupUserByEmail,
  addMemberByEmail,
  sendInviteEmail,
} from '../services/inviteService';

interface InviteMemberModalProps {
  groupId: string;
  groupName: string;
  groupCode: string;
  inviterName: string;
  onClose: () => void;
  onMemberAdded: () => void;
  loading: boolean;
}

type Tab = 'email' | 'code';

export default function InviteMemberModal({
  groupId,
  groupName,
  groupCode,
  inviterName,
  onClose,
  onMemberAdded,
  loading,
}: InviteMemberModalProps) {
  const [tab, setTab] = useState<Tab>('email');
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  async function handleInviteByEmail(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLocalLoading(true);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter an email address.');
      setLocalLoading(false);
      return;
    }

    const { data: profile, error: lookupErr } = await lookupUserByEmail(trimmed);

    if (lookupErr) {
      setError(lookupErr.message);
      setLocalLoading(false);
      return;
    }

    if (profile) {
      const { error: addErr } = await addMemberByEmail(groupId, profile.id);
      if (addErr) {
        setError(addErr.message);
        setLocalLoading(false);
        return;
      }
      setSuccess(`${profile.name ?? trimmed} has been added to the group!`);
      setLocalLoading(false);
      onMemberAdded();
      return;
    }

    const { error: sendErr } = await sendInviteEmail(
      trimmed,
      groupName,
      groupCode,
      inviterName,
    );

    if (sendErr) {
      setError(sendErr);
      setLocalLoading(false);
      return;
    }

    setSuccess(`An invitation email was sent to ${trimmed}!`);
    setLocalLoading(false);
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(groupCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setError('Failed to copy code.');
    }
  }

  const tabClass = (currentTab: Tab) =>
    `flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
      tab === currentTab
        ? 'bg-[#6f4f8b] text-white shadow-sm dark:bg-[#2b2136] dark:text-[#e2d4f0]'
        : 'text-[#6f4f8b] hover:bg-[#f4eef8] dark:text-[#d4c0ea] dark:hover:bg-[#2b2136]'
    }`;

  return (
    <Modal title="Invite Member" onClose={onClose}>
      <div className="mb-5 flex gap-2 rounded-2xl border border-stone-200/80 bg-stone-100/80 p-1 dark:border-slate-800 dark:bg-slate-800/60">
        <button
          type="button"
          className={tabClass('email')}
          onClick={() => {
            setTab('email');
            setError('');
            setSuccess('');
          }}
        >
          Invite by Email
        </button>
        <button
          type="button"
          className={tabClass('code')}
          onClick={() => {
            setTab('code');
            setError('');
            setSuccess('');
          }}
        >
          Share Code
        </button>
      </div>

      {tab === 'email' && (
        <form onSubmit={handleInviteByEmail} className="space-y-4">
          <div>
            <label
              htmlFor="invite-email"
              className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-slate-300"
            >
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="roommate@example.com"
              className="w-full rounded-xl border border-stone-300/80 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8c74aa]/15 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-[#b59ad6]/20"
            />
            <p className="mt-1.5 text-xs text-stone-500 dark:text-slate-400">
              If they are already on RoomieSplit they will be added instantly. Otherwise they will receive an invite email with the group code.
            </p>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          )}

          <Button type="submit" disabled={localLoading || loading} className="w-full">
            {localLoading ? 'Sending...' : 'Send Invite'}
          </Button>
        </form>
      )}

      {tab === 'code' && (
        <div className="space-y-4">
          <p className="text-sm text-stone-600 dark:text-slate-300">
            Share this code with your roommate. They can join by going to{' '}
            <span className="font-semibold">Groups -&gt; Join Group</span> and entering the code.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1 select-all rounded-xl border border-stone-200/80 bg-stone-100 px-4 py-3 text-center text-lg font-bold tracking-widest text-stone-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {groupCode}
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              {codeCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
