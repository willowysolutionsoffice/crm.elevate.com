'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { IconSearch, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
} from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils';
import { User, Role } from '@prisma/client';
import { UserForm } from '@/components/user-form';
import { deleteUserAction } from '@/lib/actions/auth';

interface UsersTableProps {
  users: (User & { role: Role })[];
  roles: Role[];
}

function getRoleBadgeVariant(roleName: string) {
  switch (roleName) {
    case 'ADMIN':
      return 'destructive';
    case 'EXECUTIVE':
      return 'default';
    case 'TELECALLER':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function UsersTable({ users, roles }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const router = useRouter();

  const {
    execute: executeDelete,
    result: deleteResult,
    isExecuting: isDeleting,
  } = useAction(deleteUserAction);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.role?.name && user.role.name.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditUser(null);
    router.refresh();
  };

  // Handle delete success
  useEffect(() => {
    if (deleteResult?.data?.success) {
      setIsDeleteDialogOpen(false);
      setDeleteUser(null);
      router.refresh();
    }
  }, [deleteResult, router]);

  const confirmDelete = () => {
    if (deleteUser) {
      executeDelete({ userId: deleteUser.id });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Users</CardTitle>
        <CardDescription>
          Manage user accounts and permissions. Total users: {users.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <IconSearch className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role ? (
                          <Badge variant={getRoleBadgeVariant(user.role.name)}>
                            {user.role.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Role</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <IconDotsVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <IconEdit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-destructive"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl w-full mx-4">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {editUser && (
              <UserForm
                roles={roles}
                onSuccess={handleEditSuccess}
                initialData={{
                  name: editUser.name,
                  email: editUser.email,
                  password: '',
                  confirmPassword: '',
                  roleId: editUser.roleId || '',
                }}
                isEditing={true}
                userId={editUser.id}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for{' '}
              <strong>{deleteUser?.name}</strong> ({deleteUser?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
