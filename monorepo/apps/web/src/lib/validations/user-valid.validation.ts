import { z } from 'zod';

export const loginValidationSchema = z.object({
  EmailId: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
  })
    .trim()
    .min(1, { message: 'Email cannot be empty' })
    // Using the exact same regex pattern from the original code
    .refine((email) => /^\S+@\S+\.\S+$/.test(email), {
      message: 'Please provide a valid email address'
    }),
  
  Password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  })
    .trim()
    .min(1, { message: 'Password cannot be empty' }),

  // Optional fields that don't require validation
  BrowserToken: z.string().optional(),
  BrowserName: z.string().optional(),
});

/**
 * Type definition for login validation result
 */
export type LoginValidationResult = {
  success: boolean;
  error?: string;
};

/**
 * Validates user login credentials using Zod schema
 * 
 * @param data Object containing EmailId and Password
 * @returns Object with validation result
 */
export function validateLoginCredentials(data: unknown): LoginValidationResult {
  try {
    loginValidationSchema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed'
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred during validation'
    };
  }
}

/**
 * Type for login request body extracted from Zod schema
 */
export type LoginCredentials = z.infer<typeof loginValidationSchema>;
