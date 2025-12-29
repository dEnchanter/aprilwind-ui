import React from 'react';
import { Users, UserCheck, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReportSkeleton } from './ReportSkeleton';

interface StaffReportProps {
  data?: StaffReportData;
  loading: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export const StaffReport: React.FC<StaffReportProps> = ({
  data,
  loading,
  error,
  refetch
}) => {
  if (loading) return <ReportSkeleton />;

  if (error) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load report</h3>
          <p className="text-sm text-gray-600 mb-4">
            {error.message || 'An error occurred while loading the staff report.'}
          </p>
          {refetch && (
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data) return <div className="text-center text-gray-500 py-8">No data available</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <MetricCard
          title="Total Staff"
          value={data.summary.totalStaff}
          icon={Users}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Active Staff"
          value={data.summary.activeStaff}
          icon={UserCheck}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Staff by Role */}
      {Object.keys(data.summary.byRole).length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Staff Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data.summary.byRole).map(([role, count]) => (
                <div key={role} className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="capitalize">{role}</Badge>
                    <span className="text-2xl font-bold text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Staff */}
      {data.topStaff && data.topStaff.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Top Performing Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Staff Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Activities</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Production</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Material</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topStaff.map((staff) => (
                    <tr key={staff.staffId} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{staff.staffName}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant="outline">{staff.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-blue-600">{staff.totalActivities}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.productionActivity}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.invoiceActivity}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.materialActivity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Staff */}
      {data.allStaff && data.allStaff.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>All Staff Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Staff Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Activities</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Production</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Material</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.allStaff.map((staff) => {
                    const isActive = staff.totalActivities > 0;
                    return (
                      <tr key={staff.staffId} className={`hover:bg-gray-50 ${!isActive && 'opacity-60'}`}>
                        <td className="py-3 px-4 text-sm font-medium">{staff.staffName}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline">{staff.role}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-blue-600">{staff.totalActivities}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{staff.productionActivity}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{staff.invoiceActivity}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{staff.materialActivity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
