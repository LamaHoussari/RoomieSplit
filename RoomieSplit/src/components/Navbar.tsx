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
  const brandMarkSrc = dark ? '/FOR%20DARK%20MODE.png' : '/FOR%20LIGHT%20MODE.png';

  return (
    <header className="relative z-30 border-b border-stone-200/55 bg-white/72 backdrop-blur-md dark:border-slate-800/55 dark:bg-slate-950/68">
      <div className="flex h-[68px] items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="rs-action-icon md:hidden"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M3 5.5A.75.75 0 0 1 3.75 4.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.5Zm0 4.5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Zm.75 3.75a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clipRule="evenodd" />
            </svg>
          </button>

          <NavLink to={homePath} className="flex min-w-0 items-center gap-3">
            <img
              src={brandMarkSrc}
              alt="RoomieSplit"
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="block truncate font-display text-xl font-semibold text-stone-950 dark:text-white">
              Roomie<span className="text-[#6f4f8b] dark:text-[#d4c0ea]">Split</span>
            </span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="rs-action-icon"
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

          {!user.isAdmin && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-[#6f4f8b] bg-[#6f4f8b] text-white dark:border-[#8d70b0] dark:bg-[#7e62a0]'
                    : 'border-[#ddd0e9] bg-white/70 text-[#6f4f8b] hover:bg-[#f4eef8] dark:border-[#4a375e] dark:bg-slate-900/60 dark:text-[#d4c0ea] dark:hover:bg-[#2b2136]'
                }`
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
