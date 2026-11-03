import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, Cloud, Copy, Download, HelpCircle,
  ImageUp, LayoutTemplate, Loader2, Maximize2, MessageSquare, Palette, PaintBucket, Play, Plus,
  Redo2, Share2, Shapes, SlidersHorizontal, Sparkles, Trash2, Type, Undo2, X,
} from 'lucide-react';
import { Logo } from '../components/Brand';
import { EditrimIcon, type EditrimIconName } from '../components/EditrimIcon';
import { Modal } from '../components/Modal';
import { PagePreview } from '../components/PagePreview';
import { BrandKitModal } from '../components/BrandKitModal';
import { useToast } from '../components/Toast';
import { Canvas } from '../editor/Canvas';
import { Inspector } from '../editor/Inspector';
import { LeftPanel, type PanelTab } from '../editor/Panels';
import { ExportModal, ResizeModal, ShareModal, ShortcutsModal } from '../editor/Modals';
import { CanvasContextMenu, type CanvasMenuState } from '../editor/ContextMenu';
import { useEditor } from '../editor/useEditor';
import { createDesign, fromTemplate, getBrand, getDesign, saveDesign } from '../lib/storage';
import { getTemplate } from '../lib/templates';
import { exportSelection } from '../lib/export';
import { copyStyle, pasteStyle, type StylePayload } from '../lib/styleClipboard';
import { saveComponent } from '../lib/components';
import { applyPaletteToPage, paletteFromElements } from '../lib/colors';
import type { BrandKit, Design, El, Point } from '../lib/types';
import { clamp, rotatedBBox, timeAgo, uid, unionRect } from '../lib/utils';

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
        navigate(`/editor/${created.id}${window.location.hash}`, { replace: true });
        return;
      }
      const w = clamp(Number(search.get('w')) || 1080, 100, 6000);
      const h = clamp(Number(search.get('h')) || 1080, 100, 6000);
      const name = search.get('name') || (w === h ? 'Untitled square' : 'Untitled design');
      const created = createDesign({ title: name, width: w, height: h, category: 'Custom' });
      navigate(`/editor/${created.id}${window.location.hash}`, { replace: true });
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
      <p>It may have been deleted, or it lives in a different browser. Editrim stores designs locally, not in the cloud.</p>
      <div>
        <Link to="/editor/new" className="btn btn-cobalt">Start a new design</Link>
        <Link to="/dashboard" className="btn btn-secondary">Your designs</Link>
      </div>
    </div>
  );
}

const TABS: { id: PanelTab; label: string; icon: EditrimIconName }[] = [
  { id: 'templates', label: 'Templates', icon: 'templates' },
  { id: 'ai', label: 'AI', icon: 'spark' },
  { id: 'elements', label: 'Elements', icon: 'elements' },
  { id: 'text', label: 'Text', icon: 'text' },
  { id: 'uploads', label: 'Uploads', icon: 'uploads' },
  { id: 'background', label: 'Background', icon: 'background' },
  { id: 'brand', label: 'Brand', icon: 'brand' },
];

function EditorWorkspace({ initial }: { initial: Design }) {
  const store = useEditor(initial);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<PanelTab | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#ai') return 'ai';
    return typeof window !== 'undefined' && window.innerWidth > 1180 ? 'templates' : null;
  });
  const [brand, setBrand] = useState<BrandKit>(() => getBrand());
  const [brandOpen, setBrandOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [resizeOpen, setResizeOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [pageMenu, setPageMenu] = useState<{ index: number; x: number; top: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<CanvasMenuState | null>(null);
  const [styleClipboard, setStyleClipboard] = useState<StylePayload | null>(null);
  const [clipboardHas, setClipboardHas] = useState(false);
  const [componentDraft, setComponentDraft] = useState<{ name: string; elements: El[]; width: number; height: number } | null>(null);
  const [commentTarget, setCommentTarget] = useState<{ pageId: string; elementId?: string; x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [aiFocus, setAiFocus] = useState<{ focus: 'write' | 'translate'; nonce: number } | null>(null);
  const clipboard = useRef<El[]>([]);
  const errorShown = useRef(false);

  const design = store.design;

  const copySelection = useCallback(() => {
    if (!store.selected.length) return;
    clipboard.current = structuredClone(store.selected);
    setClipboardHas(true);
    toast('Copied');
  }, [store.selected, toast]);

  const pasteClipboard = useCallback((at?: Point) => {
    if (!clipboard.current.length) return;
    let copies = clipboard.current.map(el => ({
      ...structuredClone(el),
      id: uid(el.type),
      x: el.x + 24,
      y: el.y + 24,
    })) as El[];
    const groupIds = new Map<string, string>();
    copies.forEach(el => {
      if (el.groupId && !groupIds.has(el.groupId)) groupIds.set(el.groupId, uid('g'));
    });
    copies = copies.map(el => (el.groupId ? { ...el, groupId: groupIds.get(el.groupId) } : el));
    if (at) {
      const bounds = unionRect(copies.map(el => rotatedBBox(el)));
      if (bounds) {
        const dx = at.x - (bounds.x + bounds.w / 2);
        const dy = at.y - (bounds.y + bounds.h / 2);
        copies = copies.map(el => ({ ...el, x: el.x + dx, y: el.y + dy }));
      }
    }
    store.addElements(copies);
    clipboard.current = structuredClone(copies);
    setClipboardHas(true);
  }, [store]);

  const copyStyleSelection = useCallback((elementId?: string) => {
    const el = (elementId ? store.page.elements.find(item => item.id === elementId) : null) ?? store.selected[0];
    if (!el) return;
    const payload = copyStyle(el);
    setStyleClipboard(payload);
    toast(`Copied ${payload.label}`);
  }, [store.page.elements, store.selected, toast]);

  const pasteStyleSelection = useCallback(() => {
    if (!styleClipboard) return;
    const updates: Record<string, Partial<El>> = {};
    store.selected.forEach(el => {
      if (el.locked) return;
      const patch = pasteStyle(el, styleClipboard);
      if (patch) updates[el.id] = patch;
    });
    if (!Object.keys(updates).length) {
      toast(`Select a ${styleClipboard.type} layer to paste this ${styleClipboard.label}`, 'error');
      return;
    }
    store.updateElements(updates);
    toast(`Pasted ${styleClipboard.label}`);
    setContextMenu(null);
  }, [styleClipboard, store, toast]);

  const openComponentDialog = useCallback(() => {
    if (!store.selected.length) return;
    const bounds = unionRect(store.selected.map(el => rotatedBBox(el)));
    if (!bounds) return;
    setComponentDraft({
      name: 'New component',
      elements: store.selected.map(el => ({
        ...structuredClone(el),
        x: el.x - bounds.x,
        y: el.y - bounds.y,
      })),
      width: Math.max(1, Math.ceil(bounds.w)),
      height: Math.max(1, Math.ceil(bounds.h)),
    });
    setContextMenu(null);
  }, [store.selected]);

  const saveComponentDraft = useCallback(() => {
    if (!componentDraft) return;
    try {
      const component = saveComponent(componentDraft.name, componentDraft.elements, componentDraft.width, componentDraft.height);
      store.groupSelected();
      setComponentDraft(null);
      setPanel('elements');
      toast(`“${component.name}” saved — insert it from Elements`);
    } catch {
      toast('Could not save the component — browser storage is full', 'error');
    }
  }, [componentDraft, store, toast]);

  const openComment = useCallback((elementId?: string, point?: Point) => {
    let anchorId = elementId;
    let x = point?.x ?? 24;
    let y = point?.y ?? 24;
    if (elementId) {
      const el = store.page.elements.find(item => item.id === elementId);
      if (el) {
        x = el.x + el.w;
        y = el.y + 12;
      }
    } else if (!point) {
      const el = store.selected[0];
      if (el) {
        anchorId = el.id;
        x = el.x + el.w;
        y = el.y + 12;
      }
    }
    x = clamp(x, 14, store.design.size.width - 14);
    y = clamp(y, 14, store.design.size.height - 14);
    setCommentTarget({ pageId: store.page.id, elementId: anchorId, x, y });
    setCommentText('');
    setContextMenu(null);
  }, [store.page, store.selected, store.design.size.width, store.design.size.height]);

  const openCommentThread = useCallback((target: { elementId?: string; x: number; y: number }) => {
    setCommentTarget({ pageId: store.page.id, elementId: target.elementId, x: target.x, y: target.y });
    setCommentText('');
  }, [store.page.id]);

  const postComment = useCallback(() => {
    if (!commentTarget || !commentText.trim()) return;
    store.addComment({
      pageId: commentTarget.pageId,
      elementId: commentTarget.elementId,
      x: commentTarget.x,
      y: commentTarget.y,
      text: commentText.trim(),
      author: 'You',
    });
    setCommentText('');
    toast('Comment added');
  }, [commentTarget, commentText, store, toast]);

  const applyColorsToSelection = useCallback(async () => {
    const elements = store.selected.filter(el => !el.hidden);
    if (!elements.length) return;
    setContextMenu(null);
    const palette = await paletteFromElements(elements);
    if (!palette.length) {
      toast('No usable colors in this selection', 'error');
      return;
    }
    store.updatePage(page => applyPaletteToPage(page, palette));
    toast(`Applied ${palette.length} ${palette.length === 1 ? 'color' : 'colors'} to the page — undo with Ctrl+Z`);
  }, [store, toast]);

  const downloadSelection = useCallback(async () => {
    const elements = store.selected.filter(el => !el.hidden);
    if (!elements.length) return;
    setContextMenu(null);
    try {
      await exportSelection(design, elements, store.page);
      toast('Selection downloaded as a transparent PNG');
    } catch {
      toast('Could not download this selection', 'error');
    }
  }, [design, store.page, store.selected, toast]);

  const focusAi = useCallback((focus: 'write' | 'translate') => {
    setPanel('ai');
    setAiFocus({ focus, nonce: Date.now() });
    setContextMenu(null);
  }, []);

  const openElementMenu = useCallback((e: ReactMouseEvent, el: El) => {
    let ids = store.selectedIds;
    if (el.groupId) {
      ids = store.page.elements.filter(item => item.groupId === el.groupId && !item.hidden).map(item => item.id);
    } else if (!store.selectedIds.includes(el.id)) {
      ids = [el.id];
    }
    store.setSelectedIds(ids);
    setContextMenu({ kind: 'element', x: e.clientX, y: e.clientY, elementId: el.id });
  }, [store]);

  const openCanvasMenu = useCallback((e: ReactMouseEvent, point: Point) => {
    setContextMenu({ kind: 'page', x: e.clientX, y: e.clientY, pagePoint: point });
  }, []);

  useEffect(() => {
    document.title = `${design.title || 'Untitled'} — Editrim`;
    return () => {
      document.title = 'Editrim — Design anything. Beautifully.';
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
      const code = e.code;

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
      if (mod && e.altKey && (key === 'c' || code === 'KeyC')) {
        e.preventDefault();
        copyStyleSelection();
        return;
      }
      if (mod && e.altKey && (key === 'v' || code === 'KeyV')) {
        e.preventDefault();
        pasteStyleSelection();
        return;
      }
      if (mod && e.altKey && (key === 'k' || code === 'KeyK')) {
        e.preventDefault();
        openComponentDialog();
        return;
      }
      if (mod && e.altKey && (key === 'n' || code === 'KeyN')) {
        e.preventDefault();
        openComment();
        return;
      }
      if (mod && e.altKey && (key === ']' || key === '[' || code === 'BracketRight' || code === 'BracketLeft')) {
        e.preventDefault();
        const front = key === ']' || code === 'BracketRight';
        store.reorder(front ? 'front' : 'back');
        return;
      }
      if (mod && (key === ']' || key === '[' || code === 'BracketRight' || code === 'BracketLeft')) {
        e.preventDefault();
        const forward = key === ']' || code === 'BracketRight';
        store.reorder(forward ? 'forward' : 'backward');
        return;
      }
      if (mod && e.shiftKey && key === 'g') {
        e.preventDefault();
        store.ungroupSelected();
        return;
      }
      if (mod && key === 'g') {
        e.preventDefault();
        if (store.selected.length >= 2) {
          store.groupSelected();
          toast('Grouped — click any layer to select the group');
        }
        return;
      }
      if (mod && key === 'd') {
        e.preventDefault();
        store.duplicateSelected();
        return;
      }
      if (mod && key === 'c') {
        e.preventDefault();
        copySelection();
        return;
      }
      if (mod && key === 'v') {
        e.preventDefault();
        pasteClipboard();
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
        window.dispatchEvent(new CustomEvent('editrim:fit'));
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
        setContextMenu(null);
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
          <Link to="/dashboard" className="ed-back" title="Back to your designs"><EditrimIcon name="arrowLeft" size={17} /></Link>
          <Link to="/" className="ed-mark" aria-label="Editrim home"><Logo size={26} wordmark={false} /></Link>
          <div className="ed-title">
            <input
              value={design.title}
              onChange={e => store.setTitle(e.target.value)}
              onFocus={e => e.currentTarget.select()}
              aria-label="Design title"
            />
            <span className={`ed-status ${saveState}`}>
              {saveState === 'saving' ? <Loader2 size={10} className="spin" /> : <EditrimIcon name="cloud" size={11} />}
              {saveState === 'saving' ? 'Saving' : saveState === 'error' ? 'Storage full' : 'Saved'}
            </span>
          </div>
        </div>

        <div className="ed-top-center">
          <button className="ed-ico" onClick={store.undo} disabled={!store.canUndo} title="Undo (⌘Z)"><EditrimIcon name="undo" size={16} /></button>
          <button className="ed-ico" onClick={store.redo} disabled={!store.canRedo} title="Redo (⌘⇧Z)"><EditrimIcon name="redo" size={16} /></button>
          <span className="ed-divider" />
          <button className="ed-size-pill" onClick={() => setResizeOpen(true)} title="Resize canvas">
            {design.size.width} × {design.size.height}
            <EditrimIcon name="fit" size={12} />
          </button>
        </div>

        <div className="ed-top-right">
          <button className="ed-ico ed-insp-toggle" onClick={() => setInspectorOpen(v => !v)} title="Design controls">
            <EditrimIcon name="sliders" size={17} />
          </button>
          <button className="ed-ico ed-help" onClick={() => setShortcutsOpen(true)} title="Keyboard shortcuts"><EditrimIcon name="help" size={17} /></button>
          <button className="ed-action" onClick={present}><EditrimIcon name="play" size={14} /> <span>Present</span></button>
          <button className="ed-action" onClick={openShare}><EditrimIcon name="share" size={14} /> <span>Share</span></button>
          <button className="btn btn-cobalt btn-sm ed-download" onClick={() => setExportOpen(true)}>
            <EditrimIcon name="download" size={14} /> Download
          </button>
        </div>
      </header>

      <div className="ed-body">
        <nav className="ed-rail" aria-label="Editor panels">
          {TABS.map(t => {
            return (
              <button
                key={t.id}
                className={panel === t.id ? 'active' : ''}
                onClick={() => setPanel(panel === t.id ? null : t.id)}
                title={t.label}
              >
                <EditrimIcon name={t.icon} size={19} />
                <span>{t.label}</span>
              </button>
            );
          })}
          <div className="ed-rail-bottom">
            <button onClick={() => setShortcutsOpen(true)} title="Shortcuts">
              <EditrimIcon name="help" size={18} />
              <span>Help</span>
            </button>
          </div>
        </nav>

        {panel && (
          <LeftPanel
            tab={panel}
            store={store}
            brand={brand}
            aiFocus={aiFocus}
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
            comments={design.comments ?? []}
            onElementContextMenu={openElementMenu}
            onCanvasContextMenu={openCanvasMenu}
            onCommentClick={openCommentThread}
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
                        <button onClick={() => { store.duplicatePage(i); setPageMenu(null); }}><EditrimIcon name="duplicate" size={13} /> Duplicate</button>
                        <button onClick={() => { store.movePage(i, i - 1); setPageMenu(null); }} disabled={i === 0}><EditrimIcon name="chevronLeft" size={13} /> Move left</button>
                        <button onClick={() => { store.movePage(i, i + 1); setPageMenu(null); }} disabled={i === design.pages.length - 1}><EditrimIcon name="chevronRight" size={13} /> Move right</button>
                        <button className="danger" onClick={() => { store.deletePage(i); setPageMenu(null); }} disabled={design.pages.length <= 1}><EditrimIcon name="trash" size={13} /> Delete page</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <button className="page-add" onClick={() => store.addPage()} title="Add page"><EditrimIcon name="plus" size={17} /><span>Add page</span></button>
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
      {contextMenu && (
        <CanvasContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          store={store}
          hasClipboard={clipboardHas}
          styleLabel={styleClipboard && store.selected.some(el => el.type === styleClipboard.type && !el.locked) ? styleClipboard.label : null}
          onCopy={copySelection}
          onPaste={pasteClipboard}
          onCopyStyle={copyStyleSelection}
          onPasteStyle={pasteStyleSelection}
          onCreateComponent={openComponentDialog}
          onComment={() => {
            if (contextMenu.kind === 'page') openComment(undefined, contextMenu.pagePoint);
            else openComment(contextMenu.elementId);
          }}
          onApplyColors={applyColorsToSelection}
          onDownloadSelection={downloadSelection}
          onMagicWrite={() => focusAi('write')}
          onTranslate={() => focusAi('translate')}
          onOpenBackground={() => setPanel('background')}
          onResize={() => setResizeOpen(true)}
          onAddPage={() => store.addPage()}
          onDuplicatePage={() => store.duplicatePage()}
          onFit={() => window.dispatchEvent(new CustomEvent('editrim:fit'))}
        />
      )}

      <Modal
        open={Boolean(componentDraft)}
        onClose={() => setComponentDraft(null)}
        title="Create component"
        subtitle="Save this selection as a reusable asset. Insert it from Elements in any design."
        width={480}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setComponentDraft(null)}>Cancel</button>
            <button className="btn btn-cobalt" onClick={saveComponentDraft} disabled={!componentDraft?.name.trim()}>Save component</button>
          </>
        }
      >
        <div className="field">
          <label className="field-label" htmlFor="component-name">Component name</label>
          <input
            id="component-name"
            className="input"
            value={componentDraft?.name ?? ''}
            onChange={e => setComponentDraft(d => d ? { ...d, name: e.target.value } : d)}
            onFocus={e => e.currentTarget.select()}
            onKeyDown={e => { if (e.key === 'Enter') saveComponentDraft(); }}
            autoFocus
          />
        </div>
        {componentDraft && (
          <div className="component-draft-meta">
            <EditrimIcon name="elements" size={15} />
            <span>{componentDraft.elements.length} layers · {componentDraft.width} × {componentDraft.height} px · stored locally</span>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(commentTarget)}
        onClose={() => setCommentTarget(null)}
        title="Comments"
        subtitle={
          commentTarget
            ? commentTarget.elementId
              ? design.pages.find(p => p.id === commentTarget.pageId)?.elements.find(el => el.id === commentTarget.elementId)?.name || 'Selected layer'
              : design.pages.find(p => p.id === commentTarget.pageId)?.name || 'This page'
            : ''
        }
        width={560}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCommentTarget(null)}>Close</button>
            <button className="btn btn-cobalt" onClick={postComment} disabled={!commentText.trim()}>Post comment</button>
          </>
        }
      >
        <div className="comment-thread">
          {commentTarget && (design.comments ?? [])
            .filter(c => c.pageId === commentTarget.pageId && (commentTarget.elementId ? c.elementId === commentTarget.elementId : !c.elementId))
            .sort((a, b) => a.createdAt - b.createdAt)
            .map(c => (
              <div className={`comment-item ${c.resolved ? 'is-resolved' : ''}`} key={c.id}>
                <div className="comment-avatar">{c.author.slice(0, 1).toUpperCase()}</div>
                <div className="comment-body">
                  <div className="comment-meta">
                    <strong>{c.author}</strong>
                    <span>{timeAgo(c.createdAt)}</span>
                    {c.resolved && <span className="comment-resolved">Resolved</span>}
                  </div>
                  <p>{c.text}</p>
                  <div className="comment-actions">
                    <button onClick={() => store.updateComment(c.id, { resolved: !c.resolved })}>
                      <EditrimIcon name="check" size={12} /> {c.resolved ? 'Reopen' : 'Resolve'}
                    </button>
                    <button className="danger" onClick={() => store.removeComment(c.id)}><EditrimIcon name="trash" size={12} /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          {commentTarget && !(design.comments ?? []).some(c => c.pageId === commentTarget.pageId && (commentTarget.elementId ? c.elementId === commentTarget.elementId : !c.elementId)) && (
            <div className="comment-empty">
              <EditrimIcon name="comment" size={20} />
              <strong>No comments yet.</strong>
              <p>Leave a note for yourself or whoever opens this file next.</p>
            </div>
          )}
        </div>
        <label className="field">
          <span className="field-label">New comment</span>
          <textarea
            className="input comment-input"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postComment(); }}
            placeholder="What should change, and why?"
            rows={3}
          />
        </label>
      </Modal>

      <BrandKitModal
        open={brandOpen}
        onClose={() => setBrandOpen(false)}
        onSaved={() => { setBrand(getBrand()); toast('Brand kit updated'); }}
      />
    </div>
  );
}
