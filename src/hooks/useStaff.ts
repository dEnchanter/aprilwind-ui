/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';
import { PaginationParams, PaginatedResponse } from './useRoles';

// Query keys
export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...staffKeys.lists(), params] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: number) => [...staffKeys.details(), id] as const,
};

// Get all staff
export const useStaff = (params?: PaginationParams) => {
  const { page = 1, limit = 20 } = params || {};

  return useQuery({
    queryKey: staffKeys.list({ page, limit }),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_STAFF}?page=${page}&limit=${limit}`;
      const response = await fetchGet<PaginatedResponse<any>>(endpoint);
      return response;
    },
  });
};

// Get single staff member
export const useStaffMember = (id: number) => {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: async () => {
      const endpoint = typeof Endpoint.GET_STAFF_BY_ID === 'function'
        ? Endpoint.GET_STAFF_BY_ID(id)
        : `${Endpoint.GET_STAFF}/${id}`;
      const response = await fetchGet<any>(endpoint);
      return response;
    },
    enabled: !!id,
  });
};

// Create staff mutation
export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_STAFF, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      toast.success('Staff member created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create staff member';
      toast.error(message);
    },
  });
};

// Update staff mutation
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const endpoint = typeof Endpoint.UPDATE_STAFF === 'function'
        ? Endpoint.UPDATE_STAFF(id)
        : `${Endpoint.GET_STAFF}/${id}`;
      const response = await fetchPatch<any, any>(endpoint, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(variables.id) });
      toast.success('Staff member updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update staff member';
      toast.error(message);
    },
  });
};

// Delete staff mutation
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const endpoint = typeof Endpoint.DELETE_STAFF === 'function'
        ? Endpoint.DELETE_STAFF(id)
        : `${Endpoint.GET_STAFF}/${id}`;
      const response = await fetchDelete<any>(endpoint);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      toast.success('Staff member deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete staff member';
      toast.error(message);
    },
  });
};
