/* eslint-disable @typescript-eslint/no-explicit-any */
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys
export const productForProductionKeys = {
  all: ['products-for-production'] as const,
  lists: () => [...productForProductionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productForProductionKeys.lists(), filters] as const,
  details: () => [...productForProductionKeys.all, 'detail'] as const,
  detail: (id: number) => [...productForProductionKeys.details(), id] as const,
};

// Fetch all products for production
export const useProductsForProduction = (params?: { page?: number; limit?: number }) => {
  const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '';

  return useQuery({
    queryKey: productForProductionKeys.list(params || {}),
    queryFn: async () => {
      const response = await fetchGet<{ data: any[] }>(Endpoint.GET_PRODUCTS_FOR_PRODUCTION + query);
      return response.data;
    },
  });
};

// Fetch single product for production
export const useProductForProductionById = (id: number) => {
  return useQuery({
    queryKey: productForProductionKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_PRODUCT_FOR_PRODUCTION(id));
      return response;
    },
    enabled: !!id,
  });
};

// Create product for production
export const useCreateProductForProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_PRODUCT_FOR_PRODUCTION, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productForProductionKeys.lists() });
      toast.success(data?.message || 'Product for production created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create product for production');
    },
  });
};

// Update product for production
export const useUpdateProductForProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchPatch<any, any>(Endpoint.UPDATE_PRODUCT_FOR_PRODUCTION(id), data);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productForProductionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productForProductionKeys.detail(variables.id) });
      toast.success(data?.message || 'Product for production updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update product for production');
    },
  });
};

// Delete product for production
export const useDeleteProductForProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchDelete<any>(Endpoint.DELETE_PRODUCT_FOR_PRODUCTION(id));
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productForProductionKeys.lists() });
      toast.success(data?.message || 'Product for production deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete product for production');
    },
  });
};

// Cancel product for production
export const useCancelProductForProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      const response = await fetchPost<any, any>(Endpoint.CANCEL_PRODUCT_FOR_PRODUCTION(id), { reason });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productForProductionKeys.lists() });
      toast.success(data?.message || 'Product for production cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel product for production');
    },
  });
};

// Reactivate product for production
export const useReactivateProductForProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchPost<any, any>(Endpoint.REACTIVATE_PRODUCT_FOR_PRODUCTION(id), {});
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productForProductionKeys.lists() });
      toast.success(data?.message || 'Product for production reactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to reactivate product for production');
    },
  });
};
