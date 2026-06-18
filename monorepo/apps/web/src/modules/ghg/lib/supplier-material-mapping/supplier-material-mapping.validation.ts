import { SupplierMaterialMappingFormSchema } from "@/modules/ghg/schemas/supplier-material-mapping.schema";

export const validateSupplierMaterialMappingInput = (
  data: unknown,
  isEdit: boolean
) => {
  const schema = SupplierMaterialMappingFormSchema(isEdit);
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join(".");
      if (!errors[path]) errors[path] = [];
      errors[path].push(err.message);
    });
    return { success: false, data: null, errors };
  }

  return { success: true, data: result.data, errors: null };
};
