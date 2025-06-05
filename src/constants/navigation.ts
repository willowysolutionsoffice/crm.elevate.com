import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import type { SidebarData } from '@/types/navigation';
import { APP_CONFIG } from '@/config/app';

export const SIDEBAR_DATA: SidebarData = {
  user: {
    name: 'John Doe',
    email: 'john@company.com',
    avatar: '/avatars/default.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: IconDashboard,
    },
    {
      title: 'Contacts',
      url: '/contacts',
      icon: IconUsers,
    },
    {
      title: 'Deals',
      url: '/deals',
      icon: IconListDetails,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: IconChartBar,
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: IconFolder,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: IconSettings,
    },
    {
      title: 'Search',
      url: '/search',
      icon: IconSearch,
    },
    {
      title: 'Help & Support',
      url: '/help',
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: 'Customer Database',
      url: '/documents/database',
      icon: IconDatabase,
    },
    {
      name: 'Sales Reports',
      url: '/documents/reports',
      icon: IconReport,
    },
    {
      name: 'Proposals',
      url: '/documents/proposals',
      icon: IconFileWord,
    },
  ],
};

export const COMPANY_INFO = {
  name: APP_CONFIG.name,
  description: APP_CONFIG.description,
} as const;
