import {
  Admission,
  AdmissionGender,
  AdmissionStatus,
  AmountCollectedType,
  PaymentMode,
  Course,
  User,
  Enquiry,
} from '@prisma/client';

// Re-export Prisma enums for easier use
export { AdmissionGender, AdmissionStatus, AmountCollectedType, PaymentMode };

// Main Admission interface with relations
export interface AdmissionWithRelations extends Admission {
  course: Course;
  enquiry?: Enquiry | null;
  createdBy: User;
}

// Form data types
export interface CreateAdmissionInput {
  candidateName: string;
  mobileNumber: string;
  email?: string;
  gender: AdmissionGender;
  dateOfBirth: Date;
  address: string;
  leadSource?: string;
  lastQualification: string;
  yearOfPassing: number;
  percentageCGPA: string;
  instituteName: string;
  additionalNotes?: string;
  courseId: string;
  nextDueDate: Date;
  amountCollectedTowards: AmountCollectedType;
  paymentMode: PaymentMode;
  transactionIdReferenceNumber?: string;
  enquiryId?: string;
}

export interface UpdateAdmissionInput {
  id: string;
  candidateName?: string;
  mobileNumber?: string;
  email?: string;
  gender?: AdmissionGender;
  dateOfBirth?: Date;
  address?: string;
  leadSource?: string;
  lastQualification?: string;
  yearOfPassing?: number;
  percentageCGPA?: string;
  instituteName?: string;
  additionalNotes?: string;
  courseId?: string;
  nextDueDate?: Date;
  amountCollectedTowards?: AmountCollectedType;
  paymentMode?: PaymentMode;
  transactionIdReferenceNumber?: string;
  status?: AdmissionStatus;
  enquiryId?: string;
}

// Multi-step form data (used in components)
export interface AdmissionFormData {
  candidateName: string;
  mobileNumber: string;
  email?: string;
  gender: AdmissionGender;
  dateOfBirth: Date;
  address: string;
  leadSource: string;
  lastQualification: string;
  yearOfPassing: number;
  percentageCGPA: string;
  instituteName: string;
  additionalNotes?: string;
  courseId: string;
  nextDueDate: Date;
  amountCollectedTowards: AmountCollectedType;
  paymentMode: PaymentMode;
  transactionIdReferenceNumber?: string;
}

// Filter and search types
export interface AdmissionFilters {
  search?: string;
  status?: AdmissionStatus;
  courseId?: string;
  paymentMode?: PaymentMode;
  amountCollectedTowards?: AmountCollectedType;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

// Receipt generation types
export interface ReceiptData {
  admissionNumber: string;
  receiptNumber: string;
  candidateName: string;
  courseName: string;
  amountPaid: number;
  totalFee: number;
  remainingBalance: number;
  paymentMode: PaymentMode;
  transactionReference?: string;
  nextDueDate: Date;
  receiptDate: Date;
}

// API response types
export interface AdmissionListResponse {
  admissions: AdmissionWithRelations[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface CreateAdmissionResponse {
  success: boolean;
  admission?: AdmissionWithRelations;
  error?: string;
}

export interface UpdateAdmissionResponse {
  success: boolean;
  admission?: AdmissionWithRelations;
  error?: string;
}

// Calculation helpers
export interface FeeCalculation {
  totalFee: number;
  amountPaid: number;
  remainingBalance: number;
  nextDueAmount: number;
}

// Dashboard summary types
export interface AdmissionStats {
  totalAdmissions: number;
  pendingAdmissions: number;
  confirmedAdmissions: number;
  completedAdmissions: number;
  totalRevenue: number;
  pendingPayments: number;
}

// Table column types for data tables
export interface AdmissionTableRow {
  id: string;
  admissionNumber: string;
  candidateName: string;
  mobileNumber: string;
  courseName: string;
  status: AdmissionStatus;
  totalFee: number;
  remainingBalance: number;
  createdAt: Date;
}

// Form validation schemas helper types
export interface AdmissionValidationErrors {
  candidateName?: string;
  mobileNumber?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  leadSource?: string;
  lastQualification?: string;
  yearOfPassing?: string;
  percentageCGPA?: string;
  instituteName?: string;
  courseId?: string;
  nextDueDate?: string;
  amountCollectedTowards?: string;
  paymentMode?: string;
  transactionIdReferenceNumber?: string;
}

// Status display helpers
export const AdmissionStatusLabels: Record<AdmissionStatus, string> = {
  [AdmissionStatus.PENDING]: 'Pending',
  [AdmissionStatus.CONFIRMED]: 'Confirmed',
  [AdmissionStatus.COMPLETED]: 'Completed',
  [AdmissionStatus.CANCELLED]: 'Cancelled',
};

export const PaymentModeLabels: Record<PaymentMode, string> = {
  [PaymentMode.CASH]: 'Cash',
  [PaymentMode.UPI]: 'UPI',
  [PaymentMode.CARD]: 'Card',
  [PaymentMode.BANK_TRANSFER]: 'Bank Transfer',
};

export const AmountCollectedTypeLabels: Record<AmountCollectedType, string> = {
  [AmountCollectedType.ADMISSION_FEE]: 'Admission Fee',
  [AmountCollectedType.SEMESTER_FEE]: 'Semester Fee',
  [AmountCollectedType.TOTAL_FEE]: 'Total Fee',
};

export const AdmissionGenderLabels: Record<AdmissionGender, string> = {
  [AdmissionGender.MALE]: 'Male',
  [AdmissionGender.FEMALE]: 'Female',
  [AdmissionGender.OTHER]: 'Other',
};
