/* eslint-disable @typescript-eslint/no-explicit-any */
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys
export const customerTypeKeys = {
  all: ['customerTypes'] as const,
  lists: () => [...customerTypeKeys.all, 'list'] as const,
  details: () => [...customerTypeKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerTypeKeys.details(), id] as const,
};

export const useCustomerType = (options?: Omit<UseQueryOptions<CustomerType[]>, 'queryKey' | 'queryFn'>) => {
  const fetchCustomerTypes = async () => {
    try {
      // Use the appropriate endpoint from the Endpoint object for fetching customer types
      const response = await fetchGet<{ data: CustomerType[] }>(Endpoint.GET_CUSTOMER_TYPES);
      return response.data; // Assuming the response contains a `data` field that holds the customer types
    } catch (error) {
      console.error('Error fetching customer types:', error);
      throw error; // Handle the error as needed
    }
  };

  return useQuery({
    queryKey: customerTypeKeys.all,
    queryFn: fetchCustomerTypes,
    ...options,
  });
};

// Create customer type mutation
export const useCreateCustomerType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_CUSTOMER_TYPE, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerTypeKeys.all });
      toast.success('Customer type created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create customer type';
      toast.error(message);
    },
  });
};

// Update customer type mutation
export const useUpdateCustomerType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchPatch<any, any>(Endpoint.UPDATE_CUSTOMER_TYPE(id), data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: customerTypeKeys.detail(variables.id) });
      toast.success('Customer type updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update customer type';
      toast.error(message);
    },
  });
};

// Delete customer type mutation
export const useDeleteCustomerType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchDelete<any>(Endpoint.DELETE_CUSTOMER_TYPE(id));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerTypeKeys.all });
      toast.success('Customer type deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete customer type';
      toast.error(message);
    },
  });
};
