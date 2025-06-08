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
} from 'lucide-react';
import { getEnquiry, updateEnquiryStatus, assignEnquiry } from '@/app/actions/enquiry';
import { createFollowUp } from '@/app/actions/follow-up';
import { createCallLog } from '@/app/actions/call-log';
import { getUsers } from '@/app/actions/enquiry';
import { ENQUIRY_STATUS_OPTIONS } from '@/constants/enquiry';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { EnquiryFormDialog } from '@/components/enquiry/enquiry-form-dialog';
import { EnquiryStatus, Enquiry, FollowUp, CallLog } from '@/types/enquiry';
import { User } from '@/types/data-management';

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
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{enquiry.candidateName}</h1>
            <p className="text-gray-600">Enquiry Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(enquiry.status)}>
            {ENQUIRY_STATUS_OPTIONS.find((opt) => opt.value === enquiry.status)?.label ||
              enquiry.status}
          </Badge>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{calculateDaysInPipeline(enquiry.createdAt)}</p>
                <p className="text-xs text-muted-foreground">Days in Pipeline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{enquiry.followUps?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Follow-ups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{enquiry.callLogs?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Call Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {enquiry.lastContactDate
                    ? formatDate(enquiry.lastContactDate).split(',')[0]
                    : 'Never'}
                </p>
                <p className="text-xs text-muted-foreground">Last Contact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <Dialog open={isCallLogDialogOpen} onOpenChange={setIsCallLogDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PhoneCall className="mr-2 h-4 w-4" />
              Log Call
            </Button>
          </DialogTrigger>
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
                  <p className="text-sm text-red-500">
                    {callLogForm.formState.errors.notes.message}
                  </p>
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

        <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Schedule Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Follow-up</DialogTitle>
              <DialogDescription>
                Schedule a follow-up with {enquiry.candidateName}
              </DialogDescription>
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

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              {enquiry.assignedTo ? 'Reassign' : 'Assign'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {enquiry.assignedTo ? 'Reassign Enquiry' : 'Assign Enquiry'}
              </DialogTitle>
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
                      {enquiry.assignedTo?.id === user.id && (
                        <Badge variant="default">Current</Badge>
                      )}
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

        <EnquiryFormDialog mode="edit" enquiry={enquiry} onSuccess={fetchEnquiry} />

        <Select
          onValueChange={handleStatusUpdate}
          disabled={isUpdatingStatus}
          value={enquiry.status}
        >
          <SelectTrigger className="w-48">
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{enquiry.phone}</span>
                </div>
                {enquiry.contact2 && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{enquiry.contact2}</span>
                  </div>
                )}
                {enquiry.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{enquiry.email}</span>
                  </div>
                )}
                {enquiry.address && (
                  <div className="flex items-start space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{enquiry.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enquiry Details */}
            <Card>
              <CardHeader>
                <CardTitle>Enquiry Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Source:</strong> {enquiry.enquirySource?.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Branch:</strong> {enquiry.branch?.name}
                  </span>
                </div>
                {enquiry.preferredCourse && (
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>Course:</strong> {enquiry.preferredCourse.name}
                    </span>
                  </div>
                )}
                {enquiry.requiredService && (
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>Service:</strong> {enquiry.requiredService.name}
                    </span>
                  </div>
                )}
                {enquiry.assignedTo && (
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>Assigned To:</strong> {enquiry.assignedTo.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-4">
            {/* Follow-ups */}
            {enquiry.followUps && enquiry.followUps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enquiry.followUps.map((followUp: FollowUp) => (
                      <div key={followUp.id} className="border-l-2 border-blue-500 pl-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{formatDate(followUp.scheduledAt)}</p>
                          <Badge variant="secondary">{followUp.status}</Badge>
                        </div>
                        {followUp.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{followUp.notes}</p>
                        )}
                        {followUp.outcome && (
                          <p className="text-sm mt-1">
                            <strong>Outcome:</strong> {followUp.outcome}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          by {followUp.createdBy.name} • {formatDate(followUp.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Call Logs */}
            {enquiry.callLogs && enquiry.callLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Call Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enquiry.callLogs.map((callLog: CallLog) => (
                      <div key={callLog.id} className="border-l-2 border-green-500 pl-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{formatDate(callLog.callDate)}</p>
                          {callLog.duration && (
                            <span className="text-sm text-muted-foreground">
                              {callLog.duration} min
                            </span>
                          )}
                        </div>
                        {callLog.outcome && (
                          <p className="text-sm mt-1">
                            <strong>Outcome:</strong> {callLog.outcome}
                          </p>
                        )}
                        {callLog.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{callLog.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          by {callLog.createdBy.name} • {formatDate(callLog.createdAt)}
                        </p>
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

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {enquiry.notes ? (
                <p className="text-sm">{enquiry.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No notes available.</p>
              )}
              {enquiry.feedback && (
                <div className="mt-4">
                  <h4 className="font-medium">Feedback:</h4>
                  <p className="text-sm text-muted-foreground mt-1">{enquiry.feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
