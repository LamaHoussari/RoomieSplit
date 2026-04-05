import { NavLink } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import type { SVGProps } from 'react';
import type { AppUser } from '../types/auth';

interface NavItem {
  label: string;
  path: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    label: 'Groups',
    path: '/groups',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5Z" />
      </svg>
    ),
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 11h10M7 15h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      </svg>
    ),
  },
  {
    label: 'Balances',
    path: '/balances',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 3l-6 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21H3v-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l6-6" />
      </svg>
    ),
  },
  {
    label: 'Chores',
    path: '/chores',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3L22 4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    label: 'Tracking',
    path: '/tracking',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14h3M8 18h3M14 14h2" />
      </svg>
    ),
  },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Admin',
    path: '/admin',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.971-2.91 8.963-7 10-4.09-1.037-7-5.029-7-10V7l7-4Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.75 1.75L14.5 10" />
      </svg>
    ),
  },
];

interface SidebarProps {
  user: AppUser;
  onSignOut: () => Promise<boolean>;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function Sidebar({
  user,
  onSignOut,
  mobileOpen = false,
  setMobileOpen,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const closeMobile = useCallback(() => setMobileOpen?.(false), [setMobileOpen]);
  const [everOpened, setEverOpened] = useState(false);

  // Track whether mobile menu was ever opened (for closing animation)
  if (mobileOpen && !everOpened) {
    setEverOpened(true);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen, closeMobile]);

  const navItems = user.isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;
  const displayName = user.name?.trim() || user.email || 'Roomie';
  const userLabel = user.isAdmin ? 'Admin session' : 'Welcome back';

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm md:hidden',
          mobileOpen ? 'sidebar-overlay-open' : everOpened ? 'sidebar-overlay-closed' : 'hidden',
        ].join(' ')}
        onClick={closeMobile}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50',
          'md:static md:inset-auto md:z-auto',
          'h-full',
          collapsed ? 'w-20' : 'w-64',
          'flex flex-col flex-shrink-0',
          'border-r border-stone-200/80 bg-white/78 shadow-[0_20px_48px_-36px_rgba(28,25,23,0.5)] backdrop-blur-xl',
          'dark:border-slate-800/80 dark:bg-slate-950/78',
          'md:transition-[width] md:duration-200 md:ease-in-out',
          mobileOpen
            ? 'sidebar-panel-open'
            : everOpened
              ? 'sidebar-panel-closed md:!animate-none md:translate-x-0'
              : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-14 items-center border-b border-stone-200/80 dark:border-slate-800/80',
            collapsed ? 'justify-center px-0' : 'px-3',
          ].join(' ')}
        >
          <button
            type="button"
            onClick={() => (mobileOpen ? closeMobile() : onToggleCollapsed?.())}
            title={mobileOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={mobileOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-700 transition-colors duration-150 hover:bg-stone-100/80 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 5.5A.75.75 0 0 1 3.75 4.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.5Zm0 4.5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Zm.75 3.75a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {!collapsed && (
            <span className="ml-2 truncate text-sm font-semibold text-stone-900 dark:text-slate-100">
              Menu
            </span>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors duration-150',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-[#6f4f8b] text-white shadow-sm dark:bg-[#2b2136] dark:text-[#e2d4f0]'
                    : 'text-stone-700/85 hover:bg-stone-100/80 hover:text-stone-950 dark:text-slate-300/80 dark:hover:bg-white/5 dark:hover:text-white',
                ].filter(Boolean).join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                    {item.icon({
                      className: `h-[22px] w-[22px] ${isActive ? 'text-white dark:text-[#e2d4f0]' : 'text-stone-500 dark:text-slate-400'}`,
                      'aria-hidden': true,
                    })}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={['border-t border-stone-200/80 p-3 dark:border-slate-800/80', collapsed ? 'px-2' : 'px-3'].join(' ')}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                title={displayName}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6f4f8b]/12 text-sm font-bold text-[#6f4f8b] dark:bg-[#6f4f8b]/20 dark:text-[#d4c0ea]"
              >
                {(displayName[0] ?? 'R').toUpperCase()}
              </div>
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200/70 bg-red-50/70 text-red-700 transition hover:bg-red-50 hover:text-red-800 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 7V6a2 2 0 0 1 2-2h7v16h-7a2 2 0 0 1-2-2v-1" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0 3-3m-3 3 3 3" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[208px] flex-col justify-center gap-3">
              <div className="w-full text-left">
                <p className="text-sm font-semibold uppercase tracking-wider text-stone-400 dark:text-slate-500">
                  {userLabel}
                </p>
                <p className="mt-1 truncate text-base font-semibold text-stone-900 dark:text-slate-100">
                  {displayName}
                </p>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/70 bg-red-50/70 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 hover:text-red-800
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white
                dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/30 dark:focus-visible:ring-offset-slate-950"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 7V6a2 2 0 0 1 2-2h7v16h-7a2 2 0 0 1-2-2v-1" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0 3-3m-3 3 3 3" />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
