'use server';

import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '@/features/auth/schemas/auth';
import * as authService from '@/features/auth/services/auth';
import type { ActionResponse } from '@/shared/types/action-response';

export async function registerUser(
  values: RegisterFormValues,
): Promise<ActionResponse> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  return authService.registerUser(parsed.data);
}

export async function loginUser(
  values: LoginFormValues,
): Promise<ActionResponse> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  return authService.loginUser(parsed.data);
}

export async function logoutUser(): Promise<ActionResponse> {
  return authService.logoutUser();
}
