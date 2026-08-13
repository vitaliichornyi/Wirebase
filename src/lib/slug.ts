import { randomBytes } from 'node:crypto';

const SLUG_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const SLUG_LENGTH = 8;

export function generateSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH);
  let slug = '';
  for (let index = 0; index < SLUG_LENGTH; index++) {
    slug += SLUG_ALPHABET[bytes[index] % SLUG_ALPHABET.length];
  }
  return slug;
}
