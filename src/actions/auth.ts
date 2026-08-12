'use server';

import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '@/schemas/auth';
import type { ActionResponse } from '@/types/action-response';

export async function registerUser(
  values: RegisterFormValues,
): Promise<ActionResponse> {
  try {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Validation error' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    return { error: error?.message ?? null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

export async function logoutUser(): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    return { error: error?.message ?? null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}

export async function loginUser(
  values: LoginFormValues,
): Promise<ActionResponse> {
  try {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Validation error' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    return { error: error?.message ?? null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown server error',
    };
  }
}
