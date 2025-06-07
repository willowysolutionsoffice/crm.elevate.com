import { z } from 'zod';
import type { UserFormData, UpdateUserData, DeleteUserData, LoginData } from '@/types';

// Base user validation schemas
export const userFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    roleId: z.string().min(1, 'Please select a role'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }) satisfies z.ZodType<UserFormData>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
}) satisfies z.ZodType<LoginData>;

export const updateUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  roleId: z.string().min(1, 'Please select a role'),
}) satisfies z.ZodType<UpdateUserData>;

export const deleteUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
}) satisfies z.ZodType<DeleteUserData>;

// Re-export for backward compatibility (can be removed later)
export const signupSchema = userFormSchema;
