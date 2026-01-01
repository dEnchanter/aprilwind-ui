"use client"

import { usePermissions } from './usePermissions';
import { canPerformAction } from '@/utils/permissions';

/**
 * Hook for imperative permission checking
 * Use when you need to check permissions in event handlers or effects
 *
 * @returns Object with permission checking functions and user permissions array
 *
 * @example
 * const { can, cannot } = usePermissionCheck();
 *
 * const handleClick = () => {
 *   if (can('materials:create')) {
 *     // Perform action
 *     setShowDialog(true);
 *   } else {
 *     toast.error('You do not have permission to perform this action');
 *   }
 * };
 *
 * @example
 * // Check multiple permissions (OR logic)
 * if (can(['materials:create', 'materials:manage'])) {
 *   // User has at least one of these permissions
 * }
 *
 * @example
 * // Check with AND logic
 * if (can({ allOf: ['reports:view', 'reports:export'] })) {
 *   // User has both permissions
 * }
 *
 * @example
 * // Filter tabs based on permissions
 * const visibleTabs = allTabs.filter(tab => can(tab.permission));
 */
export const usePermissionCheck = () => {
  const { permissions } = usePermissions();

  /**
   * Check if user can perform an action
   * @param requiredPermissions - Permission requirement (string, array, or config)
   * @returns boolean indicating if user has required permissions
   */
  const can = (requiredPermissions: string | string[] | PermissionConfig): boolean => {
    return canPerformAction(requiredPermissions, permissions);
  };

  /**
   * Check if user cannot perform an action (inverse of can)
   * @param requiredPermissions - Permission requirement (string, array, or config)
   * @returns boolean indicating if user lacks required permissions
   */
  const cannot = (requiredPermissions: string | string[] | PermissionConfig): boolean => {
    return !can(requiredPermissions);
  };

  return { can, cannot, permissions };
};
