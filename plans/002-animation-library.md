# Landing, gallery & library motion

Implemented in `4b42a3d` → subsequent library expansion.

## Findings

| # | Location | Finding | Motion decision |
|---|---|---|---|
| 1 | `Landing.tsx` sections with `.reveal` | Sections existed with a reveal class but no implementation, so they teleported into view. | One-time scroll reveal: `opacity 0 → 1`, `translateY(18px) → 0`, 420/580ms `--ease-out`. |
| 2 | `Landing.tsx` hero accent | The lime underline appeared fully formed on load. | Draw once with `clip-path: inset(0 100% 0 0) → inset(0)` over 520ms after a 320ms delay. |
| 3 | `Templates.tsx` gallery grid | Category changes swapped the grid with no spatial bridge. | Remount on category change; cards fade/translate in over 240ms with a 22ms stagger for the first eight cards. |
| 4 | `NewDesignModal.tsx` format grid | A 59-format library had no search and no entrance bridge. | Searchable cross-group results; cards enter with `opacity` + `translateY(5px) scale(.985)` over 180ms, 18ms stagger for the first eight. |

## Performance rules

- All new motion animates `transform`, `opacity`, or the sanctioned `clip-path` only.
- `transition: all` is absent.
- No CSS variables are animated.
- Reduced motion: reveals are immediately visible, card delays are reset to `0ms`, and the underline is fully drawn.
- No `will-change` added because no measured layer shift or dropped frame was observed.

## Verification

- `POLISH E2E OK` — reduced-motion reveal has `opacity: 1`, `transform: none`; size-card delay `0s`.
- `LIBRARY OK` — 59 formats, search and creation verified.
- `HOME FEATURES E2E OK` / `CONTEXT MENU E2E OK` — no regressions.
- `npx tsc --noEmit`, `npm run build`.
- Visual checks at 1440px and 390px; mobile library tabs wrap without overflow.
