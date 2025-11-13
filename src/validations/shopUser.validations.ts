import { z } from "zod";

export const GenderEnum = z.enum(["male", "female", "other"], {
  required_error: "Gender is required",
});

export const UserRole = z.enum(["staff", "manager", "admin"], {
  required_error: "Role is required",
});

export const menuRight = z.object({
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
});

export const createShopUserSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password cannot exceed 255 characters"),

  role: UserRole,

  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+92|0)3[0-9]{9}$/,
      "Phone number must be a valid Pakistani number (e.g. 03001234567 or +923001234567)"
    ),

  locationId: z
    .number({
      invalid_type_error: "Location ID must be a number",
    })
    .int("Location ID must be an integer")
    .positive("Location ID must be a positive number")
    .optional()
    .nullable(),

  isActive: z
    .boolean({
      required_error: "Is active is required",
      invalid_type_error: "Is active must be a boolean",
    })
    .optional()
    .default(true),

  menuRights: z.array(menuRight),
});

export const loginUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email cannot exceed 254 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password cannot exceed 255 characters"),
});

export const updateShopUserSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be a string",
    })
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),

  email: z
    .string({
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+92|0)3[0-9]{9}$/,
      "Phone number must be a valid Pakistani number (e.g. 03001234567 or +923001234567)"
    )
    .optional(),

  role: UserRole.optional(),

  locationId: z
    .number({
      invalid_type_error: "Location ID must be a number",
    })
    .int("Location ID must be an integer")
    .positive("Location ID must be a positive number")
    .optional()
    .nullable(),

  isActive: z
    .boolean({
      invalid_type_error: "Is active must be a boolean",
    })
    .optional(),
  
  menuRights: z.array(menuRight).optional(),
});

export const updatePasswordSchema = z.object({
    currentPassword: z
      .string({
        required_error: "Current password is required",
      })
      .min(1, "Current password is required"),

    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .min(6, "New password must be at least 6 characters")
      .max(255, "New password cannot exceed 255 characters"),

    confirmPassword: z
      .string({
        required_error: "Confirm password is required",
      })
      .min(1, "Confirm password is required"),
  });

export const toggleStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "Is active is required",
    invalid_type_error: "Is active must be a boolean",
  }),
});

export const userFiltersSchema = z.object({
  locationId: z.string().transform(Number).optional(),
  role: z.enum(["staff", "manager", "admin"]).optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().optional(),
});

// Export types
export type CreateShopUser = z.infer<typeof createShopUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateShopUser = z.infer<typeof updateShopUserSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type ToggleStatus = z.infer<typeof toggleStatusSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
//
export type MenuRight = z.infer<typeof menuRight>;
