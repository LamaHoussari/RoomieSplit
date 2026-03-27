import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onSignOut }: { onSignOut: () => void }) {
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/75 dark:bg-[#110e1c]/85 backdrop-blur border-b border-purple-100/70 dark:border-purple-900/50 shadow-sm shadow-purple-900/5 dark:shadow-black/20">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <NavLink to="/dashboard" className="flex items-center gap-3 min-w-0 group">
            
            <span className="font-display text-lg font-extrabold text-purple-900 dark:text-purple-100 tracking-tight truncate group-hover:text-purple-950 dark:group-hover:text-white transition-colors">
              Roomie<span className="text-purple-600 dark:text-purple-300">Split</span>
            </span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition border
            bg-red-50/70 hover:bg-red-50 border-red-200/70 text-red-700 hover:text-red-800
            dark:bg-red-950/20 dark:hover:bg-red-950/30 dark:border-red-900/60 dark:text-red-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#110e1c]"
            aria-label="Sign out"
            title="Sign out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 7V6a2 2 0 0 1 2-2h7v16h-7a2 2 0 0 1-2-2v-1" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0 3-3m-3 3 3 3" />
            </svg>
            <span className="hidden sm:inline">Sign out</span>
          </button>

          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center rounded-2xl p-2 border border-purple-200/70 bg-white/70 hover:bg-white text-purple-800 hover:text-purple-950 transition
            dark:bg-purple-950/40 dark:hover:bg-purple-950 dark:border-purple-900/60 dark:text-purple-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#110e1c]"
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

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition border
              ${isActive
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white/70 hover:bg-white border-purple-200/70 text-purple-800 hover:text-purple-950 dark:bg-purple-950/40 dark:hover:bg-purple-950 dark:border-purple-900/60 dark:text-purple-100'
              }
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#110e1c]`
            }
            aria-label="Open profile"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <span className="hidden sm:inline">Profile</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
