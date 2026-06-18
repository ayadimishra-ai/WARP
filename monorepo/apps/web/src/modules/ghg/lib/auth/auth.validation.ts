import { z } from "zod";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

export const ValidateAPIAccessTokenBodySchema = z.object({
  organization_id: z
    .string()
    .uuid("Invalid organization id")
    .transform(sanitizeString.v1),
  user_email: z
    .string()
    .email("Invalid user email address")
    .transform(sanitizeString.v1),
});
