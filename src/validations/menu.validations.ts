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

export const UpdateMenuSchema = createMenuSchema.partial().extend({
  parentId: z.number().int().positive().optional().nullable(),
});

// Toggle Status Schema
export const toggleStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "Is active is required",
    invalid_type_error: "Is active must be a boolean",
  }),
});

// Menu Sorting Schema
export const menuSortingSchema = z.object({
  sortingData: z
    .array(
      z.object({
        id: z.number({
          required_error: "Menu ID is required",
          invalid_type_error: "Menu ID must be a number",
        }),
        sorting: z.number({
          required_error: "Sorting is required",
          invalid_type_error: "Sorting must be a number",
        }),
      })
    )
    .min(1, "Sorting data must contain at least one item"),
});

// Query Filters Schema
export const userFiltersSchema = z.object({
  locationId: z.string().transform(Number).optional(),
  role: z.enum(["staff", "manager", "admin"]).optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().optional(),
});

// Menu Rights Update Schema
export const updateMenuRightsSchema = z.object({
  menuRights: z
    .array(
      z.object({
        menu_id: z.number({
          required_error: "Menu ID is required",
          invalid_type_error: "Menu ID must be a number",
        }),
        can_view: z.boolean({
          required_error: "Can view is required",
          invalid_type_error: "Can view must be a boolean",
        }),
        can_create: z.boolean({
          required_error: "Can create is required",
          invalid_type_error: "Can create must be a boolean",
        }),
        can_edit: z.boolean({
          required_error: "Can edit is required",
          invalid_type_error: "Can edit must be a boolean",
        }),
        can_delete: z.boolean({
          required_error: "Can delete is required",
          invalid_type_error: "Can delete must be a boolean",
        }),
      })
    )
    .min(1, "Menu rights must contain at least one item"),
});

// Single Menu Right Update Schema
export const updateSingleMenuRightSchema = z.object({
  can_view: z.boolean().optional(),
  can_create: z.boolean().optional(),
  can_edit: z.boolean().optional(),
  can_delete: z.boolean().optional(),
});

export type CreateMenu = z.infer<typeof createMenuSchema>;
export type UpdateMenu = z.infer<typeof UpdateMenuSchema>;

export type UpdateMenuRights = z.infer<typeof updateMenuRightsSchema>;
export type UpdateSingleMenuRight = z.infer<typeof updateSingleMenuRightSchema>;
export type MenuSorting = z.infer<typeof menuSortingSchema>;
export type ToggleStatus = z.infer<typeof toggleStatusSchema>;
