// src/validations/pointsTransaction.validation.ts
import { z } from "zod";
import { TransactionType } from "@prisma/client";

// Enums validation
const transactionTypeEnum = z.nativeEnum(TransactionType);

// Base points transaction schema
export const createPointsTransactionSchema = z.object({
  customerId: z.number().int().positive("Customer ID is required"),
  challengeId: z.number().int().positive().optional(),
  points: z
    .number()
    .int()
    .refine((val) => val !== 0, {
      message: "Points cannot be zero",
    }),
  type: transactionTypeEnum,
  referenceId: z.string().max(255).optional(),
  locationId: z.number().int().positive().optional(),
  orderAmount: z.number().min(0).optional(),
  note: z.string().optional(),
  expiryDate: z.string().datetime("Invalid expiry date format"),
});

export const getPointsTransactionSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid ID format").transform(Number),
});

export const listPointsTransactionsSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
    customerId: z.string().regex(/^\d+$/).transform(Number).optional(),
    type: transactionTypeEnum.optional(),
    locationId: z.string().regex(/^\d+$/).transform(Number).optional(),
    challengeId: z.string().regex(/^\d+$/).transform(Number).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    minPoints: z
      .string()
      .regex(/^-?\d+$/)
      .transform(Number)
      .optional(),
    maxPoints: z
      .string()
      .regex(/^-?\d+$/)
      .transform(Number)
      .optional(),
});

export const getCustomerTransactionsSchema = z.object({
    customerId: z
      .string()
      .regex(/^\d+$/, "Invalid customer ID")
      .transform(Number),
    page: z.string().regex(/^\d+$/).transform(Number).default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
    type: transactionTypeEnum.optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export const getCustomerBalanceSchema = z.object({
    customerId: z
      .string()
      .regex(/^\d+$/, "Invalid customer ID")
      .transform(Number),
});

export const creditPointsSchema = z.object({
    customerId: z.number().int().positive("Customer ID is required"),
    points: z.number().int().positive("Points must be positive"),
    type: z.enum([
      TransactionType.signup,
      TransactionType.profile_complete,
      TransactionType.qr_purchase,
      TransactionType.shopify_order,
      TransactionType.challenge,
      TransactionType.manual_credit,
    ]),
    referenceId: z.string().max(255).optional(),
    locationId: z.number().int().positive().optional(),
    challengeId: z.number().int().positive().optional(),
    orderAmount: z.number().min(0).optional(),
    note: z.string().optional(),
    expiryDays: z.number().int().positive().optional(),
});

export const debitPointsSchema = z.object({
    customerId: z.number().int().positive("Customer ID is required"),
    points: z.number().int().positive("Points must be positive"),
    type: z.enum([
      TransactionType.manual_deduct,
      TransactionType.expiry,
      TransactionType.redeem,
    ]),
    referenceId: z.string().max(255).optional(),
    locationId: z.number().int().positive().optional(),
    note: z.string().optional(),
});

export const getTransactionStatsSchema = z.object({
    customerId: z.string().regex(/^\d+$/).transform(Number).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    groupBy: z.enum(["type", "location", "date", "customer"]).default("type"),
});

export const getExpiringPointsSchema = z.object({
    customerId: z
      .string()
      .regex(/^\d+$/, "Invalid customer ID")
      .transform(Number),
    days: z.string().regex(/^\d+$/).transform(Number).default("30"),
});

export const reverseTransactionSchema = z.object({
    id: z.string().regex(/^\d+$/, "Invalid transaction ID").transform(Number),
    reason: z.string().min(1, "Reason is required").max(500),
});

// Types
export type CreatePointsTransactionInput = z.infer<typeof createPointsTransactionSchema>;
export type GetPointsTransactionInput = z.infer<typeof getPointsTransactionSchema>;
export type ListPointsTransactionsInput = z.infer<typeof listPointsTransactionsSchema>;
export type GetCustomerTransactionsInput = z.infer<typeof getCustomerTransactionsSchema>;
export type GetCustomerBalanceInput = z.infer<typeof getCustomerBalanceSchema>;
export type CreditPointsInput = z.infer<typeof creditPointsSchema>;
export type DebitPointsInput = z.infer<typeof debitPointsSchema>;
export type GetTransactionStatsInput = z.infer<typeof getTransactionStatsSchema>;
export type GetExpiringPointsInput = z.infer<typeof getExpiringPointsSchema>;
export type ReverseTransactionInput = z.infer<typeof reverseTransactionSchema>;
