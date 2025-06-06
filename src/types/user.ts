export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  role: Role | null;
}
