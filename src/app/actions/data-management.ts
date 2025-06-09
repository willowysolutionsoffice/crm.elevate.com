'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import {
  CreateRoleInput,
  UpdateRoleInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateBranchInput,
  UpdateBranchInput,
  CreateEnquirySourceInput,
  UpdateEnquirySourceInput,
  DeleteInput,
} from '@/types/data-management';

// Generic response type
interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// Role Actions
export async function getAllRoles(): Promise<ActionResponse> {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Roles fetched successfully',
      data: roles,
    };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return {
      success: false,
      message: 'Failed to fetch roles',
    };
  }
}

export async function createRole(input: CreateRoleInput): Promise<ActionResponse> {
  try {
    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: input.name },
    });

    if (existingRole) {
      return {
        success: false,
        message: 'Role with this name already exists',
      };
    }

    const role = await prisma.role.create({
      data: input,
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Role created successfully',
      data: role,
    };
  } catch (error) {
    console.error('Error creating role:', error);
    return {
      success: false,
      message: 'Failed to create role',
    };
  }
}

export async function updateRole(input: UpdateRoleInput): Promise<ActionResponse> {
  try {
    // Check if another role with the same name exists
    const existingRole = await prisma.role.findFirst({
      where: {
        name: input.name,
        NOT: { id: input.id },
      },
    });

    if (existingRole) {
      return {
        success: false,
        message: 'Another role with this name already exists',
      };
    }

    const role = await prisma.role.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
      },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Role updated successfully',
      data: role,
    };
  } catch (error) {
    console.error('Error updating role:', error);
    return {
      success: false,
      message: 'Failed to update role',
    };
  }
}

export async function deleteRole(input: DeleteInput): Promise<ActionResponse> {
  try {
    await prisma.role.delete({
      where: { id: input.id },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Role deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting role:', error);
    return {
      success: false,
      message: 'Failed to delete role',
    };
  }
}

// Course Actions
export async function getAllCourses(): Promise<ActionResponse> {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Courses fetched successfully',
      data: courses,
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      success: false,
      message: 'Failed to fetch courses',
    };
  }
}

export async function createCourse(input: CreateCourseInput): Promise<ActionResponse> {
  try {
    const course = await prisma.course.create({
      data: {
        name: input.name,
        description: input.description,
        duration: input.duration,
        totalFee: input.totalFee,
        semesterFee: input.semesterFee,
        admissionFee: input.admissionFee,
      },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Course created successfully',
      data: course,
    };
  } catch (error) {
    console.error('Error creating course:', error);
    return {
      success: false,
      message: 'Failed to create course',
    };
  }
}

export async function updateCourse(input: UpdateCourseInput): Promise<ActionResponse> {
  try {
    const course = await prisma.course.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        duration: input.duration,
        totalFee: input.totalFee,
        semesterFee: input.semesterFee,
        admissionFee: input.admissionFee,
      },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Course updated successfully',
      data: course,
    };
  } catch (error) {
    console.error('Error updating course:', error);
    return {
      success: false,
      message: 'Failed to update course',
    };
  }
}

export async function deleteCourse(input: DeleteInput): Promise<ActionResponse> {
  try {
    await prisma.course.delete({
      where: { id: input.id },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Course deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting course:', error);
    return {
      success: false,
      message: 'Failed to delete course',
    };
  }
}

export async function toggleCourseStatus(input: DeleteInput): Promise<ActionResponse> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: input.id },
    });

    if (!course) {
      return {
        success: false,
        message: 'Course not found',
      };
    }

    const updatedCourse = await prisma.course.update({
      where: { id: input.id },
      data: { isActive: !course.isActive },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: `Course ${updatedCourse.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedCourse,
    };
  } catch (error) {
    console.error('Error toggling course status:', error);
    return {
      success: false,
      message: 'Failed to toggle course status',
    };
  }
}

// Branch Actions
export async function getAllBranches(): Promise<ActionResponse> {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Branches fetched successfully',
      data: branches,
    };
  } catch (error) {
    console.error('Error fetching branches:', error);
    return {
      success: false,
      message: 'Failed to fetch branches',
    };
  }
}

export async function createBranch(input: CreateBranchInput): Promise<ActionResponse> {
  try {
    const branch = await prisma.branch.create({
      data: input,
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Branch created successfully',
      data: branch,
    };
  } catch (error) {
    console.error('Error creating branch:', error);
    return {
      success: false,
      message: 'Failed to create branch',
    };
  }
}

export async function updateBranch(input: UpdateBranchInput): Promise<ActionResponse> {
  try {
    const branch = await prisma.branch.update({
      where: { id: input.id },
      data: {
        name: input.name,
        address: input.address,
        phone: input.phone,
        email: input.email,
      },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Branch updated successfully',
      data: branch,
    };
  } catch (error) {
    console.error('Error updating branch:', error);
    return {
      success: false,
      message: 'Failed to update branch',
    };
  }
}

export async function deleteBranch(input: DeleteInput): Promise<ActionResponse> {
  try {
    await prisma.branch.delete({
      where: { id: input.id },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Branch deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting branch:', error);
    return {
      success: false,
      message: 'Failed to delete branch',
    };
  }
}

export async function toggleBranchStatus(input: DeleteInput): Promise<ActionResponse> {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: input.id },
    });

    if (!branch) {
      return {
        success: false,
        message: 'Branch not found',
      };
    }

    const updatedBranch = await prisma.branch.update({
      where: { id: input.id },
      data: { isActive: !branch.isActive },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: `Branch ${updatedBranch.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedBranch,
    };
  } catch (error) {
    console.error('Error toggling branch status:', error);
    return {
      success: false,
      message: 'Failed to toggle branch status',
    };
  }
}

// Enquiry Source Actions
export async function getAllEnquirySources(): Promise<ActionResponse> {
  try {
    const sources = await prisma.enquirySource.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Enquiry sources fetched successfully',
      data: sources,
    };
  } catch (error) {
    console.error('Error fetching enquiry sources:', error);
    return {
      success: false,
      message: 'Failed to fetch enquiry sources',
    };
  }
}

export async function createEnquirySource(
  input: CreateEnquirySourceInput
): Promise<ActionResponse> {
  try {
    const source = await prisma.enquirySource.create({
      data: input,
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Enquiry source created successfully',
      data: source,
    };
  } catch (error) {
    console.error('Error creating enquiry source:', error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return {
        success: false,
        message: 'Enquiry source with this name already exists',
      };
    }
    return {
      success: false,
      message: 'Failed to create enquiry source',
    };
  }
}

export async function updateEnquirySource(
  input: UpdateEnquirySourceInput
): Promise<ActionResponse> {
  try {
    const source = await prisma.enquirySource.update({
      where: { id: input.id },
      data: {
        name: input.name,
      },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Enquiry source updated successfully',
      data: source,
    };
  } catch (error) {
    console.error('Error updating enquiry source:', error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return {
        success: false,
        message: 'Another enquiry source with this name already exists',
      };
    }
    return {
      success: false,
      message: 'Failed to update enquiry source',
    };
  }
}

export async function deleteEnquirySource(input: DeleteInput): Promise<ActionResponse> {
  try {
    await prisma.enquirySource.delete({
      where: { id: input.id },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: 'Enquiry source deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting enquiry source:', error);
    return {
      success: false,
      message: 'Failed to delete enquiry source',
    };
  }
}

export async function toggleEnquirySourceStatus(input: DeleteInput): Promise<ActionResponse> {
  try {
    const source = await prisma.enquirySource.findUnique({
      where: { id: input.id },
    });

    if (!source) {
      return {
        success: false,
        message: 'Enquiry source not found',
      };
    }

    const updatedSource = await prisma.enquirySource.update({
      where: { id: input.id },
      data: { isActive: !source.isActive },
    });

    revalidatePath('/admin/data-management');

    return {
      success: true,
      message: `Enquiry source ${
        updatedSource.isActive ? 'activated' : 'deactivated'
      } successfully`,
      data: updatedSource,
    };
  } catch (error) {
    console.error('Error toggling enquiry source status:', error);
    return {
      success: false,
      message: 'Failed to toggle enquiry source status',
    };
  }
}
