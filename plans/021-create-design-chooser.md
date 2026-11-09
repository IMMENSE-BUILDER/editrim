# Create a design chooser

## The job

The dashboard creation shortcuts used to start a canvas immediately, so people
had to enter the editor before seeing whether a template or format was right.
This adds a full-screen **Create a design** chooser that opens from every central
dashboard shortcut.

## Behaviour

- Clicking **Templates, Presentation, Social media, Video, Printables, Doc,
  Whiteboard, Sheet, Website, Photo, Upload or Custom size** opens the chooser
  on that section.
- The left rail contains: For you, Templates, Presentations, Social media,
  Photo editor, Videos, Printables, Docs, Whiteboards, Sheets, Websites, Custom
  size, Upload and More.
- The top search filters templates, size options, video formats and action
  cards.
- Template cards render real `PagePreview` art. Size, video, doc, sheet,
  whiteboard and website cards use lightweight mock art.
- Selecting a card opens a details bar with its name, category, dimensions and
  page count when applicable. Nothing opens until **Use this layout** is pressed.
- Handoffs:
  - template → `/editor/new?template=...`
  - size / blank doc / whiteboard / sheet / website → new editor design
  - video → new `/video/...` project with the chosen dimensions
  - custom size → new editor design with the converted pixel size
  - upload → the existing local image import flow
- More remains the existing shortcut menu on the dashboard; the chooser also has
  its own More section for secondary actions.

## Implementation

| File | Purpose |
|------|---------|
| `src/components/CreateDesignModal.tsx` | Full-screen chooser, categories, search, mocks, details bar and editor handoffs |
| `src/styles/create-design.css` | Dark chooser shell, sidebar, cards, sections, responsive rules |
| `src/pages/Home.tsx` | Opens the chooser from every creation shortcut |
| `scripts/create-design-e2e.mjs` | Category, search, detail and handoff audit |

The chooser is rendered through `createPortal` on `document.body`, traps focus,
closes on Escape or backdrop click, locks background scrolling and restores focus
on close.

## Verification

```text
node scripts/create-design-e2e.mjs   CREATE DESIGN E2E OK
node scripts/photo-editor-e2e.mjs    PHOTO EDITOR E2E OK
node scripts/e2e2.mjs                E2E 2 OK
node scripts/library-e2e.mjs         LIBRARY OK
node scripts/theme-e2e.mjs           THEME AUDIT OK
node scripts/simplicity-e2e.mjs      SIMPLICITY E2E OK
```

The chooser audit checks every dashboard category, template search, layout
details, the template/presentation/video/custom/upload handoffs, and the 390 × 844
two-column layout with the active category scrolled into view.
