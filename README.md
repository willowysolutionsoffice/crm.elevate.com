# CRM Pro

A modern, scalable Customer Relationship Management (CRM) dashboard built with Next.js 15, TypeScript, and shadcn/ui components.

## 🏗️ Architecture

This project follows a well-structured, maintainable architecture with clear separation of concerns:


```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Dashboard homepage
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── ui/                # shadcn/ui base components
│   ├── app-sidebar.tsx    # Main sidebar component
│   ├── nav-*.tsx          # Navigation components
│   ├── section-cards.tsx  # Dashboard metric cards
│   └── site-header.tsx    # Header component
├── constants/             # Application constants
│   ├── navigation.ts      # Sidebar and navigation data
│   └── dashboard.ts       # Dashboard metrics data
├── config/                # Configuration files
│   └── app.ts            # Application-wide configuration
├── types/                 # TypeScript type definitions
│   └── navigation.ts      # Navigation and UI types
├── lib/                   # Utility functions
│   └── utils.ts          # Common utility functions
└── hooks/                 # Custom React hooks
    └── use-mobile.ts     # Mobile detection hook (deprecated)
```

## 🚀 Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Configurable**: Centralized configuration for easy customization
- **Scalable Architecture**: Clear separation of concerns and modular structure
- **Accessible**: ARIA-compliant components and keyboard navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Icons**: Tabler Icons
- **Package Manager**: pnpm

## 📋 Code Organization Best Practices

### 1. Type Safety

- All components use proper TypeScript interfaces
- Type definitions are centralized in `/types` directory
- Props are properly typed with interfaces

### 2. Configuration Management

- Application settings are centralized in `/config/app.ts`
- Environment-specific configurations
- Feature flags for easy toggling of functionality

### 3. Constants Management

- UI data is separated from components
- Navigation and dashboard data in `/constants` directory
- Easy to modify without touching component code

### 4. Component Structure

- Single responsibility principle
- Proper prop interfaces
- Reusable and composable components

### 5. Utility Functions

- Common functions centralized in `/lib/utils.ts`
- Pure functions for formatting, calculations, etc.
- Reusable across the application

## 🔧 Configuration

### App Configuration (`src/config/app.ts`)

The application uses a centralized configuration system:

```typescript
export const APP_CONFIG = {
  name: 'CRM Pro',
  description: 'Customer Relationship Management System',
  theme: {
    defaultFont: 'DM Sans',
    sidebarWidth: 'calc(var(--spacing) * 72)',
    headerHeight: 'calc(var(--spacing) * 12)',
  },
  navigation: {
    showQuickCreate: true,
    showInboxButton: true,
    collapsibleSidebar: true,
  },
  features: {
    showGitHubLink: false,
    enableNotifications: true,
    enableDarkMode: true,
    enableSearch: true,
  },
  // ... more configuration options
};
```

### Customizing Navigation

Update `src/constants/navigation.ts` to modify sidebar navigation:

```typescript
export const SIDEBAR_DATA: SidebarData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: IconDashboard,
    },
    // Add more navigation items
  ],
  // ... other navigation sections
};
```

### Customizing Dashboard Metrics

Update `src/constants/dashboard.ts` to modify dashboard cards:

```typescript
export const DASHBOARD_METRICS: MetricCard[] = [
  {
    title: 'Total Revenue',
    value: '$1,250.00',
    description: 'Monthly revenue',
    trend: { type: 'up', value: '+12.5%' },
    // ... more metric properties
  },
  // Add more metrics
];
```

## 🎨 Styling

- Uses DM Sans font as specified in workspace rules
- Tailwind CSS for utility-first styling
- CSS variables for theming
- Responsive design with container queries

## 🚀 Getting Started

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Run development server**:

   ```bash
   pnpm dev
   ```

3. **Build for production**:
   ```bash
   pnpm build
   ```

## 📁 Key Files

- **`src/app/layout.tsx`**: Root layout with sidebar setup
- **`src/components/app-sidebar.tsx`**: Main sidebar component
- **`src/config/app.ts`**: Application configuration
- **`src/types/navigation.ts`**: TypeScript type definitions
- **`src/constants/navigation.ts`**: Navigation data
- **`src/lib/utils.ts`**: Utility functions

## 🔄 Migration Notes

This refactoring improved the codebase by:

1. **Removing hardcoded data** from components
2. **Adding proper TypeScript types** throughout
3. **Centralizing configuration** for easy maintenance
4. **Implementing utility functions** for common operations
5. **Following Next.js and React best practices**
6. **Using DM Sans font** as specified in workspace rules
7. **Creating a scalable folder structure**

## 🤝 Contributing

When adding new features:

1. Add proper TypeScript types in `/types`
2. Use the configuration system for settings
3. Place constants in appropriate `/constants` files
4. Follow the established component patterns
5. Update this README if needed

## 📝 License

This project is private and proprietary.

---


## Deployments
- 11/09/2025
