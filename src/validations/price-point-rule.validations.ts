import z from "zod";

export const createPricePointRuleSchema = z.object({
  pointsPerUnit: z
    .number({
      required_error: "Points per unit is required",
      invalid_type_error: "Points per unit must be a number",
    })
    .int()
    .positive(),
  unitValue: z
    .number({
      required_error: "Unit value is required",
      invalid_type_error: "Unit value must be a number",
    })
    .positive(),
});

export const updatePricePointRuleSchema = createPricePointRuleSchema
  .partial()
  .extend({
    ruleId: z
      .number({
        required_error: "Rule ID is required",
      })
      .int()
      .positive(),
  });

export const singlePricePointRuleSchema = z.object({
  ruleId: z
    .number({
      required_error: "Rule ID is required",
    })
    .int()
    .positive(),
});

export type CreatePricePointRule = z.infer<typeof createPricePointRuleSchema>;
export type UpdatePricePointRule = z.infer<typeof updatePricePointRuleSchema>;
export type SinglePricePointRule = z.infer<typeof singlePricePointRuleSchema>;
