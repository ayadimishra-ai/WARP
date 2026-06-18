import { z } from 'zod';

export const nonEmptyTextSchema = z.string().min(1, 'Request body cannot be empty');

export const languageResourcesSchema = z.object({
    pageKeys: z.array(
        z.string().min(1, 'Page key cannot be empty')
    ).min(1, 'At least one page key is required')
}).superRefine((data, ctx) => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Request body must be a non-empty object with settingsKeys',
            path: []
        });
    }
});

export type LanguageResourcesRequest = z.infer<typeof languageResourcesSchema>;
