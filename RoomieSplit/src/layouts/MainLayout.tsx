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

  useEffect(() => {
    localStorage.setItem('rs_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-stone-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} />

      <div className="relative flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar
          user={user}
          onSignOut={onSignOut}
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
          collapsed={sidebarOpen ? false : sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(c => !c)}
        />

        <main className="relative flex-1 min-w-0 min-h-0 overflow-hidden">
          <div key={location.pathname} className="h-full overflow-y-auto p-5 animate-slide-up-soft sm:p-6 md:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
