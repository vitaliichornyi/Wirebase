import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
