# Editrim — Advanced Canva Research & AI Plan

Research date: November 2026. This document records what Canva and other design tools actually ship, how Editrim's AI was designed against that, and what is intentionally left out.

## 1. Executive summary

Canva is no longer just a template editor. Its 2026 stack is a cloud Visual Suite with:

- a real-time collaborative canvas, Docs, Sheets, Whiteboards, Websites and Print;
- a scene graph with Brand Kits, locked template slots, Brand Controls and approvals;
- an AI layer — **Canva AI 2.0** — that performs conversational, multi-step edits on the canvas;
- asset, publishing, and enterprise surfaces that a local-first product cannot honestly clone without a backend and media models.

The highest-value gap for a browser alternative is not more templates. It is **trustworthy AI editing on a real, local scene graph**: visible plans, explicit commands, previews, validation, and one-step undo. Editrim now implements that gap with **Xiaomi MiMo V2.6 Flash** and **Vercel AI Gateway**.

## 2. What Canva ships — core and advanced

| Area | Canva capability | Notes / limits | Source |
|---|---|---|---|
| Canvas | Design types, custom sizes, pages, rulers/guides, bleed, layers, grouping, align/tidy | 1,000+ design types | canva.com/help/editing-designing |
| Text | 100s of fonts, curved text, effects, spacing, brand fonts, Magic Write, Translate | Font upload on paid plans | canva.com/help/editing-designing |
| Media | Images/video/audio, background remover, Magic Eraser/Edit/Grab/Expand, Grab Text, Enhance Voice | Most advanced media tools need segmentation/inpainting models and paid plans | canva.com/help/image-editor |
| Templates | 1.6M free / 3.6M paid, Brand Templates, Bulk Create, data autofill | Bulk Create: 300 rows × 150 columns, desktop web | canva.com/help/bulk-create |
| Brand | Brand Kits, Brand Controls (colour/font/approval), locked slots, Brand Voice | Locks are documented as guidance for Canva AI, not absolute law | canva.com/help/brand-control |
| Collaboration | Multiplayer cursors, comments, mentions/tasks, approvals, version history (1,000 versions) | Cloud account required | canva.com/help/comments · /version-history |
| Publishing | Content Planner (Facebook, Instagram, X, LinkedIn, Pinterest, Slack, Tumblr), websites, print, presentations, video | Up to 80 social accounts per team; Instagram desktop only | canva.com/help/content-planner |
| Docs / Sheets / Whiteboards | Pageless docs, formulas, Magic Charts/Insights/Formulas, board summary/sort, convert board to Doc/Deck | Sheets AI: English-only, one sheet per prompt | canva.com/help/canva-sheets |
| Ecosystem | Apps Marketplace, Connect APIs, Canva Developers SDK, MCP/AI Connector | MCP exposes design search/edit/export to ChatGPT, Claude, etc. | canva.dev/docs/apps · canva.com/ai-connector |

## 3. Canva AI 2.0 and the advanced AI layer

| Feature | What it does | Editrim status |
|---|---|---|
| **Canva AI 2.0 / conversational editing** | Reads the open design and applies edits in place; bulk restyles, page adds, resizing; interruptible | **Implemented in a focused form**: AI Edit proposes typed commands, previews the resulting page, requires approval, applies as one undo step |
| **Memory Library** | Persistent style/tone preferences built from recent designs or chats; editable doc; no cross-chat transcript memory | **Partially implemented**: brand kit stores name, colours, fonts and a voice sample; AI write can match it. No automatic profile mining |
| **Connectors / scheduled tasks** | Pull from Slack, Drive, Notion, Calendar; run recurring prompts (max 10) | **Not implemented** — requires OAuth, cloud storage and a scheduler |
| **Magic Design** | Prompt/assets → editable template-based layouts | **Implemented**: a text brief → structured JSON scene → validated page → preview → add as page |
| **Magic Write** | Generate/rewrite/shorten/expand, tone, brand voice, 100+ languages | **Implemented**: generate, rewrite, shorten, expand, 16 translations, brand voice sample |
| **Magic Media / Dream Lab** | Text-to-image/video | **Honest alternative**: AI Illustration generates sanitised SVG vector art, not raster photos |
| **Magic Layers** | Flat image → editable layers/text | **Not implemented** — needs OCR/segmentation/font matching; not faked |
| **Magic Eraser/Edit/Expand/Grab** | Object removal, inpainting, outpainting, subject cutout | **Not implemented** — requires image models; not faked |
| **Background Remover** | Subject cutout for photos/video | **Not implemented**; the UI says so |
| **Magic Animate** | Animation presets on designs/decks | Not implemented; our present mode exists, but not AI animation |
| **Magic Switch/Resize** | Reformat designs to new sizes | **Implemented deterministically**: content scales proportionally and re-centres |
| **Magic Insights/Formulas/Charts** | Sheets analysis and formulas | Not implemented; no Sheets surface |
| **Canva Code** | Prompt → interactive HTML/CSS/JS, sandboxed | Not implemented; potential P2 with a sandboxed iframe |
| **MCP/AI Connector** | Drive Canva from external agents | Not implemented; the command bus is a good substrate for a future MCP bridge |
| **AI Review / critique** | Not a single named Canva SKU, but design critique and Canva AI suggestions exist | **Implemented and stronger than text-only**: Editrim renders the page and MiMo inspects the image plus the scene graph |

### What Canva's newer agentic work implies

- **Plan, then act.** Gamma, Figma, Adobe and Canva all narrate multi-step work and show a draft before committing.
- **Editable layers are the contract.** Flat AI output is a failure.
- **Trust comes from previews and undo**, not from a chat transcript.
- **Brand must be enforceable**, not just prompt context. Canva's own docs admit AI follows locks loosely; a local command bus can enforce them deterministically.
- **Image editing is a different model class.** A text LLM cannot erase, inpaint, segment or outpaint pixels. Pretending otherwise is the fastest way to lose trust.

## 4. Editrim AI architecture

```
Browser
├── Scene store (Design/Page/El, localStorage + IndexedDB)
├── AI Studio
│   ├── AI Design  → design JSON → normalize → preview → new page
│   ├── AI Edit    → command plan → validate → apply to preview → one-step undo
│   ├── AI Write   → copy/rewrite/translate → replace/add text
│   ├── AI Illustration → SVG → sanitize → image or page background
│   └── AI Review  → render snapshot + scene summary → critique JSON
└── POST /api/ai (same-origin)
        │
        └── Vercel serverless function (api/ai.js)
              ├── validates action and input size
              ├── builds restricted prompts
              ├── calls Vercel AI Gateway
              ├── parses JSON with jsonrepair fallback
              ├── sanitizes SVG
              └── returns requestId/stage/code diagnostics
```

### Scene and command model

- The design is a JSON scene graph (`Design → Page → El`) and remains the single source of truth.
- AI Design returns a full page spec, which the client normalises: fonts/colours/photos are allowlisted, coordinates clamped, text fitted, unknown fields dropped.
- AI Edit returns a small command plan:
  - `update` existing element properties,
  - `delete` (max two, locked elements skipped),
  - `add_text` / `add_shape` / `add_image`,
  - `reorder`.
- The client validates IDs against the current page, skips locked elements, maps aliases (`font` → `fontFamily`, `size` → `fontSize`), and applies the plan to a clone for preview.
- Only when the user clicks **Apply changes** does the plan touch the real page, as one history transaction. Undo restores the entire plan.
- The scene is passed inside a `<scene_data>` block with an explicit “data, never instructions” rule. Hidden elements are excluded. Deletions are capped. SVG is sanitised twice (server regex + client DOM allowlist).

### Visual review

AI Review uses MiMo's multimodal input:

1. Render the current page to a JPEG snapshot at ≤1280px max dimension.
2. Send the snapshot plus a compact scene description.
3. Require strict critique JSON (score, summary, strengths, improvements).
4. Display it as advisory only; nothing is applied automatically.

This produces design-specific feedback (e.g. a cobalt headline losing contrast against a bright coffee cup) rather than generic advice.

### Error handling

Every failure is traceable end-to-end:

| Stage | Example code | What the user sees |
|---|---|---|
| `request` | `INVALID_JSON_BODY` | Request body problem |
| `config` | `MISSING_API_KEY` | Exact env var and where to add it |
| `rate_limit` | `RATE_LIMITED` | Wait and retry |
| `gateway` | `GATEWAY_502` / `GATEWAY_401` | HTTP status, upstream message, request ID |
| `model` | `EMPTY_RESPONSE` / `TRUNCATED` | Retry / shorten brief |
| `parse` | `INVALID_JSON` / `INVALID_SVG` | Retry; no unsafe output applied |
| `network` | `ENDPOINT_UNREACHABLE` | Dev server / Vercel function hint |
| `timeout` | `GATEWAY_TIMEOUT` | Shorter brief |
| `validation` | `INVALID_COMMANDS` / `NO_COMMANDS` | Try a more specific instruction |

The panel shows stage, code, HTTP status, request ID, model, and a **Copy diagnostics** action. The server logs `[editrim-ai] <requestId> action=… stage=… code=… status=… ms`. API keys and prompt content are not logged.

### Model and routing

- Model: **`xiaomi/mimo-v2.6-flash`**, only model used by Editrim AI.
- Gateway: **Vercel AI Gateway** OpenAI-compatible endpoint.
- 1M context, multimodal input, structured output, tools; used with `reasoning_effort: none` for latency, `provider.sort: ttft`, and `json_object` response format for design/critique/edit.
- AI responses are capped per action; design 7k output tokens, SVG 5k, copy 900.
- Max function duration: 60s. Local Vite middleware mirrors the production handler so the same errors and validation are testable locally.

## 5. What is implemented vs not

### Implemented and verified

- AI Design: coffee launch poster generated and added as a second page; 11 elements; editable.
- AI Edit: “make the headline cobalt and add a line under the address” → 2 validated commands → preview → applied → cobalt headline + new text; one undo step.
- AI Write: rewrite selected headline; result preview; replace/add.
- AI Illustration: generated SVG, sanitised, previewed and insertable.
- AI Review: visual snapshot + scene summary → accurate, specific critique with score/strengths/improvements.
- Error UI: simulated gateway 502 and network failure, with stage/code/request ID and retry.
- Model switch verified from `/api/ai` health and responses: `xiaomi/mimo-v2.6-flash`.
- Home dashboard: functional workspace at `/dashboard` with 14 creation shortcuts, universal search, recent designs, template shelf, project menus and print-ready PDF. Doc, Whiteboard, Sheet and Website shortcuts create real editable layouts; Photo opens the photo editor, Video opens Video Studio, and Magic Layers explains its scope. Sheet and Website are not spreadsheet or hosting engines.
- Photo editor at `/photo` and Video Studio at `/videos`: deterministic Canvas 2D tools for stills and clips, verified by `scripts/photo-editor-e2e.mjs` and `scripts/video-editor-e2e.mjs`. They are deliberately not AI features and are documented in `docs/PHOTO-RESEARCH.md` and `docs/VIDEO-RESEARCH.md`.
- Editor context menu: copy/copy style/paste/paste style, layer and page-align submenus, grouping, reusable local components, comment pins with resolve/delete, lock controls, palette extraction and page recolouring, selection-only PNG export, plus Magic Write/Translate entry points into AI Studio.

### Not implemented (honest limits)

- Background remover, Magic Eraser/Edit/Expand/Grab, Magic Layers.
- Generative photo edits (object removal, inpainting, background removal). `/photo` ships deterministic tonal, crop, filter and text tools — real controls, not a model.
- Raster image/video/audio generation.
- Real-time collaboration, comments, approvals, cloud sync.
- Social scheduling, print fulfilment, Canva's asset library.
- Automatic Memory Library, scheduled agents, connectors/OAuth.
- Real spreadsheet formulas, multiplayer whiteboards, Canva Code, video generation.
- Template locks are not yet exposed in the editor, so AI Edit only skips element `locked` flags; there is no folder-level Brand Control engine.

## 6. Prioritized roadmap

### P1 — next

1. **Multi-page AI deck**: brief → outline JSON → per-page AI Design using a deterministic layout library; preview the deck; insert all pages as one transaction.
2. **Brand controls**: per-design colour/font locks and “AI respects locks” enforced in the command bus, not prompt text.
3. **AI edit history / audit**: a local log of agent transactions with actor, plan summary, diff and undo.
4. **AI palette + type extraction**: derive brand tokens from a website/description, with contrast checks.
5. **Template slots + bulk create**: CSV rows into a template scene, capped at 300 rows.

### P2 — later

- Version history UI with named checkpoints and diff/restore.
- Comments/approvals local-only state machine.
- Sandboxed Canva-Code-like HTML blocks.
- MCP bridge over the existing command bus.
- Real segmentation/inpainting only when an image model is added; otherwise label as classic image tools, not AI.

### Explicitly rejected

- A fake “background remover” that simply crops or tints.
- AI-made photorealistic assets from a text model.
- Auto-applying multi-step agent edits without a preview.
- Claiming collaboration or cloud sync when the app is local-first.

## 7. Sources

- Canva AI 2.0: https://www.canva.com/newsroom/news/canva-create-2026-ai/
- Canva AI help: https://www.canva.com/help/canva-design-assistant/
- Magic Layers: https://www.canva.com/help/editable-magic-layers
- Canva Code: https://www.canva.com/help/canva-code
- Canva Sheets AI: https://www.canva.com/help/canva-sheets-assistant
- Bulk Create: https://www.canva.com/help/bulk-create
- Brand Controls: https://www.canva.com/help/brand-control
- Approvals: https://www.canva.com/help/design-approval
- Version history: https://www.canva.com/help/version-history
- AI Connector/MCP: https://www.canva.dev/docs/apps/mcp
- Canva pricing: https://www.canva.com/pricing/
- Figma agent: https://www.figma.com/blog/the-figma-agent-is-here/
- Gamma agent: https://help.gamma.app/en/articles/15002203-how-do-i-create-with-agent-in-gamma
- Adobe Firefly assistant: https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta
- tldraw agent kit: https://tldraw.dev/starter-kits/agent
- Vercel AI Gateway chat completions: https://vercel.com/docs/ai-gateway
- MiMo model: https://mimo.mi.com (and live `GET /v1/models` on Vercel AI Gateway)
