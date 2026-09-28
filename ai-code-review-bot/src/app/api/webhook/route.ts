import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { handlePullRequest } from '@/lib/review';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256');
  const body = await req.text();

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = req.headers.get('x-github-event');
  const delivery = req.headers.get('x-github-delivery');
  const payload = JSON.parse(body);

  console.log(`[${delivery}] Received ${event} event`);

  if (event === 'pull_request') {
    const { action, pull_request, repository } = payload;
    if (action === 'opened' || action === 'synchronize' || action === 'reopened') {
      try {
        await handlePullRequest(payload);
        return NextResponse.json({ status: 'review_queued' });
      } catch (err) {
        console.error('Review error:', err);
        return NextResponse.json({ error: 'Review failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ status: 'ignored' });
}

function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = 'sha256=' + createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex');
  return signature === expected;
}