import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getReportsData } from '@/lib/actions/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconUsers,
  IconUserPlus,
  IconClock,
  IconPhone,
  IconTrendingUp,
  IconTrendingDown,
  IconChartPie,
  IconChartBar,
} from '@tabler/icons-react';

export default async function Reports() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  // For admin/executive, show all data. For telecallers, show their assigned data
  const isNonAdmin = session.user.role === 'telecaller';
  const reportsData = await getReportsData(isNonAdmin ? session.user.id : undefined);

  const { stats, statusDistribution, monthlyTrend } = reportsData;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your CRM performance</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Enquiries</CardDescription>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnquiries.count}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stats.totalEnquiries.trend.type === 'up' ? (
                  <IconTrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <IconTrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    stats.totalEnquiries.trend.type === 'up' ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {stats.totalEnquiries.trend.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time enquiries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>New Enquiries</CardDescription>
              <IconUserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newEnquiries.count}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stats.newEnquiries.trend.type === 'up' ? (
                  <IconTrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <IconTrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    stats.newEnquiries.trend.type === 'up' ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {stats.newEnquiries.trend.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Pending Follow-ups</CardDescription>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingFollowUps.count}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stats.pendingFollowUps.trend.type === 'up' ? (
                  <IconTrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <IconTrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    stats.pendingFollowUps.trend.type === 'up' ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {stats.pendingFollowUps.trend.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Today&apos;s Calls</CardDescription>
              <IconPhone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaysCalls.count}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stats.todaysCalls.trend.type === 'up' ? (
                  <IconTrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <IconTrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    stats.todaysCalls.trend.type === 'up' ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {stats.todaysCalls.trend.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Call logs today</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Enquiry Status Distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconChartPie className="h-5 w-5" />
                <CardTitle>Enquiry Status Distribution</CardTitle>
              </div>
              <CardDescription>Current status breakdown of all enquiries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <span className="text-sm font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Monthly Enquiry Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconChartBar className="h-5 w-5" />
                <CardTitle>Monthly Enquiry Trend</CardTitle>
              </div>
              <CardDescription>Enquiry volume over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyTrend.map((item, index) => {
                const maxCount = Math.max(...monthlyTrend.map((t) => t.count));
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 text-sm font-medium">{item.month}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gray-900 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-8 text-sm font-medium text-right">{item.count}</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
