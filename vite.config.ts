import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { runAi, aiHealth } from './server/aiCore.js';

function readJsonBody(req) {
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
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function aiDevPlugin(apiKey) {
  return {
    name: 'editrim-ai-dev',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        if (req.method === 'GET') {
          res.statusCode = 200;
          res.end(JSON.stringify(aiHealth(Boolean(apiKey))));
          return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ ok: false, error: 'Method not allowed.', stage: 'request', code: 'METHOD_NOT_ALLOWED' }));
          return;
        }
        try {
          const payload = await readJsonBody(req);
          const result = await runAi(payload, {
            apiKey,
            ip: req.socket.remoteAddress,
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
          }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), aiDevPlugin(env.AI_GATEWAY_API_KEY)],
    server: { port: 5173 },
    build: { chunkSizeWarningLimit: 1600 },
  };
});
