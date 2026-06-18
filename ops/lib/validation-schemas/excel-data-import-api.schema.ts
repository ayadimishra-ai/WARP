import { z } from "zod";

export const requestValidationSchema = z.object({
  fileUrl: z.string().url("Invalid file url."),
});

export type RequestValidationType = z.infer<typeof requestValidationSchema>;

export const requestSheetNameValidationSchema = z.array(z.string());

export type RequestSheetNameValidationType = z.infer<
  typeof requestSheetNameValidationSchema
>;
