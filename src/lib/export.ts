import type { Design, El, Page } from './types';
import { renderPageCanvas, canvasToBlob } from './render';
import { downloadBlob, rotatedBBox, safeFilename, unionRect } from './utils';
import { exportSvg } from './svgExport';

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'pdf' | 'svg';

export type ExportOptions = {
  format: ExportFormat;
  scale: number;
  pages: 'current' | 'all';
  transparent: boolean;
  /** JPEG and WebP compression, 0.5–1. Defaults to 0.92. */
  quality?: number;
  /** Standard keeps the classic 2× JPEG page; print adds bleed, crop marks and DPI. */
  pdfMode?: 'standard' | 'print';
  bleedMm?: 0 | 3 | 5;
  cropMarks?: boolean;
  dpi?: 150 | 300;
};

export type ExportResult = { files: number; pages: number; format: ExportFormat };

const RASTER_MIME: Record<'png' | 'jpg' | 'webp', string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

/** Millimetres to PDF points. */
const mmToPt = (mm: number) => mm * 2.83465;

/** Print pages are rendered as a bitmap — keep either side under 6000 px. */
const MAX_PRINT_SIDE = 6000;

export async function exportSelection(design: Design, elements: El[], page?: Page): Promise<void> {
  if (!elements.length) throw new Error('Nothing selected');
  const bounds = unionRect(elements.map(el => rotatedBBox(el)));
  if (!bounds || bounds.w < 1 || bounds.h < 1) throw new Error('Nothing to export');
  const width = Math.max(1, Math.ceil(bounds.w));
  const height = Math.max(1, Math.ceil(bounds.h));
  const temp: Page = {
    id: 'selection',
    name: 'Selection',
    background: { kind: 'solid', color: '#ffffff' },
    elements: elements.map(el => ({
      ...structuredClone(el),
      x: el.x - bounds.x,
      y: el.y - bounds.y,
    })),
  };
  const canvas = await renderPageCanvas(temp, { name: 'Selection', width, height }, { scale: 2, transparent: true });
  const blob = await canvasToBlob(canvas, 'image/png', 0.94);
  const suffix = page ? `-${safeFilename(page.name || 'page')}` : '';
  downloadBlob(blob, `${safeFilename(design.title)}${suffix}-selection.png`);
}

/** Thin L-shaped registration marks, 4 pt outside the trim box, 12 pt long. */
function drawCropMarks(doc: any, x: number, y: number, w: number, h: number) {
  const gap = 4;
  const arm = 12;
  doc.setDrawColor(20);
  doc.setLineWidth(0.5);
  // top-left
  doc.line(x - gap - arm, y, x - gap, y);
  doc.line(x, y - gap - arm, x, y - gap);
  // top-right
  doc.line(x + w + gap, y, x + w + gap + arm, y);
  doc.line(x + w, y - gap - arm, x + w, y - gap);
  // bottom-left
  doc.line(x - gap - arm, y + h, x - gap, y + h);
  doc.line(x, y + h + gap, x, y + h + gap + arm);
  // bottom-right
  doc.line(x + w + gap, y + h, x + w + gap + arm, y + h);
  doc.line(x + w, y + h + gap, x + w, y + h + gap + arm);
}

export async function exportDesign(design: Design, currentPage: number, opts: ExportOptions): Promise<ExportResult> {
  const base = safeFilename(design.title);
  const indexes = opts.pages === 'all' ? design.pages.map((_, i) => i) : [currentPage];
  const quality = Math.min(1, Math.max(0.5, opts.quality ?? 0.92));

  if (opts.format === 'svg') {
    for (const i of indexes) {
      const suffix = indexes.length > 1 ? `-${String(i + 1).padStart(2, '0')}` : '';
      await exportSvg(design, i, `${base}${suffix}.svg`);
    }
    return { files: indexes.length, pages: indexes.length, format: 'svg' };
  }

  if (opts.format === 'pdf') {
    const print = opts.pdfMode === 'print';
    const bleedPt = print ? mmToPt(opts.bleedMm ?? 0) : 0;
    const trimW = design.size.width * 0.75;
    const trimH = design.size.height * 0.75;
    const pageW = trimW + bleedPt * 2;
    const pageH = trimH + bleedPt * 2;
    const orientation = design.size.width >= design.size.height ? 'landscape' : 'portrait';
    const scale = print
      ? Math.min((opts.dpi ?? 300) / 96, MAX_PRINT_SIDE / Math.max(design.size.width, design.size.height))
      : Math.min(opts.scale, 2);
    const { jsPDF } = await import('jspdf');
    let doc: any = null;
    for (const i of indexes) {
      const page = design.pages[i];
      const canvas = await renderPageCanvas(page, design.size, { scale, transparent: false });
      const data = canvas.toDataURL('image/jpeg', quality);
      if (!doc) {
        doc = new jsPDF({ orientation, unit: 'pt', format: [pageW, pageH], compress: true });
      } else {
        doc.addPage([pageW, pageH], orientation);
      }
      doc.addImage(data, 'JPEG', bleedPt, bleedPt, trimW, trimH, undefined, 'FAST');
      if (print && opts.cropMarks && bleedPt > 0) drawCropMarks(doc, bleedPt, bleedPt, trimW, trimH);
    }
    if (doc) doc.save(`${base}.pdf`);
    return { files: 1, pages: indexes.length, format: 'pdf' };
  }

  const format = opts.format;
  const mime = RASTER_MIME[format];
  const transparent = opts.transparent && format !== 'jpg';
  for (const i of indexes) {
    const page = design.pages[i];
    const canvas = await renderPageCanvas(page, design.size, { scale: opts.scale, transparent });
    const blob = await canvasToBlob(canvas, mime, quality);
    const suffix = indexes.length > 1 ? `-${String(i + 1).padStart(2, '0')}` : '';
    downloadBlob(blob, `${base}${suffix}.${format}`);
  }
  return { files: indexes.length, pages: indexes.length, format };
}
