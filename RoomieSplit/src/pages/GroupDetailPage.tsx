import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import FormField, { Select } from '../components/FormField';
import InviteMemberModal from '../components/InviteMemberModal';
import { useMembers } from '../hooks/useMembers';
import { useExpenses } from '../hooks/useExpenses';
import { useSettlements } from '../hooks/useSettlements';
import { getGroupById, deleteGroup } from '../services/groupService';
import { removeMember, updateMemberRole } from '../services/memberService';
import type { Group } from '../types/Group';
import { computeMemberBalance } from '../lib/finance';

const getInitials = (name?: string) =>
  (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

interface GroupDetailPageProps {
  userId: string;
}

export default function GroupDetailPage({ userId }: GroupDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const groupId = id ?? null;

  const [group, setGroup] = useState<Group | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
  const [selectedNextAdminId, setSelectedNextAdminId] = useState('');
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [pageFeedback, setPageFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  useEffect(() => {
    if (!pageFeedback) return;
    const id = setTimeout(() => setPageFeedback(null), 5000);
    return () => clearTimeout(id);
  }, [pageFeedback]);

  useEffect(() => {
    if (!groupId) return;
    getGroupById(groupId).then(({ data }) => setGroup(data));
  }, [groupId]);

  const { members, loading: membersLoading, loadMembers } = useMembers(groupId);
  const currentMember = members.find(member => member.user_id === userId);
  const isAdmin = currentMember?.role === 'admin';
  const { expenses } = useExpenses(groupId);
  const { settlements } = useSettlements(groupId);
  const currentBalance = computeMemberBalance(userId, settlements);
  const otherMembers = members.filter(member => member.user_id !== userId);
  const hasAnotherAdmin = members.some(
    member => member.user_id !== userId && member.role === 'admin',
  );
  const adminReplacementCandidates = otherMembers.filter(member => member.role !== 'admin');
  const requiresAdminReplacement = Boolean(
    isAdmin &&
    !hasAnotherAdmin &&
    otherMembers.length > 0,
  );
  const canLeaveGroup = Boolean(
    currentMember &&
    currentBalance === 0 &&
    (!isAdmin || otherMembers.length > 0),
  );
  const leaveDisabledReason = !currentMember
    ? 'You are not a member of this group.'
    : currentBalance !== 0
      ? 'Settle your balance before leaving the group.'
      : isAdmin && otherMembers.length === 0
        ? members.length === 1
          ? 'Delete the group instead of leaving it.'
          : 'Add another member before leaving the group.'
        : '';

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalSettled = settlements.reduce((sum, settlement) => sum + Number(settlement.paid || 0), 0);
  const formatMoney = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const leaveGroup = async (replacementAdminId?: string) => {
    if (!currentMember) return;

    const nextAdmin = replacementAdminId
      ? adminReplacementCandidates.find(member => member.id === replacementAdminId)
      : null;

    if (requiresAdminReplacement && !nextAdmin) {
      setPageFeedback({ type: 'error', message: 'Choose a new admin before leaving the group.' });
      return;
    }

    setLeavingGroup(true);

    if (nextAdmin) {
      const { error: promoteError } = await updateMemberRole(nextAdmin.id, 'admin');
      if (promoteError) {
        setLeavingGroup(false);
        setPageFeedback({ type: 'error', message: promoteError.message });
        return;
      }
    }

    const { error: leaveError } = await removeMember(currentMember.id);
    if (leaveError) {
      if (nextAdmin) {
        await loadMembers();
      }
      setLeavingGroup(false);
      setPageFeedback({ type: 'error', message: leaveError.message });
      return;
    }

    navigate('/groups');
  };

  const handleLeaveGroup = async () => {
    if (!currentMember || !canLeaveGroup || leavingGroup) return;

    if (!isAdmin) {
      if (!confirm(`Leave "${group?.name ?? 'this group'}"?`)) return;
      await leaveGroup();
      return;
    }

    if (adminReplacementCandidates.length === 0 && hasAnotherAdmin) {
      if (!confirm(`Leave "${group?.name ?? 'this group'}"?`)) return;
      await leaveGroup();
      return;
    }

    setSelectedNextAdminId(requiresAdminReplacement ? adminReplacementCandidates[0]?.id ?? '' : '');
    setShowLeaveGroupModal(true);
  };

  return (
    <>
      {showInvite && groupId && group && (
        <InviteMemberModal
          groupId={groupId}
          groupName={group.name}
          groupCode={group.code}
          inviterName={currentMember?.profiles?.name ?? 'A group admin'}
          onClose={() => setShowInvite(false)}
          onMemberAdded={() => {
            loadMembers();
          }}
          loading={membersLoading}
        />
      )}

      {showLeaveGroupModal && currentMember && (
        <Modal title="Leave Group" onClose={() => !leavingGroup && setShowLeaveGroupModal(false)}>
          <p className="text-sm leading-6 text-stone-600 dark:text-slate-300">
            {requiresAdminReplacement
              ? `Choose who should become the new admin of "${group?.name ?? 'this group'}" before you leave.`
              : `You can leave "${group?.name ?? 'this group'}" now. If you want, promote another member to admin first.`}
          </p>

          {adminReplacementCandidates.length > 0 && (
            <div className="mt-5">
              <FormField label={requiresAdminReplacement ? 'New admin' : 'Promote another admin (optional)'}>
                <Select
                  value={selectedNextAdminId}
                  onChange={e => setSelectedNextAdminId(e.target.value)}
                >
                  {!requiresAdminReplacement && <option value="">Keep current admins</option>}
                  {adminReplacementCandidates.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.profiles?.name ?? 'Unknown'}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLeaveGroupModal(false)}
              disabled={leavingGroup}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => leaveGroup(selectedNextAdminId || undefined)}
              disabled={leavingGroup || (requiresAdminReplacement && !selectedNextAdminId)}
            >
              {leavingGroup ? 'Leaving...' : requiresAdminReplacement ? 'Assign & Leave' : 'Leave Group'}
            </Button>
          </div>
        </Modal>
      )}

      {pageFeedback && (
        <div className={`mb-6 rs-alert ${pageFeedback.type === 'error' ? 'rs-alert-error' : 'rs-alert-success'}`}>
          {pageFeedback.message}
        </div>
      )}

      <button
        type="button"
        className="mb-6 inline-flex items-center gap-2 text-base font-semibold text-stone-700 transition-colors hover:text-stone-950 dark:text-slate-300 dark:hover:text-white"
        onClick={() => navigate('/groups')}
      >
        <span className="rs-action-icon">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M11.78 4.22a.75.75 0 0 1 0 1.06L7.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        Back to Groups
      </button>

      <PageHeader
        eyebrow="Group"
        title={group?.name ?? 'Loading...'}
        subtitle={`${members.length} members currently belong to this group.`}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card eyebrow="People" title="Members" description="Roles, balances, and membership changes in one place." className="overflow-hidden">
          <div className="-mx-2">
            {members.map(member => {
              const balance = computeMemberBalance(member.user_id, settlements);
              const memberName = member.profiles?.name ?? 'Unknown';
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-stone-100/80 dark:hover:bg-white/5"
                >
                  <Avatar initials={getInitials(memberName)} colorClass={member.color_class || ''} />
                  <div className="min-w-0 group/member relative">
                    <p className="truncate text-base font-semibold text-stone-900 dark:text-slate-100 cursor-pointer">
                      {memberName}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </p>
                    {/* Member info popover */}
                    <div className="pointer-events-none absolute left-0 top-full z-30 mt-1 w-60 rounded-xl border border-stone-200 bg-white p-3 shadow-xl opacity-0 transition-opacity group-hover/member:opacity-100 dark:border-slate-700 dark:bg-slate-800">
                      {member.profiles?.email && (
                        <p className="truncate text-xs text-stone-600 dark:text-slate-300">
                          <span className="font-medium text-stone-500 dark:text-slate-400">Email: </span>
                          {member.profiles.email}
                        </p>
                      )}
                      {member.profiles?.phone && (
                        <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
                          <span className="font-medium text-stone-500 dark:text-slate-400">Phone: </span>
                          {member.profiles.phone}
                        </p>
                      )}
                      {member.profiles?.payment_method && (
                        <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
                          <span className="font-medium text-stone-500 dark:text-slate-400">Payment: </span>
                          {member.profiles.payment_method}
                        </p>
                      )}
                      {!member.profiles?.email && !member.profiles?.phone && !member.profiles?.payment_method && (
                        <p className="text-xs italic text-stone-400 dark:text-slate-500">No additional info</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <span
                      className={`w-24 text-right font-mono text-base font-semibold tabular-nums ${
                        balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : balance < 0 ? 'text-red-500 dark:text-red-400' : 'text-stone-500 dark:text-slate-400'
                      }`}
                    >
                      {balance > 0 ? '+' : balance < 0 ? '-' : ''}${Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <div className="w-10">
                      {isAdmin && member.role !== 'admin' && (
                        <div className="group/remove relative">
                          <button
                            type="button"
                            disabled={balance !== 0}
                            className={`rounded-xl p-1.5 transition-colors ${
                              balance !== 0
                                ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                                : 'text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
                            }`}
                            onClick={async () => {
                              if (!confirm(`Remove ${memberName} from the group?`)) return;
                              const { error } = await removeMember(member.id);
                              if (error) setPageFeedback({ type: 'error', message: error.message });
                              else loadMembers();
                            }}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                              <path d="M6.28 5.22a.75.75 0 0 1 1.06 0L10 7.94l2.66-2.72a.75.75 0 1 1 1.08 1.04L11.06 9l2.68 2.74a.75.75 0 1 1-1.08 1.04L10 10.06l-2.66 2.72a.75.75 0 0 1-1.08-1.04L8.94 9 6.28 6.26a.75.75 0 0 1 0-1.04Z" />
                            </svg>
                          </button>
                          <span className="pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover/remove:opacity-100 dark:bg-gray-700">
                            {balance !== 0 ? 'Settle all balances before removing' : 'Remove member'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isAdmin && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowInvite(true)}>
              + Invite member
            </Button>
          )}
        </Card>

        <Card eyebrow="Details" title="Group Stats" description="Shared totals, invite access, and membership controls.">
          {[
            { label: 'Total Expenses', value: `$${formatMoney(totalExpenses)}`, color: 'text-stone-900 dark:text-slate-100' },
            { label: 'Expenses Count', value: String(expenses.length), color: 'text-stone-900 dark:text-slate-100' },
            { label: 'Settled', value: `$${formatMoney(totalSettled)}`, color: 'text-emerald-600 dark:text-emerald-400' },
          ].map(stat => (
            <div key={stat.label} className="flex justify-between py-3">
              <span className="text-base text-stone-500 dark:text-slate-400">{stat.label}</span>
              <span className={`text-base font-semibold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}

          <div className="mt-6 border-t border-stone-200/80 pt-5 dark:border-slate-800">
            <p className="text-sm font-medium text-stone-500 dark:text-slate-400">Invite code</p>
            <div className="mt-2 inline-flex items-center rounded-2xl border border-stone-200/80 bg-stone-100 px-4 py-2 font-semibold text-stone-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {group?.code ?? '-'}
            </div>
          </div>

          {currentMember && (
            <div className="mt-6 border-t border-stone-200/80 pt-5 dark:border-slate-800">
              <p className="text-sm font-medium text-stone-500 dark:text-slate-400">Membership</p>
              <p className="mt-2 text-sm text-stone-500 dark:text-slate-400">
                {isAdmin
                  ? 'You are managing this group as an admin.'
                  : 'You can leave this group once your balance is settled.'}
              </p>
              <div className="mt-4">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLeaveGroup}
                  disabled={!canLeaveGroup || leavingGroup}
                  title={leaveDisabledReason || 'Leave group'}
                >
                  {leavingGroup ? 'Leaving...' : 'Leave Group'}
                </Button>
              </div>
              {!canLeaveGroup && leaveDisabledReason && (
                <p className="mt-2 text-xs font-medium text-stone-500 dark:text-slate-400">
                  {leaveDisabledReason}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {isAdmin && (
        <div className="mt-8">
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              if (!confirm(`Are you sure you want to delete "${group?.name}"? This action cannot be undone.`)) return;
              if (!groupId) return;
              const { error } = await deleteGroup(groupId);
              if (error) setPageFeedback({ type: 'error', message: error.message });
              else navigate('/groups');
            }}
          >
            Delete Group
          </Button>
        </div>
      )}
    </>
  );
}
