/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';
import { PaginationParams, PaginatedResponse } from './useRoles';

// Query keys
export const materialKeys = {
  all: ['raw-items'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...materialKeys.lists(), params] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: number) => [...materialKeys.details(), id] as const,
  available: ['raw-items', 'available'] as const,
  summary: ['raw-items', 'summary'] as const,
  lowStock: () => ['raw-items', 'low-stock'] as const,
  transactions: (id: number) => ['raw-items', id, 'transactions'] as const,
  search: (term: string) => ['raw-items', 'search', term] as const,
};

// Get all raw materials
export const useMaterials = (params?: PaginationParams) => {
  const { page = 1, limit = 20 } = params || {};

  return useQuery({
    queryKey: materialKeys.list({ page, limit }),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_RAW_ITEMS}?page=${page}&limit=${limit}`;
      const response = await fetchGet<PaginatedResponse<any>>(endpoint);
      return response;
    },
  });
};

// Get single material
export const useMaterial = (id: number) => {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: async () => {
      const endpoint = typeof Endpoint.GET_RAW_ITEM === 'function'
        ? Endpoint.GET_RAW_ITEM(id)
        : `${Endpoint.GET_RAW_ITEMS}/${id}`;
      const response = await fetchGet<any>(endpoint);
      return response;
    },
    enabled: !!id,
  });
};

// Get available materials
export const useAvailableMaterials = () => {
  return useQuery({
    queryKey: materialKeys.available,
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_RAW_ITEMS_AVAILABLE);
      return response;
    },
  });
};

// Get materials summary
export const useMaterialsSummary = () => {
  return useQuery({
    queryKey: materialKeys.summary,
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_RAW_ITEMS_SUMMARY);
      return response;
    },
  });
};

// Get low stock materials
export const useLowStockMaterials = () => {
  return useQuery({
    queryKey: materialKeys.lowStock(),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_RAW_ITEMS_LOW_STOCK);
      return response;
    },
  });
};

// Search materials
export const useSearchMaterials = (term: string) => {
  return useQuery({
    queryKey: materialKeys.search(term),
    queryFn: async () => {
      const endpoint = `${Endpoint.SEARCH_RAW_ITEMS}?term=${term}`;
      const response = await fetchGet<any>(endpoint);
      return response;
    },
    enabled: term.length > 0,
  });
};

// Get material transactions
export const useMaterialTransactions = (id: number, params?: PaginationParams) => {
  const { page = 1, limit = 20 } = params || {};

  return useQuery({
    queryKey: materialKeys.transactions(id),
    queryFn: async () => {
      const baseEndpoint = typeof Endpoint.GET_RAW_ITEM_TRANSACTIONS === 'function'
        ? Endpoint.GET_RAW_ITEM_TRANSACTIONS(id)
        : `${Endpoint.GET_RAW_ITEMS}/${id}/transactions`;
      const endpoint = `${baseEndpoint}?page=${page}&limit=${limit}`;
      const response = await fetchGet<PaginatedResponse<any>>(endpoint);
      return response;
    },
    enabled: !!id,
  });
};

// Create material mutation
export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_RAW_ITEM, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.summary });
      toast.success('Material created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create material';
      toast.error(message);
    },
  });
};

// Update material mutation
export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const endpoint = typeof Endpoint.UPDATE_RAW_ITEM === 'function'
        ? Endpoint.UPDATE_RAW_ITEM(id)
        : `${Endpoint.GET_RAW_ITEMS}/${id}`;
      const response = await fetchPatch<any, any>(endpoint, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: materialKeys.summary });
      toast.success('Material updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update material';
      toast.error(message);
    },
  });
};

// Delete material mutation
export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const endpoint = typeof Endpoint.DELETE_RAW_ITEM === 'function'
        ? Endpoint.DELETE_RAW_ITEM(id)
        : `${Endpoint.GET_RAW_ITEMS}/${id}`;
      const response = await fetchDelete<any>(endpoint);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.summary });
      toast.success('Material deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete material';
      toast.error(message);
    },
  });
};

// Add stock mutation
export const useAddMaterialStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      itemId: number;
      quantity: number;
      staffId: number;
      supplier?: string;
      unitCost?: number;
      notes?: string;
    }) => {
      const response = await fetchPost<any, any>(Endpoint.ADD_RAW_ITEM_STOCK, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: materialKeys.transactions(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: materialKeys.summary });
      queryClient.invalidateQueries({ queryKey: materialKeys.available });
      toast.success('Stock added successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to add stock';
      toast.error(message);
    },
  });
};

// Bulk add materials mutation
export const useBulkAddMaterials = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      materials: Array<{
        itemId: number;
        quantity: number;
        unitCost?: number;
      }>;
      staffId: number;
      supplier?: string;
      notes?: string;
    }) => {
      const response = await fetchPost<any, any>(Endpoint.BULK_ADD_RAW_ITEMS, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
      toast.success('Materials added successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to add materials';
      toast.error(message);
    },
  });
};

// Adjust stock mutation
export const useAdjustMaterialStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      itemId: number;
      quantity: number;
      adjustmentType: 'increase' | 'decrease';
      reason: string;
      staffId: number;
    }) => {
      const response = await fetchPost<any, any>(Endpoint.ADJUST_RAW_ITEM_STOCK, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: materialKeys.transactions(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: materialKeys.summary });
      queryClient.invalidateQueries({ queryKey: materialKeys.available });
      toast.success('Stock adjusted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to adjust stock';
      toast.error(message);
    },
  });
};
