import React from 'react';
import { Factory, Activity, CheckCircle, Clock, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReportSkeleton } from './ReportSkeleton';

interface ProductionReportProps {
  data?: ProductionReportData;
  loading: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export const ProductionReport: React.FC<ProductionReportProps> = ({
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
            {error.message || 'An error occurred while loading the production report.'}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Productions"
          value={data.summary.totalProductions}
          icon={Factory}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Completed"
          value={data.summary.completed}
          icon={CheckCircle}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          title="In Progress"
          value={data.summary.inProgress}
          icon={Activity}
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <MetricCard
          title="Awaiting QA"
          value={data.summary.awaitingQA}
          icon={Clock}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="Rejected"
          value={data.summary.rejected}
          icon={XCircle}
          bgColor="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <span className="text-lg font-bold text-blue-600">{data.summary.completionRate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Average Production Time</span>
                <span className="text-lg font-bold text-purple-600">{data.performance.averageProductionTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* By Stage */}
        {Object.keys(data.byStage).length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Production by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.byStage).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">{stage}</span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tailor Performance */}
      {data.performance.tailorPerformance && data.performance.tailorPerformance.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Tailor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tailor ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Assigned</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Completed</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">In Progress</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.performance.tailorPerformance.map((tailor) => {
                    const completionRate = tailor.total > 0
                      ? ((tailor.completed / tailor.total) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <tr key={tailor.tailorId} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">#{tailor.tailorId}</td>
                        <td className="py-3 px-4 text-sm">{tailor.total}</td>
                        <td className="py-3 px-4 text-sm font-medium text-green-600">{tailor.completed}</td>
                        <td className="py-3 px-4 text-sm font-medium text-orange-600">{tailor.inProgress}</td>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">{completionRate}%</td>
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
