import type { User as PrismaUser, Role as PrismaRole } from '@prisma/client';

// Base exports from Prisma - centralized
export type { Role } from '@prisma/client';

// Composite types using Prisma types
export type UserWithRole = PrismaUser & {
  role: PrismaRole | null;
};

export type UserWithRoleRequired = PrismaUser & {
  role: PrismaRole;
};

// Extended user type for auth contexts
export type AuthUser = PrismaUser & {
  role: string | null;
  roleId: string | null;
};

// Form-related types
export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: string;
}

export interface UserFormProps {
  roles: PrismaRole[];
  onSuccess?: () => void;
  initialData?: Partial<UserFormData>;
  isEditing?: boolean;
  userId?: string;
}

// Table and UI component types
export interface UsersTableProps {
  users: UserWithRoleRequired[];
  roles: PrismaRole[];
}

// User profile for navigation/display purposes
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}

// Role-related utilities
export type RoleName = 'ADMIN' | 'EXECUTIVE' | 'TELECALLER';

export interface RoleConfig {
  name: RoleName;
  description: string;
  permissions?: string[];
}
