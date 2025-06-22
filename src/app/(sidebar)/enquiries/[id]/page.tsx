'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  User as UserIcon,
  Building,
  GraduationCap,
  MessageSquare,
  PhoneCall,
  CalendarPlus,
  ArrowLeft,
  UserPlus,
  MapPin,
  ExternalLink,
  MessageCircle,
  Star,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { getEnquiry, updateEnquiryStatus, assignEnquiry } from '@/server/actions/enquiry';
import { createFollowUp } from '@/server/actions/follow-up';
import { createCallLog } from '@/server/actions/call-log';
import { getUsers } from '@/server/actions/enquiry';
import { ENQUIRY_STATUS_OPTIONS } from '@/constants/enquiry';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { EnquiryFormDialog } from '@/components/enquiry/enquiry-form-dialog';
import { EnquiryStatus, Enquiry, FollowUp, CallLog } from '@/types/enquiry';
import { User } from '@/types/data-management';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Form schemas
const followUpSchema = z.object({
  scheduledAt: z.string().min(1, 'Date and time are required'),
  notes: z.string().max(1000).optional(),
});

const callLogSchema = z.object({
  duration: z.number().min(0).optional(),
  outcome: z.string().min(1, 'Call outcome is required').max(500),
  notes: z.string().max(1000).optional(),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;
type CallLogFormData = z.infer<typeof callLogSchema>;

export default function EnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const enquiryId = params.id as string;

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCreatingFollowUp, setIsCreatingFollowUp] = useState(false);
  const [isCreatingCallLog, setIsCreatingCallLog] = useState(false);

  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [isCallLogDialogOpen, setIsCallLogDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Forms
  const followUpForm = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
  });

  const callLogForm = useForm<CallLogFormData>({
    resolver: zodResolver(callLogSchema),
  });

  // Fetch enquiry data
  const fetchEnquiry = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getEnquiry(enquiryId);
      if (result.success) {
        setEnquiry(result.data as Enquiry);
      } else {
        toast.error(result.message || 'Failed to fetch enquiry');
      }
    } catch {
      toast.error('Failed to fetch enquiry');
    } finally {
      setIsLoading(false);
    }
  }, [enquiryId]);

  useEffect(() => {
    if (enquiryId) {
      fetchEnquiry();
    }
  }, [enquiryId, fetchEnquiry]);

  // Refresh enquiry data when page becomes visible (user returns from admissions page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && enquiryId) {
        fetchEnquiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen for focus events
    const handleFocus = () => {
      if (enquiryId) {
        fetchEnquiry();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enquiryId, fetchEnquiry]);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const result = await updateEnquiryStatus(enquiryId, newStatus as EnquiryStatus);
      if (result.success) {
        toast.success(result.message);
        fetchEnquiry(); // Refetch enquiry data
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateFollowUp = async (data: FollowUpFormData) => {
    setIsCreatingFollowUp(true);
    try {
      const result = await createFollowUp({
        enquiryId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
      });

      if (result.success) {
        toast.success(result.message);
        setIsFollowUpDialogOpen(false);
        followUpForm.reset();
        fetchEnquiry(); // Refetch enquiry data
      } else {
        toast.error(result.message || 'Failed to create follow-up');
      }
    } catch {
      toast.error('Failed to create follow-up');
    } finally {
      setIsCreatingFollowUp(false);
    }
  };

  const handleCreateCallLog = async (data: CallLogFormData) => {
    setIsCreatingCallLog(true);
    try {
      const result = await createCallLog({
        enquiryId,
        duration: data.duration,
        outcome: data.outcome,
        notes: data.notes,
      });

      if (result.success) {
        toast.success(result.message);
        setIsCallLogDialogOpen(false);
        callLogForm.reset();
        fetchEnquiry(); // Refetch enquiry data
      } else {
        toast.error(result.message || 'Failed to create call log');
      }
    } catch {
      toast.error('Failed to create call log');
    } finally {
      setIsCreatingCallLog(false);
    }
  };

  const handleAssignUser = async (userId: string) => {
    setIsAssigning(true);
    try {
      const result = await assignEnquiry(enquiryId, userId);
      if (result.success) {
        toast.success(result.message);
        setIsAssignDialogOpen(false);
        fetchEnquiry(); // Refetch enquiry data
      } else {
        toast.error(result.message || 'Failed to assign enquiry');
      }
    } catch {
      toast.error('Failed to assign enquiry');
    } finally {
      setIsAssigning(false);
    }
  };

  // Fetch users when assign dialog opens
  const fetchUsers = async () => {
    try {
      const result = await getUsers();
      if (result.success) {
        setUsers((result.data as User[]) || []);
      } else {
        toast.error(result.message || 'Failed to fetch users');
      }
    } catch {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (isAssignDialogOpen) {
      fetchUsers();
    }
  }, [isAssignDialogOpen]);

  const getStatusColor = (status: string) => {
    const statusOption = ENQUIRY_STATUS_OPTIONS.find((option) => option.value === status);
    return statusOption
      ? `bg-${statusOption.color}-100 text-${statusOption.color}-800`
      : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDaysInPipeline = (createdAt: string | Date) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!enquiry) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">{isLoading ? 'Loading...' : 'Enquiry not found'}</p>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4 md:p-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="relative z-20 flex shrink-0 items-center shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                    {enquiry.candidateName}
                  </h1>
                  <Badge className={cn('w-fit', getStatusColor(enquiry.status))}>
                    {ENQUIRY_STATUS_OPTIONS.find((opt) => opt.value === enquiry.status)?.label ||
                      enquiry.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                  Enquiry Details • Created {formatDate(enquiry.createdAt)}
                  {enquiry.status === 'ENROLLED' && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✓ Admission Completed
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="relative z-20 flex flex-wrap gap-2">
              <Link href={`tel:${enquiry.phone}`} className="relative z-30">
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Call</span>
                </Button>
              </Link>
              <Link
                href={`https://wa.me/91${enquiry.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-30"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </Button>
              </Link>
              {enquiry.email && (
                <Link href={`mailto:${enquiry.email}`} className="relative z-30">
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Background - Lower z-index */}
        <div className="absolute inset-0 z-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute right-0 top-0 z-0 -translate-y-12 translate-x-12 transform">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 opacity-20 dark:from-blue-800 dark:to-indigo-800" />
        </div>
      </div>

      {/* Enhanced Key Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 sm:text-3xl">
                  {calculateDaysInPipeline(enquiry.createdAt)}
                </p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 sm:text-sm">
                  Days in Pipeline
                </p>
              </div>
              <div className="rounded-full bg-blue-200 p-2 dark:bg-blue-800">
                <Clock className="h-4 w-4 text-blue-700 dark:text-blue-300 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-md dark:from-green-950 dark:to-green-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 sm:text-3xl">
                  {enquiry.followUps?.length || 0}
                </p>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 sm:text-sm">
                  Follow-ups
                </p>
              </div>
              <div className="rounded-full bg-green-200 p-2 dark:bg-green-800">
                <Calendar className="h-4 w-4 text-green-700 dark:text-green-300 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 sm:text-3xl">
                  {enquiry.callLogs?.length || 0}
                </p>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 sm:text-sm">
                  Call Logs
                </p>
              </div>
              <div className="rounded-full bg-purple-200 p-2 dark:bg-purple-800">
                <PhoneCall className="h-4 w-4 text-purple-700 dark:text-purple-300 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300 sm:text-xl">
                  {enquiry.lastContactDate
                    ? formatDate(enquiry.lastContactDate).split(',')[0]
                    : 'Never'}
                </p>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 sm:text-sm">
                  Last Contact
                </p>
              </div>
              <div className="rounded-full bg-orange-200 p-2 dark:bg-orange-800">
                <MessageSquare className="h-4 w-4 text-orange-700 dark:text-orange-300 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Action Buttons */}
      <Card className="border-0 bg-gray-50 dark:bg-gray-900/50">
        <CardContent className="relative p-4 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {enquiry.status !== EnquiryStatus.ENROLLED ? (
                <Link href={`/admissions?enquiryId=${enquiry.id}`} className="relative z-10 w-full">
                  <Button
                    className="relative z-10 w-full cursor-pointer"
                    onClick={() => {
                      if (enquiry.status === EnquiryStatus.ENROLLED) {
                        toast.info(
                          'This enquiry has already been enrolled. Check the admissions section for details.'
                        );
                        return;
                      }
                      toast.info('Taking you to the admissions page to complete the enrollment...');
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Take Admission
                  </Button>
                </Link>
              ) : (
                <Button className="relative z-10 w-full cursor-not-allowed" disabled>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Already Enrolled
                </Button>
              )}

              <Dialog open={isCallLogDialogOpen} onOpenChange={setIsCallLogDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative z-10 w-full">
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Log Call
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative z-10 w-full">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Schedule Follow-up
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative z-10 w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {enquiry.assignedTo ? 'Reassign' : 'Assign'}
                  </Button>
                </DialogTrigger>
              </Dialog>

              <EnquiryFormDialog mode="edit" enquiry={enquiry} onSuccess={fetchEnquiry} />

              <Select
                onValueChange={handleStatusUpdate}
                disabled={isUpdatingStatus}
                value={enquiry.status}
              >
                <SelectTrigger className="relative z-10 w-full">
                  <SelectValue>
                    {ENQUIRY_STATUS_OPTIONS.find((opt) => opt.value === enquiry.status)?.label ||
                      enquiry.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Log Dialog Content */}
      <Dialog open={isCallLogDialogOpen} onOpenChange={setIsCallLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>
              Record details about your call with {enquiry.candidateName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={callLogForm.handleSubmit(handleCreateCallLog)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 15"
                {...callLogForm.register('duration', { valueAsNumber: true })}
              />
              {callLogForm.formState.errors.duration && (
                <p className="text-sm text-red-500">
                  {callLogForm.formState.errors.duration.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcome">Call Outcome *</Label>
              <Input
                id="outcome"
                placeholder="e.g., Interested in course, will call back"
                {...callLogForm.register('outcome')}
              />
              {callLogForm.formState.errors.outcome && (
                <p className="text-sm text-red-500">
                  {callLogForm.formState.errors.outcome.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="callNotes">Notes</Label>
              <Textarea
                id="callNotes"
                placeholder="Additional notes about the call..."
                {...callLogForm.register('notes')}
              />
              {callLogForm.formState.errors.notes && (
                <p className="text-sm text-red-500">{callLogForm.formState.errors.notes.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreatingCallLog}>
                {isCreatingCallLog ? 'Saving...' : 'Save Call Log'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog Content */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>Schedule a follow-up with {enquiry.candidateName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={followUpForm.handleSubmit(handleCreateFollowUp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                {...followUpForm.register('scheduledAt')}
              />
              {followUpForm.formState.errors.scheduledAt && (
                <p className="text-sm text-red-500">
                  {followUpForm.formState.errors.scheduledAt.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpNotes">Notes</Label>
              <Textarea
                id="followUpNotes"
                placeholder="Notes for the follow-up..."
                {...followUpForm.register('notes')}
              />
              {followUpForm.formState.errors.notes && (
                <p className="text-sm text-red-500">
                  {followUpForm.formState.errors.notes.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreatingFollowUp}>
                {isCreatingFollowUp ? 'Scheduling...' : 'Schedule Follow-up'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog Content */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{enquiry.assignedTo ? 'Reassign Enquiry' : 'Assign Enquiry'}</DialogTitle>
            <DialogDescription>
              {enquiry.assignedTo
                ? `Currently assigned to ${enquiry.assignedTo.name}. Select a new user to reassign.`
                : 'Select a user to assign this enquiry to.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {users.length > 0 && (
              <div className="space-y-2">
                {users.map((user: User) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAssignUser(user.id)}
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.role && (
                        <Badge variant="secondary" className="text-xs">
                          {user.role.name}
                        </Badge>
                      )}
                    </div>
                    {enquiry.assignedTo?.id === user.id && <Badge variant="default">Current</Badge>}
                  </div>
                ))}
              </div>
            )}
            {isAssigning && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Enhanced Contact Information */}
            <Card className="overflow-hidden p-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 pt-6 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">{enquiry.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`tel:${enquiry.phone}`} className="relative z-10">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Phone className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Link
                      href={`https://wa.me/91${enquiry.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {enquiry.contact2 && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">{enquiry.contact2}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`tel:${enquiry.contact2}`} className="relative z-10">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Link
                        href={`https://wa.me/91${enquiry.contact2.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {enquiry.email && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium">{enquiry.email}</span>
                    </div>
                    <Link href={`mailto:${enquiry.email}`} className="relative z-10">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}

                {enquiry.address && (
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-1" />
                      <span className="text-sm leading-relaxed">{enquiry.address}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Enquiry Details */}
            <Card className="overflow-hidden p-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 pt-6 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                    <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  Enquiry Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid gap-4">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                        <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Source
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {enquiry.enquirySource?.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-purple-100 p-1 dark:bg-purple-900">
                        <Building className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Branch
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {enquiry.branch?.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {enquiry.preferredCourse && (
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                          <GraduationCap className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Preferred Course
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {enquiry.preferredCourse.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {enquiry.requiredService && (
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-100 p-1 dark:bg-orange-900">
                          <MessageSquare className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Required Service
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {enquiry.requiredService.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {enquiry.assignedTo && (
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-indigo-100 p-1 dark:bg-indigo-900">
                          <UserIcon className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Assigned To
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {enquiry.assignedTo.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Follow-ups */}
            {enquiry.followUps && enquiry.followUps.length > 0 && (
              <Card className="overflow-hidden p-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 pt-6 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                      <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    Follow-ups ({enquiry.followUps.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {enquiry.followUps.map((followUp: FollowUp) => (
                      <div
                        key={followUp.id}
                        className="relative rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950"
                      >
                        <div className="absolute left-0 top-0 h-full w-1 bg-green-500"></div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(followUp.scheduledAt)}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                by {followUp.createdBy.name} • {formatDate(followUp.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="w-fit">
                            {followUp.status}
                          </Badge>
                        </div>
                        {followUp.notes && (
                          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                            {followUp.notes}
                          </p>
                        )}
                        {followUp.outcome && (
                          <div className="mt-2 rounded-lg bg-white p-2 dark:bg-gray-800">
                            <p className="text-sm">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                Outcome:
                              </span>{' '}
                              {followUp.outcome}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Call Logs */}
            {enquiry.callLogs && enquiry.callLogs.length > 0 && (
              <Card className="overflow-hidden p-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 pt-6 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                      <PhoneCall className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Call Logs ({enquiry.callLogs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {enquiry.callLogs.map((callLog: CallLog) => (
                      <div
                        key={callLog.id}
                        className="relative rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950"
                      >
                        <div className="absolute left-0 top-0 h-full w-1 bg-purple-500"></div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                              <PhoneCall className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(callLog.callDate)}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                by {callLog.createdBy.name} • {formatDate(callLog.createdAt)}
                              </p>
                            </div>
                          </div>
                          {callLog.duration && (
                            <Badge variant="outline" className="w-fit">
                              {callLog.duration} min
                            </Badge>
                          )}
                        </div>
                        {callLog.outcome && (
                          <div className="mt-2 rounded-lg bg-white p-2 dark:bg-gray-800">
                            <p className="text-sm">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                Outcome:
                              </span>{' '}
                              {callLog.outcome}
                            </p>
                          </div>
                        )}
                        {callLog.notes && (
                          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                            {callLog.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(!enquiry.followUps || enquiry.followUps.length === 0) &&
              (!enquiry.callLogs || enquiry.callLogs.length === 0) && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No activity recorded yet.</p>
                  </CardContent>
                </Card>
              )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 sm:space-y-6">
          <Card className="overflow-hidden p-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 pt-6 pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                  <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                Notes & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    Enquiry Notes
                  </h4>
                  {enquiry.notes ? (
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {enquiry.notes}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
                      <MessageSquare className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-600" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        No notes available
                      </p>
                    </div>
                  )}
                </div>

                {enquiry.feedback && (
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      Feedback
                    </h4>
                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {enquiry.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
