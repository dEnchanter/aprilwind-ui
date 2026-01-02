import { getUserPermissions } from './storage';

/**
 * Check if user can perform an action based on permissions
 * Supports single permission, array of permissions (OR logic), or permission config (AND/OR logic)
 *
 * @param requiredPermissions - Permission requirement
 * @param userPermissions - User's permission array (optional, defaults to localStorage)
 * @returns boolean indicating if user has required permissions
 *
 * @example
 * // Single permission
 * canPerformAction('materials:create', userPermissions)
 *
 * @example
 * // Array (OR logic - user needs ANY permission)
 * canPerformAction(['materials:view', 'materials:manage'], userPermissions)
 *
 * @example
 * // Config with AND logic
 * canPerformAction({ allOf: ['reports:view', 'reports:export'] }, userPermissions)
 *
 * @example
 * // Config with OR logic
 * canPerformAction({ anyOf: ['materials:view', 'materials:manage'] }, userPermissions)
 */
export const canPerformAction = (
  requiredPermissions: string | string[] | PermissionConfig,
  userPermissions?: string[]
): boolean => {
  const permissions = userPermissions || getUserPermissions();

  // Handle string (single permission)
  if (typeof requiredPermissions === 'string') {
    return permissions.includes(requiredPermissions);
  }

  // Handle array (user needs ANY permission - OR logic)
  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.some((p) => permissions.includes(p));
  }

  // Handle permission config object
  const { anyOf, allOf } = requiredPermissions;

  // Check AND logic first (more restrictive)
  if (allOf && allOf.length > 0) {
    const hasAll = allOf.every((p) => permissions.includes(p));
    if (!hasAll) return false;
  }

  // Check OR logic
  if (anyOf && anyOf.length > 0) {
    const hasAny = anyOf.some((p) => permissions.includes(p));
    if (!hasAny) return false;
  }

  return true;
};

/**
 * Permission requirement presets for common actions
 * Maps logical action names to backend permission strings
 * Format: module:action (e.g., 'raw-items:create', 'production:update')
 *
 * IMPORTANT: These must match the exact permission strings from the backend
 */
export const PermissionPresets = {
  // Materials (Raw Materials) - Backend uses 'raw-items'
  MATERIALS_VIEW: 'raw-items:read',
  MATERIALS_CREATE: 'raw-items:create',
  MATERIALS_EDIT: 'raw-items:update',
  MATERIALS_DELETE: 'raw-items:delete',
  MATERIALS_ADD_STOCK: 'raw-items:add-stock',
  MATERIALS_ADJUST_STOCK: 'raw-items:adjust-stock',

  // Product Definitions - Backend uses 'product-def'
  PRODUCT_DEFS_VIEW: 'product-def:read',
  PRODUCT_DEFS_CREATE: 'product-def:create',
  PRODUCT_DEFS_EDIT: 'product-def:update',
  PRODUCT_DEFS_DELETE: 'product-def:delete',

  // Material Requests - Backend uses 'material-request' (singular)
  MATERIAL_REQUESTS_VIEW: 'material-request:read',
  MATERIAL_REQUESTS_CREATE: 'material-request:create',
  MATERIAL_REQUESTS_EDIT: 'material-request:update',
  MATERIAL_REQUESTS_DELETE: 'material-request:delete',
  MATERIAL_REQUESTS_APPROVE: 'material-request:approve',
  MATERIAL_REQUESTS_REJECT: 'material-request:reject',
  MATERIAL_REQUESTS_CANCEL: 'material-request:cancel',

  // Production (Production Tracking) - Backend uses 'production' with :read instead of :view
  PRODUCTION_VIEW: 'production:read',
  PRODUCTION_CREATE: 'production:create',
  PRODUCTION_EDIT: 'production:update',
  PRODUCTION_DELETE: 'production:delete',
  PRODUCTION_ASSIGN_TAILOR: 'production:assign',
  PRODUCTION_SUBMIT_QA: 'production:submit-qa',
  PRODUCTION_QA_REVIEW: 'production:qa-review',
  PRODUCTION_REWORK: 'production:rework',
  PRODUCTION_MOVE_TO_STOCK: 'production:move-to-stock',

  // Product For Productions (Production Requests) - Backend uses 'product-for-production' (singular)
  PRODUCT_FOR_PRODUCTION_VIEW: 'product-for-production:read',
  PRODUCT_FOR_PRODUCTION_CREATE: 'product-for-production:create',
  PRODUCT_FOR_PRODUCTION_EDIT: 'product-for-production:update',
  PRODUCT_FOR_PRODUCTION_DELETE: 'product-for-production:delete',

  // Production Orders - Backend uses 'production-order' (singular)
  ORDERS_VIEW: 'production-order:read',
  ORDERS_CREATE: 'production-order:create',
  ORDERS_EDIT: 'production-order:update',
  ORDERS_DELETE: 'production-order:delete',
  ORDERS_APPROVE: 'production-order:approve',
  ORDERS_REJECT: 'production-order:reject',
  ORDERS_ASSIGN_PRODUCTION: 'production-order:create-production',
  ORDERS_COMPLETE: 'production-order:complete',
  ORDERS_DELIVER: 'production-order:deliver',
  ORDERS_CANCEL: 'production-order:cancel',

  // Product Stock (Inventory) - Backend uses 'stock'
  PRODUCT_STOCK_VIEW: 'stock:read',
  PRODUCT_STOCK_CREATE: 'stock:create',
  PRODUCT_STOCK_EDIT: 'stock:update',
  PRODUCT_STOCK_DELETE: 'stock:delete',
  PRODUCT_STOCK_SEARCH: 'stock:search',
  PRODUCT_STOCK_CHECK_AVAILABILITY: 'stock:check-availability',

  // Invoices - Backend uses 'invoice' (singular)
  INVOICES_VIEW: 'invoice:read',
  INVOICES_CREATE: 'invoice:create',
  INVOICES_EDIT: 'invoice:update',
  INVOICES_DELETE: 'invoice:delete',
  INVOICES_MARK_PAID: 'invoice:mark-paid',
  INVOICES_PACK: 'invoice:pack',
  INVOICES_ASSIGN_LOGISTICS: 'invoice:assign-logistics',
  INVOICES_DELIVER: 'invoice:deliver',
  INVOICES_CANCEL: 'invoice:cancel',

  // Staff Management - Backend uses 'staff' with :read instead of :view
  STAFF_VIEW: 'staff:read',
  STAFF_CREATE: 'staff:create',
  STAFF_EDIT: 'staff:update',
  STAFF_DELETE: 'staff:delete',
  STAFF_REGISTER_LOGIN: 'staff:create', // Same as create for register login
  STAFF_ACTIVATE: 'staff:update', // Same as update for activate/deactivate
  STAFF_DEACTIVATE: 'staff:update',

  // Customers - Backend uses 'customers' with :read instead of :view
  CUSTOMERS_VIEW: 'customers:read',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_EDIT: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',

  // Roles Management - Backend uses 'roles' with :read instead of :view
  ROLES_VIEW: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_EDIT: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_MANAGE_PERMISSIONS: 'roles:update', // Assigning permissions is part of update

  // Item Types - Backend uses 'item-type' (singular)
  ITEM_TYPES_VIEW: 'item-type:read',
  ITEM_TYPES_CREATE: 'item-type:create',
  ITEM_TYPES_EDIT: 'item-type:update',
  ITEM_TYPES_DELETE: 'item-type:delete',

  // Customer Types - Backend uses 'customer-type' (singular)
  CUSTOMER_TYPES_VIEW: 'customer-type:read',
  CUSTOMER_TYPES_CREATE: 'customer-type:create',
  CUSTOMER_TYPES_EDIT: 'customer-type:update',
  CUSTOMER_TYPES_DELETE: 'customer-type:delete',

  // Size Definitions - Backend uses 'size-def'
  SIZE_DEFS_VIEW: 'size-def:read',
  SIZE_DEFS_CREATE: 'size-def:create',
  SIZE_DEFS_EDIT: 'size-def:update',
  SIZE_DEFS_DELETE: 'size-def:delete',

  // Reports - Backend uses 'reports'
  REPORTS_VIEW: 'reports:view',
  REPORTS_PRODUCTION: 'reports:production',
  REPORTS_SALES: 'reports:sales',
  REPORTS_INVENTORY: 'reports:inventory',
  REPORTS_MATERIALS: 'reports:materials',
  REPORTS_CUSTOMERS: 'reports:customers',
  REPORTS_PRODUCTION_ORDERS: 'reports:production-orders',
  REPORTS_STAFF_PERFORMANCE: 'reports:staff-performance',
  REPORTS_BUSINESS: 'reports:business',

  // Dashboard - Backend uses 'dashboard'
  DASHBOARD_VIEW: 'dashboard:view',
} as const;
