import { Template } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { text, table, svg, line, multiVariableText } from '@pdfme/schemas';
import { AdmissionWithRelations } from '@/types/admission';
import { ReceiptTemplateMapper } from './receipt-template-mapper';
import fs from 'fs';
import path from 'path';

/**
 * PDF Service for generating receipt PDFs using pdfme
 */
export class ReceiptPDFService {
  /**
   * Generate a PDF from an admission receipt
   * @param admission - Admission with relations to generate PDF for
   * @returns Promise<Uint8Array> - The generated PDF as Uint8Array
   */
  static async generateReceiptPDF(admission: AdmissionWithRelations): Promise<Uint8Array> {
    try {
      // Validate admission data
      ReceiptTemplateMapper.validateAdmissionData(admission);

      // Load the receipt template
      const template = await this.loadReceiptTemplate();

      // Map admission data to template inputs
      const templateInputs = ReceiptTemplateMapper.mapToTemplateInputs(admission);
      const inputs = [templateInputs];

      // Generate the PDF
      const pdf = await generate({
        template,
        inputs,
        plugins: {
          text,
          table,
          svg,
          line,
          multiVariableText,
        },
      });

      return pdf;
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      throw new Error('Failed to generate receipt PDF');
    }
  }

  /**
   * Load the receipt template from the public directory
   * @returns Promise<Template> - The pdfme template
   */
  private static async loadReceiptTemplate(): Promise<Template> {
    try {
      // Get the path to the template file in the public directory
      const templatePath = path.join(process.cwd(), 'public', 'pdf', 'receipt_template.json');

      // Check if file exists
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found at: ${templatePath}`);
      }

      // Read and parse the template file
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = JSON.parse(templateContent);

      return template as Template;
    } catch (error) {
      console.error('Error loading receipt template:', error);
      throw new Error('Failed to load receipt template');
    }
  }

  /**
   * Get PDF as downloadable blob (for browser)
   * @param pdfBuffer - PDF Uint8Array
   * @returns Blob for download
   */
  static createDownloadableBlob(pdfBuffer: Uint8Array): Blob {
    return new Blob([pdfBuffer], { type: 'application/pdf' });
  }

  /**
   * Generate preview URL for receipt PDF
   * @param admissionId - Admission ID
   * @returns Preview URL string
   */
  static generatePreviewUrl(admissionId: string): string {
    return `/api/admissions/${admissionId}/receipt?preview=true`;
  }

  /**
   * Generate download URL for receipt PDF
   * @param admissionId - Admission ID
   * @returns Download URL string
   */
  static generateDownloadUrl(admissionId: string): string {
    return `/api/admissions/${admissionId}/receipt`;
  }

  /**
   * Generate filename for receipt PDF
   * @param admission - Admission data
   * @returns Filename string
   */
  static generateFileName(admission: AdmissionWithRelations): string {
    const date = new Date(admission.createdAt).toISOString().split('T')[0];
    const candidateName = admission.candidateName.replace(/[^a-zA-Z0-9]/g, '_');
    const receiptNumber = admission.receiptNumber || 'RECEIPT';
    return `Receipt_${receiptNumber}_${candidateName}_${date}.pdf`;
  }
}

// Keep the old functions for backward compatibility, but mark them as deprecated
/**
 * @deprecated Use ReceiptPDFService.loadReceiptTemplate() instead
 */
export async function loadReceiptTemplate(): Promise<Template> {
  return ReceiptPDFService['loadReceiptTemplate']();
}

/**
 * @deprecated Use ReceiptTemplateMapper.validateAdmissionData() instead
 */
export function validateAdmissionData(admission: AdmissionWithRelations): void {
  ReceiptTemplateMapper.validateAdmissionData(admission);
}

/**
 * @deprecated Use ReceiptTemplateMapper.mapToTemplateInputs() instead
 */
export function mapAdmissionToReceiptTemplate(admission: AdmissionWithRelations) {
  return ReceiptTemplateMapper.mapToTemplateInputs(admission);
}

/**
 * @deprecated Use ReceiptPDFService.generateReceiptPDF() instead
 */
export async function generateReceiptPDF(admission: AdmissionWithRelations): Promise<Uint8Array> {
  return ReceiptPDFService.generateReceiptPDF(admission);
}

/**
 * @deprecated Use ReceiptPDFService.createDownloadableBlob() instead
 */
export function createDownloadableBlob(pdfBuffer: Uint8Array): Blob {
  return ReceiptPDFService.createDownloadableBlob(pdfBuffer);
}

/**
 * @deprecated Use ReceiptPDFService.generateFileName() instead
 */
export function generateReceiptFileName(admission: AdmissionWithRelations): string {
  return ReceiptPDFService.generateFileName(admission);
}
