import { exportToExcel } from './exportToExcel';

// Generic report export function
export const exportReportToExcel = <T extends Record<string, unknown>>(
  data: T,
  reportType: string,
  dateRange: { startDate: string; endDate: string; label: string }
) => {
  const { startDate, endDate } = dateRange;
  const dateRangeText = startDate && endDate
    ? `${startDate}_to_${endDate}`
    : 'all_time';

  const filename = `${reportType}_report_${dateRangeText}`;

  // Transform complex nested data into flat rows for Excel
  const flatData = transformReportDataForExport(data, reportType);

  // Generate headers based on first data row
  const headers = flatData.length > 0 ? Object.keys(flatData[0]) : [];

  exportToExcel({
    data: flatData,
    header: headers,
    filename
  });
};

// Transform different report types to Excel-friendly format
const transformReportDataForExport = (data: unknown, reportType: string): Array<Record<string, unknown>> => {
  switch (reportType) {
    case 'production':
      return transformProductionReport(data as ProductionReportData);
    case 'sales':
      return transformSalesReport(data as SalesReportData);
    case 'inventory':
      return transformInventoryReport(data as InventoryReportData);
    case 'materials':
      return transformMaterialsReport(data as MaterialsReportData);
    case 'customers':
      return transformCustomersReport(data as CustomersReportData);
    case 'production-orders':
      return transformProductionOrdersReport(data as ProductionOrdersReportData);
    case 'staff':
      return transformStaffReport(data as StaffReportData);
    case 'business':
      return transformBusinessReport(data as BusinessReportData);
    default:
      return [];
  }
};

// Production Report Transformer
const transformProductionReport = (data: ProductionReportData): Array<Record<string, unknown>> => {
  const summaryRows = [
    { Section: 'SUMMARY', Metric: 'Total Productions', Value: data.summary.totalProductions },
    { Section: 'SUMMARY', Metric: 'Completed', Value: data.summary.completed },
    { Section: 'SUMMARY', Metric: 'In Progress', Value: data.summary.inProgress },
    { Section: 'SUMMARY', Metric: 'Awaiting QA', Value: data.summary.awaitingQA },
    { Section: 'SUMMARY', Metric: 'Rejected', Value: data.summary.rejected },
    { Section: 'SUMMARY', Metric: 'Completion Rate', Value: data.summary.completionRate },
    { Section: 'SUMMARY', Metric: 'Average Production Time', Value: data.performance.averageProductionTime },
    {},
  ];

  const stageRows = Object.entries(data.byStage).map(([stage, count]) => ({
    Section: 'BY STAGE',
    Stage: stage,
    Count: count
  }));

  const tailorRows = data.performance.tailorPerformance.map(tailor => ({
    Section: 'TAILOR PERFORMANCE',
    'Tailor ID': tailor.tailorId,
    'Total Assigned': tailor.total,
    'Completed': tailor.completed,
    'In Progress': tailor.inProgress
  }));

  return [...summaryRows, ...stageRows, {}, ...tailorRows];
};

// Sales Report Transformer
const transformSalesReport = (data: SalesReportData): Array<Record<string, unknown>> => {
  const summaryRows = [
    { Section: 'SUMMARY', Metric: 'Total Revenue', Value: data.summary.totalRevenue },
    { Section: 'SUMMARY', Metric: 'Total Invoices', Value: data.summary.totalInvoices },
    { Section: 'SUMMARY', Metric: 'Average Order Value', Value: data.summary.averageOrderValue },
    {},
  ];

  const revenueRows = Object.entries(data.revenueByStatus).map(([status, revenue]) => ({
    Section: 'REVENUE BY STATUS',
    Status: status,
    Revenue: revenue
  }));

  const customerRows = data.topCustomers.map(customer => ({
    Section: 'TOP CUSTOMERS',
    'Customer Name': customer.customerName,
    'Total Spent': customer.totalSpent,
    'Invoice Count': customer.invoiceCount
  }));

  return [...summaryRows, ...revenueRows, {}, ...customerRows];
};

// Inventory Report Transformer
const transformInventoryReport = (data: InventoryReportData): Array<Record<string, unknown>> => {
  const summaryRows = [
    { Section: 'SUMMARY', Metric: 'Total Products', Value: data.summary.totalProducts },
    { Section: 'SUMMARY', Metric: 'Total Stock', Value: data.summary.totalStock },
    { Section: 'SUMMARY', Metric: 'Available Stock', Value: data.summary.availableStock },
    { Section: 'SUMMARY', Metric: 'Sold Stock', Value: data.summary.soldStock },
    { Section: 'SUMMARY', Metric: 'Turnover Rate', Value: data.summary.turnoverRate },
    {},
  ];

  const productRows = data.byProduct.map(product => ({
    Section: 'PRODUCTS',
    'Product Name': product.productName,
    'Total Stock': product.total,
    'Available': product.available,
    'Sold': product.sold,
    'Sizes': Object.entries(product.sizes).map(([size, qty]) => `${size}:${qty}`).join(', ')
  }));

  const lowStockRows = data.alerts?.lowStock?.map(item => ({
    Section: 'LOW STOCK ALERTS',
    'Product Name': item.productName,
    'Total': item.total,
    'Available': item.available,
    'Sold': item.sold
  })) || [];

  return [...summaryRows, ...productRows, {}, ...lowStockRows];
};

// Materials Report Transformer
const transformMaterialsReport = (data: MaterialsReportData): Array<Record<string, unknown>> => {
  const summaryRows = [
    { Section: 'SUMMARY', Metric: 'Total Materials', Value: data.summary.totalMaterials },
    { Section: 'SUMMARY', Metric: 'Total Additions', Value: data.summary.totalAdditions },
    { Section: 'SUMMARY', Metric: 'Total Removals', Value: data.summary.totalRemovals },
    { Section: 'SUMMARY', Metric: 'Low Stock Count', Value: data.summary.lowStockCount },
    {},
  ];

  const lowStockRows = data.lowStockItems.map(item => ({
    Section: 'LOW STOCK ITEMS',
    'Material Name': item.name,
    'Code': item.code,
    'Quantity': item.quantity
  }));

  const topUsedRows = data.topUsedMaterials.map(material => ({
    Section: 'TOP USED MATERIALS',
    'Material Name': material.name,
    'Code': material.code,
    'Total Used': material.totalUsed
  }));

  return [...summaryRows, ...lowStockRows, {}, ...topUsedRows];
};

// Customers Report Transformer
const transformCustomersReport = (data: CustomersReportData): Array<Record<string, unknown>> => {
  const summaryRows = [
    { Section: 'SUMMARY', Metric: 'Total Customers', Value: data.summary.totalCustomers },
    { Section: 'SUMMARY', Metric: 'Active Customers', Value: data.summary.activeCustomers },
    { Section: 'SUMMARY', Metric: 'Total Revenue', Value: data.summary.totalRevenue },
    {},
  ];

  const typeRows = Object.entries(data.distribution.byType).map(([type, count]) => ({
    Section: 'DISTRIBUTION BY TYPE',
    Type: type,
    Count: count
  }));

  const countryRows = Object.entries(data.distribution.byCountry).map(([country, count]) => ({
    Section: 'DISTRIBUTION BY COUNTRY',
    Country: country,
    Count: count
  }));

  const customerRows = data.topCustomers.map(customer => ({
    Section: 'TOP CUSTOMERS',
    'Name': customer.customerName,
    'Total Spent': customer.totalSpent,
    'Invoice Count': customer.invoiceCount
  }));

  return [...summaryRows, ...typeRows, {}, ...countryRows, {}, ...customerRows];
};

// Production Orders Report Transformer
const transformProductionOrdersReport = (data: ProductionOrdersReportData): Array<Record<string, unknown>> => {
  const summaryRows = [
    { Section: 'SUMMARY', Metric: 'Total Orders', Value: data.summary.totalOrders },
    { Section: 'SUMMARY', Metric: 'Completed Revenue', Value: data.revenue.completed },
    { Section: 'SUMMARY', Metric: 'Pending Revenue', Value: data.revenue.pending },
    { Section: 'SUMMARY', Metric: 'Average Processing Time', Value: data.performance.averageProcessingTime },
    {},
  ];

  const statusRows = Object.entries(data.summary.byStatus).map(([status, count]) => ({
    Section: 'BY STATUS',
    Status: status,
    Count: count
  }));

  const priorityRows = Object.entries(data.summary.byPriority).map(([priority, count]) => ({
    Section: 'BY PRIORITY',
    Priority: priority,
    Count: count
  }));

  const deliveryRows = [
    { Section: 'DELIVERY PERFORMANCE', Metric: 'Total Delivered', Value: data.performance.deliveryPerformance.totalDelivered },
    { Section: 'DELIVERY PERFORMANCE', Metric: 'On Time', Value: data.performance.deliveryPerformance.onTime },
    { Section: 'DELIVERY PERFORMANCE', Metric: 'Late', Value: data.performance.deliveryPerformance.late },
    { Section: 'DELIVERY PERFORMANCE', Metric: 'On-Time Rate', Value: data.performance.deliveryPerformance.onTimeRate },
  ];

  return [...summaryRows, ...statusRows, {}, ...priorityRows, {}, ...deliveryRows];
};

// Staff Report Transformer
const transformStaffReport = (data: StaffReportData): Array<Record<string, unknown>> => {
  const summaryRows = [
    { Section: 'SUMMARY', Metric: 'Total Staff', Value: data.summary.totalStaff },
    { Section: 'SUMMARY', Metric: 'Active Staff', Value: data.summary.activeStaff },
    {},
  ];

  const roleRows = Object.entries(data.summary.byRole).map(([role, count]) => ({
    Section: 'BY ROLE',
    Role: role,
    Count: count
  }));

  const staffRows = data.allStaff.map(staff => ({
    Section: 'STAFF ACTIVITY',
    'Staff Name': staff.staffName,
    'Role': staff.role,
    'Total Activities': staff.totalActivities,
    'Production Activity': staff.productionActivity,
    'Invoice Activity': staff.invoiceActivity,
    'Material Activity': staff.materialActivity
  }));

  return [...summaryRows, ...roleRows, {}, ...staffRows];
};

// Business Report Transformer
const transformBusinessReport = (data: BusinessReportData): Array<Record<string, unknown>> => {
  const rows = [
    { Section: 'PRODUCTION', Metric: 'Total Productions', Value: data.production.totalProductions },
    { Section: 'PRODUCTION', Metric: 'Completed', Value: data.production.completed },
    { Section: 'PRODUCTION', Metric: 'In Progress', Value: data.production.inProgress },
    { Section: 'PRODUCTION', Metric: 'Completion Rate', Value: data.production.completionRate },
    {},
    { Section: 'SALES', Metric: 'Total Invoices', Value: data.sales.totalInvoices },
    { Section: 'SALES', Metric: 'Total Revenue', Value: data.sales.totalRevenue },
    { Section: 'SALES', Metric: 'Average Order Value', Value: data.sales.averageOrderValue },
    {},
    { Section: 'INVENTORY', Metric: 'Total Products', Value: data.inventory.totalProducts },
    { Section: 'INVENTORY', Metric: 'Total Stock', Value: data.inventory.totalStock },
    { Section: 'INVENTORY', Metric: 'Available Stock', Value: data.inventory.availableStock },
    { Section: 'INVENTORY', Metric: 'Turnover Rate', Value: data.inventory.turnoverRate },
    {},
    { Section: 'MATERIALS', Metric: 'Total Materials', Value: data.materials.totalMaterials },
    { Section: 'MATERIALS', Metric: 'Low Stock Count', Value: data.materials.lowStockCount },
    {},
    { Section: 'CUSTOMERS', Metric: 'Total Customers', Value: data.customers.totalCustomers },
    { Section: 'CUSTOMERS', Metric: 'Active Customers', Value: data.customers.activeCustomers },
    {},
    { Section: 'STAFF', Metric: 'Total Staff', Value: data.staff.totalStaff },
    { Section: 'STAFF', Metric: 'Active Staff', Value: data.staff.activeStaff },
  ];

  return rows;
};
