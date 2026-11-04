# Library expansion — 24 new templates

The template library grew from **20 to 44** hand-built designs. Six collections were built in parallel against the shared `templateKit`, then integrated into `TEMPLATES` and audited as one library.

## Collections

| File | Templates | Territory |
|---|---|---|
| `src/lib/library/editorial.ts` | `ed-field-notes`, `ed-miso-smoke`, `ed-long-table`, `ed-sable-resume` | Risograph poster, izakaya menu, supper-club ticket, designer CV |
| `src/lib/library/social.ts` | `so-aster-skin`, `so-fieldwork`, `so-nocturne`, `so-sunday-service` | Clinical beauty, 3-page workwear carousel, late-night radio story, brunch story |
| `src/lib/library/decks.ts` | `dk-meridian`, `dk-tidal`, `dk-studio-ledger`, `dk-common-ground` | Urbanism, water report, agency credentials, land-trust report |
| `src/lib/library/brand.ts` | `br-aperture`, `br-marrow`, `br-kite`, `br-atelier-nine` | Photography iris, restaurant monogram, fintech mark, fashion stationery |
| `src/lib/library/events.ts` | `ev-sonic-bloom`, `ev-quiet-hour`, `ev-after-hours`, `ev-makers-market` | Festival poster, private view, podcast cover, market handbill |
| `src/lib/library/commerce.ts` | `co-omni`, `co-sundae`, `co-runway-07`, `co-good-shelf` | Hardware launch, ice-cream pop-up, fashion film thumbnail, grocery banner |

Each collection is a separate module so the library can keep growing without one monolithic file. All templates use only the editable primitives (text, shapes, images, icons) and the existing 15 canvas fonts.

## Design direction

- Each template owns a distinct palette, type system and composition; no single house style repeated across the library.
- Real names, dates, line-ups, menus and product copy instead of lorem ipsum.
- Publication-grade details: rules, folios, captions, ticket perforations, clear-space diagrams, price columns, lineup grids.
- No generated gradients, glass, emoji or non-editable artwork.
- Two visual fixes after review: the Aperture mark was rebuilt from a star-like form into a six-blade iris diagram, and the Atelier wordmark line-height was corrected to stop a 6px overflow.

## Integration

`src/lib/templates.ts` imports the six arrays and spreads them into `TEMPLATES`. A curated order leads the gallery with Bruma, Field Notes, Meridian and Aster Skin, then mixes in the strongest remaining work. `TEMPLATE_CATEGORIES` keeps the familiar category order and ignores first-occurrence order. The dashboard’s “Templates for you” strip mixes six new designs with two existing favourites. Landing counts are derived from `TEMPLATES.length` (44), not hardcoded.

## Verification

`scripts/library-expansion-e2e.mjs`:

- 44 gallery cards, 44 unique template IDs, 24 new IDs present.
- 24 templates / 42 pages opened through the real editor.
- Every page has at least 6 layers and every element stays inside the artboard.
- No text box overflows; no console or page errors.
- Expected size and page count checked for each template.

```text
npx tsc --noEmit                    TSC=0
npm run build                       ✓ built
node scripts/library-expansion-e2e.mjs   LIBRARY EXPANSION OK
node scripts/home-e2e.mjs           HOME FEATURES E2E OK
node scripts/simplicity-e2e.mjs     SIMPLICITY E2E OK
node scripts/theme-e2e.mjs          THEME AUDIT OK
node scripts/polish-e2e.mjs         POLISH E2E OK
node scripts/icon-coverage.mjs      ICON COVERAGE OK
node scripts/library-e2e.mjs        LIBRARY OK
```
