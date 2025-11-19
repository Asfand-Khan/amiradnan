import { z } from "zod";

export const createTierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  threshold: z.number().int().min(0, "Threshold must be non-negative"),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
  active: z.number().int().min(0).max(1).default(1),
  rewards: z
    .array(z.number().int().positive("Reward ID is required"))
    .min(1, "At least one reward is required"),
  image: z.string().refine(
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
});

export const updateTierSchema = z.object({
  tierId: z.string().regex(/^\d+$/, "Invalid ID format").transform(Number),
  name: z.string().min(1).max(100).optional(),
  threshold: z.number().int().min(0).optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  active: z.number().int().min(0).max(1).optional(),
  rewards: z
    .array(z.number().int().positive("Reward ID is required"))
    .optional(),
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
});

export const getTierSchema = z.object({
  tierId: z.string().regex(/^\d+$/, "Invalid ID format").transform(Number),
});

export const listTiersSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  active: z
    .string()
    .transform((val) => (val === "true" ? 1 : val === "false" ? 0 : undefined))
    .optional(),
  search: z.string().optional(),
});

export const assignTierToCustomerSchema = z.object({
  tierId: z.string().regex(/^\d+$/, "Invalid tier ID").transform(Number),
  customerId: z.number().int().positive("Customer ID is required"),
});

export const removeTierFromCustomerSchema = z.object({
  tierId: z.string().regex(/^\d+$/, "Invalid tier ID").transform(Number),
  customerId: z.number().int().positive("Customer ID is required"),
});

export const getCustomerTiersSchema = z.object({
  customerId: z
    .string()
    .regex(/^\d+$/, "Invalid customer ID")
    .transform(Number),
});

export const getTierCustomersSchema = z.object({
  tierId: z.string().regex(/^\d+$/, "Invalid tier ID").transform(Number),
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
});

export const bulkAssignTiersSchema = z.object({
  assignments: z
    .array(
      z.object({
        customerId: z.number().int().positive(),
        tierId: z.number().int().positive(),
      })
    )
    .min(1, "At least one assignment is required"),
});

export const reorderTiersSchema = z.object({
  tierOrders: z
    .array(
      z.object({
        id: z.number().int().positive(),
        displayOrder: z.number().int().min(0),
      })
    )
    .min(1, "At least one tier order is required"),
});

// Types
export type CreateTierInput = z.infer<typeof createTierSchema>;
export type UpdateTierInput = z.infer<typeof updateTierSchema>;
export type GetTierInput = z.infer<typeof getTierSchema>;
export type DeleteTierInput = z.infer<typeof getTierSchema>;
export type ListTiersInput = z.infer<typeof listTiersSchema>;
export type AssignTierToCustomerInput = z.infer<
  typeof assignTierToCustomerSchema
>;
export type RemoveTierFromCustomerInput = z.infer<
  typeof removeTierFromCustomerSchema
>;
export type GetCustomerTiersInput = z.infer<typeof getCustomerTiersSchema>;
export type GetTierCustomersInput = z.infer<typeof getTierCustomersSchema>;
export type BulkAssignTiersInput = z.infer<typeof bulkAssignTiersSchema>;
export type ReorderTiersInput = z.infer<typeof reorderTiersSchema>;
