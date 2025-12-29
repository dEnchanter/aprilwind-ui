// Date parameter interface
interface DateParams {
  startDate?: string;
  endDate?: string;
}

// Production Report Types
interface ProductionReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalProductions: number;
    completed: number;
    inProgress: number;
    awaitingQA: number;
    rejected: number;
    completionRate: string;
  };
  byStage: Record<string, number>;
  performance: {
    averageProductionTime: string;
    tailorPerformance: Array<{
      tailorId: number;
      total: number;
      completed: number;
      inProgress: number;
    }>;
  };
}

// Sales Report Types
interface SalesReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalInvoices: number;
    totalRevenue: string;
    averageOrderValue: string;
  };
  revenueByStatus: Record<string, string>;
  topCustomers: Array<{
    customerId: number;
    customerName: string;
    totalSpent: string;
    invoiceCount: number;
  }>;
  salesTrend: Array<{
    period: string;
    revenue: string;
    invoiceCount: number;
  }>;
}

// Inventory Report Types
interface InventoryReportData {
  summary: {
    totalProducts: number;
    totalStock: number;
    availableStock: number;
    soldStock: number;
    turnoverRate: string;
  };
  byProduct: Array<{
    productName: string;
    total: number;
    available: number;
    sold: number;
    sizes: Record<string, number>;
  }>;
  alerts: {
    lowStock: Array<{
      productName: string;
      total: number;
      available: number;
      sold: number;
      sizes: Record<string, number>;
    }>;
  };
}

// Materials Report Types
interface MaterialsReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalMaterials: number;
    totalAdditions: number;
    totalRemovals: number;
    lowStockCount: number;
  };
  topUsedMaterials: Array<{
    id: number;
    name: string;
    totalUsed: number;
    code: string;
  }>;
  materialAdditions: Array<{
    id: number;
    name: string;
    quantity: number;
    code: string;
    date: string;
  }>;
  lowStockItems: Array<{
    id: number;
    name: string;
    quantity: number;
    code: string;
  }>;
}

// Customers Report Types
interface CustomersReportData {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    totalRevenue: string;
  };
  topCustomers: Array<{
    customerId: number;
    customerName: string;
    totalSpent: string;
    invoiceCount: number;
    email?: string;
    phone?: string;
  }>;
  distribution: {
    byType: Record<string, number>;
    byCountry: Record<string, number>;
  };
}

// Production Orders Report Types
interface ProductionOrdersReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalOrders: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  revenue: {
    completed: string;
    pending: string;
  };
  performance: {
    averageProcessingTime: string;
    deliveryPerformance: {
      totalDelivered: number;
      onTime: number;
      late: number;
      onTimeRate: string;
    };
  };
}

// Staff Report Types
interface StaffReportData {
  summary: {
    totalStaff: number;
    activeStaff: number;
    byRole: Record<string, number>;
  };
  topStaff: Array<{
    staffId: number;
    staffName: string;
    role: string;
    totalActivities: number;
    productionActivity: number;
    invoiceActivity: number;
    materialActivity: number;
  }>;
  allStaff: Array<{
    staffId: number;
    staffName: string;
    role: string;
    totalActivities: number;
    productionActivity: number;
    invoiceActivity: number;
    materialActivity: number;
  }>;
}

// Business Report Types (Comprehensive)
interface BusinessReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  production: {
    totalProductions: number;
    completed: number;
    inProgress: number;
    awaitingQA: number;
    rejected: number;
    completionRate: string;
  };
  sales: {
    totalInvoices: number;
    totalRevenue: string;
    averageOrderValue: string;
  };
  inventory: {
    totalProducts: number;
    totalStock: number;
    availableStock: number;
    soldStock: number;
    turnoverRate: string;
  };
  materials: {
    totalMaterials: number;
    totalAdditions: number;
    totalRemovals: number;
    lowStockCount: number;
  };
  customers: {
    totalCustomers: number;
    activeCustomers: number;
    totalRevenue: string;
  };
  productionOrders: {
    totalOrders: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  staff: {
    totalStaff: number;
    activeStaff: number;
    byRole: Record<string, number>;
  };
}
