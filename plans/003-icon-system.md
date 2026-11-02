# Icon vocabulary & surface polish

Implemented on top of `883e778`.

## Decision

One custom `VellumIcon` set now covers interface iconography. It has **100** 24×24 stroked glyphs with shared geometry, 1.8 default stroke, rounded joins and `data-vellum-icon` hooks for coverage tests.

Format identity stays in `FormatGlyph`: all **59** design formats keep their own glyph, tone and aspect marker, including real social-platform marks.

Lucide remains only for:
- design **content** icons inside the 30-icon editor library and template previews
- the `Loader2` spinner
- the custom `BrandMark`

No interface action on any route renders a stock icon.

## Coverage

| Surface | Custom icons | Format glyphs | Stock UI icons |
|---|---:|---:|---:|
| Landing | 57 | 5 | 0 |
| Home / dashboard | 33 | 8 | 0 |
| Templates | 6 | 34 | 0 |
| Editor | 30 | 0 | 0 |
| Editor context menu | 18 | 0 | 0 |
| Editor AI panel | 10 | 0 | 0 |
| Export modal | 6 | 0 | 0 |
| Share modal | 6 | 0 | 0 |
| Present | 6 | 0 | 0 |
| Shared view | 4 | 0 | 0 |
| 404 | 1 | 0 | 0 |
| Create modal | 22 | 18 | 0 |
| Brand kit modal | 8 | 0 | 0 |
| Help modal | 5 | 0 | 0 |
| Landing @ 390 | 57 | 5 | 0 |
| Home @ 390 | 33 | 8 | 0 |
| Templates @ 390 | 6 | 34 | 0 |
| Editor @ 390 | 26 | 0 | 0 |
| Present @ 390 | 6 | 0 | 0 |
| Create modal @ 390 | 22 | 18 | 0 |

## Replacements worth naming

- **Editor context menu** now has a complete custom vocabulary: clipboard, paintbrush, duplicate, layer front/back, group/ungroup, alignment, lock, comment, language, component and magic.
- **Inspector alignment controls** use custom align/distribute glyphs instead of generic Lucide alignment icons.
- **Canvas toolbar** uses custom minus, plus, fit, lock and comment glyphs.
- **AI Studio** uses spark / pencil / magic / scan / language / image consistently across mode tabs, capability list and error states.
- **Format export** distinguishes PNG (image), JPG (camera) and PDF (document).
- **Shared view and 404** now use the same arrow, download, edit, share and external vocabulary as the rest of the product.
- **Navigation rails** have active edge markers on Home and Editor, and their labels activate on hover/focus without layout shift.
- **Template categories** use format glyphs and a right-edge fade so the scrollable filter strip reads as continuing rather than clipped.
- **BrandMark** now exposes a `.brand-mark` hook so audits can exclude the logo from stock-icon checks.

## Motion

No new motion was needed for this pass. The existing system remains:
- 120–180 ms custom ease-out transitions
- 18–22 ms card stagger
- `@starting-style` toast entry
- origin-aware context menus
- press-scale feedback
- scroll reveals
- full `prefers-reduced-motion` fallbacks

No `transition: all`, animated CSS variables, layout-property animation or unbounded blur was introduced.

## Verification

- `npx tsc --noEmit` — passes
- `npm run build` — passes
- `node scripts/icon-coverage.mjs` — `ICON COVERAGE OK`
  - every route and modal surface has custom icons
  - zero stock interface SVGs
  - zero horizontal overflow at 1440 and 390
  - context menu, AI panel, export and share dialogs audited separately
- `node scripts/library-e2e.mjs` — `LIBRARY OK`
- `node scripts/home-e2e.mjs` — `HOME FEATURES E2E OK`
- `node scripts/polish-e2e.mjs` — `POLISH E2E OK`
- `node scripts/context-menu-e2e.mjs` — `CONTEXT MENU E2E OK`
- Visual evidence captured at 1440 and 390 for landing, Home, Templates, Editor, AI panel, context menu, Export, Share, Present, Create, Brand kit, Help, Shared view and 404.

“Better than Canva” is a design ambition, not a verified claim. What is verified is the cohesive icon coverage, responsive fit, motion accessibility and the tested behavior above.
