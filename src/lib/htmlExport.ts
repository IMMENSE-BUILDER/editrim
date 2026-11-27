import { renderPageSvg } from './svgExport';
import type { Design } from './types';
import { downloadBlob, safeFilename } from './utils';

const escHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function exportHtml(design: Design): Promise<void> {
  const sections: string[] = [];

  for (const page of design.pages) {
    const rawSvg = await renderPageSvg(page, design.size);
    const responsiveSvg = rawSvg.replace(
      /<svg([^>]*)\s+width="[^"]*"\s+height="[^"]*"/,
      '<svg$1 width="100%" height="auto"',
    );

    const links = page.elements
      .filter(el => !el.hidden && el.link && (el.link.url || el.link.pageId))
      .map(el => {
        const href = el.link!.pageId ? `#page-${el.link!.pageId}` : (el.link!.url ?? '#');
        const ext = !el.link!.pageId && el.link!.url ? ' target="_blank" rel="noopener noreferrer"' : '';
        const left = ((el.x / design.size.width) * 100).toFixed(3);
        const top = ((el.y / design.size.height) * 100).toFixed(3);
        const w = ((el.w / design.size.width) * 100).toFixed(3);
        const h = ((el.h / design.size.height) * 100).toFixed(3);
        return `<a class="ed-link" href="${escHtml(href)}"${ext} style="left:${left}%;top:${top}%;width:${w}%;height:${h}%;" aria-label="${escHtml(el.name)}"></a>`;
      })
      .join('');

    sections.push(`<section id="page-${escHtml(page.id)}" class="ed-section">${responsiveSvg}${links}</section>`);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escHtml(design.title || 'Editrim Site')}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: #14130f; font-family: system-ui, sans-serif; }
  .ed-site { display: flex; flex-direction: column; align-items: center; }
  .ed-section { position: relative; width: min(${design.size.width}px, 100vw); max-width: 100vw; line-height: 0; }
  .ed-section > svg { display: block; width: 100%; height: auto; }
  .ed-link { position: absolute; display: block; cursor: pointer; }
</style>
</head>
<body>
<main class="ed-site">
${sections.join('\n')}
</main>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${safeFilename(design.title)}.html`);
}
