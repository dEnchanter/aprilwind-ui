import { getUserRoleDetail, getUserPermissions } from '@/utils/storage';

/**
 * Custom hook for permission-based access control
 * Uses actual permissions from backend if available, falls back to role-based checks
 */
export const usePermissions = () => {
  const role = getUserRoleDetail();
  const roleName = role?.name || '';
  const permissions = getUserPermissions();

  /**
   * Check if user has a specific permission
   * @param permission - Permission string to check (e.g., "production:create")
   * @returns boolean indicating if user has the permission
   */
  const hasPermission = (permission: string): boolean => {
    if (permissions.length > 0) {
      return permissions.includes(permission);
    }
    // Fallback to role-based check if no permissions loaded
    return false;
  };

  /**
   * Check if user has any of the specified permissions
   * @param perms - Array of permission strings
   * @returns boolean indicating if user has at least one permission
   */
  const hasAnyPermission = (...perms: string[]): boolean => {
    if (permissions.length > 0) {
      return perms.some(p => permissions.includes(p));
    }
    return false;
  };

  /**
   * Check if user has all of the specified permissions
   * @param perms - Array of permission strings
   * @returns boolean indicating if user has all permissions
   */
  const hasAllPermissions = (...perms: string[]): boolean => {
    if (permissions.length > 0) {
      return perms.every(p => permissions.includes(p));
    }
    return false;
  };

  return {
    // Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // General permissions
    isAdmin: roleName === 'Administrator',
    isManager: roleName === 'Manager',
    isSalesPerson: roleName === 'Sales Person',
    isTailor: roleName === 'Tailor',
    isWarehouseStaff: roleName === 'Warehouse Staff',
    isQAInspector: roleName === 'QA Inspector',
    isAccountant: roleName === 'Accountant',
    isLogistics: roleName === 'Logistics',

    // Feature-specific permissions

    // Raw Materials
    canViewMaterials: ['Administrator', 'Manager', 'Warehouse Staff', 'Tailor'].includes(roleName),
    canManageMaterials: ['Administrator', 'Manager', 'Warehouse Staff'].includes(roleName),
    canAddStock: ['Administrator', 'Manager', 'Warehouse Staff'].includes(roleName),
    canDeleteMaterial: ['Administrator', 'Manager'].includes(roleName),

    // Material Requests
    canViewMaterialRequests: ['Administrator', 'Manager', 'Warehouse Staff', 'Tailor'].includes(roleName),
    canCreateMaterialRequest: ['Tailor', 'Manager'].includes(roleName),
    canApproveMaterialRequest: ['Administrator', 'Manager', 'Warehouse Staff'].includes(roleName),

    // Production
    canViewProduction: ['Administrator', 'Manager', 'QA Inspector', 'Tailor'].includes(roleName),
    canCreateProduction: ['Manager', 'Tailor'].includes(roleName),
    canMoveProductionStage: ['Manager', 'Tailor', 'QA Inspector'].includes(roleName),
    canMoveToStock: ['Administrator', 'Manager', 'QA Inspector'].includes(roleName),

    // Product Stock / Inventory
    canViewInventory: ['Administrator', 'Manager', 'Warehouse Staff', 'Sales Person'].includes(roleName),
    canManageInventory: ['Administrator', 'Manager', 'Warehouse Staff'].includes(roleName),
    canDeleteStock: ['Administrator', 'Manager'].includes(roleName),

    // Customers
    canViewCustomers: ['Administrator', 'Manager', 'Sales Person'].includes(roleName),
    canManageCustomers: ['Administrator', 'Manager', 'Sales Person'].includes(roleName),
    canDeleteCustomer: ['Administrator', 'Manager'].includes(roleName),

    // Invoices
    canViewInvoices: ['Administrator', 'Manager', 'Sales Person', 'Accountant', 'Logistics'].includes(roleName),
    canCreateInvoice: ['Administrator', 'Manager', 'Sales Person'].includes(roleName),
    canMarkAsPaid: ['Administrator', 'Manager', 'Sales Person', 'Accountant'].includes(roleName),
    canPackItems: ['Administrator', 'Manager', 'Warehouse Staff'].includes(roleName),
    canAssignLogistics: ['Administrator', 'Manager', 'Logistics'].includes(roleName),
    canMarkAsDelivered: ['Administrator', 'Manager', 'Logistics'].includes(roleName),
    canCancelInvoice: ['Administrator', 'Manager'].includes(roleName),

    // Production Orders
    canViewProductionOrders: ['Administrator', 'Manager', 'Sales Person'].includes(roleName),
    canCreateProductionOrder: ['Administrator', 'Manager', 'Sales Person'].includes(roleName),
    canApproveOrder: ['Administrator', 'Manager'].includes(roleName),
    canAssignToProduction: ['Manager'].includes(roleName),
    canCompleteOrder: ['Manager', 'QA Inspector'].includes(roleName),
    canDeliverOrder: ['Administrator', 'Manager', 'Logistics'].includes(roleName),
    canCancelOrder: ['Administrator', 'Manager'].includes(roleName),

    // Reports
    canViewReports: ['Administrator', 'Manager', 'Accountant'].includes(roleName),
    canViewProductionReport: ['Administrator', 'Manager'].includes(roleName),
    canViewSalesReport: ['Administrator', 'Manager', 'Accountant'].includes(roleName),
    canViewInventoryReport: ['Administrator', 'Manager', 'Warehouse Staff'].includes(roleName),
    canViewMaterialsReport: ['Administrator', 'Manager', 'Warehouse Staff'].includes(roleName),
    canViewCustomerReport: ['Administrator', 'Manager', 'Sales Person'].includes(roleName),
    canViewStaffReport: ['Administrator', 'Manager'].includes(roleName),
    canViewBusinessReport: ['Administrator', 'Manager', 'Accountant'].includes(roleName),

    // Staff Management
    canViewStaff: ['Administrator', 'Manager'].includes(roleName),
    canManageStaff: ['Administrator', 'Manager'].includes(roleName),
    canDeleteStaff: ['Administrator'].includes(roleName),

    // Roles Management
    canViewRoles: ['Administrator', 'Manager'].includes(roleName),
    canManageRoles: ['Administrator'].includes(roleName),

    // Dashboard
    canViewDashboard: true, // All authenticated users
    canViewKPIs: ['Administrator', 'Manager', 'Accountant'].includes(roleName),

    // User info
    user: role,
    roleName,
    permissions, // Array of permission strings from backend
  };
};
