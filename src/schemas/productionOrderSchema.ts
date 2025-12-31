import { z } from "zod";

// Order Detail Item Schema
export const orderDetailSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  size: z.coerce.number().positive("Size must be positive"),
  quantity: z.coerce.number().positive("Quantity must be at least 1"),
  specifications: z.string().min(1, "Specifications are required"),
  estimatedCost: z.coerce.number().positive("Cost must be positive"),
});

// Create Production Order Schema
export const createProductionOrderSchema = z.object({
  customerId: z.coerce.number().positive("Customer is required"),
  orderDetails: z.array(orderDetailSchema).min(1, "At least one item is required"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  priority: z.enum(["low", "normal", "high", "urgent"], {
    required_error: "Priority is required",
  }),
  notes: z.string().optional(),
});

export type CreateProductionOrderFormData = z.infer<typeof createProductionOrderSchema>;

// Approve Order Schema
export const approveOrderSchema = z.object({
  agreedTotalCost: z.coerce.number().positive("Agreed cost is required"),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

export type ApproveOrderFormData = z.infer<typeof approveOrderSchema>;

// Reject Order Schema
export const rejectOrderSchema = z.object({
  reason: z.string().min(1, "Reason for rejection is required"),
});

export type RejectOrderFormData = z.infer<typeof rejectOrderSchema>;

// Cancel Order Schema
export const cancelOrderSchema = z.object({
  reason: z.string().min(1, "Reason for cancellation is required"),
});

export type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;

// Assign to Production Schema
export const assignToProductionSchema = z.object({
  productionId: z.coerce.number().positive("Production ID is required"),
  notes: z.string().optional(),
});

export type AssignToProductionFormData = z.infer<typeof assignToProductionSchema>;

// Complete Order Schema
export const completeOrderSchema = z.object({
  notes: z.string().optional(),
});

export type CompleteOrderFormData = z.infer<typeof completeOrderSchema>;

// Deliver Order Schema
export const deliverOrderSchema = z.object({
  actualDeliveryDate: z.string().min(1, "Delivery date is required"),
  notes: z.string().optional(),
});

export type DeliverOrderFormData = z.infer<typeof deliverOrderSchema>;

// Update Production Order Schema
export const updateProductionOrderSchema = z.object({
  orderDetails: z.array(orderDetailSchema).optional(),
  expectedDeliveryDate: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  notes: z.string().optional(),
});

export type UpdateProductionOrderFormData = z.infer<typeof updateProductionOrderSchema>;
