'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

// Routes where sidebar should be hidden
const HIDE_SIDEBAR_ROUTES = [
  '/signin',
  '/signin/admin',
  '/signup',
  '/user-selection',
  '/'
];

export default function ConditionalSidebar() {
  const pathname = usePathname();
  
  // Don't show sidebar on auth/public pages
  if (HIDE_SIDEBAR_ROUTES.includes(pathname)) {
    return null;
  }
  
  return <Sidebar />;
} 