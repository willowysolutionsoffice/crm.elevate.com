# Project Rules for Trae AI

## Global Rules

- Important: Always use context7 MCP for fetching latest documentation
- Important: Always use PNPM as package manager
- Important: Always use `pnpm dlx` instead of `npx`
- Important: Use Prisma MCP for database related operations
- Important: If using shadcn MCP and a registry URL is provided, always check the MCP for components before creating your own

## TypeScript Rules

### Type Organization

**IMPORTANT: ALL TypeScript interfaces and types MUST be placed in the @/types folder and imported where needed. NEVER define interfaces or types inline in component files, middleware, or any other files. Always create separate type files in @/types/ and import them.**

### Steps for Creating New Types/Interfaces:

1. Create a new file in @/types/ with a descriptive name (e.g., auth.ts, user.ts, api.ts)
2. Export the interface/type from that file
3. Import it in the files where it's needed using @/types/filename

### Examples:

```typescript
// ❌ DON'T DO THIS - Inline interface definition
interface User {
  id: string;
  name: string;
}

// ✅ DO THIS - Create @/types/user.ts
export interface User {
  id: string;
  name: string;
}

// Then import where needed:
import { User } from '@/types/user';
```

### Important Notes:

- This rule applies to ALL code generation and editing tasks
- Always check if a similar type already exists before creating a new one
- Use descriptive names for type files that reflect their purpose
- Group related types in the same file when it makes sense

## React Rules

### Component Development

#### Function Components
- Always use function components over class components
- Use arrow functions with const declarations:

```tsx
const MyComponent = () => {
  return <div>Component content</div>;
};
```

#### Props & Types
- Define TypeScript interfaces for all component props
- Place interfaces in `@/types/` directory and import them
- Use destructuring for props when appropriate

#### State Management
- Use `useState` for local component state
- Use `useReducer` for complex state logic
- Implement proper state updates (immutable patterns)
- Use `useCallback` for event handlers that are passed as props

#### Event Handling
- Prefix all event handler functions with "handle":
  - `handleClick` for onClick
  - `handleSubmit` for form submissions
  - `handleChange` for input changes
  - `handleKeyDown` for keyboard events

#### Hooks Best Practices
- Follow the Rules of Hooks (only call hooks at the top level)
- Use `useEffect` sparingly and with proper dependencies
- Clean up effects when necessary (return cleanup function)
- Use `useMemo` and `useCallback` for performance optimization when needed

#### Conditional Rendering
- Use early returns for better readability
- Handle loading, error, and empty states appropriately

#### Lists and Keys
- Always provide unique keys for list items
- Prefer stable IDs over array indices for keys

#### Performance
- Use `React.memo` for components that receive stable props
- Implement proper dependency arrays in hooks
- Avoid creating objects/functions inside render (use useMemo/useCallback)

## Next.js Rules

### Project Structure
- Follow Next.js 13+ App Router conventions
- Use the `src/` directory for organized code structure
- Place pages in `src/app/` directory
- Use route groups for organization: `(sidebar)`, `(auth)`, etc.

### Routing & Navigation
- Use Next.js built-in routing with App Router
- Implement dynamic routes with proper folder structure: `[id]`, `[...slug]`
- Use `useRouter` from `next/navigation` for programmatic navigation
- Implement proper loading states with `loading.tsx` files
- Create error boundaries with `error.tsx` files

### Server & Client Components
- Default to Server Components when possible
- Use `"use client"` directive only when necessary (for interactivity, hooks, etc.)
- Keep server components for data fetching and static content
- Move client-side logic to separate client components

### Font Management
- Always use Next.js font optimization
- Implement DM Sans as the primary font:

```tsx
import { DM_Sans } from "next/font/google"

const fontSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

// In layout.tsx
<body className={`${fontSans.variable} font-sans antialiased`}>
```

### Image Optimization
- Always use Next.js Image component for images
- Configure domains in `next.config.ts` for external images:

```tsx
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;
```

### Data Fetching
- Use Server Actions for mutations and form handling
- Implement proper error handling in Server Actions
- Use `revalidatePath` or `revalidateTag` for cache invalidation
- Prefer Server Components for initial data loading

### Metadata & SEO
- Implement proper metadata in layout and page files
- Use `generateMetadata` for dynamic metadata
- Include proper Open Graph and Twitter card metadata

## Shadcn/UI Rules

### Component Usage

#### Always Check Registry First
- If using shadcn MCP and a registry URL is provided, always check the MCP for components before creating your own
- Use the MCP to get the latest component definitions and examples
- Prefer shadcn/ui components over custom implementations

#### Component Installation
- Use `pnpm dlx shadcn-ui@latest add <component>` for adding new components
- Do not install `example-` components directly
- Use examples as reference to create your own components

#### Component Customization
- Customize components through the `variants` prop when available
- Override styles using Tailwind classes with proper specificity
- Create variant extensions in component files when needed

#### Form Components
- Use shadcn/ui form components with react-hook-form
- Implement proper validation with Zod schemas
- Follow the form composition pattern with FormField, FormItem, FormControl, etc.

#### Dialog and Modal Usage
- Use Dialog component for modals
- Implement proper accessibility with DialogContent, DialogHeader, DialogTitle
- Handle proper focus management

#### Common Components
- **Button**: Use variants (default, destructive, outline, secondary, ghost, link)
- **Input**: Always pair with proper labels and error states
- **Card**: Use CardHeader, CardContent, CardFooter structure
- **Badge**: Use for status indicators and tags
- **Alert**: Use for notifications and messages
- **Tabs**: Use for navigation between related content

## TailwindCSS Rules

### Core Principles
- Always use Tailwind classes for styling HTML elements
- Avoid using CSS files or inline styles
- Use utility-first approach for consistent design
- Prefer Tailwind classes over custom CSS solutions

### Class Organization

Follow this order for better readability:
1. Layout (display, position, top, right, bottom, left)
2. Flexbox/Grid (flex, grid, justify, align, etc.)
3. Spacing (margin, padding)
4. Sizing (width, height)
5. Typography (font, text, leading, tracking)
6. Visual (background, border, shadow, opacity)
7. Misc (cursor, overflow, z-index, etc.)

### Conditional Classes
- Use template literals for dynamic classes
- Consider using `clsx` or `cn` utility for complex conditions

### Responsive Design
- Use mobile-first approach
- Apply breakpoint prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Stack responsive classes logically

### Color Usage
- Use semantic color names when possible
- Leverage design system tokens
- Use opacity modifiers for variants: `bg-blue-500/20`

### Spacing and Sizing
- Use consistent spacing scale (4, 8, 12, 16, 20, 24, 32, etc.)
- Prefer spacing utilities over arbitrary values
- Use logical spacing (px, py, mx, my) for efficiency

### Typography
- Use type scale consistently
- Apply proper line heights with text sizes
- Use font weight modifiers appropriately

## Accessibility Rules

### Core Principles
- Design for all users, including those with disabilities
- Follow WCAG 2.1 AA standards as minimum requirement
- Implement accessibility from the start, not as an afterthought
- Test with keyboard navigation and screen readers

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use `tabIndex={0}` for elements that should receive focus
- Use `tabIndex={-1}` for elements that should be programmatically focusable
- Never use positive tabIndex values

### Focus Management
- Provide visible focus indicators
- Manage focus for dynamic content (modals, dropdowns)
- Return focus to appropriate element after interactions

### ARIA Attributes
- Use `aria-label` for elements without visible text
- Use `aria-labelledby` to reference other labeling elements
- Use `aria-describedby` for additional descriptions
- Use appropriate ARIA state attributes (aria-expanded, aria-selected, etc.)

### Semantic HTML
- Use semantic HTML elements instead of divs when possible
- Use headings (h1-h6) in logical order
- Use lists (ul, ol) for grouped content
- Use buttons for actions, links for navigation

### Form Accessibility
- Always associate labels with form controls
- Use fieldsets and legends for grouped form controls
- Provide clear error messages
- Use required and aria-invalid attributes

### Color and Contrast
- Don't rely on color alone to convey information
- Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Use semantic colors consistently
- Test with color blindness simulators

## Code Quality & Best Practices

### Code Writing Standards
- Follow the user's requirements carefully & to the letter
- First think step-by-step - describe your plan in pseudocode, written out in great detail
- Always write correct, best practice, DRY principle (Don't Repeat Yourself), bug-free, fully functional code
- Focus on readability over performance optimization
- Fully implement all requested functionality
- Leave NO todos, placeholders, or missing pieces
- Ensure code is complete and thoroughly verified
- Include all required imports and ensure proper naming of key components

### File Organization
- Use descriptive file and folder names
- Group related functionality together
- Follow consistent naming conventions
- Separate concerns appropriately

### Function & Variable Naming
- Use descriptive variable and function names
- Use camelCase for variables and functions
- Use PascalCase for components and classes
- Use SCREAMING_SNAKE_CASE for constants

### Function Design
- Use arrow functions with const declarations
- Keep functions small and focused (single responsibility)
- Use early returns to reduce nesting
- Define proper TypeScript types for parameters and return values

### Error Handling
- Always handle potential errors gracefully
- Provide meaningful error messages to users
- Use try-catch blocks for async operations
- Implement proper error boundaries in React

### Form Validation
- Validate inputs on both client and server
- Provide clear, actionable error messages
- Use proper validation libraries (Zod, Yup)

### Performance Considerations
- Use React.memo for components with stable props
- Implement proper dependency arrays in useEffect
- Use useCallback for event handlers passed as props
- Use useMemo for expensive calculations

### Testing & Validation
- Test all code paths and edge cases
- Verify error states and loading states
- Ensure proper TypeScript typing
- Test accessibility with keyboard navigation

### Documentation & Comments
- Write self-documenting code with clear names
- Add comments only when necessary to explain "why," not "what"
- Document complex business logic
- Keep comments up-to-date with code changes

### Security Best Practices
- Never expose sensitive data in client-side code
- Sanitize user inputs to prevent XSS
- Use proper authentication and authorization
- Validate data on both client and server sides

### Import & Dependency Management
- Group imports logically (external libraries, internal modules, types)
- Use absolute imports with path aliases (@/)
- Import only what you need to reduce bundle size

```typescript
// Good: Organized imports
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { UserService } from '@/services/user';
import { validateEmail } from '@/utils/validation';

import type { User } from '@/types/user';
import type { FormErrors } from '@/types/forms';
```

### Dependency Management
- Keep dependencies up to date
- Use exact versions for critical dependencies
- Remove unused dependencies regularly
- Prefer established, well-maintained packages