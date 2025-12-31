/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost } from '@/services/fetcher';
import { toast } from 'sonner';

// Query keys
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (params?: any) => [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: number) => [...invoiceKeys.details(), id] as const,
  customer: (customerId: number) => [...invoiceKeys.all, 'customer', customerId] as const,
};

// Get all invoices
export const useInvoices = (params?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 20 } = params || {};

  return useQuery({
    queryKey: invoiceKeys.list({ page, limit }),
    queryFn: async () => {
      const endpoint = `${Endpoint.GET_INVOICES}?page=${page}&limit=${limit}`;
      const response = await fetchGet<any>(endpoint);
      return response;
    },
  });
};

// Get single invoice
export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_INVOICE(id));
      return response;
    },
    enabled: !!id,
  });
};

// Get customer invoices
export const useCustomerInvoices = (customerId: number) => {
  return useQuery({
    queryKey: invoiceKeys.customer(customerId),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_CUSTOMER_INVOICES(customerId));
      return response;
    },
    enabled: !!customerId,
  });
};

// Generate invoice number
export const useGenerateInvoiceNumber = () => {
  return useMutation({
    mutationFn: async () => {
      // Custom fetch to handle text response instead of JSON
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = `${baseUrl}/${Endpoint.GENERATE_INVOICE_NUMBER}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice number');
      }

      // Get the response as text (not JSON)
      const invoiceNo = await response.text();

      // Remove quotes if the API returns it as a quoted string
      const cleanInvoiceNo = invoiceNo.replace(/^"|"$/g, '');

      return cleanInvoiceNo;
    },
  });
};

// Create invoice
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_INVOICE, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      // Invalidate product stock to refresh quantity sold
      queryClient.invalidateQueries({ queryKey: ['product-stocks'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create invoice';
      toast.error(message);
    },
  });
};

// Mark invoice as paid
export const useMarkInvoiceAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      receivedBy,
      paymentMethod,
      referenceNumber,
      paymentDate,
      notes
    }: {
      id: number;
      receivedBy: number;
      paymentMethod: 'cash' | 'card' | 'transfer' | 'cheque' | 'other';
      referenceNumber?: string;
      paymentDate?: string;
      notes?: string;
    }) => {
      const response = await fetchPost<any, any>(Endpoint.MARK_INVOICE_AS_PAID(id), {
        receivedBy,
        paymentMethod,
        referenceNumber,
        paymentDate,
        notes,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
      toast.success('Invoice marked as paid');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to mark invoice as paid';
      toast.error(message);
    },
  });
};

// Cancel invoice
export const useCancelInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      cancelledBy,
      reason,
      restoreStock = true,
      notes
    }: {
      id: number;
      cancelledBy: number;
      reason: string;
      restoreStock?: boolean;
      notes?: string;
    }) => {
      const response = await fetchPost<any, any>(Endpoint.CANCEL_INVOICE(id), {
        cancelledBy,
        reason,
        restoreStock,
        notes,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) });
      // Invalidate product stock to reflect restored quantities
      queryClient.invalidateQueries({ queryKey: ['product-stocks'] });
      toast.success('Invoice cancelled successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to cancel invoice';
      toast.error(message);
    },
  });
};
