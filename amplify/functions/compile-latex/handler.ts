import type { Schema } from '../../data/resource';

/**
 * Compiles LaTeX to PDF by proxying the LaTeX-on-HTTP service
 * (https://github.com/YtoTech/latex-on-http). Returns a JSON string:
 * { pdfBase64 } on success, { error, log } on failure — same JSON-string
 * transport convention as the AI queries. The proxy keeps the compile
 * backend swappable without touching the frontend.
 */
const COMPILE_URL = 'https://latex.ytotech.com/builds/sync';

export const handler: Schema['compileLatex']['functionHandler'] = async (
  event,
) => {
  const response = await fetch(COMPILE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [{ main: true, content: event.arguments.source }],
    }),
  });

  const buffer = Buffer.from(await response.arrayBuffer());

  if (response.ok && buffer.subarray(0, 4).toString('utf8') === '%PDF') {
    return JSON.stringify({ pdfBase64: buffer.toString('base64') });
  }

  // Compile failures come back as JSON with logs; pass them through so
  // the UI can show WHY the LaTeX didn't compile.
  const body = buffer.toString('utf8');
  let log = body;
  try {
    const parsed = JSON.parse(body) as { logs?: unknown; error?: unknown };
    const detail = parsed.logs ?? parsed.error;
    if (detail !== undefined) {
      log = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
    }
  } catch {
    // keep raw body
  }

  return JSON.stringify({
    error: `Compilation failed (HTTP ${response.status})`,
    log: log.slice(0, 12000),
  });
};
