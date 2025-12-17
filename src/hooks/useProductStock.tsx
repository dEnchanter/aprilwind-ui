/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';

// Query keys
export const productStockKeys = {
  all: ['product-stocks'] as const,
  lists: () => [...productStockKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productStockKeys.lists(), filters] as const,
  details: () => [...productStockKeys.all, 'detail'] as const,
  detail: (id: number) => [...productStockKeys.details(), id] as const,
  available: () => [...productStockKeys.all, 'available'] as const,
  summary: () => [...productStockKeys.all, 'summary'] as const,
  bySize: (size: number) => [...productStockKeys.all, 'size', size] as const,
};

// Get all product stocks
export const useProductStock = (params?: { page?: number; limit?: number }) => {
  const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '';

  return useQuery({
    queryKey: productStockKeys.list(params || {}),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_PRODUCT_STOCKS + query);
      return response;
    },
  });
};

// Get single product stock by ID
export const useProductStockById = (id: number) => {
  return useQuery({
    queryKey: productStockKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<ProductStock>(Endpoint.GET_PRODUCT_STOCK(id));
      return response;
    },
    enabled: !!id,
  });
};

// Get available product stocks
export const useAvailableProductStocks = () => {
  return useQuery({
    queryKey: productStockKeys.available(),
    queryFn: async () => {
      const response = await fetchGet<ProductStock[]>(Endpoint.GET_AVAILABLE_PRODUCT_STOCKS);
      return response;
    },
  });
};

// Get product stock summary
export const useProductStockSummary = () => {
  return useQuery({
    queryKey: productStockKeys.summary(),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_PRODUCT_STOCK_SUMMARY);
      return response;
    },
  });
};

// Get product stocks by size
export const useProductStocksBySize = (size: number) => {
  return useQuery({
    queryKey: productStockKeys.bySize(size),
    queryFn: async () => {
      const response = await fetchGet<ProductStock[]>(Endpoint.GET_PRODUCT_STOCKS_BY_SIZE(size));
      return response;
    },
    enabled: !!size && size > 0,
  });
};

// Search product stocks
export const useSearchProductStocks = (searchTerm: string) => {
  return useQuery({
    queryKey: [...productStockKeys.all, 'search', searchTerm],
    queryFn: async () => {
      const response = await fetchGet<ProductStock[]>(`${Endpoint.SEARCH_PRODUCT_STOCKS}?query=${searchTerm}`);
      return response;
    },
    enabled: !!searchTerm && searchTerm.length > 0,
  });
};

// Create product stock (manual entry)
export const useCreateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_PRODUCT_STOCK, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productStockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productStockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: productStockKeys.available() });
      toast.success('Product stock created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create product stock';
      toast.error(message);
    },
  });
};

// Update product stock
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchPatch<any, any>(Endpoint.UPDATE_PRODUCT_STOCK(id), data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productStockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productStockKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productStockKeys.summary() });
      toast.success('Product stock updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update product stock';
      toast.error(message);
    },
  });
};

// Delete product stock
export const useDeleteProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchDelete<any>(Endpoint.DELETE_PRODUCT_STOCK(id));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productStockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productStockKeys.summary() });
      queryClient.invalidateQueries({ queryKey: productStockKeys.available() });
      toast.success('Product stock deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete product stock';
      toast.error(message);
    },
  });
};
