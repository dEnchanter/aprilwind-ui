/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';

// Query keys
export const itemTypeKeys = {
  all: ['item-types'] as const,
  lists: () => [...itemTypeKeys.all, 'list'] as const,
  detail: (id: number) => [...itemTypeKeys.all, 'detail', id] as const,
};

// Get all item types (including inactive)
export const useItemTypes = () => {
  return useQuery({
    queryKey: itemTypeKeys.lists(),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_ITEM_TYPES);
      // Backend returns array directly, wrap it in data property for consistency
      return Array.isArray(response) ? { data: response } : response;
    },
  });
};

// Get single item type
export const useItemType = (id: number) => {
  return useQuery({
    queryKey: itemTypeKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_ITEM_TYPE(id));
      return response;
    },
    enabled: !!id,
  });
};

// Create item type
export const useCreateItemType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await fetchPost<any, any>(Endpoint.CREATE_ITEM_TYPE, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.lists() });
      toast.success('Item type created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create item type');
    },
  });
};

// Update item type
export const useUpdateItemType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await fetchPatch<any, any>(Endpoint.UPDATE_ITEM_TYPE(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.lists() });
      toast.success('Item type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update item type');
    },
  });
};

// Delete item type
export const useDeleteItemType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await fetchDelete<any>(Endpoint.DELETE_ITEM_TYPE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.lists() });
      toast.success('Item type deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete item type');
    },
  });
};

// Activate item type
export const useActivateItemType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await fetchPatch<any, {}>(Endpoint.ACTIVATE_ITEM_TYPE(id), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.lists() });
      toast.success('Item type activated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate item type');
    },
  });
};

// Deactivate item type
export const useDeactivateItemType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await fetchPatch<any, {}>(Endpoint.DEACTIVATE_ITEM_TYPE(id), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.lists() });
      toast.success('Item type deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate item type');
    },
  });
};
