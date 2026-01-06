// New backend API configuration
export const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-b6841.up.railway.app';

// No API version path in new backend
export const apiVersionPath = '';

// Updated endpoints to match new RESTful API structure
export const Endpoint = {
  // Authentication
  LOGIN: "auth/login",
  REGISTER: "auth/register",
  CHANGE_PASSWORD: "auth/change-password",
  RESET_PASSWORD: (staffId: number) => `auth/${staffId}/reset-password`,
  FORGOT_PASSWORD: "auth/forgot-password",
  RESET_PASSWORD_WITH_TOKEN: "auth/reset-password",
  GET_PROFILE: "auth/profile",
  GET_ME: "auth/me",
  LOGOUT: "auth/logout",
  REFRESH_TOKEN: "auth/refresh",
  ACTIVATE_ACCOUNT: (staffId: number) => `auth/${staffId}/activate`,
  DEACTIVATE_ACCOUNT: (staffId: number) => `auth/${staffId}/deactivate`,

  // Roles
  GET_ROLES: "roles",
  GET_ROLE: (id: number) => `roles/${id}`,
  CREATE_ROLE: "roles",
  UPDATE_ROLE: (id: number) => `roles/${id}`,
  DELETE_ROLE: (id: number) => `roles/${id}`,

  // Permissions
  GET_PERMISSIONS: "permissions",
  ASSIGN_PERMISSIONS_TO_ROLE: (roleId: number) => `roles/${roleId}/permissions`, // POST - replaces all
  ADD_PERMISSIONS_TO_ROLE: (roleId: number) => `roles/${roleId}/permissions`, // PATCH - adds to existing
  REMOVE_PERMISSION_FROM_ROLE: (roleId: number, permissionId: number) => `roles/${roleId}/permissions/${permissionId}`, // DELETE
  GET_ROLE_STAFF: (roleId: number) => `roles/${roleId}/staff`,

  // Staff
  GET_STAFF: "staff",
  GET_STAFF_BY_ID: (id: number) => `staff/${id}`,
  CREATE_STAFF: "staff",
  UPDATE_STAFF: (id: number) => `staff/${id}`,
  DELETE_STAFF: (id: number) => `staff/${id}`,

  // Customers
  GET_CUSTOMERS: "customers",
  GET_CUSTOMER: (id: number) => `customers/${id}`,
  CREATE_CUSTOMER: "customers",
  UPDATE_CUSTOMER: (id: number) => `customers/${id}`,
  DELETE_CUSTOMER: (id: number) => `customers/${id}`,

  // Customer Types
  GET_CUSTOMER_TYPES: "customer-types",
  GET_CUSTOMER_TYPE: (id: number) => `customer-types/${id}`,
  CREATE_CUSTOMER_TYPE: "customer-types",
  UPDATE_CUSTOMER_TYPE: (id: number) => `customer-types/${id}`,
  DELETE_CUSTOMER_TYPE: (id: number) => `customer-types/${id}`,

  // Item Types
  GET_ITEM_TYPES: "item-types",
  GET_ITEM_TYPE: (id: number) => `item-types/${id}`,
  CREATE_ITEM_TYPE: "item-types",
  UPDATE_ITEM_TYPE: (id: number) => `item-types/${id}`,
  DELETE_ITEM_TYPE: (id: number) => `item-types/${id}`,
  ACTIVATE_ITEM_TYPE: (id: number) => `item-types/${id}/activate`,
  DEACTIVATE_ITEM_TYPE: (id: number) => `item-types/${id}/deactivate`,

  // Size Definitions
  GET_SIZE_DEFS: "size-defs",
  GET_SIZE_DEF: (id: number) => `size-defs/${id}`,
  CREATE_SIZE_DEF: "size-defs",
  UPDATE_SIZE_DEF: (id: number) => `size-defs/${id}`,
  DELETE_SIZE_DEF: (id: number) => `size-defs/${id}`,

  // Raw Materials
  GET_RAW_ITEMS: "raw-items",
  GET_RAW_ITEM: (id: number) => `raw-items/${id}`,
  CREATE_RAW_ITEM: "raw-items",
  UPDATE_RAW_ITEM: (id: number) => `raw-items/${id}`,
  DELETE_RAW_ITEM: (id: number) => `raw-items/${id}`,
  GET_RAW_ITEMS_AVAILABLE: "raw-items/available",
  GET_RAW_ITEMS_SUMMARY: "raw-items/summary",
  SEARCH_RAW_ITEMS: "raw-items/search",
  GET_RAW_ITEMS_LOW_STOCK: "raw-items/low-stock",
  GET_RAW_ITEM_AVAILABILITY: (id: number) => `raw-items/availability/${id}`,
  ADD_RAW_ITEM_STOCK: "raw-items/add-stock",
  BULK_ADD_RAW_ITEMS: "raw-items/bulk-add",
  ADJUST_RAW_ITEM_STOCK: "raw-items/adjust-stock",
  GET_RAW_ITEM_ADDITION_HISTORY: (id: number) => `raw-items/${id}/addition-history`,
  GET_RAW_ITEM_TRANSACTIONS: (id: number) => `raw-items/${id}/transactions`,

  // Product Definitions
  GET_PRODUCT_DEFS: "product-defs",
  GET_PRODUCT_DEF: (id: number) => `product-defs/${id}`,
  CREATE_PRODUCT_DEF: "product-defs",
  UPDATE_PRODUCT_DEF: (id: number) => `product-defs/${id}`,
  DELETE_PRODUCT_DEF: (id: number) => `product-defs/${id}`,

  // Product for Production
  GET_PRODUCTS_FOR_PRODUCTION: "products-for-production",
  GET_PRODUCT_FOR_PRODUCTION: (id: number) => `products-for-production/${id}`,
  CREATE_PRODUCT_FOR_PRODUCTION: "products-for-production",
  UPDATE_PRODUCT_FOR_PRODUCTION: (id: number) => `products-for-production/${id}`,
  DELETE_PRODUCT_FOR_PRODUCTION: (id: number) => `products-for-production/${id}`,
  CANCEL_PRODUCT_FOR_PRODUCTION: (id: number) => `products-for-production/${id}/cancel`,
  REACTIVATE_PRODUCT_FOR_PRODUCTION: (id: number) => `products-for-production/${id}/reactivate`,
  // Aliases
  CREATE_PRODUCT_IN_PRODUCTION: "products-for-production",
  UPDATE_PRODUCT_IN_PRODUCTION: (id: number) => `products-for-production/${id}`,

  // Material Requests
  GET_MATERIAL_REQUESTS: "material-requests",
  GET_MATERIAL_REQUEST: (id: number) => `material-requests/${id}`,
  GET_MATERIAL_REQUESTS_BY_PRODUCTION: (productionId: number) => `material-requests/production/${productionId}`,
  CREATE_MATERIAL_REQUEST: "material-requests/create-with-validation",
  UPDATE_MATERIAL_REQUEST: (id: number) => `material-requests/${id}`,
  DELETE_MATERIAL_REQUEST: (id: number) => `material-requests/${id}`,
  CHECK_MATERIAL_AVAILABILITY: "material-requests/check-availability",
  GET_PENDING_MATERIAL_REQUESTS: "material-requests/pending",
  GET_MATERIAL_REQUESTS_BY_REQUESTER: (id: number) => `material-requests/requester/${id}`,
  GET_MATERIAL_REQUEST_TIMELINE: (id: number) => `material-requests/${id}/timeline`,
  GET_MATERIAL_REQUEST_ANALYTICS: "material-requests/analytics",
  APPROVE_MATERIAL_REQUEST: (id: number) => `material-requests/${id}/approve`,
  REJECT_MATERIAL_REQUEST: (id: number) => `material-requests/${id}/reject`,
  CANCEL_MATERIAL_REQUEST: (id: number) => `material-requests/${id}/cancel`,

  // Productions
  GET_PRODUCTIONS: "productions",
  GET_PRODUCTION: (id: number) => `productions/${id}`,
  CREATE_PRODUCTION: "productions",
  UPDATE_PRODUCTION: (id: number) => `productions/${id}`,
  DELETE_PRODUCTION: (id: number) => `productions/${id}`,
  GENERATE_PRODUCTION_CODE: "productions/generate-code",
  GET_PRODUCTIONS_BY_STAGE: (stage: string) => `productions/stage/${stage}`,
  GET_PRODUCTIONS_BY_TAILOR: (tailorId: number) => `productions/tailor/${tailorId}`,
  GET_PRODUCTION_TIMELINE: (id: number) => `productions/${id}/timeline`,
  GET_PRODUCTION_ANALYTICS: "productions/analytics",
  ASSIGN_TAILOR: (id: number) => `productions/${id}/assign`,
  UPDATE_PRODUCTION_STAGE: (id: number) => `productions/${id}/update-stage`,
  QA_REVIEW: (id: number) => `productions/${id}/qa-review`,
  MOVE_TO_STOCK: (id: number) => `productions/${id}/move-to-stock`,
  SEND_TO_BIDDING: (id: number) => `productions/${id}/send-to-bidding`,
  REWORK_PRODUCTION: (id: number) => `productions/${id}/rework`,
  BATCH_UPDATE_PRODUCTIONS: "productions/batch-update",
  // Aliases
  CREATE_PRODUCTION_STAGES: "productions",
  UPDATE_PRODUCTION_STAGES: (id: number) => `productions/${id}/update-stage`,

  // Product Stock
  GET_PRODUCT_STOCKS: "product-stocks",
  GET_PRODUCT_STOCK: (id: number) => `product-stocks/${id}`,
  CREATE_PRODUCT_STOCK: "product-stocks",
  UPDATE_PRODUCT_STOCK: (id: number) => `product-stocks/${id}`,
  DELETE_PRODUCT_STOCK: (id: number) => `product-stocks/${id}`,
  // Aliases
  CREATE_PRODUCTION_STOCK: "product-stocks",
  UPDATE_PRODUCTION_STOCK: (id: number) => `product-stocks/${id}`,
  CREATE_PRODUCT_STOCK_STAGE: "product-stocks",
  UPDATE_PRODUCT_STOCK_STAGE: (id: number) => `product-stocks/${id}`,
  GET_AVAILABLE_PRODUCT_STOCKS: "product-stocks/available",
  GET_PRODUCT_STOCK_SUMMARY: "product-stocks/summary",
  SEARCH_PRODUCT_STOCKS: "product-stocks/search",
  GET_PRODUCT_STOCKS_BY_SIZE: (size: number) => `product-stocks/size/${size}`,
  GET_PRODUCT_STOCK_AVAILABILITY: (productDefId: number) => `product-stocks/availability/${productDefId}`,

  // Invoices
  GET_INVOICES: "invoices",
  GET_INVOICE: (id: number) => `invoices/${id}`,
  CREATE_INVOICE: "invoices/create-with-validation",
  UPDATE_INVOICE: (id: number | string) => `invoices/${id}`,
  CREATE_INVOICE_STAGES: "invoice-stages",
  UPDATE_INVOICE_STAGES: (id: number | string) => `invoice-stages/${id}`,
  GENERATE_INVOICE_NUMBER: "invoices/generate-number",
  GET_CUSTOMER_INVOICES: (customerId: number) => `invoices/customer/${customerId}`,
  GET_INVOICE_TIMELINE: (id: number) => `invoices/${id}/timeline`,
  GET_INVOICE_ANALYTICS: "invoices/analytics",
  CALCULATE_INVOICE_TOTAL: (id: number) => `invoices/${id}/calculate-total`,
  MARK_INVOICE_AS_PAID: (id: number) => `invoices/${id}/mark-as-paid`,
  PACK_INVOICE_ITEMS: (id: number) => `invoices/${id}/pack-items`,
  ASSIGN_INVOICE_LOGISTICS: (id: number) => `invoices/${id}/assign-logistics`,
  MARK_INVOICE_AS_DELIVERED: (id: number) => `invoices/${id}/mark-as-delivered`,
  CANCEL_INVOICE: (id: number) => `invoices/${id}/cancel`,

  // Production Orders
  GET_PRODUCTION_ORDERS: "production-orders",
  GET_PRODUCTION_ORDER: (id: number) => `production-orders/${id}`,
  CREATE_PRODUCTION_ORDER: "production-orders/create-with-validation",
  GENERATE_PRODUCTION_ORDER_NUMBER: "production-orders/generate-number",
  GET_PRODUCTION_ORDERS_BY_STATUS: (status: string) => `production-orders/status/${status}`,
  GET_CUSTOMER_PRODUCTION_ORDERS: (customerId: number) => `production-orders/customer/${customerId}`,
  GET_PRODUCTION_ORDER_TIMELINE: (id: number) => `production-orders/${id}/timeline`,
  GET_PRODUCTION_ORDER_ANALYTICS: "production-orders/analytics",
  APPROVE_PRODUCTION_ORDER: (id: number) => `production-orders/${id}/approve`,
  REJECT_PRODUCTION_ORDER: (id: number) => `production-orders/${id}/reject`,
  CREATE_PRODUCTION_FROM_ORDER: (id: number) => `production-orders/${id}/create-production`,
  COMPLETE_PRODUCTION_ORDER: (id: number) => `production-orders/${id}/complete`,
  DELIVER_PRODUCTION_ORDER: (id: number) => `production-orders/${id}/deliver`,
  CANCEL_PRODUCTION_ORDER: (id: number) => `production-orders/${id}/cancel`,

  // Dashboard
  GET_DASHBOARD_OVERVIEW: "dashboard/overview",
  GET_DASHBOARD_ALERTS: "dashboard/alerts",
  GET_DASHBOARD_ACTIVITIES: "dashboard/activities",
  GET_DASHBOARD_KPIS: "dashboard/kpis",

  // Reports
  GET_PRODUCTION_REPORT: "reports/production",
  GET_SALES_REPORT: "reports/sales",
  GET_INVENTORY_REPORT: "reports/inventory",
  GET_MATERIALS_REPORT: "reports/materials",
  GET_CUSTOMERS_REPORT: "reports/customers",
  GET_PRODUCTION_ORDERS_REPORT: "reports/production-orders",
  GET_STAFF_REPORT: "reports/staff",
  GET_BUSINESS_REPORT: "reports/business",
};