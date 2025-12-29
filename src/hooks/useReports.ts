import { useQuery } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet } from '@/services/fetcher';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  production: (params?: DateParams) => [...reportKeys.all, 'production', params] as const,
  sales: (params?: DateParams) => [...reportKeys.all, 'sales', params] as const,
  inventory: (params?: DateParams) => [...reportKeys.all, 'inventory', params] as const,
  materials: (params?: DateParams) => [...reportKeys.all, 'materials', params] as const,
  customers: (params?: DateParams) => [...reportKeys.all, 'customers', params] as const,
  productionOrders: (params?: DateParams) => [...reportKeys.all, 'production-orders', params] as const,
  staff: (params?: DateParams) => [...reportKeys.all, 'staff', params] as const,
  business: (params?: DateParams) => [...reportKeys.all, 'business', params] as const,
};

// Helper to build query string
const buildDateQuery = (params?: DateParams): string => {
  if (!params?.startDate || !params?.endDate) return '';
  return `?startDate=${params.startDate}&endDate=${params.endDate}`;
};

// Production Report Hook
export const useProductionReport = (params?: DateParams) => {
  return useQuery({
    queryKey: reportKeys.production(params),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_PRODUCTION_REPORT}${buildDateQuery(params)}`;
      const response = await fetchGet<ProductionReportData>(endpoint);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Sales Report Hook
export const useSalesReport = (params?: DateParams) => {
  return useQuery({
    queryKey: reportKeys.sales(params),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_SALES_REPORT}${buildDateQuery(params)}`;
      const response = await fetchGet<SalesReportData>(endpoint);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

// Inventory Report Hook
export const useInventoryReport = (params?: DateParams) => {
  return useQuery({
    queryKey: reportKeys.inventory(params),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_INVENTORY_REPORT}${buildDateQuery(params)}`;
      const response = await fetchGet<InventoryReportData>(endpoint);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

// Materials Report Hook
export const useMaterialsReport = (params?: DateParams) => {
  return useQuery({
    queryKey: reportKeys.materials(params),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_MATERIALS_REPORT}${buildDateQuery(params)}`;
      const response = await fetchGet<MaterialsReportData>(endpoint);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

// Customers Report Hook
export const useCustomersReport = (params?: DateParams) => {
  return useQuery({
    queryKey: reportKeys.customers(params),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_CUSTOMERS_REPORT}${buildDateQuery(params)}`;
      const response = await fetchGet<CustomersReportData>(endpoint);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

// Production Orders Report Hook
export const useProductionOrdersReport = (params?: DateParams) => {
  return useQuery({
    queryKey: reportKeys.productionOrders(params),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_PRODUCTION_ORDERS_REPORT}${buildDateQuery(params)}`;
      const response = await fetchGet<ProductionOrdersReportData>(endpoint);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

// Staff Report Hook
export const useStaffReport = (params?: DateParams) => {
  return useQuery({
    queryKey: reportKeys.staff(params),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_STAFF_REPORT}${buildDateQuery(params)}`;
      const response = await fetchGet<StaffReportData>(endpoint);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

// Business Report Hook
export const useBusinessReport = (params?: DateParams) => {
  return useQuery({
    queryKey: reportKeys.business(params),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_BUSINESS_REPORT}${buildDateQuery(params)}`;
      const response = await fetchGet<BusinessReportData>(endpoint);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};
