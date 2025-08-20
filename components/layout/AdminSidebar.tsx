import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  Users,
  FileText,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react';

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  isActive?: boolean;
  badge?: string;
}

function NavItem({ icon: Icon, label, to, isActive, badge }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-red-50 text-red-700 border-r-2 border-red-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      <div className="flex items-center">
        <Icon className={cn("h-4 w-4 mr-3", isActive ? "text-red-700" : "text-gray-400")} />
        {label}
      </div>
      {badge && (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

/**
 * Admin sidebar navigation
 * Shows admin-specific navigation items with different styling
 */
export default function AdminSidebar() {
  const location = useLocation();

  const navigation = [
    {
      icon: Home,
      label: 'Admin Dashboard',
      to: '/admin'
    },
    {
      icon: Users,
      label: 'Member Management',
      to: '/admin/members',
      badge: '156'
    },
    {
      icon: FileText,
      label: 'Content Management',
      to: '/admin/content'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      to: '/admin/analytics'
    }
  ];

  const systemNavigation = [
    {
      icon: Settings,
      label: 'System Settings',
      to: '/admin/settings'
    },
    {
      icon: Shield,
      label: 'Security',
      to: '/admin/security'
    }
  ];

  return (
    <nav className="p-4 space-y-6">
      {/* Admin Badge */}
      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <Shield className="h-4 w-4 text-red-600 mr-2" />
          <span className="text-sm font-medium text-red-800">Admin Access</span>
        </div>
      </div>

      <div>
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Management
        </h3>
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={location.pathname === item.to}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          System
        </h3>
        <div className="space-y-1">
          {systemNavigation.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={location.pathname === item.to}
            />
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
        <h4 className="text-sm font-medium text-gray-900 mb-2">System Status</h4>
        <div className="flex items-center text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          All systems operational
        </div>
      </div>
    </nav>
  );
}