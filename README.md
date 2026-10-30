# Vellum

**A complete design studio in your browser.** Vellum is a working, local-first alternative to Canva for social posts, stories, presentations, posters, resumes, menus, invitations and brand assets.

No account. No backend. No watermark. Design, present, share and export — all in the browser.

> Live: **https://vellum-delta-dun.vercel.app** &nbsp;·&nbsp; Source: **https://github.com/IMMENSE-BUILDER/vellum**

---

## What it does

- **20 hand-built templates** across Instagram, stories, presentations, posters, resumes, menus, invitations, business cards, YouTube, banners and podcasts.
- **24 canvas presets** plus custom dimensions up to 6000 × 6000.
- **A real editor** — drag, resize, rotate, snap to guides, multi-select, group resize, align, distribute, layer, lock, hide, duplicate, copy/paste and undo/redo.
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
- **Responsive marketing site, template gallery and dashboard**, plus an editor that works on a tablet and remains accessible on a phone.

## Quick start

```bash
npm install
npm run dev
# http://127.0.0.1:5173
```

Production build:

```bash
npm run build
npm run preview
```

## Deploy

The repo is a standard static Vite app with a SPA rewrite in `vercel.json`.

```bash
npm i -g vercel
vercel --prod
```

Or import `IMMENSE-BUILDER/vellum` in Vercel. Build command `npm run build`, output `dist`.

## Tech

- React 18 + TypeScript + Vite
- React Router
- Self-hosted Google fonts via Fontsource
- Canvas 2D renderer for exports (text wrapping, gradients, shadows, image filters)
- jsPDF for PDF export
- LZ-String for share links
- IndexedDB for uploads, localStorage for designs and brand kit
- No backend, no database, no auth, no analytics

## Project structure

```
src/
  components/    shared UI, page renderer, modals
  editor/        canvas interactions, inspector, panels, state/history
  lib/           types, templates, renderer, export, storage, share
  pages/         landing, templates, dashboard, editor, present, shared view
  styles/        design tokens and surface styles
scripts/         Playwright QA scripts used during development
```

## Privacy & limits

Vellum is intentionally local-first:

- Designs live in your browser's local storage. Clearing site data removes them.
- Uploaded images live in IndexedDB on this device and are never uploaded to a server.
- Designs do not sync across devices. Share links carry a snapshot of the design inside the URL, not on a server.
- Template photos are loaded from Unsplash. Uploads and exports work offline once the page is loaded; remote photos need a connection.
- Collaboration and cloud sync are explicitly not implemented.

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
- responsive layouts at 1440, 1600 and 390 px

## Credits

Templates and interface designed for this project. Photos via [Unsplash](https://unsplash.com). Fonts via [Fontsource](https://fontsource.org). Icons via [Lucide](https://lucide.dev). Built with React, Vite and Three-free Canvas 2D.

## License

MIT — see [LICENSE](LICENSE). Template photos remain subject to the Unsplash licence.
