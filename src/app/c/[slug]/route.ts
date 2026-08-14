import { after, NextResponse, type NextRequest } from 'next/server';

import { createPublicClient } from '@/lib/supabase/public';
import { buildRedirectUrl } from '@/lib/utm';
import { redirectSlugSchema } from '@/schemas/nodes';

const NOT_SET_UP_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Link not set up</title>
    <style>
      body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #fafafa; }
      main { text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem; }
      p { margin: 0; color: #a3a3a3; }
    </style>
  </head>
  <body>
    <main>
      <h1>This link isn't set up</h1>
      <p>The destination for this link hasn't been configured yet.</p>
    </main>
  </body>
</html>`;

function notSetUpResponse(): NextResponse {
  return new NextResponse(NOT_SET_UP_HTML, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const parsedSlug = redirectSlugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    return notSetUpResponse();
  }

  const supabase = createPublicClient();

  const { data } = await supabase.rpc('resolve_redirect', { p_slug: parsedSlug.data });
  const resolution = (data as ResolveRedirectRow[] | null)?.[0];

  if (!resolution || !resolution.is_active || !resolution.destination_url) {
    return notSetUpResponse();
  }

  const redirectUrl = buildRedirectUrl(resolution.destination_url, {
    utmSource: resolution.utm_source,
    utmMedium: resolution.utm_medium,
    utmCampaign: resolution.utm_campaign,
    utmTerm: resolution.utm_term,
    utmContent: resolution.utm_content,
  });

  const response = NextResponse.redirect(redirectUrl, 302);

  const recordClick = async () => {
    // `.rpc()` returns a lazy thenable that only sends its request once
    // `.then()`/`await` runs, so `void` alone would never fire it.
    await supabase.rpc('record_click', {
      p_input_node_id: resolution.input_node_id,
      p_country: request.headers.get('x-vercel-ip-country'),
      p_user_agent: request.headers.get('user-agent'),
      p_referrer: request.headers.get('referer'),
    });
  };

  // Fire-and-forget per ADR 0004 — the redirect must never wait on this
  // write completing. `after()` keeps the write running once the response
  // has been sent, which a bare unawaited promise can't guarantee on a
  // serverless runtime. It only works inside a real Next.js request, so
  // direct handler invocation (e.g. tests) falls back to firing inline.
  try {
    after(recordClick);
  } catch {
    recordClick();
  }

  return response;
}
