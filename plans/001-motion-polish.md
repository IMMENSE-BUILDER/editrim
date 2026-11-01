# Motion & interaction polish

Scope: shared UI, Home dashboard, editor menus/popovers, landing hero. Preserve the existing visual world in DESIGN.md. No redesign.

## Findings

| # | Severity | Finding | Location |
|---|---|---|---|
| 1 | HIGH | `prefers-reduced-motion` currently nukes every animation/transition to 0.01ms. It should suppress movement while preserving colour/opacity feedback. | `src/styles/base.css` |
| 2 | HIGH | Toasts enter with a keyframe and disappear instantly; rapid toasts also stack without an exit state. | `src/components/Toast.tsx`, `src/styles/base.css` |
| 3 | HIGH | Trigger-anchored menus use modal/keyframe motion with no origin. The editor page menu reuses `modal-in`. | `src/styles/editor.css`, `src/styles/home.css` |
| 4 | MED | `transition: all` on gallery filters animates unintended properties. | `src/styles/site.css` |
| 5 | MED | Buttons press with a 1px downward nudge; no shared tokens for fast/base/slow durations. | `src/styles/base.css` |
| 6 | MED | Home card hover lifts lack depth/shadow response and are not gated for touch. | `src/styles/home.css` |
| 7 | MED | Home dark-surface labels are below 4.5:1 contrast; global focus ring is cobalt on a dark ground. | `src/styles/home.css` |
| 8 | LOW | Landing hero type chip clips the right viewport edge. | `src/styles/site.css` |

## Exact changes

1. Add tokens in `:root`: `--dur-fast: 120ms`, `--dur: 180ms`, `--dur-slow: 240ms`, `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`.
2. Reduced motion: keep `animation-duration: .01ms` for decorative/continuous motion but set `transition-property` to colour, background, border, box-shadow and opacity with `transition-duration: 120ms`; explicitly remove float/marquee animations.
3. Toast: add a leaving state, `@starting-style` entry, transition out over 160ms, remove after 160ms. Keep 3.2s dwell.
4. Editor context menu: `transform-origin: top left`; submenus use a directional `cv-sub-in` keyframe, flipped submenus use the opposite direction. Page menu uses a new `popover-in` keyframe with top-left origin, 150ms.
5. Home rail popovers: origin bottom-left; project card menus origin top-right and a downward popover keyframe.
6. Button press: `translateY(0) scale(.98)`, 120ms `--ease-out`; add disabled states. Home category/card/primary actions get the same press feedback.
7. Home tokens: `--h-muted` to `.60`, `--h-muted-2` to `.50`, placeholder `.50`; focus ring `--h-lilac`; set `color-scheme: dark` and a lilac caret in search.
8. Hover depth: add border/shadow transitions to Home design/template/project thumbs and category icons, gated behind `@media (hover: hover) and (pointer: fine)`.
9. Fix `.gallery-filter` transition and hero type chip offset.

## Verification

- `npx tsc --noEmit`
- `npm run build`
- `node scripts/home-e2e.mjs` and `node scripts/context-menu-e2e.mjs`
- Playwright screenshots at 1440 and 390, reduced-motion pass, keyboard focus pass.
- Impeccable detector on changed files.

## Detector notes

The remaining `overused-font` warnings are pinned by DESIGN.md (Inter for UI, Space Grotesk for mono data). The `gradient-text` warning is pinned by the supplied Canva Home reference. The former `side-tab` warning on the AI selection callout was removed by replacing the 2px left border with a full 1px cobalt-tinted outline.
