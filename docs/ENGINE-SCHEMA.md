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
