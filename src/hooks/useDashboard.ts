/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet } from '@/services/fetcher';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  alerts: () => [...dashboardKeys.all, 'alerts'] as const,
  activities: (limit?: number) => [...dashboardKeys.all, 'activities', limit] as const,
  kpis: () => [...dashboardKeys.all, 'kpis'] as const,
};

// Get dashboard overview
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: async () => {
      const response = await fetchGet<{
        production: {
          total: number;
          active: number;
          completed: number;
          completionRate: string;
        };
        sales: {
          totalInvoices: number;
          open: number;
          paid: number;
          delivered: number;
          totalRevenue: string;
          averageOrderValue: string;
        };
        materials: {
          pendingRequests: number;
          approvedRequests: number;
          totalRawMaterials: number;
          lowStockMaterials: number;
        };
        inventory: {
          totalProductStock: number;
          availableStock: number;
          soldStock: number;
          availabilityRate: string;
        };
      }>(Endpoint.GET_DASHBOARD_OVERVIEW);
      return response;
    },
    // Refetch every 5 minutes
    refetchInterval: 5 * 60 * 1000,
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
  });
};

// Get dashboard alerts
export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: async () => {
      const response = await fetchGet<{
        totalAlerts: number;
        alerts: Array<{
          type: string;
          severity: 'error' | 'warning' | 'info';
          count: number;
          message: string;
          action: string;
          link?: string;
          items?: Array<{
            id: number;
            name: string;
            currentQty: number;
          }>;
        }>;
      }>(Endpoint.GET_DASHBOARD_ALERTS);
      return response;
    },
    // Refetch every 2 minutes
    refetchInterval: 2 * 60 * 1000,
  });
};

// Get dashboard activities
export const useDashboardActivities = (limit: number = 20) => {
  return useQuery({
    queryKey: dashboardKeys.activities(limit),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_DASHBOARD_ACTIVITIES}?limit=${limit}`;
      const response = await fetchGet<{
        total: number;
        activities: Array<{
          type: string;
          action: string;
          details: {
            productionId?: number;
            productionCode?: string;
            stage?: string;
            requestId?: number;
            status?: string;
            notes?: string;
            [key: string]: any;
          };
          performedBy: string;
          timestamp: string;
        }>;
      }>(endpoint);
      return response;
    },
    // Refetch every minute
    refetchInterval: 60 * 1000,
  });
};

// Get dashboard KPIs
export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_DASHBOARD_KPIS);
      return response;
    },
    // Refetch every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
};
