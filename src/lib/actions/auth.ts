'use server';

import { z } from 'zod';
import { actionClient } from '@/lib/safe-action';
import { auth } from '@/lib/auth';
import { returnValidationErrors } from 'next-safe-action';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loginSchema, signupSchema } from '@/schema/auth-schema';

// Signup action
export const signupAction = actionClient
  .inputSchema(signupSchema)
  .action(async ({ parsedInput: { name, email, password } }) => {
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
