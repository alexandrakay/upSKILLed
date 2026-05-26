const encoder = new TextEncoder();

function sseData(payload: unknown): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function wrapInSSE(
  innerFn: () => Promise<Response>,
  { pingIntervalMs = 10_000 } = {}
): Promise<Response> {
  const stream = new ReadableStream({
    async start(controller) {
      const ping = setInterval(() => {
        try { controller.enqueue(encoder.encode('data: {"ping":true}\n\n')); } catch {}
      }, pingIntervalMs);

      try {
        const res = await innerFn();
        const body = await res.json();
        controller.enqueue(sseData(res.ok ? body : { ...body, status: res.status }));
      } catch (err: any) {
        controller.enqueue(sseData({ error: err?.message ?? 'Internal error', status: 500 }));
      } finally {
        clearInterval(ping);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
