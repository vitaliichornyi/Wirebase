import { after, NextResponse, type NextRequest } from 'next/server';

import { recordClick, resolveRedirect, redirectSlugSchema } from '@/features/flows';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const parsedSlug = redirectSlugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    return notSetUpResponse();
  }

  const resolution = await resolveRedirect(parsedSlug.data);

  if (!resolution) {
    return notSetUpResponse();
  }

  const response = NextResponse.redirect(resolution.redirectUrl, 302);

  const fireRecordClick = () =>
    recordClick(resolution.inputNodeId, {
      country: request.headers.get('x-vercel-ip-country'),
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    });

  // Fire-and-forget per ADR 0004 — the redirect must never wait on this
  // write completing. `after()` keeps the write running once the response
  // has been sent, which a bare unawaited promise can't guarantee on a
  // serverless runtime. It only works inside a real Next.js request, so
  // direct handler invocation (e.g. tests) falls back to firing inline.
  try {
    after(fireRecordClick);
  } catch {
    fireRecordClick();
  }

  return response;
}
