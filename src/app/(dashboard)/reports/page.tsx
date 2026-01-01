'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { DateFilterBar } from '@/components/reports/DateFilterBar';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
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

type ReportTab =
  | 'production'
  | 'sales'
  | 'inventory'
  | 'materials'
  | 'customers'
  | 'production-orders'
  | 'staff'
  | 'business';

// Tab configuration with permissions
const REPORT_TABS = [
  {
    value: 'production' as const,
    label: 'Production',
    permission: 'reports:production',
  },
  {
    value: 'sales' as const,
    label: 'Sales',
    permission: 'reports:sales',
  },
  {
    value: 'inventory' as const,
    label: 'Inventory',
    permission: 'reports:inventory',
  },
  {
    value: 'materials' as const,
    label: 'Materials',
    permission: 'reports:materials',
  },
  {
    value: 'customers' as const,
    label: 'Customers',
    permission: 'reports:customers',
  },
  {
    value: 'production-orders' as const,
    label: 'Orders',
    permission: 'reports:production-orders',
  },
  {
    value: 'staff' as const,
    label: 'Staff',
    permission: 'reports:staff-performance',
  },
  {
    value: 'business' as const,
    label: 'Business',
    permission: 'reports:business',
  },
] as const;

const ReportsPage = () => {
  const { can } = usePermissionCheck();

  // Filter tabs based on permissions
  const visibleTabs = useMemo(
    () => REPORT_TABS.filter(tab => can(tab.permission)),
    [can]
  );

  const [activeTab, setActiveTab] = useState<ReportTab>(visibleTabs[0]?.value || 'production');

  // Update active tab if current tab becomes invisible
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find(t => t.value === activeTab)) {
      setActiveTab(visibleTabs[0]?.value);
    }
  }, [visibleTabs, activeTab]);
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

  // Show access restricted message if no visible tabs
  if (visibleTabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-600">
            You do not have permission to view any reports on this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar
        onDateRangeChange={handleDateRangeChange}
        activePreset={activePreset}
      />

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportTab)}>
        <TabsList className={`grid w-full ${
          visibleTabs.length >= 8 ? 'grid-cols-4 lg:grid-cols-8' :
          visibleTabs.length === 7 ? 'grid-cols-4 lg:grid-cols-7' :
          visibleTabs.length === 6 ? 'grid-cols-3 lg:grid-cols-6' :
          visibleTabs.length === 5 ? 'grid-cols-3 lg:grid-cols-5' :
          visibleTabs.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
          visibleTabs.length === 3 ? 'grid-cols-2 lg:grid-cols-3' :
          visibleTabs.length === 2 ? 'grid-cols-2' :
          'grid-cols-1'
        } gap-2 h-auto`}>
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
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
