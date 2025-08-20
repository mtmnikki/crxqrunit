import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  BookOpen,
  Search,
  FileText,
  Settings,
  HelpCircle,
  ChevronRight
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
          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      <div className="flex items-center">
        <Icon className={cn("h-4 w-4 mr-3", isActive ? "text-blue-700" : "text-gray-400")} />
        {label}
      </div>
      {badge && (
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

/**
 * Member sidebar navigation
 * Shows member-specific navigation items
 */
export default function MemberSidebar() {
  const location = useLocation();

  const navigation = [
    {
      icon: Home,
      label: 'Dashboard',
      to: '/dashboard'
    },
    {
      icon: BookOpen,
      label: 'Programs',
      to: '/programs'
    },
    {
      icon: Search,
      label: 'Resource Library',
      to: '/resources'
    }
  ];

  const supportNavigation = [
    {
      icon: HelpCircle,
      label: 'Help & Support',
      to: '/contact'
    }
  ];

  return (
    <nav className="p-4 space-y-6">
      <div>
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Main
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
          Quick Access
        </h3>
        <div className="space-y-1">
          <NavItem
            icon={FileText}
            label="Patient Handouts"
            to="/resources?cat=handouts"
            isActive={location.pathname === '/resources' && location.search.includes('cat=handouts')}
          />
          <NavItem
            icon={BookOpen}
            label="Clinical Resources"
            to="/resources?cat=clinical"  
            isActive={location.pathname === '/resources' && location.search.includes('cat=clinical')}
          />
          <NavItem
            icon={FileText}
            label="Medical Billing"
            to="/resources?cat=billing"
            isActive={location.pathname === '/resources' && location.search.includes('cat=billing')}
          />
        </div>
      </div>

      <div>
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Support
        </h3>
        <div className="space-y-1">
          {supportNavigation.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={location.pathname === item.to}
            />
          ))}
        </div>
      </div>

      {/* Program Status */}
      <div className="mt-8 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Active Programs</h4>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-600 mb-3">3 of 5 programs enrolled</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </div>
    </nav>
  );
}