# Editrim

**A complete design studio in your browser.** Editrim is a working, local-first alternative to Canva for social posts, stories, presentations, posters, resumes, menus, invitations and brand assets — now with an AI studio that can design, write, edit, illustrate and review, plus local photo and video studios.

No account. No watermark. Your designs stay yours. AI runs through a serverless proxy, never from a key in the browser.

> Live: **https://editrim.vercel.app** &nbsp;·&nbsp; Source: **https://github.com/IMMENSE-BUILDER/editrim**

[![License: Apache 2.0](https://img.shields.io/badge/license-Apache--2.0-8A63FF.svg)](LICENSE)

---

## What it does

- **500 hand-built templates** across Instagram, stories, presentations, posters, resumes, menus, invitations, business cards, YouTube, banners, podcasts, identity systems, editorial print, book covers, magazines, album artwork, web pages, certificates, event culture and product campaigns.
- **59 canvas presets** plus custom dimensions up to 6000 × 6000.
- **Canvas-style Home dashboard** at `/dashboard` - left rail with Create, Home, Projects, Templates, Brand, AI Studio, Print and More; a gradient "What will you design today?" hero; glowing universal search across designs, templates and actions; 14 creation shortcuts; a full-screen **Create a design** chooser with category navigation, search, real template previews and layout details; Continue designing; the complete 500-template library with category filters and counts; and a full Projects view with rename, duplicate, download, present and delete.
- **Functional starting points** - Presentation, Social media, Doc, Whiteboard, Upload, Custom size, Printables and Templates open the full-screen **Create a design** chooser, where real templates and size mocks can be inspected before entering the editor. Photo opens the photo editor, Video opens Video Studio or a new video project, and Sheet, Website and Magic Layers explain their honest scope instead of faking media tools.
- **A real editor** — drag, resize, rotate, snap to guides, marquee select, multi-select, group resize, align to page or selection, distribute, tidy up, layer, lock, hide, duplicate, copy/paste and undo/redo.
- **120+ icon interface vocabulary** — one custom `EditrimIcon` set covers navigation, actions, context menus, inspector controls, panels, present mode and every dialog; every glyph has a subtle two-layer ink echo, a bespoke hover gesture and a different press reply chosen from what it does, and the whole set enters with a first-paint stagger. `FormatGlyph` gives all 59 formats their own tone, mark and aspect marker.
- **Photo editor** — `/photo` imports a JPEG, PNG, WebP or GIF and edits it locally: sixteen tonal and colour controls with a live histogram, cropping with aspect presets, rotation and flipping, nine filter presets, draggable text layers, hold-to-compare with the original, undo/redo and PNG/JPEG/WebP export. The source file and the edit stack restore from browser storage. Reachable from the Photo category, dashboard search and the More menu.
- **Light and dark themes** — a labelled switch at the bottom of the dashboard rail flips the whole product between warm paper and deep ink: marketing, templates, dashboard, editor, modals, AI panels and shared view. The choice is stored on the device, applied before first paint, reflected in `color-scheme` and the browser theme colour, and cross-fades only when motion is allowed.
- **Video Studio** — `/videos` keeps multiple projects with search, rename, duplicate and delete. `/video/:id` imports local video, image and audio files, builds a three-track timeline, trims, splits and duplicates clips, adds text and image overlays, mixes volume, previews, autosaves and exports a real WebM with mixed audio. Clip tools include speed, colour correction, video zoom and text motion presets. The last project reopens from browser storage.
- **Right-click canvas menu** — copy, copy/paste style, paste, duplicate and delete; Layer and Align-to-page submenus; group/ungroup; reusable components; local comment pins; lock controls; apply a palette from the selection to the page; download the selection as a transparent PNG; Magic Write and Translate powers.
- **Typography** — 15 self-hosted fonts, weight, size, line-height, letter-spacing, alignment, vertical alignment, uppercase, underline, highlight, outline and drop shadow, plus six one-click text effects (Outline, Shadow, Glow, Highlight, Pill).
- **Shapes & graphics** — 12 vector shapes, lines, 30 line icons, nine built-in photos.
- **Images** — drag and drop your own, automatic compression, replace in place, fit/fill, corner radius, flips, crop zoom and pan, eight frame masks (circle, triangle, diamond, hexagon, star, blob, heart), overlay colour and strength, brightness/contrast/saturation/blur/grayscale/sepia/hue filters and auto-enhance.
- **Pages** — multi-page documents with duplicate, reorder and delete, per-page speaker notes and fade/slide/zoom transitions.
- **Brand hub** — name, colours, heading and body fonts, brand voice, logo uploads and named palettes; apply the kit to one page or the whole design in one undoable step, and run Brand check to find off-brand colours and fonts with a Fix all action.
- **Resize & variants** — pick up to six channel sizes (Instagram, Story, LinkedIn, X, Facebook, A4, Letter, 16:9, 4:3, blog, YouTube) and create real, linked variant designs with an anchor-aware reflow that re-wraps text and keeps images composed.
- **Export suite** — PNG, JPG, WebP, vector SVG and PDF; 1×/2×/3× resolution, transparent backgrounds, JPG/WebP quality, multi-page files, and a print PDF with 0/3/5 mm bleed, crop marks and 150/300 DPI rendering.
- **Present mode** — full-screen, keyboard-driven, autoplay, page progress, speaker-notes overlay, page transitions, black screen, a presenter window with timer, next-slide preview and notes, and cross-window sync.
- **Version history** — automatic snapshots and named checkpoints stored in IndexedDB, with thumbnails, restore, save-a-copy and delete, capped at 40 versions per design.
- **Bulk create** — paste or upload a CSV, map columns to text layers (or use `{{tokens}}`), preview each row and generate up to 100 real pages.
- **Quick actions and inline AI** — a Ctrl K / `/` command palette for every tool, and selection-anchored Rewrite, Shorten, Expand, Tone and Translate actions on any text box with an explicit preview before applying.
- **Share links** — the entire design is compressed into the URL; anyone can view a read-only copy and import an editable one.
- **Autosave** to local storage, with uploaded images stored in IndexedDB.
- **AI Studio (6 tools)** powered by **MiniMax M3.1 Flash** through **Vercel AI Gateway**:
  - **AI Design** — a complete, editable page from a brief, with brand colours and fonts.
  - **AI Edit** — an agent that proposes explicit canvas commands (“make the headline cobalt”), validates them against the real scene, previews a before/after page, and applies them as one undoable step.
  - **AI Write** — generate, rewrite, shorten, expand, translate, or match a saved brand voice.
  - **AI Illustration** — safe, sanitised vector SVG artwork that can be inserted or used as a background.
  - **AI Review** — a real visual critique: the page is rendered to an image and MiniMax inspects it for hierarchy, spacing, contrast and legibility.
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
- jsPDF for raster PDF export, including print bleed and crop marks
- LZ-String for share links
- IndexedDB for uploads, photo sources, video media and version-history snapshots; localStorage for designs, brand kit, photo sessions and video projects
- **Vercel AI Gateway + MiniMax M3.1 Flash** via a serverless AI proxy and matching Vite dev middleware
- **Vercel Web Analytics** for cookieless, aggregate page views on production
- JSON command bus for AI edits: schema validation, locked-node protection, one-step undo
- DOMParser allowlist sanitiser for AI-authored SVG
- No database, no accounts, no auth. Vercel Web Analytics and the AI proxy are the only server-side surfaces.

## Project structure

```
src/
  components/    shared UI, page renderer, modals
  editor/        canvas interactions, inspector, AI Studio, panels, state/history
  hooks/         shared React hooks
  lib/           types, templates, renderer, SVG renderer, AI schemas/commands, storage, export, resize, brand apply, bulk CSV, version history
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
- [docs/THEMING.md](docs/THEMING.md) — the light and dark palettes, surface rules, toggle mechanics and contrast verification.
- [plans/008-photo-editor.md](plans/008-photo-editor.md) — photo editor implementation and verification record.

## Privacy & limits

Editrim is local-first:

- Designs live in your browser's local storage. Clearing site data removes them.
- Uploaded images live in IndexedDB on this device and are never uploaded to a server.
- An imported photo is stored as a single source blob in IndexedDB, with its edit stack in local storage. Both are local; nothing is sent anywhere.
- Video projects keep their media blobs in IndexedDB and project JSON in local storage; nothing is uploaded.
- Vercel Web Analytics records aggregate page views, route paths and referrers on the deployed site. It is cookieless and never receives design content, uploads, AI prompts or account data.
- Designs do not sync across devices. Share links carry a snapshot of the design inside the URL, not on a server.
- Template photos are loaded from Unsplash. Uploads and exports work offline once the page is loaded; remote photos need a connection.
- **AI is opt-in per action.** Text actions send your prompt plus a compact scene description. AI Review renders a temporary snapshot of the current page and sends it for visual inspection. Editrim does not store prompts, scenes or snapshots; Vercel AI Gateway may process them under its own terms.
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
- Studio pro audit: Resize variants create linked designs; text effects apply stroke and highlight; image crop zoom and circle mask transform the layer; marquee selects six layers; tidy up repositions a selection; autosave writes a version snapshot; command palette opens history; export produces real SVG (text and clip paths) and WebP; speaker notes render in present mode; presenter timer runs at `/present/:id?presenter=1`
- Studio responsive audit: command palette, resize studio and export modal fit at 1440, 1366, 1024 and 390 px, in light and dark, with no horizontal overflow
- Version history: IndexedDB snapshots, checkpoint creation, dedupe, restore, save-a-copy, delete, 40-version cap and fail-soft storage
- Bulk create: RFC4180 CSV parsing, delimiter detection, quoted fields/newlines, `{{token}}` merge, column mapping, auto-match, 100-row cap, live row preview and generated pages
- Library expansion: 500 gallery cards / 500 unique IDs, eighteen hand-built packs and every page opened in the real editor, every page at least 6 layers, zero out-of-bounds elements, zero text overflow, zero console errors; sizes and page counts asserted per template
- Brand hub: logo upload to IndexedDB, named palettes, apply-to-page/all-pages with undo, off-brand colour/font audit and Fix all
- Export suite: PNG 2160×2160, JPG `ffd8`, WebP `RIFF/WEBP`, SVG with `<text>`/`<clipPath>` and no `<foreignObject>`, standard and print PDF (`%PDF`, larger MediaBox with 3 mm bleed)
- dashboard rename, duplicate, delete and search
- Home dashboard: search-first routing, 14 categories, Presentation/Doc/Whiteboard/Photo Editor/Video Studio/Sheet/Website creation, image upload, print modal, universal search, project menus, More/Help popovers and a 390 px mobile layout
- Design library: 59 formats across six groups including Desktop/Phone Wallpaper, Facebook Post/Cover/Story/Event, Photo Collage, Certificate, Invoice, Letterhead, Brochure, Postcard, Book/Magazine Cover, Podcast/Album Cover, App Icon, YouTube Banner, Link in Bio, Code, Doc, Document, Sheet, Whiteboard, Mobile/Landscape Video, Newsletter and Your Story; searchable across all formats
- Photo editor: empty state, import, 16 adjustments with pixel-level assertions, blur edge-energy, compare, undo/redo, crop + rotate/flip geometry, filter presets, text layers, drag-and-drop replace, reload restore, PNG/JPEG/WebP export and a 390 px layout
- Video studio: multi-project library, media import, timeline trim/split, speed, colour correction, text motion, reload restore, WebM export and a 390 px layout
- Editor right-click menu: copy/paste, copy/paste style, duplicate/delete, layer and align submenus, group/ungroup, component save + insert + persistence, comment add/resolve/delete + pin, lock/unlock, palette apply + undo, selection PNG download, and Magic Write/Translate handoff to AI Studio
- Motion and accessibility polish: reduced-motion without losing colour feedback, toast exit, origin-aware menus, modal focus trap/restore, button press states, 4.79:1 Home label contrast, and no horizontal overflow at 390 px
- Theme audit: light/dark toggle in the dashboard rail, pre-paint restore, `aria-pressed`, contrast ≥ 4.5 on dashboard, landing, footer, gallery chips, editor inputs and modals, dark AI panel, mobile 390 px fit, cross-fade with reduced-motion bypass
- Icon choreography: 122 bespoke hover gestures, 122 different press replies, live-verified in the browser, disabled-state and keyboard-focus handling, reduced-motion safe
- Engine schema audit: 59 canvas formats, print DPI mappings, 16 font assets, 6 text-effect presets, 8 type pairings, 5 transitions, 35 vectors in 6 clusters, 10 mood palettes, 7 slide archetypes, 3 chart wrappers, reflow without overflow and enforced brand locks
- responsive layouts at 1440, 1600 and 390 px
- **AI health check, design generation, AI editing with preview + apply + undo, AI copy, vector illustration, visual review, and visible diagnostics for gateway/network/validation failures**
- Model verification: `minimax/minimax-m3.1-flash` via server logs and live generation; the public health and AI responses no longer expose model or gateway identity

## Credits

Templates and interface designed for this project. Photos via [Unsplash](https://unsplash.com). Fonts via [Fontsource](https://fontsource.org), plus [Geist Serif](https://vercel.com/font?type=serif) by Vercel under the SIL Open Font License (see `public/fonts/GeistSerif-LICENSE.txt`). Design-content icons via [Lucide](https://lucide.dev); interface iconography is the custom Editrim set. Built with React, Vite and Canvas 2D.

## License

**Apache License 2.0** — see [LICENSE](LICENSE) and [NOTICE](NOTICE).

The license covers the source code and documentation in this repository. Template photos remain subject to the Unsplash License; bundled fonts keep their respective licenses, including the SIL Open Font License for Geist Serif; design-content icons from Lucide remain under the ISC License.
