import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Factory,
  Box,
  ClipboardCheck,
  FileText,
  BarChart3,
  UserCog,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;

  // BACKWARD COMPATIBLE: Keep roles for migration period
  roles?: string[];

  // NEW: Permission-based access control
  permissions?: {
    anyOf?: string[]; // OR logic: user needs ANY of these permissions
    allOf?: string[]; // AND logic: user needs ALL of these permissions
  };

  // Show to all authenticated users (overrides permissions/roles)
  requiresAuth?: boolean;

  children?: NavigationItem[];
}

/**
 * Navigation configuration with permission-based access control
 * Updated to use permissions instead of roles
 */
export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    permissions: {
      anyOf: ['dashboard:view'],
    },
    roles: ['ALL'], // Fallback for backward compatibility
  },
  {
    label: 'Items Management',
    path: '/items-management',
    icon: Package,
    permissions: {
      anyOf: ['raw-items:read', 'item-type:read'],
    },
    roles: ['Administrator', 'Manager', 'Warehouse Staff'], // Fallback
  },
  {
    label: 'Material Requests',
    path: '/material-request',
    icon: ClipboardList,
    permissions: {
      anyOf: ['material-request:read'],
    },
    roles: ['Administrator', 'Manager', 'Warehouse Staff', 'Tailor'], // Fallback
  },
  {
    label: 'Production',
    path: '/production-management',
    icon: Factory,
    permissions: {
      anyOf: ['product-def:read', 'product-for-production:read', 'production:read'],
    },
    roles: ['Administrator', 'Manager', 'QA Inspector', 'Tailor'], // Fallback
  },
  {
    label: 'Production Orders',
    path: '/production-orders',
    icon: ClipboardCheck,
    permissions: {
      anyOf: ['production-order:read'],
    },
    roles: ['Administrator', 'Manager', 'Sales Person'], // Fallback
  },
  {
    label: 'Product Stock',
    path: '/product-stock',
    icon: Box,
    permissions: {
      anyOf: ['stock:read'],
    },
    roles: ['Administrator', 'Manager', 'Warehouse Staff', 'Sales Person', 'Logistics'], // Fallback
  },
  {
    label: 'Invoices',
    path: '/invoice-management',
    icon: FileText,
    permissions: {
      anyOf: ['invoice:read'],
    },
    roles: ['Administrator', 'Manager', 'Sales Person', 'Accountant', 'Logistics'], // Fallback
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    permissions: {
      anyOf: ['reports:view'],
    },
    roles: ['Administrator', 'Manager', 'Accountant'], // Fallback
  },
  {
    label: 'User Management',
    path: '/user-management',
    icon: UserCog,
    permissions: {
      anyOf: ['staff:read', 'customers:read'],
    },
    roles: ['Administrator', 'Manager'], // Fallback
  },
  {
    label: 'Configurations',
    path: '/configurations',
    icon: Settings,
    permissions: {
      anyOf: ['roles:read', 'customer-type:read', 'item-type:read', 'size-def:read'],
    },
    roles: ['Administrator'], // Fallback
  },
];

/**
 * Filter navigation items based on user role
 * @param items - Navigation items to filter
 * @param userRole - Current user's role name
 * @returns Filtered navigation items
 */
export const filterNavigationByRole = (
  items: NavigationItem[],
  userRole: string | null | undefined
): NavigationItem[] => {
  if (!userRole) return [];

  return items.filter((item) => {
    // Allow items with 'ALL' role for all authenticated users
    if (item.roles?.includes('ALL')) {
      return true;
    }

    // Check if user's role is in the allowed roles
    return item.roles?.includes(userRole) || false;
  });
};

/**
 * Check if user has access to a navigation item based on permissions
 * Falls back to role-based check if permissions not configured
 *
 * @param item - Navigation item to check
 * @param permissions - User's permission strings array
 * @param roleName - User's role name (for fallback)
 * @returns Boolean indicating if user has access
 */
export const hasNavigationAccess = (
  item: NavigationItem,
  permissions: string[],
  roleName?: string
): boolean => {
  // Special case: items marked as visible to all authenticated users
  if (item.requiresAuth) {
    return true;
  }

  // NEW: Permission-based check (preferred)
  if (item.permissions) {
    const { anyOf, allOf } = item.permissions;

    // Check AND logic (user must have ALL permissions)
    if (allOf && allOf.length > 0) {
      const hasAllPermissions = allOf.every((p) => permissions.includes(p));
      if (!hasAllPermissions) return false;
    }

    // Check OR logic (user must have ANY permission)
    if (anyOf && anyOf.length > 0) {
      const hasAnyPermission = anyOf.some((p) => permissions.includes(p));
      if (!hasAnyPermission) return false;
    }

    // If only allOf was specified and passed, allow access
    // If both were specified, both must pass (AND takes precedence)
    return true;
  }

  // FALLBACK: Role-based check (for backward compatibility)
  if (item.roles && item.roles.length > 0) {
    if (item.roles.includes('ALL')) return true;
    return roleName ? item.roles.includes(roleName) : false;
  }

  // Default: deny access if no restrictions specified (security-first)
  return false;
};

/**
 * Filter navigation items based on user permissions
 * @param items - Navigation items to filter
 * @param permissions - User's permission strings array
 * @param roleName - User's role name (for backward compatibility)
 * @returns Filtered navigation items
 */
export const filterNavigationByPermissions = (
  items: NavigationItem[],
  permissions: string[],
  roleName?: string
): NavigationItem[] => {
  return items.filter((item) => hasNavigationAccess(item, permissions, roleName));
};

/**
 * Check if a user has access to a specific route
 * @param path - Route path to check
 * @param userRole - Current user's role name
 * @returns Boolean indicating access permission
 */
export const hasAccessToRoute = (
  path: string,
  userRole: string | null | undefined
): boolean => {
  if (!userRole) return false;

  const item = navigationItems.find((item) => item.path === path);

  if (!item) return true; // Allow access to routes not in navigation config

  if (item.roles && item.roles.includes('ALL')) return true;

  return item.roles ? item.roles.includes(userRole) : false;
};
