import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import type { AppUser } from '../types/auth';

export default function MainLayout({ onSignOut, user }: { onSignOut: () => Promise<boolean>; user: AppUser; }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rs_sidebar_collapsed') || 'false') as boolean;
    } catch {
      return false;
    }
  });
  const location = useLocation();
  const isFlatBackground = location.pathname === '/dashboard' || location.pathname === '/admin';
  const showPageGlow = !isFlatBackground;

  useEffect(() => {
    localStorage.setItem('rs_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div
      className={`relative min-h-screen flex flex-col transition-colors duration-200 ${
        isFlatBackground ? 'bg-stone-50 dark:bg-slate-950' : 'bg-transparent'
      }`}
    >
      {showPageGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(111,79,139,0.08),_transparent_28%)] dark:bg-[radial-gradient(circle_at_top,_rgba(156,132,186,0.12),_transparent_22%)]"
        />
      )}

      <Navbar onSignOut={onSignOut} onMenuClick={() => setSidebarOpen(true)} user={user} />

      <div className="relative flex flex-1 min-h-0">
        <Sidebar
          user={user}
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
          collapsed={sidebarOpen ? false : sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(c => !c)}
        />

        <main className="relative flex-1 min-w-0 overflow-y-auto p-5 transition-[filter] duration-200 sm:p-6 md:p-10">
          <div key={location.pathname} className="animate-slide-up-soft">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
