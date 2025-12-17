import { Endpoint } from '@/services/api';
import { fetchGet } from '@/services/fetcher';
import { useQuery } from '@tanstack/react-query';

export const useInvoice = () => {
  const fetchInvoices = async () => {
    try {
      // Use the appropriate endpoint from the Endpoint object for fetching invoices
      const response = await fetchGet<{ data: Invoice[] }>(Endpoint.GET_INVOICES);
      return response.data; // Assuming the response contains a `data` field that holds the invoices
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error; // Handle the error as needed
    }
  };

  return useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });
};
