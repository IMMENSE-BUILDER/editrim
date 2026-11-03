# Hero viewport fit

The landing hero had a fixed 58px top pad and a centred 610px grid. On short laptop windows (roughly 614–768px tall after browser chrome) that pushed the **Start designing / Browse templates** row below the fold.

## Change

Two height-aware rules for desktop widths (901px and up), in `src/styles/site.css`:

```css
@media (min-width: 901px) and (max-height: 820px) {
  .hero { padding-top: 22px; }
  .hero-grid { min-height: 0; align-items: start; }
  .hero-badge { margin-bottom: 18px; }
  .hero-title { font-size: clamp(46px, 5.5vw, 78px); margin-bottom: 18px; }
  .hero-sub { font-size: 15.5px; margin-bottom: 22px; }
  .hero-ctas { margin-bottom: 18px; }
  .hero-stats { margin-top: 18px; padding: 16px 0 18px; }
}

@media (min-width: 901px) and (max-height: 680px) {
  .hero { padding-top: 14px; }
  .hero-badge { height: 30px; margin-bottom: 14px; }
  .hero-title { font-size: clamp(42px, 5vw, 66px); margin-bottom: 14px; }
  .hero-sub { font-size: 14.5px; margin-bottom: 18px; }
  .hero-ctas { margin-bottom: 14px; }
  .hero-meta { font-size: 11px; }
}
```

Tall screens (900px and above) keep the original spacious hero. Mobile/tablet layouts are untouched.

## Measurements

Before (1366×768): CTA row at **595–647**, meta at 677–696 — fine at full height, but the same layout at a 614px viewport cut the CTA at 647.

After, with the CTA row fully inside the window:

| Viewport | CTA row | Meta row | Overflow |
|---|---|---|---|
| 1366×614 | 396–448 | 462–479 | none |
| 1366×700 | 448–500 | 518–537 | none |
| 1366×768 | 448–500 | 518–537 | none |
| 1024×700 | 420–472 | — | none |
| 901×650 | 448–500 | — | none |
| 1440×900 | 609–661 | 691–710 | unchanged |
| 1920×1080 | 614–666 | 696–714 | unchanged |

The right-hand collage is decorative and can continue past a very short window; the headline, subhead, buttons and trust row are all visible.

## Verification

```text
npx tsc --noEmit                    TSC_EXIT=0
npm run build                       ✓ built
node scripts/simplicity-e2e.mjs     SIMPLICITY E2E OK
node scripts/icon-coverage.mjs      ICON COVERAGE OK
```

Screenshots checked at 1366×614 (light and dark), 1366×700, 1366×768, 901×650, 1024×700, 1440×900 and 1920×1080.
