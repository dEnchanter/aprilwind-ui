import { LucideIcon } from 'lucide-react';

export interface DashboardOverview {
  production: {
    total: number;
    active: number;
    completed: number;
    completionRate: string;
  };
  sales: {
    totalInvoices: number;
    open: number;
    paid: number;
    delivered: number;
    totalRevenue: string;
    averageOrderValue: string;
  };
  materials: {
    pendingRequests: number;
    approvedRequests: number;
    totalRawMaterials: number;
    lowStockMaterials: number;
  };
  inventory: {
    totalProductStock: number;
    availableStock: number;
    soldStock: number;
    availabilityRate: string;
  };
}

export interface DashboardAlert {
  type: string;
  severity: 'error' | 'warning' | 'info';
  count: number;
  message: string;
  action: string;
  link?: string;
  items?: Array<{
    id: number;
    name: string;
    currentQty: number;
  }>;
}

export interface DashboardAlertsResponse {
  totalAlerts: number;
  alerts: DashboardAlert[];
}

export interface DashboardActivity {
  type: string;
  action: string;
  details: {
    productionId?: number;
    productionCode?: string;
    stage?: string;
    requestId?: number;
    status?: string;
    notes?: string;
    [key: string]: string | number | undefined;
  };
  performedBy: string;
  timestamp: string;
}

export interface DashboardActivitiesResponse {
  total: number;
  activities: DashboardActivity[];
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  loading?: boolean;
  index?: number;
}
