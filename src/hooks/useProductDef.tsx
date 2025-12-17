/* eslint-disable @typescript-eslint/no-explicit-any */
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query key
export const productDefKeys = {
  all: ['productDefs'] as const,
  lists: () => [...productDefKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productDefKeys.lists(), filters] as const,
  details: () => [...productDefKeys.all, 'detail'] as const,
  detail: (id: number) => [...productDefKeys.details(), id] as const,
};

// Fetch all product definitions
export const useProductDef = (params?: { page?: number; limit?: number }) => {
  const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '';

  return useQuery({
    queryKey: productDefKeys.list(params || {}),
    queryFn: async () => {
      const response = await fetchGet<{ data: ProductDef[] }>(Endpoint.GET_PRODUCT_DEFS + query);
      return response.data;
    },
  });
};

// Fetch single product definition
export const useProductDefById = (id: number) => {
  return useQuery({
    queryKey: productDefKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<ProductDef>(Endpoint.GET_PRODUCT_DEF(id));
      return response;
    },
    enabled: !!id,
  });
};

// Create product definition
export const useCreateProductDef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_PRODUCT_DEF, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productDefKeys.lists() });
      toast.success(data?.message || 'Product definition created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create product definition');
    },
  });
};

// Update product definition
export const useUpdateProductDef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchPatch<any, any>(Endpoint.UPDATE_PRODUCT_DEF(id), data);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productDefKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productDefKeys.detail(variables.id) });
      toast.success(data?.message || 'Product definition updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update product definition');
    },
  });
};

// Delete product definition
export const useDeleteProductDef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchDelete<any>(Endpoint.DELETE_PRODUCT_DEF(id));
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productDefKeys.lists() });
      toast.success(data?.message || 'Product definition deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete product definition');
    },
  });
};
