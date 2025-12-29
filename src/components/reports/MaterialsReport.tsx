import React from 'react';
import { Layers, Plus, Minus, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReportSkeleton } from './ReportSkeleton';

interface MaterialsReportProps {
  data?: MaterialsReportData;
  loading: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export const MaterialsReport: React.FC<MaterialsReportProps> = ({
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
            {error.message || 'An error occurred while loading the materials report.'}
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
          title="Total Materials"
          value={data.summary.totalMaterials}
          icon={Layers}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Total Additions"
          value={data.summary.totalAdditions}
          icon={Plus}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          title="Total Removals"
          value={data.summary.totalRemovals}
          icon={Minus}
          bgColor="bg-red-50"
          iconColor="text-red-600"
        />
        <MetricCard
          title="Low Stock Count"
          value={data.summary.lowStockCount}
          icon={AlertTriangle}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Low Stock Items */}
      {data.lowStockItems && data.lowStockItems.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.lowStockItems.map((item) => (
                <div key={item.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <Badge variant="destructive" className="text-xs">{item.quantity}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">Code: {item.code}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Used Materials */}
      {data.topUsedMaterials && data.topUsedMaterials.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Top Used Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Material Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topUsedMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{material.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{material.code}</td>
                      <td className="py-3 px-4 text-sm font-medium text-blue-600">{material.totalUsed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Material Additions */}
      {data.materialAdditions && data.materialAdditions.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Material Additions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Material Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.materialAdditions.map((addition) => (
                    <tr key={addition.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{addition.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{addition.code}</td>
                      <td className="py-3 px-4 text-sm font-medium text-green-600">{addition.quantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{addition.date}</td>
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
