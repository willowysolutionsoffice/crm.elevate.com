'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAction } from 'next-safe-action/hooks';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Edit, Plus } from 'lucide-react';

import {
  createEnquiry,
  updateEnquiry,
  getBranches,
  getCourses,
  getEnquirySources,
  getRequiredServices,
} from '@/app/actions/enquiry-action';
import { EnquiryStatus, Enquiry } from '@/types/enquiry';
import { Branch, Course, EnquirySource, RequiredService } from '@/types/data-management';

// Form schema for client-side validation
const enquiryFormSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required').max(100),
  phone: z.string().min(10, 'Valid phone number is required').max(15),
  contact2: z.string().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.nativeEnum(EnquiryStatus).optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  enquirySourceId: z.string().min(1, 'Please select an enquiry source'),
  branchId: z.string().min(1, 'Please select a branch'),
  preferredCourseId: z.string().optional(),
  requiredServiceId: z.string().optional(),
});

type EnquiryFormData = z.infer<typeof enquiryFormSchema>;

interface EnquiryFormDialogProps {
  enquiry?: Enquiry; // For editing - pass enquiry data to pre-fill form
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EnquiryFormDialog({
  enquiry,
  mode = 'create',
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EnquiryFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const isEditMode = mode === 'edit' && enquiry;

  // Actions
  const {
    execute: createEnquiryAction,
    result: createResult,
    isExecuting: isCreating,
  } = useAction(createEnquiry);

  const {
    execute: updateEnquiryAction,
    result: updateResult,
    isExecuting: isUpdating,
  } = useAction(updateEnquiry);

  const { execute: fetchBranches, result: branchesResult } = useAction(getBranches);
  const { execute: fetchCourses, result: coursesResult } = useAction(getCourses);
  const { execute: fetchSources, result: sourcesResult } = useAction(getEnquirySources);
  const { execute: fetchServices, result: servicesResult } = useAction(getRequiredServices);

  const isExecuting = isCreating || isUpdating;
  const actionResult = isEditMode ? updateResult : createResult;

  // Form
  const form = useForm<EnquiryFormData>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      candidateName: enquiry?.candidateName || '',
      phone: enquiry?.phone || '',
      contact2: enquiry?.contact2 || '',
      email: enquiry?.email || '',
      address: enquiry?.address || '',
      status: enquiry?.status || EnquiryStatus.NEW,
      notes: enquiry?.notes || '',
      feedback: enquiry?.feedback || '',
      enquirySourceId: enquiry?.enquirySourceId || '',
      branchId: enquiry?.branchId || '',
      preferredCourseId: enquiry?.preferredCourseId || '',
      requiredServiceId: enquiry?.requiredServiceId || '',
    },
  });

  // Update form values when enquiry changes (for edit mode)
  useEffect(() => {
    if (enquiry && isEditMode) {
      form.reset({
        candidateName: enquiry.candidateName || '',
        phone: enquiry.phone || '',
        contact2: enquiry.contact2 || '',
        email: enquiry.email || '',
        address: enquiry.address || '',
        status: enquiry.status || EnquiryStatus.NEW,
        notes: enquiry.notes || '',
        feedback: enquiry.feedback || '',
        enquirySourceId: enquiry.enquirySourceId || '',
        branchId: enquiry.branchId || '',
        preferredCourseId: enquiry.preferredCourseId || '',
        requiredServiceId: enquiry.requiredServiceId || '',
      });
    }
  }, [enquiry, isEditMode, form]);

  // Monitor action results - only when actively processing
  useEffect(() => {
    if (!isProcessingAction) return;

    if (actionResult?.data?.success) {
      const message =
        actionResult.data.message ||
        (isEditMode ? 'Enquiry updated successfully' : 'Enquiry created successfully');
      toast.success(message);
      setOpen(false);
      form.reset();
      setIsProcessingAction(false);
      onSuccess?.();
    } else if (actionResult?.serverError) {
      toast.error(
        `Error ${isEditMode ? 'updating' : 'creating'} enquiry: ${actionResult.serverError}`
      );
      setIsProcessingAction(false);
    } else if (actionResult?.validationErrors) {
      const errorMessages = Object.entries(actionResult.validationErrors)
        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
        .join('\n');

      toast.error(`Validation errors:\n${errorMessages}`);
      setIsProcessingAction(false);
    }
  }, [actionResult, isEditMode, form, onSuccess, setOpen, isProcessingAction]);

  // Fetch dropdown data when dialog opens
  useEffect(() => {
    if (open) {
      fetchBranches({});
      fetchCourses({});
      fetchSources({});
      fetchServices({});
    }
  }, [open, fetchBranches, fetchCourses, fetchSources, fetchServices]);

  const onSubmit = async (data: EnquiryFormData) => {
    setIsProcessingAction(true);

    if (isEditMode) {
      // Update existing enquiry
      const payload = {
        id: enquiry.id,
        candidateName: data.candidateName,
        phone: data.phone,
        status: data.status || EnquiryStatus.NEW,
        enquirySourceId: data.enquirySourceId,
        branchId: data.branchId,
        contact2: data.contact2 || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        feedback: data.feedback || undefined,
        preferredCourseId: data.preferredCourseId || undefined,
        requiredServiceId: data.requiredServiceId || undefined,
      };
      await updateEnquiryAction(payload);
    } else {
      // Create new enquiry
      const payload = {
        candidateName: data.candidateName,
        phone: data.phone,
        enquirySourceId: data.enquirySourceId,
        branchId: data.branchId,
        contact2: data.contact2 || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        preferredCourseId: data.preferredCourseId || undefined,
        requiredServiceId: data.requiredServiceId || undefined,
        notes: data.notes || undefined,
      };
      await createEnquiryAction(payload);
    }
  };

  const branches = (branchesResult?.data?.data as Branch[]) || [];
  const courses = (coursesResult?.data?.data as Course[]) || [];
  const sources = (sourcesResult?.data?.data as EnquirySource[]) || [];
  const services = (servicesResult?.data?.data as RequiredService[]) || [];

  // Handle click events for custom triggers
  const handleTriggerClick = () => {
    setOpen(true);
  };

  // Clone the trigger and add click handler if it's a custom trigger
  const triggerElement = trigger ? (
    <div onClick={handleTriggerClick} className="w-full cursor-pointer">
      {trigger}
    </div>
  ) : (
    <Button
      variant={isEditMode ? 'outline' : 'default'}
      size={isEditMode ? 'sm' : 'default'}
      onClick={handleTriggerClick}
    >
      {isEditMode ? (
        <>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          New Enquiry
        </>
      )}
    </Button>
  );

  return (
    <>
      {triggerElement}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Enquiry' : 'Add New Enquiry'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the enquiry information. Fields marked with * are required.'
                : 'Create a new enquiry record. Fields marked with * are required.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Candidate Name */}
                <FormField
                  control={form.control}
                  name="candidateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter candidate name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact 2 */}
                <FormField
                  control={form.control}
                  name="contact2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter secondary contact" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status - Only show in edit mode */}
                {isEditMode && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(EnquiryStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Enquiry Source */}
                <FormField
                  control={form.control}
                  name="enquirySourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enquiry Source *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select enquiry source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sources.map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Branch */}
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferred Course */}
                <FormField
                  control={form.control}
                  name="preferredCourseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Course</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value || undefined)}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select course (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name} {course.duration && `- ${course.duration}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Required Service */}
                <FormField
                  control={form.control}
                  name="requiredServiceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Service</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value || undefined)}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select service (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Full-width fields */}
              <div className="space-y-4">
                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter full address"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Feedback - Only show in edit mode */}
                {isEditMode && (
                  <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Feedback from the candidate"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about the enquiry"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Any additional information about the enquiry that might be helpful
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isExecuting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isExecuting}>
                  {isExecuting
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                    ? 'Update Enquiry'
                    : 'Create Enquiry'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
