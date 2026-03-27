import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MainLayout({ onSignOut }: { onSignOut: () => void }) {
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
    <div className="min-h-screen flex flex-col bg-purple-50/70 dark:bg-[#110e1c] transition-colors duration-200">
      <Navbar onSignOut={onSignOut} />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          mobileOpen={sidebarOpen}
          setMobileOpen={setSidebarOpen}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(c => !c)}
        />

        <main className="flex-1 min-w-0 p-5 sm:p-6 md:p-10 overflow-y-auto">
          <div key={location.pathname} className="animate-slide-up-soft">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
