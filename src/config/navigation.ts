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
  roles: string[];
  children?: NavigationItem[];
}

/**
 * Navigation configuration with role-based access control
 * Based on RBAC Permissions Guide
 */
export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['ALL'], // All authenticated users
  },
  {
    label: 'Items Management',
    path: '/items-management',
    icon: Package,
    roles: ['Administrator', 'Manager', 'Warehouse Staff'],
  },
  {
    label: 'Material Requests',
    path: '/material-request',
    icon: ClipboardList,
    roles: ['Administrator', 'Manager', 'Warehouse Staff', 'Tailor'],
  },
  {
    label: 'Production',
    path: '/production-management',
    icon: Factory,
    roles: ['Administrator', 'Manager', 'QA Inspector', 'Tailor'],
  },
  {
    label: 'Production Orders',
    path: '/production-orders',
    icon: ClipboardCheck,
    roles: ['Administrator', 'Manager', 'Sales Person'],
  },
  {
    label: 'Product Stock',
    path: '/product-stock',
    icon: Box,
    roles: ['Administrator', 'Manager', 'Warehouse Staff', 'Sales Person', 'Logistics'],
  },
  {
    label: 'Invoices',
    path: '/invoice-management',
    icon: FileText,
    roles: ['Administrator', 'Manager', 'Sales Person', 'Accountant', 'Logistics'],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['Administrator', 'Manager', 'Accountant'],
  },
  {
    label: 'User Management',
    path: '/user-management',
    icon: UserCog,
    roles: ['Administrator', 'Manager'],
  },
  {
    label: 'Configurations',
    path: '/configurations',
    icon: Settings,
    roles: ['Administrator'],
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
    if (item.roles.includes('ALL')) {
      return true;
    }

    // Check if user's role is in the allowed roles
    return item.roles.includes(userRole);
  });
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

  if (item.roles.includes('ALL')) return true;

  return item.roles.includes(userRole);
};
