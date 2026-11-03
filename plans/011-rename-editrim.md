# Rename to Editrim

The product is now **Editrim**, deployed at **https://editrim.vercel.app**. The rename is complete, not cosmetic: the name, mark, titles, prompts, package, icon vocabulary, storage keys and databases all moved, with a migration for existing local data.

## Brand

- Every visible reference is **Editrim** (`README`, landing, dashboard, editor, AI Studio, present, shared view, 404, metadata, OG tags).
- The monogram changed from the old `V` to a geometric **E** with the lime dot, in `BrandMark` and `public/favicon.svg`.
- The rail/profile avatars show `E`.
- `package.json` / lockfile are `editrim-studio`.
- AI prompts in `server/aiCore.js` address Editrim.
- Source links point at `github.com/IMMENSE-BUILDER/editrim`.
- Canonical and live links point at `https://editrim.vercel.app`.

## Code vocabulary

- `VellumIcon` → `EditrimIcon`; `VellumIconName` → `EditrimIconName`; `VELLUM_ICON_NAMES` → `EDITRIM_ICON_NAMES`.
- `.vellum-icon*` → `.editrim-icon*`, `data-vellum-icon` → `data-editrim-icon`.
- `vellum-icon-pop` / `vellum-icon-enter` → `editrim-icon-pop` / `editrim-icon-enter`.
- Tests and selectors renamed with the code.

## Storage migration

`src/lib/migrate.ts` runs before the first render:

- Every `localStorage` key starting with `vellum` is copied to `editrim…` and the old key is removed. This covers the design index, per-design JSON, brand kit, theme, video project index/projects/last id and photo session.
- IndexedDB databases are copied record by record and the old database is deleted:
  - `vellum-assets` → `editrim-assets` (`assets`, keyPath `id`)
  - `vellum-photo-source` → `editrim-photo-source` (`source`, key `current`)
  - `vellum-video-media` → `editrim-video-media` (`media`, IDs)
- The migration skips a database that already has records, so it never overwrites new data.
- The inline theme boot script also reads the old theme key and writes the new one before first paint, so an existing dark-mode user sees no flash.
- Migration is raced against a 3s timeout so a blocked IndexedDB upgrade cannot hold up the app.

Verified with `scripts/editrim-migration-e2e.mjs`: seeded old keys and databases become new keys and databases, old keys are gone, the dark theme survives, and the dashboard wordmark reads **Editrim**.

## Deployment

- Vercel project renamed from `vellum` to `editrim`; default production domain is `editrim.vercel.app`.
- GitHub repository renamed to `IMMENSE-BUILDER/editrim`; old links redirect.
- Local folder keeps its original path; no commands in the repo depend on it.

## Verification

```text
npx tsc --noEmit                         TSC_EXIT=0
npm run build                            ✓ built
node scripts/editrim-migration-e2e.mjs   EDITRIM MIGRATION OK
node scripts/theme-e2e.mjs               THEME AUDIT OK
node scripts/home-e2e.mjs                HOME FEATURES E2E OK
node scripts/simplicity-e2e.mjs          SIMPLICITY E2E OK
node scripts/icon-coverage.mjs           ICON COVERAGE OK — Editrim vocabulary
node scripts/icon-choreography.mjs       ICON CHOREOGRAPHY OK — 122 glyphs
node scripts/icon-motion-e2e.mjs         ICON MOTION E2E OK
node scripts/library-e2e.mjs             LIBRARY OK
node scripts/context-menu-e2e.mjs        CONTEXT MENU E2E OK
node scripts/polish-e2e.mjs              POLISH E2E OK
node scripts/photo-editor-e2e.mjs        PHOTO EDITOR E2E OK
node scripts/video-editor-e2e.mjs        VIDEO EDITOR E2E OK
```
