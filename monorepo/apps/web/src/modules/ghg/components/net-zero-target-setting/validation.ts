import { z } from "zod";

export const netZeroTargetSchema = z.object({
  mechanism_type: z.enum(["SBTi", "Custom"], {
    required_error: "Type of mechanism is required.",
    invalid_type_error: "Type must be either SBTi or Custom.",
  }),
  baseline_year: z
    .string({
      required_error: "Baseline year is required.",
      invalid_type_error: "Baseline year must be a year.",
    })
    .min(1, "Baseline year is required.")
    .refine(
      (val) => /^\d{4}$/.test(val) && Number(val) <= new Date().getFullYear(),
      { message: "Baseline year must be a valid year." }
    ),
  targets: z.array(
    z.object({
      uuid: z.string(),
      target_year: z
        .string({
          required_error: "Target year is required.",
          invalid_type_error: "Target year must be a year.",
        })
        .min(1, "Target year is required.")
        .refine((val) => /^\d{4}$/.test(val), {
          message: "Target year must be a valid year.",
        }),
      reduction_percentage: z
        .string({
          required_error: "Reduction percentage is required.",
          invalid_type_error: "Reduction percentage must be between 1 and 100.",
        })
        .min(1, "Reduction percentage is required.")
        .refine((val) => /^\d+$/.test(val), {
          message: "Reduction percentage must be between 1 and 100.",
        })
        .refine(
          (val) => {
            const num = Number(val);
            return num >= 1 && num <= 100;
          },
          {
            message: "Reduction percentage must be between 1 and 100.",
          }
        ),
    })
  ),
});

export type FormSchemaNetZeroTargetSchema = z.infer<typeof netZeroTargetSchema>;
