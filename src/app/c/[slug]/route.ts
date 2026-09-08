import { after, NextResponse, type NextRequest } from 'next/server';
import { notFound } from 'next/navigation';

import {
  recordClick,
  resolveRedirect,
  redirectSlugSchema,
} from '@/features/flows';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const parsedSlug = redirectSlugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    notFound();
  }

  const resolution = await resolveRedirect(parsedSlug.data);

  if (!resolution) {
    notFound();
  }

  const response = NextResponse.redirect(resolution.redirectUrl, 302);

  const fireRecordClick = () =>
    recordClick(resolution.inputNodeId, {
      country: request.headers.get('x-vercel-ip-country'),
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    });

  try {
    after(fireRecordClick);
  } catch {
    fireRecordClick();
  }

  return response;
}
