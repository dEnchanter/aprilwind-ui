/* eslint-disable @typescript-eslint/no-explicit-any */
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys
export const productionKeys = {
  all: ['productions'] as const,
  lists: () => [...productionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productionKeys.lists(), filters] as const,
  details: () => [...productionKeys.all, 'detail'] as const,
  detail: (id: number) => [...productionKeys.details(), id] as const,
};

// Fetch all productions (Product for Production)
export const useProductions = (params?: { page?: number; limit?: number }) => {
  const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '';

  return useQuery({
    queryKey: productionKeys.list(params || {}),
    queryFn: async () => {
      const response = await fetchGet<{ data: any[] }>(Endpoint.GET_PRODUCTS_FOR_PRODUCTION + query);
      return response.data;
    },
  });
};

// Fetch single production
export const useProductionById = (id: number) => {
  return useQuery({
    queryKey: productionKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_PRODUCT_FOR_PRODUCTION(id));
      return response;
    },
    enabled: !!id,
  });
};

// Create production
export const useCreateProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_PRODUCT_FOR_PRODUCTION, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.lists() });
      toast.success(data?.message || 'Production created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create production');
    },
  });
};

// Update production
export const useUpdateProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchPatch<any, any>(Endpoint.UPDATE_PRODUCT_FOR_PRODUCTION(id), data);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionKeys.detail(variables.id) });
      toast.success(data?.message || 'Production updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update production');
    },
  });
};

// Delete production
export const useDeleteProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchDelete<any>(Endpoint.DELETE_PRODUCT_FOR_PRODUCTION(id));
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.lists() });
      toast.success(data?.message || 'Production deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete production');
    },
  });
};
