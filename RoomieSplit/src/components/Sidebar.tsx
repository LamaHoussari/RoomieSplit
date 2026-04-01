import { NavLink } from 'react-router-dom';
import type { SVGProps } from 'react';

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

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const closeMobile = () => setMobileOpen?.(false);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      
      {/* Sidebar — fixed on mobile, static full-height on desktop */}
      <aside
        className={[
          // Positioning: fixed full-screen on mobile, static column on desktop
          'fixed inset-y-0 left-0 z-50',
          'md:static md:inset-auto md:z-auto',
          // Height: fill the entire viewport on desktop
          'md:h-screen md:min-h-screen',
          // Width
          collapsed ? 'w-20' : 'w-64',
          // Layout
          'flex flex-col flex-shrink-0',
          // Surface
          'bg-white dark:bg-purple-950',
          // Border
          'border-r border-purple-100 dark:border-purple-900/60',
          // Transition
          'transition-[transform,width] duration-200 ease-in-out',
          // Mobile slide
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Toggle / hamburger button */}
        <div className="flex items-center h-14 px-3 shrink-0 border-b border-purple-100 dark:border-purple-900/60">
          <button
            type="button"
            onClick={() => (mobileOpen ? closeMobile() : onToggleCollapsed?.())}
            title={mobileOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={mobileOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`
              flex items-center justify-center h-9 w-9 rounded-xl
              text-purple-600 dark:text-purple-300
              hover:bg-purple-100 dark:hover:bg-purple-900/50
              transition-colors duration-150
            `}
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
            <span className="ml-2 text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">
              Menu
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 flex-1 px-2 py-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl text-base font-medium transition-colors duration-150',
                  // Fixed padding so icon always lands at the same x position
                  'px-3 py-3',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-700/80 dark:text-purple-200/70 hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-purple-900 dark:hover:text-purple-100',
                ].filter(Boolean).join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon wrapper — no hover background, just consistent size & centering */}
                  <span className="flex items-center justify-center w-[22px] h-[22px] shrink-0">
                    {item.icon({
                      className: `h-[22px] w-[22px] ${isActive ? 'text-white' : 'text-purple-600/80 dark:text-purple-300/80'}`,
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
