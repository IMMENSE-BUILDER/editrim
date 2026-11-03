# Canva Pro parity pass

Research into Canva's 2026 paid surface, then a deep integration of the features that matter most in a browser-only, local-first studio. Eight feature slices were built in parallel against a typed shell, then wired and audited together.

## Research

Canva Premium (Pro) in 2026 is Free / Pro / Business / Enterprise. The paid tier is defined less by templates than by production tools:

- **Magic Studio / Canva AI** — Magic Design, Write, Media, Edit, Eraser, Expand, Grab, Morph, Layers, Switch (resize and translate), Animate, Insights, Brand Voice, Ask @Canva.
- **Brand Hub** — Brand Kits (5 on Pro), Brand Templates, Brand Controls, approvals, brand voice, logos, font upload and one-click restyle.
- **Design productivity** — Magic Resize, Bulk Create, background remover, layers, align/distribute/tidy, smart mockups, text effects, image effects, quick actions (`/`), Template Assistant.
- **Workflow** — comments, version history (1,000 versions on Pro), link permissions, content planner, presenter view, talking presentations, recording.
- **Output** — PNG/JPG/WebP/SVG, PDF Standard and Print (bleed, crop marks, CMYK), PPTX, MP4/GIF, QR codes, barcodes, print proofing.
- **Docs / whiteboards / websites / sheets / forms** — adjacent products rather than editor features.

Sources include canva.com/pricing, /pro, /pro/brand-kit, /pro/background-remover, /pro/content-planner, /canva-ai, /magic-layers, /ai-assistant, plus the Help Center articles for text effects, presentation modes, talking presentations, bulk create, version history, brand controls, download types, margins/bleed and print proofing.

The 2026 gating pattern that matters: premium is sold as **workflow leverage** (resize, bulk create, brand systems, history, export fidelity), not just more assets.

## What shipped

| Area | Feature | Surface |
|---|---|---|
| Layout | Resize & variants | `ResizeStudio`, `lib/resize.ts` |
| Layout | Marquee selection, align to selection, tidy up | `Canvas.tsx`, `useEditor.ts`, `lib/tidy.ts` |
| Layout | Image crop zoom/pan and eight frame masks | inspector, both renderers |
| Type | Six text effects, vertical align, outline controls | inspector |
| Image | Replace in place, auto-enhance, overlay, sepia/hue | inspector |
| Brand | Logos, palettes, apply to design, brand check | `BrandKitModal`, Brand panel, `lib/brandApply.ts` |
| AI | Selection-scoped Rewrite/Shorten/Expand/Tone/Translate | `InlineAiBar`, `lib/inlineAi.ts` |
| Workflow | Command palette (`Ctrl K` / `/`) | `CommandBar`, `lib/commands.ts` |
| Workflow | Version history with checkpoints and restore | `HistoryDrawer`, `lib/versionHistory.ts` |
| Workflow | CSV bulk create with mapping and token merge | `BulkCreateModal`, `lib/bulk.ts` |
| Present | Notes, transitions, presenter window, timer, sync | `Present.tsx` |
| Output | PNG/JPG/WebP/SVG/PDF, print bleed and crop marks | `export.ts`, `svgExport.ts`, export modal |

## Implementation notes

### Resize variants
`reflowPages` scales each element by `sx/sy`, keeps its normalized centre as an anchor, re-wraps text with a deterministic estimator, clamps everything into the new page, and preserves image crop, masks, rotation and groups. Each target becomes a real design with `variantOf` and a shared `rootId`, so variants are editable and discoverable rather than flattened copies.

### Version history
A separate `editrim-history` IndexedDB database holds full design snapshots with a `designId` index. Identical page JSON is deduped, snapshots are capped at 40 per design, and writes fail soft. The editor records an autosave four seconds after load and every two minutes after that; the drawer adds named checkpoints.

### Brand apply
`applyBrandToDesign` maps every text, shape, icon and background colour to the nearest palette entry using weighted RGB distance, retypes headings vs body by font size, and runs in one undoable `restoreDesign`. `auditBrand` reports off-brand colours (distance > 36) and fonts with suggested replacements.

### Export
SVG is a real vector serialiser: text becomes `<text>`/`<tspan>`, shapes reuse the canvas path maths, photos are embedded, and masks become `<clipPath>`. Print PDF renders at 150/300 DPI and adds 0/3/5 mm bleed plus crop marks. The UI states that PDF stays raster.

### Present
Page `notes` and `transition` are first-class fields. The presenter window and audience window share `BroadcastChannel('editrim-present-' + id)` (localStorage fallback), so either can drive the deck. The timer, next-slide preview and notes live in the presenter rail.

## Verification

```text
npx tsc --noEmit                         TSC_EXIT=0
npm run build                            ✓ built
node scripts/studio-pro-e2e.mjs          STUDIO PRO E2E OK
node scripts/studio-responsive.mjs       STUDIO RESPONSIVE OK
node scripts/context-menu-e2e.mjs        CONTEXT MENU E2E OK
node scripts/icon-coverage.mjs           ICON COVERAGE OK
node scripts/icon-choreography.mjs       ICON CHOREOGRAPHY OK — 122 glyphs
node scripts/icon-motion-e2e.mjs         ICON MOTION E2E OK
node scripts/simplicity-e2e.mjs          SIMPLICITY E2E OK
node scripts/theme-e2e.mjs               THEME AUDIT OK
node scripts/polish-e2e.mjs              POLISH E2E OK
node scripts/home-e2e.mjs                HOME FEATURES E2E OK
node scripts/library-e2e.mjs             LIBRARY OK
node scripts/photo-editor-e2e.mjs        PHOTO EDITOR E2E OK
node scripts/video-editor-e2e.mjs        VIDEO EDITOR E2E OK
node scripts/editrim-migration-e2e.mjs   EDITRIM MIGRATION OK
node scripts/e2e.mjs                     E2E OK
```

`studio-pro-e2e.mjs` evidence:

- Outline applies a 6 px text stroke; Highlight paints `rgb(216, 245, 90)`.
- Circle mask computes `ellipse(50% 50% at 50% 50%)`; zoom 160 % produces `matrix(1.6, 0, 0, 1.6, 0, 0)`.
- Tidy up moves a selection from four near-identical x positions to a spread grid; undo restores it.
- Marquee selects six layers.
- Version history stores an autosave snapshot in IndexedDB and lists it.
- `Ctrl K` → `history` → Enter opens the drawer.
- Two variants persist with `variantOf` and `rootId` pointing at the source design.
- Export modal exposes five formats; SVG starts `<svg>`, contains `<text>` and `<clipPath>`, and has no `<foreignObject>`; WebP is `RIFF…WEBP`.
- Present mode shows speaker notes; presenter view shows a running `mm:ss` timer.

`studio-responsive.mjs` fits the palette, resize studio and export modal at 1440, 1366, 1024 and 390 px in both themes with no horizontal overflow.

## Deployment

Commit `1c15382` is live at **https://editrim.vercel.app** (production bundle `assets/index-B7Nrv-jZ.js`). A live smoke test on the deployed build verified:

- the editor loads a template and exposes Resize & variants, Version history, Brand, Download and the AI trigger;
- `Ctrl K` opens the command palette and runs Resize;
- Resize shows 22 target cards across Social, Presentation, Print and Web with the custom-size row;
- Export lists five formats in the order PNG, JPG, PDF, WebP, SVG;
- Brand shows Apply to design and Brand check;
- the inline AI trigger expands to five actions;
- marquee selects multiple layers and Tidy up is present;
- presenter view shows a running timer and notes;
- `/api/ai` returns 200 and the page logs no errors.

## Honest exclusions

Deliberately not built because they need media models, servers or print partners: background remover, inpainting, Magic Layers, AI video/audio, real-time collaboration, cloud sync, social scheduling, print fulfilment, and a stock library. They remain listed as non-goals rather than simulated. SVG text keeps live font names rather than embedding font files; photos are embedded. PDF remains raster, including the print mode.
