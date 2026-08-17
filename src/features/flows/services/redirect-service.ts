import { createPublicClient } from '@/shared/lib/supabase/public';
import type { UtmValues } from '@/features/flows/types/utm';

const UTM_PARAM_KEYS: Record<keyof UtmValues, string> = {
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmTerm: 'utm_term',
  utmContent: 'utm_content',
};

// Wirebase's configured UTM values win on key collision with the destination
// URL's own query string (ADR 0013).
export function buildRedirectUrl(destinationUrl: string, utm: UtmValues): string {
  const url = new URL(destinationUrl);

  for (const [field, paramKey] of Object.entries(UTM_PARAM_KEYS) as [
    keyof UtmValues,
    string,
  ][]) {
    const value = utm[field];
    if (value) {
      url.searchParams.set(paramKey, value);
    }
  }

  return url.toString();
}

interface ResolveRedirectRow {
  input_node_id: string;
  is_active: boolean;
  destination_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

export interface RedirectResolution {
  inputNodeId: string;
  redirectUrl: string;
}

// Public & unauthenticated data access (CLAUDE.md: Data Layer) — the
// anonymous redirect route never queries `nodes` directly; `resolve_redirect`
// is a security-definer Postgres function that is the sole author of what an
// unauthenticated caller can read.
export async function resolveRedirect(slug: string): Promise<RedirectResolution | null> {
  const supabase = createPublicClient();

  const { data } = await supabase.rpc('resolve_redirect', { p_slug: slug });
  const resolution = (data as ResolveRedirectRow[] | null)?.[0];

  if (!resolution || !resolution.is_active || !resolution.destination_url) {
    return null;
  }

  return {
    inputNodeId: resolution.input_node_id,
    redirectUrl: buildRedirectUrl(resolution.destination_url, {
      utmSource: resolution.utm_source,
      utmMedium: resolution.utm_medium,
      utmCampaign: resolution.utm_campaign,
      utmTerm: resolution.utm_term,
      utmContent: resolution.utm_content,
    }),
  };
}

interface ClickMetadata {
  country: string | null;
  userAgent: string | null;
  referrer: string | null;
}

export async function recordClick(
  inputNodeId: string,
  metadata: ClickMetadata,
): Promise<void> {
  const supabase = createPublicClient();

  await supabase.rpc('record_click', {
    p_input_node_id: inputNodeId,
    p_country: metadata.country,
    p_user_agent: metadata.userAgent,
    p_referrer: metadata.referrer,
  });
}
