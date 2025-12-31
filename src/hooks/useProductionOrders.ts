/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';
import { PaginationParams, PaginatedResponse } from './useRoles';
import {
  ProductionOrder,
  ProductionOrderTimeline,
  ProductionOrderAnalytics,
  CreateProductionOrderData,
  ApproveOrderData,
  RejectOrderData,
  CancelOrderData,
  AssignToProductionData,
  CompleteOrderData,
  DeliverOrderData,
  UpdateProductionOrderData,
} from '@/types/production-order';

// Query keys
export const productionOrderKeys = {
  all: ['production-orders'] as const,
  lists: () => [...productionOrderKeys.all, 'list'] as const,
  list: (params?: any) => [...productionOrderKeys.lists(), params] as const,
  details: () => [...productionOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...productionOrderKeys.details(), id] as const,
  byStatus: (status: string) => ['production-orders', 'status', status] as const,
  byCustomer: (customerId: number) => ['production-orders', 'customer', customerId] as const,
  timeline: (id: number) => ['production-orders', id, 'timeline'] as const,
  analytics: ['production-orders', 'analytics'] as const,
};

// Get all production orders
export const useProductionOrders = (
  params?: PaginationParams & { status?: string } & Omit<UseQueryOptions<PaginatedResponse<ProductionOrder>>, 'queryKey' | 'queryFn'>
) => {
  const { page = 1, limit = 20, status, enabled, ...queryOptions } = params || {};

  return useQuery({
    queryKey: productionOrderKeys.list({ page, limit, status }),
    queryFn: async () => {
      const endpoint = status
        ? `${Endpoint.GET_PRODUCTION_ORDERS_BY_STATUS(status)}?page=${page}&limit=${limit}`
        : `${Endpoint.GET_PRODUCTION_ORDERS}?page=${page}&limit=${limit}`;
      const response = await fetchGet<PaginatedResponse<ProductionOrder>>(endpoint);
      return response;
    },
    enabled,
    ...queryOptions,
  });
};

// Get single production order
export const useProductionOrder = (id: number) => {
  return useQuery({
    queryKey: productionOrderKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<ProductionOrder>(Endpoint.GET_PRODUCTION_ORDER(id));
      return response;
    },
    enabled: !!id,
  });
};

// Get production order timeline
export const useProductionOrderTimeline = (id: number) => {
  return useQuery({
    queryKey: productionOrderKeys.timeline(id),
    queryFn: async () => {
      const response = await fetchGet<ProductionOrderTimeline>(
        Endpoint.GET_PRODUCTION_ORDER_TIMELINE(id)
      );
      return response;
    },
    enabled: !!id,
  });
};

// Get orders by customer
export const useCustomerProductionOrders = (customerId: number, params?: PaginationParams) => {
  const { page = 1, limit = 20 } = params || {};

  return useQuery({
    queryKey: productionOrderKeys.byCustomer(customerId),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_CUSTOMER_PRODUCTION_ORDERS(customerId)}?page=${page}&limit=${limit}`;
      const response = await fetchGet<PaginatedResponse<ProductionOrder>>(endpoint);
      return response;
    },
    enabled: !!customerId,
  });
};

// Get production order analytics
export const useProductionOrderAnalytics = () => {
  return useQuery({
    queryKey: productionOrderKeys.analytics,
    queryFn: async () => {
      const response = await fetchGet<ProductionOrderAnalytics>(
        Endpoint.GET_PRODUCTION_ORDER_ANALYTICS
      );
      return response;
    },
  });
};

// Generate production order number
export const useGenerateProductionOrderNumber = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetchGet<{ orderNo: string }>(
        Endpoint.GENERATE_PRODUCTION_ORDER_NUMBER
      );
      return response;
    },
  });
};

// Create production order mutation
export const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductionOrderData) => {
      const response = await fetchPost<ProductionOrder, CreateProductionOrderData>(
        Endpoint.CREATE_PRODUCTION_ORDER,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.analytics });
      toast.success('Production order created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create production order';
      toast.error(message);
    },
  });
};

// Approve production order mutation
export const useApproveProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ApproveOrderData }) => {
      const response = await fetchPost<ProductionOrder, ApproveOrderData>(
        Endpoint.APPROVE_PRODUCTION_ORDER(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.analytics });
      toast.success('Production order approved successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to approve production order';
      toast.error(message);
    },
  });
};

// Reject production order mutation
export const useRejectProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RejectOrderData }) => {
      const response = await fetchPost<ProductionOrder, RejectOrderData>(
        Endpoint.REJECT_PRODUCTION_ORDER(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.analytics });
      toast.success('Production order rejected');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to reject production order';
      toast.error(message);
    },
  });
};

// Create production from order mutation
export const useCreateProductionFromOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { createdBy: number; notes?: string } }) => {
      const endpoint = typeof Endpoint.CREATE_PRODUCTION_FROM_ORDER === 'function'
        ? Endpoint.CREATE_PRODUCTION_FROM_ORDER(id)
        : `production-orders/${id}/create-production`;
      const response = await fetchPost<ProductionOrder, { createdBy: number; notes?: string }>(
        endpoint,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.analytics });
      toast.success('Production created successfully from order');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create production from order';
      toast.error(message);
    },
  });
};

// Complete production order mutation
export const useCompleteProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CompleteOrderData }) => {
      const response = await fetchPost<ProductionOrder, CompleteOrderData>(
        Endpoint.COMPLETE_PRODUCTION_ORDER(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.analytics });
      toast.success('Production order completed successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to complete production order';
      toast.error(message);
    },
  });
};

// Deliver production order mutation
export const useDeliverProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DeliverOrderData }) => {
      const response = await fetchPost<ProductionOrder, DeliverOrderData>(
        Endpoint.DELIVER_PRODUCTION_ORDER(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.analytics });
      toast.success('Production order delivered successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to mark order as delivered';
      toast.error(message);
    },
  });
};

// Cancel production order mutation
export const useCancelProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CancelOrderData }) => {
      const response = await fetchPost<ProductionOrder, CancelOrderData>(
        Endpoint.CANCEL_PRODUCTION_ORDER(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.analytics });
      toast.success('Production order cancelled');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to cancel production order';
      toast.error(message);
    },
  });
};

// Update production order mutation
export const useUpdateProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProductionOrderData }) => {
      const endpoint = typeof Endpoint.UPDATE_PRODUCTION_ORDER === 'function'
        ? Endpoint.UPDATE_PRODUCTION_ORDER(id)
        : `${Endpoint.GET_PRODUCTION_ORDERS}/${id}`;
      const response = await fetchPatch<ProductionOrder, UpdateProductionOrderData>(endpoint, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.detail(variables.id) });
      toast.success('Production order updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update production order';
      toast.error(message);
    },
  });
};

// Delete production order mutation
export const useDeleteProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const endpoint = typeof Endpoint.DELETE_PRODUCTION_ORDER === 'function'
        ? Endpoint.DELETE_PRODUCTION_ORDER(id)
        : `${Endpoint.GET_PRODUCTION_ORDERS}/${id}`;
      const response = await fetchDelete<ProductionOrder>(endpoint);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionOrderKeys.analytics });
      toast.success('Production order deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete production order';
      toast.error(message);
    },
  });
};
