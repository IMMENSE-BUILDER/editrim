import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, Cloud, Copy, Download, HelpCircle,
  ImageUp, LayoutTemplate, Loader2, Maximize2, Palette, PaintBucket, Play, Plus,
  Redo2, Share2, Shapes, SlidersHorizontal, Trash2, Type, Undo2, X,
} from 'lucide-react';
import { Logo } from '../components/Brand';
import { PagePreview } from '../components/PagePreview';
import { BrandKitModal } from '../components/BrandKitModal';
import { useToast } from '../components/Toast';
import { Canvas } from '../editor/Canvas';
import { Inspector } from '../editor/Inspector';
import { LeftPanel, type PanelTab } from '../editor/Panels';
import { ExportModal, ResizeModal, ShareModal, ShortcutsModal } from '../editor/Modals';
import { useEditor } from '../editor/useEditor';
import { createDesign, fromTemplate, getBrand, getDesign, saveDesign } from '../lib/storage';
import { getTemplate } from '../lib/templates';
import type { BrandKit, Design, El } from '../lib/types';
import { clamp, timeAgo, uid } from '../lib/utils';

export default function Editor() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState<Design | null>(null);
  const [missing, setMissing] = useState(false);
  const booted = useRef<string>('');

  useEffect(() => {
    if (!id) return;
    if (booted.current === id) return;
    booted.current = id;

    if (id === 'new') {
      const templateId = search.get('template');
      const t = templateId ? getTemplate(templateId) : undefined;
      if (t) {
        const created = fromTemplate(t);
        navigate(`/editor/${created.id}`, { replace: true });
        return;
      }
      const w = clamp(Number(search.get('w')) || 1080, 100, 6000);
      const h = clamp(Number(search.get('h')) || 1080, 100, 6000);
      const name = search.get('name') || (w === h ? 'Untitled square' : 'Untitled design');
      const created = createDesign({ title: name, width: w, height: h, category: 'Custom' });
      navigate(`/editor/${created.id}`, { replace: true });
      return;
    }

    const existing = getDesign(id);
    if (existing) setDesign(existing);
    else setMissing(true);
  }, [id, navigate, search]);

  if (missing) return <MissingDesign />;
  if (!design) return <EditorLoading />;
  return <EditorWorkspace key={design.id} initial={design} />;
}

function EditorLoading() {
  return (
    <div className="editor-loading">
      <Logo size={38} />
      <div className="editor-loading-bar"><i /></div>
      <span>Opening your canvas…</span>
    </div>
  );
}

function MissingDesign() {
  return (
    <div className="editor-missing">
      <Logo size={36} />
      <h1>This design isn’t here.</h1>
      <p>It may have been deleted, or it lives in a different browser. Vellum stores designs locally, not in the cloud.</p>
      <div>
        <Link to="/editor/new" className="btn btn-cobalt">Start a new design</Link>
        <Link to="/dashboard" className="btn btn-secondary">Your designs</Link>
      </div>
    </div>
  );
}

const TABS: { id: PanelTab; label: string; icon: typeof Shapes }[] = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'elements', label: 'Elements', icon: Shapes },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'uploads', label: 'Uploads', icon: ImageUp },
  { id: 'background', label: 'Background', icon: PaintBucket },
  { id: 'brand', label: 'Brand', icon: Palette },
];

function EditorWorkspace({ initial }: { initial: Design }) {
  const store = useEditor(initial);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<PanelTab | null>(() => (typeof window !== 'undefined' && window.innerWidth > 1180 ? 'templates' : null));
  const [brand, setBrand] = useState<BrandKit>(() => getBrand());
  const [brandOpen, setBrandOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [resizeOpen, setResizeOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [pageMenu, setPageMenu] = useState<{ index: number; x: number; top: number } | null>(null);
  const clipboard = useRef<El[]>([]);
  const errorShown = useRef(false);

  const design = store.design;

  useEffect(() => {
    document.title = `${design.title || 'Untitled'} — Vellum`;
    return () => {
      document.title = 'Vellum — Design anything. Beautifully.';
    };
  }, [design.title]);

  /* ---------- autosave ---------- */
  useEffect(() => {
    setSaveState('saving');
    const t = window.setTimeout(() => {
      try {
        saveDesign(design);
        setSaveState('saved');
      } catch {
        setSaveState('error');
        if (!errorShown.current) {
          errorShown.current = true;
          toast('Local storage is full. Export this design before adding more.', 'error');
        }
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [design, toast]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const isTyping = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        store.redo();
        return;
      }
      if (mod && key === 'd') {
        e.preventDefault();
        store.duplicateSelected();
        return;
      }
      if (mod && key === 'c') {
        const els = store.page.elements.filter(el => store.selectedIds.includes(el.id));
        if (els.length) {
          clipboard.current = structuredClone(els);
          toast('Copied');
        }
        return;
      }
      if (mod && key === 'v') {
        if (!clipboard.current.length) return;
        e.preventDefault();
        const copies = clipboard.current.map(el => ({
          ...structuredClone(el),
          id: uid(el.type),
          x: el.x + 24,
          y: el.y + 24,
        })) as El[];
        store.addElements(copies);
        clipboard.current = structuredClone(copies);
        return;
      }
      if (mod && key === 'a') {
        e.preventDefault();
        store.selectAll();
        return;
      }
      if (mod && key === 's') {
        e.preventDefault();
        try {
          saveDesign(store.design);
          setSaveState('saved');
          toast('Saved locally');
        } catch {
          toast('Could not save — storage is full', 'error');
        }
        return;
      }
      if (mod && e.shiftKey && key === '1') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('vellum:fit'));
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        store.deleteSelected();
        return;
      }
      if (e.key === 'Escape') {
        store.setSelectedIds([]);
        store.setEditingId(null);
        setPageMenu(null);
        return;
      }
      if (e.key === 'Enter' && store.selected.length === 1 && store.selected[0].type === 'text') {
        e.preventDefault();
        store.setEditingId(store.selected[0].id);
        return;
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowLeft') store.nudge(-step, 0);
        if (e.key === 'ArrowRight') store.nudge(step, 0);
        if (e.key === 'ArrowUp') store.nudge(0, -step);
        if (e.key === 'ArrowDown') store.nudge(0, step);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store, toast]);

  /* ---------- first-run tip ---------- */
  useEffect(() => {
    if (localStorage.getItem('vellum.tip.seen')) return;
    if (window.innerWidth < 900) {
      localStorage.setItem('vellum.tip.seen', '1');
      return;
    }
    const t = window.setTimeout(() => {
      toast('Double-click text to edit it · press ? for shortcuts');
      localStorage.setItem('vellum.tip.seen', '1');
    }, 1200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const saveNow = useCallback(() => {
    try {
      saveDesign(store.design);
      setSaveState('saved');
      return true;
    } catch {
      toast('Could not save — storage is full', 'error');
      return false;
    }
  }, [store.design, toast]);

  const present = () => {
    saveNow();
    navigate(`/present/${design.id}`);
  };

  const openShare = () => {
    saveNow();
    setShareOpen(true);
  };

  const selectedText = store.selected.length === 1 && store.selected[0].type === 'text' ? store.selected[0] : null;

  return (
    <div className={`editor ${inspectorOpen ? 'show-inspector' : ''}`}>
      <header className="ed-topbar">
        <div className="ed-top-left">
          <Link to="/dashboard" className="ed-back" title="Back to your designs"><ArrowLeft size={17} /></Link>
          <Link to="/" className="ed-mark" aria-label="Vellum home"><Logo size={26} wordmark={false} /></Link>
          <div className="ed-title">
            <input
              value={design.title}
              onChange={e => store.setTitle(e.target.value)}
              onFocus={e => e.currentTarget.select()}
              aria-label="Design title"
            />
            <span className={`ed-status ${saveState}`}>
              {saveState === 'saving' ? <Loader2 size={10} className="spin" /> : <Cloud size={11} />}
              {saveState === 'saving' ? 'Saving' : saveState === 'error' ? 'Storage full' : 'Saved'}
            </span>
          </div>
        </div>

        <div className="ed-top-center">
          <button className="ed-ico" onClick={store.undo} disabled={!store.canUndo} title="Undo (⌘Z)"><Undo2 size={16} /></button>
          <button className="ed-ico" onClick={store.redo} disabled={!store.canRedo} title="Redo (⌘⇧Z)"><Redo2 size={16} /></button>
          <span className="ed-divider" />
          <button className="ed-size-pill" onClick={() => setResizeOpen(true)} title="Resize canvas">
            {design.size.width} × {design.size.height}
            <Maximize2 size={12} />
          </button>
        </div>

        <div className="ed-top-right">
          <button className="ed-ico ed-insp-toggle" onClick={() => setInspectorOpen(v => !v)} title="Design controls">
            <SlidersHorizontal size={17} />
          </button>
          <button className="ed-ico ed-help" onClick={() => setShortcutsOpen(true)} title="Keyboard shortcuts"><HelpCircle size={17} /></button>
          <button className="ed-action" onClick={present}><Play size={14} /> <span>Present</span></button>
          <button className="ed-action" onClick={openShare}><Share2 size={14} /> <span>Share</span></button>
          <button className="btn btn-cobalt btn-sm ed-download" onClick={() => setExportOpen(true)}>
            <Download size={14} /> Download
          </button>
        </div>
      </header>

      <div className="ed-body">
        <nav className="ed-rail" aria-label="Editor panels">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={panel === t.id ? 'active' : ''}
                onClick={() => setPanel(panel === t.id ? null : t.id)}
                title={t.label}
              >
                <Icon size={19} />
                <span>{t.label}</span>
              </button>
            );
          })}
          <div className="ed-rail-bottom">
            <button onClick={() => setShortcutsOpen(true)} title="Shortcuts">
              <HelpCircle size={18} />
              <span>Help</span>
            </button>
          </div>
        </nav>

        {panel && (
          <LeftPanel
            tab={panel}
            store={store}
            brand={brand}
            onClose={() => setPanel(null)}
            onOpenBrand={() => setBrandOpen(true)}
          />
        )}

        <main className="ed-canvas-area">
          <Canvas
            design={design}
            page={store.page}
            selectedIds={store.selectedIds}
            setSelectedIds={store.setSelectedIds}
            editingId={store.editingId}
            setEditingId={store.setEditingId}
            updateElements={store.updateElements}
            pushHistory={store.pushHistory}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />
          <div className="page-strip" onPointerDown={e => e.stopPropagation()}>
            <div className="page-strip-scroll">
              {design.pages.map((p, i) => (
                <div className={`page-item ${i === store.activePage ? 'active' : ''}`} key={p.id}>
                  <button
                    className="page-thumb"
                    onClick={() => store.setActivePage(i)}
                    title={p.name}
                    style={{ width: Math.max(30, Math.round(58 * (design.size.width / design.size.height))) }}
                  >
                    <PagePreview page={p} size={design.size} />
                  </button>
                  <span className="page-num">{i + 1}</span>
                  <button className="page-menu-btn" onClick={e => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    if (pageMenu?.index === i) setPageMenu(null);
                    else setPageMenu({ index: i, x: Math.max(8, Math.min(window.innerWidth - 166, rect.left + 9 - 79)), top: Math.max(64, rect.top - 214) });
                  }} aria-label={`Page ${i + 1} options`}>
                    <span /><span /><span />
                  </button>
                  {pageMenu?.index === i && (
                    <>
                      <div className="page-menu-backdrop" onClick={() => setPageMenu(null)} />
                      <div className="page-menu" style={{ left: pageMenu.x, top: pageMenu.top }}>
                        <button onClick={() => { store.duplicatePage(i); setPageMenu(null); }}><Copy size={13} /> Duplicate</button>
                        <button onClick={() => { store.movePage(i, i - 1); setPageMenu(null); }} disabled={i === 0}><ChevronLeft size={13} /> Move left</button>
                        <button onClick={() => { store.movePage(i, i + 1); setPageMenu(null); }} disabled={i === design.pages.length - 1}><ChevronRight size={13} /> Move right</button>
                        <button className="danger" onClick={() => { store.deletePage(i); setPageMenu(null); }} disabled={design.pages.length <= 1}><Trash2 size={13} /> Delete page</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <button className="page-add" onClick={() => store.addPage()} title="Add page"><Plus size={17} /><span>Add page</span></button>
            </div>
            <div className="page-strip-info">
              <span>Page {store.activePage + 1} of {design.pages.length}</span>
              <span>{timeAgo(design.createdAt).startsWith('just') ? 'Created today' : `Created ${timeAgo(design.createdAt)}`}</span>
            </div>
          </div>
        </main>

        <Inspector
          store={store}
          brand={brand}
          onEditText={() => selectedText && store.setEditingId(selectedText.id)}
          onOpenBackground={() => setPanel('background')}
          onOpenResize={() => setResizeOpen(true)}
          onOpenBrand={() => setBrandOpen(true)}
        />
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} design={design} pageIndex={store.activePage} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} design={design} />
      <ResizeModal open={resizeOpen} onClose={() => setResizeOpen(false)} design={design} onResize={(w, h) => { store.resizeDesign(w, h); setPanel(null); toast('Canvas resized — content scaled to fit'); }} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <BrandKitModal
        open={brandOpen}
        onClose={() => setBrandOpen(false)}
        onSaved={() => { setBrand(getBrand()); toast('Brand kit updated'); }}
      />
    </div>
  );
}
