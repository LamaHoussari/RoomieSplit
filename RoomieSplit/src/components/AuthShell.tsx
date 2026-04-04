import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const { dark, toggle } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fafaf9_0%,#f5f5f4_52%,#ffffff_100%)] p-6 transition-all duration-300 dark:bg-[linear-gradient(180deg,_#0f1720_0%,_#111827_100%)]">
      <button
        type="button"
        onClick={toggle}
        className="fixed right-5 top-5 inline-flex items-center justify-center rounded-2xl border border-stone-300/80 bg-white/80 p-2.5 text-stone-700 shadow-sm transition hover:bg-stone-100/80 hover:text-stone-950 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-13a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 2Zm0 14a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 16Zm8-6a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 18 10ZM3.75 10.75h-1a.75.75 0 0 1 0-1.5h1a.75.75 0 0 1 0 1.5Zm11.56 4.06a.75.75 0 0 1 1.06 0l.7.7a.75.75 0 1 1-1.06 1.06l-.7-.7a.75.75 0 0 1 0-1.06ZM3.93 4.49a.75.75 0 0 1 1.06 0l.7.7A.75.75 0 1 1 4.63 6.25l-.7-.7a.75.75 0 0 1 0-1.06Zm12.44-1.06a.75.75 0 0 1 0 1.06l-.7.7a.75.75 0 1 1-1.06-1.06l.7-.7a.75.75 0 0 1 1.06 0ZM5.39 14.81a.75.75 0 0 1 0 1.06l-.7.7a.75.75 0 1 1-1.06-1.06l.7-.7a.75.75 0 0 1 1.06 0Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a.75.75 0 0 1 .916-.916A6.5 6.5 0 1 0 18.21 12.377a.75.75 0 0 1-.917.916Z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center animate-slide-up-soft">
          <div className="mx-auto mb-4 h-12 w-12 rounded-3xl bg-[linear-gradient(135deg,#6f4f8b,#392b48)] shadow-sm dark:bg-[linear-gradient(135deg,#a88bc9,#4b365f)]" />
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-slate-100 sm:text-5xl">
            Roomie<span className="text-[#6f4f8b] dark:text-[#d4c0ea]">Split</span>
          </h1>
          <p className="mt-2 text-base text-stone-500 dark:text-slate-400">
            Shared expenses, zero disputes.
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-white/86 p-7 shadow-[0_30px_80px_-46px_rgba(28,25,23,0.55)] backdrop-blur-sm animate-slide-up-soft dark:border-slate-800/70 dark:bg-slate-900/78 dark:shadow-black/35 sm:p-8">
          <h2 className="mb-2 font-display text-2xl font-semibold text-stone-900 dark:text-slate-100">
            {title}
          </h2>
          {subtitle && (
            <p className="mb-6 text-sm text-stone-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
