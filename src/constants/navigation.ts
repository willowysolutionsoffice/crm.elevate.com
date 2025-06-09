import {
  IconDashboard,
  IconDatabase,
  IconFileInvoice,
  IconFilePlus,
  IconFileText,
  IconListDetails,
  IconPhoneCall,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import type { SidebarData } from '@/types/navigation';
import { APP_CONFIG } from '@/config/app';

export const SIDEBAR_DATA: SidebarData = {
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    image: '/avatars/default.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Enquiries',
      url: '/enquiries',
      icon: IconUsers,
    },
    {
      title: 'Follow-ups',
      url: '/follow-ups',
      icon: IconListDetails,
    },
    {
      title: 'Call Register',
      url: '/call-register',
      icon: IconPhoneCall,
    },
    {
      title: 'Admissions',
      url: '/admissions',
      icon: IconFilePlus,
    },
  ],
  admin: [
    {
      title: 'Data Management',
      url: '/admin/data-management',
      icon: IconDatabase,
    },
    {
      title: 'Reports',
      url: '/admin/reports',
      icon: IconFileText,
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: IconUserPlus,
    },
  ],
  navSecondary: [
    {
      title: 'Invoices',
      url: '/invoices',
      icon: IconFileInvoice,
    },
  ],
};

export const COMPANY_INFO = {
  name: APP_CONFIG.name,
  description: APP_CONFIG.description,
} as const;
