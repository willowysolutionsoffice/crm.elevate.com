'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAction } from 'next-safe-action/hooks';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  CalendarIcon,
  Plus,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  User,
  GraduationCap,
  CreditCard,
  Eye,
  Loader2,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from './ui/form';
import { Input } from './ui/input';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import {
  Course,
  EnquirySource,
  AmountCollectedType as PrismaAmountCollectedType,
  PaymentMode as PrismaPaymentMode,
  AdmissionGender as PrismaAdmissionGender,
} from '@prisma/client';
import {
  AdmissionFormData,
  AdmissionWithRelations,
  AdmissionGender,
  PaymentMode,
  AmountCollectedType,
} from '@/types/admission';
import { createAdmission, updateAdmission } from '@/app/actions/admission-actions';
import { updateEnquiryStatus } from '@/app/actions/enquiry';
import { EnquiryStatus } from '@/types/enquiry';
import { toast } from 'sonner';
import { Enquiry } from '@/types/enquiry';

interface SimpleCourse {
  id: string;
  name: string;
  description?: string | null;
  duration?: string | null;
  totalFee?: number | null;
  semesterFee?: number | null;
  admissionFee?: number | null;
}

interface AdmissionFormDialogProps {
  courses: SimpleCourse[];
  enquirySources: EnquirySource[];
  mode?: 'create' | 'edit';
  admission?: AdmissionWithRelations;
  enquiryData?: Enquiry;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Comprehensive validation schema using Zod
const admissionFormSchema = z
  .object({
    // Basic Details (Step 1)
    candidateName: z
      .string()
      .min(1, 'Candidate name is required')
      .max(100, 'Name must be less than 100 characters'),
    mobileNumber: z
      .string()
      .min(10, 'Mobile number must be at least 10 digits')
      .max(15, 'Mobile number must be less than 15 digits')
      .regex(/^[+]?[\d\s-()]+$/, 'Please enter a valid mobile number'),
    email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
    gender: z.nativeEnum(AdmissionGender, {
      errorMap: () => ({ message: 'Please select a gender' }),
    }),
    dateOfBirth: z
      .date({
        required_error: 'Date of birth is required',
        invalid_type_error: 'Please select a valid date',
      })
      .refine((date) => {
        const today = new Date();
        const minAge = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
        const maxAge = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
        return date >= minAge && date <= maxAge;
      }, 'Candidate must be between 15 and 100 years old'),
    address: z
      .string()
      .min(10, 'Address must be at least 10 characters')
      .max(500, 'Address must be less than 500 characters'),
    leadSource: z.string().min(1, 'Lead source is required'),

    // Education Details (Step 2)
    lastQualification: z
      .string()
      .min(1, 'Last qualification is required')
      .max(100, 'Qualification must be less than 100 characters'),
    yearOfPassing: z
      .number()
      .min(1950, 'Year must be after 1950')
      .max(new Date().getFullYear(), `Year cannot be more than ${new Date().getFullYear()}`),
    percentageCGPA: z
      .string()
      .min(1, 'Percentage/CGPA is required')
      .max(20, 'Value must be less than 20 characters'),
    instituteName: z
      .string()
      .min(1, 'Institute name is required')
      .max(200, 'Institute name must be less than 200 characters'),
    additionalNotes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),

    // Course & Fee Details (Step 3)
    courseId: z.string().min(1, 'Please select a course'),
    nextDueDate: z
      .date({
        required_error: 'Next due date is required',
        invalid_type_error: 'Please select a valid date',
      })
      .refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 'Next due date cannot be in the past'),
    amountCollectedTowards: z.nativeEnum(AmountCollectedType, {
      errorMap: () => ({ message: 'Please select what the amount is collected towards' }),
    }),
    paymentMode: z.nativeEnum(PaymentMode, {
      errorMap: () => ({ message: 'Please select a payment mode' }),
    }),
    transactionIdReferenceNumber: z
      .string()
      .max(100, 'Transaction reference must be less than 100 characters')
      .optional(),
    amountPaid: z
      .number({
        required_error: 'Amount paid is required',
        invalid_type_error: 'Please enter a valid amount',
      })
      .min(0.01, 'Amount must be greater than 0')
      .max(1000000, 'Amount cannot exceed 10,00,000'),
  })
  .refine(
    (data) => {
      // Conditional validation: require transaction reference for non-cash payments
      if (
        data.paymentMode !== PaymentMode.CASH &&
        (!data.transactionIdReferenceNumber || data.transactionIdReferenceNumber.trim() === '')
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Transaction ID/Reference number is required for non-cash payments',
      path: ['transactionIdReferenceNumber'],
    }
  );

type AdmissionFormValues = z.infer<typeof admissionFormSchema>;

export function AdmissionFormDialog({
  courses,
  enquirySources,
  mode = 'create',
  admission,
  enquiryData,
  onSuccess,
  trigger,
  open,
  onOpenChange,
}: AdmissionFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Use external open prop if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Reset current step when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const totalSteps = 4;
  const stepTitles = ['Basic Details', 'Education Details', 'Course & Fees', 'Review & Confirm'];
  const stepIcons = [User, GraduationCap, CreditCard, Eye];

  // Form setup with Zod validation
  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
      candidateName: admission?.candidateName || enquiryData?.candidateName || '',
      mobileNumber: admission?.mobileNumber || enquiryData?.phone || '',
      email: admission?.email || enquiryData?.email || '',
      gender: admission?.gender || undefined,
      dateOfBirth: admission?.dateOfBirth ? new Date(admission.dateOfBirth) : undefined,
      address: admission?.address || enquiryData?.address || '',
      leadSource: admission?.leadSource || enquiryData?.enquirySource?.name || '',
      lastQualification: admission?.lastQualification || '',
      yearOfPassing: admission?.yearOfPassing || new Date().getFullYear(),
      percentageCGPA: admission?.percentageCGPA || '',
      instituteName: admission?.instituteName || '',
      additionalNotes: admission?.additionalNotes || '',
      courseId: admission?.courseId || enquiryData?.preferredCourse?.id || '',
      nextDueDate: admission?.nextDueDate ? new Date(admission.nextDueDate) : undefined,
      amountCollectedTowards:
        admission?.amountCollectedTowards || AmountCollectedType.ADMISSION_FEE,
      paymentMode: admission?.paymentMode || undefined,
      transactionIdReferenceNumber: admission?.transactionIdReferenceNumber || '',
      amountPaid: 0,
    },
    mode: 'onChange',
  });

  // Use next-safe-action hooks - separate for create and update due to different schemas
  const { execute: executeCreate, isExecuting: isExecutingCreate } = useAction(createAdmission, {
    onSuccess: async ({ data }) => {
      if (data?.success) {
        toast.success(data.message || 'Admission created successfully!');

        // Update enquiry status to ENROLLED if this admission was created from an enquiry
        if (enquiryData && enquiryData.id) {
          try {
            const enquiryUpdateResult = await updateEnquiryStatus(
              enquiryData.id,
              EnquiryStatus.ENROLLED
            );
            if (enquiryUpdateResult.success) {
              toast.success('Enquiry status updated to Enrolled');
            } else {
              toast.error('Failed to update enquiry status');
            }
          } catch (error) {
            console.error('Error updating enquiry status:', error);
            toast.error('Failed to update enquiry status');
          }
        }

        setIsOpen(false);
        setCurrentStep(0);
        form.reset();
        onSuccess?.();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to create admission. Please try again.');
    },
    onSettled: ({ result }) => {
      if (result?.validationErrors) {
        // Handle validation errors from server action
        Object.entries(result.validationErrors).forEach(([field, errors]) => {
          if (
            errors &&
            typeof errors === 'object' &&
            '_errors' in errors &&
            Array.isArray(errors._errors) &&
            errors._errors[0]
          ) {
            form.setError(field as keyof AdmissionFormValues, {
              message: errors._errors[0],
            });
          }
        });
      }
    },
  });

  const { execute: executeUpdate, isExecuting: isExecutingUpdate } = useAction(updateAdmission, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || 'Admission updated successfully!');
        setIsOpen(false);
        setCurrentStep(0);
        form.reset();
        onSuccess?.();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update admission. Please try again.');
    },
    onSettled: ({ result }) => {
      if (result?.validationErrors) {
        // Handle validation errors from server action
        Object.entries(result.validationErrors).forEach(([field, errors]) => {
          if (
            errors &&
            typeof errors === 'object' &&
            '_errors' in errors &&
            Array.isArray(errors._errors) &&
            errors._errors[0]
          ) {
            form.setError(field as keyof AdmissionFormValues, {
              message: errors._errors[0],
            });
          }
        });
      }
    },
  });

  // Determine which execute function and loading state to use
  const execute = mode === 'create' ? executeCreate : executeUpdate;
  const isExecuting = mode === 'create' ? isExecutingCreate : isExecutingUpdate;

  // Reset form with enquiry data when enquiry data changes
  useEffect(() => {
    if (enquiryData && isOpen) {
      form.reset({
        candidateName: enquiryData.candidateName || '',
        mobileNumber: enquiryData.phone || '',
        email: enquiryData.email || '',
        gender: undefined,
        dateOfBirth: undefined,
        address: enquiryData.address || '',
        leadSource: enquiryData.enquirySource?.name || '',
        lastQualification: '',
        yearOfPassing: new Date().getFullYear(),
        percentageCGPA: '',
        instituteName: '',
        additionalNotes: enquiryData.notes ? `Notes from enquiry: ${enquiryData.notes}` : '',
        courseId: enquiryData.preferredCourse?.id || '',
        nextDueDate: undefined,
        amountCollectedTowards: AmountCollectedType.ADMISSION_FEE,
        paymentMode: undefined,
        transactionIdReferenceNumber: '',
        amountPaid: 0,
      });
    }
  }, [enquiryData, isOpen, form]);

  // Watch form values for dynamic behavior
  const watchedCourseId = form.watch('courseId');
  const watchedPaymentMode = form.watch('paymentMode');
  const watchedAmountTowards = form.watch('amountCollectedTowards') as
    | 'ADMISSION_FEE'
    | 'SEMESTER_FEE'
    | 'TOTAL_FEE';
  const watchedAmountPaid = form.watch('amountPaid');

  // Get selected course details
  const selectedCourse = courses.find((course) => course.id === watchedCourseId);

  // Calculate progress
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Step validation functions
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const fieldsToValidate: { [key: number]: (keyof AdmissionFormValues)[] } = {
      0: [
        'candidateName',
        'mobileNumber',
        'email',
        'gender',
        'dateOfBirth',
        'address',
        'leadSource',
      ],
      1: ['lastQualification', 'yearOfPassing', 'percentageCGPA', 'instituteName'],
      2: [
        'courseId',
        'nextDueDate',
        'amountCollectedTowards',
        'paymentMode',
        'transactionIdReferenceNumber',
        'amountPaid',
      ],
    };

    const fields = fieldsToValidate[stepIndex];
    if (!fields) return true;

    const result = await form.trigger(fields);
    return result;
  };

  // Navigation functions
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    // Allow going back to previous steps
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
      return;
    }

    // For moving forward, validate all previous steps
    let canProceed = true;
    for (let i = currentStep; i < stepIndex; i++) {
      const isStepValid = await validateStep(i);
      if (!isStepValid) {
        canProceed = false;
        break;
      }
    }

    if (canProceed) {
      setCurrentStep(stepIndex);
    }
  };

  // Form submission
  const onSubmit = async (data: AdmissionFormValues) => {
    if (mode === 'create') {
      // Convert form data to match the create admission schema
      const createData = {
        ...data,
        email: data.email || undefined, // Convert empty string to undefined
      };
      executeCreate(createData);
    } else {
      // Convert form data to match the update admission schema
      if (!admission?.id) {
        toast.error('No admission ID found for update');
        return;
      }

      const updateData = {
        id: admission.id,
        candidateName: data.candidateName,
        mobileNumber: data.mobileNumber,
        email: data.email || undefined,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        leadSource: data.leadSource,
        lastQualification: data.lastQualification,
        yearOfPassing: data.yearOfPassing,
        percentageCGPA: data.percentageCGPA,
        instituteName: data.instituteName,
        additionalNotes: data.additionalNotes,
        courseId: data.courseId,
        nextDueDate: data.nextDueDate,
        amountCollectedTowards: data.amountCollectedTowards,
        paymentMode: data.paymentMode,
        transactionIdReferenceNumber: data.transactionIdReferenceNumber,
        amountPaid: data.amountPaid,
      };
      executeUpdate(updateData);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isExecuting) {
      setCurrentStep(0);
      form.reset();
    }
    setIsOpen(newOpen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger || (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {mode === 'edit' ? 'Edit Admission' : 'Create Admission'}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-screen-sm max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">
            {mode === 'edit' ? 'Edit Admission' : 'Create New Admission'}
            {enquiryData && (
              <span className="text-lg font-normal text-blue-600 ml-2">(from enquiry)</span>
            )}
          </DialogTitle>
          <DialogDescription>
            {enquiryData
              ? `Creating admission for ${enquiryData.candidateName} from enquiry. Some fields have been pre-filled.`
              : `Fill in the details to ${
                  mode === 'edit' ? 'update the' : 'create a new'
                } admission record.`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-1 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6 px-1">
          {stepTitles.map((title, index) => {
            const StepIcon = stepIcons[index];
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className="flex flex-col items-center space-y-2 transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && !isCompleted && 'bg-primary text-primary-foreground',
                    !isCurrent && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium transition-colors duration-200 hidden sm:block',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-green-600'
                  )}
                >
                  {title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Details */}
              {currentStep === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Details
                    </CardTitle>
                    <CardDescription>
                      Please provide the candidate's basic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="candidateName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Candidate Name *
                              {enquiryData?.candidateName && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  From enquiry
                                </Badge>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Mobile Number *
                              {enquiryData?.phone && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  From enquiry
                                </Badge>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+91 9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email Address
                              {enquiryData?.email && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  From enquiry
                                </Badge>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="example@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={AdmissionGender.MALE}>Male</SelectItem>
                                <SelectItem value={AdmissionGender.FEMALE}>Female</SelectItem>
                                <SelectItem value={AdmissionGender.OTHER}>Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'PPP')
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date('1900-01-01')
                                  }
                                  captionLayout="dropdown"
                                  startMonth={new Date(1940, 0, 1)}
                                  endMonth={new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="leadSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Lead Source *
                              {enquiryData?.enquirySource?.name && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  From enquiry
                                </Badge>
                              )}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select lead source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {enquirySources.map((source) => (
                                  <SelectItem key={source.id} value={source.name}>
                                    {source.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Address *
                            {enquiryData?.address && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                From enquiry
                              </Badge>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter complete address"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Education Details */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education Details
                    </CardTitle>
                    <CardDescription>
                      Please provide educational background information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lastQualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Qualification *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., B.Tech, BCA, 12th Grade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearOfPassing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year of Passing *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2024"
                                min="1950"
                                max={new Date().getFullYear()}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value =
                                    parseInt(e.target.value) || new Date().getFullYear();
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="percentageCGPA"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Percentage/CGPA *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 85%, 8.5 CGPA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instituteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institute/College Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter institute name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional educational information, achievements, or special notes"
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Course & Fee Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Course & Fee Details
                      </CardTitle>
                      <CardDescription>Select course and configure payment details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="courseId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Select Course *
                              {enquiryData?.preferredCourse && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  From enquiry
                                </Badge>
                              )}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Choose a course" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {courses.map((course) => (
                                  <SelectItem key={course.id} value={course.id}>
                                    {course.name} - {formatCurrency(course.totalFee || 0)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Course Fee Breakdown */}
                      {selectedCourse && (
                        <Card className="bg-muted/50">
                          <CardContent className="pt-6">
                            <h4 className="font-semibold mb-3">Course Fee Breakdown</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div className="text-center p-3 bg-background rounded-lg">
                                <div className="font-semibold text-lg text-primary">
                                  {formatCurrency(selectedCourse.totalFee || 0)}
                                </div>
                                <div className="text-muted-foreground">Total Fee</div>
                              </div>
                              {selectedCourse.semesterFee !== 0 && (
                                <div className="text-center p-3 bg-background rounded-lg">
                                  <div className="font-semibold text-lg text-blue-600">
                                    {formatCurrency(selectedCourse.semesterFee || 0)}
                                  </div>
                                  <div className="text-muted-foreground">Semester Fee</div>
                                </div>
                              )}
                              <div className="text-center p-3 bg-background rounded-lg">
                                <div className="font-semibold text-lg text-green-600">
                                  {formatCurrency(selectedCourse.admissionFee || 0)}
                                </div>
                                <div className="text-muted-foreground">Admission Fee</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <FormField
                          control={form.control}
                          name="nextDueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Next Due Date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP')
                                      ) : (
                                        <span>Select due date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    autoFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="amountCollectedTowards"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount Collected Towards *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select fee type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ADMISSION_FEE">
                                    Admission Fee
                                    {selectedCourse &&
                                      ` - ${formatCurrency(selectedCourse.admissionFee || 0)}`}
                                  </SelectItem>
                                  {selectedCourse?.semesterFee !== 0 && (
                                    <SelectItem value="SEMESTER_FEE">
                                      Semester Fee -{' '}
                                      {formatCurrency(selectedCourse?.semesterFee || 0)}
                                    </SelectItem>
                                  )}

                                  <SelectItem value="TOTAL_FEE">
                                    Total Fee - {formatCurrency(selectedCourse?.totalFee || 0)}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="amountPaid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount Paid *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter amount"
                                  step="0.01"
                                  min="0"
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Mode *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select payment mode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="CASH">Cash</SelectItem>
                                  <SelectItem value="UPI">UPI</SelectItem>
                                  <SelectItem value="CARD">Card</SelectItem>
                                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchedPaymentMode && watchedPaymentMode !== PaymentMode.CASH && (
                          <FormField
                            control={form.control}
                            name="transactionIdReferenceNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transaction ID/Reference Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter transaction reference" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Required for {watchedPaymentMode} payments
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Review & Confirm
                    </CardTitle>
                    <CardDescription>
                      Please review all information before submitting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Details Review */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Basic Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{' '}
                          {form.getValues('candidateName') || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Mobile:</span>{' '}
                          {form.getValues('mobileNumber') || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{' '}
                          {form.getValues('email') || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Gender:</span>{' '}
                          {form.getValues('gender') || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Date of Birth:</span>{' '}
                          {form.getValues('dateOfBirth')
                            ? format(form.getValues('dateOfBirth'), 'PPP')
                            : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Lead Source:</span>{' '}
                          {form.getValues('leadSource') || 'N/A'}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Address:</span>{' '}
                          {form.getValues('address') || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Education Details Review */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Education Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Last Qualification:</span>{' '}
                          {form.getValues('lastQualification') || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Year of Passing:</span>{' '}
                          {form.getValues('yearOfPassing') || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Percentage/CGPA:</span>{' '}
                          {form.getValues('percentageCGPA') || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Institute:</span>{' '}
                          {form.getValues('instituteName') || 'N/A'}
                        </div>
                        {form.getValues('additionalNotes') && (
                          <div className="md:col-span-2">
                            <span className="font-medium">Additional Notes:</span>{' '}
                            {form.getValues('additionalNotes')}
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Course & Fee Details Review */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Course & Fee Details
                      </h4>
                      <div className="space-y-4">
                        {selectedCourse && (
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="font-semibold text-lg mb-2">{selectedCourse.name}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Total Fee:</span>{' '}
                                <Badge variant="outline">
                                  {formatCurrency(selectedCourse.totalFee || 0)}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">Admission Fee:</span>{' '}
                                <Badge variant="secondary">
                                  {formatCurrency(selectedCourse.admissionFee || 0)}
                                </Badge>
                              </div>
                              {selectedCourse.semesterFee !== 0 && (
                                <div>
                                  <span className="font-medium">Semester Fee:</span>{' '}
                                  <Badge variant="outline">
                                    {formatCurrency(selectedCourse.semesterFee || 0)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Next Due Date:</span>{' '}
                            {form.getValues('nextDueDate')
                              ? format(form.getValues('nextDueDate'), 'PPP')
                              : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Amount Collected Towards:</span>{' '}
                            <Badge>
                              {form.getValues('amountCollectedTowards')?.replace('_', ' ') || 'N/A'}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Amount Paid:</span>{' '}
                            <Badge variant="default">
                              {formatCurrency(form.getValues('amountPaid') || 0)}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Payment Mode:</span>{' '}
                            <Badge variant="outline">
                              {form.getValues('paymentMode') || 'N/A'}
                            </Badge>
                          </div>
                          {form.getValues('transactionIdReferenceNumber') && (
                            <div>
                              <span className="font-medium">Transaction Reference:</span>{' '}
                              {form.getValues('transactionIdReferenceNumber')}
                            </div>
                          )}
                        </div>

                        {/* Calculate remaining balance */}
                        {selectedCourse && (
                          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                            <div className="font-semibold mb-2">Payment Summary</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Amount Paid:</span>{' '}
                                <span className="font-bold text-green-600">
                                  {formatCurrency(watchedAmountPaid || 0)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Remaining Balance:</span>{' '}
                                <span className="font-bold text-orange-600">
                                  {formatCurrency(
                                    Math.max(
                                      0,
                                      (selectedCourse.totalFee || 0) - (watchedAmountPaid || 0)
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isExecuting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isExecuting}
            >
              Cancel
            </Button>

            {currentStep < totalSteps - 1 ? (
              <Button type="button" onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isExecuting}
                className="gap-2"
              >
                {isExecuting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {mode === 'edit' ? 'Update Admission' : 'Create Admission'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
