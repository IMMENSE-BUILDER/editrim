# Dark mode — two complete themes

The switch lives at the bottom of the dashboard rail, above notifications.
Light is the paper studio; dark is the ink studio. Every surface is set for its
theme; nothing is inverted wholesale.

## What ships

- `<html data-theme="light|dark">` set before first paint from
  `localStorage.vellum_theme_v1` by an inline script in `index.html`.
- `color-scheme` and `<meta name="theme-color">` follow the theme.
- A labelled switch in the dashboard rail bottom: sun/Light or moon/Dark, with
  `aria-pressed`, a 240ms cross-fade and a reduced-motion bypass.
- `src/lib/theme.ts` owns the read/apply/toggle/subscribe API and the storage
  event so two tabs stay in sync.
- `src/styles/theme.css` holds the dark token set, the light dashboard variant,
  the dark marketing/editor overrides and the switch itself.

## Curated surfaces

- **Dashboard** — a true light variant (warm paper rail, search, cards,
  popovers, thumbnails) plus the original dark workspace.
- **Landing and templates** — dark glass header and gallery bar, deep-ink
  marquee/formats/pricing/footer bands, paper template previews, dark chips,
  search and hover states.
- **Editor** — dark top bar, rail, panels, inspector, page strip, canvas
  controls, inputs, popovers, AI Studio, export/share/resize dialogs and warm
  warning tints; artboards keep their design colours.
- **Modals** — the design library's cards, search, tabs and footer move to
  dark surfaces instead of staying white.
- **Shared view and 404** — dark headers and body; present mode remains the
  dark stage it always was.
- **Studios** — photo and video keep their dark media shell in both themes.

## Deliberate choices

- **Paper artifacts stay paper.** The footer, marquee, formats band, pricing
  card and app mock re-declare the light tokens locally, so they keep their
  light-on-dark identity in dark mode instead of turning into pale bands.
- **No pure black.** Dark paper is `#121116`, cards `#1A1922`, chrome `#15141B`.
- **Contrast over mood.** Body and heading pairs are measured in the theme
  audit; the lowest checked pair stays at 4.5:1 or better.
- **Motion is optional.** The cross-fade is skipped under reduced motion.

## Verification

```text
npx tsc --noEmit                    TSC_EXIT=0
npm run build                       ✓ built
node scripts/theme-e2e.mjs          THEME AUDIT OK
node scripts/home-e2e.mjs           HOME FEATURES E2E OK
node scripts/simplicity-e2e.mjs     SIMPLICITY E2E OK
node scripts/icon-coverage.mjs      ICON COVERAGE OK
node scripts/icon-choreography.mjs  ICON CHOREOGRAPHY OK — 122 glyphs
node scripts/icon-motion-e2e.mjs    ICON MOTION E2E OK
node scripts/library-e2e.mjs        LIBRARY OK
node scripts/context-menu-e2e.mjs   CONTEXT MENU E2E OK
node scripts/polish-e2e.mjs         POLISH E2E OK
node scripts/photo-editor-e2e.mjs   PHOTO EDITOR E2E OK
node scripts/video-editor-e2e.mjs   VIDEO EDITOR E2E OK
```

The theme audit verifies the toggle placement and semantics, pre-paint
persistence, contrast on dashboard/landing/footer/gallery/editor/shared
surfaces, dark export modal, mobile 390px fit and reduced-motion bypass.

## Files

- `src/lib/theme.ts`
- `src/components/ThemeToggle.tsx`
- `src/styles/theme.css`
- `index.html`
- `src/styles/base.css` (dark token block)
- `scripts/theme-e2e.mjs`
- `docs/THEMING.md`
