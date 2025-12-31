import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Endpoint } from "@/services/api";
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from "@/services/fetcher";
import { SizeDef, CreateSizeDefDTO, UpdateSizeDefDTO } from "@/types/size-def";
import { toast } from "sonner";

// Query Keys
export const sizeDefKeys = {
  all: ["sizeDefs"] as const,
  lists: () => [...sizeDefKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...sizeDefKeys.lists(), params] as const,
  details: () => [...sizeDefKeys.all, "detail"] as const,
  detail: (id: number) => [...sizeDefKeys.details(), id] as const,
};

// Get all size definitions
export const useSizeDefs = (params?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: sizeDefKeys.list(params),
    queryFn: () => fetchGet<{ data: SizeDef[]; total: number }>(Endpoint.GET_SIZE_DEFS),
    enabled: params?.enabled !== false,
  });
};

// Get single size definition
export const useSizeDef = (id: number) => {
  return useQuery({
    queryKey: sizeDefKeys.detail(id),
    queryFn: () => fetchGet<SizeDef>(Endpoint.GET_SIZE_DEF(id)),
    enabled: !!id,
  });
};

// Create size definition
export const useCreateSizeDef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSizeDefDTO) =>
      fetchPost<SizeDef, CreateSizeDefDTO>(Endpoint.CREATE_SIZE_DEF, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sizeDefKeys.lists() });
      toast.success("Size definition created successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create size definition");
    },
  });
};

// Update size definition
export const useUpdateSizeDef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSizeDefDTO }) =>
      fetchPatch<SizeDef, UpdateSizeDefDTO>(Endpoint.UPDATE_SIZE_DEF(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sizeDefKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sizeDefKeys.detail(variables.id) });
      toast.success("Size definition updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update size definition");
    },
  });
};

// Delete size definition
export const useDeleteSizeDef = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => fetchDelete(Endpoint.DELETE_SIZE_DEF(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sizeDefKeys.lists() });
      toast.success("Size definition deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete size definition");
    },
  });
};
