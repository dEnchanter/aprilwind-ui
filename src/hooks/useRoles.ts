/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

// Get all roles
export const useRoles = (params?: PaginationParams) => {
  const { page = 1, limit = 100 } = params || {};

  return useQuery({
    queryKey: roleKeys.list({ page, limit }),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_ROLES}?page=${page}&limit=${limit}`;
      const response = await fetchGet<PaginatedResponse<any>>(endpoint);
      return response;
    },
  });
};

// Get single role
export const useRole = (id: number) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const endpoint = typeof Endpoint.GET_ROLE === 'function'
        ? Endpoint.GET_ROLE(id)
        : `${Endpoint.GET_ROLES}/${id}`;
      const response = await fetchGet<any>(endpoint);
      return response;
    },
    enabled: !!id,
  });
};

// Create role mutation
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_ROLE, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create role';
      toast.error(message);
    },
  });
};

// Update role mutation
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const endpoint = typeof Endpoint.UPDATE_ROLE === 'function'
        ? Endpoint.UPDATE_ROLE(id)
        : `${Endpoint.GET_ROLES}/${id}`;
      const response = await fetchPatch<any, any>(endpoint, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update role';
      toast.error(message);
    },
  });
};

// Delete role mutation
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const endpoint = typeof Endpoint.DELETE_ROLE === 'function'
        ? Endpoint.DELETE_ROLE(id)
        : `${Endpoint.GET_ROLES}/${id}`;
      const response = await fetchDelete<any>(endpoint);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete role';
      toast.error(message);
    },
  });
};
