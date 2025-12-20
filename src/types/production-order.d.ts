/* eslint-disable @typescript-eslint/no-explicit-any */

// Production Order Status Types
export type ProductionOrderStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_production'
  | 'completed'
  | 'delivered'
  | 'cancelled';

// Order Priority Types
export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

// Order Detail Item
export interface ProductionOrderDetail {
  id?: number;
  productName: string;
  size: number;
  quantity: number;
  specifications: string;
  estimatedCost: number;
}

// Production Order Stage/History Entry
export interface ProductionOrderStage {
  id: number;
  orderId: number;
  status: ProductionOrderStatus;
  staffId: number;
  staffName: string;
  stageDate: string;
  notes?: string;
}

// Main Production Order Entity
export interface ProductionOrder {
  id: number;
  orderNo: string;
  customerId: number;
  customer?: {
    id: number;
    name: string;
    address?: string;
    country?: string;
    customerType?: {
      id: number;
      type: string;
    };
  };
  orderDetails: ProductionOrderDetail[];
  status: ProductionOrderStatus;
  priority: OrderPriority;
  estimatedTotalCost: number;
  agreedTotalCost?: number;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  orderDate: string;
  receivedBy: number;
  receiver?: {
    id: number;
    staffName: string;
    email?: string;
  };
  approvedBy?: number;
  approver?: {
    id: number;
    staffName: string;
  };
  productionId?: number;
  production?: any; // Reference to Production entity
  notes?: string;
  orderStages: ProductionOrderStage[];
  createdAt: string;
  updatedAt: string;
}

// Production Order Analytics Response
export interface ProductionOrderAnalytics {
  totalOrders: number;
  byStatus: Record<ProductionOrderStatus, number>;
  byPriority: Record<OrderPriority, number>;
  revenue: {
    completed: string;
    pending: string;
  };
  deliveryPerformance: {
    totalDelivered: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    onTimeRate: string;
  };
}

// Timeline Response
export interface ProductionOrderTimeline {
  orderId: number;
  orderNo: string;
  currentStatus: ProductionOrderStatus;
  customer: {
    id: number;
    name: string;
  };
  timeline: {
    status: ProductionOrderStatus;
    performedBy: string;
    date: string;
    notes?: string;
  }[];
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
}

// Form Data Types
export interface CreateProductionOrderData {
  customerId: number;
  orderDetails: Omit<ProductionOrderDetail, 'id'>[];
  expectedDeliveryDate: string;
  priority: OrderPriority;
  notes?: string;
}

export interface ApproveOrderData {
  agreedTotalCost: number;
  expectedDeliveryDate?: string;
  notes?: string;
}

export interface RejectOrderData {
  reason: string;
  notes?: string;
}

export interface CancelOrderData {
  reason: string;
  notes?: string;
}

export interface AssignToProductionData {
  productionId: number;
  notes?: string;
}

export interface CompleteOrderData {
  notes?: string;
}

export interface DeliverOrderData {
  actualDeliveryDate: string;
  notes?: string;
}

export interface UpdateProductionOrderData {
  orderDetails?: ProductionOrderDetail[];
  expectedDeliveryDate?: string;
  priority?: OrderPriority;
  notes?: string;
}
