import { Endpoint } from '@/services/api';
import { fetchGet } from '@/services/fetcher';
import { useQuery } from '@tanstack/react-query';

export const useProduct = () => {
  const fetchProducts = async () => {
    try {
      // Use the appropriate endpoint from the Endpoint object for fetching products
      const response = await fetchGet<{ data: Product[] }>(Endpoint.GET_PRODUCTIONS);
      return response.data; // Assuming the response contains a `data` field that holds the products
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error; // Handle the error as needed
    }
  };

  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};
