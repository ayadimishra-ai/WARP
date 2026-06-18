import { z } from 'zod';

// Schema for non-empty text
export const nonEmptyTextSchema = z.string().min(1, 'Request body cannot be empty');

// Schema for global settings
export const globalSettingsSchema = z.object({
    settingsKeys: z.union([
        z.array(
            z.string().min(1, 'Settings keys cannot be empty strings')
        ),
        z.string().min(1, 'Settings key cannot be empty').transform(val => [val])
    ]).transform(val => Array.isArray(val) ? val : [val])
        .refine(arr => arr.length > 0, 'At least one settings key is required')
}).superRefine((data, ctx) => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Request body must be a non-empty object with settingsKeys',
            path: []
        });
    }
});

export type GlobalSettingsRequestBody = z.infer<typeof globalSettingsSchema>;
