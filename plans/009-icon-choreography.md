# Icon choreography — a gesture per glyph

Every one of the 121 Vellum icons now performs its own hover animation and a different press animation. The gesture is chosen from what the icon means, not from a shared transition.

Full mapping: [`docs/ICON-CHOREOGRAPHY.md`](../docs/ICON-CHOREOGRAPHY.md).

## The idea

- **Hover is a performance.** A one-shot gesture that resolves back to rest: the roof lifts on `home`, the arrow drops on `download`, `undo` rewinds, `eye` opens, `bell` swings from its crown, `trash` rattles, `crop` closes in.
- **Press is a different sentence.** It is shorter, compressed, and rarely on the same axis: `download` lands and squashes, `undo` steps forward, `eye` blinks shut, `plus` folds from a quarter turn into a half turn, `alignLeft` squashes toward its guide.
- **Meaning sets direction.** Arrows travel the way they point, `layerFront` lifts forward, `layerBack` drops back, `zoomIn` grows while `zoomOut` shrinks, `flipX`/`flipY` mirror and return.
- **Families share a grammar, not a keyframe.** The 16 alignment glyphs all travel to their own guide and press against it, but each axis, origin and distance is its own.

## Mechanics

- `src/styles/icon-motion.css` declares 242 keyframe blocks and 121 `--im-hover` / `--im-press` shorthands, one pair per glyph.
- The shared rules resolve those variables on the icon's ink group. Interactive ancestors (`button`, links, `role="button"`, tabs) trigger the gesture from anywhere in the hit area; direct `:hover` covers decorative icons.
- `VellumIcon` now wraps the echo and main paths in one `.vellum-icon-ink` group, so the duotone mark moves as a single object instead of leaving the echo behind.
- `transform-box: fill-box` rotates each glyph around its own geometry. Alignment and edge tools override `transform-origin` so press squashes toward the guide they align to.
- The echo layer also gains ink weight on hover (`0.16 → 0.24`) and press (`→ 0.32`).
- Disabled controls are excluded. Keyboard focus replays the hover gesture.
- `prefers-reduced-motion: reduce` removes every animation, transform and transition; colour and the static duotone remain.
- Only `transform` and `opacity` animate. No layout, no filters, no expensive paint work.

## Verification

```text
npx tsc --noEmit                    TSC_EXIT=0
npm run build                       ✓ built
node scripts/icon-choreography.mjs  ICON CHOREOGRAPHY OK — 121 bespoke hover and press animations
node scripts/icon-motion-e2e.mjs    ICON MOTION E2E OK
node scripts/icon-coverage.mjs      ICON COVERAGE OK
node scripts/home-e2e.mjs           HOME FEATURES E2E OK
node scripts/simplicity-e2e.mjs     SIMPLICITY E2E OK
node scripts/library-e2e.mjs        LIBRARY OK
node scripts/context-menu-e2e.mjs   CONTEXT MENU E2E OK
node scripts/polish-e2e.mjs         POLISH E2E OK
```

`scripts/icon-choreography.mjs` audits the system twice:

**Static**

- 121 icons in `VellumIcon`, 121 hover declarations, 121 press declarations.
- Every glyph has both keyframe blocks; names are unique per glyph.
- Hover and press durations differ for every icon; CSS braces balance.

**Live**

- All 121 glyphs are mounted in real buttons, hovered and pressed.
- Every hover resolves to `im-<icon>-h`; every press resolves to `im-<icon>-p`.
- Every hover moves the glyph, every press moves it, and the two poses differ.
- A real dashboard rail button resolves to `im-projects-h` / `im-projects-p`.
- Reduced-motion context reports `animation: none`, `transform: none`, `transition: none`.
- No console errors.

## Performance

- 60 KB of uncompressed CSS, almost entirely repeated keyframe syntax; gzip keeps it small.
- Nothing animates at rest — only the hovered or pressed glyph runs an animation.
- All motion is compositor-friendly `transform`/`opacity` on SVG groups.
