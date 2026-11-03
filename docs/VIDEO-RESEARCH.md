# Video editor research — November 2026

Research sources (public product pages, captured with Chromium):

- **CapCut — Free Online Video Editor:** trim, crop, split, reverse and mirror; filters and effects; text overlays; transitions; templates; custom export.
- **Clipchamp — Free online video editor:** precision trim, scene transitions, effects, colour correction, templates and stock media, AI subtitles, audio enhancement, aspect-ratio templates.
- **Descript — AI Video Editor:** a visible workflow of Record → Edit → Refine → Share; text-based editing with an optional timeline; project-based sharing.
- **Canva — Video Editor:** blocked by a bot challenge during capture, so no product claims were taken from it.

## Patterns worth adopting

1. **A project library before the editor.** All three usable products treat “my videos” as the entry point. A timeline is not a home screen.
2. **Speed and colour correction as first-class clip controls.** They are common, visible, and do not require a complex effects graph.
3. **Text motion presets.** A small set of legible presets (fade, rise, pop) delivers most of the value without keyframe complexity.
4. **One timeline, three regions.** Media → preview/timeline → properties remains the clearest layout for a lightweight browser editor.
5. **Export is a workflow, not a button.** CapCut and Clipchamp surface resolution/format; Descript treats sharing as part of the workflow.

## Deliberately not added

- AI transcription, text-to-speech, background removal and stock libraries: they require models, API keys or licensed media that would break the local-first architecture.
- Cloud collaboration and accounts: the product is intentionally browser-local.
- Keyframe graphs and node-based effects: this would move the editor toward Premiere/Resolve rather than the requested normal editor.

## Resulting scope

- Multi-project `/videos` library with search, create, rename, duplicate and delete.
- `/video/:id` editor with media, preview/timeline and properties.
- Speed (0.5×–2×), colour correction (brightness/contrast/saturation/blur), video zoom and text motion (fade/rise/pop).
- Existing trim, split, image/text/audio overlays, fades, undo/redo, autosave, WebM export and responsive drawers retained.

## See also

- [plans/007-video-advanced.md](../plans/007-video-advanced.md) — implementation and verification record.
- [PHOTO-RESEARCH.md](PHOTO-RESEARCH.md) — the sibling photo editor.
- [ENGINE-SCHEMA.md](ENGINE-SCHEMA.md) — video project keys and media storage.
