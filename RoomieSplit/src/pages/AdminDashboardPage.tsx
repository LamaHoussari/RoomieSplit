import React, { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { formatDistanceToNow } from "date-fns";
import Badge from "../components/Badge";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { getSettlementRemaining, roundCurrency } from "../lib/finance";
import type { AppUser } from "../types/auth";

const THIRTY_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 30;

// #3: Memoized table headers
// const TABLE_HEADERS = ["Group", "Members", "Spend", "Open", "Last activity"] as const;

// #3: Badge variant helpers
const getChoreBadgeVariant = (count: number): "orange" | "green" => 
  count > 0 ? "orange" : "green";

const getExpenseBadgeVariant = (count: number): "violet" | "green" => 
  count > 0 ? "violet" : "green";

const getUserStatusBadgeVariant = (active: boolean): "green" | "violet" => 
  active ? "green" : "violet";

// #8: Improved date formatting with relative time
function formatRelativeDate(timestamp: number) {
  if (!timestamp) return "No activity";
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return formatDate(date.toISOString());
}

function formatMoney(value: number) {
  return `$${roundCurrency(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "No activity";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No activity";

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0;

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

// #10: Memoized stat card component
const AdminStatCard = React.memo(({
  label,
  value,
  detail,
  accentClass,
  tooltip,
}: {
  label: string;
  value: string;
  detail: string;
  accentClass: string;
  tooltip?: string;
}) => {
  return (
    <div
      className={`group relative rounded-3xl border border-stone-200/80 border-l-4 bg-white/84 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:bg-slate-900/78 ${accentClass}`}
    >
      {/* #12: Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
          {tooltip}
        </div>
      )}
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-2 text-sm text-stone-500 dark:text-slate-400">
        {detail}
      </p>
    </div>
  );
});

// #10: Memoized table row component
const GroupTableRow = React.memo(({ 
  group, 
  onClick 
}: { 
  group: GroupRow; 
  onClick: (id: string) => void;
}) => (
  <tr
    className="cursor-pointer border-b border-stone-200/60 align-top transition-colors last:border-0 hover:bg-stone-100/70 dark:border-slate-800/50 dark:hover:bg-white/5"
    onClick={() => onClick(group.id)}
  >
    <td className="px-4 py-4">
      <div>
        <p className="font-semibold text-stone-900 dark:text-slate-100">
          {group.name}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
          {group.code}
        </p>
        <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
          Admin: {group.adminNames.length ? group.adminNames.join(", ") : "Unknown"}
        </p>
      </div>
    </td>
    <td className="px-4 py-4 text-stone-600 dark:text-slate-300">
      <div className="font-semibold text-stone-900 dark:text-slate-100">
        {group.memberCount}
      </div>
      <div className="mt-1 text-xs text-stone-500 dark:text-slate-400">
        Created {formatDate(group.createdAt)}
      </div>
    </td>
    <td className="px-4 py-4 font-semibold text-stone-900 dark:text-slate-100">
      {formatMoney(group.totalSpend)}
    </td>
    <td className="px-4 py-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant={getChoreBadgeVariant(group.pendingChoreCount)}>
          {group.pendingChoreCount} chores
        </Badge>
        <Badge variant={getExpenseBadgeVariant(group.unpaidExpenseCount)}>
          {group.unpaidExpenseCount} unpaid
        </Badge>
      </div>
      <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
        {formatMoney(group.outstandingSettlementTotal)} unsettled
      </p>
    </td>
    <td className="px-4 py-4 text-stone-500 dark:text-slate-400">
      {/* #8: Use relative date formatting */}
      {formatRelativeDate(group.lastActivity || toTimestamp(group.createdAt))}
    </td>
  </tr>
));

interface UserRow {
  id: string;
  name: string;
  email: string | null;
  groupCount: number;
  lastActivity: number;
  activeRecently: boolean;
}
// #10: Memoized user row component
const UserRow = React.memo(({ 
  profile, 
  onClick 
}: { 
  profile: UserRow; 
  onClick: (id: string) => void;
}) => (
  <div
    className="cursor-pointer flex items-center justify-between gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-stone-100/70 dark:hover:bg-white/5"
    onClick={() => onClick(profile.id)}
  >
    <div className="min-w-0">
      <p className="truncate font-semibold text-stone-900 dark:text-slate-100">
        {profile.name}
      </p>
      <p className="truncate text-sm text-stone-500 dark:text-slate-400">
        {profile.email ?? "No email"}
      </p>
    </div>
    <div className="text-right">
      <Badge variant={getUserStatusBadgeVariant(profile.activeRecently)}>
        {profile.activeRecently ? "Active" : "Quiet"}
      </Badge>
      <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
        {profile.groupCount} group{profile.groupCount === 1 ? "" : "s"} •{" "}
        {/* #8: Use relative date formatting */}
        {formatRelativeDate(profile.lastActivity)}
      </p>
    </div>
  </div>
));

// Types for better maintainability
interface GroupRow {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  memberCount: number;
  adminNames: string[];
  totalSpend: number;
  unpaidExpenseCount: number;
  pendingChoreCount: number;
  outstandingSettlementTotal: number;
  lastActivity: number;
}



// #9: Skeleton component for loading state
const DashboardSkeleton = () => (
  <>
    <PageHeader
      eyebrow="Operations"
      title="Admin Dashboard"
      subtitle="Global operational view across groups, members, and system activity."
    />
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-3xl border border-stone-200/80 bg-white/84 p-6">
          <div className="h-4 w-24 rounded bg-stone-200"></div>
          <div className="mt-3 h-10 w-16 rounded bg-stone-200"></div>
          <div className="mt-2 h-4 w-32 rounded bg-stone-200"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="animate-pulse rounded-2xl border bg-white p-6">
        <div className="h-6 w-48 rounded bg-stone-200"></div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded bg-stone-100"></div>
          ))}
        </div>
      </div>
      <div className="animate-pulse rounded-2xl border bg-white p-6">
        <div className="h-6 w-40 rounded bg-stone-200"></div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded bg-stone-100"></div>
          ))}
        </div>
      </div>
    </div>
  </>
);

const today = Date.now();

export default function AdminDashboardPage({ user }: { user: AppUser }) {
  const { snapshot, error} = useAdminDashboard();
  const navigate = useNavigate();
  
  // #4: State for sorting and filtering
  const [groupSortField, setGroupSortField] = useState<keyof GroupRow>('lastActivity');
  const [groupSortOrder, setGroupSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupSearch, setGroupSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  // #7: Pagination state
  const [groupPage, setGroupPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const PAGE_SIZE = 10;
  const USER_PAGE_SIZE = 8;

  const metrics = useMemo(() => {
    if (!snapshot) return null;

    const recentThreshold = today - THIRTY_DAYS_IN_MS;

    const membersByGroup = new Map<string, typeof snapshot.members>();
    const expensesByGroup = new Map<string, typeof snapshot.expenses>();
    const choresByGroup = new Map<string, typeof snapshot.chores>();
    const settlementsByGroup = new Map<string, typeof snapshot.settlements>();
    const groupActivity = new Map<string, number>();
    const userActivity = new Map<string, number>();
    const userGroupCounts = new Map<string, number>();

    const markUserActivity = (
      userId: string | null | undefined,
      value: string | null | undefined,
    ) => {
      if (!userId) return;
      const timestamp = toTimestamp(value);
      if (!timestamp) return;
      userActivity.set(
        userId,
        Math.max(userActivity.get(userId) ?? 0, timestamp),
      );
    };

    const markGroupActivity = (
      groupId: string | null | undefined,
      value: string | null | undefined,
    ) => {
      if (!groupId) return;
      const timestamp = toTimestamp(value);
      if (!timestamp) return;
      groupActivity.set(
        groupId,
        Math.max(groupActivity.get(groupId) ?? 0, timestamp),
      );
    };

    snapshot.groups.forEach((group) => {
      markGroupActivity(group.id, group.created_at);
    });

    snapshot.profiles.forEach((profile) => {
      markUserActivity(profile.id, profile.created_at);
    });

    snapshot.members.forEach((member) => {
      membersByGroup.set(member.group_id, [
        ...(membersByGroup.get(member.group_id) ?? []),
        member,
      ]);
      userGroupCounts.set(
        member.user_id,
        (userGroupCounts.get(member.user_id) ?? 0) + 1,
      );
      markUserActivity(member.user_id, member.joined_at);
      markGroupActivity(member.group_id, member.joined_at);
    });

    snapshot.expenses.forEach((expense) => {
      expensesByGroup.set(expense.group_id, [
        ...(expensesByGroup.get(expense.group_id) ?? []),
        expense,
      ]);
      markUserActivity(expense.created_by, expense.created_at);
      markUserActivity(expense.payer_id, expense.created_at);
      markGroupActivity(expense.group_id, expense.created_at);
    });

    snapshot.chores.forEach((chore) => {
      choresByGroup.set(chore.group_id, [
        ...(choresByGroup.get(chore.group_id) ?? []),
        chore,
      ]);
      markUserActivity(chore.created_by, chore.created_at);
      markUserActivity(chore.assigned_to, chore.created_at);
      markGroupActivity(chore.group_id, chore.created_at);
    });

    snapshot.settlements.forEach((settlement) => {
      settlementsByGroup.set(settlement.group_id, [
        ...(settlementsByGroup.get(settlement.group_id) ?? []),
        settlement,
      ]);
      markUserActivity(settlement.created_by, settlement.created_at);
      markUserActivity(settlement.from_user_id, settlement.created_at);
      markUserActivity(settlement.to_user_id, settlement.created_at);
      markGroupActivity(settlement.group_id, settlement.created_at);
    });

    const activeUserCount = [...userActivity.values()].filter(
      (timestamp) => timestamp >= recentThreshold,
    ).length;
    const totalSpend = snapshot.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );
    const pendingChores = snapshot.chores.filter(
      (chore) => !chore.is_completed,
    ).length;
    const outstandingSettlements = snapshot.settlements.reduce(
      (sum, settlement) => sum + getSettlementRemaining(settlement),
      0,
    );

    const groupRows = snapshot.groups
      .map((group) => {
        const groupMembers = membersByGroup.get(group.id) ?? [];
        const groupExpenses = expensesByGroup.get(group.id) ?? [];
        const groupChores = choresByGroup.get(group.id) ?? [];
        const groupSettlements = settlementsByGroup.get(group.id) ?? [];

        return {
          id: group.id,
          name: group.name,
          code: group.code,
          createdAt: group.created_at,
          memberCount: groupMembers.length,
          adminNames: groupMembers
            .filter((member) => member.role === "admin")
            .map(
              (member) =>
                member.profiles?.name ?? member.profiles?.email ?? "Unknown",
            ),
          totalSpend: groupExpenses.reduce(
            (sum, expense) => sum + Number(expense.amount || 0),
            0,
          ),
          unpaidExpenseCount: groupExpenses.filter(
            (expense) => !expense.is_paid,
          ).length,
          pendingChoreCount: groupChores.filter((chore) => !chore.is_completed)
            .length,
          outstandingSettlementTotal: groupSettlements.reduce(
            (sum, settlement) => sum + getSettlementRemaining(settlement),
            0,
          ),
          lastActivity: groupActivity.get(group.id) ?? 0,
        };
      })
      .sort(
        (a, b) =>
          (b.lastActivity || toTimestamp(b.createdAt)) -
          (a.lastActivity || toTimestamp(a.createdAt)),
      );

    const userRows = snapshot.profiles
      .map((profile) => ({
        id: profile.id,
        name: profile.name || profile.email || "Unknown",
        email: profile.email,
        groupCount: userGroupCounts.get(profile.id) ?? 0,
        lastActivity:
          userActivity.get(profile.id) ?? toTimestamp(profile.created_at),
        activeRecently: (userActivity.get(profile.id) ?? 0) >= recentThreshold,
      }))
      .sort((a, b) => b.lastActivity - a.lastActivity);

    return {
      totalGroups: snapshot.groups.length,
      totalUsers: snapshot.profiles.length,
      totalMemberships: snapshot.members.length,
      activeUserCount,
      totalSpend,
      pendingChores,
      outstandingSettlements,
      groupRows,
      userRows,
    };
  }, [snapshot]);

  // #4: Sorting and filtering logic
  const sortedAndFilteredGroups = useMemo(() => {
    if (!metrics) return [];
    
    return metrics.groupRows
      .filter(group => 
        group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
        group.code.toLowerCase().includes(groupSearch.toLowerCase())
      )
      .sort((a, b) => {
        const aVal = a[groupSortField];
        const bVal = b[groupSortField];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return groupSortOrder === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return groupSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
  }, [metrics, groupSearch, groupSortField, groupSortOrder]);

  const filteredUsers = useMemo(() => {
    if (!metrics) return [];
    
    return metrics.userRows.filter(user =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [metrics, userSearch]);

  // #7: Pagination
  const paginatedGroups = useMemo(() => {
    const start = (groupPage - 1) * PAGE_SIZE;
    return sortedAndFilteredGroups.slice(start, start + PAGE_SIZE);
  }, [sortedAndFilteredGroups, groupPage]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * USER_PAGE_SIZE;
    return filteredUsers.slice(start, start + USER_PAGE_SIZE);
  }, [filteredUsers, userPage]);

  const totalGroupPages = Math.ceil(sortedAndFilteredGroups.length / PAGE_SIZE);
  const totalUserPages = Math.ceil(filteredUsers.length / USER_PAGE_SIZE);

  // #5: Export functionality
  const exportGroupsToCSV = useCallback(() => {
    if (!metrics) return;
    
    const headers = ['Group Name', 'Code', 'Members', 'Total Spend', 'Pending Chores', 'Unpaid Expenses', 'Outstanding Settlements', 'Created Date'];
    const rows = metrics.groupRows.map(g => [
      `"${g.name}"`,
      g.code,
      g.memberCount,
      g.totalSpend,
      g.pendingChoreCount,
      g.unpaidExpenseCount,
      g.outstandingSettlementTotal,
      formatDate(g.createdAt)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `groups-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [metrics]);

  const exportUsersToCSV = useCallback(() => {
    if (!metrics) return;
    
    const headers = ['User Name', 'Email', 'Groups Count', 'Last Activity', 'Status'];
    const rows = metrics.userRows.map(u => [
      `"${u.name}"`,
      u.email,
      u.groupCount,
      formatDate(new Date(u.lastActivity).toISOString()),
      u.activeRecently ? 'Active' : 'Quiet'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [metrics]);

  // #7: Click handlers for drill-down
  const handleGroupClick = useCallback((groupId: string) => {
    navigate(`/admin/groups/${groupId}`);
  }, [navigate]);

  const handleUserClick = useCallback((userId: string) => {
    navigate(`/admin/users/${userId}`);
  }, [navigate]);

  // #10: Handle sort with useCallback
  const handleGroupSort = useCallback((field: keyof GroupRow) => {
    if (groupSortField === field) {
      setGroupSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setGroupSortField(field);
      setGroupSortOrder('desc');
    }
  }, [groupSortField]);
 // Loading state
  if (!metrics && !error) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Admin Dashboard"
        subtitle="Global operational view across groups, members, and system activity."
      />

      {user.authSource === "local-admin" && (
        <div className="mb-6 rs-alert rs-alert-warning">
          This admin session is local to the client. Dashboard data still
          depends on the current Supabase client being allowed to read the
          relevant tables.
        </div>
      )}

      {error && (
        <div className="mb-6 rs-alert rs-alert-error">
          {error}
        </div>
      )}

      {metrics && (
        <>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Registered Users"
              value={String(metrics.totalUsers)}
              detail={`${metrics.totalMemberships} memberships across all groups.`}
              accentClass="border-l-[#8c74aa]/70 dark:border-l-[#b59ad6]/45"
              tooltip="Total number of registered users across the platform"
            />
            <AdminStatCard
              label="Active Users"
              value={String(metrics.activeUserCount)}
              detail="Activity measured over the last 30 days."
              accentClass="border-l-emerald-400/70 dark:border-l-emerald-400/40"
              tooltip="Users with activity in the past 30 days"
            />
            <AdminStatCard
              label="Groups"
              value={String(metrics.totalGroups)}
              detail={`${metrics.groupRows.filter((group) => group.memberCount <= 1).length} groups currently have only one member.`}
              accentClass="border-l-amber-400/70 dark:border-l-amber-300/40"
              tooltip="Total number of active groups"
            />
            <AdminStatCard
              label="Open Exposure"
              value={formatMoney(metrics.outstandingSettlements)}
              detail={`${metrics.pendingChores} pending chore${metrics.pendingChores === 1 ? "" : "s"} remain unresolved.`}
              accentClass="border-l-red-400/70 dark:border-l-red-400/40"
              tooltip="Total unsettled settlements across all groups"
            />
          </div>

          {/* #5: Export buttons */}
          <div className="mb-6 flex justify-end gap-3">
            <button
              onClick={exportGroupsToCSV}
              className="flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              📊 Export Groups CSV
            </button>
            <button
              onClick={exportUsersToCSV}
              className="flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              👥 Export Users CSV
            </button>
          </div>

          {/* #4: Search inputs */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <input
                type="search"
                placeholder="🔍 Search groups by name or code..."
                value={groupSearch}
                onChange={(e) => {
                  setGroupSearch(e.target.value);
                  setGroupPage(1); // Reset pagination on search
                }}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div className="flex-1">
              <input
                type="search"
                placeholder="🔍 Search users by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1); // Reset pagination on search
                }}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card title="Group Management Snapshot" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200/80 bg-stone-100/70 dark:border-slate-800 dark:bg-slate-800/60">
                      <th 
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 hover:bg-stone-200/50 dark:text-slate-400"
                        onClick={() => handleGroupSort('name')}
                      >
                        Group {groupSortField === 'name' && (groupSortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 hover:bg-stone-200/50 dark:text-slate-400"
                        onClick={() => handleGroupSort('memberCount')}
                      >
                        Members {groupSortField === 'memberCount' && (groupSortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                        Spend
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                        Open
                      </th>
                      <th 
                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 hover:bg-stone-200/50 dark:text-slate-400"
                        onClick={() => handleGroupSort('lastActivity')}
                      >
                        Last activity {groupSortField === 'lastActivity' && (groupSortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedGroups.map((group) => (
                      <GroupTableRow 
                        key={group.id} 
                        group={group} 
                        onClick={handleGroupClick}
                      />
                    ))}
                  </tbody>
                </table>
                
                {/* #9: Empty state */}
                {sortedAndFilteredGroups.length === 0 && (
                  <div className="py-8 text-center text-stone-500">
                    No groups match "{groupSearch}"
                  </div>
                )}
                
                {/* #7: Pagination for groups */}
                {totalGroupPages > 1 && (
                  <div className="flex items-center justify-between border-t border-stone-200/80 px-4 py-3 dark:border-slate-800">
                    <div className="text-sm text-stone-500">
                      Showing {((groupPage - 1) * PAGE_SIZE) + 1} to {Math.min(groupPage * PAGE_SIZE, sortedAndFilteredGroups.length)} of {sortedAndFilteredGroups.length} groups
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGroupPage(p => Math.max(1, p - 1))}
                        disabled={groupPage === 1}
                        className="rounded-lg px-3 py-1 text-sm disabled:opacity-50 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setGroupPage(p => Math.min(totalGroupPages, p + 1))}
                        disabled={groupPage === totalGroupPages}
                        className="rounded-lg px-3 py-1 text-sm disabled:opacity-50 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div>
              <Card title="Recent User Activity">
                <div className="space-y-3">
                  {paginatedUsers.map((profiles) => (
                    <UserRow 
                      key={profiles.id}  profile={profiles}
                      onClick={handleUserClick}
                    />
                  ))}
                  
                  {/* #9: Empty state for users */}
                  {filteredUsers.length === 0 && (
                    <div className="py-8 text-center text-stone-500">
                      No users match "{userSearch}"
                    </div>
                  )}
                  
                  {/* #7: Pagination for users */}
                  {totalUserPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-stone-500">
                        Page {userPage} of {totalUserPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUserPage(p => Math.max(1, p - 1))}
                          disabled={userPage === 1}
                          className="rounded-lg px-3 py-1 text-sm disabled:opacity-50 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                          disabled={userPage === totalUserPages}
                          className="rounded-lg px-3 py-1 text-sm disabled:opacity-50 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <Card title="Platform Totals" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-stone-100/80 px-4 py-4 dark:bg-slate-950/55">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                  Total Spend
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-slate-100">
                  {formatMoney(metrics.totalSpend)}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100/80 px-4 py-4 dark:bg-slate-950/55">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                  Memberships
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-slate-100">
                  {metrics.totalMemberships}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100/80 px-4 py-4 dark:bg-slate-950/55">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                  Pending Chores
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-slate-100">
                  {metrics.pendingChores}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100/80 px-4 py-4 dark:bg-slate-950/55">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                  Outstanding Settlements
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-slate-100">
                  {formatMoney(metrics.outstandingSettlements)}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}