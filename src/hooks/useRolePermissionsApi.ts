import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Endpoint } from '@/services/api';
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from '@/services/fetcher';
import { toast } from 'sonner';

// Query keys
export const permissionKeys = {
  all: ['permissions'] as const,
  role: (roleId: number) => ['roles', roleId] as const,
};

// Fetch all available permissions (recursive fetch to handle pagination)
export const useAllPermissions = () => {
  return useQuery({
    queryKey: permissionKeys.all,
    queryFn: async () => {
      const allPermissions: Permission[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetchGet<{ data: Permission[]; total?: number; page?: number; limit?: number }>(
          `${Endpoint.GET_PERMISSIONS}?page=${page}&limit=200`
        );

        allPermissions.push(...response.data);

        // Check if there are more pages
        const total = response.total || 0;
        const fetched = page * (response.limit || 200);
        hasMore = fetched < total && response.data.length > 0;
        page++;
      }

      return allPermissions;
    },
  });
};

// Fetch permissions for a specific role (from GET /roles/:id)
export const useRolePermissions = (roleId: number | null) => {
  return useQuery({
    queryKey: roleId ? permissionKeys.role(roleId) : ['permissions', 'none'],
    queryFn: async () => {
      if (!roleId) return [];
      const response = await fetchGet<Role>(Endpoint.GET_ROLE(roleId));
      return response.permissions || [];
    },
    enabled: !!roleId,
  });
};

// Add permission to role (PATCH - keeps existing permissions)
export const useAddPermissionToRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: number; permissionId: number }) => {
      const response = await fetchPatch<unknown, { permissionIds: number[] }>(
        Endpoint.ADD_PERMISSIONS_TO_ROLE(roleId),
        { permissionIds: [permissionId] }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.role(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permission assigned successfully');
    },
    onError: (error: Error) => {
      const message = error?.message || 'Failed to assign permission';
      toast.error(message);
    },
  });
};

// Remove permission from role (DELETE)
export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: number; permissionId: number }) => {
      const response = await fetchDelete<unknown>(
        Endpoint.REMOVE_PERMISSION_FROM_ROLE(roleId, permissionId)
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.role(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permission removed successfully');
    },
    onError: (error: Error) => {
      const message = error?.message || 'Failed to remove permission';
      toast.error(message);
    },
  });
};

// Assign all permissions to role (POST - replaces all existing permissions)
export const useAssignPermissionsToRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => {
      const response = await fetchPost<unknown, { permissionIds: number[] }>(
        Endpoint.ASSIGN_PERMISSIONS_TO_ROLE(roleId),
        { permissionIds }
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.role(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permissions updated successfully');
    },
    onError: (error: Error) => {
      const message = error?.message || 'Failed to update permissions';
      toast.error(message);
    },
  });
};
