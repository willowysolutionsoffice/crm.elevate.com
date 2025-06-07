# Types Organization

This directory contains all TypeScript interfaces and types for the CRM application, organized following DRY principles.

## Structure

### Core Files

- **`index.ts`** - Central export file for all types
- **`user.ts`** - User-related types and interfaces
- **`auth.ts`** - Authentication and session types
- **`navigation.ts`** - Navigation and UI component types
- **`api.ts`** - Generic API response and utility types

## Usage Guidelines

### Import from Central Index

```typescript
// ✅ Preferred - Import from central index
import type { UserWithRole, Role, AuthUser } from '@/types';

// ❌ Avoid - Direct file imports (unless specific need)
import type { UserWithRole } from '@/types/user';
```

### Type Categories

#### User Types

- `UserWithRole` - User with optional role relation
- `UserWithRoleRequired` - User with required role relation
- `AuthUser` - User for authentication contexts (string role)
- `UserProfile` - Simplified user for display/navigation
- `UserFormData` - Form data structure
- `UserFormProps` - User form component props

#### Auth Types

- `AuthSession` - Complete auth session
- `SessionResponse` - API session response
- `LoginData` - Login form data
- `SignupData` - Signup form data
- `AuthActionResult` - Server action results

#### API Types

- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Paginated data response
- `ActionState<T>` - Server action state

### Prisma Integration

All Prisma types are re-exported through the central types system:

```typescript
// Available as centralized exports
import type { PrismaUser, PrismaRole, PrismaSession } from '@/types';

// Direct Prisma types (when needed)
import type { User, Role } from '@prisma/client';
```

## Best Practices

1. **Always use centralized types** - Import from `@/types` instead of defining inline
2. **Leverage Prisma types** - Extend Prisma types rather than redefining
3. **Use composite types** - Prefer `UserWithRole` over inline `User & { role: Role }`
4. **Type safety with validation** - Use `satisfies` in Zod schemas for type alignment
5. **Document complex types** - Add JSDoc comments for business logic types

## Examples

### Component Props

```typescript
// ✅ Centralized interface
interface MyComponentProps {
  users: UserWithRoleRequired[];
  onUserSelect: (user: UserWithRole) => void;
}

// ❌ Inline repetition
interface MyComponentProps {
  users: (User & { role: Role })[];
  onUserSelect: (user: User & { role: Role | null }) => void;
}
```

### Form Handling

```typescript
// ✅ Use predefined form types
const form = useForm<UserFormData>({
  resolver: zodResolver(userFormSchema),
});

// ❌ Infer types
const form = useForm<z.infer<typeof userFormSchema>>({
  resolver: zodResolver(userFormSchema),
});
```
