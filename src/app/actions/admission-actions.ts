'use server';

import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  AdmissionGender,
  AdmissionStatus,
  AmountCollectedType,
  PaymentMode,
  FeeCalculation,
} from '@/types/admission';
import { Prisma } from '@prisma/client';

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

// Create safe action client
const action = createSafeActionClient();

// Helper function to generate admission number
function generateAdmissionNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `ADM-${year}${month}${day}-${random}`;
}

// Helper function to generate receipt number
function generateReceiptNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `REC-${year}${month}${day}-${random}`;
}

// Helper function to calculate admission totals and remaining balance
function calculateAdmissionTotals(
  course: { totalFee: number | null; semesterFee: number | null; admissionFee: number | null },
  amountPaid: number
): FeeCalculation {
  const totalFee = course.totalFee || 0;
  const remainingBalance = Math.max(0, totalFee - amountPaid);
  const nextDueAmount = remainingBalance;

  return {
    totalFee,
    amountPaid: Math.round(amountPaid * 100) / 100,
    remainingBalance: Math.round(remainingBalance * 100) / 100,
    nextDueAmount: Math.round(nextDueAmount * 100) / 100,
  };
}

// Validation schemas
const createAdmissionSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  mobileNumber: z.string().min(10, 'Valid mobile number is required'),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.nativeEnum(AdmissionGender),
  dateOfBirth: z.date(),
  address: z.string().min(1, 'Address is required'),
  leadSource: z.string().optional(),
  lastQualification: z.string().min(1, 'Last qualification is required'),
  yearOfPassing: z.number().min(1950).max(new Date().getFullYear()),
  percentageCGPA: z.string().min(1, 'Percentage/CGPA is required'),
  instituteName: z.string().min(1, 'Institute name is required'),
  additionalNotes: z.string().optional(),
  courseId: z.string().min(1, 'Course selection is required'),
  nextDueDate: z.date(),
  amountCollectedTowards: z.nativeEnum(AmountCollectedType),
  paymentMode: z.nativeEnum(PaymentMode),
  transactionIdReferenceNumber: z.string().optional(),
  amountPaid: z.number().min(0.01, 'Amount paid must be greater than 0'),
  enquiryId: z.string().optional(),
});

const updateAdmissionSchema = z.object({
  id: z.string().min(1, 'Admission ID is required'),
  candidateName: z.string().optional(),
  mobileNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.nativeEnum(AdmissionGender).optional(),
  dateOfBirth: z.date().optional(),
  address: z.string().optional(),
  leadSource: z.string().optional(),
  lastQualification: z.string().optional(),
  yearOfPassing: z.number().min(1950).max(new Date().getFullYear()).optional(),
  percentageCGPA: z.string().optional(),
  instituteName: z.string().optional(),
  additionalNotes: z.string().optional(),
  courseId: z.string().optional(),
  nextDueDate: z.date().optional(),
  amountCollectedTowards: z.nativeEnum(AmountCollectedType).optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  transactionIdReferenceNumber: z.string().optional(),
  status: z.nativeEnum(AdmissionStatus).optional(),
  enquiryId: z.string().optional(),
});

const deleteAdmissionSchema = z.object({
  id: z.string().min(1, 'Admission ID is required'),
});

const getAdmissionsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: z.nativeEnum(AdmissionStatus).optional(),
  courseId: z.string().optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  amountCollectedTowards: z.nativeEnum(AmountCollectedType).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

const getAdmissionByIdSchema = z.object({
  id: z.string().min(1, 'Admission ID is required'),
});

const getAdmissionsByEnquirySchema = z.object({
  enquiryId: z.string().min(1, 'Enquiry ID is required'),
});

// Safe action for creating admission
export const createAdmission = action
  .schema(createAdmissionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const user = await getCurrentUser();

      // Get course details for fee calculation
      const course = await prisma.course.findUnique({
        where: { id: parsedInput.courseId },
        select: {
          id: true,
          name: true,
          totalFee: true,
          semesterFee: true,
          admissionFee: true,
        },
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Calculate totals
      const feeCalculation = calculateAdmissionTotals(course, parsedInput.amountPaid);

      // Generate unique admission number
      let admissionNumber: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        admissionNumber = generateAdmissionNumber();
        const existing = await prisma.admission.findUnique({
          where: { admissionNumber },
        });
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error('Could not generate unique admission number');
      }

      // Generate unique receipt number
      let receiptNumber: string;
      attempts = 0;

      do {
        receiptNumber = generateReceiptNumber();
        const existing = await prisma.admission.findUnique({
          where: { receiptNumber },
        });
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error('Could not generate unique receipt number');
      }

      const admission = await prisma.admission.create({
        data: {
          admissionNumber,
          receiptNumber,
          candidateName: parsedInput.candidateName,
          mobileNumber: parsedInput.mobileNumber,
          email: parsedInput.email || null,
          gender: parsedInput.gender,
          dateOfBirth: parsedInput.dateOfBirth,
          address: parsedInput.address,
          leadSource: parsedInput.leadSource || null,
          lastQualification: parsedInput.lastQualification,
          yearOfPassing: parsedInput.yearOfPassing,
          percentageCGPA: parsedInput.percentageCGPA,
          instituteName: parsedInput.instituteName,
          additionalNotes: parsedInput.additionalNotes || null,
          courseTotalFee: feeCalculation.totalFee,
          semesterFee: course.semesterFee,
          admissionFee: course.admissionFee || 0,
          nextDueDate: parsedInput.nextDueDate,
          amountCollectedTowards: parsedInput.amountCollectedTowards,
          paymentMode: parsedInput.paymentMode,
          transactionIdReferenceNumber: parsedInput.transactionIdReferenceNumber || null,
          remainingBalance: feeCalculation.remainingBalance,
          status: AdmissionStatus.PENDING,
          course: { connect: { id: parsedInput.courseId } },
          enquiry: parsedInput.enquiryId ? { connect: { id: parsedInput.enquiryId } } : undefined,
          createdBy: { connect: { id: user.id } },
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              totalFee: true,
              semesterFee: true,
              admissionFee: true,
            },
          },
          enquiry: {
            select: {
              id: true,
              candidateName: true,
              phone: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      revalidatePath('/admissions');
      return { success: true, data: admission, message: 'Admission created successfully' };
    } catch (error) {
      console.error('Error creating admission:', error);
      throw new Error('Failed to create admission');
    }
  });

// Safe action for updating admission
export const updateAdmission = action
  .schema(updateAdmissionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id, ...updateData } = parsedInput;

      // Check if admission exists
      const existingAdmission = await prisma.admission.findUnique({
        where: { id },
        include: { course: true },
      });

      if (!existingAdmission) {
        throw new Error('Admission not found');
      }

      // Build update data
      const data: Record<string, unknown> = {};

      // Basic fields
      if (updateData.candidateName) data.candidateName = updateData.candidateName;
      if (updateData.mobileNumber) data.mobileNumber = updateData.mobileNumber;
      if (updateData.email !== undefined) data.email = updateData.email || null;
      if (updateData.gender) data.gender = updateData.gender;
      if (updateData.dateOfBirth) data.dateOfBirth = updateData.dateOfBirth;
      if (updateData.address) data.address = updateData.address;
      if (updateData.leadSource !== undefined) data.leadSource = updateData.leadSource || null;
      if (updateData.lastQualification) data.lastQualification = updateData.lastQualification;
      if (updateData.yearOfPassing) data.yearOfPassing = updateData.yearOfPassing;
      if (updateData.percentageCGPA) data.percentageCGPA = updateData.percentageCGPA;
      if (updateData.instituteName) data.instituteName = updateData.instituteName;
      if (updateData.additionalNotes !== undefined)
        data.additionalNotes = updateData.additionalNotes || null;
      if (updateData.nextDueDate) data.nextDueDate = updateData.nextDueDate;
      if (updateData.paymentMode) data.paymentMode = updateData.paymentMode;
      if (updateData.transactionIdReferenceNumber !== undefined) {
        data.transactionIdReferenceNumber = updateData.transactionIdReferenceNumber || null;
      }
      if (updateData.status) data.status = updateData.status;

      // Handle course change or amount collected towards change
      if (updateData.courseId || updateData.amountCollectedTowards) {
        const courseId = updateData.courseId || existingAdmission.courseId;
        const amountCollectedTowards =
          updateData.amountCollectedTowards || existingAdmission.amountCollectedTowards;

        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: {
            totalFee: true,
            semesterFee: true,
            admissionFee: true,
          },
        });

        if (!course) {
          throw new Error('Course not found');
        }

        // Calculate amount paid based on existing data
        const currentAmountPaid =
          existingAdmission.courseTotalFee - existingAdmission.remainingBalance;
        const feeCalculation = calculateAdmissionTotals(course, currentAmountPaid);

        if (updateData.courseId) {
          data.course = { connect: { id: updateData.courseId } };
        }
        data.courseTotalFee = feeCalculation.totalFee;
        data.semesterFee = course.semesterFee;
        data.admissionFee = course.admissionFee || 0;
        data.amountCollectedTowards = amountCollectedTowards;
        data.remainingBalance = feeCalculation.remainingBalance;
      }

      const admission = await prisma.admission.update({
        where: { id },
        data,
        include: {
          course: {
            select: {
              id: true,
              name: true,
              totalFee: true,
              semesterFee: true,
              admissionFee: true,
            },
          },
          enquiry: {
            select: {
              id: true,
              candidateName: true,
              phone: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      revalidatePath('/admissions');
      revalidatePath(`/admissions/${id}`);
      return { success: true, data: admission, message: 'Admission updated successfully' };
    } catch (error) {
      console.error('Error updating admission:', error);
      throw new Error('Failed to update admission');
    }
  });

// Safe action for deleting admission (soft delete)
export const deleteAdmission = action
  .schema(deleteAdmissionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id } = parsedInput;

      // Check if admission exists
      const existingAdmission = await prisma.admission.findUnique({
        where: { id },
      });

      if (!existingAdmission) {
        throw new Error('Admission not found');
      }

      // Perform soft delete by updating status to CANCELLED
      await prisma.admission.update({
        where: { id },
        data: {
          status: AdmissionStatus.CANCELLED,
        },
      });

      revalidatePath('/admissions');
      return { success: true, message: 'Admission deleted successfully' };
    } catch (error) {
      console.error('Error deleting admission:', error);
      throw new Error('Failed to delete admission');
    }
  });

// Safe action for getting admissions with filters and pagination
export const getAdmissions = action.schema(getAdmissionsSchema).action(async ({ parsedInput }) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      courseId,
      paymentMode,
      amountCollectedTowards,
      dateFrom,
      dateTo,
    } = parsedInput;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.AdmissionWhereInput = {};

    // Add status filter (exclude cancelled by default)
    if (status) {
      where.status = status;
    } else {
      where.status = { not: AdmissionStatus.CANCELLED };
    }

    // Add search filter
    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
        { course: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Add other filters
    if (courseId) where.courseId = courseId;
    if (paymentMode) where.paymentMode = paymentMode;
    if (amountCollectedTowards) where.amountCollectedTowards = amountCollectedTowards;

    // Add date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [admissions, totalCount] = await Promise.all([
      prisma.admission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              totalFee: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.admission.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        admissions,
        totalCount,
        currentPage: page,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching admissions:', error);
    throw new Error('Failed to fetch admissions');
  }
});

// Safe action for getting single admission by ID
export const getAdmissionById = action
  .schema(getAdmissionByIdSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id } = parsedInput;

      const admission = await prisma.admission.findUnique({
        where: { id },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              totalFee: true,
              semesterFee: true,
              admissionFee: true,
              description: true,
              duration: true,
            },
          },
          enquiry: {
            select: {
              id: true,
              candidateName: true,
              phone: true,
              email: true,
              enquirySource: {
                select: {
                  name: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!admission) {
        throw new Error('Admission not found');
      }

      return { success: true, data: admission };
    } catch (error) {
      console.error('Error fetching admission:', error);
      throw new Error('Failed to fetch admission');
    }
  });

// Safe action for getting admissions by enquiry
export const getAdmissionsByEnquiry = action
  .schema(getAdmissionsByEnquirySchema)
  .action(async ({ parsedInput }) => {
    try {
      const { enquiryId } = parsedInput;

      const admissions = await prisma.admission.findMany({
        where: {
          enquiryId,
          status: { not: AdmissionStatus.CANCELLED },
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              totalFee: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, data: admissions };
    } catch (error) {
      console.error('Error fetching admissions by enquiry:', error);
      throw new Error('Failed to fetch admissions');
    }
  });

// Safe action for getting enquiry sources for admission form
export const getEnquirySourcesForAdmission = action.action(async () => {
  try {
    const enquirySources = await prisma.enquirySource.findMany();
    return { success: true, data: enquirySources };
  } catch (error) {
    console.error('Error fetching enquiry sources:', error);
    throw new Error('Failed to fetch enquiry sources');
  }
});

// Helper action to get active courses for admission form
export const getCoursesForAdmission = action.action(async () => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        totalFee: true,
        semesterFee: true,
        admissionFee: true,
        description: true,
        duration: true,
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: courses };
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses');
  }
});

// Helper function to recalculate admission totals (utility)
export async function recalculateAdmissionTotals(admissionId: string) {
  try {
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { course: true },
    });

    if (!admission) {
      throw new Error('Admission not found');
    }

    // Calculate amount paid based on existing data
    const amountPaid = admission.courseTotalFee - admission.remainingBalance;
    const feeCalculation = calculateAdmissionTotals(admission.course, amountPaid);

    await prisma.admission.update({
      where: { id: admissionId },
      data: {
        courseTotalFee: feeCalculation.totalFee,
        remainingBalance: feeCalculation.remainingBalance,
      },
    });

    return feeCalculation;
  } catch (error) {
    console.error('Error recalculating admission totals:', error);
    throw new Error('Failed to recalculate totals');
  }
}
