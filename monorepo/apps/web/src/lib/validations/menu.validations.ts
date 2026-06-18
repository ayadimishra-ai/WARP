import { z } from 'zod';

export const menuRequestSchema = z.object({
  roleGuid: z.string().min(1, 'roleGuid is required'),
  userGuid: z.string().min(1, 'userGuid is required')
});

export type MenuRequest = z.infer<typeof menuRequestSchema>;
