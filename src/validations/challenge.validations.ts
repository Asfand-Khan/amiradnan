import z from "zod";
import { ChallengeType, Channel } from "@prisma/client";

// Enums validation
const challengeTypeEnum = z.nativeEnum(ChallengeType);
const channelEnum = z.nativeEnum(Channel);

export const createChallengeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  type: challengeTypeEnum,
  requiredAmount: z.number().min(0).default(0),
  requiredPurchases: z.number().int().min(0).default(0),
  durationDays: z.number().int().positive().optional(),
  customerUsage: z.number().int().positive().optional(),
  channel: channelEnum.default(Channel.any),
  bonusPoints: z.number().int().min(0).default(0),
  bonusPercent: z.number().min(0).max(100).default(0),
  notificationBodyText: z
    .string()
    .min(1, "Notification body text is required")
    .max(255, "Notification body text too long"),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  active: z.boolean().default(true),
});

export const updateChallengeSchema = z.object({
  challengeId: z
    .number({
      required_error: "Challenge ID is required",
      invalid_type_error: "Challenge ID must be a number",
    })
    .int("Challenge ID must be an integer")
    .positive("Challenge ID must be a positive number"),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  type: challengeTypeEnum.optional(),
  requiredAmount: z.number().min(0).optional(),
  requiredPurchases: z.number().int().min(0).optional(),
  durationDays: z.number().int().positive().optional(),
  customerUsage: z.number().int().positive().optional(),
  channel: channelEnum.optional(),
  bonusPoints: z.number().int().min(0).optional(),
  bonusPercent: z.number().min(0).max(100).optional(),
  notificationBodyText: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  active: z.boolean().optional(),
});

export const singleChallengeSchema = z.object({
  id: z
    .number({
      required_error: "Challenge ID is required",
      invalid_type_error: "Challenge ID must be a number",
    })
    .int("Challenge ID must be an integer")
    .positive("Challenge ID must be a positive number"),
});

export const listChallengesSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
  type: challengeTypeEnum.optional(),
  channel: channelEnum.optional(),
  active: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z.string().optional(),
});

// Challenge Participant validations
export const enrollCustomerSchema = z.object({
  challengeId: z
    .string()
    .regex(/^\d+$/, "Invalid challenge ID")
    .transform(Number),
  customerId: z.number().int().positive("Customer ID is required"),
});

export const updateProgressSchema = z.object({
  challengeId: z
    .string()
    .regex(/^\d+$/, "Invalid challenge ID")
    .transform(Number),
  customerId: z.number().int().positive("Customer ID is required"),
  progressCount: z.number().int().min(0, "Progress count must be non-negative"),
});

export const getCustomerChallengesSchema = z.object({
  customerId: z
    .string()
    .regex(/^\d+$/, "Invalid customer ID")
    .transform(Number),
  status: z.enum(["active", "completed", "all"]).default("all"),
});

// Types
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>;
export type GetChallengeInput = z.infer<typeof singleChallengeSchema>;
export type DeleteChallengeInput = z.infer<typeof singleChallengeSchema>;
export type ListChallengesInput = z.infer<typeof listChallengesSchema>;
export type EnrollCustomerInput = z.infer<typeof enrollCustomerSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type GetCustomerChallengesInput = z.infer<
  typeof getCustomerChallengesSchema
>;
