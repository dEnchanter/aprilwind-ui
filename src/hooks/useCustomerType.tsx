import { Endpoint } from '@/services/api';
import { fetchGet } from '@/services/fetcher';
import { useQuery } from '@tanstack/react-query';

export const useCustomerType = () => {
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
    queryKey: ['customerTypes'],
    queryFn: fetchCustomerTypes,
  });
};
