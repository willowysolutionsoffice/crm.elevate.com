'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  User,
  Receipt,
  IndianRupee,
  FileText,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Building,
  CreditCard,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { getAdmissionById } from '@/app/actions/admission-actions';
import { toast } from 'sonner';
import {
  AdmissionWithRelations,
  PaymentModeLabels,
  AmountCollectedTypeLabels,
  AdmissionGenderLabels,
} from '@/types/admission';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const admissionId = params.id as string;

  const [admission, setAdmission] = useState<AdmissionWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  // Fetch admission data
  const fetchAdmission = useCallback(async () => {
    if (!admissionId) return;

    setIsLoading(true);
    try {
      const result = await getAdmissionById({ id: admissionId });

      if (result.data?.success) {
        setAdmission(result.data.data as AdmissionWithRelations);
      } else {
        toast.error(result.serverError || 'Failed to fetch admission');
        router.push('/admissions');
      }
    } catch (error) {
      console.error('Error fetching admission:', error);
      toast.error('Failed to fetch admission');
      router.push('/admissions');
    } finally {
      setIsLoading(false);
    }
  }, [admissionId, router]);

  useEffect(() => {
    fetchAdmission();
  }, [fetchAdmission]);

  const handleBack = () => {
    router.push('/admissions');
  };

  const handleGenerateReceipt = async () => {
    try {
      setIsGeneratingReceipt(true);
      toast.info('Generating receipt...');

      // Open receipt PDF in new tab
      const receiptUrl = `/api/admissions/${admissionId}/receipt`;
      window.open(receiptUrl, '_blank');

      toast.success('Receipt opened in new tab!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Admission Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The admission you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admissions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admission Details: {admission.admissionNumber}
            </h1>
            <p className="text-muted-foreground">View and manage admission information</p>
          </div>
        </div>
        <Button onClick={handleGenerateReceipt} disabled={isGeneratingReceipt} className="gap-2">
          <FileText className="h-4 w-4" />
          {isGeneratingReceipt ? 'Generating...' : 'Generate Receipt'}
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Candidate&apos;s personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="font-medium">{admission.candidateName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="font-medium">{AdmissionGenderLabels[admission.gender]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{admission.mobileNumber}</p>
                  </div>
                </div>
                {admission.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{admission.email}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{formatDate(admission.dateOfBirth)}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="font-medium">{admission.address}</p>
                </div>
              </div>
              {admission.leadSource && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lead Source</label>
                  <p className="font-medium">{admission.leadSource}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education Details
              </CardTitle>
              <CardDescription>Academic background and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Qualification
                  </label>
                  <p className="font-medium">{admission.lastQualification}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Year of Passing
                  </label>
                  <p className="font-medium">{admission.yearOfPassing}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Percentage/CGPA
                  </label>
                  <p className="font-medium">{admission.percentageCGPA}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Institute Name
                  </label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{admission.instituteName}</p>
                  </div>
                </div>
              </div>
              {admission.additionalNotes && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Additional Notes
                    </label>
                    <p className="font-medium mt-1">{admission.additionalNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Course Information
              </CardTitle>
              <CardDescription>Enrolled course details and fee structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Course Name</label>
                  <p className="font-medium text-lg">{admission.course.name}</p>
                </div>
                {admission.course.duration && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="font-medium">{admission.course.duration}</p>
                  </div>
                )}
              </div>
              {admission.course.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Course Description
                  </label>
                  <p className="font-medium mt-1">{admission.course.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Fee and Payment Details */}
        <div className="space-y-6">
          {/* Fee Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Fee Breakdown
              </CardTitle>
              <CardDescription>Course fees and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Course Fee</span>
                  <span className="font-medium">{formatCurrency(admission.courseTotalFee)}</span>
                </div>
                {admission.course.admissionFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Admission Fee</span>
                    <span className="font-medium">
                      {formatCurrency(admission.course.admissionFee)}
                    </span>
                  </div>
                )}
                {admission.course.semesterFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Semester Fee</span>
                    <span className="font-medium">
                      {formatCurrency(admission.course.semesterFee)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span
                    className={`${
                      admission.remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}
                  >
                    Remaining Balance
                  </span>
                  <span
                    className={`${
                      admission.remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}
                  >
                    {formatCurrency(admission.remainingBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>Current payment details and receipt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount Collected Towards
                  </label>
                  <p className="font-medium">
                    {AmountCollectedTypeLabels[admission.amountCollectedTowards]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Mode</label>
                  <p className="font-medium">{PaymentModeLabels[admission.paymentMode]}</p>
                </div>
                {admission.transactionIdReferenceNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Transaction Reference
                    </label>
                    <p className="font-medium font-mono text-sm">
                      {admission.transactionIdReferenceNumber}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Receipt Number
                  </label>
                  <p className="font-medium font-mono text-sm">{admission.receiptNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Next Due Date</label>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{formatDate(admission.nextDueDate)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admission Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Admission Information
              </CardTitle>
              <CardDescription>Admission record details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Admission Number
                  </label>
                  <p className="font-medium font-mono text-sm">{admission.admissionNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <p className="font-medium">{formatDate(admission.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <p className="font-medium">{admission.createdBy.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="font-medium">{formatDate(admission.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
