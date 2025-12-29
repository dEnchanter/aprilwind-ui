import React from 'react';
import { Package, TrendingUp, CheckCircle, XCircle, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReportSkeleton } from './ReportSkeleton';

interface InventoryReportProps {
  data?: InventoryReportData;
  loading: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export const InventoryReport: React.FC<InventoryReportProps> = ({
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
            {error.message || 'An error occurred while loading the inventory report.'}
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
          title="Total Products"
          value={data.summary.totalProducts}
          icon={Package}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Total Stock"
          value={data.summary.totalStock}
          icon={Package}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Available Stock"
          value={data.summary.availableStock}
          icon={CheckCircle}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricCard
          title="Sold Stock"
          value={data.summary.soldStock}
          icon={XCircle}
          bgColor="bg-gray-50"
          iconColor="text-gray-600"
        />
        <MetricCard
          title="Turnover Rate"
          value={data.summary.turnoverRate}
          icon={TrendingUp}
          bgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Products Breakdown */}
      {data.byProduct && data.byProduct.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Products Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Available</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sold</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sizes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.byProduct.map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{product.productName}</td>
                      <td className="py-3 px-4 text-sm">{product.total}</td>
                      <td className="py-3 px-4 text-sm text-green-600">{product.available}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{product.sold}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(product.sizes).map(([size, qty]) => (
                            <Badge key={size} variant="outline" className="text-xs">
                              {size}: {qty}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts */}
      {data.alerts?.lowStock && data.alerts.lowStock.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.lowStock.map((item, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>Total: {item.total}</span>
                        <span className="text-green-600">Available: {item.available}</span>
                        <span className="text-gray-500">Sold: {item.sold}</span>
                      </div>
                      {Object.keys(item.sizes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(item.sizes).map(([size, qty]) => (
                            <Badge key={size} variant="outline" className="text-xs">
                              {size}: {qty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
