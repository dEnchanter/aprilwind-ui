'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Search, X } from 'lucide-react';
import {
  useAllPermissions,
  useRolePermissions,
  useAddPermissionToRole,
  useRemovePermissionFromRole,
} from '@/hooks/useRolePermissionsApi';
import { Skeleton } from '@/components/ui/skeleton';

interface RolePermissionsDialogProps {
  role: Role | null;
  open: boolean;
  onClose: () => void;
}

export function RolePermissionsDialog({ role, open, onClose }: RolePermissionsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all available permissions
  const { data: allPermissions = [], isLoading: loadingAll } = useAllPermissions();

  // Fetch permissions for this role
  const { data: rolePermissions = [], isLoading: loadingRole } = useRolePermissions(role?.id || null);

  // Mutations
  const addPermission = useAddPermissionToRole();
  const removePermission = useRemovePermissionFromRole();

  // Get IDs of permissions already assigned to this role
  const assignedPermissionIds = new Set(rolePermissions.map(p => p.id));

  // Filter permissions based on search
  const filteredPermissions = allPermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group permissions by module (based on name prefix like "production:", "invoice:", etc.)
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const permissionModule = permission.name.split(':')[0] || 'other';
    if (!acc[permissionModule]) {
      acc[permissionModule] = [];
    }
    acc[permissionModule].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleTogglePermission = async (permission: Permission) => {
    if (!role) return;

    const isAssigned = assignedPermissionIds.has(permission.id);

    if (isAssigned) {
      await removePermission.mutateAsync({
        roleId: role.id,
        permissionId: permission.id,
      });
    } else {
      await addPermission.mutateAsync({
        roleId: role.id,
        permissionId: permission.id,
      });
    }
  };

  const isLoading = loadingAll || loadingRole;
  const isPending = addPermission.isPending || removePermission.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-700" />
            Manage Permissions for {role?.name}
          </DialogTitle>
          <DialogDescription>
            Assign or remove permissions for this role. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Permissions Count */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-600">
              {rolePermissions.length} of {allPermissions.length} permissions assigned
            </div>
            <Badge variant="secondary">
              {Object.keys(groupedPermissions).length} modules
            </Badge>
          </div>

          {/* Permissions List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full rounded-md border p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-2 pl-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, permissions]) => (
                  <div key={module} className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-900 capitalize flex items-center gap-2">
                      {module}
                      <Badge variant="secondary" className="text-xs">
                        {permissions.length}
                      </Badge>
                    </h3>

                    <div className="space-y-2 pl-4">
                      {permissions.map((permission) => {
                        const isAssigned = assignedPermissionIds.has(permission.id);

                        return (
                          <div
                            key={permission.id}
                            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                          >
                            <Checkbox
                              checked={isAssigned}
                              onCheckedChange={() => handleTogglePermission(permission)}
                              disabled={isPending}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{permission.name}</span>
                                {isAssigned && (
                                  <Badge variant="default" className="text-xs">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    Assigned
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{permission.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {filteredPermissions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No permissions found matching &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
            <div className="text-sm text-gray-500">
              {isPending && <span>Updating permissions...</span>}
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
