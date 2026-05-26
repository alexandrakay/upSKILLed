import { streamContent } from '@upskilled/core';
import { getFirestore, getAdminApp } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

const VALID_PATHS = ['service', 'tool', 'custom-describe', 'custom-help'];
const encoder = new TextEncoder();

async function resolveUid(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const { uid } = await getAdminApp().auth().verifyIdToken(token);
    return uid;
  } catch {
    return null;
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: { path: string; input: string; use: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { path, input, use: useCase } = body ?? {};

  if (!useCase) return Response.json({ error: '--use is required' }, { status: 400 });
  if (!VALID_PATHS.includes(path)) {
    return Response.json(
      { error: `unrecognized path "${path}". Valid: ${VALID_PATHS.join(', ')}` },
      { status: 400 }
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const uid = await resolveUid(req);
  const db = getFirestore();

  // Rate limit anonymous users before opening the stream
  if (!uid) {
    const { allowed, resetAt } = await checkRateLimit(db, `ip:${ip}`);
    if (!allowed) {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Rate limit exceeded', resetAt, status: 429 })}\n\n`)
          );
          controller.close();
        },
      });
      return new Response(stream, sseHeaders());
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: unknown) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };
      try {
        console.log('[generate] start', { path, input: String(input ?? '').slice(0, 80), uid: uid ?? 'anon' });
        const result = await streamContent(
          { path, input, useCase, name: input },
          { onDelta: (delta: string) => enqueue({ delta }) }
        );
        console.log('[generate] complete', { name: result?.name, skillLen: result?.skillContent?.length ?? 0, hasConfig: !!result?.configContent });
        await db.collection('generations').add({
          path, input, useCase, createdAt: new Date(), uid: uid ?? null,
        });
        enqueue(result);
      } catch (err: any) {
        console.error('[generate] error', err?.message, err?.stack);
        enqueue({ error: err?.message ?? 'Internal error', status: 500 });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, sseHeaders());
}

function sseHeaders() {
  return {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  };
}
