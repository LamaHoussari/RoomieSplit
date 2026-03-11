import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: '⬡' },
  { label: 'Groups',    path: '/groups',    icon: '◫' },
  { label: 'Expenses',  path: '/expenses',  icon: '⊞' },
  { label: 'Balances',  path: '/balances',  icon: '⊜' },
  { label: 'Chores',    path: '/chores',    icon: '✓' },
  { label: 'Profile',   path: '/profile',   icon: '◉' },
];

export default function Sidebar() {
  const { dark, toggle } = useTheme();

  return (
    <aside className="w-60 min-h-screen flex-shrink-0 bg-white dark:bg-purple-950 border-r border-purple-100 dark:border-purple-900/60 flex flex-col py-7">
      <div className="px-6 mb-8">
        <span className="font-display text-2xl font-extrabold text-purple-700 dark:text-purple-300 tracking-tight">
          Roomie<span className="text-purple-400 dark:text-purple-500">Split</span>
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1 px-3">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-200'
                : 'text-purple-400 dark:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-purple-600 dark:hover:text-purple-300'
              }`
            }
          >
            <span className="w-5 text-center text-base opacity-70">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 pt-4 border-t border-purple-100 dark:border-purple-900/60">
        <button
          onClick={toggle}
          className="flex items-center gap-3 text-sm text-purple-400 dark:text-purple-500 hover:text-purple-600 dark:hover:text-purple-300 transition-colors w-full"
        >
          <span className="text-base">{dark ? '☼' : '☾'}</span>
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  );
}
