
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  FileText,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Building,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { getAdmissionById } from '@/app/actions/admission-actions';
import { toast } from 'sonner';
import {
  AdmissionWithRelations,
  AdmissionGenderLabels,
} from '@/types/admission';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';



export default async function AdmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  console.log(id);


  const result = await getAdmissionById({ id: id }).catch((error) => {
    toast.error(error.message);
    redirect('/admissions');
  });

  if (!result || !result.data) {
    toast.error('Admission not found');
    redirect('/admissions');
  }


  const admission = result.data.data as AdmissionWithRelations;

  const handleBack = () => {
    redirect('/admissions');
  };

  // Receipt generation functionality removed - fee management no longer supported

  // Loading skeleton
  // if (isLoading) {
  //   return (
  //     <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
  //       {/* Header Skeleton */}
  //       <div className="flex items-center justify-between">
  //         <div className="flex items-center gap-4">
  //           <Skeleton className="h-10 w-10" />
  //           <div className="space-y-2">
  //             <Skeleton className="h-8 w-64" />
  //             <Skeleton className="h-4 w-32" />
  //           </div>
  //         </div>
  //         <div className="flex gap-2">
  //           <Skeleton className="h-9 w-20" />
  //           <Skeleton className="h-9 w-32" />
  //         </div>
  //       </div>

  //       {/* Content Skeleton */}
  //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  //         <div className="lg:col-span-2 space-y-6">
  //           <Card>
  //             <CardHeader>
  //               <Skeleton className="h-6 w-32" />
  //               <Skeleton className="h-4 w-48" />
  //             </CardHeader>
  //             <CardContent className="space-y-4">
  //               <Skeleton className="h-24 w-full" />
  //               <Skeleton className="h-16 w-full" />
  //             </CardContent>
  //           </Card>
  //         </div>
  //         <div className="space-y-6">
  //           <Card>
  //             <CardHeader>
  //               <Skeleton className="h-6 w-24" />
  //             </CardHeader>
  //             <CardContent>
  //               <Skeleton className="h-32 w-full" />
  //             </CardContent>
  //           </Card>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (!admission) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Admission Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The admission you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href='/admissions'>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admissions
              </Button>
            </Link>
          </div>
        </div>
      </div >
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href='/admissions'>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admission Details: {admission.admissionNumber}
            </h1>
            <p className="text-muted-foreground">View and manage admission information</p>
          </div>
        </div>
        {/* Receipt generation removed - fee management no longer supported */}
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
              <CardDescription>Enrolled course details and information</CardDescription>
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Additional information can be added here */}





          {/* Admission Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
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
