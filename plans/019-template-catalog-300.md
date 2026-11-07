# Template catalog: 44 to 300

## The job

Editrim ships 44 hand-built, fully editable templates. Add **256 new templates** across ten packs so the gallery reaches **exactly 300**. This is a content-quality job, not a codegen volume exercise. Every new template must look like it was designed by a person with a point of view, with real copy, a real audience, and a reason to exist.

The existing 44 templates are the quality bar. Read at least two existing collection files before writing:

- `src/lib/templateKit.ts` — primitives, fonts, photo library
- `src/lib/library/editorial.ts`
- `src/lib/library/social.ts`
- `src/lib/library/decks.ts`
- `src/lib/library/brand.ts`
- `src/lib/library/events.ts`
- `src/lib/library/commerce.ts`

Do **not** edit any existing template, existing pack, `templates.ts`, styles, or pages. Only create the one new pack file assigned to you.

## Output shape

Each pack is one new file in `src/lib/library/`:

```ts
import type { Template } from '../types';
import {
  T, S, IMG, IC, page, bgSolid, bgGrad, bgImage,
  PHOTOS, FONTS, P, G, NONE, fx, rule,
} from '../templateKit';

/* local palette constants and page definitions */

export const PACK_NAME_TEMPLATES: Template[] = [
  {
    id: 'prefix-slug',
    name: 'Real Name',
    category: 'Instagram',
    description: 'One specific sentence about the design, audience and art direction.',
    size: { name: 'Instagram Post', width: 1080, height: 1080 },
    pages: [pageOne],
    tags: ['specific', 'searchable', 'tags'],
    featured: false,
  },
];
```

- Use only the helpers above. Do not import React, CSS, or new dependencies.
- Every text box, shape, image and icon must be an editable canvas element. No flat screenshots.
- Use `page(name, background, elements)` for every page.
- `T(text, x, y, w, h, options)`, `S(shape, x, y, w, h, options)`, `IMG(src, x, y, w, h, options)`, `IC(icon, x, y, size, color, strokeWidth, options)`.
- Standard element defaults are in `templateKit.ts`; override deliberately.

## Allowed values

- Fonts: `FONTS.display`, `FONTS.serif`, `FONTS.editorial`, `FONTS.dmSerif`, `FONTS.grotesk`, `FONTS.condensed`, `FONTS.black`, `FONTS.fraunces`, `FONTS.manrope`, `FONTS.baskerville`, `FONTS.poppins`, `FONTS.oswald`, `FONTS.montserrat`, `FONTS.caveat`, `FONTS.inter`.
- Shapes: `rect`, `ellipse`, `triangle`, `line`, `star`, `diamond`, `hexagon`, `blob`, `heart`, `arrow`, `burst`, `wave`, `ring`.
- Icons: only ids in `src/lib/icons.ts` — star, heart, sparkle, bolt, sun, moon, cloud, leaf, flower, smile, arrow-right, arrow-up-right, check, plus, cursor, music, camera, coffee, plane, home, globe, diamond, crown, eye, message, fire, pin, gift, clock, wave.
- Photos: only keys in `PHOTOS` in `src/lib/templateKit.ts`. Never hardcode a new Unsplash id.
- Paints: `P('#hex')` for solid, `G(from, to, angle)` for a motivated gradient, `NONE` for no fill.

## Standard sizes

| Category | Size name | Dimensions | Page strategy |
|---|---|---|---|
| Instagram | Instagram Post | 1080 × 1080 | 1 page; 30–40% 2–3 page carousels |
| Story | Instagram Story | 1080 × 1920 | 1 page; a few 2–3 frame sequences |
| Presentation | Presentation | 1920 × 1080 | 3–4 pages |
| Poster | Poster | 1240 × 1754 | 1 page |
| Flyer | Flyer | 1240 × 1754 | 1 page |
| Menu | Menu | 1240 × 1754 | 1–2 pages |
| Invitation | Invitation | 1080 × 1080 | 2 pages (front + details) for most |
| Resume | Resume | 1240 × 1754 | 1 page; two pages only for senior profiles |
| Business card | Business Card | 1050 × 600 | 2 pages (front + back) |
| Logo | Logo | 1000 × 1000 | 2 pages (primary + application) |
| YouTube | YouTube Thumbnail | 1280 × 720 | 1 page |
| Podcast | Podcast Cover | 1000 × 1000 | 1 page |
| Banner | Banner | 1584 × 396 | 1 page; use prescribed variants below |
| Editorial | Editorial | 1240 × 1754 | 1–2 pages |
| Book cover | Book Cover | 1600 × 2400 | 1 page; a few with back cover as page 2 |
| Magazine | Magazine Cover | 1240 × 1754 | 1 page |
| Album cover | Album Cover | 1400 × 1400 | 1 page |
| Web | Website | 1440 × 900 | 1 page |
| Certificate | Certificate | 1240 × 1754 | 1 page |

Banner variants are explicit: YouTube channel art 2560 × 1440, LinkedIn banner 1584 × 396, email header 1200 × 400, Etsy banner 1200 × 300. Use the exact variant assigned in the pack list.

## Quality bar

Each template must pass all of these:

1. **One idea.** A single dominant composition, type treatment or image. No template is a generic card with a title, subtitle and button.
2. **Real content.** Real brand/venue/person names, real menu items, plausible prices, dates, addresses, social handles. No lorem ipsum, no "Your text here", no "Brand Name", no "Insert headline".
3. **Audience.** A reader should know who this is for within two seconds: a wine bar, a bookshop, a seed-stage climate company, a wedding in Puglia, a science magazine.
4. **Distinct art direction.** Choose one of: full-bleed photo with reversed type; oversized typographic poster; editorial index; strict grid/catalogue; split panel; ticket/receipt; circular seal; duotone; paper collage; riso print; quiet luxury; brutalist tech; warm analogue; art-book minimal. Do not reuse the same layout twice in one pack.
5. **Type hierarchy.** One display voice and one body voice. Usually 2 fonts, never more than 3. Display sizes 80–240px on 1080-wide canvases, 120–400px on 1240-wide print. Body 18–34px. Small labels 10–14px with tracking.
6. **Color discipline.** 3–5 colours per template. Use the palette across the page, not just the buttons. No default purple SaaS gradient, no glassmorphism, no emoji.
7. **Image discipline.** 0–3 photos per page. If a photo is full-bleed, use `bgImage` with a deliberate overlay or put a graded `IMG` over a shape. Crop with `zoom`/`offsetX`/`offsetY` or `mask` when needed. Use `fx()` for intentional grades (duotone, warm, cool, mono). Do not use the same photo in three templates in a row.
8. **Layers.** 10–35 elements per page. Keep every decorative rule, tag, label and footer editable. No single flat background image with text on top unless the photo is the whole idea and the type has a strong spatial relationship to it.
9. **Spacing.** Set a margin system (64–96px on social, 56–88px on print, 96–140px on decks). Align elements to it. Leave intentional negative space.
10. **No overflow.** Text boxes must be tall enough for their content at the chosen font size and line-height. Prefer extra height to clipping. Body measure 30–60 characters on social, 50–75 on print. Don't let a text box cross another box's content.
11. **Safe area.** Keep all text at least 40px from every edge on social, 48px on print, 72px on decks. Full-bleed images and shapes may bleed; text may not.
12. **Editability.** Never bake a headline into an image, icon or shape. All words live in `T` elements.
13. **No fake UI.** Web templates are real page compositions (hero, navigation, editorial blocks), not browser chrome screenshots. Certificates are real certificate layouts, not seals alone.
14. **No repeated names.** Do not reuse an existing name or id. Use the assigned id prefix.
15. **Craft floor.** Contrast ≥4.5:1 for body text and ≥3:1 for display. No pure black page surfaces. Shadows only where depth is real (paper, card, photo). Icons are drawn, not emoji. No colored left/right border callouts.

## Copy and naming

- Invent plausible brands, studios, restaurants, magazines and people. Keep them specific and local-feeling.
- Vary geography: London, Lisbon, Mexico City, Seoul, Lagos, Copenhagen, Melbourne, New York, Marrakech, Mumbai, Reykjavík, Oaxaca.
- Use real numbers: prices, dates, times, addresses, issue numbers, edition sizes.
- For menus, write dishes with ingredients and prices. For decks, write actual slide arguments, not "Problem / Solution / Team" alone. For resumes, write real roles, companies, dates and measurable outcomes. For books and albums, write title, author/artist, publisher/label and a short line of copy.
- Keep the product’s language: dry, precise, human. No hype, no exclamation marks unless the design is a sale poster.

## Photo notes

The photo library is deliberately broad. Useful keys by territory:

- Food/drink: `coffee`, `coffee2`, `coffeeBeans`, `coffeeCup`, `restaurant`, `restaurantInterior`, `restaurant2`, `restaurant3`, `bar`, `wine`, `wine2`, `cocktail`, `cocktail2`, `cocktail3`, `food`, `salad`, `pizza`, `grill`, `veggies`, `toast`, `dessert`, `iceCream`, `cake`, `bread`, `kitchen`, `tomato`.
- People: `portrait`, `womanPortrait`…`womanPortrait5`, `manPortrait`…`manPortrait5`, `athlete`, `child`, `baby`, `wedding`, `wedding2`, `wedding5`, `dog`, `cat`.
- Places: `interior`…`interior7`, `apartment`, `arch`, `building`, `architecture2`, `architecture3`, `architecture5`, `architecture6`, `city`…`city6`, `paris`, `paris2`, `london`, `london2`, `venice`, `italy`, `travel`, `travel2`, `travel3`, `mountain`, `lakeMountain`, `snowMountain`, `forest`, `fogHills`, `beach`, `ocean`, `oceanWaves`, `desert`, `desertDunes`, `nature`, `deer`, `flowers`, `plant`, `plant2`, `plants`.
- Product/fashion: `fashionRack`, `fashion`…`fashion5`, `fashionModel`, `tshirt`, `tshirt2`, `hoodie`, `shoe`, `nikeShoe`, `shoe2`…`shoe4`, `bag`, `bag2`, `bag3`, `watch`, `watch2`…`watch4`, `perfume`, `skincare`…`skincare4`, `makeup`.
- Tech/business: `circuit`, `cyber`, `matrix`, `laptop`, `laptop2`, `laptop3`, `macbook`, `phone`, `phone2`, `retroTech`, `server`, `analytics`, `analytics2`, `team`, `team2`, `team3`, `workspace`, `workspace2`, `desk`, `techDesk`, `office`, `office2`…`office4`, `officeInterior`.
- Culture: `gallery`, `gallery2`, `art`, `art2`, `art3`, `art4`, `artSupplies`, `book`, `books`, `books2`, `books3`, `library`, `library2`, `library3`, `notebook`, `notebook2`, `paper`, `planner`, `planner2`, `craft`, `concert`, `concert2`, `concert3`, `concertCrowd`, `crowd`, `party`, `event`, `music`, `music2`, `music3`, `studio`, `studio2`, `audio`, `dj`, `mic`, `mic2`, `mic3`, `podcast`.
- Fitness: `gym`, `gym2`, `gym3`, `workout`, `fitness`, `fitness2`, `yoga`.
- Automotive: `car`…`car6`.
- Abstract: `abstract`, `abstract2`, `abstract3d`, `abstract3d2`, `abstract3d3`, `abstract3d4`, `gradient`…`gradient5`, `paint`, `paint2`.

## Validation before reporting

Run from `C:\Users\Administrator\vellum`:

```bash
npx tsc --noEmit
```

It must pass with no errors. Also verify your file:

- exports exactly the requested number of templates
- has unique ids across your file (grep your prefix)
- has the exact category counts listed for your pack
- has no `lorem`, `placeholder`, `Your text`, `Brand Name`, `TODO`, `emoji`
- every page has at least 10 elements (unless a deliberate 8–9 element cover; report any exception)

Do not run the dev server, build, screenshot or modify shared files. The lead will integrate and audit all packs together.

---

# Pack assignments

## Pack 1 — `src/lib/library/feed-one.ts` → `FEED_ONE_TEMPLATES` (25)

Prefix `f1-`. Categories: **Instagram 11, Story 14**.

Territory: contemporary food, drink, fashion, beauty, product, retail and craft. One-page posts and stories, with 3–4 Instagram carousels. Concept seeds (adapt to the assigned category; keep each one distinct):

1. Specialty coffee roaster — single-origin release, tasting notes, warm paper, oversized serif.
2. Natural wine bar — bottle still life, burgundy, menu-style type.
3. Sourdough microbakery — flour, morning light, chalk and serif.
4. Matcha tea house — acid green, Japanese-inspired grid, quiet.
5. Small-batch chocolate — dark brown, gold, wrapper geometry.
6. Perfume house — pale luxury, thin serif, huge negative space.
7. Skincare serum — clinical sage, lab labels, ingredient list.
8. Hair salon — chrome, sharp portrait, appointment card.
9. Streetwear drop — black/lime, model, countdown and stock list.
10. Tailoring atelier — cream, pinstripe, quiet elegance.
11. Ceramics studio — clay, wabi-sabi, handwritten note.
12. Florist — romantic full-bleed, cursive and serif.
13. Jewellery — black velvet, macro, edition number.
14. Furniture — architectural, sand, object study.
15. Bookshop opening — paper, cobalt, type-led.
16. Record store — orange, bold, vinyl culture.
17. Cycling club — red/cream, route stats.
18. Running brand — kinetic lime, split type, pace data.
19. Farmers market — tomato red, ticket layout.
20. Yoga studio — sage, breath, organic shapes.
21. Design conference — cobalt, strict grid, speaker names.
22. Art book fair — fluorescent riso, catalogue.
23. Indie magazine — editorial cover, issue number.
24. Photography exhibition — monochrome, dates, floor plan.
25. Film club — grain, red, screening schedule.

## Pack 2 — `src/lib/library/feed-two.ts` → `FEED_TWO_TEMPLATES` (26)

Prefix `f2-`. Categories: **Instagram 10, Story 6, Editorial 10**.

Territory: culture, travel, wellness, architecture, technology, community and seasonal. Instagram + stories are visual; editorial is A4 portrait and can be a feature opener or a two-page spread (one page per spread).

Concept seeds:

1. Alpine travel diary — landscape, serif/sans, elevation data.
2. Coastal hotel — quiet luxury, sand, room rates.
3. City guide — brutalist grid, cobalt, map coordinates.
4. Architecture studio — monochrome, precise, project index.
5. Tech launch — dark, product detail, spec table.
6. Community radio — warm, hand-drawn, schedule.
7. Wellness retreat — sage, airy, programme.
8. Running club — red, stats, route map.
9. Book club — cream, serif, reading list.
10. Film festival — black, marquee, screening grid.
11. Indie game — pixel/neon, key art, platforms.
12. Music festival — sunset gradient, lineup.
13. Art fair — yellow, grid, exhibitor list.
14. Fashion week — monochrome, schedule, venue.
15. Museum late — deep blue, ethereal, timings.
16. Public library — warm paper, index, membership.
17. Climate report — green, data, policy.
18. Nonprofit campaign — cobalt, portrait, donation.
19. Seasonal market — orange, hand type, dates.
20. New Year — gold, black, invitation.
21. Pride — rainbow as a considered system, not confetti.
22. Marathon — high contrast, route, start times.
23. Design week — editorial, lime, programme.
24. Zine — riso, black, issue.
25. Photo essay — monochrome, full-bleed, captions.
26. Restaurant guide — red/cream, listings.

## Pack 3 — `src/lib/library/decks-one.ts` → `DECKS_ONE_TEMPLATES` (26)

Prefix `d1-`. Categories: **Presentation 12, Web 6, Certificate 8**.

Presentations are 3–4 pages: cover, argument, evidence, close. Web templates are 1440×900 landing page compositions: navigation, hero, one supporting section and footer. Certificates are 1240×1754 portrait.

Presentation seeds (3–4 pages each): SaaS seed deck, product launch keynote, agency capabilities, financial results, climate-tech report, AI startup thesis, architecture portfolio, nonprofit impact report, retail brand strategy, sports analytics, travel company pitch, healthcare innovation.

Web seeds (1 page each): specialty coffee subscription, design studio, fintech app, wellness retreat, architecture practice, music festival.

Certificate seeds (1 page each): design award, course completion, employee recognition, volunteer appreciation, photography prize, scholarship, culinary qualification, sustainability certification.

## Pack 4 — `src/lib/library/decks-two.ts` → `DECKS_TWO_TEMPLATES` (26)

Prefix `d2-`. Categories: **Presentation 10, Editorial 8, Magazine 8**.

Presentation seeds (3–4 pages): architecture biennale, film studio pitch, fashion collection, museum exhibition, theatre season, music label, art fair, publishing house, hospitality group, university research.

Editorial seeds (A4 portrait, 1–2 pages): long-form essay opener, photo essay, interview spread, recipe feature, travel journal, opinion column, book review, portfolio spread.

Magazine covers (A4 portrait, 1 page): food, fashion, design, science, music, travel, literary, sports. Each needs a masthead, cover lines, issue number, price, barcode or colophon.

## Pack 5 — `src/lib/library/print-one.ts` → `PRINT_ONE_TEMPLATES` (26)

Prefix `p1-`. Categories: **Poster 12, Flyer 10, Menu 4**.

Poster seeds: jazz night, techno warehouse, film festival, theatre play, art exhibition, book fair, poetry night, skate competition, coffee festival, climate march, fashion sample sale, museum late.

Flyer seeds: yoga workshop, cooking class, wine tasting, photography walk, coding bootcamp, vintage market, dance class, book launch, running race, community garden.

Menu seeds: Italian trattoria, omakase counter, brunch cafe, cocktail bar. Menus need 2 pages if the food list is long; drinks on page 2.

## Pack 6 — `src/lib/library/hospitality.ts` → `HOSPITALITY_TEMPLATES` (25)

Prefix `hp-`. Categories: **Menu 8, Invitation 11, Business card 6**.

Menu seeds: seafood bistro, steakhouse, vegetarian tasting, ramen shop, dessert bar, hotel breakfast, wine bar, farm-to-table.

Invitation seeds: garden wedding, black-tie wedding, destination wedding, 40th birthday, baby shower, dinner party, art opening, housewarming, anniversary, engagement, charity gala. Most are front + details.

Business card seeds: architect, chef, photographer, florist, consultant, hotel concierge. Front and back.

## Pack 7 — `src/lib/library/professional.ts` → `PROFESSIONAL_TEMPLATES` (26)

Prefix `pr-`. Categories: **Resume 14, Business card 7, Logo 5**.

Resume seeds: product designer, software engineer, architect, chef, photographer, journalist, academic, consultant, marketing lead, UX researcher, data scientist, creative director, nurse, teacher. Each resume should have a real career narrative, not a generic skills list.

Business card seeds: lawyer, realtor, barber, ceramicist, financial advisor, event planner, copywriter. Front and back.

Logo seeds (primary + application, 2 pages): coffee brand, architecture studio, skincare brand, music label, nonprofit.

## Pack 8 — `src/lib/library/brand-covers.ts` → `BRAND_COVERS_TEMPLATES` (26)

Prefix `bc-`. Categories: **Logo 4, Book cover 12, Album cover 10**.

Logo seeds (2 pages): outdoor brand, tech startup, restaurant, wellness brand.

Book cover seeds: literary fiction, thriller, sci-fi, poetry, memoir, business book, cookbook, art book, history, self-help, children's book, nature writing. Each cover needs title, author, publisher mark and a short endorsement or series line.

Album cover seeds: jazz, electronic, indie rock, classical, hip-hop, ambient, folk, R&B, live album, soundtrack. Each needs artist, album title, label and a short line.

## Pack 9 — `src/lib/library/creator.ts` → `CREATOR_TEMPLATES` (26)

Prefix `cr-`. Categories: **YouTube 14, Podcast 8, Banner 4**.

YouTube seeds: tech review, cooking show, fitness channel, gaming, travel vlog, finance, documentary, comedy, music production, DIY/woodworking, science, book channel, fashion haul, podcast clip. Thumbnails need huge readable type and a clear visual hook.

Podcast seeds: true crime, design, business, health, history, comedy, music, science. Each needs show name, episode title, host, episode number and a strong cover system.

Banner seeds: YouTube channel art (2560×1440), LinkedIn banner (1584×396), email header (1200×400), Etsy shop banner (1200×300).

## Pack 10 — `src/lib/library/culture.ts` → `CULTURE_TEMPLATES` (24)

Prefix `cu-`. Categories: **Poster 6, Editorial 1, Magazine 4, Web 5, Banner 8**.

Poster seeds: experimental film, opera, dance performance, photography prize, architecture lecture, community protest.

Editorial seed: newspaper front page.

Magazine covers: architecture, culture, science journal, literary review.

Web seeds (1440×900 landing pages): theatre, museum, music label, film festival, bookshop.

Banner seeds (1 page each, exact sizes): conference 1584×396, museum 1584×396, film festival 1584×396, music festival 1584×396, charity 1584×396, university 1584×396, podcast network 1584×396, retail sale 1584×396.

---

## Result

- **300 templates · 423 pages · 7,392 elements · 19 categories.**
- `scripts/full-template-audit2.mjs` single-threaded: **300 checked, 0 failures**.
- Every page has at least 6 layers; no out-of-bounds elements, no text overflow, no console errors.
- The three initial audit timeouts were Chrome resource exhaustion from three concurrent editors; they rendered cleanly when checked individually.

---

## Integration contract

- File name and export name are fixed.
- Template count and category counts are fixed.
- Do not add `featured` to more than two templates in a pack.
- All ids use the assigned prefix; do not collide with another pack.
- If you cannot finish the requested count, finish as much as possible and report the exact count and missing categories. The lead will resume your session.
- Report back: file path, template count, category counts, page count, any exceptions, and `tsc` result.
