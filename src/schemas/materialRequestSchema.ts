import { z } from 'zod';

// Define the schema for the Material Request form
export const materialRequestSchema = z.object({
  requestDate: z.string().optional(),
  requesterId: z.number().min(1, "Requester is required"),
  materials: z.array(z.object({
    itemId: z.number().min(1, "Material is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  })).min(1, "At least one material is required"),
  productionId: z.number().min(1, "Production is required"),
  quantity: z.array(z.object({
    size: z.number().min(1, "Size is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  })),
  notes: z.string().optional(),
});

// Approval/Rejection schema
export const approvalSchema = z.object({
  notes: z.string().optional(),
});

export const rejectionSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

export const cancellationSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
});

// Define the type for the Material Request form data
export type MaterialRequestFormData = z.infer<typeof materialRequestSchema>;
export type ApprovalFormData = z.infer<typeof approvalSchema>;
export type RejectionFormData = z.infer<typeof rejectionSchema>;
export type CancellationFormData = z.infer<typeof cancellationSchema>;
