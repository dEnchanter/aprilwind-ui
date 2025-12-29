"use client"

import React from 'react';
import {
  Factory,
  DollarSign,
  Package,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { MaxWidthWrapper } from '@/components/utils/max-width-wrapper';
import { GroupedMetricCard } from '@/components/dashboard/GroupedMetricCard';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import {
  useDashboardOverview,
  useDashboardAlerts,
  useDashboardActivities
} from '@/hooks/useDashboard';
import { formatNairaCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DashboardOverviewPage = () => {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview();
  const { data: alertsData, isLoading: alertsLoading } = useDashboardAlerts();
  const { data: activitiesData, isLoading: activitiesLoading } = useDashboardActivities(10);

  const isLoading = overviewLoading || alertsLoading || activitiesLoading;

  // Handle error state
  if (overviewError) {
    return (
      <MaxWidthWrapper className="mt-[2rem]">
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
              <p className="text-sm text-gray-600 mb-4">
                An error occurred while loading dashboard data. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </MaxWidthWrapper>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <MaxWidthWrapper className="mt-[2rem]">
        <DashboardSkeleton />
      </MaxWidthWrapper>
    );
  }

  // Grouped metrics configuration
  const metricSections = [
    {
      title: "Production",
      icon: Factory,
      iconBgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      metrics: [
        {
          label: "Total",
          value: overview?.production.total || 0,
        },
        {
          label: "Active",
          value: overview?.production.active || 0,
        },
        {
          label: "Completed",
          value: overview?.production.completed || 0,
        },
        {
          label: "Completion Rate",
          value: `${overview?.production.completionRate || "0"}%`,
        },
      ],
    },
    {
      title: "Sales",
      icon: DollarSign,
      iconBgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      metrics: [
        {
          label: "Total Invoices",
          value: overview?.sales.totalInvoices || 0,
        },
        {
          label: "Total Revenue",
          value: formatNairaCurrency(overview?.sales.totalRevenue || "0"),
        },
        {
          label: "Avg Order Value",
          value: formatNairaCurrency(overview?.sales.averageOrderValue || "0"),
        },
        {
          label: "Delivered",
          value: overview?.sales.delivered || 0,
        },
      ],
    },
    {
      title: "Materials",
      icon: Package,
      iconBgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      metrics: [
        {
          label: "Pending Requests",
          value: overview?.materials.pendingRequests || 0,
        },
        {
          label: "Approved Requests",
          value: overview?.materials.approvedRequests || 0,
        },
        {
          label: "Total Materials",
          value: overview?.materials.totalRawMaterials || 0,
        },
        {
          label: "Low Stock",
          value: overview?.materials.lowStockMaterials || 0,
          iconColor: "text-red-600",
        },
      ],
    },
    {
      title: "Inventory",
      icon: ShoppingBag,
      iconBgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      metrics: [
        {
          label: "Total Stock",
          value: overview?.inventory.totalProductStock || 0,
        },
        {
          label: "Available",
          value: overview?.inventory.availableStock || 0,
        },
        {
          label: "Sold",
          value: overview?.inventory.soldStock || 0,
        },
        {
          label: "Availability",
          value: `${overview?.inventory.availabilityRate || "0"}%`,
        },
      ],
    },
  ];

  return (
    <MaxWidthWrapper className="mt-[2rem]">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Monitor your business at a glance</p>
        </div>

        {/* Grouped Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metricSections.map((section, index) => (
            <GroupedMetricCard
              key={section.title}
              {...section}
              index={index}
              loading={overviewLoading}
            />
          ))}
        </div>

        {/* Alerts Section */}
        <AlertsSection
          alerts={alertsData?.alerts || []}
          loading={alertsLoading}
        />

        {/* Recent Activities */}
        <RecentActivities
          activities={activitiesData?.activities || []}
          loading={activitiesLoading}
        />
      </div>
    </MaxWidthWrapper>
  );
};

export default DashboardOverviewPage;
