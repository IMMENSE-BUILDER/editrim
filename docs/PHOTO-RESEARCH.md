# Photo editor research — November 2026

Public product pages captured while scoping this feature:

- **Photopea — Free Online Photo Editor** (`photopea.com`): positions itself as fully local — "There are no uploads. Photopea runs on your device." Lists cropping and resizing, layers, masks, PSD support, RAW development with exposure, colour balance, contrast, highlights and shadows, plus adjustment layers and filters such as levels, curves and Gaussian blur.
- **Pixlr Editor** (`pixlr.com/editor`): the public editor menu lists Adjustment → Exposure, Brightness and contrast, Temperature and tint, Hue and saturation, Vibrance, Highlights and shadows; Filter → Sharpen, Clarity, Blur, Gaussian blur, Grain, Vignette; Edit and Image → rotate left/right and flip horizontal/vertical; Crop with free and fixed aspect plus preset ratios; Text layers. Pixlr states that history "is only saved temporarily in the browser cache" and that long-term projects must be downloaded as `.PXZ`.
- **CapCut — Free Online Photo Editor** (`capcut.com/tools/photo-editor`): filters and effects, text effects, image cropper, image resizer, image converter, and an export step with customisable format, size and quality. Its AI background removal, generative fill and cloud storage are account-backed services.

## Patterns adopted

1. **Local-first editing.** Photos never leave the browser. The source file is stored in IndexedDB and the edit session in localStorage, so a reload restores the photo and every control.
2. **A real tonal stack, not a single brightness slider.** Exposure, contrast, highlights, shadows, whites, blacks, temperature, tint, vibrance, saturation, clarity, sharpen, blur, vignette, grain and fade — the range the public editors above expose.
3. **Crop is directional.** Rotate and flip are part of the crop workflow, and aspect presets (1:1, 4:5, 3:2, 16:9, 9:16) match the ratios those editors offer.
4. **Presets are starting points.** A small set of named looks (Mono, Noir, Warm, Cool, Cinematic, Vivid, Soft, Fade) sets the adjustment stack, which stays editable afterwards.
5. **Undo/redo is expected.** `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z`, matching the shortcut convention in both desktop-style editors.
6. **Export is a workflow.** Format (PNG/JPEG/WebP), output scale and quality are chosen before download, with the resulting pixel size shown.
7. **Hold to compare.** A press-and-hold original view is the cheapest honest way to judge an edit without a split-view renderer.

## Deliberately not added

- **AI background removal, generative fill, upscaling.** These need hosted models or API keys; the app is static and local-first.
- **Layers, masks, curves, levels, PSD/RAW import.** This would turn a focused photo editor into a Photoshop clone. The Vellum design editor already owns layered composition.
- **Cloud projects and accounts.** Storage stays in the browser.
- **Video-style timelines.** A photo has no timeline; the four-mode editor (Adjust, Crop, Filters, Text) is the whole surface.

## Resulting scope

- `/photo` route with import (file picker or drag and drop), autosave and restore.
- Adjust: histogram plus the sixteen controls above, double-click to reset a slider.
- Crop: draggable box with thirds guides, aspect presets, rotate left/right, flip X/Y, free crop.
- Filters: nine preset looks rendered as live thumbnails.
- Text: multiple layers with font, weight, size, colour, alignment, opacity, rotation and canvas dragging.
- Export: PNG, JPEG or WebP at full or half scale with a quality control.

## See also

- [plans/008-photo-editor.md](../plans/008-photo-editor.md) — implementation, storage keys and the verification record.
- [VIDEO-RESEARCH.md](VIDEO-RESEARCH.md) — the sibling studio's research and excluded scope.
- [ENGINE-SCHEMA.md](ENGINE-SCHEMA.md) — the `PhotoSession`, `PhotoSettings` and storage formats.

Live: `https://vellum-delta-dun.vercel.app/photo`.
