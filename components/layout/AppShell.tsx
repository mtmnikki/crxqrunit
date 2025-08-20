import React from 'react';
import { useAuth } from '@/state/auth';
import { useUI } from '@/state/ui';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, User, LogOut } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar: React.ReactNode;
}

/**
 * Main authenticated app shell with header, sidebar, and content area
 * Used by both Member and Admin shells
 */
export default function AppShell({ children, header, sidebar }: AppShellProps) {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUI();

  const handleLogout = () => {
    console.log('🔄 AppShell logout initiated');
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">ClinicalRxQ</span>
          </Link>
        </div>

        {header && (
          <div className="flex-1 px-4">
            {header}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{user?.pharmacyName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <User className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static
          inset-y-0 left-0 top-14
          z-30
          w-64 
          bg-white 
          border-r border-gray-200
          transition-transform duration-200 ease-in-out
          overflow-y-auto
        `}>
          {sidebar}
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}