import { Endpoint } from '@/services/api';
import { fetchGet } from '@/services/fetcher';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const useRoles = (options?: Omit<UseQueryOptions<{ data: Role[] }>, 'queryKey' | 'queryFn'>) => {
  const fetchRoles = async () => {
    try {
      // Use the appropriate endpoint from the Endpoint object for fetching roles
      const response = await fetchGet<{ data: Role[] }>(Endpoint.GET_ROLES);
      return response; // Return the full response to match expected structure
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error; // Handle the error as needed
    }
  };

  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    ...options,
  });
};
