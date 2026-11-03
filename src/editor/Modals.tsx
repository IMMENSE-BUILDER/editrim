import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { EditrimIcon, type EditrimIconName } from '../components/EditrimIcon';
import { Modal } from '../components/Modal';
import type { Design } from '../lib/types';
import { exportDesign, type ExportFormat } from '../lib/export';
import { useToast } from '../components/Toast';
import { buildShareLink } from '../lib/share';
import '../styles/export.css';

const FORMATS: { id: ExportFormat; label: string; note: string; icon: EditrimIconName }[] = [
  { id: 'png', label: 'PNG', note: 'Lossless · alpha', icon: 'image' },
  { id: 'jpg', label: 'JPG', note: 'Smaller file', icon: 'camera' },
  { id: 'pdf', label: 'PDF', note: 'Print · bleed', icon: 'doc' },
  { id: 'webp', label: 'WebP', note: 'Web-ready · small', icon: 'website' },
  { id: 'svg', label: 'SVG', note: 'Vector text & shapes', icon: 'code' },
];

const PAPER: [string, number, number][] = [
  ['A3', 297, 420],
  ['A4', 210, 297],
  ['A5', 148, 210],
  ['A6', 105, 148],
  ['Letter', 215.9, 279.4],
];

/** Trim size in millimetres, named when it matches a standard sheet. */
function paperLabel(width: number, height: number) {
  const mmW = (width * 0.75) / 2.83465;
  const mmH = (height * 0.75) / 2.83465;
  const match = PAPER.find(
    ([, a, b]) => (Math.abs(mmW - a) <= 3 && Math.abs(mmH - b) <= 3) || (Math.abs(mmW - b) <= 3 && Math.abs(mmH - a) <= 3),
  );
  return match ? match[0] : `${Math.round(mmW)} × ${Math.round(mmH)} mm`;
}

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
  const [quality, setQuality] = useState(0.92);
  const [pdfMode, setPdfMode] = useState<'standard' | 'print'>('standard');
  const [bleedMm, setBleedMm] = useState<0 | 3 | 5>(3);
  const [cropMarks, setCropMarks] = useState(true);
  const [dpi, setDpi] = useState<150 | 300>(300);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setBusy(false);
      setFormat('png');
      setScale(2);
      setPages('current');
      setTransparent(false);
      setQuality(0.92);
      setPdfMode('standard');
      setBleedMm(3);
      setCropMarks(true);
      setDpi(300);
    }
  }, [open]);

  const raster = format === 'png' || format === 'jpg' || format === 'webp';
  const print = format === 'pdf' && pdfMode === 'print';

  const summary = useMemo(() => {
    if (format === 'pdf') {
      const bleed = print ? bleedMm : 0;
      return `${paperLabel(design.size.width, design.size.height)}${bleed ? ` · ${bleed} mm bleed` : ''} · PDF`;
    }
    if (format === 'svg') return `${design.size.width} × ${design.size.height} px · SVG`;
    const w = Math.round(design.size.width * scale);
    const h = Math.round(design.size.height * scale);
    return `${w} × ${h} px · ${format.toUpperCase()}`;
  }, [format, print, bleedMm, design.size.width, design.size.height, scale]);

  const run = async () => {
    setBusy(true);
    try {
      const result = await exportDesign(design, pageIndex, {
        format,
        scale,
        pages,
        transparent,
        quality,
        pdfMode,
        bleedMm,
        cropMarks,
        dpi,
      });
      toast(result.files > 1 ? `${result.files} pages downloaded` : `${format.toUpperCase()} downloaded`);
      onClose();
    } catch (err) {
      toast('Export failed. If a photo is blocked, try another image.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const pickBleed = (mm: 0 | 3 | 5) => {
    setBleedMm(mm);
    if (mm === 0) setCropMarks(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Download"
      subtitle="Take the design with you — no watermark, no sign-up."
      width={620}
      footer={
        <>
          <span className="export-note">{summary}</span>
          <button className="btn btn-cobalt" onClick={run} disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" /> : <EditrimIcon name="download" size={16} />}
            {busy ? 'Exporting…' : 'Download'}
          </button>
        </>
      }
    >
      <div className="export-formats export-formats-5">
        {FORMATS.map(f => (
          <button key={f.id} className={`export-format ${format === f.id ? 'active' : ''}`} onClick={() => setFormat(f.id)}>
            <EditrimIcon name={f.icon} size={19} />
            <b>{f.label}</b>
            <span>{f.note}</span>
            {format === f.id && <EditrimIcon name="check" size={15} className="export-check" />}
          </button>
        ))}
      </div>

      <div className="export-options">
        <div className="export-option-row">
          <span>Pages</span>
          <div className="segmented">
            <button className={pages === 'current' ? 'active' : ''} onClick={() => setPages('current')}>This page</button>
            <button className={pages === 'all' ? 'active' : ''} onClick={() => setPages('all')}>All {design.pages.length}</button>
          </div>
        </div>

        {raster && (
          <div className="export-option-row">
            <span>Resolution</span>
            <div className="segmented">
              {[1, 2, 3].map(s => (
                <button key={s} className={scale === s ? 'active' : ''} onClick={() => setScale(s)}>{s}×</button>
              ))}
            </div>
          </div>
        )}

        {(format === 'png' || format === 'webp') && (
          <div className="export-option-row">
            <span>Transparent background</span>
            <button className={`switch ${transparent ? 'on' : ''}`} onClick={() => setTransparent(v => !v)} aria-pressed={transparent}>
              <i />
            </button>
          </div>
        )}

        {(format === 'jpg' || format === 'webp') && (
          <div className="export-option-row">
            <span>Quality</span>
            <div className="export-quality">
              <input
                type="range"
                min={50}
                max={100}
                step={1}
                value={Math.round(quality * 100)}
                onChange={e => setQuality(Number(e.target.value) / 100)}
                aria-label="Quality"
              />
              <span className="export-quality-value">{Math.round(quality * 100)}%</span>
            </div>
          </div>
        )}

        {format === 'pdf' && (
          <div className="export-option-row">
            <span>PDF mode</span>
            <div className="segmented">
              <button className={pdfMode === 'standard' ? 'active' : ''} onClick={() => setPdfMode('standard')}>Standard</button>
              <button className={pdfMode === 'print' ? 'active' : ''} onClick={() => setPdfMode('print')}>Print</button>
            </div>
          </div>
        )}

        {print && (
          <>
            <div className="export-option-row">
              <span>Bleed</span>
              <div className="segmented">
                {([0, 3, 5] as const).map(mm => (
                  <button key={mm} className={bleedMm === mm ? 'active' : ''} onClick={() => pickBleed(mm)}>
                    {mm === 0 ? 'None' : `${mm} mm`}
                  </button>
                ))}
              </div>
            </div>
            <div className="export-option-row">
              <span>Crop marks</span>
              <button
                className={`switch ${cropMarks ? 'on' : ''}`}
                onClick={() => setCropMarks(v => !v)}
                aria-pressed={cropMarks}
                disabled={bleedMm === 0}
              >
                <i />
              </button>
            </div>
            <div className="export-option-row">
              <span>DPI</span>
              <div className="segmented">
                {([150, 300] as const).map(d => (
                  <button key={d} className={dpi === d ? 'active' : ''} onClick={() => setDpi(d)}>{d}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {print && <div className="export-warning">Print PDF is raster at {dpi} DPI with bleed and crop marks.</div>}
      {format === 'pdf' && !print && (
        <div className="export-warning">Standard PDF is a 2× raster of each page, sized to the design.</div>
      )}
      {format === 'svg' && <div className="export-warning">Text and shapes stay vector; photos are embedded.</div>}
      {format !== 'pdf' && pages === 'all' && (
        <div className="export-warning">Multi-page {format.toUpperCase()} downloads one numbered file per page.</div>
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
            {copied ? <EditrimIcon name="check" size={15} /> : <EditrimIcon name="copy" size={15} />} {copied ? 'Copied' : 'Copy link'}
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
              <EditrimIcon name="external" size={14} /> Preview
            </button>
          </div>
          {!state.ok && (
            <div className="share-warning">
              <EditrimIcon name="share" size={15} />
              <span>{state.reason ?? 'This design is too large to fit in a link.'}</span>
            </div>
          )}
          <div className="share-facts">
            <span><EditrimIcon name="check" size={13} /> Read-only view</span>
            <span><EditrimIcon name="check" size={13} /> Opens without an account</span>
            <span><EditrimIcon name="check" size={13} /> Entirely client-side</span>
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
    { title: 'Studio', items: [['Quick actions', 'Ctrl K'], ['Command search', '/'], ['Version history', 'Clock'], ['Resize & variants', 'Resize'], ['Bulk create', 'CSV']] },
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
