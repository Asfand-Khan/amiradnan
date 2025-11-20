import { z } from "zod";

export const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  address: z.string().max(255, "Address too long").optional(),
  city: z.string().max(100, "City name too long").optional(),
  phone: z
    .string()
    .max(30, "Phone number too long")
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number format")
    .optional(),
});

export const updateLocationSchema = createLocationSchema.partial().extend({
  locationId: z.number().int().positive("Location ID is required"),
});

export const singleLocationSchema = z.object({
  locationId: z.number().int().positive("Location ID is required"),
});

export const listLocationsSchema = z.object({
  city: z.string().optional(),
  search: z.string().optional(),
});

// Types
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type GetLocationInput = z.infer<typeof singleLocationSchema>;
export type DeleteLocationInput = z.infer<typeof singleLocationSchema>;
export type ListLocationsInput = z.infer<typeof listLocationsSchema>;