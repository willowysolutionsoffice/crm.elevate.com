import {
  AdmissionWithRelations,
  AmountCollectedTypeLabels,
  PaymentModeLabels,
} from '@/types/admission';
import { formatCurrency } from '@/lib/utils';

// Define specific types for receipt template inputs
interface ReceiptTemplateInputs {
  billedToInput: string;
  info: string; // JSON string containing receipt info
  orders: string[][]; // 2D array for receipt items table
  date: string;
  balanceFormatted: string;
  dueDate: string;
  amountPaidFormatted: string;
}

interface ReceiptPreviewData {
  templateInputs: ReceiptTemplateInputs;
  computedValues: {
    totalWithAdmissionFee: number;
    amountPaid: number;
    remainingBalance: number;
  };
  itemCount: number;
  hasMultiplePages: boolean;
}

/**
 * Maps admission data to the specific template format used in receipt_template.json
 */
export class ReceiptTemplateMapper {
  /**
   * Map admission data to receipt template inputs that match the existing template structure
   * @param admission - Admission with relations to map
   * @returns Receipt template inputs object
   */
  static mapToTemplateInputs(admission: AdmissionWithRelations): ReceiptTemplateInputs {
    // Format dates
    const receiptDate = new Date(admission.createdAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const nextDueDate = new Date(admission.nextDueDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Calculate amount paid based on total fee and remaining balance
    const totalWithAdmissionFee = admission.courseTotalFee + admission.admissionFee;
    const amountPaid = Math.max(0, totalWithAdmissionFee - admission.remainingBalance);

    // Create receipt items table
    const receiptItems: string[][] = [];

    // Add course fee item
    receiptItems.push([
      `Course: ${admission.course.name}`,
      formatCurrency(admission.courseTotalFee),
    ]);

    // Add admission fee item
    receiptItems.push(['Admission Fee', formatCurrency(admission.admissionFee)]);

    // Add semester fee if present
    if (admission.semesterFee && admission.semesterFee > 0) {
      receiptItems.push(['Semester Fee', formatCurrency(admission.semesterFee)]);
    }

    // Add total course fee
    receiptItems.push(['Total Course Fee', formatCurrency(totalWithAdmissionFee)]);

    // Add amount paid toward specific fee type
    const amountCollectedLabel = AmountCollectedTypeLabels[admission.amountCollectedTowards];
    receiptItems.push([`Amount Paid toward ${amountCollectedLabel}`, formatCurrency(amountPaid)]);

    // Format billed to information
    const billedToInfo = [
      admission.candidateName,
      admission.mobileNumber,
      admission.email || '',
      admission.address,
    ]
      .filter(Boolean)
      .join('\n');

    // Prepare template inputs according to receipt template field names
    return {
      // Billed to field
      billedToInput: billedToInfo,

      // Receipt info object for multiVariableText field (must be JSON string)
      info: JSON.stringify({
        ReceiptNo: admission.receiptNumber,
        Date: receiptDate,
      }),

      // Orders table (2D array) - contains course info and fees
      orders: receiptItems,

      // For footer calculations
      date: receiptDate,

      // Formatted currency values for display
      balanceFormatted: formatCurrency(admission.remainingBalance),
      dueDate: nextDueDate,
      amountPaidFormatted: formatCurrency(amountPaid),
    };
  }

  /**
   * Validate that the admission has the required data for receipt generation
   * @param admission - Admission to validate
   * @returns True if valid, throws error if invalid
   */
  static validateAdmissionData(admission: AdmissionWithRelations): boolean {
    if (!admission.receiptNumber) {
      throw new Error('Receipt number is required');
    }

    if (!admission.candidateName || admission.candidateName.trim() === '') {
      throw new Error('Candidate name is required');
    }

    if (!admission.mobileNumber || admission.mobileNumber.trim() === '') {
      throw new Error('Mobile number is required');
    }

    if (!admission.course?.name) {
      throw new Error('Course name is required');
    }

    if (admission.courseTotalFee === null || admission.courseTotalFee === undefined) {
      throw new Error('Course total fee is required');
    }

    if (admission.admissionFee === null || admission.admissionFee === undefined) {
      throw new Error('Admission fee is required');
    }

    if (admission.remainingBalance === null || admission.remainingBalance === undefined) {
      throw new Error('Remaining balance is required');
    }

    if (!admission.nextDueDate) {
      throw new Error('Next due date is required');
    }

    return true;
  }

  /**
   * Create a preview data object for testing template mapping
   * @param admission - Admission data
   * @returns Preview object with formatted data
   */
  static createPreviewData(admission: AdmissionWithRelations): ReceiptPreviewData {
    const templateInputs = this.mapToTemplateInputs(admission);
    const totalWithAdmissionFee = admission.courseTotalFee + admission.admissionFee;
    const amountPaid = Math.max(0, totalWithAdmissionFee - admission.remainingBalance);

    return {
      templateInputs,
      computedValues: {
        totalWithAdmissionFee,
        amountPaid,
        remainingBalance: admission.remainingBalance,
      },
      itemCount: templateInputs.orders.length,
      hasMultiplePages: templateInputs.orders.length > 10, // Estimate based on template space
    };
  }
}
