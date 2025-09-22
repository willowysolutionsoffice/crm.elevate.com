"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  CreditCard,
  AlertCircle,
  Receipt,
  Package,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { 
  getServiceBillById, 
  getServicesByIds, 
  getAdmissionHistoryById    
} from "@/server/actions/service-actions";
import { ServiceBilling } from "@/types/service-billing";
import { Service } from "@/types/data-management";


interface Receipt {
  id: string;
  admissionId: string;
  createdAt: Date;
  updatedAt: Date;
  courseId: string;
  receiptNumber: string;
  amountCollected: number;
  collectedTowards: string;
  paymentMode: string;
  paymentReference?: string;
  remarks?: string;
  createdById: string;
}

interface ServiceBill {
  id: string;
  admissionId: string;
  createdAt: Date;
  updatedAt: Date;
  serviceIds: string[];
  total: number;
  status: string;
  // Add other fields as needed
}

interface Admission {
  id: string;
  admissionNumber: string;
  candidateName: string;
  mobileNumber: string;
  email?: string;
  gender?: string;
  dateOfBirth?: Date;
  address: string;
  leadSource?: string;
  lastQualification?: string;
  yearOfPassing?: number;
  percentageCGPA?: string;
  instituteName?: string;
  additionalNotes?: string;
  balance: number;
  nextDueDate?: Date;
  status: string;
  course: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string | null;
    duration: string | null;
    courseFee: number | null;
    admissionFee: number | null;
    semesterFee: number | null;
    isActive: boolean;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  receipts: Receipt[];
  serviceBills: ServiceBill[];
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceBillDetails {
  serviceBill: ServiceBilling;
  services: Service[];
  admission: Admission;
}

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const AdmissionGenderLabels: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other'
};

function ServicePage() {
  const params = useParams();
  const { id } = params as { id: string };
  
  const [serviceBillDetails, setServiceBillDetails] = useState<ServiceBillDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceBillDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch service bill
        const serviceBillResult = await getServiceBillById(id);
        if (!serviceBillResult?.success || !serviceBillResult.data) {
          setError("Service bill not found");
          toast.error("Service bill not found");
          return;
        }

        const serviceBill = serviceBillResult.data as ServiceBilling;

        // Fetch services using the serviceIds from the bill
        const servicesResult = await getServicesByIds(serviceBill.serviceIds);
        if (!servicesResult || typeof servicesResult !== "object" || !("success" in servicesResult) || !servicesResult.success) {
          setError("Failed to fetch services");
          toast.error("Failed to fetch services");
          return;
        }

        const services = servicesResult.data as Service[];
        // Fetch admission details
        const admissionResult = await getAdmissionHistoryById(serviceBill.admissionId);
        if (!admissionResult?.success || !admissionResult.data) {
          setError("Failed to fetch admission details");
          toast.error("Failed to fetch admission details");
          return;
        }

        const admission = admissionResult.data as Admission;

        setServiceBillDetails({
          serviceBill,
          services,
          admission
        });

      } catch (err) {
        console.error("Error fetching service bill details:", err);
        const errorMessage = "An error occurred while fetching service bill details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchServiceBillDetails();
    }
  }, [id]);

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

  // Error state
  if (error || !serviceBillDetails) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Service Bill Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || "The service bill you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/service-bills">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Service Bills
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { serviceBill, services, admission } = serviceBillDetails;

  // Calculate totals
  const totalAmount = serviceBill.total;

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/services">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Service Bill Details
            </h1>
            <p className="text-muted-foreground">
              View service bill details and payment information
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
              <CardDescription>
                Details of the student for this service bill
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Student Name
                  </label>
                  <p className="font-medium">{admission.candidateName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Admission Number
                  </label>
                  <p className="font-medium font-mono text-sm">
                    {admission.admissionNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mobile Number
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{admission.mobileNumber}</p>
                  </div>
                </div>
                {admission.email && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{admission.email}</p>
                    </div>
                  </div>
                )}
                {admission.gender && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Gender
                    </label>
                    <p className="font-medium">
                      {AdmissionGenderLabels[admission.gender] || admission.gender}
                    </p>
                  </div>
                )}
                {admission.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {formatDate(admission.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="font-medium">{admission.address}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Course
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{admission.course.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Services Included
              </CardTitle>
              <CardDescription>
                List of services included in this bill
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Service ID: {service.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(service.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Total Summary */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education Information */}
          {(admission.lastQualification || admission.instituteName) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education Details
                </CardTitle>
                <CardDescription>
                  Academic background and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {admission.lastQualification && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Qualification
                      </label>
                      <p className="font-medium">{admission.lastQualification}</p>
                    </div>
                  )}
                  {admission.yearOfPassing && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Year of Passing
                      </label>
                      <p className="font-medium">{admission.yearOfPassing}</p>
                    </div>
                  )}
                  {admission.percentageCGPA && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Percentage/CGPA
                      </label>
                      <p className="font-medium">{admission.percentageCGPA}</p>
                    </div>
                  )}
                  {admission.instituteName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Institute Name
                      </label>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{admission.instituteName}</p>
                      </div>
                    </div>
                  )}
                </div>
                {admission.additionalNotes && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Additional Notes
                      </label>
                      <p className="font-medium mt-1">
                        {admission.additionalNotes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Bill Summary
              </CardTitle>
              <CardDescription>Service bill overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Total Amount
                    </span>
                  </div>
                  <Badge variant="outline" className="font-semibold text-blue-600">
                    {formatCurrency(totalAmount)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Services Count
                    </span>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    {services.length} service(s)
                  </Badge>
                </div>

                {admission.balance > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                        Student Balance
                      </span>
                    </div>
                    <Badge variant="destructive" className="font-semibold">
                      {formatCurrency(admission.balance)}
                    </Badge>
                  </div>
                )}

                {admission.nextDueDate && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">
                        Next Due Date
                      </span>
                    </div>
                    <Badge variant="outline" className="font-medium">
                      {formatDate(admission.nextDueDate)}
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              <Link href={`/admissions/${admission.id}`}>
                <Button className="w-full" variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  View Student Details
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Bill Information */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bill Information
              </CardTitle>
              <CardDescription>Service bill record details</CardDescription>
              </div>
            <Badge variant="outline" className="font-semibold">
              {serviceBill.status}
            </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Bill ID
                  </label>
                  <p className="font-medium font-mono text-sm">
                    {serviceBill.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created Date
                  </label>
                  <p className="font-medium">
                    {formatDate(serviceBill.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="font-medium">
                    {formatDate(serviceBill.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created By
                  </label>
                  <p className="font-medium">{admission.createdBy.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ServicePage;