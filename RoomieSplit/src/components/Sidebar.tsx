import { NavLink } from 'react-router-dom';
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
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function Sidebar({
  user,
  mobileOpen = false,
  setMobileOpen,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const closeMobile = () => setMobileOpen?.(false);
  const navItems = user.isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50',
          'md:static md:inset-auto md:z-auto',
          'md:h-screen md:min-h-screen',
          collapsed ? 'w-20' : 'w-64',
          'flex flex-col flex-shrink-0',
          'border-r border-stone-200/80 bg-white/78 shadow-[0_20px_48px_-36px_rgba(28,25,23,0.5)] backdrop-blur-xl',
          'dark:border-slate-800/80 dark:bg-slate-950/78',
          'transition-[transform,width] duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
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
      </aside>
    </>
  );
}
