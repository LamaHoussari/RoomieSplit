import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DatePicker({ value, onChange, placeholder = 'Select a date' }: DatePickerProps) {
  const today = new Date();
  const parsed = value ? new Date(value + 'T00:00:00') : null;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ month: (parsed ?? today).getMonth(), year: (parsed ?? today).getFullYear() });
  const [mode, setMode] = useState<'day' | 'month' | 'year'>('day');
  const ref = useRef<HTMLDivElement>(null);

  // year range: 10 years back, 10 forward
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
  let next = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next++, type: 'next' });

  const isSelected = (day: number) =>
    parsed && parsed.getFullYear() === view.year && parsed.getMonth() === view.month && parsed.getDate() === day;
  const isToday = (day: number) =>
    today.getFullYear() === view.year && today.getMonth() === view.month && today.getDate() === day;

  const select = (day: number) => {
    const m = String(view.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${view.year}-${m}-${d}`);
    setOpen(false);
    setMode('day');
  };

  const prev = () => setView(v => v.month === 0 ? { month: 11, year: v.year - 1 } : { ...v, month: v.month - 1 });
  const next2 = () => setView(v => v.month === 11 ? { month: 0, year: v.year + 1 } : { ...v, month: v.month + 1 });

  const displayValue = parsed
    ? parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const NavBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 text-purple-600 dark:text-purple-300 transition">
      {children}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setMode('day'); }}
        className="w-full flex items-center justify-between bg-white/90 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 rounded-2xl px-4 py-3.5 text-base outline-none shadow-sm
          hover:border-purple-400 dark:hover:border-purple-500
          focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200/60 dark:focus:ring-purple-700/40 transition"
      >
        <span className={displayValue ? 'text-purple-900 dark:text-purple-100' : 'text-purple-400/90 dark:text-purple-300/60'}>
          {displayValue || placeholder}
        </span>
        <svg className="w-5 h-5 text-purple-500/80 dark:text-purple-300/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="4" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-purple-950 border border-purple-200/80 dark:border-purple-800/80 rounded-2xl shadow-lg p-4 w-72">

          {/* ── DAY VIEW ── */}
          {mode === 'day' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <NavBtn onClick={prev}>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                </NavBtn>

                <div className="flex items-center gap-1">
                  {/* Clickable month */}
                  <button type="button" onClick={() => setMode('month')}
                    className="text-sm font-semibold text-purple-900 dark:text-purple-100 px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/40 transition">
                    {MONTHS[view.month]}
                  </button>
                  {/* Clickable year */}
                  <button type="button" onClick={() => setMode('year')}
                    className="text-sm font-semibold text-purple-900 dark:text-purple-100 px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/40 transition">
                    {view.year}
                  </button>
                </div>

                <NavBtn onClick={next2}>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z" />
                  </svg>
                </NavBtn>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-purple-400/80 dark:text-purple-300/60 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((cell, i) => (
                  <button key={i} type="button"
                    disabled={cell.type !== 'cur'}
                    onClick={() => cell.type === 'cur' && select(cell.day)}
                    className={[
                      'aspect-square flex items-center justify-center rounded-full text-sm transition',
                      cell.type !== 'cur' ? 'text-purple-300/50 dark:text-purple-700/50 cursor-default' :
                      isSelected(cell.day) ? 'bg-purple-600 text-white font-semibold' :
                      isToday(cell.day) ? 'text-purple-600 dark:text-purple-300 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/40' :
                      'text-purple-900 dark:text-purple-100 hover:bg-purple-50 dark:hover:bg-purple-900/40',
                    ].join(' ')}
                  >
                    {cell.day}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── MONTH VIEW ── */}
          {mode === 'month' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <NavBtn onClick={() => setView(v => ({ ...v, year: v.year - 1 }))}>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                </NavBtn>
                <button type="button" onClick={() => setMode('year')}
                  className="text-sm font-semibold text-purple-900 dark:text-purple-100 px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/40 transition">
                  {view.year}
                </button>
                <NavBtn onClick={() => setView(v => ({ ...v, year: v.year + 1 }))}>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z" />
                  </svg>
                </NavBtn>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SHORT_MONTHS.map((m, i) => (
                  <button key={m} type="button"
                    onClick={() => { setView(v => ({ ...v, month: i })); setMode('day'); }}
                    className={[
                      'py-2 rounded-xl text-sm font-medium transition',
                      i === view.month
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-900 dark:text-purple-100 hover:bg-purple-50 dark:hover:bg-purple-900/40',
                    ].join(' ')}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── YEAR VIEW ── */}
          {mode === 'year' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <NavBtn onClick={() => setView(v => ({ ...v, year: v.year - 21 }))}>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                </NavBtn>
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                  {yearStart} – {yearStart + 20}
                </span>
                <NavBtn onClick={() => setView(v => ({ ...v, year: v.year + 21 }))}>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 0 1-1.06 0Z" />
                  </svg>
                </NavBtn>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {years.map(y => (
                  <button key={y} type="button"
                    onClick={() => { setView(v => ({ ...v, year: y })); setMode('month'); }}
                    className={[
                      'py-2 rounded-xl text-sm font-medium transition',
                      y === view.year
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-900 dark:text-purple-100 hover:bg-purple-50 dark:hover:bg-purple-900/40',
                    ].join(' ')}
                  >
                    {y}
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