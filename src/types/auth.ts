import type { Session as PrismaSession } from '@prisma/client';
import type { AuthUser, UserWithRole } from '@/types/user';

// Session-related types
export interface SessionResponse {
  user: AuthUser;
  session: PrismaSession;
}

export interface AuthSession {
  user: AuthUser;
  session: PrismaSession;
}

// Action result types
export interface AuthActionResult {
  success: boolean;
  message: string;
  redirectTo?: string;
  user?: UserWithRole;
}

// Login/Signup data types
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData extends LoginData {
  name: string;
  confirmPassword: string;
  roleId: string;
}

// User management action types
export interface UpdateUserData {
  userId: string;
  name: string;
  roleId: string;
}

export interface DeleteUserData {
  userId: string;
}

// Auth context types
export interface AuthContextType {
  user: AuthUser | null;
  session: PrismaSession | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}
