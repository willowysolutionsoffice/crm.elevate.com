import type { User as PrismaUser, Role } from '@prisma/client';

export type User = PrismaUser & {
  role: string;
};

export interface UserFormProps {
  roles: Role[];
  onSuccess?: () => void;
  initialData?: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    roleId: string;
  };
  isEditing?: boolean;
  userId?: string;
}
