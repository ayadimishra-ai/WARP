import { z } from "zod";
import { VALID_MONTHS } from "~/lib/supplier-material-mapping/supplier-material-mapping.interface";

const MONTH_VALUES = VALID_MONTHS as unknown as [string, ...string[]];

const currentYear = new Date().getFullYear();

export const SupplierMaterialMappingFormSchema = (isEdit: boolean) =>
  z
    .object({
      id: isEdit
        ? z.string().uuid("Invalid mapping ID")
        : z.string().uuid().optional(),
      supplier_address_mapping_id: z
        .string()
        .uuid("Please select a supplier."),
      org_material_master_id: z
        .string()
        .uuid("Please select a material."),
      From_Year: z
        .number({ required_error: "From Year is required." })
        .int()
        .min(1000, "From Year must be a 4-digit numeric value.")
        .max(9999, "From Year must be a 4-digit numeric value.")
        .refine((y) => y <= currentYear, "From Year cannot be a future year."),
      From_Month: z
        .enum(MONTH_VALUES, {
          errorMap: () => ({
            message: "From Month must be a valid month name (January - December).",
          }),
        }),
      To_Year: z
        .number({ required_error: "To Year is required." })
        .int()
        .min(1000, "To Year must be a 4-digit numeric value.")
        .max(9999, "To Year must be a 4-digit numeric value.")
        .refine((y) => y <= currentYear, "To Year cannot be a future year."),
      To_Month: z
        .enum(MONTH_VALUES, {
          errorMap: () => ({
            message: "To Month must be a valid month name (January - December).",
          }),
        }),
    })
    .refine(
      (data) => data.To_Year >= data.From_Year,
      {
        message: "To Year must be greater than or equal to From Year.",
        path: ["To_Year"],
      }
    )
    .refine(
      (data) => {
        if (data.From_Year === data.To_Year) {
          const fromIdx = VALID_MONTHS.indexOf(data.From_Month as any);
          const toIdx = VALID_MONTHS.indexOf(data.To_Month as any);
          return toIdx >= fromIdx;
        }
        return true;
      },
      {
        message:
          "To Month must be chronologically after or equal to From Month when years are the same.",
        path: ["To_Month"],
      }
    );

export type TSupplierMaterialMappingForm = z.infer<
  ReturnType<typeof SupplierMaterialMappingFormSchema>
>;
