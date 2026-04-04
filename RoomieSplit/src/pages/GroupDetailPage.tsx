import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import InviteMemberModal from '../components/InviteMemberModal';
import { useMembers } from '../hooks/useMembers';
import { useExpenses } from '../hooks/useExpenses';
import { useSettlements } from '../hooks/useSettlements';
import { getGroupById, deleteGroup } from '../services/groupService';
import { removeMember } from '../services/memberService';
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
  const hasAnotherAdmin = members.some(
    member => member.user_id !== userId && member.role === 'admin',
  );
  const canLeaveGroup = Boolean(
    currentMember &&
    currentBalance === 0 &&
    (!isAdmin || hasAnotherAdmin),
  );
  const leaveDisabledReason = !currentMember
    ? 'You are not a member of this group.'
    : currentBalance !== 0
      ? 'Settle your balance before leaving the group.'
      : isAdmin && !hasAnotherAdmin
        ? members.length === 1
          ? 'Delete the group instead of leaving it.'
          : 'Assign another admin before leaving the group.'
        : '';

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalSettled = settlements.reduce((sum, settlement) => sum + Number(settlement.paid || 0), 0);
  const formatMoney = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const handleLeaveGroup = async () => {
    if (!currentMember || !canLeaveGroup) return;
    if (!confirm(`Leave "${group?.name ?? 'this group'}"?`)) return;

    const { error } = await removeMember(currentMember.id);
    if (error) {
      alert(error.message);
      return;
    }

    navigate('/groups');
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

      <button
        type="button"
        className="mb-6 inline-flex items-center gap-2 text-base font-semibold text-stone-700 transition-colors hover:text-stone-950 dark:text-slate-300 dark:hover:text-white"
        onClick={() => navigate('/groups')}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-stone-200/80 bg-white/70 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
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

      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-slate-100">
          {group?.name ?? 'Loading...'}
        </h1>
        <p className="mt-2 text-base text-stone-500 dark:text-slate-400">
          {members.length} members - Created {group?.created_at ? new Date(group.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title="Members" className="overflow-hidden">
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
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-stone-900 dark:text-slate-100">
                      {memberName}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">
                      {member.role === 'admin' ? 'Admin' : 'Member'}
                    </p>
                  </div>
                  <span
                    className={`ml-auto text-base font-semibold ${
                      balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : balance < 0 ? 'text-red-500 dark:text-red-400' : 'text-stone-500 dark:text-slate-400'
                    }`}
                  >
                    {balance > 0 ? '+' : balance < 0 ? '-' : ''}${Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  {isAdmin && member.role !== 'admin' && (
                    <div className="group/remove relative ml-2">
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
                          if (error) alert(error.message);
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
              );
            })}
          </div>

          {isAdmin && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowInvite(true)}>
              + Invite member
            </Button>
          )}
        </Card>

        <Card title="Group Stats">
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
                  disabled={!canLeaveGroup}
                  title={leaveDisabledReason || 'Leave group'}
                >
                  Leave Group
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
              if (error) alert(error.message);
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
