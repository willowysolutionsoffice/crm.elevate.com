'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  FollowUpStatus,
  CreateFollowUpInput,
  UpdateFollowUpInput,
  FollowUpFilters,
} from '@/types/enquiry';

// Generic response type
interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Helper function to get current user
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

// Follow-up Actions
export async function createFollowUp(data: CreateFollowUpInput): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    // Check if user has access to the enquiry
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: data.enquiryId },
    });

    if (!enquiry) {
      return {
        success: false,
        message: 'Enquiry not found',
      };
    }

    if (user.role === 'telecaller' && enquiry.assignedToUserId !== user.id) {
      return {
        success: false,
        message: 'Access denied',
      };
    }

    const followUp = await prisma.followUp.create({
      data: {
        ...data,
        createdByUserId: user.id,
      },
      include: {
        enquiry: {
          include: {
            branch: true,
            preferredCourse: true,
            enquirySource: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    revalidatePath('/follow-ups');
    revalidatePath(`/enquiries/${data.enquiryId}`);
    return { success: true, data: followUp, message: 'Follow-up scheduled successfully' };
  } catch (error) {
    console.error('Error creating follow-up:', error);
    return {
      success: false,
      message: 'Failed to create follow-up',
    };
  }
}

export async function getFollowUps(filters: FollowUpFilters = {}): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    const { page = 1, limit = 50, status, overdue, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (user.role === 'telecaller') {
      where.enquiry = {
        assignedToUserId: user.id,
      };
    }

    if (status && status.length > 0) {
      where.status = { in: status };
    }

    if (overdue) {
      where.AND = [{ status: FollowUpStatus.PENDING }, { scheduledAt: { lt: new Date() } }];
    }

    if (dateFrom || dateTo) {
      const scheduledAtFilter: Record<string, Date> = {};
      if (dateFrom) scheduledAtFilter.gte = dateFrom;
      if (dateTo) scheduledAtFilter.lte = dateTo;
      where.scheduledAt = scheduledAtFilter;
    }

    const [followUps, total] = await Promise.all([
      prisma.followUp.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          enquiry: {
            include: {
              branch: true,
              preferredCourse: true,
              enquirySource: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.followUp.count({ where }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return {
      success: true,
      data: followUps,
      pagination,
      message: 'Follow-ups fetched successfully',
    };
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return {
      success: false,
      message: 'Failed to fetch follow-ups',
    };
  }
}

export async function updateFollowUp(data: UpdateFollowUpInput): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    const { id, ...updateData } = data;

    // Check if follow-up exists and user has permission
    const existingFollowUp = await prisma.followUp.findUnique({
      where: { id },
      include: {
        enquiry: true,
      },
    });

    if (!existingFollowUp) {
      return {
        success: false,
        message: 'Follow-up not found',
      };
    }

    if (user.role === 'telecaller' && existingFollowUp.enquiry.assignedToUserId !== user.id) {
      return {
        success: false,
        message: 'Access denied',
      };
    }

    const followUp = await prisma.followUp.update({
      where: { id },
      data: updateData,
      include: {
        enquiry: {
          include: {
            branch: true,
            preferredCourse: true,
            enquirySource: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    revalidatePath('/follow-ups');
    revalidatePath(`/enquiries/${existingFollowUp.enquiryId}`);
    return { success: true, data: followUp, message: 'Follow-up updated successfully' };
  } catch (error) {
    console.error('Error updating follow-up:', error);
    return {
      success: false,
      message: 'Failed to update follow-up',
    };
  }
}

export async function deleteFollowUp(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    // Check if follow-up exists and user has permission
    const existingFollowUp = await prisma.followUp.findUnique({
      where: { id },
      include: {
        enquiry: true,
      },
    });

    if (!existingFollowUp) {
      return {
        success: false,
        message: 'Follow-up not found',
      };
    }

    // Only allow deletion by admin or the assigned user
    if (user.role === 'telecaller' && existingFollowUp.enquiry.assignedToUserId !== user.id) {
      return {
        success: false,
        message: 'Access denied',
      };
    }

    await prisma.followUp.delete({
      where: { id },
    });

    revalidatePath('/follow-ups');
    revalidatePath(`/enquiries/${existingFollowUp.enquiryId}`);
    return { success: true, message: 'Follow-up deleted successfully' };
  } catch (error) {
    console.error('Error deleting follow-up:', error);
    return {
      success: false,
      message: 'Failed to delete follow-up',
    };
  }
}
