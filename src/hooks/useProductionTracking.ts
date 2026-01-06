/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';

// Query keys
export const productionTrackingKeys = {
  all: ['production-tracking'] as const,
  lists: () => [...productionTrackingKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productionTrackingKeys.lists(), filters] as const,
  details: () => [...productionTrackingKeys.all, 'detail'] as const,
  detail: (id: number) => [...productionTrackingKeys.details(), id] as const,
  byStage: (stage: string) => [...productionTrackingKeys.all, 'stage', stage] as const,
  byTailor: (tailorId: number) => [...productionTrackingKeys.all, 'tailor', tailorId] as const,
  timeline: (id: number) => [...productionTrackingKeys.all, 'timeline', id] as const,
  analytics: () => [...productionTrackingKeys.all, 'analytics'] as const,
};

// Get all productions (actual production tracking)
export const useProductionTracking = (params?: { page?: number; limit?: number }) => {
  const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '';

  return useQuery({
    queryKey: productionTrackingKeys.list(params || {}),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_PRODUCTIONS + query);
      return response;
    },
  });
};

// Get single production
export const useProductionTrackingById = (id: number) => {
  return useQuery({
    queryKey: productionTrackingKeys.detail(id),
    queryFn: async () => {
      const response = await fetchGet<Production>(Endpoint.GET_PRODUCTION(id));
      return response;
    },
    enabled: !!id,
  });
};

// Get productions by stage
export const useProductionsByStage = (stage: string) => {
  return useQuery({
    queryKey: productionTrackingKeys.byStage(stage),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_PRODUCTIONS_BY_STAGE(stage));
      return response;
    },
    enabled: !!stage,
  });
};

// Get productions by tailor
export const useProductionsByTailor = (tailorId: number) => {
  return useQuery({
    queryKey: productionTrackingKeys.byTailor(tailorId),
    queryFn: async () => {
      const response = await fetchGet<any>(Endpoint.GET_PRODUCTIONS_BY_TAILOR(tailorId));
      return response;
    },
    enabled: !!tailorId && tailorId > 0,
  });
};

// Get production timeline
export const useProductionTimeline = (id: number) => {
  return useQuery({
    queryKey: productionTrackingKeys.timeline(id),
    queryFn: async () => {
      try {
        const response = await fetchGet<ProductionTimelineItem[]>(Endpoint.GET_PRODUCTION_TIMELINE(id));
        return response;
      } catch (error: any) {
        // Timeline endpoint not implemented yet - return empty array
        if (error?.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: false, // Don't retry on 404
  });
};

// Get production analytics
export const useProductionAnalytics = () => {
  return useQuery({
    queryKey: productionTrackingKeys.analytics(),
    queryFn: async () => {
      const response = await fetchGet<ProductionAnalytics>(Endpoint.GET_PRODUCTION_ANALYTICS);
      return response;
    },
  });
};

// Create production
export const useCreateProductionTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductionRequest) => {
      const response = await fetchPost<any, CreateProductionRequest>(
        Endpoint.CREATE_PRODUCTION,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.analytics() });
      toast.success('Production created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create production';
      toast.error(message);
    },
  });
};

// Generate production code
export const useGenerateProductionCode = () => {
  return useMutation({
    mutationFn: async (data: { productCode: string; sizeId: number }) => {
      const response = await fetchPost<{ code: string }, { productCode: string; sizeId: number }>(
        Endpoint.GENERATE_PRODUCTION_CODE,
        data
      );
      return response;
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to generate production code';
      toast.error(message);
    },
  });
};

// Assign tailor to production
export const useAssignTailor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AssignTailorRequest }) => {
      const response = await fetchPost<any, AssignTailorRequest>(
        Endpoint.ASSIGN_TAILOR(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.detail(variables.id) });
      toast.success('Tailor assigned successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to assign tailor';
      toast.error(message);
    },
  });
};

// Update production stage
export const useMoveProductionToStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MoveToStageRequest }) => {
      const response = await fetchPost<any, MoveToStageRequest>(
        Endpoint.UPDATE_PRODUCTION_STAGE(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.detail(variables.id) });
      toast.success('Production stage updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update production stage';
      toast.error(message);
    },
  });
};

// QA Review (Approve/Reject)
export const useQAReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: QAReviewRequest }) => {
      const response = await fetchPost<any, QAReviewRequest>(
        Endpoint.QA_REVIEW(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.detail(variables.id) });
      const status = variables.data.status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Production ${status} successfully`);
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to complete QA review';
      toast.error(message);
    },
  });
};

// Move production to stock
export const useMoveProductionToStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MoveToStockRequest }) => {
      const response = await fetchPost<any, MoveToStockRequest>(
        Endpoint.MOVE_TO_STOCK(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.detail(variables.id) });
      // Also invalidate product stock queries
      queryClient.invalidateQueries({ queryKey: ['product-stocks'] });
      toast.success('Production moved to stock successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to move production to stock';
      toast.error(message);
    },
  });
};

// Send production to bidding (for fancy work)
export const useSendToBidding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SendToBiddingRequest }) => {
      const response = await fetchPost<any, SendToBiddingRequest>(
        Endpoint.SEND_TO_BIDDING(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.detail(variables.id) });
      toast.success('Production sent to bidding for fancy work');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to send production to bidding';
      toast.error(message);
    },
  });
};

// Rework rejected production
export const useReworkProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ReworkProductionRequest }) => {
      const response = await fetchPost<any, ReworkProductionRequest>(
        Endpoint.REWORK_PRODUCTION(id),
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.detail(variables.id) });
      toast.success('Production sent for rework successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to rework production';
      toast.error(message);
    },
  });
};

// Delete production
export const useDeleteProductionTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchDelete<any>(Endpoint.DELETE_PRODUCTION(id));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productionTrackingKeys.analytics() });
      toast.success('Production deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete production';
      toast.error(message);
    },
  });
};
