import React from 'react';
import { Users, UserCheck, DollarSign, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReportSkeleton } from './ReportSkeleton';
import { formatNairaCurrency } from '@/lib/utils';

interface CustomersReportProps {
  data?: CustomersReportData;
  loading: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export const CustomersReport: React.FC<CustomersReportProps> = ({
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
            {error.message || 'An error occurred while loading the customers report.'}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Customers"
          value={data.summary.totalCustomers}
          icon={Users}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Active Customers"
          value={data.summary.activeCustomers}
          icon={UserCheck}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          title="Total Revenue"
          value={formatNairaCurrency(parseFloat(data.summary.totalRevenue))}
          icon={DollarSign}
          bgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Distribution Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Type */}
        {Object.keys(data.distribution.byType).length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.distribution.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{type}</Badge>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* By Country */}
        {Object.keys(data.distribution.byCountry).length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Distribution by Country
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.distribution.byCountry).map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg">
                    <span className="font-medium text-gray-700">{country}</span>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Customers */}
      {data.topCustomers && data.topCustomers.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    {data.topCustomers.some(c => c.email) && (
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    )}
                    {data.topCustomers.some(c => c.phone) && (
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topCustomers.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{customer.customerName}</td>
                      {data.topCustomers.some(c => c.email) && (
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.email || '-'}</td>
                      )}
                      {data.topCustomers.some(c => c.phone) && (
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.phone || '-'}</td>
                      )}
                      <td className="py-3 px-4 text-sm font-medium text-emerald-600">
                        {formatNairaCurrency(parseFloat(customer.totalSpent))}
                      </td>
                      <td className="py-3 px-4 text-sm">{customer.invoiceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
