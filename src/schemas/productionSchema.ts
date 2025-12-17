import { z } from 'zod';

// Define the schema for the Production (Product for Production) form
export const productionSchema = z.object({
  productId: z.number().min(1, "Product definition is required"),
  requestedBy: z.number().min(1, "Requester is required"),
  quantity: z.array(z.object({
    size: z.number().min(1, "Size is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  })).min(1, "At least one size/quantity is required"),
  productGuide: z.array(z.object({
    id: z.number().min(1, "Material is required"),
    qty: z.string().min(1, "Quantity description is required"),
  })).optional(),
  isActive: z.boolean().optional(),
});

// Define the type for the Production form data
export type ProductionFormData = z.infer<typeof productionSchema>;
