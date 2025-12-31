import React from 'react';
import { FileText, DollarSign, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReportSkeleton } from './ReportSkeleton';
import { formatNairaCurrency } from '@/lib/utils';

interface ProductionOrdersReportProps {
  data?: ProductionOrdersReportData;
  loading: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export const ProductionOrdersReport: React.FC<ProductionOrdersReportProps> = ({
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
            {error.message || 'An error occurred while loading the production orders report.'}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={data.summary.totalOrders}
          icon={FileText}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Completed Revenue"
          value={formatNairaCurrency(data.revenue.completed)}
          icon={DollarSign}
          bgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Pending Revenue"
          value={formatNairaCurrency(data.revenue.pending)}
          icon={Clock}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="Avg Processing Time"
          value={data.performance.averageProcessingTime}
          icon={TrendingUp}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Orders by Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Status */}
        {Object.keys(data.summary.byStatus).length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.summary.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{status}</Badge>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* By Priority */}
        {Object.keys(data.summary.byPriority).length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Orders by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.summary.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{priority}</Badge>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delivery Performance */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Delivery Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-1">Total Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{data.performance.deliveryPerformance.totalDelivered}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-1">On Time</p>
              <p className="text-2xl font-bold text-green-600">{data.performance.deliveryPerformance.onTime}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-1">Late</p>
              <p className="text-2xl font-bold text-red-600">{data.performance.deliveryPerformance.late}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-1">On-Time Rate</p>
              <p className="text-2xl font-bold text-purple-600">{data.performance.deliveryPerformance.onTimeRate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
