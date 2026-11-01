import { useCallback, useMemo, useRef, useState } from 'react';
import type { Background, CanvasComment, Design, El, Page } from '../lib/types';
import { rotatedBBox, unionRect, uid } from '../lib/utils';
import { newPage } from '../lib/storage';

type UpdateOpts = { transient?: boolean; merge?: string };
type AlignKind = 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom';

function scaleShadow<T extends { shadow?: { x: number; y: number; blur: number; color: string } | null }>(el: T, s: number): T {
  if (!el.shadow) return el;
  return { ...el, shadow: { ...el.shadow, x: el.shadow.x * s, y: el.shadow.y * s, blur: el.shadow.blur * s } };
}

function scaleElement(el: El, s: number, ox: number, oy: number): El {
  const common = {
    x: el.x * s + ox,
    y: el.y * s + oy,
    w: Math.max(2, el.w * s),
    h: Math.max(2, el.h * s),
  };
  if (el.type === 'text') {
    return scaleShadow(
      {
        ...el,
        ...common,
        fontSize: Math.max(4, el.fontSize * s),
        letterSpacing: el.letterSpacing * s,
        padding: (el.padding ?? 0) * s,
        backgroundRadius: (el.backgroundRadius ?? 0) * s,
        strokeWidth: (el.strokeWidth ?? 0) * s,
      },
      s,
    );
  }
  if (el.type === 'shape') {
    return scaleShadow(
      { ...el, ...common, radius: el.radius * s, strokeWidth: el.strokeWidth * s },
      s,
    );
  }
  if (el.type === 'image') {
    return scaleShadow({ ...el, ...common, radius: el.radius * s }, s);
  }
  return scaleShadow({ ...el, ...common }, s);
}

export function useEditor(initial: Design) {
  const [design, setDesignState] = useState<Design>(initial);
  const designRef = useRef<Design>(initial);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePage, setActivePageState] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const past = useRef<Design[]>([]);
  const future = useRef<Design[]>([]);
  const lastMerge = useRef<{ key: string; time: number } | null>(null);

  const page: Page = design.pages[activePage] ?? design.pages[0];
  const safePageIndex = Math.min(activePage, design.pages.length - 1);

  const selected = useMemo(
    () => page.elements.filter(e => selectedIds.includes(e.id)),
    [page.elements, selectedIds],
  );

  const apply = useCallback(
    (updater: (d: Design) => Design, opts?: UpdateOpts) => {
      const prev = designRef.current;
      const next = updater(prev);
      if (next === prev) return;
      if (!opts?.transient) {
        const now = Date.now();
        const merge = opts?.merge;
        const shouldPush =
          !merge ||
          !lastMerge.current ||
          lastMerge.current.key !== merge ||
          now - lastMerge.current.time > 650;
        if (shouldPush) {
          past.current.push(prev);
          if (past.current.length > 80) past.current.shift();
          future.current = [];
          setHistoryVersion(v => v + 1);
        }
        if (merge) lastMerge.current = { key: merge, time: now };
      }
      designRef.current = next;
      setDesignState(next);
    },
    [],
  );

  const pushHistory = useCallback(() => {
    const current = designRef.current;
    if (past.current[past.current.length - 1] === current) return;
    past.current.push(current);
    if (past.current.length > 80) past.current.shift();
    future.current = [];
    lastMerge.current = null;
    setHistoryVersion(v => v + 1);
  }, []);

  const restore = useCallback((snapshot: Design) => {
    designRef.current = snapshot;
    setDesignState(snapshot);
    setEditingId(null);
    const validPage = Math.min(activePage, snapshot.pages.length - 1);
    setActivePageState(validPage);
    const ids = new Set(snapshot.pages[validPage]?.elements.map(e => e.id) ?? []);
    setSelectedIds(prev => prev.filter(id => ids.has(id)));
    lastMerge.current = null;
    setHistoryVersion(v => v + 1);
  }, [activePage]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(designRef.current);
    restore(prev);
  }, [restore]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(designRef.current);
    restore(next);
  }, [restore]);

  const updatePage = useCallback(
    (updater: (p: Page) => Page, opts?: UpdateOpts) => {
      apply(
        d => ({
          ...d,
          pages: d.pages.map((p, i) => (i === safePageIndex ? updater(p) : p)),
        }),
        opts,
      );
    },
    [apply, safePageIndex],
  );

  const setPage = useCallback((next: Page, opts?: UpdateOpts) => {
    updatePage(() => next, opts);
  }, [updatePage]);

  const updateElements = useCallback(
    (updates: Record<string, Partial<El>>, opts?: UpdateOpts) => {
      updatePage(
        p => ({
          ...p,
          elements: p.elements.map(el => (updates[el.id] ? ({ ...el, ...updates[el.id] } as El) : el)),
        }),
        opts,
      );
    },
    [updatePage],
  );

  const patchElement = useCallback(
    (id: string, patch: Partial<El>, opts?: UpdateOpts) => {
      updateElements({ [id]: patch }, opts);
    },
    [updateElements],
  );

  const patchSelected = useCallback(
    (patch: Partial<El>, opts?: UpdateOpts) => {
      const updates: Record<string, Partial<El>> = {};
      selected.forEach(el => {
        updates[el.id] = patch;
      });
      updateElements(updates, opts);
    },
    [selected, updateElements],
  );

  const addElements = useCallback(
    (els: El[], opts?: { select?: boolean }) => {
      if (!els.length) return;
      updatePage(p => ({ ...p, elements: [...p.elements, ...els] }));
      if (opts?.select !== false) setSelectedIds(els.map(e => e.id));
      setEditingId(null);
    },
    [updatePage],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return;
    const ids = new Set(selected.filter(el => !el.locked).map(el => el.id));
    if (!ids.size) return;
    updatePage(p => ({ ...p, elements: p.elements.filter(e => !ids.has(e.id)) }));
    setSelectedIds(selectedIds.filter(id => !ids.has(id)));
    setEditingId(null);
  }, [selected, selectedIds, updatePage]);

  const duplicateSelected = useCallback(() => {
    if (!selected.length) return;
    if (selected.some(e => e.locked)) return;
    const groupIds = new Map<string, string>();
    selected.forEach(el => {
      if (el.groupId && !groupIds.has(el.groupId)) groupIds.set(el.groupId, uid('g'));
    });
    const copies = selected.map(el => ({
      ...structuredClone(el),
      id: uid(el.type),
      x: el.x + 24,
      y: el.y + 24,
      ...(el.groupId ? { groupId: groupIds.get(el.groupId) } : {}),
    })) as El[];
    updatePage(p => ({ ...p, elements: [...p.elements, ...copies] }));
    setSelectedIds(copies.map(e => e.id));
  }, [selected, updatePage]);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      if (!selected.length) return;
      const updates: Record<string, Partial<El>> = {};
      selected.forEach(el => {
        if (!el.locked) updates[el.id] = { x: el.x + dx, y: el.y + dy };
      });
      updateElements(updates, { merge: 'nudge' });
    },
    [selected, updateElements],
  );

  const align = useCallback(
    (kind: AlignKind, target: 'page' | 'selection' = 'page') => {
      if (!selected.length) return;
      const bboxes = selected.map(el => ({ el, b: rotatedBBox(el) }));
      const bounds = unionRect(bboxes.map(x => x.b));
      if (!bounds) return;
      const box = target === 'page'
        ? { x: 0, y: 0, w: design.size.width, h: design.size.height }
        : bounds;
      const updates: Record<string, Partial<El>> = {};
      bboxes.forEach(({ el, b }) => {
        if (el.locked) return;
        let dx = 0;
        let dy = 0;
        if (kind === 'left') dx = box.x - b.x;
        if (kind === 'hcenter') dx = box.x + box.w / 2 - (b.x + b.w / 2);
        if (kind === 'right') dx = box.x + box.w - (b.x + b.w);
        if (kind === 'top') dy = box.y - b.y;
        if (kind === 'vcenter') dy = box.y + box.h / 2 - (b.y + b.h / 2);
        if (kind === 'bottom') dy = box.y + box.h - (b.y + b.h);
        updates[el.id] = { x: el.x + dx, y: el.y + dy };
      });
      updateElements(updates);
    },
    [selected, updateElements, design.size],
  );

  const centerOnPage = useCallback(() => {
    if (!selected.length) return;
    const rects = selected.map(el => rotatedBBox(el));
    const bounds = unionRect(rects);
    if (!bounds) return;
    const dx = design.size.width / 2 - (bounds.x + bounds.w / 2);
    const dy = design.size.height / 2 - (bounds.y + bounds.h / 2);
    const updates: Record<string, Partial<El>> = {};
    selected.forEach(el => {
      updates[el.id] = { x: el.x + dx, y: el.y + dy };
    });
    updateElements(updates);
  }, [selected, updateElements, design.size]);

  const distribute = useCallback((axis: 'h' | 'v') => {
      if (selected.length < 3) return;
      const items = selected.map(el => ({ el, b: rotatedBBox(el) }));
      if (axis === 'h') {
        items.sort((a, b) => a.b.x - b.b.x);
        const first = items[0];
        const last = items[items.length - 1];
        const totalW = items.reduce((n, i) => n + i.b.w, 0);
        const gap = (last.b.x + last.b.w - first.b.x - totalW) / (items.length - 1);
        let cursor = first.b.x;
        const updates: Record<string, Partial<El>> = {};
        items.forEach(({ el, b }) => {
          updates[el.id] = { x: el.x + (cursor - b.x) };
          cursor += b.w + gap;
        });
        updateElements(updates);
      } else {
        items.sort((a, b) => a.b.y - b.b.y);
        const first = items[0];
        const last = items[items.length - 1];
        const totalH = items.reduce((n, i) => n + i.b.h, 0);
        const gap = (last.b.y + last.b.h - first.b.y - totalH) / (items.length - 1);
        let cursor = first.b.y;
        const updates: Record<string, Partial<El>> = {};
        items.forEach(({ el, b }) => {
          updates[el.id] = { y: el.y + (cursor - b.y) };
          cursor += b.h + gap;
        });
        updateElements(updates);
      }
    },
    [selected, updateElements],
  );

  const reorder = useCallback(
    (mode: 'front' | 'back' | 'forward' | 'backward') => {
      if (!selectedIds.length) return;
      const ids = new Set(selectedIds);
      updatePage(p => {
        const els = [...p.elements];
        if (mode === 'front') {
          const sel = els.filter(e => ids.has(e.id));
          const rest = els.filter(e => !ids.has(e.id));
          return { ...p, elements: [...rest, ...sel] };
        }
        if (mode === 'back') {
          const sel = els.filter(e => ids.has(e.id));
          const rest = els.filter(e => !ids.has(e.id));
          return { ...p, elements: [...sel, ...rest] };
        }
        if (mode === 'forward') {
          for (let i = els.length - 2; i >= 0; i--) {
            if (ids.has(els[i].id) && !ids.has(els[i + 1].id)) {
              [els[i], els[i + 1]] = [els[i + 1], els[i]];
            }
          }
        } else {
          for (let i = 1; i < els.length; i++) {
            if (ids.has(els[i].id) && !ids.has(els[i - 1].id)) {
              [els[i], els[i - 1]] = [els[i - 1], els[i]];
            }
          }
        }
        return { ...p, elements: els };
      });
    },
    [selectedIds, updatePage],
  );

  const toggleLock = useCallback(() => {
    if (!selected.length) return;
    const anyUnlocked = selected.some(e => !e.locked);
    patchSelected({ locked: anyUnlocked });
  }, [selected, patchSelected]);

  const toggleHidden = useCallback(() => {
    if (!selected.length) return;
    const anyVisible = selected.some(e => !e.hidden);
    patchSelected({ hidden: anyVisible });
  }, [selected, patchSelected]);

  const setLocked = useCallback((locked: boolean) => {
    const updates: Record<string, Partial<El>> = {};
    selected.forEach(el => { updates[el.id] = { locked }; });
    updateElements(updates);
  }, [selected, updateElements]);

  const lockAllOnPage = useCallback((locked: boolean) => {
    const updates: Record<string, Partial<El>> = {};
    page.elements.forEach(el => { updates[el.id] = { locked }; });
    updateElements(updates);
  }, [page.elements, updateElements]);

  const groupSelected = useCallback(() => {
    if (selected.length < 2) return;
    const groupId = uid('g');
    const updates: Record<string, Partial<El>> = {};
    selected.forEach(el => { updates[el.id] = { groupId }; });
    updateElements(updates);
  }, [selected, updateElements]);

  const ungroupSelected = useCallback(() => {
    const grouped = selected.filter(el => el.groupId);
    if (!grouped.length) return;
    const updates: Record<string, Partial<El>> = {};
    grouped.forEach(el => { updates[el.id] = { groupId: undefined }; });
    updateElements(updates);
    if (selectedIds.length > 1) setSelectedIds([selectedIds[0]]);
  }, [selected, selectedIds, updateElements]);

  const addComment = useCallback((comment: Omit<CanvasComment, 'id' | 'createdAt'>) => {
    const next: CanvasComment = { ...comment, id: uid('c'), createdAt: Date.now() };
    apply(d => ({ ...d, comments: [...(d.comments ?? []), next] }));
    return next;
  }, [apply]);

  const updateComment = useCallback((id: string, patch: Partial<CanvasComment>) => {
    apply(d => ({
      ...d,
      comments: (d.comments ?? []).map(c => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, [apply]);

  const removeComment = useCallback((id: string) => {
    apply(d => ({ ...d, comments: (d.comments ?? []).filter(c => c.id !== id) }));
  }, [apply]);

  const selectAll = useCallback(() => {
    setSelectedIds(page.elements.filter(e => !e.hidden).map(e => e.id));
  }, [page.elements]);

  const setActivePage = useCallback((index: number) => {
    setActivePageState(index);
    setSelectedIds([]);
    setEditingId(null);
  }, []);

  const addPage = useCallback(
    (after = safePageIndex) => {
      const p = newPage();
      apply(d => {
        const pages = [...d.pages];
        pages.splice(after + 1, 0, p);
        return { ...d, pages };
      });
      setActivePageState(after + 1);
      setSelectedIds([]);
      setEditingId(null);
    },
    [apply, safePageIndex],
  );

  const insertPage = useCallback(
    (page: Page, after = safePageIndex) => {
      apply(d => {
        const pages = [...d.pages];
        pages.splice(after + 1, 0, page);
        return { ...d, pages };
      });
      setActivePageState(after + 1);
      setSelectedIds([]);
      setEditingId(null);
    },
    [apply, safePageIndex],
  );

  const duplicatePage = useCallback((index = safePageIndex) => {
      apply(d => {
        const source = d.pages[index];
        if (!source) return d;
        const copy: Page = {
          ...structuredClone(source),
          id: uid('p'),
          name: `${source.name} copy`,
          elements: source.elements.map(el => ({ ...structuredClone(el), id: uid(el.type) })),
        };
        const pages = [...d.pages];
        pages.splice(index + 1, 0, copy);
        return { ...d, pages };
      });
      setActivePageState(index + 1);
      setSelectedIds([]);
    },
    [apply, safePageIndex],
  );

  const deletePage = useCallback(
    (index = safePageIndex) => {
      if (designRef.current.pages.length <= 1) return;
      apply(d => ({ ...d, pages: d.pages.filter((_, i) => i !== index) }));
      const next = Math.max(0, Math.min(index, designRef.current.pages.length - 1));
      setActivePageState(next);
      setSelectedIds([]);
      setEditingId(null);
    },
    [apply, safePageIndex],
  );

  const movePage = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= design.pages.length || from === to) return;
      apply(d => {
        const pages = [...d.pages];
        const [p] = pages.splice(from, 1);
        pages.splice(to, 0, p);
        return { ...d, pages };
      });
      setActivePageState(to);
      setSelectedIds([]);
    },
    [apply, design.pages.length],
  );

  const resizeDesign = useCallback(
    (width: number, height: number, name = 'Custom size') => {
      const w = Math.round(Math.max(100, Math.min(6000, width)));
      const h = Math.round(Math.max(100, Math.min(6000, height)));
      apply(d => {
        const s = Math.min(w / d.size.width, h / d.size.height);
        const ox = (w - d.size.width * s) / 2;
        const oy = (h - d.size.height * s) / 2;
        return {
          ...d,
          size: { name, width: w, height: h },
          pages: d.pages.map(p => ({
            ...p,
            elements: p.elements.map(el => scaleElement(el, s, ox, oy)),
          })),
        };
      });
    },
    [apply],
  );

  const setBackground = useCallback(
    (background: Background) => {
      updatePage(p => ({ ...p, background }));
    },
    [updatePage],
  );

  const setPageName = useCallback(
    (name: string, index = safePageIndex) => {
      apply(d => ({
        ...d,
        pages: d.pages.map((p, i) => (i === index ? { ...p, name } : p)),
      }), { merge: `page-name-${index}` });
    },
    [apply, safePageIndex],
  );

  const setTitle = useCallback(
    (title: string) => {
      apply(d => ({ ...d, title }), { merge: 'title' });
    },
    [apply],
  );

  return {
    design,
    page,
    pageIndex: safePageIndex,
    selectedIds,
    selected,
    editingId,
    activePage,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    historyVersion,
    setSelectedIds,
    setEditingId,
    updatePage,
    setPage,
    updateElements,
    patchElement,
    patchSelected,
    addElements,
    deleteSelected,
    duplicateSelected,
    nudge,
    align,
    centerOnPage,
    distribute,
    reorder,
    toggleLock,
    toggleHidden,
    setLocked,
    lockAllOnPage,
    groupSelected,
    ungroupSelected,
    addComment,
    updateComment,
    removeComment,
    selectAll,
    setActivePage,
    addPage,
    insertPage,
    duplicatePage,
    deletePage,
    movePage,
    resizeDesign,
    setBackground,
    setPageName,
    setTitle,
    undo,
    redo,
    pushHistory,
  };
}

export type EditorStore = ReturnType<typeof useEditor>;
