import { getAllUsers, getAllRoles } from '@/lib/actions/auth';
import { UsersTable } from '@/components/users-table';
import { AddUserDialog } from '@/components/add-user-dialog';
import { Role, User } from '@prisma/client';

export default async function UsersPage() {
  const [users, roles] = await Promise.all([
    getAllUsers() as Promise<(User & { role: Role })[]>,
    getAllRoles() as Promise<Role[]>,
  ]);

  console.log(users);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <AddUserDialog roles={roles} />
      </div>

      <UsersTable users={users} roles={roles} />
    </div>
  );
}
