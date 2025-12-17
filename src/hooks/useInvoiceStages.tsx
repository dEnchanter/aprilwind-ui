import { useQuery } from '@tanstack/react-query';

export const useInvoiceStages = () => {
  const fetchInvoiceStages = async () => {
    // TODO: Invoice stages are embedded in invoice objects, not a separate endpoint
    // Return empty array as placeholder until proper implementation
    return [] as InvoiceStages[];
  };

  return useQuery({
    queryKey: ['invoiceStages'],
    queryFn: fetchInvoiceStages,
  });
};
