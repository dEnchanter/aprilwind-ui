import { Endpoint } from '@/services/api';
import { fetchGet } from '@/services/fetcher';
import { useQuery } from '@tanstack/react-query';

export const useProductInProduction = () => {
  const fetchProductInProduction = async () => {
    try {
      // Use the appropriate endpoint from the Endpoint object for fetching products in production
      const response = await fetchGet<{ data: ProductInProduction[] }>(Endpoint.GET_PRODUCTS_FOR_PRODUCTION);
      return response.data; // Assuming the response contains a `data` field that holds the products in production
    } catch (error) {
      console.error('Error fetching products in production:', error);
      throw error; // Handle the error as needed
    }
  };

  return useQuery({
    queryKey: ['productInProduction'],
    queryFn: fetchProductInProduction,
  });
};
