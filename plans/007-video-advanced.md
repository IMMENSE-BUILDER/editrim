# Video Studio v2 — project browser and advanced clip tools

Research notes: `docs/VIDEO-RESEARCH.md`.

## Navigation

- New `/videos` project library: search, New video, project poster, duration, aspect and clip count.
- Card actions: inline rename, duplicate, delete.
- New projects are stored independently; the last project is remembered.
- `/video/:id` opens a specific project. `/video` redirects to the library.
- Editor back arrow returns to `/videos`.
- Dashboard Video category and More → Video studio both open `/videos`.
- Legacy single-project localStorage is migrated into the new project index.

## Advanced editing

- **Speed** for video and audio clips, 0.5×–2×. Timeline duration and source in-point are adjusted; preview and export set media playback rate.
- **Colour correction** for video and image clips: brightness, contrast, saturation and blur, applied in the canvas renderer.
- **Video zoom** from 1×–2.5×, applied around the canvas centre.
- **Text motion** presets: None, Fade, Rise and Pop. Motion is active during playback/export and shows the settled state while paused so the text remains editable.
- Existing trim, split, fades, volume, image placement, text styling, undo/redo and export retained.

## Architecture

- `src/lib/video/storage.ts` now manages a project index and per-project keys:
  - `editrim_video_projects_v1` — metadata for browsing
  - `editrim_video_project_v2_<id>` — project JSON
  - `editrim_video_last_id_v1` — last opened project
  - media blobs remain in IndexedDB
- Project metadata includes poster, duration, resolution, clip count and timestamps.
- `src/pages/Videos.tsx` owns browsing and card actions.
- `src/pages/VideoEditor.tsx` loads by route id and autosaves only after the project is ready.

## Verification

```text
npx tsc --noEmit                  TSC_EXIT=0
npm run build                     ✓ built
node scripts/video-editor-e2e.mjs VIDEO EDITOR E2E OK
node scripts/home-e2e.mjs         HOME FEATURES E2E OK
node scripts/simplicity-e2e.mjs   SIMPLICITY E2E OK
node scripts/icon-coverage.mjs    ICON COVERAGE OK
```

The expanded video E2E verifies:

- empty `/videos` → New video → editor
- fixture import, video, text, image and audio clips
- undo/redo, aspect change, trim, split, image drag
- speed duration change `3.99 → 1.99`
- colour correction controls present and updated
- text motion `rise`
- reload restores 5 clips and 3 media assets
- WebM export download
- library search, duplicate, delete and reload
- 390px mobile layout with no overflow

## Live verification

Production run on `https://editrim.vercel.app`:

- new video created from the **Videos** library
- WebM fixture imported and added
- speed changed **5× source → 2.5s timeline**
- colour correction applied
- text motion set to **Rise**
- WebM export downloaded successfully (697 KB)
- search and empty-search states verified in the library
- 390px layout has no horizontal overflow
- no console errors; /api/ai remains `200` on `xiaomi/mimo-v2.6-flash`
