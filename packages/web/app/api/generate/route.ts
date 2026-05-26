import { generateContent } from '@upskilled/core';
import { getFirestore, getAdminApp } from '@/lib/firebase-admin';
import { handleGenerate } from '@/lib/generate-handler';
import { wrapInSSE } from '@/lib/stream-generate';
import type { GenerateBody } from '@/lib/generate-handler';

export const maxDuration = 60;

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
  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const uid = await resolveUid(req);

  return wrapInSSE(() =>
    handleGenerate(body, {
      db: getFirestore(),
      generateContent: (opts) => generateContent({ ...opts, useCase: opts.useCase ?? opts.use }),
      getClientIP: () => ip,
      uid,
    })
  );
}
