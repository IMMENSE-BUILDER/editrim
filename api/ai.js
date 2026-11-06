import { runAi, aiHealth } from '../server/aiCore.js';

export const config = { maxDuration: 60 };

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 4_000_000) {
        reject(new Error('Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    if (req.method === 'GET') {
      res.statusCode = 200;
      res.end(JSON.stringify(aiHealth(Boolean(process.env.AI_GATEWAY_API_KEY))));
      return;
    }
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed.', stage: 'request', code: 'METHOD_NOT_ALLOWED' }));
    return;
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string') payload = JSON.parse(payload);
    if (!payload) {
      const raw = await readBody(req);
      payload = JSON.parse(raw || '{}');
    }
    const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
    const result = await runAi(payload, {
      apiKey: process.env.AI_GATEWAY_API_KEY,
      ip,
    });
    res.statusCode = result.status;
    res.end(JSON.stringify(result.body));
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({
      ok: false,
      error: 'The AI request body was not valid JSON.',
      stage: 'request',
      code: 'INVALID_JSON_BODY',
      status: 400,
      requestId: `ai_${Date.now().toString(36)}`,
      model: 'minimax/minimax-m3.1-flash',
    }));
  }
}
