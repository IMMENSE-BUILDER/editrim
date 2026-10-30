import type { Design } from './types';
import { renderPageCanvas, canvasToBlob } from './render';
import { downloadBlob, safeFilename } from './utils';

export type ExportFormat = 'png' | 'jpg' | 'pdf';

export type ExportOptions = {
  format: ExportFormat;
  scale: number;
  pages: 'current' | 'all';
  transparent: boolean;
};

export type ExportResult = { files: number; pages: number; format: ExportFormat };

export async function exportDesign(design: Design, currentPage: number, opts: ExportOptions): Promise<ExportResult> {
  const base = safeFilename(design.title);
  const indexes = opts.pages === 'all' ? design.pages.map((_, i) => i) : [currentPage];

  if (opts.format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    let doc: any = null;
    for (let n = 0; n < indexes.length; n++) {
      const i = indexes[n];
      const page = design.pages[i];
      const canvas = await renderPageCanvas(page, design.size, { scale: Math.min(opts.scale, 2), transparent: false });
      const data = canvas.toDataURL('image/jpeg', 0.92);
      const pw = design.size.width * 0.75;
      const ph = design.size.height * 0.75;
      if (!doc) {
        doc = new jsPDF({
          orientation: design.size.width >= design.size.height ? 'landscape' : 'portrait',
          unit: 'pt',
          format: [pw, ph],
          compress: true,
        });
      } else {
        doc.addPage([pw, ph], design.size.width >= design.size.height ? 'landscape' : 'portrait');
      }
      doc.addImage(data, 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
    }
    if (doc) doc.save(`${base}.pdf`);
    return { files: 1, pages: indexes.length, format: 'pdf' };
  }

  for (const i of indexes) {
    const page = design.pages[i];
    const canvas = await renderPageCanvas(page, design.size, { scale: opts.scale, transparent: opts.transparent && opts.format === 'png' });
    const isJpg = opts.format === 'jpg';
    const blob = await canvasToBlob(canvas, isJpg ? 'image/jpeg' : 'image/png', 0.94);
    const suffix = indexes.length > 1 ? `-${String(i + 1).padStart(2, '0')}` : '';
    downloadBlob(blob, `${base}${suffix}.${opts.format}`);
  }
  return { files: indexes.length, pages: indexes.length, format: opts.format };
}
