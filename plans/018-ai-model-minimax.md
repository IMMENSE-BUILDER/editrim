# AI model: MiniMax M3.1 Flash

The AI Studio model changed from `xiaomi/mimo-v2.6-flash` to **`minimax/minimax-m3.1-flash`**.

## Changed

- `server/aiCore.js` — `AI_MODEL`, used by every AI action; the health response no longer exposes it.
- `api/ai.js` and `vite.config.ts` — validation/network fallbacks no longer report the model.
- `src/lib/ai.ts` — public model/gateway labels removed; diagnostics carry only action, stage, code, status and request ID.
- Landing FAQ, AI badge/model chip, dashboard AI popover and AI Review privacy note now say **AI Studio** / **AI service**, with no model or gateway identity.
- README, DESIGN.md and AI research docs retain the technical model and routing as documentation.
- AI tests updated to the new model and made robust about the expected mocked 502 console messages.

## Verification against the real gateway

| Action | Result | Time |
|---|---|---|
| write | `200` — tagline returned | 1.6s |
| design | `200` — 13 editable elements | 4.9s |
| translate | `200` — French copy | 0.8s |
| illustration | `200` — sanitised SVG | 5.0s |
| critique | `200` — visual score 82 on a real page | 4.5s |
| edit | `200` — 2 validated canvas commands | 1.5s |

Health response returns only availability, not provider identity:

```json
{"ok":true,"configured":true,"message":"AI service configured."}
```

Every AI response, error and diagnostic omits the model ID and gateway. UI copy says “AI Studio” / “AI service”; the technical model and routing stay in this document and the repo docs.

A 1×1 test image produced a gateway decode error, which confirmed the failure path; a real rendered page passed visual review. The local server limits requests to 30 per 10 minutes, so the repeated smoke tests are spaced or the server is restarted between runs.

## Tests

```text
npx tsc --noEmit                    TSC=0
npm run build                       ✓ built
node scripts/ai-e2e.mjs             AI E2E OK
node scripts/mimo-ai-e2e.mjs        AI STUDIO E2E OK
node scripts/ai-error-e2e.mjs       ERROR UI OK
node scripts/mimo-design-e2e.mjs    AI DESIGN/EDIT OK
```
