/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';
import { PaginationParams, PaginatedResponse } from './useRoles';

// Query keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};

// Get all customers
export const useCustomers = (params?: PaginationParams) => {
  const { page = 1, limit = 20 } = params || {};

  return useQuery({
    queryKey: customerKeys.list({ page, limit }),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_CUSTOMERS}?page=${page}&limit=${limit}`;
      const response = await fetchGet<PaginatedResponse<any>>(endpoint);
      return response;
    },
  });
};

// Get single customer
export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const endpoint = typeof Endpoint.GET_CUSTOMER === 'function'
        ? Endpoint.GET_CUSTOMER(id)
        : `${Endpoint.GET_CUSTOMERS}/${id}`;
      const response = await fetchGet<any>(endpoint);
      return response;
    },
    enabled: !!id,
  });
};

// Create customer mutation
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_CUSTOMER, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create customer';
      toast.error(message);
    },
  });
};

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const endpoint = typeof Endpoint.UPDATE_CUSTOMER === 'function'
        ? Endpoint.UPDATE_CUSTOMER(id)
        : `${Endpoint.GET_CUSTOMERS}/${id}`;
      const response = await fetchPatch<any, any>(endpoint, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update customer';
      toast.error(message);
    },
  });
};

// Delete customer mutation
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const endpoint = typeof Endpoint.DELETE_CUSTOMER === 'function'
        ? Endpoint.DELETE_CUSTOMER(id)
        : `${Endpoint.GET_CUSTOMERS}/${id}`;
      const response = await fetchDelete<any>(endpoint);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete customer';
      toast.error(message);
    },
  });
};
