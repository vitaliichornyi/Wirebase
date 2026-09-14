const RETRY_DELAY_MS = 400;

const TRANSIENT_ERROR_MESSAGES = [
  'JWT issued at future',
  'Failed to get project config',
];

function isTransientSupabaseError(error: { message: string } | null): boolean {
  return (
    error !== null &&
    TRANSIENT_ERROR_MESSAGES.some((message) => error.message.includes(message))
  );
}

export async function withSupabaseRetry<
  TResult extends { error: { message: string } | null },
>(query: () => PromiseLike<TResult>): Promise<TResult> {
  const result = await query();

  if (!isTransientSupabaseError(result.error)) {
    return result;
  }

  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return query();
}
