import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DatePicker({ value, onChange, placeholder = 'Select a date' }: DatePickerProps) {
  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : null;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ month: (parsed ?? today).getMonth(), year: (parsed ?? today).getFullYear() });
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('day');
  const ref = useRef<HTMLDivElement>(null);

  const yearStart = view.year - 10;
  const years = Array.from({ length: 21 }, (_, i) => yearStart + i);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setMode('day');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const daysInPrev = new Date(view.year, view.month, 0).getDate();

  const cells: { day: number; type: 'prev' | 'cur' | 'next' }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'prev' });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, type: 'cur' });
  let nextDay = 1;
  while (cells.length % 7 !== 0) cells.push({ day: nextDay++, type: 'next' });

  const isSelected = (day: number) =>
    parsed && parsed.getFullYear() === view.year && parsed.getMonth() === view.month && parsed.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === view.year && today.getMonth() === view.month && today.getDate() === day;

  const select = (day: number) => {
    const month = String(view.month + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    onChange(`${view.year}-${month}-${date}`);
    setOpen(false);
    setMode('day');
  };

  const previousMonth = () =>
    setView(v => (v.month === 0 ? { month: 11, year: v.year - 1 } : { ...v, month: v.month - 1 }));

  const nextMonth = () =>
    setView(v => (v.month === 11 ? { month: 0, year: v.year + 1 } : { ...v, month: v.month + 1 }));

  const displayValue = parsed
    ? parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const NavBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {children}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(o => !o);
          setMode('day');
        }}
        className="flex w-full items-center justify-between rounded-2xl border border-stone-300/80 bg-white/88 px-4 py-3.5 text-base outline-none shadow-sm transition
          hover:border-stone-400 dark:hover:border-slate-500
          focus:border-[#8c74aa] focus:ring-2 focus:ring-[#8c74aa]/15 dark:border-slate-700 dark:bg-slate-900/60 dark:focus:border-[#b59ad6] dark:focus:ring-[#b59ad6]/20"
      >
        <span className={displayValue ? 'text-stone-900 dark:text-slate-100' : 'text-stone-400 dark:text-slate-500'}>
          {displayValue || placeholder}
        </span>
        <svg className="h-5 w-5 shrink-0 text-stone-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="4" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-2xl border border-stone-300/80 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-950">
          {mode === 'day' && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <NavBtn onClick={previousMonth}>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                </NavBtn>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMode('month')}
                    className="rounded-lg px-2 py-1 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-white/5"
                  >
                    {MONTHS[view.month]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('year')}
                    className="rounded-lg px-2 py-1 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-white/5"
                  >
                    {view.year}
                  </button>
                </div>

                <NavBtn onClick={nextMonth}>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z" />
                  </svg>
                </NavBtn>
              </div>

              <div className="mb-1 grid grid-cols-7">
                {DAYS.map(day => (
                  <div key={day} className="py-1 text-center text-xs font-semibold text-stone-400 dark:text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((cell, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={cell.type !== 'cur'}
                    onClick={() => cell.type === 'cur' && select(cell.day)}
                    className={[
                      'aspect-square flex items-center justify-center rounded-full text-sm transition',
                      cell.type !== 'cur'
                        ? 'cursor-default text-stone-300 dark:text-slate-700'
                        : isSelected(cell.day)
                        ? 'bg-[#6f4f8b] text-white font-semibold dark:bg-[#2b2136] dark:text-[#e2d4f0]'
                        : isToday(cell.day)
                          ? 'font-bold text-[#6f4f8b] hover:bg-stone-100 dark:text-[#d4c0ea] dark:hover:bg-white/5'
                            : 'text-stone-900 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-white/5',
                    ].join(' ')}
                  >
                    {cell.day}
                  </button>
                ))}
              </div>
            </>
          )}

          {mode === 'month' && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <NavBtn onClick={() => setView(v => ({ ...v, year: v.year - 1 }))}>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                </NavBtn>
                <button
                  type="button"
                  onClick={() => setMode('year')}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-stone-900 transition hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-white/5"
                >
                  {view.year}
                </button>
                <NavBtn onClick={() => setView(v => ({ ...v, year: v.year + 1 }))}>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z" />
                  </svg>
                </NavBtn>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {SHORT_MONTHS.map((month, i) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      setView(v => ({ ...v, month: i }));
                      setMode('day');
                    }}
                    className={[
                      'rounded-xl py-2 text-sm font-medium transition',
                      i === view.month
                        ? 'bg-[#6f4f8b] text-white dark:bg-[#2b2136] dark:text-[#e2d4f0]'
                        : 'text-stone-900 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-white/5',
                    ].join(' ')}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </>
          )}

          {mode === 'year' && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <NavBtn onClick={() => setView(v => ({ ...v, year: v.year - 21 }))}>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                </NavBtn>
                <span className="text-sm font-semibold text-stone-900 dark:text-slate-100">
                  {yearStart} - {yearStart + 20}
                </span>
                <NavBtn onClick={() => setView(v => ({ ...v, year: v.year + 21 }))}>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z" />
                  </svg>
                </NavBtn>
              </div>

              <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
                {years.map(year => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      setView(v => ({ ...v, year }));
                      setMode('month');
                    }}
                    className={[
                      'rounded-xl py-2 text-sm font-medium transition',
                      year === view.year
                        ? 'bg-[#6f4f8b] text-white dark:bg-[#2b2136] dark:text-[#e2d4f0]'
                        : 'text-stone-900 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-white/5',
                    ].join(' ')}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
