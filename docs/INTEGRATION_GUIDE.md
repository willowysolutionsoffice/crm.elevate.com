# Authentication Integration Guide

## ✅ What's Been Implemented

The authentication system has been successfully added to your existing CRM project with the following components:

### 🔧 Core Files Modified/Added

1. **Database Schema** (`prisma/schema.prisma`)

   - Added `Role` model with ADMIN, EXECUTIVE, TELECALLER roles
   - Extended `User` model with `roleId` field
   - Proper relationships established

2. **Authentication Setup**

   - `src/lib/auth.ts` - Better Auth configuration with custom session
   - `src/lib/auth-client.ts` - Client-side auth configuration
   - `src/app/api/auth/[...all]/route.ts` - API routes for authentication

3. **Server Actions** (`src/lib/safe-action.ts`, `src/lib/actions/auth.ts`)

   - Role-based action clients (admin, executive, telecaller)
   - Signup, login, and logout actions with validation

4. **Authentication Forms**

   - `src/components/auth/signup-form.tsx` - Registration form
   - `src/components/auth/login-form.tsx` - Login form
   - `src/components/auth/logout-button.tsx` - Logout component

5. **Pages**

   - `src/app/(auth)/login/page.tsx` - Login page
   - `src/app/(auth)/sign-up/page.tsx` - Signup page
   - Updated `src/app/(sidebar)/dashboard/page.tsx` - Added role-based welcome section

6. **Middleware** (`src/middleware.ts`)
   - Fixed to work properly with Next.js
   - Protects dashboard routes

## 🚀 Quick Setup

### 1. Environment Variables

Add to your `.env` file:

```env
DATABASE_URL="your-mongodb-connection-string"
BETTER_AUTH_SECRET="your-random-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

### 2. Database Setup

```bash
# Generate Prisma client with new schema
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Create the roles (ADMIN, EXECUTIVE, TELECALLER)
pnpm db:seed
```

### 3. Integration with Your Sidebar

To add logout functionality to your existing navigation, use the `LogoutButton` component:

```tsx
// In your sidebar component
import { LogoutButton } from '@/components/auth/logout-button';

// Usage examples:
<LogoutButton variant="ghost" size="sm" />
<LogoutButton variant="destructive">Sign Out</LogoutButton>
<LogoutButton showIcon={false}>Logout</LogoutButton>
```

### 4. Role-Based Features

Use the role-based action clients in your existing components:

```tsx
// For admin-only features
import { adminActionClient } from '@/lib/safe-action';

// For executive and admin features
import { executiveActionClient } from '@/lib/safe-action';

// For all authenticated users
import { authActionClient } from '@/lib/safe-action';
```

### 5. Accessing User Session in Components

**Server Components:**

```tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function MyComponent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // session.user.role - user's role
  // session.user.name, session.user.email - user info
}
```

**Client Components:**

```tsx
import { authClient } from '@/lib/auth-client';

export function MyClientComponent() {
  const { data: session } = authClient.useSession();

  // Use session data
}
```

## 🔐 Role Permissions

- **ADMIN**: Full access to all features
- **EXECUTIVE**: Management features, advanced reports
- **TELECALLER**: Basic CRM operations, lead management

## 🎯 Next Steps

1. **Test the Authentication Flow:**

   - Go to `/sign-up` to create an account
   - Login at `/login`
   - Check the dashboard for role-based content

2. **Integrate with Existing Components:**

   - Add `LogoutButton` to your sidebar
   - Use session data in your existing components
   - Implement role-based feature visibility

3. **Optional Enhancements:**
   - Add user profile editing
   - Implement password reset
   - Add user management for admins

## 🐛 Troubleshooting

If you encounter issues:

1. **Middleware Error**: Restart your dev server after middleware changes
2. **Database Issues**: Run `pnpm prisma generate` and `pnpm db:seed`
3. **TypeScript Errors**: Restart your TypeScript server in your editor

## 📱 Testing

Visit these URLs to test:

- `/` - Home page (redirects to dashboard if authenticated)
- `/login` - Login page
- `/sign-up` - Registration page
- `/dashboard` - Protected dashboard with role information

The authentication system is now fully integrated with your existing CRM structure!
