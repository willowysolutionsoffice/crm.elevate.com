'use server';

import { z } from 'zod';
import { adminActionClient, executiveActionClient } from '@/lib/safe-action';
import prisma from '@/lib/prisma';

// Schema for updating user roles (Admin only)
const updateUserRoleSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
});

// Schema for creating new users (Executive and Admin)
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  roleId: z.string(),
});

// Admin-only action: Update user role
export const updateUserRoleAction = adminActionClient
  .schema(updateUserRoleSchema)
  .action(async ({ parsedInput: { userId, roleId }, ctx }) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { roleId },
        include: { role: true },
      });

      return {
        success: true,
        message: `User role updated successfully to ${updatedUser.role?.name}`,
        user: updatedUser,
      };
    } catch (error) {
      throw new Error('Failed to update user role');
    }
  });

// Executive and Admin action: Create new user
export const createUserAction = executiveActionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput: { name, email, roleId }, ctx }) => {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          roleId,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        include: { role: true },
      });

      return {
        success: true,
        message: 'User created successfully',
        user: newUser,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  });

// Admin-only action: Get all users
export const getAllUsersAction = adminActionClient.action(async ({ ctx }) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      users,
    };
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
});

// Executive and Admin action: Get users by role
export const getUsersByRoleAction = executiveActionClient
  .schema(z.object({ roleName: z.string() }))
  .action(async ({ parsedInput: { roleName }, ctx }) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: {
            name: roleName,
          },
        },
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        users,
      };
    } catch (error) {
      throw new Error('Failed to fetch users by role');
    }
  });
