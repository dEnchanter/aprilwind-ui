import { z } from 'zod';

// Define the schema for the Staff form
export const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Enter a valid date of birth"
  }),
  picture: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  lga: z.string().min(1, "LGA is required"),
  stateOfOrigin: z.string().min(1, "State of origin is required"),
  country: z.string().min(1, "Country is required"),
  passportNumber: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  nextOfKinName: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinContact: z.string().optional(),
  professionalRefName: z.string().optional(),
  professionalRefContact: z.string().optional(),
  professionalRefRelation: z.string().optional(),
  roleId: z.number().min(1, "Select a role"),
});

// Define the type for the Staff form data
export type StaffFormData = z.infer<typeof staffSchema>;
