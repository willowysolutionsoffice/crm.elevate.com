import type { Session, User } from '@prisma/client';

// Session-related types
export interface SessionResponse {
  user: User;
  session: Session;
}

// Login data types
export interface LoginData {
  email: string;
  password: string;
}
