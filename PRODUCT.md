# Editrim — Product Brief

## What it is
Editrim is a browser-based design studio: a complete, working alternative to Canva for social posts, stories, presentations, posters, resumes, menus, invitations and brand assets. No install, no account. Designs live in the browser and export as PNG, JPG, WebP, vector SVG or PDF — including a print PDF with bleed and crop marks. An AI Studio adds editable copy, layouts, command-based edits, vector illustrations, translation, visual critique, and selection-scoped inline rewrites. A brand hub, resize variants, CSV bulk create, version history and a presenter window cover the production workflow. A photo editor and a video studio handle local stills and clips on the same device.

## Who it is for
People who need polished visuals without a design background: small-business owners, students, creators, and teams making a last-minute deck or launch post.

## Surfaces
- **Landing (`/`)** — Persuade. Convince a first-time visitor that a professional-looking result is 60 seconds away, and show real work.
- **Template gallery (`/templates`)** — Experience. Let the work lead; browse and start from real templates.
- **Dashboard (`/dashboard`)** — Operate. Reach a recent design or start a new one in one click.
- **Editor (`/editor/:id`)** — Operate. Fast, quiet, predictable. The design is the hero; the chrome recedes.
- **Video library (`/videos`)** — Operate. Find, create, rename, duplicate or delete video projects before opening one.
- **Video editor (`/video/:id`)** — Operate. Media, preview/timeline and clip properties in three regions.
- **Photo editor (`/photo`)** — Operate. One photo, four modes: Adjust, Crop, Filters, Text.
- **Present (`/present/:id`)** — Experience. Full-bleed pages, minimal controls, speaker notes and a separate presenter window.
- **Version history** — Trust. Every design keeps local snapshots; restore one without leaving the canvas.

## Core promises
1. **Real editing, not a mockup.** Move, resize, rotate, snap, marquee select, layer, align, style text, crop and mask images, upload and replace images, undo/redo, multi-page, present, export — plus a photo editor that processes real pixels and a video studio that exports a real WebM.
2. **Start fast, finish anywhere.** 20 hand-built templates, 59 size presets, resize variants for every channel, CSV bulk create, brand kits that restyle a whole design, and export to five formats.
3. **Yours.** Projects autosave locally with version history, export without watermarks, work offline after first load. Imported photos and video media never leave the device.
4. **No dark patterns.** No sign-up wall, no paywall. AI is opt-in, previewed before it changes anything, and honestly scoped. Everything shown is usable.
5. **Your room, your light.** A labelled light/dark switch at the bottom of the dashboard rail changes the whole product — marketing, dashboard, editor and dialogs — and the choice is remembered on the device.

## Studio tools
- **Brand hub** — logos, named palettes, heading/body fonts, brand voice, one-click restyle of a page or the whole design, and a brand check with Fix all.
- **Resize & variants** — up to six channel sizes at once, anchor-aware reflow, and real linked designs rather than stretched copies.
- **Bulk create** — CSV rows become pages through column mapping or `{{tokens}}`, previewed before generation and capped at 100.
- **Version history** — IndexedDB snapshots every few minutes plus named checkpoints; restore, save a copy or delete.
- **Quick actions** — Ctrl K or `/` opens a keyboard command palette covering every tool.
- **Inline AI** — Rewrite, Shorten, Expand, Tone and Translate on a selected text box, with a before/after preview and explicit Replace or Insert.
- **Presenter view** — notes per page, fade/slide/zoom transitions, timer, next-slide preview and synced audience window.

## AI Studio
- **AI Design** — a full editable page from a brief; adds as a new page after preview.
- **AI Edit** — an agent that proposes typed canvas commands; validated against the real scene, previewed, applied as one undoable step. Locked elements are skipped and deletions are capped.
- **AI Write** — generate, rewrite, shorten, expand, match a saved brand voice and translate.
- **AI Illustration** — sanitised vector SVG, insertable or used as a background.
- **AI Review** — renders the actual page and sends a temporary snapshot for visual critique plus a scene summary.
- **Error transparency** — stage, code, HTTP status and request ID are visible, with retry and copy-diagnostics.

## Non-goals
- Multiplayer collaboration, cloud sync, social scheduling, print fulfilment or billing.
- Image segmentation/inpainting, AI video/audio, or Magic Layers without a suitable media model. These are not faked. The photo editor's adjustments and the video studio's filters are deterministic maths, not AI.
- Claiming a feature exists when it does not.

## Success
A visitor can go from landing page to a downloaded, designed PNG in under two minutes without instructions.
