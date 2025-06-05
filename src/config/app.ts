export const APP_CONFIG = {
  name: 'CRM Pro',
  description: 'Customer Relationship Management System',
  version: '1.0.0',
  author: 'Your Company',

  // Theme and UI settings
  theme: {
    defaultFont: 'DM Sans',
    sidebarWidth: 'calc(var(--spacing) * 72)',
    headerHeight: 'calc(var(--spacing) * 12)',
  },

  // Navigation settings
  navigation: {
    showQuickCreate: true,
    showInboxButton: true,
    collapsibleSidebar: true,
  },

  // Feature flags
  features: {
    showGitHubLink: false,
    enableNotifications: true,
    enableDarkMode: true,
    enableSearch: true,
  },

  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 10000,
  },

  // External links
  links: {
    github: 'https://github.com/your-repo',
    documentation: '/docs',
    support: '/help',
  },
} as const;

// Environment-specific configurations
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Export individual config sections for easier imports
export const { theme, navigation, features, api, links } = APP_CONFIG;
