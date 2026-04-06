import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import type { AppUser } from '../types/auth';

type NavProps = {
  onMenuClick?: () => void;
  user: AppUser;
};

export default function Navbar({ onMenuClick, user }: NavProps) {
  const { dark, toggle } = useTheme();
  const homePath = user.isAdmin ? '/admin' : '/dashboard';

  return (
    <header className="relative z-30 h-16 shrink-0 border-b border-stone-200/70 bg-white/72 backdrop-blur-xl shadow-sm shadow-stone-900/5 dark:border-slate-800/70 dark:bg-slate-950/78 dark:shadow-black/20">
      <div className="flex h-full items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="inline-flex items-center justify-center rounded-xl p-2 text-stone-700 transition hover:bg-stone-100/80 dark:text-slate-300 dark:hover:bg-white/5 md:hidden"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M3 5.5A.75.75 0 0 1 3.75 4.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.5Zm0 4.5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Zm.75 3.75a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clipRule="evenodd" />
            </svg>
          </button>

          <NavLink to={homePath} className="group flex min-w-0 items-center gap-3">
            <span className="truncate font-display text-2xl font-extrabold tracking-tight text-stone-900 transition-colors group-hover:text-black dark:text-slate-100 dark:group-hover:text-white">
              Roomie<span className="text-[#6f4f8b] dark:text-[#d4c0ea]">Split</span>
            </span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center rounded-2xl border border-stone-300/80 bg-white/70 p-2 text-stone-700 transition hover:bg-stone-100/80 hover:text-stone-950
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c74aa]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white
            dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800/80 dark:focus-visible:ring-offset-slate-950"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
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

          {user.isAdmin ? (
            <span className="inline-flex items-center gap-2 rounded-2xl border border-[#ddd0e9] bg-white/70 px-3 py-2 text-sm font-semibold text-[#6f4f8b] dark:border-[#4a375e] dark:bg-slate-900/50 dark:text-[#d4c0ea]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.971-2.91 8.963-7 10-4.09-1.037-7-5.029-7-10V7l7-4Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.75 1.75L14.5 10" />
              </svg>
              <span className="hidden sm:inline">Admin Mode</span>
            </span>
          ) : (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition
                ${isActive
                  ? 'border-[#6f4f8b] bg-[#6f4f8b] text-white shadow-sm dark:border-[#4a375e] dark:bg-[#2b2136] dark:text-[#e2d4f0]'
                  : 'border-[#ddd0e9] bg-white/70 text-[#6f4f8b] hover:bg-[#f4eef8] hover:text-[#5c426f] dark:border-[#4a375e] dark:bg-slate-900/50 dark:text-[#d4c0ea] dark:hover:bg-[#2b2136]'
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c74aa]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950`
              }
              aria-label="Open profile"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              <span className="hidden sm:inline">Profile</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
