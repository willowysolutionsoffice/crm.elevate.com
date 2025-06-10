import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getAdmissionById } from '@/app/actions/admission-actions';
import { ReceiptPDFService } from '@/lib/receipt-pdf-service';
import { AdmissionWithRelations } from '@/types/admission';

/**
 * GET /api/admissions/[id]/receipt
 * Generate and return receipt PDF for an admission
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: admissionId } = await params;

    if (!admissionId) {
      return NextResponse.json({ error: 'Admission ID is required' }, { status: 400 });
    }

    // Fetch admission data with all relations
    const result = await getAdmissionById({ id: admissionId });

    if (!result.data?.success) {
      return NextResponse.json(
        { error: result.serverError || 'Failed to fetch admission' },
        { status: 404 }
      );
    }

    const admission = result.data.data as AdmissionWithRelations;

    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await ReceiptPDFService.generateReceiptPDF(admission);

    // Generate filename
    const filename = ReceiptPDFService.generateFileName(admission);

    // Return PDF with proper headers
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating receipt PDF:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate receipt PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admissions/[id]/receipt
 * Alternative method for generating receipt PDF (for complex scenarios)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: admissionId } = await params;

    if (!admissionId) {
      return NextResponse.json({ error: 'Admission ID is required' }, { status: 400 });
    }

    // Fetch admission data
    const result = await getAdmissionById({ id: admissionId });

    if (!result.data?.success) {
      return NextResponse.json(
        { error: result.serverError || 'Failed to fetch admission' },
        { status: 404 }
      );
    }

    const admission = result.data.data as AdmissionWithRelations;

    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await ReceiptPDFService.generateReceiptPDF(admission);

    // Generate filename
    const filename = ReceiptPDFService.generateFileName(admission);

    // Return PDF with proper headers
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating receipt PDF:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate receipt PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
