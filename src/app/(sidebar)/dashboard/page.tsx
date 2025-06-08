import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SectionCards } from '@/components/section-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* User welcome section */}
          <div className="mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back, {session.user.name}!</CardTitle>
                <CardDescription>
                  Role: {session.user.role || 'No role assigned'} • Last login:{' '}
                  {new Date(session.session.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {session.user.role === 'admin' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Admin Access:</strong> You have full access to all CRM features
                      including user management and system settings.
                    </p>
                  </div>
                )}

                {session.user.role === 'executive' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Executive Access:</strong> You have access to management features and
                      advanced reporting.
                    </p>
                  </div>
                )}

                {session.user.role === 'telecaller' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Telecaller Access:</strong> You have access to calling features and
                      lead management.
                    </p>
                  </div>
                )}

                {!session.user.role && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>No Role Assigned:</strong> Please contact your administrator to assign
                      a role.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <SectionCards />
        </div>
      </div>
    </div>
  );
}
