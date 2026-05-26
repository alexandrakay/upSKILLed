import { generateContent } from '@upskilled/core';
import { getFirestore } from '@/lib/firebase-admin';
import { handleGenerate } from '@/lib/generate-handler';
import type { GenerateBody } from '@/lib/generate-handler';

export const maxDuration = 30;

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

  return handleGenerate(body, {
    db: getFirestore(),
    generateContent: (opts) => generateContent({ ...opts, useCase: opts.useCase ?? opts.use }),
    getClientIP: () => ip,
    uid: null, // populated in #7 when Firebase Auth is wired
  });
}
