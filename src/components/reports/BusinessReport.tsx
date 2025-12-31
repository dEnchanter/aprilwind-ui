import React from 'react';
import { TrendingUp, Factory, DollarSign, Package, Layers, Users, FileText, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportSkeleton } from './ReportSkeleton';
import { formatNairaCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BusinessReportProps {
  data?: BusinessReportData;
  loading: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export const BusinessReport: React.FC<BusinessReportProps> = ({
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
            {error.message || 'An error occurred while loading the business report.'}
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
      {/* Production Overview */}
      {data.production && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-blue-600" />
              Production Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Productions</p>
                <p className="text-2xl font-bold text-gray-900">{data.production.totalProductions}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{data.production.completed}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{data.production.inProgress}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Awaiting QA</p>
                <p className="text-2xl font-bold text-gray-900">{data.production.awaitingQA}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{data.production.completionRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Overview */}
      {data.sales && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNairaCurrency(data.sales.totalRevenue)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{data.sales.totalInvoices}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNairaCurrency(data.sales.averageOrderValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory & Materials Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inventory */}
        {data.inventory && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Inventory Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Products</span>
                  <span className="text-lg font-bold text-gray-900">{data.inventory.totalProducts}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Stock</span>
                  <span className="text-lg font-bold text-gray-900">{data.inventory.totalStock}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Available Stock</span>
                  <span className="text-lg font-bold text-gray-900">{data.inventory.availableStock}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Turnover Rate</span>
                  <span className="text-lg font-bold text-gray-900">{data.inventory.turnoverRate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Materials */}
        {data.materials && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-600" />
                Materials Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Materials</span>
                  <span className="text-lg font-bold text-gray-900">{data.materials.totalMaterials}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Additions</span>
                  <span className="text-lg font-bold text-gray-900">{data.materials.totalAdditions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Removals</span>
                  <span className="text-lg font-bold text-gray-900">{data.materials.totalRemovals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Low Stock Count</span>
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {data.materials.lowStockCount}
                    {data.materials.lowStockCount > 0 && (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customers & Staff Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customers */}
        {data.customers && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Customers Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Customers</span>
                  <span className="text-lg font-bold text-gray-900">{data.customers.totalCustomers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Active Customers</span>
                  <span className="text-lg font-bold text-gray-900">{data.customers.activeCustomers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatNairaCurrency(data.customers.totalRevenue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staff */}
        {data.staff && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Staff Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Staff</span>
                  <span className="text-lg font-bold text-gray-900">{data.staff.totalStaff}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Active Staff</span>
                  <span className="text-lg font-bold text-gray-900">{data.staff.activeStaff}</span>
                </div>
                {data.staff.byRole && Object.keys(data.staff.byRole).length > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-2">Staff by Role</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(data.staff.byRole).slice(0, 5).map(([role, count]) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Production Orders */}
      {data.productionOrders && data.productionOrders.totalOrders > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Production Orders Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{data.productionOrders.totalOrders}</p>
              </div>
              {data.productionOrders.byStatus && Object.keys(data.productionOrders.byStatus).length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-2">By Status</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(data.productionOrders.byStatus).map(([status, count]) => (
                      <Badge key={status} variant="outline" className="text-xs capitalize">
                        {status}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
