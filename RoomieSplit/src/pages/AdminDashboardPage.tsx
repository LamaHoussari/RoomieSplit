import React, { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { getSettlementRemaining, roundCurrency } from "../lib/finance";
import type { AppUser } from "../types/auth";

function formatMoney(value: number) {
  return `$${roundCurrency(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "No activity";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No activity";
  return parsed.toLocaleDateString();
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatRelativeDate(timestamp: number) {
  if (!timestamp) return "No activity";

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return formatDate(date.toISOString());
}

const UserDetailsPanel = ({
  user,
  onClose,
  onToggleSuspend,
}: any) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="w-[380px] bg-white dark:bg-slate-900 p-6 shadow-xl">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-stone-500">{user.email}</p>

        <div className="mt-4 space-y-2 text-sm">
          <p><strong>Groups:</strong> {user.groupCount}</p>
          <p><strong>Last Activity:</strong> {formatRelativeDate(user.lastActivity)}</p>
        </div>

        <button
          onClick={() => onToggleSuspend(user.id)}
          className="mt-6 w-full rounded-lg bg-red-500 text-white py-2"
        >
          Suspend / Reactivate
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-lg border py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function AdminDashboardPage({ user }: { user: AppUser }) {
  const { snapshot, error } = useAdminDashboard();
  const navigate = useNavigate();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);

  const handleUserClick = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setIsUserPanelOpen(true);
  }, []);

  const handleToggleSuspend = (userId: string) => {
    console.log("Toggle suspend:", userId);
  };

  const handleGroupView = (groupId: string) => {
    navigate(`/admin/groups/${groupId}`);
  };

  const metrics = useMemo(() => {
    if (!snapshot) return null;

    const totalSpend = snapshot.expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    const outstandingSettlements = snapshot.settlements.reduce(
      (sum, s) => sum + getSettlementRemaining(s),
      0
    );

    const userRows = snapshot.profiles.map((p) => ({
      id: p.id,
      name: p.name || p.email,
      email: p.email,
      groupCount: 0,
      lastActivity: toTimestamp(p.created_at),
      activeRecently: true,
    }));

    return {
      totalUsers: snapshot.profiles.length,
      totalGroups: snapshot.groups.length,
      totalSpend,
      outstandingSettlements,
      userRows,
    };
  }, [snapshot]);

  if (!metrics && !error) return <div>Loading...</div>;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Admin Dashboard"
        subtitle="Global operational view."
      />

      {metrics && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card title="Users">{metrics.totalUsers}</Card>
            <Card title="Groups">{metrics.totalGroups}</Card>
            <Card title="Total Spend">
              {formatMoney(metrics.totalSpend)}
            </Card>
            <Card title="Outstanding Unpaid">
              {formatMoney(metrics.outstandingSettlements)}
            </Card>
          </div>

          <Card title="Groups">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {snapshot?.groups.map((g) => (
                  <tr key={g.id}>
                    <td>{g.name}</td>
                    <td>
                      <button
                        onClick={() => handleGroupView(g.id)}
                        className="mr-2 bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        View
                      </button>
                      <button
                        onClick={() => console.log("Archive", g.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Users">
            <div className="space-y-2">
              {metrics.userRows.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleUserClick(u.id)}
                  className="cursor-pointer flex justify-between p-2 hover:bg-gray-100"
                >
                  <div>
                    <p>{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <Badge>{u.activeRecently ? "Active" : "Quiet"}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {isUserPanelOpen && (
        <UserDetailsPanel
          user={metrics?.userRows.find((u) => u.id === selectedUserId)}
          onClose={() => setIsUserPanelOpen(false)}
          onToggleSuspend={handleToggleSuspend}
        />
      )}
    </>
  );
}