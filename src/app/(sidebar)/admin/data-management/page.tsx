'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Database,
  MapPin,
  BookOpen,
  Package,
  Search,
} from 'lucide-react';
import {
  getAllRoles,
  getAllCourses,
  getAllBranches,
  getAllEnquirySources,
  createRole,
  updateRole,
  deleteRole,
  createCourse,
  updateCourse,
  deleteCourse,
  createBranch,
  updateBranch,
  deleteBranch,
  createEnquirySource,
  updateEnquirySource,
  deleteEnquirySource,
} from '@/app/actions/data-management';
import { Role, Course, Branch, EnquirySource } from '@/types/data-management';

// Validation schemas
const roleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const courseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  duration: z.string().optional(),
  totalFee: z.coerce.number().min(0, 'Total fee must be a positive number'),
  semesterFee: z.coerce.number().optional(),
  admissionFee: z.coerce.number().min(0, 'Admission fee must be a positive number'),
});

const branchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

const sourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type RoleForm = z.infer<typeof roleSchema>;
type CourseForm = z.infer<typeof courseSchema>;
type BranchForm = z.infer<typeof branchSchema>;
type SourceForm = z.infer<typeof sourceSchema>;

type EditingItem = Role | Course | Branch | EnquirySource;

export default function DataManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sources, setSources] = useState<EnquirySource[]>([]);

  const [activeTab, setActiveTab] = useState('roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forms
  const roleForm = useForm<RoleForm>({ resolver: zodResolver(roleSchema) });
  const courseForm = useForm<CourseForm>({ resolver: zodResolver(courseSchema) });
  const branchForm = useForm<BranchForm>({ resolver: zodResolver(branchSchema) });
  const sourceForm = useForm<SourceForm>({ resolver: zodResolver(sourceSchema) });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesResult, coursesResult, branchesResult, sourcesResult] = await Promise.all([
        getAllRoles(),
        getAllCourses(),
        getAllBranches(),
        getAllEnquirySources(),
      ]);

      if (rolesResult.success) setRoles(rolesResult.data as Role[]);
      if (coursesResult.success) setCourses(coursesResult.data as Course[]);
      if (branchesResult.success) setBranches(branchesResult.data as Branch[]);
      if (sourcesResult.success) setSources(sourcesResult.data as EnquirySource[]);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Role handlers
  const handleCreateRole = async (data: RoleForm) => {
    const result = await createRole(data);
    if (result.success) {
      toast.success(result.message);
      setDialogOpen(null);
      roleForm.reset();
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateRole = async (data: RoleForm) => {
    if (!editingItem) return;
    const result = await updateRole({ ...data, id: editingItem.id });
    if (result.success) {
      toast.success(result.message);
      setDialogOpen(null);
      setEditingItem(null);
      roleForm.reset();
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteRole = async (id: string) => {
    const result = await deleteRole({ id });
    if (result.success) {
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  // Course handlers
  const handleCreateCourse = async (data: CourseForm) => {
    const result = await createCourse(data);
    if (result.success) {
      toast.success(result.message);
      setDialogOpen(null);
      courseForm.reset();
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateCourse = async (data: CourseForm) => {
    if (!editingItem) return;
    const result = await updateCourse({ ...data, id: editingItem.id });
    if (result.success) {
      toast.success(result.message);
      setDialogOpen(null);
      setEditingItem(null);
      courseForm.reset();
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const result = await deleteCourse({ id });
    if (result.success) {
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  // Branch handlers
  const handleCreateBranch = async (data: BranchForm) => {
    const result = await createBranch(data);
    if (result.success) {
      toast.success(result.message);
      setDialogOpen(null);
      branchForm.reset();
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateBranch = async (data: BranchForm) => {
    if (!editingItem) return;
    const result = await updateBranch({ ...data, id: editingItem.id });
    if (result.success) {
      toast.success(result.message);
      setDialogOpen(null);
      setEditingItem(null);
      branchForm.reset();
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    const result = await deleteBranch({ id });
    if (result.success) {
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  // Source handlers
  const handleCreateSource = async (data: SourceForm) => {
    const result = await createEnquirySource(data);
    if (result.success) {
      toast.success(result.message);
      setDialogOpen(null);
      sourceForm.reset();
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateSource = async (data: SourceForm) => {
    if (!editingItem) return;
    const result = await updateEnquirySource({ ...data, id: editingItem.id });
    if (result.success) {
      toast.success(result.message);
      setDialogOpen(null);
      setEditingItem(null);
      sourceForm.reset();
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteSource = async (id: string) => {
    const result = await deleteEnquirySource({ id });
    if (result.success) {
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const openEditDialog = (type: string, item: EditingItem) => {
    setEditingItem(item);
    setDialogOpen(`edit-${type}`);

    switch (type) {
      case 'role':
        roleForm.reset({ name: item.name, description: (item as Role).description || '' });
        break;
      case 'course':
        courseForm.reset({
          name: item.name,
          description: (item as Course).description || '',
          duration: (item as Course).duration || '',
          totalFee: (item as Course).totalFee || 0,
          semesterFee: (item as Course).semesterFee || undefined,
          admissionFee: (item as Course).admissionFee || 0,
        });
        break;
      case 'branch':
        branchForm.reset({
          name: item.name,
          address: (item as Branch).address || '',
          phone: (item as Branch).phone || '',
          email: (item as Branch).email || '',
        });
        break;
      case 'source':
        sourceForm.reset({ name: item.name });
        break;
    }
  };

  const renderDataTable = (type: string, data: unknown[], columns: string[]) => {
    const filteredData = data.filter((item) =>
      (item as { name: string }).name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Dialog
            open={dialogOpen === `create-${type}`}
            onOpenChange={(open) => setDialogOpen(open ? `create-${type}` : null)}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
                <DialogDescription>Add a new {type} to the system.</DialogDescription>
              </DialogHeader>
              {renderCreateForm(type)}
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (type !== 'role' ? 2 : 1)}
                    className="text-center py-4"
                  >
                    {isLoading ? 'Loading...' : `No ${type}s found`}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const typedItem = item as Record<string, unknown> & {
                    id: string;
                    name: string;
                    isActive?: boolean;
                  };
                  return (
                    <TableRow key={typedItem.id}>
                      {columns.map((column) => (
                        <TableCell key={column}>
                          {(() => {
                            switch (column) {
                              case 'Name':
                                return <div className="font-medium">{typedItem.name}</div>;
                              case 'Description':
                                return (
                                  <div className="max-w-xs truncate">
                                    {(typedItem.description as string) || '-'}
                                  </div>
                                );
                              case 'Duration':
                                return (typedItem.duration as string) || '-';
                              case 'Total Fee':
                                return typedItem.totalFee ? `₹${typedItem.totalFee}` : '-';
                              case 'Semester Fee':
                                return typedItem.semesterFee ? `₹${typedItem.semesterFee}` : '-';
                              case 'Admission Fee':
                                return typedItem.admissionFee ? `₹${typedItem.admissionFee}` : '-';
                              case 'Address':
                                return (
                                  <div className="max-w-xs truncate">
                                    {(typedItem.address as string) || '-'}
                                  </div>
                                );
                              case 'Phone':
                                return (typedItem.phone as string) || '-';
                              case 'Email':
                                return (typedItem.email as string) || '-';
                              default:
                                return '-';
                            }
                          })()}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                openEditDialog(type, typedItem as unknown as EditingItem)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the{' '}
                                    {type}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      switch (type) {
                                        case 'role':
                                          handleDeleteRole(typedItem.id);
                                          break;
                                        case 'course':
                                          handleDeleteCourse(typedItem.id);
                                          break;
                                        case 'branch':
                                          handleDeleteBranch(typedItem.id);
                                          break;
                                        case 'source':
                                          handleDeleteSource(typedItem.id);
                                          break;
                                      }
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderCreateForm = (type: string) => {
    switch (type) {
      case 'role':
        return (
          <form onSubmit={roleForm.handleSubmit(handleCreateRole)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                {...roleForm.register('name')}
                placeholder="Enter role name (e.g., admin, telecaller)"
              />
              {roleForm.formState.errors.name && (
                <p className="text-sm text-destructive">{roleForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                {...roleForm.register('description')}
                placeholder="Enter role description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(null)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        );

      case 'course':
        return (
          <form onSubmit={courseForm.handleSubmit(handleCreateCourse)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Name</Label>
              <Input
                id="course-name"
                {...courseForm.register('name')}
                placeholder="Enter course name"
              />
              {courseForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {courseForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                {...courseForm.register('description')}
                placeholder="Enter course description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-duration">Duration</Label>
              <Input
                id="course-duration"
                {...courseForm.register('duration')}
                placeholder="e.g., 6 months"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-total-fee">
                  Total Fee (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="course-total-fee"
                  type="text"
                  {...courseForm.register('totalFee', {
                    setValueAs: (value) => parseInt(value) || 0,
                  })}
                  placeholder="Enter total course fee"
                />
                {courseForm.formState.errors.totalFee && (
                  <p className="text-sm text-destructive">
                    {courseForm.formState.errors.totalFee.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-semester-fee">Semester Fee (₹)</Label>
                <Input
                  id="course-semester-fee"
                  type="text"
                  {...courseForm.register('semesterFee', {
                    setValueAs: (value) => (value ? parseInt(value) || 0 : undefined),
                  })}
                  placeholder="Enter semester fee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-admission-fee">
                  Admission Fee (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="course-admission-fee"
                  type="text"
                  {...courseForm.register('admissionFee', {
                    setValueAs: (value) => parseInt(value) || 0,
                  })}
                  placeholder="Enter admission fee"
                />
                {courseForm.formState.errors.admissionFee && (
                  <p className="text-sm text-destructive">
                    {courseForm.formState.errors.admissionFee.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(null)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        );

      case 'branch':
        return (
          <form onSubmit={branchForm.handleSubmit(handleCreateBranch)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Name</Label>
              <Input
                id="branch-name"
                {...branchForm.register('name')}
                placeholder="Enter branch name"
              />
              {branchForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {branchForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-address">Address</Label>
              <Textarea
                id="branch-address"
                {...branchForm.register('address')}
                placeholder="Enter branch address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch-phone">Phone</Label>
                <Input
                  id="branch-phone"
                  {...branchForm.register('phone')}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-email">Email</Label>
                <Input
                  id="branch-email"
                  type="email"
                  {...branchForm.register('email')}
                  placeholder="Enter email address"
                />
                {branchForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {branchForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(null)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        );

      case 'source':
        return (
          <form onSubmit={sourceForm.handleSubmit(handleCreateSource)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">Name</Label>
              <Input
                id="source-name"
                {...sourceForm.register('name')}
                placeholder="Enter source name (e.g., Website, Instagram, Referral)"
              />
              {sourceForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {sourceForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(null)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">
          Manage system master data: roles, courses, branches, and enquiry sources
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Roles</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Courses</span>
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Branches</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Sources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                Manage user roles and permissions. Total: {roles.length}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderDataTable('role', roles, ['Name', 'Description'])}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Manage available courses and programs. Total: {courses.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderDataTable('course', courses, [
                'Name',
                'Description',
                'Duration',
                'Total Fee',
                'Semester Fee',
                'Admission Fee',
              ])}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <CardTitle>Branches</CardTitle>
              <CardDescription>
                Manage institute branches and locations. Total: {branches.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderDataTable('branch', branches, ['Name', 'Address', 'Phone', 'Email'])}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Enquiry Sources</CardTitle>
              <CardDescription>
                Manage enquiry sources like website, referral, advertisement, etc. Total:{' '}
                {sources.length}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderDataTable('source', sources, ['Name'])}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      {editingItem && (
        <>
          <Dialog
            open={dialogOpen === 'edit-role'}
            onOpenChange={(open) => !open && (setDialogOpen(null), setEditingItem(null))}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Role</DialogTitle>
                <DialogDescription>Update role information.</DialogDescription>
              </DialogHeader>
              <form onSubmit={roleForm.handleSubmit(handleUpdateRole)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role-name">Name</Label>
                  <Input
                    id="edit-role-name"
                    {...roleForm.register('name')}
                    placeholder="Enter role name"
                  />
                  {roleForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {roleForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role-description">Description</Label>
                  <Textarea
                    id="edit-role-description"
                    {...roleForm.register('description')}
                    placeholder="Enter role description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (setDialogOpen(null), setEditingItem(null))}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogOpen === 'edit-course'}
            onOpenChange={(open) => !open && (setDialogOpen(null), setEditingItem(null))}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Course</DialogTitle>
                <DialogDescription>Update course information.</DialogDescription>
              </DialogHeader>
              <form onSubmit={courseForm.handleSubmit(handleUpdateCourse)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-course-name">Name</Label>
                  <Input
                    id="edit-course-name"
                    {...courseForm.register('name')}
                    placeholder="Enter course name"
                  />
                  {courseForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {courseForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course-description">Description</Label>
                  <Textarea
                    id="edit-course-description"
                    {...courseForm.register('description')}
                    placeholder="Enter course description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course-duration">Duration</Label>
                  <Input
                    id="edit-course-duration"
                    {...courseForm.register('duration')}
                    placeholder="e.g., 6 months"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-course-total-fee">
                      Total Fee (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-course-total-fee"
                      type="text"
                      {...courseForm.register('totalFee', {
                        setValueAs: (value) => parseInt(value) || 0,
                      })}
                      placeholder="Enter total course fee"
                    />
                    {courseForm.formState.errors.totalFee && (
                      <p className="text-sm text-destructive">
                        {courseForm.formState.errors.totalFee.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-course-semester-fee">Semester Fee (₹)</Label>
                    <Input
                      id="edit-course-semester-fee"
                      type="text"
                      {...courseForm.register('semesterFee', {
                        setValueAs: (value) => (value ? parseInt(value) || 0 : undefined),
                      })}
                      placeholder="Enter semester fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-course-admission-fee">
                      Admission Fee (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-course-admission-fee"
                      type="text"
                      {...courseForm.register('admissionFee', {
                        setValueAs: (value) => parseInt(value) || 0,
                      })}
                      placeholder="Enter admission fee"
                    />
                    {courseForm.formState.errors.admissionFee && (
                      <p className="text-sm text-destructive">
                        {courseForm.formState.errors.admissionFee.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (setDialogOpen(null), setEditingItem(null))}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogOpen === 'edit-branch'}
            onOpenChange={(open) => !open && (setDialogOpen(null), setEditingItem(null))}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Branch</DialogTitle>
                <DialogDescription>Update branch information.</DialogDescription>
              </DialogHeader>
              <form onSubmit={branchForm.handleSubmit(handleUpdateBranch)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-branch-name">Name</Label>
                  <Input
                    id="edit-branch-name"
                    {...branchForm.register('name')}
                    placeholder="Enter branch name"
                  />
                  {branchForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {branchForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-branch-address">Address</Label>
                  <Textarea
                    id="edit-branch-address"
                    {...branchForm.register('address')}
                    placeholder="Enter branch address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-branch-phone">Phone</Label>
                    <Input
                      id="edit-branch-phone"
                      {...branchForm.register('phone')}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-branch-email">Email</Label>
                    <Input
                      id="edit-branch-email"
                      type="email"
                      {...branchForm.register('email')}
                      placeholder="Enter email address"
                    />
                    {branchForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {branchForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (setDialogOpen(null), setEditingItem(null))}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={dialogOpen === 'edit-source'}
            onOpenChange={(open) => !open && (setDialogOpen(null), setEditingItem(null))}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Source</DialogTitle>
                <DialogDescription>Update source information.</DialogDescription>
              </DialogHeader>
              <form onSubmit={sourceForm.handleSubmit(handleUpdateSource)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-source-name">Name</Label>
                  <Input
                    id="edit-source-name"
                    {...sourceForm.register('name')}
                    placeholder="Enter source name"
                  />
                  {sourceForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {sourceForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (setDialogOpen(null), setEditingItem(null))}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
