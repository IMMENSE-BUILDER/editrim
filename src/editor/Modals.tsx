import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GlassActionButton, GlassButton, GlassTabs } from '@/components/liquid-glass';
import { RangeSlider } from '@/components/liquid-glass/controls/RangeSlider';
import { Switch } from '@/components/liquid-glass/controls/Switch';
import { EditrimIcon, type EditrimIconName } from '../components/EditrimIcon';
import { Modal } from '../components/Modal';
import { PagePreview } from '../components/PagePreview';
import type { Design } from '../lib/types';
import { exportDesign, type ExportFormat } from '../lib/export';
import { exportMotion, type MotionFormat } from '../lib/motionExport';
import { useToast } from '../components/Toast';
import { buildShareLink } from '../lib/share';
import '../styles/export.css';

type ModalFormat = ExportFormat | MotionFormat;

const FORMATS: { id: ModalFormat; label: string; note: string; icon: EditrimIconName }[] = [
  { id: 'png', label: 'PNG', note: 'Lossless · alpha', icon: 'image' },
  { id: 'jpg', label: 'JPG', note: 'Smaller file', icon: 'camera' },
  { id: 'pdf', label: 'PDF', note: 'Print · bleed', icon: 'doc' },
  { id: 'webp', label: 'WebP', note: 'Web-ready · small', icon: 'website' },
  { id: 'svg', label: 'SVG', note: 'Vector text & shapes', icon: 'code' },
  { id: 'html', label: 'HTML', note: 'Interactive site', icon: 'website' },
  { id: 'gif', label: 'GIF', note: 'Animated loop', icon: 'animate' },
  { id: 'mp4', label: 'MP4', note: 'H.264 video', icon: 'video' },
  { id: 'webm', label: 'WebM', note: 'VP9/VP8 video', icon: 'film' },
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
  const [format, setFormat] = useState<ModalFormat>('png');
  const [scale, setScale] = useState(2);
  const [fps, setFps] = useState(24);
  const [motionScale, setMotionScale] = useState(0.5);
  const [motionProgress, setMotionProgress] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [pages, setPages] = useState<'current' | 'all'>('current');
  const [transparent, setTransparent] = useState(false);
  const [quality, setQuality] = useState(0.92);
  const [pdfMode, setPdfMode] = useState<'standard' | 'print'>('standard');
  const [bleedMm, setBleedMm] = useState<0 | 3 | 5>(3);
  const [cropMarks, setCropMarks] = useState(true);
  const [dpi, setDpi] = useState<150 | 300>(300);
  const [busy, setBusy] = useState(false);
  const hasWebCodecs = typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';

  useEffect(() => {
    if (open) {
      setBusy(false);
      setMotionProgress(null);
      setFormat('png');
      setScale(2);
      setFps(24);
      setMotionScale(0.5);
      setPages('current');
      setTransparent(false);
      setQuality(0.92);
      setPdfMode('standard');
      setBleedMm(3);
      setCropMarks(true);
      setDpi(300);
    } else {
      abortRef.current?.abort();
    }
  }, [open]);

  const raster = format === 'png' || format === 'jpg' || format === 'webp';
  const motion = format === 'gif' || format === 'mp4' || format === 'webm';
  const print = format === 'pdf' && pdfMode === 'print';

  const summary = useMemo(() => {
    if (format === 'pdf') {
      const bleed = print ? bleedMm : 0;
      return `${paperLabel(design.size.width, design.size.height)}${bleed ? ` · ${bleed} mm bleed` : ''} · PDF`;
    }
    if (format === 'svg') return `${design.size.width} × ${design.size.height} px · SVG`;
    if (format === 'html') return `${design.size.width} × ${design.size.height} px · HTML (${design.pages.length} ${design.pages.length === 1 ? 'section' : 'sections'})`;
    if (motion) {
      const effFps = format === 'gif' ? Math.min(15, fps) : fps;
      return `${Math.round(design.size.width * motionScale)} × ${Math.round(design.size.height * motionScale)} · ${effFps} fps · ${format.toUpperCase()}`;
    }
    const w = Math.round(design.size.width * scale);
    const h = Math.round(design.size.height * scale);
    return `${w} × ${h} px · ${format.toUpperCase()}`;
  }, [format, print, bleedMm, design.size.width, design.size.height, scale, motion, fps, motionScale]);

  const run = async () => {
    setBusy(true);
    try {
      if (motion) {
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setMotionProgress(0);
        await exportMotion(design, pageIndex, {
          format: format as MotionFormat,
          fps,
          scale: motionScale,
          pages,
          onProgress: pct => setMotionProgress(pct),
          signal: ctrl.signal,
        });
        toast(`${format.toUpperCase()} downloaded`);
        onClose();
        return;
      }
      const result = await exportDesign(design, pageIndex, {
        format: format as ExportFormat,
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
      if ((err as Error)?.message === 'Cancelled') {
        toast('Export cancelled');
      } else {
        toast('Export failed. Try another format or scale.', 'error');
        throw err;
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
      setMotionProgress(null);
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
          <GlassActionButton
            material="tinted"
            size="md"
            className="bg-[#2440F0] text-white"
            pendingLabel="Exporting"
            successLabel="Downloaded"
            resetAfter={1800}
            onAction={run}
            disabled={busy}
          >
            Download
          </GlassActionButton>
        </>
      }
    >
      <div className="export-formats export-formats-5">
        {FORMATS.map(f => {
          const disabled = (f.id === 'mp4' || f.id === 'webm') && !hasWebCodecs;
          return (
            <button
              key={f.id}
              className={`export-format ${format === f.id ? 'active' : ''}`}
              disabled={disabled}
              title={disabled ? 'Requires WebCodecs VideoEncoder support' : f.label}
              onClick={() => setFormat(f.id)}
            >
              <EditrimIcon name={f.icon} size={19} />
              <b>{f.label}</b>
              <span>{f.note}</span>
              {format === f.id && <EditrimIcon name="check" size={15} className="export-check" />}
            </button>
          );
        })}
      </div>

      <div className="export-options">
        <div className="export-option-row">
          <span>Pages</span>
          <GlassTabs
            aria-label="Pages to export"
            size="sm"
            value={pages}
            onValueChange={setPages}
            options={[
              { value: 'current', label: 'This page' },
              { value: 'all', label: `All ${design.pages.length}` },
            ]}
          />
        </div>

        {raster && (
          <div className="export-option-row">
            <span>Resolution</span>
            <GlassTabs
              aria-label="Export resolution"
              size="sm"
              value={String(scale)}
              onValueChange={v => setScale(Number(v))}
              options={[1, 2, 3].map(s => ({ value: String(s), label: `${s}×` }))}
            />
          </div>
        )}

        {(format === 'png' || format === 'webp') && (
          <div className="export-option-row">
            <span>Transparent background</span>
            <Switch size="sm" color="#2563eb" checked={transparent} onChange={setTransparent} label="" />
          </div>
        )}

        {(format === 'jpg' || format === 'webp') && (
          <div className="export-option-row">
            <span>Quality</span>
            <div className="export-quality">
              <div className="w-40">
                <RangeSlider
                  label=""
                  showValue={false}
                  size="sm"
                  color="#2563eb"
                  min={50}
                  max={100}
                  step={1}
                  value={Math.round(quality * 100)}
                  onChange={v => setQuality(v / 100)}
                />
              </div>
              <span className="export-quality-value">{Math.round(quality * 100)}%</span>
            </div>
          </div>
        )}

        {format === 'pdf' && (
          <div className="export-option-row">
            <span>PDF mode</span>
            <GlassTabs
              aria-label="PDF mode"
              size="sm"
              value={pdfMode}
              onValueChange={setPdfMode}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'print', label: 'Print' },
              ]}
            />
          </div>
        )}

        {print && (
          <>
            <div className="export-option-row">
              <span>Bleed</span>
              <GlassTabs
                aria-label="PDF bleed"
                size="sm"
                value={String(bleedMm)}
                onValueChange={v => pickBleed(Number(v) as 0 | 3 | 5)}
                options={([0, 3, 5] as const).map(mm => ({
                  value: String(mm),
                  label: mm === 0 ? 'None' : `${mm} mm`,
                }))}
              />
            </div>
            <div className="export-option-row">
              <span>Crop marks</span>
              <Switch
                size="sm"
                color="#2563eb"
                checked={cropMarks}
                onChange={setCropMarks}
                disabled={bleedMm === 0}
                label=""
              />
            </div>
            <div className="export-option-row">
              <span>DPI</span>
              <GlassTabs
                aria-label="PDF DPI"
                size="sm"
                value={String(dpi)}
                onValueChange={v => setDpi(Number(v) as 150 | 300)}
                options={([150, 300] as const).map(d => ({ value: String(d), label: String(d) }))}
              />
            </div>
          </>
        )}
        {motion && (
          <>
            <div className="export-option-row">
              <span>Frame rate</span>
              <GlassTabs
                aria-label="Motion FPS"
                size="sm"
                value={String(fps)}
                onValueChange={v => setFps(Number(v))}
                options={([15, 24, 30] as const).map(v => ({ value: String(v), label: `${v} fps` }))}
              />
            </div>
            <div className="export-option-row">
              <span>Scale</span>
              <GlassTabs
                aria-label="Motion scale"
                size="sm"
                value={String(motionScale)}
                onValueChange={v => setMotionScale(Number(v))}
                options={[
                  { value: '0.5', label: '0.5×' },
                  { value: '1', label: '1×' },
                ]}
              />
            </div>
            {motionProgress !== null && (
              <div className="export-motion-progress">
                <div className="export-motion-bar"><i style={{ width: `${motionProgress}%` }} /></div>
                <span>{motionProgress}%</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => abortRef.current?.abort()}>Cancel</button>
              </div>
            )}
          </>
        )}
      </div>

      {print && <div className="export-warning">Print PDF is raster at {dpi} DPI with bleed and crop marks.</div>}
      {format === 'pdf' && !print && (
        <div className="export-warning">Standard PDF is a 2× raster of each page, sized to the design.</div>
      )}
      {format === 'svg' && <div className="export-warning">Text and shapes stay vector; photos are embedded.</div>}
      {format === 'html' && (
        <div className="export-warning">Self-contained HTML exports all pages as stacked responsive sections with links.</div>
      )}
      {!motion && format !== 'pdf' && format !== 'html' && pages === 'all' && (
        <div className="export-warning">Multi-page {format.toUpperCase()} downloads one numbered file per page.</div>
      )}
    </Modal>
  );
}

export function ShareModal({
  open,
  onClose,
  design,
  onPreviewSite,
}: {
  open: boolean;
  onClose: () => void;
  design: Design;
  onPreviewSite?: () => void;
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
          {onPreviewSite && (
            <GlassButton
              material="clear"
              size="sm"
              onClick={onPreviewSite}
              icon={<EditrimIcon name="website" size={15} />}
              iconPosition="start"
            >
              Preview site
            </GlassButton>
          )}
          <GlassButton material="clear" size="sm" onClick={onClose}>Close</GlassButton>
          <GlassButton
            material="tinted"
            size="sm"
            className="bg-[#2440F0] text-white"
            onClick={copy}
            disabled={!state?.ok}
            icon={<EditrimIcon name={copied ? 'check' : 'copy'} size={15} />}
            iconPosition="start"
          >
            {copied ? 'Copied' : 'Copy link'}
          </GlassButton>
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

export function WebsitePreviewModal({
  open,
  onClose,
  design,
}: {
  open: boolean;
  onClose: () => void;
  design: Design;
}) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${design.title || 'Untitled'} — Site preview`}
      subtitle="Stacked pages rendered locally with clickable links. Export HTML for a standalone file."
      width={900}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <GlassTabs
            aria-label="Site preview viewport"
            size="sm"
            value={viewport}
            onValueChange={v => setViewport(v as 'desktop' | 'mobile')}
            options={[
              { value: 'desktop', label: 'Desktop · 1280' },
              { value: 'mobile', label: 'Mobile · 390' },
            ]}
          />
          <GlassButton material="clear" size="sm" onClick={onClose}>Close</GlassButton>
        </div>
      }
    >
      <div className="site-preview-wrap">
        <div className={`site-preview-frame ${viewport === 'mobile' ? 'is-mobile' : 'is-desktop'}`}>
          {design.pages.map(page => (
            <section key={page.id} id={`site-sec-${page.id}`} className="site-preview-section">
              <PagePreview
                page={page}
                size={design.size}
                interactiveLinks
                onNavigatePage={pid => {
                  document.getElementById(`site-sec-${pid}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </section>
          ))}
        </div>
      </div>
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
          <GlassButton material="clear" size="sm" onClick={onClose}>Cancel</GlassButton>
          <GlassButton
            material="tinted"
            size="sm"
            className="bg-[#2440F0] text-white"
            onClick={() => { onResize(w, h); onClose(); }}
            disabled={w === design.size.width && h === design.size.height}
          >
            Resize canvas
          </GlassButton>
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
