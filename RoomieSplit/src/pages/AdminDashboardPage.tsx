import { useMemo } from "react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { getSettlementRemaining, roundCurrency } from "../lib/finance";
import type { AppUser } from "../types/auth";
import { SkeletonCard } from "../components/Skeleton";

const THIRTY_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 30;

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

function AdminStatCard({
  label,
  value,
  detail,
  accentClass,
}: {
  label: string;
  value: string;
  detail: string;
  accentClass: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-stone-200/80 border-l-4 bg-white/84 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:bg-slate-900/78 ${accentClass}`}
    >
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
}
const today = Date.now();
export default function AdminDashboardPage({ user }: { user: AppUser }) {
  const { snapshot, error } = useAdminDashboard();

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

  if (!metrics && !error) {
  return (
    <>
      <PageHeader eyebrow="" title="Admin Dashboard" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </>
  );
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
            />
            <AdminStatCard
              label="Active Users"
              value={String(metrics.activeUserCount)}
              detail="Activity measured over the last 30 days."
              accentClass="border-l-emerald-400/70 dark:border-l-emerald-400/40"
            />
            <AdminStatCard
              label="Groups"
              value={String(metrics.totalGroups)}
              detail={`${metrics.groupRows.filter((group) => group.memberCount <= 1).length} groups currently have only one member.`}
              accentClass="border-l-amber-400/70 dark:border-l-amber-300/40"
            />
            <AdminStatCard
              label="Open Exposure"
              value={formatMoney(metrics.outstandingSettlements)}
              detail={`${metrics.pendingChores} pending chore${metrics.pendingChores === 1 ? "" : "s"} remain unresolved.`}
              accentClass="border-l-red-400/70 dark:border-l-red-400/40"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card title="Group Management Snapshot" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200/80 bg-stone-100/70 dark:border-slate-800 dark:bg-slate-800/60">
                      {[
                        "Group",
                        "Members",
                        "Spend",
                        "Open",
                        "Last activity",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.groupRows.slice(0, 10).map((group) => (
                      <tr
                        key={group.id}
                        className="border-b border-stone-200/60 align-top transition-colors last:border-0 hover:bg-stone-100/70 dark:border-slate-800/50 dark:hover:bg-white/5"
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
                              Admin:{" "}
                              {group.adminNames.length
                                ? group.adminNames.join(", ")
                                : "Unknown"}
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
                            <Badge
                              variant={
                                group.pendingChoreCount > 0 ? "orange" : "green"
                              }
                            >
                              {group.pendingChoreCount} chores
                            </Badge>
                            <Badge
                              variant={
                                group.unpaidExpenseCount > 0
                                  ? "violet"
                                  : "green"
                              }
                            >
                              {group.unpaidExpenseCount} unpaid
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
                            {formatMoney(group.outstandingSettlementTotal)}{" "}
                            unsettled
                          </p>
                        </td>
                        <td className="px-4 py-4 text-stone-500 dark:text-slate-400">
                          {formatDate(
                            group.lastActivity
                              ? new Date(group.lastActivity).toISOString()
                              : group.createdAt,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div>
              <Card title="Recent User Activity">
                <div className="space-y-3">
                  {metrics.userRows.slice(0, 8).map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-stone-100/70 dark:hover:bg-white/5"
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
                        <Badge
                          variant={profile.activeRecently ? "green" : "violet"}
                        >
                          {profile.activeRecently ? "Active" : "Quiet"}
                        </Badge>
                        <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">
                          {profile.groupCount} group
                          {profile.groupCount === 1 ? "" : "s"} •{" "}
                          {formatDate(
                            profile.lastActivity
                              ? new Date(profile.lastActivity).toISOString()
                              : null,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
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
