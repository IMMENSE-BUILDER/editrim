# Core engine & schema inventory

Schema version: **1.0.0**  
Entry point: `src/lib/engine/index.ts`  
Runtime audit: `node scripts/engine-audit.mjs` (requires the dev server)  
Static checks: `npx tsc --noEmit`, `npm run build`

| # | Component | Status | Files / details |
|---|---|---|---|
| 1 | Core Canvas | IMPLEMENTED | `canvasFormats.ts` — 59 canvas formats, aspect ratios, A4/Letter/Business Card print mappings, responsive grid + web layout JSON |
| 2 | Typography & Text | IMPLEMENTED | `typography.ts` — 16 font assets, provider mappings, 6 text-effect presets, 8 three-role pairings; existing Fontsource assets verified |
| 3 | Video & Animation | IMPLEMENTED | `timeline.ts` — rigid clip timing, 5 transition presets with math/CSS/GLSL, Lottie + transparent overlay hooks |
| 4 | Graphics & Vectors | IMPLEMENTED | `vectors.ts` — 35 clustered assets, SVG sanitizer, 4 parametric shapes, 5 masks, 4 device mockups; existing Lucide-style icon library verified |
| 5 | Color & Aesthetic | IMPLEMENTED | `colorEngine.ts` — 10 mood palettes, linear/radial/mesh gradient specs, CSS and Canvas gradient producers |
| 6 | Presentation | IMPLEMENTED | `presentationKit.ts` — 7 slide archetypes, deck bundles, 3 chart wrappers, pie/bar/line geometry |
| 7 | AI & Procedural | IMPLEMENTED | `layoutEngine.ts` — scale/reflow/hybrid solver, responsive column solver, safe-area fit |
| 8 | Brand Hub | IMPLEMENTED | `brandHub.ts` — assets, lock scopes, permissions, change checks, locked layout policies |

## Verified existing foundations

- `src/lib/presets.ts` — the design-size library already covered social, print, brand, web and docs before this schema layer.
- `src/lib/fonts.ts` — 15 Fontsource families with weights and categories.
- `src/lib/icons.ts` — 30 stroked 24×24 vectors.
- `src/lib/palettes.ts` — swatches, palettes and header/body pairs.
- `src/lib/templates.ts` — multi-page template pages and categories.
- `src/types.ts` — `Design`, `Page`, `El`, `BrandKit` and `CanvasComment` types.

The new schema layer extends these rather than replacing them.

## Local media documents

The photo and video studios are separate documents that live outside the design engine. Both are browser-local.

### Photo — `src/lib/photo/`

| Piece | Shape |
|---|---|
| `PhotoAdjustments` | 16 numbers: exposure, contrast, highlights, shadows, whites, blacks, temperature, tint, vibrance, saturation, clarity, sharpen, blur, vignette, grain, fade |
| `PhotoTransform` | `rotate` (0/90/180/270), `flipX`, `flipY` |
| `PhotoCrop` | normalised `x`, `y`, `w`, `h` against the **rotated** image |
| `PhotoTextLayer` | `id`, `text`, `x`, `y`, `size`, `color`, `fontFamily`, `weight`, `align`, `opacity`, `rotation` |
| `PhotoSettings` | `adjustments`, `transform`, `crop`, `filter` (preset id or `custom`), `text[]` |
| `PhotoSession` | `name`, `sourceKey`, `width`, `height`, `settings`, `updatedAt` |

Storage:

- IndexedDB `vellum-photo-source` → store `source` → key `current` (the imported blob).
- localStorage `vellum_photo_session_v1` (the session above).
- Importing a new photo replaces the source and resets the settings; the previously stored session is overwritten.

Geometry invariant: crop coordinates are normalised to the rotated canvas. `sourceCropRect()` inverse-maps the crop through flip and rotation to an exact source rectangle before extraction, so rotate → crop → export stays pixel-aligned.

### Video — `src/lib/video/`

| Piece | Key / shape |
|---|---|
| Project index | localStorage `vellum_video_projects_v1` — id, name, width/height, duration, clip count, asset count, poster, timestamps |
| Project JSON | localStorage `vellum_video_project_v2_<id>` |
| Last opened | localStorage `vellum_video_last_id_v1` |
| Media blobs | IndexedDB `vellum-video-media` |
| Legacy | `vellum_video_project_v1` is migrated into the index on first load |

Project tracks are `video`, `overlay` and `audio`. Clips carry `start`, `duration`, `inPoint`, `speed` (0.5×–2×), `opacity`, `volume`, fades, `scale` (video zoom), `filters` (brightness/contrast/saturation/blur) and optional text with a motion preset (`none`/`fade`/`rise`/`pop`).

## Audit invariants

`validateEngineSchema()` checks:

- every canvas has positive dimensions and at least 59 formats exist
- A4 → 1240 × 1754, US Letter → 1275 × 1650, Business Card → 1050 × 600
- aspect-fit stays inside the requested box
- 16 font faces have source mappings
- every timeline clip has valid entry/duration/exit timestamps
- every vector cluster has at least one asset
- every mood palette has 3–5 colors
- all three gradient kinds produce CSS
- pie slices sweep exactly 2π
- reflowed content never overflows its target
- locked brand fonts reject rogue values

The last audit returned `ok: true` across all 16 checks.
