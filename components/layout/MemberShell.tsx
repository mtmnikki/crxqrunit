import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from './AppShell';
import MemberSidebar from './MemberSidebar';

/**
 * Member shell for authenticated member users
 * Includes sidebar navigation and member-specific header
 */
export default function MemberShell() {
  return (
    <AppShell
      sidebar={<MemberSidebar />}
    >
      <Outlet />
    </AppShell>
  );
}