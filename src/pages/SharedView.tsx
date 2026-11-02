import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Logo } from '../components/Brand';
import { PagePreview } from '../components/PagePreview';
import { decodeShare } from '../lib/share';
import { saveDesign } from '../lib/storage';
import type { Design } from '../lib/types';
import { downloadBlob, safeFilename, uid } from '../lib/utils';
import { renderPageCanvas, canvasToBlob } from '../lib/render';
import { useToast } from '../components/Toast';
import { VellumIcon } from '../components/VellumIcon';
import '../styles/present.css';

export default function SharedView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [design, setDesign] = useState<Design | null>(null);
  const [checked, setChecked] = useState(false);
  const [page, setPage] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const decoded = decodeShare(window.location.hash);
    if (decoded) {
      setDesign(decoded);
      document.title = `${decoded.title} — Shared — Vellum`;
    }
    setChecked(true);
  }, []);

  const aspect = design ? design.size.width / design.size.height : 1;
  const pages = design?.pages.length ?? 0;

  const importCopy = () => {
    if (!design) return;
    const copy: Design = {
      ...structuredClone(design),
      id: uid('d'),
      title: `${design.title} copy`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: design.pages.map(p => ({
        ...structuredClone(p),
        id: uid('p'),
        elements: p.elements.map(el => ({ ...structuredClone(el), id: uid(el.type) })),
      })),
    };
    try {
      saveDesign(copy);
      navigate(`/editor/${copy.id}`);
    } catch {
      toast('This design is too large for local storage. Ask for a smaller file.', 'error');
    }
  };

  const download = async () => {
    if (!design) return;
    setDownloading(true);
    try {
      const canvas = await renderPageCanvas(design.pages[page], design.size, { scale: 2, transparent: false });
      const blob = await canvasToBlob(canvas, 'image/png');
      downloadBlob(blob, `${safeFilename(design.title)}.png`);
      toast('PNG downloaded');
    } catch {
      toast('Could not export this design', 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (!checked) return null;

  if (!design) {
    return (
      <div className="shared-shell">
        <header className="shared-top">
          <Link to="/"><Logo size={30} /></Link>
          <div className="shared-actions">
            <Link to="/templates" className="btn btn-secondary btn-sm">Browse templates</Link>
            <Link to="/editor/new" className="btn btn-cobalt btn-sm">Start designing</Link>
          </div>
        </header>
        <div className="shared-empty">
          <div className="shared-empty-art"><VellumIcon name="share" size={24} /></div>
          <h1>This link is missing its design.</h1>
          <p>
            A Vellum share link carries the whole design inside the URL. If it was shortened or edited,
            part of the design may have been lost. Ask the sender for a fresh link.
          </p>
          <Link to="/" className="btn btn-primary">Go to Vellum <VellumIcon name="arrowRight" size={15} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-shell">
      <header className="shared-top">
        <div className="shared-top-left">
          <Link to="/" aria-label="Vellum home"><Logo size={30} wordmark={false} /></Link>
          <div className="shared-title">
            <strong>{design.title}</strong>
            <span>Shared design · read only</span>
          </div>
        </div>
        <div className="shared-actions">
          <button className="btn btn-ghost btn-sm" onClick={download} disabled={downloading}>
            <VellumIcon name="download" size={14} /> {downloading ? 'Exporting…' : 'PNG'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={importCopy}>
            <VellumIcon name="pencil" size={14} /> Edit a copy
          </button>
          <Link to="/editor/new" className="btn btn-cobalt btn-sm">
            Make your own <VellumIcon name="arrowRight" size={14} />
          </Link>
        </div>
      </header>

      <div className="shared-body">
        <aside className="shared-info">
          <span className="eyebrow"><span className="dot" /> Shared with Vellum</span>
          <h1>{design.title}</h1>
          <div className="shared-meta">
            <span>{design.size.width} × {design.size.height}</span>
            <span>{pages} {pages === 1 ? 'page' : 'pages'}</span>
            <span>No account needed</span>
          </div>
          <p>A read-only preview, packed entirely into the link. Edit a copy to make it yours — the original stays untouched.</p>
          <div className="shared-buttons">
            <button className="btn btn-primary" onClick={importCopy}>Edit a copy <VellumIcon name="external" size={14} /></button>
            <button className="btn btn-secondary" onClick={() => setPage(p => (p + 1) % pages)}>Next page</button>
          </div>
          <div className="shared-facts">
            <span>You can</span>
            <ul>
              <li>View every page</li>
              <li>Download a PNG</li>
              <li>Make an editable copy</li>
            </ul>
          </div>
        </aside>

        <main className="shared-stage">
          <div className="shared-page-wrap" style={{ aspectRatio: aspect }}>
            <PagePreview page={design.pages[page]} size={design.size} />
          </div>
          {pages > 1 && (
            <div className="shared-pager">
              <button className="btn-icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><VellumIcon name="arrowLeft" size={16} /></button>
              <span>{page + 1} / {pages}</span>
              <button className="btn-icon" onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}><VellumIcon name="arrowRight" size={16} /></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
