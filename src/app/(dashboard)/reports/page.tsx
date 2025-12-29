'use client';

import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DateFilterBar } from '@/components/reports/DateFilterBar';
import { ProductionReport } from '@/components/reports/ProductionReport';
import { SalesReport } from '@/components/reports/SalesReport';
import { InventoryReport } from '@/components/reports/InventoryReport';
import { MaterialsReport } from '@/components/reports/MaterialsReport';
import { CustomersReport } from '@/components/reports/CustomersReport';
import { ProductionOrdersReport } from '@/components/reports/ProductionOrdersReport';
import { StaffReport } from '@/components/reports/StaffReport';
import { BusinessReport } from '@/components/reports/BusinessReport';
import {
  useProductionReport,
  useSalesReport,
  useInventoryReport,
  useMaterialsReport,
  useCustomersReport,
  useProductionOrdersReport,
  useStaffReport,
  useBusinessReport
} from '@/hooks/useReports';
import { getDateRangeForPreset, type DatePreset } from '@/utils/datePresets';
import { exportReportToExcel } from '@/utils/reportExport';
import { toast } from 'sonner';

type ReportTab =
  | 'production'
  | 'sales'
  | 'inventory'
  | 'materials'
  | 'customers'
  | 'production-orders'
  | 'staff'
  | 'business';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('production');
  const [activePreset, setActivePreset] = useState<DatePreset>('this-month');

  const dateRange = useMemo(() => getDateRangeForPreset(activePreset), [activePreset]);

  // Fetch all reports with date params
  const productionQuery = useProductionReport(dateRange);
  const salesQuery = useSalesReport(dateRange);
  const inventoryQuery = useInventoryReport(dateRange);
  const materialsQuery = useMaterialsReport(dateRange);
  const customersQuery = useCustomersReport(dateRange);
  const productionOrdersQuery = useProductionOrdersReport(dateRange);
  const staffQuery = useStaffReport(dateRange);
  const businessQuery = useBusinessReport(dateRange);

  const handleDateRangeChange = (startDate: string, endDate: string, preset: string) => {
    setActivePreset(preset as DatePreset);
  };

  const handleExport = () => {
    try {
      let data: ProductionReportData | SalesReportData | InventoryReportData | MaterialsReportData | CustomersReportData | ProductionOrdersReportData | StaffReportData | BusinessReportData | undefined;
      let reportType: string;

      switch (activeTab) {
        case 'production':
          data = productionQuery.data;
          reportType = 'production';
          break;
        case 'sales':
          data = salesQuery.data;
          reportType = 'sales';
          break;
        case 'inventory':
          data = inventoryQuery.data;
          reportType = 'inventory';
          break;
        case 'materials':
          data = materialsQuery.data;
          reportType = 'materials';
          break;
        case 'customers':
          data = customersQuery.data;
          reportType = 'customers';
          break;
        case 'production-orders':
          data = productionOrdersQuery.data;
          reportType = 'production-orders';
          break;
        case 'staff':
          data = staffQuery.data;
          reportType = 'staff';
          break;
        case 'business':
          data = businessQuery.data;
          reportType = 'business';
          break;
        default:
          toast.error('Invalid report type');
          return;
      }

      if (!data) {
        toast.error('No data available to export');
        return;
      }

      exportReportToExcel(data, reportType, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        label: dateRange.label
      });

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar
        onDateRangeChange={handleDateRangeChange}
        activePreset={activePreset}
      />

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportTab)}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2 h-auto">
          <TabsTrigger value="production" className="text-xs sm:text-sm">
            Production
          </TabsTrigger>
          <TabsTrigger value="sales" className="text-xs sm:text-sm">
            Sales
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs sm:text-sm">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-xs sm:text-sm">
            Materials
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-xs sm:text-sm">
            Customers
          </TabsTrigger>
          <TabsTrigger value="production-orders" className="text-xs sm:text-sm">
            Orders
          </TabsTrigger>
          <TabsTrigger value="staff" className="text-xs sm:text-sm">
            Staff
          </TabsTrigger>
          <TabsTrigger value="business" className="text-xs sm:text-sm">
            Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="mt-6">
          <ProductionReport
            data={productionQuery.data}
            loading={productionQuery.isLoading}
            error={productionQuery.error}
            refetch={productionQuery.refetch}
          />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <SalesReport
            data={salesQuery.data}
            loading={salesQuery.isLoading}
            error={salesQuery.error}
            refetch={salesQuery.refetch}
          />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <InventoryReport
            data={inventoryQuery.data}
            loading={inventoryQuery.isLoading}
            error={inventoryQuery.error}
            refetch={inventoryQuery.refetch}
          />
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <MaterialsReport
            data={materialsQuery.data}
            loading={materialsQuery.isLoading}
            error={materialsQuery.error}
            refetch={materialsQuery.refetch}
          />
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomersReport
            data={customersQuery.data}
            loading={customersQuery.isLoading}
            error={customersQuery.error}
            refetch={customersQuery.refetch}
          />
        </TabsContent>

        <TabsContent value="production-orders" className="mt-6">
          <ProductionOrdersReport
            data={productionOrdersQuery.data}
            loading={productionOrdersQuery.isLoading}
            error={productionOrdersQuery.error}
            refetch={productionOrdersQuery.refetch}
          />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffReport
            data={staffQuery.data}
            loading={staffQuery.isLoading}
            error={staffQuery.error}
            refetch={staffQuery.refetch}
          />
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          <BusinessReport
            data={businessQuery.data}
            loading={businessQuery.isLoading}
            error={businessQuery.error}
            refetch={businessQuery.refetch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
