import { useEffect, useState } from 'react';
import { Check, Copy, Download, ExternalLink, FileImage, FileText, Loader2, Share2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import type { Design } from '../lib/types';
import { exportDesign, type ExportFormat } from '../lib/export';
import { useToast } from '../components/Toast';
import { buildShareLink } from '../lib/share';

export function ExportModal({
  open,
  onClose,
  design,
  pageIndex,
}: {
  open: boolean;
  onClose: () => void;
  design: Design;
  pageIndex: number;
}) {
  const { toast } = useToast();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState(2);
  const [pages, setPages] = useState<'current' | 'all'>('current');
  const [transparent, setTransparent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setBusy(false);
      setFormat('png');
      setScale(2);
      setPages('current');
      setTransparent(false);
    }
  }, [open]);

  const run = async () => {
    setBusy(true);
    try {
      const result = await exportDesign(design, pageIndex, { format, scale, pages, transparent });
      toast(result.files > 1 ? `${result.files} pages downloaded` : `${format.toUpperCase()} downloaded`);
      onClose();
    } catch (err) {
      toast('Export failed. If a photo is blocked, try another image.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const outW = Math.round(design.size.width * (format === 'pdf' ? 1 : scale));
  const outH = Math.round(design.size.height * (format === 'pdf' ? 1 : scale));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Download"
      subtitle="Take the design with you — no watermark, no sign-up."
      width={600}
      footer={
        <>
          <span className="export-note">
            {format === 'pdf' ? `${pages === 'all' ? design.pages.length : 1} page PDF` : `${outW} × ${outH} px`} · {format.toUpperCase()}
          </span>
          <button className="btn btn-cobalt" onClick={run} disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
            {busy ? 'Exporting…' : 'Download'}
          </button>
        </>
      }
    >
      <div className="export-formats">
        {[
          { id: 'png' as ExportFormat, label: 'PNG', note: 'Best quality · transparency', icon: FileImage },
          { id: 'jpg' as ExportFormat, label: 'JPG', note: 'Smaller file · no transparency', icon: FileImage },
          { id: 'pdf' as ExportFormat, label: 'PDF', note: 'Print-ready · all pages', icon: FileText },
        ].map(f => {
          const Icon = f.icon;
          return (
            <button key={f.id} className={`export-format ${format === f.id ? 'active' : ''}`} onClick={() => setFormat(f.id)}>
              <Icon size={19} />
              <b>{f.label}</b>
              <span>{f.note}</span>
              {format === f.id && <Check size={15} className="export-check" />}
            </button>
          );
        })}
      </div>

      <div className="export-options">
        <div className="export-option-row">
          <span>Pages</span>
          <div className="segmented">
            <button className={pages === 'current' ? 'active' : ''} onClick={() => setPages('current')}>This page</button>
            <button className={pages === 'all' ? 'active' : ''} onClick={() => setPages('all')}>All {design.pages.length}</button>
          </div>
        </div>
        <div className="export-option-row">
          <span>Resolution</span>
          <div className="segmented">
            {[1, 2, 3].map(s => (
              <button key={s} className={scale === s ? 'active' : ''} onClick={() => setScale(s)}>{s}×</button>
            ))}
          </div>
        </div>
        {format === 'png' && (
          <div className="export-option-row">
            <span>Transparent background</span>
            <button className={`switch ${transparent ? 'on' : ''}`} onClick={() => setTransparent(v => !v)} aria-pressed={transparent}>
              <i />
            </button>
          </div>
        )}
      </div>

      {format === 'png' && pages === 'all' && (
        <div className="export-warning">Multi-page PNG downloads one numbered file per page.</div>
      )}
      {format === 'pdf' && (
        <div className="export-warning">PDF is exported at 2× for print. Each page keeps the design’s exact ratio.</div>
      )}
    </Modal>
  );
}

export function ShareModal({
  open,
  onClose,
  design,
}: {
  open: boolean;
  onClose: () => void;
  design: Design;
}) {
  const { toast } = useToast();
  const [state, setState] = useState<{ url: string; ok: boolean; reason?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    setState(null);
    let alive = true;
    buildShareLink(design)
      .then(res => { if (alive) setState(res); })
      .catch(() => { if (alive) setState(null); });
    return () => { alive = false; };
  }, [open, design]);

  const copy = async () => {
    if (!state) return;
    try {
      await navigator.clipboard.writeText(state.url);
      setCopied(true);
      toast('Link copied');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const input = document.getElementById('share-url') as HTMLInputElement | null;
      input?.select();
      document.execCommand('copy');
      setCopied(true);
      toast('Link copied');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share a view link"
      subtitle="A link that opens a read-only preview. The design travels inside the URL — no server involved."
      width={560}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-cobalt" onClick={copy} disabled={!state?.ok}>
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy link'}
          </button>
        </>
      }
    >
      {!state ? (
        <div className="share-loading"><Loader2 size={18} className="spin" /> Packing the design…</div>
      ) : (
        <>
          <div className="share-input">
            <input id="share-url" readOnly value={state.url} onFocus={e => e.currentTarget.select()} />
            <button className="btn btn-secondary btn-sm" onClick={() => window.open(state.url, '_blank', 'noreferrer')}>
              <ExternalLink size={14} /> Preview
            </button>
          </div>
          {!state.ok && (
            <div className="share-warning">
              <Share2 size={15} />
              <span>{state.reason ?? 'This design is too large to fit in a link.'}</span>
            </div>
          )}
          <div className="share-facts">
            <span><Check size={13} /> Read-only view</span>
            <span><Check size={13} /> Opens without an account</span>
            <span><Check size={13} /> Entirely client-side</span>
          </div>
          <div className="share-hint">
            Tip: for print or client work, use Download → PDF. A link is best for a quick review.
          </div>
        </>
      )}
    </Modal>
  );
}

export function ResizeModal({
  open,
  onClose,
  design,
  onResize,
}: {
  open: boolean;
  onClose: () => void;
  design: Design;
  onResize: (w: number, h: number) => void;
}) {
  const [w, setW] = useState(design.size.width);
  const [h, setH] = useState(design.size.height);

  useEffect(() => {
    if (open) {
      setW(design.size.width);
      setH(design.size.height);
    }
  }, [open, design.size.width, design.size.height]);

  const presets = [
    { name: 'Square post', w: 1080, h: 1080 },
    { name: 'Story', w: 1080, h: 1920 },
    { name: 'Presentation', w: 1920, h: 1080 },
    { name: 'A4 portrait', w: 1240, h: 1754 },
    { name: 'LinkedIn', w: 1200, h: 1200 },
    { name: 'YouTube', w: 1280, h: 720 },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resize canvas"
      subtitle="Content scales proportionally and stays centred. Nothing is cropped."
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-cobalt"
            onClick={() => { onResize(w, h); onClose(); }}
            disabled={w === design.size.width && h === design.size.height}
          >
            Resize canvas
          </button>
        </>
      }
    >
      <div className="resize-current">
        <span>Current</span>
        <b>{design.size.width} × {design.size.height}</b>
        <span>{design.pages.length} {design.pages.length === 1 ? 'page' : 'pages'}</span>
      </div>
      <div className="custom-size-row" style={{ marginTop: 18 }}>
        <div className="field">
          <label className="field-label" htmlFor="resize-w">Width (px)</label>
          <input id="resize-w" className="input" type="number" min={100} max={6000} value={w} onChange={e => setW(Math.max(100, Math.min(6000, Number(e.target.value) || 100)))} />
        </div>
        <span className="custom-x">×</span>
        <div className="field">
          <label className="field-label" htmlFor="resize-h">Height (px)</label>
          <input id="resize-h" className="input" type="number" min={100} max={6000} value={h} onChange={e => setH(Math.max(100, Math.min(6000, Number(e.target.value) || 100)))} />
        </div>
      </div>
      <div className="resize-presets">
        {presets.map(p => (
          <button key={p.name} className={w === p.w && h === p.h ? 'active' : ''} onClick={() => { setW(p.w); setH(p.h); }}>
            {p.name}
            <small>{p.w}×{p.h}</small>
          </button>
        ))}
      </div>
      <div className="resize-preview">
        <div style={{ aspectRatio: `${w} / ${h}` }} />
        <span>{w} × {h} px · {design.pages.length > 1 ? 'all pages' : '1 page'}</span>
      </div>
    </Modal>
  );
}

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const groups = [
    { title: 'Canvas', items: [['Select all', '⌘/Ctrl A'], ['Deselect', 'Esc'], ['Zoom', '⌘/Ctrl + scroll'], ['Pan', 'Space + drag'], ['Fit to screen', 'Ctrl+Shift+1']] },
    { title: 'Edit', items: [['Undo', '⌘/Ctrl Z'], ['Redo', '⌘/Ctrl ⇧ Z'], ['Duplicate', '⌘/Ctrl D'], ['Copy / paste', '⌘/Ctrl C / V'], ['Delete', '⌫ / Del'], ['Nudge', 'Arrow keys']] },
    { title: 'Text & selection', items: [['Edit text', 'Double-click'], ['Multi-select', 'Shift + click'], ['Constrain move', 'Shift + drag'], ['Resize from centre-ish', 'Shift + corner'], ['Snap rotation', 'Shift + rotate']] },
    { title: 'Layers & actions', items: [['Context menu', 'Right-click'], ['Copy style', 'Ctrl+Alt+C'], ['Paste style', 'Ctrl+Alt+V'], ['Group', 'Ctrl+G'], ['Ungroup', 'Ctrl+Shift+G'], ['Create component', 'Ctrl+Alt+K'], ['Comment', 'Ctrl+Alt+N']] },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts" subtitle="The fast way around the canvas." width={640}>
      <div className="shortcuts-grid">
        {groups.map(g => (
          <div key={g.title}>
            <h4>{g.title}</h4>
            {g.items.map(([label, key]) => (
              <div className="shortcut-row" key={label}>
                <span>{label}</span>
                <span className="kbd">{key}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="share-hint">Tip: hold Shift while resizing a corner to keep the original aspect ratio.</div>
    </Modal>
  );
}
