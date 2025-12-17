/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';

// Query keys
export const materialRequestKeys = {
  all: ['material-requests'] as const,
  lists: () => [...materialRequestKeys.all, 'list'] as const,
  details: () => [...materialRequestKeys.all, 'detail'] as const,
  detail: (id: number) => [...materialRequestKeys.details(), id] as const,
  pending: () => [...materialRequestKeys.all, 'pending'] as const,
  byRequester: (requesterId: number) => [...materialRequestKeys.all, 'requester', requesterId] as const,
  byProduction: (productionId: number) => [...materialRequestKeys.all, 'production', productionId] as const,
  timeline: (id: number) => [...materialRequestKeys.all, 'timeline', id] as const,
  analytics: () => [...materialRequestKeys.all, 'analytics'] as const,
};

// Get all material requests
export const useMaterialRequests = () => {
  return useQuery({
    queryKey: materialRequestKeys.lists(),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_MATERIAL_REQUESTS);
      return response;
    },
  });
};

// Get single material request
export const useMaterialRequest = (id: number) => {
  return useQuery({
    queryKey: materialRequestKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_MATERIAL_REQUEST(id));
      return response;
    },
    enabled: !!id,
  });
};

// Get pending material requests
export const usePendingMaterialRequests = () => {
  return useQuery({
    queryKey: materialRequestKeys.pending(),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_PENDING_MATERIAL_REQUESTS);
      return response;
    },
  });
};

// Get material requests by requester
export const useMaterialRequestsByRequester = (requesterId: number) => {
  return useQuery({
    queryKey: materialRequestKeys.byRequester(requesterId),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_MATERIAL_REQUESTS_BY_REQUESTER(requesterId));
      return response;
    },
    enabled: !!requesterId,
  });
};

// Get material requests by production
export const useMaterialRequestsByProduction = (productionId: number) => {
  return useQuery({
    queryKey: materialRequestKeys.byProduction(productionId),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_MATERIAL_REQUESTS_BY_PRODUCTION(productionId));
      return response;
    },
    enabled: !!productionId && productionId > 0,
  });
};

// Get material request timeline
export const useMaterialRequestTimeline = (id: number) => {
  return useQuery({
    queryKey: materialRequestKeys.timeline(id),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_MATERIAL_REQUEST_TIMELINE(id));
      return response;
    },
    enabled: !!id,
  });
};

// Get material request analytics
export const useMaterialRequestAnalytics = () => {
  return useQuery({
    queryKey: materialRequestKeys.analytics(),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_MATERIAL_REQUEST_ANALYTICS);
      return response;
    },
  });
};

// Check material availability
export const useCheckMaterialAvailability = () => {
  return useMutation({
    mutationFn: async (materials: Array<{ itemId: number; quantity: number }>) => {
      const response = await fetchPost<any, any>(Endpoint.CHECK_MATERIAL_AVAILABILITY, { materials });
      return response;
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to check material availability';
      toast.error(message);
    },
  });
};

// Create material request
export const useCreateMaterialRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchPost<any, any>(Endpoint.CREATE_MATERIAL_REQUEST, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.analytics() });
      toast.success('Material request created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create material request';
      toast.error(message);
    },
  });
};

// Update material request
export const useUpdateMaterialRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchPatch<any, any>(Endpoint.UPDATE_MATERIAL_REQUEST(id), data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.analytics() });
      toast.success('Material request updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update material request';
      toast.error(message);
    },
  });
};

// Delete material request
export const useDeleteMaterialRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchDelete<any>(Endpoint.DELETE_MATERIAL_REQUEST(id));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.analytics() });
      toast.success('Material request deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete material request';
      toast.error(message);
    },
  });
};

// Approve material request
export const useApproveMaterialRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approverId, deductFromStock, notes }: { id: number; approverId: number; deductFromStock?: boolean; notes?: string }) => {
      const response = await fetchPost<any, any>(Endpoint.APPROVE_MATERIAL_REQUEST(id), {
        approverId,
        deductFromStock: deductFromStock ?? true,
        notes,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.analytics() });
      // Also invalidate materials since stock was deducted
      queryClient.invalidateQueries({ queryKey: ['raw-items'] });
      toast.success('Material request approved successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to approve material request';
      toast.error(message);
    },
  });
};

// Reject material request
export const useRejectMaterialRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rejectedBy, reason, notes }: { id: number; rejectedBy: number; reason: string; notes?: string }) => {
      const response = await fetchPost<any, any>(Endpoint.REJECT_MATERIAL_REQUEST(id), {
        rejectedBy,
        reason,
        notes,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.analytics() });
      toast.success('Material request rejected');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to reject material request';
      toast.error(message);
    },
  });
};

// Cancel material request
export const useCancelMaterialRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, cancelledBy, reason, notes }: { id: number; cancelledBy: number; reason: string; notes?: string }) => {
      const response = await fetchPost<any, any>(Endpoint.CANCEL_MATERIAL_REQUEST(id), {
        cancelledBy,
        reason,
        notes,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.pending() });
      queryClient.invalidateQueries({ queryKey: materialRequestKeys.analytics() });
      toast.success('Material request cancelled');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to cancel material request';
      toast.error(message);
    },
  });
};
