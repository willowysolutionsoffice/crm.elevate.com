'use server';

import { revalidatePath } from 'next/cache';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  EnquiryStatus,
  CreateEnquiryInput,
  UpdateEnquiryInput,
  EnquiryFilters,
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

// Enquiry Actions
export async function createEnquiry(data: CreateEnquiryInput): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    const enquiry = await prisma.enquiry.create({
      data: {
        ...data,
        createdByUserId: user.id,
        assignedToUserId: user.id, // Auto-assign to creator
        lastContactDate: new Date(),
      },
      include: {
        branch: true,
        preferredCourse: true,
        enquirySource: true,
        requiredService: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    revalidatePath('/enquiries');
    return { success: true, data: enquiry, message: 'Enquiry created successfully' };
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return {
      success: false,
      message: 'Failed to create enquiry',
    };
  }
}

export async function getEnquiries(filters: EnquiryFilters = {}): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    const {
      page = 1,
      limit = 10,
      search,
      status,
      branchId,
      enquirySourceId,
      assignedToUserId,
      dateFrom,
      dateTo,
    } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (user.role === 'telecaller') {
      where.assignedToUserId = user.id;
    }

    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status.length > 0) {
      where.status = { in: status };
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (enquirySourceId) {
      where.enquirySourceId = enquirySourceId;
    }

    if (assignedToUserId) {
      where.assignedToUserId = assignedToUserId;
    }

    if (dateFrom || dateTo) {
      const createdAtFilter: Record<string, Date> = {};
      if (dateFrom) createdAtFilter.gte = dateFrom;
      if (dateTo) createdAtFilter.lte = dateTo;
      where.createdAt = createdAtFilter;
    }

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          branch: true,
          preferredCourse: true,
          enquirySource: true,
          requiredService: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
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
      prisma.enquiry.count({ where }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return {
      success: true,
      data: enquiries,
      pagination,
      message: 'Enquiries fetched successfully',
    };
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return {
      success: false,
      message: 'Failed to fetch enquiries',
    };
  }
}

export async function getEnquiry(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        branch: true,
        preferredCourse: true,
        enquirySource: true,
        requiredService: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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
        followUps: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { scheduledAt: 'desc' },
        },
        callLogs: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { callDate: 'desc' },
        },
      },
    });

    if (!enquiry) {
      return {
        success: false,
        message: 'Enquiry not found',
      };
    }

    // Check access permissions
    if (user.role === 'telecaller' && enquiry.assignedToUserId !== user.id) {
      return {
        success: false,
        message: 'Access denied',
      };
    }

    return { success: true, data: enquiry, message: 'Enquiry fetched successfully' };
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    return {
      success: false,
      message: 'Failed to fetch enquiry',
    };
  }
}

export async function updateEnquiry(data: UpdateEnquiryInput): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    const { id, ...updateData } = data;

    // Check if enquiry exists and user has permission
    const existingEnquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existingEnquiry) {
      return {
        success: false,
        message: 'Enquiry not found',
      };
    }

    if (user.role === 'telecaller' && existingEnquiry.assignedToUserId !== user.id) {
      return {
        success: false,
        message: 'Access denied',
      };
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: updateData,
      include: {
        branch: true,
        preferredCourse: true,
        enquirySource: true,
        requiredService: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    revalidatePath('/enquiries');
    revalidatePath(`/enquiries/${id}`);
    return { success: true, data: enquiry, message: 'Enquiry updated successfully' };
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return {
      success: false,
      message: 'Failed to update enquiry',
    };
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    // Check if enquiry exists and user has permission
    const existingEnquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existingEnquiry) {
      return {
        success: false,
        message: 'Enquiry not found',
      };
    }

    if (user.role === 'telecaller' && existingEnquiry.assignedToUserId !== user.id) {
      return {
        success: false,
        message: 'Access denied',
      };
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: {
        status,
        lastContactDate: new Date(),
      },
    });

    revalidatePath('/enquiries');
    revalidatePath(`/enquiries/${id}`);
    return { success: true, data: enquiry, message: 'Status updated successfully' };
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    return {
      success: false,
      message: 'Failed to update status',
    };
  }
}

export async function assignEnquiry(id: string, assignedToUserId: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    // Only admins and executives can assign enquiries
    if (!['admin', 'executive'].includes(user.role || '')) {
      return {
        success: false,
        message: 'Access denied',
      };
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { assignedToUserId },
    });

    revalidatePath('/enquiries');
    revalidatePath(`/enquiries/${id}`);
    return { success: true, data: enquiry, message: 'Enquiry assigned successfully' };
  } catch (error) {
    console.error('Error assigning enquiry:', error);
    return {
      success: false,
      message: 'Failed to assign enquiry',
    };
  }
}

export async function deleteEnquiry(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();

    // Only admins can delete enquiries
    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'Access denied',
      };
    }

    await prisma.enquiry.delete({
      where: { id },
    });

    revalidatePath('/enquiries');
    return { success: true, message: 'Enquiry deleted successfully' };
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return {
      success: false,
      message: 'Failed to delete enquiry',
    };
  }
}

// Helper function to get users for assignment
export async function getUsers(): Promise<ActionResponse> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: users, message: 'Users fetched successfully' };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      message: 'Failed to fetch users',
    };
  }
}
