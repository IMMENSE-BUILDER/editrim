# Vellum

**A complete design studio in your browser.** Vellum is a working, local-first alternative to Canva for social posts, stories, presentations, posters, resumes, menus, invitations and brand assets — now with an AI studio that can design, write, edit, illustrate and review, plus local photo and video studios.

No account. No watermark. Your designs stay yours. AI runs through a serverless proxy, never from a key in the browser.

> Live: **https://vellum-delta-dun.vercel.app** &nbsp;·&nbsp; Source: **https://github.com/IMMENSE-BUILDER/vellum**

---

## What it does

- **20 hand-built templates** across Instagram, stories, presentations, posters, resumes, menus, invitations, business cards, YouTube, banners and podcasts.
- **59 canvas presets** plus custom dimensions up to 6000 × 6000.
- **Canvas-style Home dashboard** at `/dashboard` — left rail with Create, Home, Projects, Templates, Brand, AI Studio, Print and More; a gradient “What will you design today?” hero; glowing universal search across designs, templates and actions; 14 creation shortcuts; Continue designing; Templates for you; and a full Projects view with rename, duplicate, download, present and delete.
- **Functional starting points** — Presentation, Social media, Doc, Whiteboard, Upload, Custom size, Printables and Templates create real editable designs. Photo opens the photo editor, Video opens Video Studio, and Sheet, Website and Magic Layers explain their honest scope instead of faking media tools. The Create modal is a **59-format design library** grouped into Social, Presentation, Print, Brand, Web and Docs, with search across every format.
- **A real editor** — drag, resize, rotate, snap to guides, multi-select, group resize, align, distribute, layer, lock, hide, duplicate, copy/paste and undo/redo.
- **120+ icon interface vocabulary** — one custom `VellumIcon` set covers navigation, actions, context menus, inspector controls, panels, present mode and every dialog; every glyph has a subtle two-layer ink echo, a bespoke hover gesture and a different press reply chosen from what it does, and the whole set enters with a first-paint stagger. `FormatGlyph` gives all 59 formats their own tone, mark and aspect marker.
- **Photo editor** — `/photo` imports a JPEG, PNG, WebP or GIF and edits it locally: sixteen tonal and colour controls with a live histogram, cropping with aspect presets, rotation and flipping, nine filter presets, draggable text layers, hold-to-compare with the original, undo/redo and PNG/JPEG/WebP export. The source file and the edit stack restore from browser storage. Reachable from the Photo category, dashboard search and the More menu.
- **Video Studio** — `/videos` keeps multiple projects with search, rename, duplicate and delete. `/video/:id` imports local video, image and audio files, builds a three-track timeline, trims, splits and duplicates clips, adds text and image overlays, mixes volume, previews, autosaves and exports a real WebM with mixed audio. Clip tools include speed, colour correction, video zoom and text motion presets. The last project reopens from browser storage.
- **Right-click canvas menu** — copy, copy/paste style, paste, duplicate and delete; Layer and Align-to-page submenus; group/ungroup; reusable components; local comment pins; lock controls; apply a palette from the selection to the page; download the selection as a transparent PNG; Magic Write and Translate powers.
- **Typography** — 15 self-hosted fonts, weight, size, line-height, letter-spacing, alignment, uppercase, underline, highlight, outline and drop shadow.
- **Shapes & graphics** — 12 vector shapes, lines, 30 line icons, nine built-in photos.
- **Images** — drag and drop your own, automatic compression, fit/fill, corner radius, flips, brightness/contrast/saturation/blur/grayscale filters.
- **Pages** — multi-page documents with duplicate, reorder and delete.
- **Brand kit** — saved colours and fonts, available in every design.
- **One-click resize** — content scales proportionally and re-centres on any new canvas.
- **Export** — PNG, JPG and PDF at 1×/2×/3×, transparent PNG, multi-page PDF.
- **Present mode** — full-screen, keyboard-driven, autoplay and page progress.
- **Share links** — the entire design is compressed into the URL; anyone can view a read-only copy and import an editable one.
- **Autosave** to local storage, with uploaded images stored in IndexedDB.
- **AI Studio (6 tools)** powered by **Xiaomi MiMo V2.6 Flash** through **Vercel AI Gateway**:
  - **AI Design** — a complete, editable page from a brief, with brand colours and fonts.
  - **AI Edit** — an agent that proposes explicit canvas commands (“make the headline cobalt”), validates them against the real scene, previews a before/after page, and applies them as one undoable step.
  - **AI Write** — generate, rewrite, shorten, expand, translate, or match a saved brand voice.
  - **AI Illustration** — safe, sanitised vector SVG artwork that can be inserted or used as a background.
  - **AI Review** — a real visual critique: the page is rendered to an image and MiMo inspects it for hierarchy, spacing, contrast and legibility.
  - **AI Translate** — selected text into 16 languages.
- **Responsive marketing site, template gallery and dashboard**, plus an editor that works on a tablet and remains accessible on a phone.

## Quick start

```bash
npm install
cp .env.example .env.local   # add your Vercel AI Gateway key
npm run dev
# http://127.0.0.1:5173
```

`AI_GATEWAY_API_KEY` is read only by the local Vite middleware and the Vercel function. It is never included in the client bundle. The editor and all non-AI features work without it; AI actions show a configuration error instead.

Production build:

```bash
npm run build
npm run preview
```

## Deploy

Vercel hosts both the static app and the `api/ai.js` serverless proxy. The project is connected to GitHub, so pushes to `main` deploy automatically.

```bash
vercel env add AI_GATEWAY_API_KEY production
vercel env add AI_GATEWAY_API_KEY preview
vercel --prod
```

Build command `npm run build`, output `dist`. The AI function gets a 60s max duration; no key is exposed to the browser.

## Tech

- React 18 + TypeScript + Vite
- React Router
- Self-hosted Google fonts via Fontsource
- Canvas 2D renderer for exports (text wrapping, gradients, shadows, image filters)
- Canvas 2D photo pipeline: rotate/flip → exact source crop → tonal pass → text, with a draft preview while controls move and a full-resolution export
- jsPDF for PDF export
- LZ-String for share links
- IndexedDB for uploads, photo sources and video media; localStorage for designs, brand kit, photo sessions and video projects
- **Vercel AI Gateway + Xiaomi MiMo V2.6 Flash** via a serverless AI proxy and matching Vite dev middleware
- JSON command bus for AI edits: schema validation, locked-node protection, one-step undo
- DOMParser allowlist sanitiser for AI-authored SVG
- No database, no auth, no analytics. Only the AI proxy is server-side.

## Project structure

```
src/
  components/    shared UI, page renderer, modals
  editor/        canvas interactions, inspector, AI Studio, panels, state/history
  hooks/         shared React hooks
  lib/           types, templates, renderer, AI schemas/commands, storage, export
  lib/engine/    canvas, typography, timeline, vector, color, presentation, layout, brand schemas
  lib/photo/     photo settings, crop maths, pixel pipeline and IndexedDB source
  lib/video/     video project storage, media cache and canvas renderer
  pages/         landing, home dashboard, templates, editor, video library/editor, photo editor, present, shared view
  styles/        design tokens and surface styles
server/          shared AI core (prompts, gateway call, validation)
api/             Vercel serverless AI endpoint
docs/            feature research, engine schema and AI architecture notes
scripts/         Playwright QA scripts and fixtures used during development
```

Further reading:

- [docs/AI-RESEARCH.md](docs/AI-RESEARCH.md) — Canva/advanced-feature research, the honest competitive matrix and the AI architecture decisions.
- [docs/ENGINE-SCHEMA.md](docs/ENGINE-SCHEMA.md) — core canvas, typography, timeline, vector, color, presentation, layout and brand schemas, plus the local photo/video document formats.
- [docs/VIDEO-RESEARCH.md](docs/VIDEO-RESEARCH.md) — video-editor research and the deliberately excluded scope.
- [docs/PHOTO-RESEARCH.md](docs/PHOTO-RESEARCH.md) — photo-editor research, adopted control set and excluded AI imagery tools.
- [docs/ICON-CHOREOGRAPHY.md](docs/ICON-CHOREOGRAPHY.md) — every glyph's hover gesture and press reply, with the mechanics behind them.
- [plans/008-photo-editor.md](plans/008-photo-editor.md) — photo editor implementation and verification record.

## Privacy & limits

Vellum is local-first:

- Designs live in your browser's local storage. Clearing site data removes them.
- Uploaded images live in IndexedDB on this device and are never uploaded to a server.
- An imported photo is stored as a single source blob in IndexedDB, with its edit stack in local storage. Both are local; nothing is sent anywhere.
- Video projects keep their media blobs in IndexedDB and project JSON in local storage; nothing is uploaded.
- Designs do not sync across devices. Share links carry a snapshot of the design inside the URL, not on a server.
- Template photos are loaded from Unsplash. Uploads and exports work offline once the page is loaded; remote photos need a connection.
- **AI is opt-in per action.** Text actions send your prompt plus a compact scene description. AI Review renders a temporary snapshot of the current page and sends it for visual inspection. Vellum does not store prompts, scenes or snapshots; Vercel AI Gateway may process them under its own terms.
- AI results are drafts. They are previewed before insertion, and AI edits are shown as explicit commands before they can be applied. AI can be wrong.
- **Not implemented:** image segmentation (background remover/Magic Eraser), inpainting, generated video/audio, real-time multiplayer, cloud sync, social scheduling, print fulfilment, and Canva's asset library. The UI does not pretend they exist. The photo editor's adjustments are deterministic Canvas maths, not generative AI.

## QA

The app was tested end-to-end with Playwright against Chrome:

- template → edit → drag/resize/rotate → undo/redo
- text editing, font and colour changes, alignment, multi-select, copy/paste
- layer hide/lock, page duplicate/reorder/delete, resize
- PNG (incl. transparent), JPG and multi-page PDF downloads
- uploads persisted through reload
- share link preview and editable import
- present mode navigation
- dashboard rename, duplicate, delete and search
- Home dashboard: search-first routing, 14 categories, Presentation/Doc/Whiteboard/Photo Editor/Video Studio/Sheet/Website creation, image upload, print modal, universal search, project menus, More/Help popovers and a 390 px mobile layout
- Design library: 59 formats across six groups including Desktop/Phone Wallpaper, Facebook Post/Cover/Story/Event, Photo Collage, Certificate, Invoice, Letterhead, Brochure, Postcard, Book/Magazine Cover, Podcast/Album Cover, App Icon, YouTube Banner, Link in Bio, Code, Doc, Document, Sheet, Whiteboard, Mobile/Landscape Video, Newsletter and Your Story; searchable across all formats
- Photo editor: empty state, import, 16 adjustments with pixel-level assertions, blur edge-energy, compare, undo/redo, crop + rotate/flip geometry, filter presets, text layers, drag-and-drop replace, reload restore, PNG/JPEG/WebP export and a 390 px layout
- Video studio: multi-project library, media import, timeline trim/split, speed, colour correction, text motion, reload restore, WebM export and a 390 px layout
- Editor right-click menu: copy/paste, copy/paste style, duplicate/delete, layer and align submenus, group/ungroup, component save + insert + persistence, comment add/resolve/delete + pin, lock/unlock, palette apply + undo, selection PNG download, and Magic Write/Translate handoff to AI Studio
- Motion and accessibility polish: reduced-motion without losing colour feedback, toast exit, origin-aware menus, modal focus trap/restore, button press states, 4.79:1 Home label contrast, and no horizontal overflow at 390 px
- Icon choreography: 121 bespoke hover gestures, 121 different press replies, live-verified in the browser, disabled-state and keyboard-focus handling, reduced-motion safe
- Engine schema audit: 59 canvas formats, print DPI mappings, 16 font assets, 6 text-effect presets, 8 type pairings, 5 transitions, 35 vectors in 6 clusters, 10 mood palettes, 7 slide archetypes, 3 chart wrappers, reflow without overflow and enforced brand locks
- responsive layouts at 1440, 1600 and 390 px
- **AI health check, design generation, AI editing with preview + apply + undo, AI copy, vector illustration, visual review, and visible diagnostics for gateway/network/validation failures**
- Model verification: `xiaomi/mimo-v2.6-flash` via Vercel AI Gateway, verified from `/api/ai` health and request logs

## Credits

Templates and interface designed for this project. Photos via [Unsplash](https://unsplash.com). Fonts via [Fontsource](https://fontsource.org), plus [Geist Serif](https://vercel.com/font?type=serif) by Vercel under the SIL Open Font License (see `public/fonts/GeistSerif-LICENSE.txt`). Design-content icons via [Lucide](https://lucide.dev); interface iconography is the custom Vellum set. Built with React, Vite and Canvas 2D.

## License

MIT — see [LICENSE](LICENSE). Template photos remain subject to the Unsplash licence.
