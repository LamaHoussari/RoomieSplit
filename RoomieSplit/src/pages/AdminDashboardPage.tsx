import { useNavigate } from "react-router-dom";
import { Users, Home, ClipboardList, DollarSign, AlertCircle } from "lucide-react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import PageHeader from "../components/PageHeader";
import { Skeleton, SkeletonCard } from "../components/Skeleton";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { getSettlementRemaining, roundCurrency } from "../lib/finance";

function formatMoney(value: number) {
  return `$${roundCurrency(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatRelative(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Quick nav card component
function NavCard({
  icon: Icon,
  label,
  description,
  count,
  color,
  iconColor,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  count: number;
  color: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full p-5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#6f4f8b] dark:hover:border-[#8d70b0] hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={20} className={iconColor} />
        </span>
        <span className="text-2xl font-bold text-stone-900 dark:text-white">{count}</span>
      </div>
      <p className="font-semibold text-stone-900 dark:text-white group-hover:text-[#6f4f8b] dark:group-hover:text-[#d4c0ea] transition-colors">
        {label}
      </p>
      <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">{description}</p>
    </button>
  );
}

export default function AdminDashboardPage() {
  const { snapshot, loading } = useAdminDashboard();
  const navigate = useNavigate();

  const metrics = (() => {
    if (!snapshot) return null;

    const nonAdminProfiles = snapshot.profiles.filter((profile) => !profile.is_system_admin);
    const totalSpend = snapshot.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const outstandingSettlements = snapshot.settlements.reduce(
      (sum, settlement) => sum + getSettlementRemaining(settlement),
      0
    );
    const deactivatedCount = nonAdminProfiles.filter((profile) => profile.is_active === false).length;

    const spendByGroup: Record<string, { name: string; total: number }> = {};
    for (const expense of snapshot.expenses) {
      if (!expense.group_id) continue;

      const groupName = expense.groups?.name || "Unknown";
      if (!spendByGroup[expense.group_id]) {
        spendByGroup[expense.group_id] = { name: groupName, total: 0 };
      }

      spendByGroup[expense.group_id].total += Number(expense.amount || 0);
    }

    const profileById = new Map(snapshot.profiles.map((profile) => [profile.id, profile]));
    const resolveActor = (profileId: string | null | undefined) => {
      const profile = profileById.get(profileId ?? "");
      return profile?.name || profile?.email || "Unknown";
    };

    const events = [
      ...snapshot.expenses.map((expense) => ({
        id: `exp-${expense.id}`,
        timestamp: expense.created_at,
        actor: resolveActor(expense.created_by),
        action: "Added expense",
        detail: expense.description || "—",
        badge: "green" as const,
      })),
      ...snapshot.chores.map((chore) => ({
        id: `chore-${chore.id}`,
        timestamp: chore.created_at,
        actor: resolveActor(chore.created_by),
        action: "Created chore",
        detail: chore.name || "—",
        badge: "purple" as const,
      })),
      ...snapshot.settlements.map((settlement) => ({
        id: `set-${settlement.id}`,
        timestamp: settlement.created_at,
        actor: resolveActor(settlement.from_user_id),
        action: "Updated balance",
        detail: settlement.groups?.name || "—",
        badge: "orange" as const,
      })),
    ]
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 8);

    return {
      totalUsers: nonAdminProfiles.length,
      activeUsers: nonAdminProfiles.length - deactivatedCount,
      totalGroups: snapshot.groups.length,
      totalExpenses: snapshot.expenses.length,
      totalSpend,
      outstandingSettlements,
      deactivatedCount,
      topGroups: Object.values(spendByGroup)
        .sort((left, right) => right.total - left.total)
        .slice(0, 5),
      events,
    };
  })();

  if (loading) {
    return (
      <>
        <PageHeader
          eyebrow="Operations"
          title="Admin Dashboard"
          subtitle="System overview — monitor activity, users, and finances."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rs-panel p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="h-6 w-24" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          <div className="rs-panel p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!metrics) return null;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Admin Dashboard"
        subtitle="System overview — monitor activity, users, and finances."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: metrics.totalUsers, sub: `${metrics.deactivatedCount} deactivated`, Icon: Users, iconColor: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30" },
          { label: "Total Groups", value: metrics.totalGroups, sub: `${metrics.totalExpenses} expenses logged`, Icon: Home, iconColor: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Total Spend", value: formatMoney(metrics.totalSpend), sub: "across all groups", Icon: DollarSign, iconColor: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Outstanding", value: formatMoney(metrics.outstandingSettlements), sub: "unsettled balances", Icon: AlertCircle, iconColor: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.Icon size={16} className={kpi.iconColor} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-slate-500">
                {kpi.label}
              </p>
            </div>
            <p className="text-3xl font-bold text-stone-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-stone-400 dark:text-slate-500 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <NavCard
          icon={Users}
          label="Manage Users"
          description="View, activate, or deactivate users"
          count={metrics.totalUsers}
          color="bg-purple-50 dark:bg-purple-950/30"
          iconColor="text-purple-600 dark:text-purple-400"
          onClick={() => navigate("/admin/users")}
        />
        <NavCard
          icon={Home}
          label="Manage Groups"
          description="View details and archive groups"
          count={metrics.totalGroups}
          color="bg-blue-50 dark:bg-blue-950/30"
          iconColor="text-blue-600 dark:text-blue-400"
          onClick={() => navigate("/admin/groups")}
        />
        <NavCard
          icon={ClipboardList}
          label="Audit Log"
          description="Track all system actions"
          count={metrics.events.length}
          color="bg-amber-50 dark:bg-amber-950/30"
          iconColor="text-amber-600 dark:text-amber-400"
          onClick={() => navigate("/admin/audit")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-3 pt-2">
            {metrics.events.length === 0 && (
              <p className="text-sm text-stone-500 py-4 text-center">No recent activity.</p>
            )}
            {metrics.events.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3">
                <Badge variant={ev.badge}>{ev.action}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800 dark:text-white font-medium truncate">{ev.detail}</p>
                  <p className="text-xs text-stone-400 dark:text-slate-500">by {ev.actor}</p>
                </div>
                <span className="text-xs text-stone-400 dark:text-slate-500 whitespace-nowrap">
                  {formatRelative(ev.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Groups by Spend */}
        <Card title="Top Groups by Spend">
          <div className="space-y-3 pt-2">
            {metrics.topGroups.length === 0 && (
              <p className="text-sm text-stone-500 py-4 text-center">No expense data yet.</p>
            )}
            {metrics.topGroups.map((g, i) => {
              const pct = metrics.totalSpend > 0 ? (g.total / metrics.totalSpend) * 100 : 0;
              return (
                <div key={g.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-stone-800 dark:text-white">
                      <span className="text-stone-400 dark:text-slate-500 mr-2">#{i + 1}</span>
                      {g.name}
                    </span>
                    <span className="text-stone-600 dark:text-slate-300">{formatMoney(g.total)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6f4f8b] dark:bg-[#8d70b0] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

