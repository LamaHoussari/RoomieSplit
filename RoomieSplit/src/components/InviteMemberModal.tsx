import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import {
  lookupUserByEmail,
  addMemberByEmail,
  sendInviteEmail,
} from "../services/inviteService";

interface InviteMemberModalProps {
  groupId: string;
  groupName: string;
  groupCode: string;
  inviterName: string;
  onClose: () => void;
  onMemberAdded: () => void;
  loading: boolean;
}

type Tab = "email" | "code";

export default function InviteMemberModal({
  groupId,
  groupName,
  groupCode,
  inviterName,
  onClose,
  onMemberAdded,
  loading,
}: InviteMemberModalProps) {
  const [tab, setTab] = useState<Tab>("email");
  const [email, setEmail] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  async function handleInviteByEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLocalLoading(true);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter an email address.");
      setLocalLoading(false);
      return;
    }

    // 1. Check if user already exists
    const { data: profile, error: lookupErr } =
      await lookupUserByEmail(trimmed);

    if (lookupErr) {
      setError(lookupErr.message);
      setLocalLoading(false);
      return;
    }

    if (profile) {
      // User exists → add them directly
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

    // 2. User not registered → send invite email
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
      setError("Failed to copy code.");
    }
  }

  const tabClass = (t: Tab) =>
    `flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
      tab === t
        ? "bg-purple-600 text-white shadow-sm"
        : "text-purple-700 dark:text-purple-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/30"
    }`;

  return (
    <Modal title="Invite Member" onClose={onClose}>
      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl bg-purple-50/70 dark:bg-purple-900/20 border border-purple-100/60 dark:border-purple-900/50 mb-5">
        <button type="button" className={tabClass("email")} onClick={() => { setTab("email"); setError(""); setSuccess(""); }}>
          Invite by Email
        </button>
        <button type="button" className={tabClass("code")} onClick={() => { setTab("code"); setError(""); setSuccess(""); }}>
          Share Code
        </button>
      </div>

      {/* ── Email Tab ── */}
      {tab === "email" && (
        <form onSubmit={handleInviteByEmail} className="space-y-4">
          <div>
            <label
              htmlFor="invite-email"
              className="block text-sm font-medium text-purple-700 dark:text-purple-200 mb-1.5"
            >
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="roommate@example.com"
              className="w-full rounded-xl border border-purple-200/80 dark:border-purple-800 bg-white dark:bg-purple-950/50 px-4 py-2.5 text-purple-900 dark:text-purple-100 placeholder:text-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
            />
            <p className="text-xs text-purple-500/70 dark:text-purple-400/60 mt-1.5">
              If they're already on RoomieSplit they'll be added instantly. Otherwise they'll receive an invite email with the group code.
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
            {localLoading ? "Sending…" : "Send Invite"}
          </Button>
        </form>
      )}

      {/* ── Code Tab ── */}
      {tab === "code" && (
        <div className="space-y-4">
          <p className="text-sm text-purple-700/70 dark:text-purple-200/70">
            Share this code with your roommate. They can join by going to{" "}
            <span className="font-semibold">Groups → Join Group</span> and entering the code.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-purple-100/70 dark:bg-purple-900/30 border border-purple-200/70 dark:border-purple-900/60 px-4 py-3 text-center text-lg font-bold tracking-widest text-purple-900 dark:text-purple-100 select-all">
              {groupCode}
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              {codeCopied ? "Copied!" : "Copy"}
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
