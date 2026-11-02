# Video Studio

Implemented in `src/pages/VideoEditor.tsx` with `src/lib/video/*` and `src/styles/video.css`.

## Feature set

- Media library for local **video, image and audio** files, with metadata probing, poster thumbnails, audio waveform preview and IndexedDB storage.
- Three-track timeline: **Video**, **Overlay** (text/image), **Audio**.
- Play, pause, seek, loop, skip to start/end, one-second stepping, master volume, fullscreen preview.
- Clip editing: drag to move, trim either edge, split at playhead, duplicate, delete, snap and timeline zoom.
- Text overlays: content, font family, size, weight, colour, alignment, box colour and opacity, width, position and drag-on-preview positioning.
- Image overlays: placement, scale and drag-on-preview positioning.
- Audio/video clip volume, opacity, fade in and fade out; track visibility, mute and volume mix.
- Project presets for 16:9, 9:16, 1:1, 4:5, 21:9 and 4:3, frame rate, background colour and size.
- Autosave to localStorage plus media blobs in IndexedDB; reload restores clips and media.
- Undo/redo for clip operations, imports, split/trim, text edits, aspect changes and track changes.
- Keyboard shortcuts: Space, S, Delete, T, Ctrl/Cmd+Z, Shift+Ctrl/Cmd+Z, arrows.
- WebM export through `canvas.captureStream` + `MediaRecorder`, with mixed audio from the Web Audio graph, progress, cancel and automatic download.
- Responsive studio shell: side panels become drawers below 1180px; 390px layout verified without horizontal overflow.
- Custom Vellum icon vocabulary throughout.

## Integration

- `App.tsx` exposes `/video`.
- Dashboard **Video** category opens the studio; **More → Video studio** and dashboard search provide secondary entry points.
- The last video project is restored automatically; **New video project** resets it in the inspector.

## Verification

```text
npx tsc --noEmit                  TSC_EXIT=0
npm run build                     ✓ built
node scripts/video-editor-e2e.mjs VIDEO EDITOR E2E OK
node scripts/home-e2e.mjs         HOME FEATURES E2E OK
node scripts/icon-coverage.mjs    ICON COVERAGE OK
node scripts/polish-e2e.mjs       POLISH E2E OK
node scripts/library-e2e.mjs      LIBRARY OK
node scripts/context-menu-e2e.mjs CONTEXT MENU E2E OK
```

`video-editor-e2e.mjs` verifies:

- WebM fixture import and metadata rendering
- video clip insertion and play advancement
- text overlay creation and editing
- image overlay insertion and canvas drag positioning
- audio import with waveform
- undo/redo
- 9:16 aspect change and restore
- right-edge trim
- split at playhead
- reload with IndexedDB media restoration
- real WebM export download larger than 5 KB
- mobile drawer layout and overflow

The deterministic test clip is `scripts/fixtures/test-clip.webm`; regenerate it with `scripts/make-video-fixture.mjs` if needed.

## Live verification

Production check on `https://vellum-delta-dun.vercel.app/video`:

- dashboard **Video** category opens `/video`
- WebM fixture imports and appears in the library
- video clip and text overlay added; playback advances
- WebM export downloads successfully (1.0 MB in the live run)
- zero stock interface icons
- mobile 390px layout has no horizontal overflow and drawers are mutually exclusive
- `/api/ai` health remains `200` with `xiaomi/mimo-v2.6-flash`
