import { z } from "zod";

export const sizeDefSchema = z.object({
  size: z.coerce
    .number({ required_error: "Size is required" })
    .positive("Size must be a positive number"),
  name: z.string().optional(),
  description: z.string().optional(),
});

export type SizeDefFormData = z.infer<typeof sizeDefSchema>;
