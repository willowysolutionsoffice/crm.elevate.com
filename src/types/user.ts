import type { User, Role } from '@prisma/client';

// Form-related types
export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface UserFormProps {
  roles: Role[];
  onSuccess?: () => void;
  initialData?: Partial<UserFormData>;
}

// Table and UI component types
export interface UsersTableProps {
  users: User[];
  roles: Role[];
}

// User profile for navigation/display purposes
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}

export interface RoleConfig {
  name: string;
  description: string;
  permissions?: string[];
}
