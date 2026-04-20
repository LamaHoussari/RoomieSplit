import Badge from './Badge';
import type { Chore } from '../types/Chore';
import type { GroupMember } from '../types/Member';
import { getChoreIcon } from '../lib/choreIcons';

interface ChoreRowProps {
  chore: Chore;
  members: GroupMember[];
  userId: string;
  isAdmin: boolean;
  showArchived: boolean;
  onToggleDone: (choreId: string, isCompleted: boolean) => void;
  onArchive: (choreId: string) => void;
  onUnarchive: (choreId: string) => void;
  onRemove: (choreId: string) => void;
}

export default function ChoreRow({
  chore,
  members,
  userId,
  isAdmin,
  showArchived,
  onToggleDone,
  onArchive,
  onUnarchive,
  onRemove,
}: ChoreRowProps) {
  const canManageChore = isAdmin || chore.created_by === userId;

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl px-2 py-4 transition-colors sm:flex-row sm:items-center ${
        showArchived
          ? 'hover:bg-amber-50/80 dark:hover:bg-amber-950/10'
          : 'hover:bg-stone-100/80 dark:hover:bg-white/5'
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl
            ${
              showArchived
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200'
                : chore.is_completed
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                  : 'bg-stone-200/80 text-stone-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
        >
          <span className="text-lg">{chore.icon?.trim() || getChoreIcon(chore.name)}</span>
        </span>
        <div className="min-w-0">
          <p
            className={`truncate text-base font-semibold ${
              showArchived
                ? 'text-stone-700 dark:text-amber-50'
                : chore.is_completed
                  ? 'text-stone-500 line-through dark:text-slate-400'
                  : 'text-stone-900 dark:text-slate-100'
            }`}
          >
            {chore.name}
          </p>
          <p
            className={`mt-0.5 text-sm ${
              showArchived ? 'text-amber-700/80 dark:text-amber-100/75' : 'text-stone-500 dark:text-slate-400'
            }`}
          >
            {chore.frequency}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:ml-auto">
        <div className="flex w-24 justify-end shrink-0">
          <Badge variant="violet">
            {chore.assigned_to ? members.find(m => m.user_id === chore.assigned_to)?.profiles?.name ?? 'Unknown' : 'Unassigned'}
          </Badge>
        </div>
        <div className="flex w-24 justify-center shrink-0 ml-1">
          {chore.is_completed ? <Badge variant="green">Completed</Badge> : <Badge variant="orange">Pending</Badge>}
        </div>

        {!showArchived ? (
          <>
            <button
              type="button"
              title={canManageChore ? 'Archive' : 'Only the chore creator can archive this chore'}
              onClick={canManageChore ? () => onArchive(chore.id) : undefined}
              disabled={!canManageChore}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                canManageChore
                  ? 'text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                  : 'cursor-not-allowed text-stone-300 dark:text-slate-700'
              }`}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h14M5 4.5h10a1 1 0 0 1 1 1v2H4v-2a1 1 0 0 1 1-1Zm0 3v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7m-7 3h4" />
              </svg>
            </button>

            {(isAdmin || chore.created_by === userId) && (
              <button
                type="button"
                title="Remove"
                onClick={() => onRemove(chore.id)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            title={canManageChore ? 'Unarchive' : 'Only the chore creator or an admin can unarchive this chore'}
            onClick={canManageChore ? () => onUnarchive(chore.id) : undefined}
            disabled={!canManageChore}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              canManageChore
                ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                : 'cursor-not-allowed text-stone-300 dark:text-slate-700'
            }`}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 13V5m0 0-3 3m3-3 3 3M4 13.5v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
            </svg>
          </button>
        )}

        {!showArchived && (
          <button
            type="button"
            title={chore.is_completed ? 'Mark undone' : 'Mark done'}
            onClick={() => onToggleDone(chore.id, !chore.is_completed)}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150
              ${
                chore.is_completed
                  ? 'border-emerald-500 bg-emerald-500 text-white hover:border-emerald-600 hover:bg-emerald-600'
                  : 'border-stone-300 bg-white text-transparent hover:border-stone-500 dark:border-slate-600 dark:bg-transparent dark:hover:border-slate-400'
              }`}
          >
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3 w-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
