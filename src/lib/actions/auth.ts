'use server';

import { actionClient } from '@/lib/safe-action';
import { auth } from '@/lib/auth';
import { returnValidationErrors } from 'next-safe-action';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  loginSchema,
  userFormSchema as signupSchema,
  updateUserSchema,
  deleteUserSchema,
} from '@/schema/user-schema';

// Signup action
export const createUserAction = actionClient
  .inputSchema(signupSchema)
  .action(async ({ parsedInput: { name, email, password, roleId } }) => {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return returnValidationErrors(signupSchema, {
          email: {
            _errors: ['Email already exists'],
          },
        });
      }

      // Verify role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return returnValidationErrors(signupSchema, {
          roleId: {
            _errors: ['Invalid role selected'],
          },
        });
      }

      // Create user using better-auth
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

      if (!signUpResult.user) {
        throw new Error('Failed to create account');
      }

      // Update user with roleId
      await prisma.user.update({
        where: { id: signUpResult.user.id },
        data: { roleId },
      });

      return {
        success: true,
        message: 'Account created successfully. Please log in.',
        redirectTo: '/login',
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create account');
    }
  });

// Update user action
export const updateUserAction = actionClient
  .inputSchema(updateUserSchema)
  .action(async ({ parsedInput: { userId, name, roleId } }) => {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Verify role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return returnValidationErrors(updateUserSchema, {
          roleId: {
            _errors: ['Invalid role selected'],
          },
        });
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          roleId,
        },
        include: { role: true },
      });

      return {
        success: true,
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update user');
    }
  });

// Delete user action
export const deleteUserAction = actionClient
  .inputSchema(deleteUserSchema)
  .action(async ({ parsedInput: { userId } }) => {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Delete user
      await prisma.user.delete({
        where: { id: userId },
      });

      return {
        success: true,
        message: `User ${existingUser.name} has been deleted successfully`,
      };
    } catch (error) {
      console.error('Delete user error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  });

// Login action
export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      // Use better-auth to sign in
      const signInResult = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });

      if (!signInResult.user) {
        return returnValidationErrors(loginSchema, {
          _errors: ['Invalid email or password'],
        });
      }

      // The nextCookies plugin will automatically handle setting the session cookies
      return {
        success: true,
        message: 'Login successful',
        redirectTo: '/dashboard',
      };
    } catch (error) {
      console.error('Login error:', error);
      return returnValidationErrors(loginSchema, {
        _errors: ['Invalid email or password'],
      });
    }
  });

// Logout action
export const logoutAction = actionClient.action(async () => {
  // Clear all auth-related cookies
  const cookieStore = await cookies();

  // Clear potential better-auth session cookies
  cookieStore.delete('better-auth.session_token');
  cookieStore.delete('session_token');
  cookieStore.delete('auth.session-token');

  // Redirect to login page
  redirect('/login');
});

export const getAllUsers = async () =>
  await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });

export const getAllRoles = async () =>
  await prisma.role.findMany({
    orderBy: { name: 'asc' },
  });
