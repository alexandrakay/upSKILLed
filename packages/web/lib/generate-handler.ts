import { checkRateLimit } from './rate-limit.ts';

const VALID_PATHS = ['service', 'tool', 'custom-describe', 'custom-help'];

export type GenerateBody = {
  path: string;
  input: string;
  use: string;
};

export type HandlerDeps = {
  db: any;
  generateContent: (opts: any) => Promise<any>;
  getClientIP: () => string;
  uid: string | null;
};

export async function handleGenerate(
  body: GenerateBody,
  { db, generateContent, getClientIP, uid }: HandlerDeps
): Promise<Response> {
  const { path, input, use: useCase } = body ?? {};

  if (!useCase) {
    return Response.json({ error: '--use is required' }, { status: 400 });
  }
  if (!VALID_PATHS.includes(path)) {
    return Response.json(
      { error: `unrecognized path "${path}". Valid: ${VALID_PATHS.join(', ')}` },
      { status: 400 }
    );
  }

  // Rate limit anonymous users only
  if (!uid) {
    const ip = getClientIP();
    const { allowed, resetAt } = await checkRateLimit(db, `ip:${ip}`);
    if (!allowed) {
      return Response.json({ error: 'Rate limit exceeded', resetAt }, { status: 429 });
    }
  }

  const result = await generateContent({ path, input, useCase });

  // Log generation — never store IP; uid is null for anonymous
  await db.collection('generations').add({
    path,
    input,
    useCase,
    createdAt: new Date(),
    uid: uid ?? null,
  });

  return Response.json(result, { status: 200 });
}
