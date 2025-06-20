import { z } from "zod";

/**
 * Enum representing the different types of fees that can be collected
 */
export enum CollectedTowards {
  ADMISSION_FEE = "ADMISSION_FEE",
  COURSE_FEE = "COURSE_FEE",
  SEMESTER_FEE = "SEMESTER_FEE",
  OTHER = "OTHER",
}

/**
 * Interface representing a receipt in the system
 */
import { User } from "@prisma/client";

export interface Receipt {
  id: string;
  receiptNumber: string;
  amountCollected: number;
  collectedTowards: CollectedTowards;
  paymentDate: Date;
  paymentMode: string;
  transactionId?: string;
  notes?: string;
  admissionId: string;
  courseId: string;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseFee {
  id: string;
  name: string;
  courseFee: number | null;
  admissionFee: number | null;
  semesterFee: number | null;
}

/**
 * Interface representing an admission with its receipts and course details
 */
export interface AdmissionWithReceiptsAndCourse {
  id: string;
  admissionNumber: string;
  candidateName: string;
  totalFee?: number;
  balance: number;
  nextDueDate?: Date;
  receipts: Receipt[];
  course: CourseFee;
}

/**
 * Input type for creating a new receipt
 */
export interface CreateReceiptInput {
  receiptNumber: string;
  amountCollected: number;
  collectedTowards: CollectedTowards;
  paymentDate: Date;
  nextDueDate: Date;
  paymentMode: string;
  transactionId?: string;
  notes?: string;
  admissionId: string;
  courseId: string;
}

/**
 * Input type for updating an existing receipt
 */
export interface UpdateReceiptInput {
  id: string;
  receiptNumber?: string;
  amountCollected?: number;
  collectedTowards?: CollectedTowards;
  paymentDate: Date;
  nextDueDate: Date;
  paymentMode?: string;
  transactionId?: string;
  notes?: string;
}

/**
 * Zod schema for receipt form data validation
 */
export const receiptFormSchema = z.object({
  receiptNumber: z.string().min(1, { message: "Receipt number is required" }),
  amountCollected: z.coerce
    .number()
    .min(1, { message: "Amount must be greater than 0" }),
  collectedTowards: z.nativeEnum(CollectedTowards, {
    required_error: "Please select a fee type",
  }),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),
  nextDueDate: z.date({
    required_error: "Next due date is required",
  }),
  paymentMode: z.string().min(1, { message: "Payment mode is required" }),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Type for receipt form data
 */
export type ReceiptFormData = z.infer<typeof receiptFormSchema>;

/**
 * Type for fee calculation results
 */
export interface FeeCalculationResult {
  courseFee: number;
  admissionFee: number;
  semesterFee?: number | null;
  balance: number;
  nextDueDate?: Date;
  totalFee: number;
  totalPaid: number;
}
