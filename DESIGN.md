# Vellum — Design System

## POV
Editorial studio meets precision tool. Warm paper, ink-black type, one electric cobalt accent, and a lime highlighter. Marketing is expressive and typographic; the editor is quiet, dense, and neutral so the design on the canvas is the only loud thing.

## Palette
- Paper `#F4F1EA` (marketing bg), Card `#FBFAF6`
- Ink `#14130F`, Muted ink `#6B675D`, Line `#E2DED3`
- Cobalt `#2440F0` (primary action, selection), Cobalt dark `#1830C4`
- Lime `#D8F55A` (highlight, hover wash), Coral `#FF6A46` (warm accent)
- Canvas workspace `#DCD9D0`, editor chrome `#F7F5F0`
- Destructive `#D93A2B`

## Type
- Display: **Bricolage Grotesque** 700/800, tight tracking (-0.03em), oversized.
- Landing display accent: **Geist Serif Regular** for the hero emphasis — high-contrast editorial serif; self-hosted, no synthetic italic.
- Serif accent: **Instrument Serif** italic for one word per headline.
- UI/body: **Inter** 400/500/600, 13–16px in app, 17–19px marketing.
- Canvas fonts offered: Inter, Bricolage Grotesque, Instrument Serif, Playfair Display, DM Serif Display, Space Grotesk, Bebas Neue, Archivo Black, Fraunces, Manrope, Libre Baskerville, Poppins, Oswald, Montserrat, Caveat.

## Shape & motion
- Radius: 10px controls, 16px cards, 24px hero panels. Never pill everything; pills only for tags/chips.
- Borders 1px, shadows soft and warm (`0 1px 2px rgba(30,26,16,.06)`), larger lift only on hover cards.
- Motion 120–240ms. Tokens: `--dur-fast` 120ms, `--dur` 180ms, `--dur-slow` 240ms; `--ease` for hover/colour, `--ease-out` for entrances and press feedback, `--ease-in-out` for on-screen movement. Purposeful only: panel reveal, selection, toast, hero drift. Reduced-motion keeps colour/opacity feedback and removes movement.
- Editor chrome: 56px top bar, 68px rail + 300px panel, 264px inspector, bottom page strip. Neutral, no gradients.

## Do not
- No generic purple SaaS gradient, no glassmorphism everywhere, no emoji as feature icons.
- No centered-everything marketing page; use an asymmetric editorial grid.
- No fake "AI" badges or invented customer logos.

## AI Studio
- Lives in the editor rail with a lime "Beta" chip and a green health dot; powered by MiMo V2.6 Flash through Vercel AI Gateway.
- AI chrome uses the same paper/ink/cobalt system. AI output cards are bordered white with a lime "AI draft / Proposed" badge; AI actions never look like normal canvas elements until applied.
- AI errors are first-class UI: warm coral surface, stage + code + request ID in mono, retry and copy diagnostics. No generic "Something went wrong".
- AI Review sends a rendered snapshot; say so in the panel. AI Design and AI Edit preview before they change the document.

