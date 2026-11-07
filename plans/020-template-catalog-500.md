# Template catalog: 300 → 500

## The job

Editrim's working catalog held **300 templates**. This expansion adds **200 new
hand-built templates** across eight packs of 25, reaching **exactly 500**, and
turns the dashboard's curated "Templates for you" strip into the complete
library with category filters.

Every new template uses only the editable primitives — text, shapes, images and
icons — through the existing `templateKit` and the generator kits in
`src/lib/library/`. There is no new runtime, no new dependency and no generated
bitmap content.

## Result

- **500 templates · 724 pages · 12,609 elements · 19 categories.**
- **500 unique template IDs.**
- 200 new templates in eight packs: 25 each.
- The dashboard renders every template in one grid, with 20 category tabs
  (`All` + 19 categories), counts on every tab and a live "x of 500" readout.

### New packs

| Pack | Module | Templates | Territory |
|------|--------|-----------|-----------|
| Studio Social | `src/lib/library/studio-social.ts` | 25 | Instagram posts for studios, shops and cultural projects |
| Studio Stories | `src/lib/library/studio-stories.ts` | 25 | vertical stories: launches, openings, backstage notes, menus |
| Studio Print | `src/lib/library/studio-posters.ts` | 25 | club, cinema, festival, talk, exhibition and community posters |
| Studio Decks | `src/lib/library/studio-decks.ts` | 25 | seed decks, portfolios, research readouts and brand strategy |
| Studio Covers | `src/lib/library/studio-covers.ts` | 25 | 9 books, 8 albums, 8 magazines |
| Studio Brand | `src/lib/library/studio-brand.ts` | 25 | 9 identity systems, 8 business cards, 8 certificates |
| Studio Events | `src/lib/library/studio-events.ts` | 25 | 9 invitations, 8 flyers, 8 menus |
| Studio Press | `src/lib/library/studio-press.ts` | 25 | 7 editorial pages, 5 websites, 4 podcasts, 3 YouTube thumbnails, 3 banners, 3 resumes |

Prefixes are `n1-` through `n8-`, one per pack, so IDs cannot collide with the
existing 300 templates.

### Category totals after expansion

| Category | Total | Category | Total |
|----------|------:|----------|------:|
| Instagram | 52 | Presentation | 53 |
| Story | 51 | Poster | 47 |
| Book cover | 21 | YouTube | 19 |
| Invitation | 23 | Resume | 19 |
| Banner | 18 | Business card | 24 |
| Menu | 22 | Logo | 21 |
| Flyer | 20 | Podcast | 14 |
| Editorial | 26 | Web | 16 |
| Certificate | 16 | Magazine | 20 |
| Album cover | 18 | | |

## Dashboard library

`src/pages/Home.tsx` now renders `TEMPLATES` in full:

- section heading **All templates**;
- category filter chips built from `TEMPLATE_CATEGORIES`, each with a count;
- a responsive card grid using the existing `TemplateCard` and `PagePreview`;
- `content-visibility: auto` on cards so off-screen previews stay cheap;
- one preview per card (`stack={false}`) instead of up to three, keeping the
  500-card grid fast while preserving the gallery's stack treatment.

The grid defaults to **All** and shows all 500. Choosing a category filters the
grid and updates the "x of 500 templates" readout.

Dashboard verification in Chrome at 1440 × 1000:

```text
cards in the DOM          500
category filters           20  (All + 19)
count readout              "500 of 500 templates"
Presentation filter        53 cards, "53 of 500 templates"
lazy previews mounted      20 initially; more mount on scroll
console errors             0
```

`TemplateCard` gained an opt-in `lazy` prop. The dashboard and the public
gallery both use it: every card is present immediately, and its `PagePreview`
mounts through an `IntersectionObserver` with a 900 px margin. This keeps the
initial render to the first few rows instead of mounting 500 full previews.

## Verification

```text
npx tsc --noEmit                     0 errors
npm run build                        ✓ built
bundle                               1.35 MB / 389 KB gzip
scripts/full-template-audit2.mjs     500 checked, 0 failures
scripts/library-expansion-e2e.mjs    500 cards / 500 unique IDs
```

The full audit opens every template in the real editor, checks every page for
out-of-bounds elements and text overflow, and requires at least six layers per
page. It must run single-threaded; three concurrent editors exhaust Chrome and
produce false `ERR_INSUFFICIENT_RESOURCES` failures.

## Rules kept

- Templates stay editable: text, shapes, images and icons only.
- Photos come from `PHOTOS` in `templateKit.ts`; no new hardcoded image IDs.
- Palettes are 3–5 colours and pair a readable dark/light contrast.
- Multi-page templates use the existing generator page counts.
- The template count on the landing page remains derived from
  `TEMPLATES.length`; no hardcoded 500 in marketing copy.
