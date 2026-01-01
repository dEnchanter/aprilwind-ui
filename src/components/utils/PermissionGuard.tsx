"use client"

import { usePermissions } from '@/hooks/usePermissions';
import { canPerformAction } from '@/utils/permissions';

/**
 * Wrapper component that conditionally renders children based on permissions
 *
 * @example
 * // Simple usage - single permission
 * <PermissionGuard permissions="materials:create">
 *   <Button>Add Material</Button>
 * </PermissionGuard>
 *
 * @example
 * // OR logic - user needs ANY permission
 * <PermissionGuard permissions={["materials:create", "materials:manage"]}>
 *   <Button>Add Material</Button>
 * </PermissionGuard>
 *
 * @example
 * // AND logic - user needs ALL permissions
 * <PermissionGuard permissions={{ allOf: ["materials:view", "materials:export"] }}>
 *   <Button>Export Materials</Button>
 * </PermissionGuard>
 *
 * @example
 * // Show to all authenticated users
 * <PermissionGuard allowAll>
 *   <DashboardWidget />
 * </PermissionGuard>
 *
 * @example
 * // With fallback component
 * <PermissionGuard
 *   permissions="admin:access"
 *   fallback={<p>Access denied</p>}
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  fallback = null,
  allowAll = false,
}) => {
  const { permissions: userPermissions } = usePermissions();

  // Show to all if allowAll is true
  if (allowAll) {
    return <>{children}</>;
  }

  // If no permissions specified, hide by default (security-first approach)
  if (!permissions) {
    return <>{fallback}</>;
  }

  // Check if user has required permissions
  const hasAccess = canPerformAction(permissions, userPermissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
