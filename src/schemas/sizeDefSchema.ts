import { z } from "zod";

export const sizeDefSchema = z.object({
  name: z.string().min(1, "Size name is required"),
  description: z.string().min(1, "Description is required"),
  genderType: z.string().min(1, "Gender type is required"),
});

export type SizeDefFormData = z.infer<typeof sizeDefSchema>;
