# Photo Editor — advanced local photo tool

Research notes: `docs/PHOTO-RESEARCH.md`.

## Navigation

- New `/photo` route, reachable from:
  - the dashboard **Photo** category,
  - the dashboard search action **Open photo editor**,
  - More → **Photo editor**.
- Back arrow returns to `/dashboard`.
- The previous photo and every control restore from browser storage on reload.
- Drag an image anywhere onto the editor to replace the current photo.

## Editor surface

Four modes in a left rail (bottom bar on phones):

- **Adjust** — histogram and sixteen controls in four groups:
  - Light: exposure (`-3…+3 EV`), contrast, highlights, shadows, whites, blacks.
  - Color: temperature, tint, vibrance, saturation.
  - Detail: clarity, sharpen, blur.
  - Effects: vignette, grain, fade.
  - Double-click a slider to reset it; the panel also has **Reset adjustments**.
- **Crop** — draggable crop box with thirds guides and corner handles, aspect presets (Free, Original, 1:1, 4:5, 3:2, 16:9, 9:16), rotate left/right, flip X/Y, full-frame reset and apply.
- **Filters** — nine presets (Original, Mono, Noir, Warm, Cool, Cinematic, Vivid, Soft, Fade) with live thumbnails rendered from the current photo.
- **Text** — multiple layers with content, font, weight, size, colour, alignment, opacity, rotation and X/Y position. Drag the text directly on the photo.

Header controls: undo, redo, hold-to-compare with the original, import, reset and export.

## Rendering pipeline

`src/lib/photo/render.ts`:

1. Rotate and flip the source.
2. Map the crop from rotated space back to an exact source rectangle.
3. Run the per-pixel adjustment pass on the cropped result (skipped entirely when every adjustment is neutral).
4. Apply blur, then an unsharp pass for clarity/sharpen.
5. Draw text layers last so they are never filtered.

The preview renders at 880 px while controls are moving, then re-renders at 1400 px once the edit settles. The canvas is fitted to the stage with an explicit pixel size, so crop handles and text boxes line up exactly with the image.

## Storage

- `vellum-photo-source` IndexedDB → the imported source blob (`current`).
- `vellum_photo_session_v1` localStorage → name, dimensions, crop, transform, adjustments, filter and text layers.
- Importing a new photo replaces the stored source and resets the edit stack.

## Export

- PNG, JPEG or WebP.
- Full or half output scale.
- Quality slider for JPEG/WebP (`40–100%`).
- The dialog shows the exact output dimensions; the exported PNG header is verified against them in the E2E test.

## Verification

```text
npx tsc --noEmit                    TSC_EXIT=0
npm run build                       ✓ built
node scripts/photo-editor-e2e.mjs   PHOTO EDITOR E2E OK
node scripts/home-e2e.mjs           HOME FEATURES E2E OK
node scripts/simplicity-e2e.mjs     SIMPLICITY E2E OK
node scripts/icon-coverage.mjs      ICON COVERAGE OK
```

The photo E2E verifies:

- empty state → import → 16 sliders and a histogram
- a four-quadrant fixture proves the geometry: rotate-90 moves corners clockwise, a half-crop keeps the correct half, flip X mirrors corners
- pixel-level proof that adjustments change the rendered image, and that blur measurably softens edges then restores them
- hold-to-compare shows the untouched original, release restores the edit
- undo/redo via buttons and keyboard
- 1:1 crop keeps a square pixel ratio while dragging a handle
- rotate/flip keep the locked aspect; flip mirrors the crop rect; apply leaves crop mode
- nine filter tiles render and apply (Noir sets `saturation -100`)
- text add, content edit, size change, drag, alignment and delete
- reload restores filter, text, crop and adjustments
- PNG export header dimensions match the dialog; WebP half-scale and JPEG exports download
- 390 px layout: bottom tool bar, scrollable inspector, export dialog inside the viewport, no horizontal overflow
- drag-and-drop import replaces the photo and resets the edit stack
- dashboard Photo category opens the editor with the restored photo

## Live verification

Production run on `https://vellum-delta-dun.vercel.app`:

- `/photo` served the new build with 16 sliders and the Photo title.
- Imported the 1600 × 1067 fixture; adjustments set to exposure **+0.5**, contrast **+22**, temperature **−30**, vignette **40**, grain **18**.
- Hold-to-compare showed the "Original" badge and restored the edit on release.
- 16:9 crop rotated 90° → crop `{ w: 1, h: 0.375 }` in rotated space, exactly 16:9 in pixels.
- Cinematic filter applied; a text layer "LIVE" added.
- PNG export downloaded at **1067 × 600**, 604 KB, matching the dialog.
- Reload restored the filter, text layer and crop.
- 390 px viewport: bottom rail at 56 px, canvas 370 px wide, no horizontal overflow.
- Dashboard Photo category reopened the editor with the restored photo.
- `/api/ai` returned `200`; no console errors.

## See also

- [docs/PHOTO-RESEARCH.md](../docs/PHOTO-RESEARCH.md) — product research and excluded scope.
- [docs/ENGINE-SCHEMA.md](../docs/ENGINE-SCHEMA.md) — photo/video document formats and storage keys.
- [plans/007-video-advanced.md](007-video-advanced.md) — the sibling video studio.
