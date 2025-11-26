import { z } from "zod";

export const GenderEnum = z.enum(["male", "female", "other"]);

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name cannot exceed 200 characters"),

  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email cannot exceed 254 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password cannot exceed 255 characters"),

  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+92|0)3[0-9]{9}$/,
      "Phone number must be a valid Pakistani number (e.g. 03001234567 or +923001234567)"
    ),

  city: z.string().max(100, "City name too long"),

  address: z.string().max(255, "Address too long"),

  gender: GenderEnum,
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  image: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const base64Pattern =
          /^data:image\/(png|jpg|jpeg|gif|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
        return base64Pattern.test(val);
      },
      {
        message:
          "Image must be a valid base64-encoded string (png, jpg, jpeg, gif, or webp).",
      }
    ),
  fcmToken: z.string().optional().nullable(),
});

export const loginCustomerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email cannot exceed 254 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password cannot exceed 255 characters"),
});

export const refreshAccessTokenSchema = z.object({
  refresh_token: z
    .string()
    .min(6, "Refresh token must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email cannot exceed 254 characters"),
});

export const resetPassword = z.object({
  token: z.string().min(6, "Reset token must be at least 6 characters"),
  new_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password cannot exceed 255 characters"),
});

export const customerFilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export const customerByIdSchema = z.object({
  customerId: z
    .number({
      required_error: "Customer ID is required",
    })
    .int({
      message: "Customer ID must be an integer",
    })
    .positive(),
});

export const googleLoginSchema = z.object({
  token: z.string().min(6, "Token must be at least 6 characters"),
});

export const setPasswordSchema = z.object({
  customerId: z
    .number({ required_error: "Customer ID is required" })
    .int({ message: "Customer ID must be an integer" })
    .positive(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password cannot exceed 255 characters"),
});

export const createCustomerMeasurementSchema = z.object({
  length: z
    .string({
      required_error: "Length is required",
      invalid_type_error: "Length must be a number",
    })
    .min(1, "Length is required"),

  width: z
    .string({
      required_error: "Width is required",
      invalid_type_error: "Width must be a number",
    })
    .min(1, "Width is required"),

  waist: z
    .string({
      required_error: "Waist is required",
      invalid_type_error: "Waist must be a number",
    })
    .min(1, "Waist is required"),

  hip: z
    .string({
      required_error: "Hip is required",
      invalid_type_error: "Hip must be a number",
    })
    .min(1, "Hip is required"),
});

export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type LoginCustomer = z.infer<typeof loginCustomerSchema>;
export type RefreshAccessToken = z.infer<typeof refreshAccessTokenSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPassword>;
export type CustomerFilter = z.infer<typeof customerFilterSchema>;
export type CustomerById = z.infer<typeof customerByIdSchema>;
export type GoogleLogin = z.infer<typeof googleLoginSchema>;
export type SetPassword = z.infer<typeof setPasswordSchema>;
export type CreateCustomerMeasurement = z.infer<
  typeof createCustomerMeasurementSchema
>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;
