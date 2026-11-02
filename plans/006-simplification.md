# Simplification pass — Video Studio and dashboard

Principles: one purpose per screen, hierarchy from layout rather than explanatory copy, and no secondary metadata unless it changes a decision.

## Video Studio

Removed:

- header resolution/fps chips and visible save label
- “Project media”, “Quick add”, “Project settings”, “Inspector”, “Start over” and “Keyboard” eyebrows
- dropzone instruction, empty-library copy, library tip, quick-add descriptions, source metadata, keyboard-shortcut list
- empty-stage tagline and paragraph
- timeline clip count, zoom px/s label, per-track clip counts and empty hint
- selected-clip kind/duration subtitle, “Editable” badge, text drag hint
- export eyebrow and marketing paragraph
- verbose toast copy

Kept:

- functional labels only: Media, Timeline, Project/Clip, Timing, Text, Aspect, Mix, field names and transport controls
- all editing capabilities, autosave, undo/redo, keyboard shortcuts and WebM export
- the two primary library actions (Import, Text) and a single empty-state action pair

Result: the video editor reads as three regions — media, preview/timeline, properties — with no explanatory copy competing with the work.

## Dashboard

Removed:

- visual hero headline, Home/Templates tabs and “Local workspace” label; the page now opens with search, categories and work
- section eyebrows (“Pick up where you left off”, “Made to be made yours”, “A little help from the machine”, “Everything in this workspace”)
- empty-state paragraph and decorative icon
- AI section tagline and paragraph, replaced with the destination label and one action
- More dialog subtitle and card descriptions
- print modal subtitle and helper note
- help modal subtitle and tip line
- “Honest scope” badge from feature-scope dialogs

Kept:

- section headings, card metadata that identifies the thing, counts and actions
- feature-scope explanations where they prevent false expectations

## Implementation cleanup

- Removed the CSS for deleted dropzone, quick-add, empty-library, library-tip, header-chip, stage-head, project-card, project-stats, shortcuts, tiny-badge and asset-note surfaces.
- Removed unused derived media/text counters and file-size formatting.
- Simplified the header save state to an assistive-only live region.
- Updated E2E coverage for the new selectors and copy.

## Verification

```text
npx tsc --noEmit                  TSC_EXIT=0
npm run build                     ✓ built
node scripts/video-editor-e2e.mjs VIDEO EDITOR E2E OK
node scripts/home-e2e.mjs         HOME FEATURES E2E OK
node scripts/polish-e2e.mjs       POLISH E2E OK
node scripts/simplicity-e2e.mjs   SIMPLICITY E2E OK
```

`simplicity-e2e.mjs` asserts that the removed copy does not return, that the video editor exposes only Media/Project panel headings, that no dropzone/quick-add/project-card/shortcut blocks exist, and that both routes fit at 1440 and 390.

The video E2E continues to verify import, playback, text, image and audio editing, undo/redo, trim, split, persistence, WebM export and the mobile drawer layout.
