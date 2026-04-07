import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import type { AppUser } from '../types/auth';
import { useProfile } from '../hooks/useProfile';

export default function MainLayout({ onSignOut, user }: { onSignOut: () => Promise<boolean>; user: AppUser; }) {
  const { avatarUrl } = useProfile(user.id);
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-transparent">
      <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          user={user}
          onSignOut={onSignOut}
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
          collapsed={sidebarOpen ? false : sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(current => !current)}
          avatarUrl={avatarUrl}
        />

        <main className="relative min-w-0 flex-1 overflow-hidden">
          <div key={location.pathname} className="h-full overflow-y-auto px-4 py-5 animate-slide-up-soft sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1500px]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
