import { User } from './user';

export interface SessionResponse {
  user: User & {
    role: string;
    roleId: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string;
    userAgent: string;
  };
}
