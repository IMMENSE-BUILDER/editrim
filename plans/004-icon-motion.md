# Editrim Ink v2 — duotone icons and kinetic studio states

Second generation of the interface icon system. Built on `501e28d`.

> Follow-up: [009-icon-choreography.md](009-icon-choreography.md) replaces the generic hover lifts with a bespoke gesture and press reply for every glyph, and moves the duotone pair into one ink group. The first-paint stagger and active-tab pop described here still apply.

## Icon redesign

Every `EditrimIcon` now renders as a two-layer ink mark:

- **Main layer** — 1.65px rounded stroke, 24×24 grid.
- **Echo layer** — the same geometry offset by `0.55 / 0.75` and rendered at `0.16` opacity, giving each glyph a subtle letterpress depth.
- Compact icons at 13px and below hide the echo so toolbars and save states stay crisp.
- All 100 glyphs use the same stroke, join, cap and optical origin.
- `data-icon-size` and `.editrim-icon` hooks expose the style for tests and CSS.

The format library keeps its separate `FormatGlyph` identity: 59 formats, each with its own tone, mark and aspect ratio marker.

## Motion added

### First paint

- Dashboard category icons enter with a 300ms scale/opacity lift, staggered by 12ms using `--icon-index`.
- Dashboard rail icons enter with a 280ms stagger at 16ms steps.
- Studio rail icons enter with the same 280ms stagger.
- Enter animations use `backwards` fill only, so hover and active transforms take over cleanly after the entrance.

### Interaction

- Dashboard categories: the icon tilts and lifts inside the lifting circle on hover; press scales it down.
- Create: the plus rotates 12° and lifts on hover.
- Rail navigation, More, Help and notifications: direction-aware lifts and rotations.
- Studio top bar: icons lift; undo rotates counter-clockwise, redo clockwise, download dips.
- Studio rail: hover lifts and tilts; active tab plays a 260ms `editrim-icon-pop`.
- Canvas selection: the rotation handle now uses the custom rotate glyph and turns under the pointer; selection overlays no longer contain stock SVG controls.
- Context menu: the row icon nudges and scales on hover.
- Inspector: arrange, align, layer and page action icons scale on hover.
- AI Studio: mode tabs lift, the active mode pops.
- Panels and dialogs: close buttons rotate 90°; export choices scale; Create modal format glyphs lift with the card.
- Active Home and Editor rail icons, plus the active AI tab, use the same pop curve.

All motion animates `transform` and `opacity` only. Durations are 160–300ms.

### Reduced motion

`prefers-reduced-motion: reduce` now removes icon transitions, animations and transforms entirely, while keeping the static duotone ink mark.

## Verification

- `npx tsc --noEmit` — passes
- `npm run build` — passes
- `node scripts/icon-coverage.mjs` — `ICON COVERAGE OK`
  - every route reports `echoes === icons`
  - zero stock interface SVGs
  - zero horizontal overflow at 1440 and 390
- `node scripts/icon-motion-e2e.mjs` — `ICON MOTION E2E OK`
  - category icon: `none → matrix(1.114, -0.117, 0.117, 1.114, 0, -1)`
  - create icon: `none → matrix(1.096, 0.233, -0.233, 1.096, 0, 0)`
  - rail icon: `none → matrix(1.097, -0.077, 0.077, 1.097, 0, -1.5)`
  - format glyph: `none → matrix(1.06, 0, 0, 1.06, 0, -1)`
  - studio rail hover and context-menu hover produce non-identity matrices
  - canvas rotate handle: custom glyph and animated hover
  - canvas selection audit: `rotate: true`, `stock: 0`
  - active editor rail: `editrim-icon-pop`, `0.26s`
  - active AI mode: `editrim-icon-pop`, `0.26s`
  - reduced motion: `transition: none`, `animation: none`, hover transform `none`
- Existing suites remain green: `LIBRARY OK`, `HOME FEATURES E2E OK`, `POLISH E2E OK`, `CONTEXT MENU E2E OK`

“Better than Canva” remains an ambition, not a verified claim. The measured outcome is a complete custom icon language with tested kinetic states and reduced-motion safety.
