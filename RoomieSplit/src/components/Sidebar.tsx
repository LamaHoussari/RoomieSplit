import { NavLink } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import type { ReactElement, SVGProps } from 'react';
import type { AppUser } from '../types/auth';
import Button from './Button';

interface NavItem {
  label: string;
  path: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
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
    label: 'Overview',
    path: '/admin',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
      </svg>
    ),
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M16 11a4 4 0 1 0-8 0" />
        <path d="M12 15c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5Z" />
      </svg>
    ),
  },
  {
    label: 'Groups',
    path: '/admin/groups',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
  },
  {
    label: 'Audit Log',
    path: '/admin/audit',
    icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 12h6M9 16h6M9 8h6" />
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
  avatarUrl?: string | null;
}

export default function Sidebar({
  user,
  onSignOut,
  mobileOpen = false,
  setMobileOpen,
  collapsed = false,
  onToggleCollapsed,
  avatarUrl,
}: SidebarProps) {
  const closeMobile = useCallback(() => setMobileOpen?.(false), [setMobileOpen]);
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      async function openSidebar() {
        setEverOpened(true);
      }
      openSidebar();
    }
  }, [mobileOpen]);

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
  const signOutIcon = (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75h-2A1.75 1.75 0 0 0 3.75 5.5v9A1.75 1.75 0 0 0 5.5 16.25h2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 6.5 15 10l-3.5 3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h7" />
    </svg>
  );

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm md:hidden',
          mobileOpen ? 'sidebar-overlay-open' : everOpened ? 'sidebar-overlay-closed' : 'hidden',
        ].join(' ')}
        onClick={closeMobile}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 h-full flex-shrink-0',
          'md:static md:inset-auto md:z-auto',
          collapsed ? 'w-[84px]' : 'w-[248px]',
          'border-r border-stone-200/55 bg-white/64 backdrop-blur-md dark:border-slate-800/55 dark:bg-slate-950/60',
          'md:transition-[width] md:duration-200 md:ease-in-out',
          mobileOpen
            ? 'sidebar-panel-open'
            : everOpened
              ? 'sidebar-panel-closed md:!animate-none md:translate-x-0'
              : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} border-b border-stone-200/55 px-3 py-3 dark:border-slate-800/55`}>
            {!collapsed && (
              <div className="min-w-0 px-1">
                <p className="text-sm font-semibold text-stone-900 dark:text-white">
                  {user.isAdmin ? 'Admin Menu' : 'Menu'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => (mobileOpen ? closeMobile() : onToggleCollapsed?.())}
              title={mobileOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={mobileOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="rs-action-icon"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform ${collapsed && !mobileOpen ? 'rotate-180' : ''}`} aria-hidden="true">
                <path fillRule="evenodd" d="M11.78 4.22a.75.75 0 0 1 0 1.06L7.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={closeMobile}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition',
                    collapsed ? 'justify-center' : '',
                    isActive
                      ? 'bg-[#ede7f6] text-[#5e35b1] dark:bg-[#2e2545]'
                      : 'text-stone-600 hover:bg-white/70 dark:text-slate-300',
                  ].join(' ')
                }
              >
                {item.icon({ className: 'h-5 w-5' })}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-stone-200/55 px-3 py-3 dark:border-slate-800/55">
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    title={displayName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    title={displayName}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6f4f8b]/12 text-sm font-bold text-[#6f4f8b] dark:bg-[#6f4f8b]/20 dark:text-[#d4c0ea]"
                  >
                    {(displayName[0] ?? 'R').toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-red-300/75 bg-red-50/92 text-red-700 transition hover:border-red-400 hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
                >
                  {signOutIcon}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex min-w-0 items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6f4f8b]/12 text-sm font-bold text-[#6f4f8b] dark:bg-[#6f4f8b]/20 dark:text-[#d4c0ea]">
                      {(displayName[0] ?? 'R').toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-900 dark:text-white">
                      {displayName}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={onSignOut}
                  variant="danger"
                  size="sm"
                  className="w-full justify-center"
                >
                  {signOutIcon}
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
