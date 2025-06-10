'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Edit, Trash2, MoreVertical, FileText, Download } from 'lucide-react';
import {
  getAdmissions,
  getCoursesForAdmission,
  getEnquirySourcesForAdmission,
  deleteAdmission,
} from '@/app/actions/admission-actions';
import { getEnquiry } from '@/app/actions/enquiry';
import { AdmissionFormDialog } from '@/components/admission-form-dialog';
import { toast } from 'sonner';
import {
  AdmissionWithRelations,
  AdmissionStatus,
  PaymentMode,
  AdmissionStatusLabels,
  PaymentModeLabels,
} from '@/types/admission';
import { formatCurrency } from '@/lib/utils';
import { EnquirySource } from '@prisma/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Enquiry } from '@/types/enquiry';

interface SimpleCourse {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  totalFee: number | null;
  semesterFee: number | null;
  admissionFee: number | null;
}

interface AdmissionListResponse {
  admissions: AdmissionWithRelations[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function AdmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enquiryId = searchParams.get('enquiryId');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'ALL'>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [paymentModeFilter, setPaymentModeFilter] = useState<PaymentMode | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [admissions, setAdmissions] = useState<AdmissionWithRelations[]>([]);
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [enquirySources, setEnquirySources] = useState<EnquirySource[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionWithRelations | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [admissionToDelete, setAdmissionToDelete] = useState<AdmissionWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Enquiry pre-fill state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [enquiryData, setEnquiryData] = useState<Enquiry | null>(null);
  const [isLoadingEnquiry, setIsLoadingEnquiry] = useState(false);

  // Fetch enquiry data when enquiryId is present
  useEffect(() => {
    const fetchEnquiryData = async () => {
      if (!enquiryId) return;

      setIsLoadingEnquiry(true);
      try {
        const result = await getEnquiry(enquiryId);
        if (result.success) {
          setEnquiryData(result.data as Enquiry);
          // Auto-open the create dialog
          setCreateDialogOpen(true);
          // Clear the URL parameter after opening
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('enquiryId');
          router.replace(newUrl.pathname, { scroll: false });
        } else {
          toast.error(result.message || 'Failed to fetch enquiry data');
        }
      } catch (error) {
        console.error('Error fetching enquiry:', error);
        toast.error('Failed to fetch enquiry data');
      } finally {
        setIsLoadingEnquiry(false);
      }
    };

    fetchEnquiryData();
  }, [enquiryId, router]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch courses
        const coursesResult = await getCoursesForAdmission();
        console.log(coursesResult);
        if (coursesResult.data?.success) {
          setCourses(coursesResult.data.data || []);
        }

        // Fetch enquiry sources using direct prisma call
        const enquirySourcesResult = await getEnquirySourcesForAdmission();
        if (enquirySourcesResult.data?.success) {
          setEnquirySources(enquirySourcesResult.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Set empty arrays as fallback
        setCourses([]);
        setEnquirySources([]);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch admissions
  const fetchAdmissionsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: {
        page: number;
        limit: number;
        search?: string;
        status?: AdmissionStatus;
        courseId?: string;
        paymentMode?: PaymentMode;
      } = {
        page: currentPage,
        limit: 10,
      };

      if (search) filters.search = search;
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (courseFilter !== 'ALL') filters.courseId = courseFilter;
      if (paymentModeFilter !== 'ALL') filters.paymentMode = paymentModeFilter;

      const result = await getAdmissions(filters);

      if (result.data?.success) {
        const data = result.data.data as AdmissionListResponse;
        setAdmissions(data.admissions || []);
        setPagination({
          page: data.currentPage,
          limit: 10,
          total: data.totalCount,
          pages: data.totalPages,
        });
      } else {
        toast.error(result.serverError || 'Failed to fetch admissions');
      }
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast.error('Failed to fetch admissions');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, statusFilter, courseFilter, paymentModeFilter]);

  // Fetch admissions on component mount and when filters change
  useEffect(() => {
    if (courses.length > 0) {
      // Only fetch when courses are loaded
      fetchAdmissionsData();
    }
  }, [fetchAdmissionsData, courses.length]);

  // Refresh function to be called after successful admission creation
  const refreshAdmissions = useCallback(() => {
    fetchAdmissionsData();
  }, [fetchAdmissionsData]);

  // Action handlers for dropdown menu
  const handleViewAdmission = (admissionId: string) => {
    router.push(`/admissions/${admissionId}`);
  };

  const handleEditAdmission = (admission: AdmissionWithRelations) => {
    setSelectedAdmission(admission);
    setEditDialogOpen(true);
  };

  const handleGenerateReceipt = async (admissionId: string) => {
    try {
      toast.info('Generating receipt...');

      // Open receipt PDF in new tab
      const receiptUrl = `/api/admissions/${admissionId}/receipt`;
      window.open(receiptUrl, '_blank');

      toast.success('Receipt opened in new tab!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  const handleDeleteAdmission = (admission: AdmissionWithRelations) => {
    setAdmissionToDelete(admission);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!admissionToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteAdmission({ id: admissionToDelete.id });

      if (result.data?.success) {
        toast.success(result.data.message || 'Admission deleted successfully');
        refreshAdmissions();
        setDeleteDialogOpen(false);
        setAdmissionToDelete(null);
      } else {
        toast.error(result.serverError || 'Failed to delete admission');
      }
    } catch (error) {
      console.error('Error deleting admission:', error);
      toast.error('Failed to delete admission');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: AdmissionStatus) => {
    switch (status) {
      case AdmissionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case AdmissionStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case AdmissionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case AdmissionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCourseFilter('ALL');
    setPaymentModeFilter('ALL');
    setCurrentPage(1);
  };

  // Handle successful admission creation from enquiry
  const handleCreateSuccess = () => {
    refreshAdmissions();
    setCreateDialogOpen(false);
    if (enquiryData) {
      toast.success(
        `Admission created successfully for ${enquiryData.candidateName}! Enquiry status updated to Enrolled.`
      );
    }
    setEnquiryData(null);
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admissions</h1>
          <p className="text-gray-600">
            Manage and track all admissions
            {enquiryData && (
              <span className="ml-2 text-blue-600">
                • Creating admission for {enquiryData.candidateName}
              </span>
            )}
          </p>
        </div>
        <AdmissionFormDialog
          courses={courses}
          enquirySources={enquirySources}
          onSuccess={refreshAdmissions}
        />
      </div>

      {/* Loading indicator for enquiry */}
      {isLoadingEnquiry && (
        <Card>
          <CardContent className="p-6 flex items-center justify-center space-x-2">
            <span>Loading enquiry data...</span>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter admissions by status, course, payment mode or search by name, mobile, admission
            number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, admission number..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as AdmissionStatus | 'ALL');
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {Object.values(AdmissionStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {AdmissionStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={courseFilter}
                onValueChange={(value) => {
                  setCourseFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={paymentModeFilter}
                onValueChange={(value) => {
                  setPaymentModeFilter(value as PaymentMode | 'ALL');
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Payment Modes</SelectItem>
                  {Object.values(PaymentMode).map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {PaymentModeLabels[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Admissions</CardTitle>
          <CardDescription>
            A list of all admissions with their current status and payment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Fee</TableHead>
                    <TableHead>Remaining Balance</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground h-64">
                        No admissions found. Create your first admission to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    admissions.map((admission) => (
                      <TableRow key={admission.id}>
                        <TableCell className="font-medium">{admission.admissionNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{admission.candidateName}</div>
                            {admission.email && (
                              <div className="text-sm text-muted-foreground">{admission.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{admission.mobileNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{admission.course.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(admission.course.totalFee || 0)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(admission.status)}>
                            {AdmissionStatusLabels[admission.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(admission.courseTotalFee)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              admission.remainingBalance > 0
                                ? 'text-orange-600 font-medium'
                                : 'text-green-600'
                            }
                          >
                            {formatCurrency(admission.remainingBalance)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(admission.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewAdmission(admission.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAdmission(admission)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Admission
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGenerateReceipt(admission.id)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Receipt
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteAdmission(admission)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Admission
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                      disabled={currentPage >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog for Enquiry Pre-fill */}
      {enquiryData && (
        <AdmissionFormDialog
          mode="create"
          courses={courses}
          enquirySources={enquirySources}
          enquiryData={enquiryData}
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              setEnquiryData(null);
            }
          }}
          onSuccess={handleCreateSuccess}
          trigger={null}
        />
      )}

      {/* Edit Dialog */}
      {selectedAdmission && (
        <AdmissionFormDialog
          mode="edit"
          admission={selectedAdmission}
          courses={courses}
          enquirySources={enquirySources}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setSelectedAdmission(null);
            }
          }}
          onSuccess={() => {
            refreshAdmissions();
            setEditDialogOpen(false);
            setSelectedAdmission(null);
          }}
          trigger={null}
        />
      )}

      {/* Delete Dialog */}
      {deleteDialogOpen && admissionToDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this admission?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the admission record for:{' '}
                <span className="font-bold">{admissionToDelete.candidateName}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  'Delete Admission'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
