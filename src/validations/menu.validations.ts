import { z } from "zod";

export const createMenuSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters"),

  description: z
    .string({
      invalid_type_error: "Description must be a string",
    })
    .max(100, "Name cannot exceed 100 characters")
    .optional()
    .nullable(),

  parentId: z
    .number({
      invalid_type_error: "Parent ID must be a number",
    })
    .int("Parent ID must be an integer")
    .positive("Parent ID must be a positive number")
    .optional()
    .nullable(),

  url: z
    .string({
      required_error: "Url is required",
      invalid_type_error: "Url must be a string",
    })
    .min(1, "Url is required")
    .max(100, "Url cannot exceed 100 characters"),

  icon: z
    .string({
      required_error: "Icon is required",
      invalid_type_error: "Icon must be a string",
    })
    .min(1, "Icon is required")
    .max(50, "Icon cannot exceed 50 characters"),

  sorting: z
    .number({
      invalid_type_error: "Sorting must be a number",
    })
    .int("Sorting must be an integer")
    .positive("Sorting must be a positive number")
    .default(1),
});

export const UpdateMenu = createMenuSchema.partial().extend({
  parentId: z.number().int().positive().optional().nullable(),
});

export type CreateMenu = z.infer<typeof createMenuSchema>;
export type UpdateMenu = z.infer<typeof UpdateMenu>;
