import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from './AppShell';
import AdminSidebar from './AdminSidebar';

/**
 * Admin shell for admin users
 * Includes admin sidebar navigation and admin-specific header
 */
export default function AdminShell() {
  return (
    <AppShell
      sidebar={<AdminSidebar />}
    >
      <Outlet />
    </AppShell>
  );
}