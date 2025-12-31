import React from 'react';
import { DollarSign, FileText, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReportSkeleton } from './ReportSkeleton';
import { formatNairaCurrency } from '@/lib/utils';

interface SalesReportProps {
  data?: SalesReportData;
  loading: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export const SalesReport: React.FC<SalesReportProps> = ({
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
            {error.message || 'An error occurred while loading the sales report.'}
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
          title="Total Revenue"
          value={formatNairaCurrency(data.summary.totalRevenue)}
          icon={DollarSign}
          bgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Total Invoices"
          value={data.summary.totalInvoices}
          icon={FileText}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Avg Order Value"
          value={formatNairaCurrency(data.summary.averageOrderValue)}
          icon={TrendingUp}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Revenue by Status */}
      {Object.keys(data.revenueByStatus).length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Revenue by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.revenueByStatus).map(([status, revenue]) => (
                <div key={status} className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-gray-600 uppercase mb-1">{status}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNairaCurrency(revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topCustomers.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{customer.customerName}</td>
                      <td className="py-3 px-4 text-sm font-medium text-emerald-600">
                        {formatNairaCurrency(customer.totalSpent)}
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

      {/* Sales Trend */}
      {data.salesTrend && data.salesTrend.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Period</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.salesTrend.map((trend, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{trend.period}</td>
                      <td className="py-3 px-4 text-sm font-medium text-emerald-600">
                        {formatNairaCurrency(trend.revenue)}
                      </td>
                      <td className="py-3 px-4 text-sm">{trend.invoiceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {data.topCustomers.length === 0 && data.salesTrend.length === 0 && Object.keys(data.revenueByStatus).length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No detailed data available</p>
            <p className="text-sm text-gray-400">Sales activity will appear here once invoices are created</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
