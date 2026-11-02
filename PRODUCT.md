# Vellum — Product Brief

## What it is
Vellum is a browser-based design studio: a complete, working alternative to Canva for social posts, stories, presentations, posters, resumes, menus, invitations and brand assets. No install, no account. Designs live in the browser and export as PNG, JPG or PDF. An AI Studio adds editable copy, layouts, command-based edits, vector illustrations, translation and visual critique through a serverless Vercel AI Gateway proxy.

## Who it is for
People who need polished visuals without a design background: small-business owners, students, creators, and teams making a last-minute deck or launch post.

## Surfaces
- **Landing (`/`)** — Persuade. Convince a first-time visitor that a professional-looking result is 60 seconds away, and show real work.
- **Template gallery (`/templates`)** — Experience. Let the work lead; browse and start from real templates.
- **Dashboard (`/dashboard`)** — Operate. Reach a recent design or start a new one in one click.
- **Editor (`/editor/:id`)** — Operate. Fast, quiet, predictable. The design is the hero; the chrome recedes.
- **Present (`/present/:id`)** — Experience. Full-bleed pages, minimal controls.

## Core promises
1. **Real editing, not a mockup.** Move, resize, rotate, snap, layer, align, style text, upload images, undo/redo, multi-page, present, export.
2. **Start fast.** 20 hand-built templates across 12 categories, 59 size presets, blank canvases and a browser video studio.
3. **Yours.** Projects autosave locally, export without watermarks, work offline after first load.
4. **No dark patterns.** No sign-up wall, no paywall. AI is opt-in, previewed before it changes anything, and honestly scoped. Everything shown is usable.

## AI Studio
- **AI Design** — a full editable page from a brief; adds as a new page after preview.
- **AI Edit** — an agent that proposes typed canvas commands; validated against the real scene, previewed, applied as one undoable step. Locked elements are skipped and deletions are capped.
- **AI Write** — generate, rewrite, shorten, expand, match a saved brand voice and translate.
- **AI Illustration** — sanitised vector SVG, insertable or used as a background.
- **AI Review** — renders the actual page and sends a temporary snapshot for visual critique plus a scene summary.
- **Error transparency** — stage, code, HTTP status and request ID are visible, with retry and copy-diagnostics.

## Non-goals
- Multiplayer collaboration, cloud sync, social scheduling, print fulfilment or billing.
- Image segmentation/inpainting, AI video/audio, or Magic Layers without a suitable media model. These are not faked.
- Claiming a feature exists when it does not.

## Success
A visitor can go from landing page to a downloaded, designed PNG in under two minutes without instructions.
