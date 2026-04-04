import { useMemo, useState } from 'react';
import type { Chore } from '../types/Chore';
import type { Expense } from '../types/Expense';
import type { Group } from '../types/Group';
import type { GroupMember } from '../types/Member';
import { getChoreIcon } from '../lib/choreIcons';

type TrackingEventType = 'chore' | 'payment' | 'scheduled';

interface TrackingEvent {
  id: string;
  dateKey: string;
  type: TrackingEventType;
  icon: string;
  title: string;
  detail: string;
  amount?: number;
}

interface TrackingCalendarProps {
  chores: Chore[];
  expenses: Expense[];
  groups: Group[];
  members: GroupMember[];
  loading?: boolean;
  showGroupName?: boolean;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

function makeDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  date.setHours(12, 0, 0, 0);
  return date;
}

function parseDateValue(value: string) {
  if (!value) return null;

  const exactMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (exactMatch) {
    return makeDate(Number(exactMatch[1]), Number(exactMatch[2]) - 1, Number(exactMatch[3]));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return makeDate(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  return makeDate(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number) {
  return makeDate(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfMonth(date: Date) {
  return makeDate(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return makeDate(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function endOfWeek(date: Date) {
  return addDays(date, 6 - date.getDay());
}

function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function daysBetween(start: Date, end: Date) {
  const diff = parseDateValue(formatDateKey(end))!.getTime() - parseDateValue(formatDateKey(start))!.getTime();
  return Math.round(diff / 86400000);
}

function getFrequencyMode(frequency: string) {
  const normalized = frequency.trim().toLowerCase();
  if (normalized === 'daily') return 'daily';
  if (normalized === 'weekly') return 'weekly';
  if (normalized === 'bi-weekly' || normalized === 'biweekly' || normalized === 'every 2 weeks') return 'biweekly';
  if (normalized === 'monthly') return 'monthly';
  return 'other';
}

function sortEvents(events: TrackingEvent[]) {
  const typeOrder: Record<TrackingEventType, number> = { scheduled: 0, payment: 1, chore: 2 };
  return [...events].sort((left, right) => {
    if (left.dateKey !== right.dateKey) return left.dateKey.localeCompare(right.dateKey);
    if (typeOrder[left.type] !== typeOrder[right.type]) return typeOrder[left.type] - typeOrder[right.type];
    if ((right.amount ?? 0) !== (left.amount ?? 0)) return (right.amount ?? 0) - (left.amount ?? 0);
    return left.title.localeCompare(right.title);
  });
}

function eventTone(type: TrackingEventType) {
  if (type === 'scheduled') {
    return {
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
      chip: 'border-amber-200/90 bg-amber-50/85 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100',
      dot: 'bg-amber-400 dark:bg-amber-300',
      label: 'Scheduled',
    };
  }

  if (type === 'payment') {
    return {
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
      chip: 'border-emerald-200/90 bg-emerald-50/85 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100',
      dot: 'bg-emerald-400 dark:bg-emerald-300',
      label: 'Payment',
    };
  }

  return {
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200',
    chip: 'border-violet-200/90 bg-violet-50/85 text-violet-900 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-100',
    dot: 'bg-violet-400 dark:bg-violet-300',
    label: 'Chore',
  };
}

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function isScheduledExpense(expense: Pick<Expense, 'is_paid' | 'date'>) {
  return Boolean(expense.date) && expense.date > getTodayDateKey() && !expense.is_paid;
}

function buildChoreEvents(
  chores: Chore[],
  membersByUserId: Map<string, string>,
  groupsById: Map<string, string>,
  rangeStart: Date,
  rangeEnd: Date,
  showGroupName: boolean,
) {
  const events: TrackingEvent[] = [];

  const pushEvent = (chore: Chore, date: Date) => {
    const assigneeName = chore.assigned_to
      ? membersByUserId.get(chore.assigned_to) ?? 'Unknown'
      : 'Unassigned';
    const detailParts = [chore.frequency, `Assigned to ${assigneeName}`];
    const groupName = groupsById.get(chore.group_id);

    if (showGroupName && groupName) detailParts.push(groupName);

    events.push({
      id: `chore-${chore.id}-${formatDateKey(date)}`,
      dateKey: formatDateKey(date),
      type: 'chore',
      icon: chore.icon?.trim() || getChoreIcon(chore.name),
      title: chore.name,
      detail: detailParts.join(' · '),
    });
  };

  for (const chore of chores) {
    const anchorDate = parseDateValue(chore.created_at);
    if (!anchorDate) continue;

    const frequencyMode = getFrequencyMode(chore.frequency);

    if (frequencyMode === 'monthly') {
      const anchorMonthStart = makeDate(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
      const rangeMonthStart = makeDate(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
      const firstMonth = anchorMonthStart > rangeMonthStart ? anchorMonthStart : rangeMonthStart;

      for (
        let monthCursor = firstMonth;
        monthCursor <= rangeEnd;
        monthCursor = addMonths(monthCursor, 1)
      ) {
        const daysInMonth = makeDate(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
        const occurrenceDate = makeDate(
          monthCursor.getFullYear(),
          monthCursor.getMonth(),
          Math.min(anchorDate.getDate(), daysInMonth),
        );

        if (occurrenceDate < anchorDate || occurrenceDate < rangeStart || occurrenceDate > rangeEnd) continue;
        pushEvent(chore, occurrenceDate);
      }

      continue;
    }

    const intervalDays = frequencyMode === 'daily'
      ? 1
      : frequencyMode === 'weekly'
        ? 7
        : frequencyMode === 'biweekly'
          ? 14
          : 0;

    if (!intervalDays) {
      if (anchorDate >= rangeStart && anchorDate <= rangeEnd) pushEvent(chore, anchorDate);
      continue;
    }

    let occurrenceDate = anchorDate;
    if (occurrenceDate < rangeStart) {
      const elapsedDays = daysBetween(anchorDate, rangeStart);
      occurrenceDate = addDays(anchorDate, Math.ceil(elapsedDays / intervalDays) * intervalDays);
    }

    while (occurrenceDate <= rangeEnd) {
      if (occurrenceDate >= rangeStart) pushEvent(chore, occurrenceDate);
      occurrenceDate = addDays(occurrenceDate, intervalDays);
    }
  }

  return events;
}

function buildExpenseEvents(
  expenses: Expense[],
  groupsById: Map<string, string>,
  rangeStart: Date,
  rangeEnd: Date,
  showGroupName: boolean,
) {
  const events: TrackingEvent[] = [];

  for (const expense of expenses) {
    const expenseDate = parseDateValue(expense.date);
    if (!expenseDate || expenseDate < rangeStart || expenseDate > rangeEnd) continue;

    const scheduled = isScheduledExpense(expense);
    if (!expense.is_paid && !scheduled) continue;

    const timingLabel = scheduled ? `Scheduled for ${expense.date}` : `Paid ${expense.date}`;
    const detailParts = [
      timingLabel,
      `By ${expense.profiles?.name ?? 'Unknown'}`,
      `$${Number(expense.amount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    ];
    const groupName = groupsById.get(expense.group_id);

    if (showGroupName && groupName) detailParts.push(groupName);

    events.push({
      id: `${scheduled ? 'scheduled' : 'payment'}-${expense.id}`,
      dateKey: formatDateKey(expenseDate),
      type: scheduled ? 'scheduled' : 'payment',
      icon: '💸',
      title: expense.description,
      detail: detailParts.join(' · '),
      amount: Number(expense.amount ?? 0),
    });
  }

  return events;
}

export default function TrackingCalendar({
  chores,
  expenses,
  groups,
  members,
  loading = false,
  showGroupName = false,
}: TrackingCalendarProps) {
  const today = useMemo(() => makeDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), []);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(today));
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(today));

  const rangeStart = useMemo(() => startOfWeek(startOfMonth(monthCursor)), [monthCursor]);
  const rangeEnd = useMemo(() => endOfWeek(endOfMonth(monthCursor)), [monthCursor]);

  const events = useMemo(() => {
    const membersByUserId = new Map(
      members.map(member => [member.user_id, member.profiles?.name ?? member.nickname ?? 'Unknown']),
    );
    const groupsById = new Map(groups.map(group => [group.id, group.name]));

    return sortEvents([
      ...buildChoreEvents(chores, membersByUserId, groupsById, rangeStart, rangeEnd, showGroupName),
      ...buildExpenseEvents(expenses, groupsById, rangeStart, rangeEnd, showGroupName),
    ]);
  }, [chores, expenses, groups, members, rangeEnd, rangeStart, showGroupName]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, TrackingEvent[]>();

    for (const event of events) {
      const list = map.get(event.dateKey) ?? [];
      list.push(event);
      map.set(event.dateKey, list);
    }

    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    for (let current = rangeStart; current <= rangeEnd; current = addDays(current, 1)) {
      days.push(current);
    }
    return days;
  }, [rangeEnd, rangeStart]);

  const monthStats = useMemo(() => {
    const monthStartKey = formatDateKey(startOfMonth(monthCursor));
    const monthEndKey = formatDateKey(endOfMonth(monthCursor));
    const monthEvents = events.filter(event => event.dateKey >= monthStartKey && event.dateKey <= monthEndKey);

    return {
      chores: monthEvents.filter(event => event.type === 'chore').length,
      payments: monthEvents.filter(event => event.type === 'payment').length,
      scheduled: monthEvents.filter(event => event.type === 'scheduled').length,
    };
  }, [events, monthCursor]);

  const selectedDateEvents = eventsByDate.get(selectedDateKey) ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.92fr)_minmax(14rem,0.68fr)]">
      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const previousMonth = addMonths(monthCursor, -1);
                setMonthCursor(previousMonth);
                setSelectedDateKey(formatDateKey(startOfMonth(previousMonth)));
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200/90 bg-white/90 text-stone-700 transition hover:border-stone-300 hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m12.5 4.5-5 5 5 5" />
              </svg>
            </button>

            <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
              Tracking
            </p>
            <h3 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-slate-100">
              {MONTH_FORMATTER.format(monthCursor)}
            </h3>
          </div>
            <button
              type="button"
              onClick={() => {
                const nextMonth = addMonths(monthCursor, 1);
                setMonthCursor(nextMonth);
                setSelectedDateKey(formatDateKey(startOfMonth(nextMonth)));
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200/90 bg-white/90 text-stone-700 transition hover:border-stone-300 hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              aria-label="Next month"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 4.5 5 5-5 5" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMonthCursor(startOfMonth(today));
                setSelectedDateKey(formatDateKey(today));
              }}
              className="rounded-2xl border border-stone-200/90 bg-white/90 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              Today
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {([
            ['Recurring chores', monthStats.chores, 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200'],
            ['Payments', monthStats.payments, 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'],
            ['Scheduled', monthStats.scheduled, 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'],
          ] as const).map(([label, value, className]) => (
            <span key={label} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${className}`}>
              {value} {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-slate-500">
          {WEEKDAY_LABELS.map(label => (
            <div key={label} className="pb-1">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date) => {
            const dayKey = formatDateKey(date);
            const dayEvents = eventsByDate.get(dayKey) ?? [];
            const isCurrentMonth = isSameMonth(date, monthCursor);
            const isSelected = selectedDateKey === dayKey;
            const isToday = dayKey === formatDateKey(today);

            return (
              <button
                key={dayKey}
                type="button"
                onClick={() => setSelectedDateKey(dayKey)}
                className={`relative min-h-28 rounded-3xl border p-3 text-left transition-all sm:min-h-32 ${
                  isSelected
                    ? 'border-[#8c74aa]/50 bg-[#f5f0fb] shadow-[0_16px_36px_-28px_rgba(111,79,139,0.8)] dark:border-[#b59ad6]/40 dark:bg-[#251d2f]'
                    : 'border-stone-200/80 bg-white/82 hover:border-stone-300 hover:bg-stone-50 dark:border-slate-800/70 dark:bg-slate-950/35 dark:hover:border-slate-700 dark:hover:bg-slate-900/70'
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <span
                  className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-2xl text-sm font-bold ${
                    isToday
                      ? 'bg-stone-900 text-white dark:bg-slate-100 dark:text-slate-950'
                      : isSelected
                        ? 'bg-[#8c74aa] text-white dark:bg-[#b59ad6] dark:text-[#1e1727]'
                        : 'bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {date.getDate()}
                </span>

                <div className="space-y-1.5 pt-10">
                  {dayEvents.slice(0, 2).map((event) => {
                    const tone = eventTone(event.type);
                    return (
                      <div
                        key={event.id}
                        className={`rounded-2xl border px-2.5 py-2 text-xs font-medium ${tone.chip}`}
                      >
                        <div className="truncate">
                          <span className="mr-1">{event.icon}</span>
                          {event.title}
                        </div>
                      </div>
                    );
                  })}

                  {dayEvents.length > 2 && (
                    <div className="text-xs font-semibold text-stone-500 dark:text-slate-400">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-stone-200/85 bg-stone-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] xl:ml-auto xl:max-w-[19rem] dark:border-slate-800/75 dark:bg-slate-950/35">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
            Agenda
          </p>
          <h4 className="mt-1 text-lg font-semibold text-stone-900 dark:text-slate-100">
            {FULL_DATE_FORMATTER.format(parseDateValue(selectedDateKey) ?? today)}
          </h4>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {(['chore', 'payment', 'scheduled'] as const).map((type) => {
            const tone = eventTone(type);
            return (
              <span key={type} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.badge}`}>
                {tone.label}
              </span>
            );
          })}
        </div>

        {loading ? (
          <p className="rounded-[1.5rem] border border-dashed border-stone-200/90 bg-white/75 px-4 py-8 text-center text-sm text-stone-500 dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-400">
            Loading tracking data...
          </p>
        ) : selectedDateEvents.length === 0 ? (
          <p className="rounded-[1.5rem] border border-dashed border-stone-200/90 bg-white/75 px-4 py-8 text-center text-sm text-stone-500 dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-400">
            Nothing scheduled for this day.
          </p>
        ) : (
          <div className="space-y-2.5">
            {selectedDateEvents.map((event) => {
              const tone = eventTone(event.type);

              return (
                <div
                  key={event.id}
                  className={`rounded-[1.5rem] border px-3 py-3 ${tone.chip}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/65 text-lg shadow-sm dark:bg-slate-950/35">
                      {event.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-semibold">
                          {event.title}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.badge}`}>
                          {tone.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs opacity-85 sm:text-sm">
                        {event.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
