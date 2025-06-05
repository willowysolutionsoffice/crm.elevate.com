import { betterAuth } from 'better-auth';
import prisma from '@/lib/prisma';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      roleId: {
        type: 'string',
        required: false,
        input: false, // don't allow user to set role directly
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      // Fetch user role from database
      let userRole = null;
      let roleName = null;

      const userWithRole = user as typeof user & { roleId?: string };

      if (userWithRole.roleId) {
        const role = await prisma.role.findUnique({
          where: { id: userWithRole.roleId },
        });
        if (role) {
          userRole = role.id;
          roleName = role.name;
        }
      }

      return {
        user: {
          ...user,
          role: roleName,
          roleId: userRole,
        },
        session,
      };
    }),
    nextCookies(), // This MUST be the last plugin
  ],
});
