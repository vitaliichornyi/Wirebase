import { createClient } from '@/shared/lib/supabase/server';
import type { ActionResponse } from '@/shared/types/action-response';
import type {
  LoginFormValues,
  RegisterFormValues,
} from '@/features/auth/schemas/auth';

export async function registerUser(
  values: RegisterFormValues,
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

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
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
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
