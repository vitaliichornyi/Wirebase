export type ActionResponse<T = void> = T extends void
  ? { error: string | null }
  : { data: T | null; error: string | null };
