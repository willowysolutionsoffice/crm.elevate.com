'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Course, EnquirySource } from '@prisma/client';

// Form data type
export interface AdmissionFormData {
  candidateName: string;
  mobileNumber: string;
  email?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: Date;
  address: string;
  idProofUploadUrl?: string;
  leadSource: string;
  lastQualification: string;
  yearOfPassing: number;
  percentageCGPA: string;
  instituteName: string;
  additionalNotes?: string;
  courseId: string;
  nextDueDate: Date;
  amountCollectedTowards: 'ADMISSION_FEE' | 'SEMESTER_FEE';
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  transactionIdReferenceNumber?: string;
}

interface AdmissionFormDialogProps {
  courses: Course[];
  enquirySources: EnquirySource[];
  mode?: 'create' | 'edit';
  admission?: any; // Type this properly later
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AdmissionFormDialog({
  courses,
  enquirySources,
  mode = 'create',
  admission,
  onSuccess,
  trigger,
}: AdmissionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;
  const stepTitles = ['Basic Details', 'Education Details', 'Course & Fees', 'Review & Confirm'];
  const stepIcons = [User, GraduationCap, CreditCard, Eye];

  // Form setup without validation
  const form = useForm<AdmissionFormData>({
    defaultValues: {
      candidateName: admission?.candidateName || '',
      mobileNumber: admission?.mobileNumber || '',
      email: admission?.email || '',
      gender: admission?.gender || undefined,
      dateOfBirth: admission?.dateOfBirth ? new Date(admission.dateOfBirth) : undefined,
      address: admission?.address || '',
      idProofUploadUrl: admission?.idProofUploadUrl || '',
      leadSource: admission?.leadSource || '',
      lastQualification: admission?.lastQualification || '',
      yearOfPassing: admission?.yearOfPassing || new Date().getFullYear(),
      percentageCGPA: admission?.percentageCGPA || '',
      instituteName: admission?.instituteName || '',
      additionalNotes: admission?.additionalNotes || '',
      courseId: admission?.courseId || '',
      nextDueDate: admission?.nextDueDate ? new Date(admission.nextDueDate) : undefined,
      amountCollectedTowards: admission?.amountCollectedTowards || 'ADMISSION_FEE',
      paymentMode: admission?.paymentMode || undefined,
      transactionIdReferenceNumber: admission?.transactionIdReferenceNumber || '',
    },
    mode: 'onChange',
  });

  // Watch form values for dynamic behavior
  const watchedCourseId = form.watch('courseId');
  const watchedPaymentMode = form.watch('paymentMode');
  const watchedAmountTowards = form.watch('amountCollectedTowards');

  // Get selected course details
  const selectedCourse = courses.find((course) => course.id === watchedCourseId);

  // Calculate progress
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Navigation functions
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Form submission
  const onSubmit = async (data: AdmissionFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual form submission
      console.log('Admission form data:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setOpen(false);
      setCurrentStep(0);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting admission form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      setCurrentStep(0);
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {mode === 'edit' ? 'Edit Admission' : 'Create Admission'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">
            {mode === 'edit' ? 'Edit Admission' : 'Create New Admission'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to {mode === 'edit' ? 'update the' : 'create a new'} admission
            record.
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
                className="flex flex-col items-center space-y-2 transition-all duration-200 cursor-pointer"
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
                            <FormLabel>Candidate Name *</FormLabel>
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
                            <FormLabel>Mobile Number *</FormLabel>
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
                            <FormLabel>Email Address</FormLabel>
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
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
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
                        name="leadSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lead Source *</FormLabel>
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
                          <FormLabel>Complete Address *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter complete address including city, state, and PIN code"
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idProofUploadUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Proof (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                // TODO: Handle file upload
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file.name); // Temporary - implement actual upload
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload Aadhar Card, PAN Card, or Passport (Image or PDF)
                          </FormDescription>
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
                                type="text"
                                placeholder="2024"
                                value={field.value?.toString() || ''}
                                onChange={(e) => {
                                  field.onChange(e.target.value.replace(/[^0-9]/g, ''));
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
                            <FormLabel>Select Course *</FormLabel>
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

                        {watchedPaymentMode && watchedPaymentMode !== 'CASH' && (
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
                              {selectedCourse.semesterFee && (
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
                                {watchedAmountTowards === 'ADMISSION_FEE'
                                  ? formatCurrency(selectedCourse.admissionFee || 0)
                                  : formatCurrency(selectedCourse.semesterFee || 0)}
                              </div>
                              <div>
                                <span className="font-medium">Remaining Balance:</span>{' '}
                                <span className="font-bold text-orange-600">
                                  {watchedAmountTowards === 'ADMISSION_FEE'
                                    ? formatCurrency(
                                        (selectedCourse.totalFee || 0) -
                                          (selectedCourse.admissionFee || 0)
                                      )
                                    : formatCurrency(
                                        (selectedCourse.totalFee || 0) -
                                          (selectedCourse.semesterFee || 0)
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
            disabled={currentStep === 0 || isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
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
