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
    <div className="flex min-h-screen items-center justify-center p-6 transition-all duration-300">
      <button
        type="button"
        onClick={toggle}
        className="fixed right-5 top-5 z-10 rs-action-icon"
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
        <div className="mb-6 animate-slide-up-soft text-center">
          <p className="rs-kicker">RoomieSplit</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-stone-950 dark:text-white">
            Shared expenses without the noise.
          </h1>
        </div>

        <div className="rs-panel rs-panel-strong animate-slide-up-soft p-7 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-stone-950 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mb-6 mt-3 text-sm text-stone-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
