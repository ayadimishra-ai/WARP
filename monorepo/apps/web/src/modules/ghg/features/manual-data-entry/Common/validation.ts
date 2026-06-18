import { z } from "zod";
import { ColumnSchema } from "./types";

/**
 * Dynamically generates a Zod schema based on column configuration
 */
export const generateZodSchema = (columns: ColumnSchema[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  columns.forEach((column) => {
    let fieldSchema: z.ZodTypeAny;

    switch (column.type) {
      case "text":
        if (column.required) {
          fieldSchema = z.string().min(1, "Required");
        } else {
          fieldSchema = z.string().optional().or(z.literal(""));
        }
        break;

      case "number":
        if (column.required) {
          fieldSchema = z
            .number({ invalid_type_error: "Must be a number" })
            .positive("Must be positive");
        } else {
          fieldSchema = z
            .number({ invalid_type_error: "Must be a number" })
            .positive()
            .optional()
            .or(z.literal(null));
        }
        break;

      case "select":
        if (column.required) {
          fieldSchema = z.string().min(1, "Required");
        } else {
          fieldSchema = z.string().optional().or(z.literal(""));
        }
        break;

      default:
        fieldSchema = z.any();
    }

    schemaShape[column.key] = fieldSchema;
  });

  return z.object(schemaShape);
};

/**
 * Validates row data against the generated schema
 */
export const validateRow = (
  data: Record<string, any>,
  columns: ColumnSchema[]
): Record<string, boolean> => {
  const schema = generateZodSchema(columns);
  const result = schema.safeParse(data);

  if (result.success) {
    return {};
  }

  const errors: Record<string, boolean> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path[0] as string;
    errors[path] = true;
  });

  return errors;
};
