export interface UtmValues {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}

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
