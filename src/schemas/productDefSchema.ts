// schemas/productDefSchema.ts
import { z } from 'zod';

export const productDefSchema = z.object({
  code: z.string().min(1, "Product code is required").max(10, "Code must be 10 characters or less"),
  name: z.string().min(1, "Product name is required"),
  cost: z.number().min(0, "Cost must be greater than or equal to 0"),
  def: z.array(z.object({
    item: z.number().min(1, "Material is required"),
    qty: z.number().min(0.01, "Quantity must be greater than 0"),
  })).min(1, "At least one material specification is required"),
  productSizes: z.array(z.number().min(1, "Size is required")).min(1, "At least one size is required"),
  creatorId: z.number().min(1, "Creator ID is required"),
});

export type ProductDefFormData = z.infer<typeof productDefSchema>;
