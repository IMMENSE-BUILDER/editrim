# Theming — light paper, dark ink

Editrim has two complete themes. Light is the paper studio; dark is the ink
studio. Both are hand-set surface by surface — no inversion filter, no opacity
wash, no half-themed pages.

## Switching

- The switch lives at the bottom of the dashboard rail, above notifications:
  a labelled track with a sun or moon.
- `aria-pressed` reflects dark mode; the label and the knob both state the
  active mode.
- The choice is stored in `localStorage` as `editrim_theme_v1`.
- `index.html` applies the stored theme to `<html data-theme>` before the first
  paint, so a reload never flashes the wrong theme.
- `color-scheme` and `<meta name="theme-color">` follow the theme, so native
  scrollbars, form controls and the mobile browser bar match.
- The switch syncs across tabs through the `storage` event.
- Changing theme cross-fades surfaces over 240ms. `prefers-reduced-motion`
  skips the cross-fade entirely.
- Light is the default when nothing is stored.

## Tokens

| Token | Light | Dark |
|---|---|---|
| `--paper` | `#F4F1EA` | `#121116` |
| `--paper-deep` | `#ECE8DD` | `#0C0B10` |
| `--card` | `#FBFAF6` | `#1A1922` |
| `--ink` | `#14130F` | `#F4F1EA` |
| `--ink-soft` | `#3A372F` | `#D8D3C7` |
| `--muted` | `#6B675D` | `#A49F93` |
| `--line` | `#E2DED3` | `#2B2933` |
| `--line-strong` | `#CFCABD` | `#413E4B` |
| `--cobalt` | `#2440F0` | `#7189FF` |
| `--cobalt-soft` | `#EAEDFF` | `rgba(91,124,255,.16)` |
| `--lime` | `#D8F55A` | `#D8F55A` |
| `--canvas` | `#DCD9D0` | `#0B0A0F` |
| `--chrome` | `#F7F5F0` | `#15141B` |
| `--chrome-2` | `#F0EDE6` | `#1C1A24` |

Shadows become deeper black in dark mode; selection and scrollbar colours move
with them.

## Surface rules

### Dashboard

- The rail, hero, search, category labels, cards, project rows, popovers and
  the AI strip all read from `--h-*`.
- Light mode re-points `--h-*` to the paper palette and overrides the few
  hard-set dark surfaces (rail, search, popovers, thumbnails, hover washes).
- Dark mode keeps the original purple-black workspace.

### Marketing and templates

- Header and gallery bar become dark glass with a light hairline.
- The marquee, formats band, pricing card, export-step illustration and footer
  are *paper artifacts*: they keep their light-on-dark palette in both themes
  by re-declaring the light tokens locally. They do not become pale blocks in
  dark mode.
- Template previews and the app mock are content, so they stay paper.
- Gallery chips, search, hover washes, active pills and the count line all get
  dark values.

### Editor

- Top bar, rail, left panel, inspector, page strip and canvas controls become
  ink surfaces; the artboards stay the colour of the design.
- Inputs, selects, segmented controls, switches, sliders, color/font popovers,
  layer rows, page menus, upload zone, export/share/resize dialogs and the AI
  Studio panel are all re-surfaced.
- Warning and error surfaces use warm translucent tints instead of pale peach.

### Studios

Photo and video keep their dark studio shell in both themes. They are media
tools and were already dark; the theme switch does not lighten them.

### Details

- `::selection` turns lime-tinted in dark.
- Scrollbar thumbs are light in dark, dark in light.
- Focus rings switch to the brighter cobalt.
- Toasts invert (light toast on dark), keeping maximum contrast.
- Images and template previews are never filtered.

## Verification

```text
node scripts/theme-e2e.mjs   THEME AUDIT OK — light paper and dark ink are complete
```

The audit checks:

- light default and the toggle at the bottom of the rail
- `aria-pressed`, label, and a stored `dark` value after one click
- pre-paint theme on reload (`domcontentloaded`)
- contrast ≥ 4.5 for dashboard headings and category labels in both themes
- dark landing header/nav/footer wordmark and links
- dark gallery bar, inactive filter and active filter pills
- dark editor top bar, left panel, inspector, inputs and export modal
- dark shared-view header
- mobile 390px: toggle visible, no horizontal overflow
- reduced motion skips the cross-fade
- no console errors
