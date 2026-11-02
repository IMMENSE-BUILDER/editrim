import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { VellumIcon } from '../components/VellumIcon';

import type { CanvasComment, El, Page, Point, Rect } from '../lib/types';
import type { Design } from '../lib/types';
import { PageBackground, ElementView } from '../components/ElementView';
import { FONT_CSS_STACK } from '../lib/fonts';
import { paintToCss } from '../lib/render';
import { measureTextHeight } from '../lib/render';
import { clamp, rotatePoint, rotatedBBox, round, unionRect } from '../lib/utils';

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLES: { id: Handle; x: number; y: number }[] = [
  { id: 'nw', x: 0, y: 0 },
  { id: 'n', x: 50, y: 0 },
  { id: 'ne', x: 100, y: 0 },
  { id: 'e', x: 100, y: 50 },
  { id: 'se', x: 100, y: 100 },
  { id: 's', x: 50, y: 100 },
  { id: 'sw', x: 0, y: 100 },
  { id: 'w', x: 0, y: 50 },
];

const CURSORS: Record<Handle, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

type Props = {
  design: Design;
  page: Page;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  updateElements: (updates: Record<string, Partial<El>>, opts?: { transient?: boolean; merge?: string }) => void;
  pushHistory: () => void;
  comments?: CanvasComment[];
  onElementContextMenu?: (e: React.MouseEvent, el: El) => void;
  onCanvasContextMenu?: (e: React.MouseEvent, point: Point) => void;
  onCommentClick?: (target: { elementId?: string; x: number; y: number }) => void;
  onOpenShortcuts?: () => void;
};

type View = { zoom: number; pan: Point };

const isTypingTarget = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
};

export function Canvas({
  design,
  page,
  selectedIds,
  setSelectedIds,
  editingId,
  setEditingId,
  updateElements,
  pushHistory,
  comments = [],
  onElementContextMenu,
  onCanvasContextMenu,
  onCommentClick,
  onOpenShortcuts,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ zoom: 0.5, pan: { x: 0, y: 0 } });
  const [space, setSpace] = useState(false);
  const [panning, setPanning] = useState(false);
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [hint, setHint] = useState<{ text: string; x: number; y: number } | null>(null);
  const fittedFor = useRef('');

  const size = design.size;

  const fit = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    if (!vw || !vh) return;
    const insetX = vw < 700 ? 32 : 110;
    const insetY = vh < 700 ? 40 : 100;
    const z = clamp(Math.min((vw - insetX) / size.width, (vh - insetY) / size.height), 0.04, 1.4);
    setView({ zoom: z, pan: { x: (vw - size.width * z) / 2, y: (vh - size.height * z) / 2 } });
  }, [size.width, size.height]);

  useEffect(() => {
    const key = `${size.width}x${size.height}`;
    if (fittedFor.current === key) return;
    fittedFor.current = key;
    const id = requestAnimationFrame(fit);
    return () => {
      cancelAnimationFrame(id);
      if (fittedFor.current === key) fittedFor.current = '';
    };
  }, [fit, size.width, size.height]);

  useEffect(() => {
    const onResize = () => {
      // keep the design visible when the window changes dramatically
      fit();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('vellum:fit', onResize as EventListener);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('vellum:fit', onResize as EventListener);
    };
  }, [fit]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTypingTarget(e.target)) {
        e.preventDefault();
        setSpace(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpace(false);
    };
    const blur = () => setSpace(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  const toPage = (clientX: number, clientY: number): Point => {
    const r = pageRef.current?.getBoundingClientRect();
    if (!r || !view.zoom) return { x: 0, y: 0 };
    return { x: (clientX - r.left) / view.zoom, y: (clientY - r.top) / view.zoom };
  };

  /* ---------- wheel zoom / pan ---------- */
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const rect = vp.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        setView(v => {
          const nz = clamp(v.zoom * factor, 0.04, 4);
          const px = (mx - v.pan.x) / v.zoom;
          const py = (my - v.pan.y) / v.zoom;
          return { zoom: nz, pan: { x: mx - px * nz, y: my - py * nz } };
        });
      } else {
        setView(v => ({ ...v, pan: { x: v.pan.x - e.deltaX, y: v.pan.y - e.deltaY } }));
      }
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, []);

  const zoomBy = (factor: number) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const mx = vp.clientWidth / 2;
    const my = vp.clientHeight / 2;
    setView(v => {
      const nz = clamp(v.zoom * factor, 0.04, 4);
      const px = (mx - v.pan.x) / v.zoom;
      const py = (my - v.pan.y) / v.zoom;
      return { zoom: nz, pan: { x: mx - px * nz, y: my - py * nz } };
    });
  };

  /* ---------- pan / deselect ---------- */
  const startPan = (e: React.PointerEvent) => {
    const start = { x: e.clientX, y: e.clientY };
    const origin = view.pan;
    setPanning(true);
    const move = (ev: PointerEvent) => {
      setView(v => ({ ...v, pan: { x: origin.x + ev.clientX - start.x, y: origin.y + ev.clientY - start.y } }));
    };
    const up = () => {
      setPanning(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onViewportDown = (e: React.PointerEvent) => {
    if (e.button === 1 || space || e.altKey) {
      e.preventDefault();
      startPan(e);
      return;
    }
    if (e.button === 0) {
      setSelectedIds([]);
      setEditingId(null);
    }
  };

  /* ---------- snapping ---------- */
  const snapDelta = (dx: number, dy: number, rects: Rect[], ignoreIds: string[], threshold: number) => {
    const bounds = unionRect(rects);
    if (!bounds) return { dx, dy, gx: null as number | null, gy: null as number | null };
    const moved = { x: bounds.x + dx, y: bounds.y + dy, w: bounds.w, h: bounds.h };
    const others = page.elements
      .filter(el => !ignoreIds.includes(el.id) && !el.hidden)
      .map(el => rotatedBBox(el));
    const xLines = [0, size.width / 2, size.width];
    const yLines = [0, size.height / 2, size.height];
    others.forEach(b => {
      xLines.push(b.x, b.x + b.w / 2, b.x + b.w);
      yLines.push(b.y, b.y + b.h / 2, b.y + b.h);
    });
    const movingX = [moved.x, moved.x + moved.w / 2, moved.x + moved.w];
    const movingY = [moved.y, moved.y + moved.h / 2, moved.y + moved.h];

    let bestX: { diff: number; line: number } | null = null;
    for (const m of movingX) {
      for (const l of xLines) {
        const diff = l - m;
        if (Math.abs(diff) <= threshold && (!bestX || Math.abs(diff) < Math.abs(bestX.diff))) {
          bestX = { diff, line: l };
        }
      }
    }
    let bestY: { diff: number; line: number } | null = null;
    for (const m of movingY) {
      for (const l of yLines) {
        const diff = l - m;
        if (Math.abs(diff) <= threshold && (!bestY || Math.abs(diff) < Math.abs(bestY.diff))) {
          bestY = { diff, line: l };
        }
      }
    }
    return {
      dx: dx + (bestX?.diff ?? 0),
      dy: dy + (bestY?.diff ?? 0),
      gx: bestX?.line ?? null,
      gy: bestY?.line ?? null,
    };
  };

  /* ---------- move element(s) ---------- */
  const startMove = (e: React.PointerEvent, id: string, forcedIds?: string[]) => {
    const target = page.elements.find(el => el.id === id);
    if (!target || target.locked) return;
    const ids = forcedIds ?? (selectedIds.includes(id) ? selectedIds : [id]);
    const movable = page.elements.filter(el => ids.includes(el.id) && !el.locked);
    if (!movable.length) return;
    const start = toPage(e.clientX, e.clientY);
    const originals = new Map(movable.map(el => [el.id, { x: el.x, y: el.y, w: el.w, h: el.h, rotation: el.rotation }]));
    const rects = movable.map(el => rotatedBBox(el));
    let moved = false;
    setHint(null);

    const move = (ev: PointerEvent) => {
      const p = toPage(ev.clientX, ev.clientY);
      let dx = p.x - start.x;
      let dy = p.y - start.y;
      if (!moved) {
        if (Math.hypot(dx, dy) < 1.5 / view.zoom) return;
        moved = true;
        pushHistory();
      }
      if (ev.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      const snapped = snapDelta(dx, dy, rects, movable.map(el => el.id), 6 / view.zoom);
      setGuides({ x: snapped.gx, y: snapped.gy });
      const updates: Record<string, Partial<El>> = {};
      movable.forEach(el => {
        const o = originals.get(el.id)!;
        updates[el.id] = { x: round(o.x + snapped.dx, 0.1), y: round(o.y + snapped.dy, 0.1) };
      });
      updateElements(updates, { transient: true });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setGuides({ x: null, y: null });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const groupMembers = (el: El) =>
    el.groupId ? page.elements.filter(x => x.groupId === el.groupId && !x.hidden) : [el];

  const onElementDown = (e: React.PointerEvent, el: El) => {
    if (e.button !== 0 || space || e.altKey) return;
    e.stopPropagation();
    if (editingId === el.id) return;
    setEditingId(null);
    const grouped = groupMembers(el);
    const groupIds = grouped.map(x => x.id);
    let finalIds = selectedIds;
    if (e.shiftKey) {
      const allSelected = groupIds.every(id => selectedIds.includes(id));
      finalIds = allSelected
        ? selectedIds.filter(id => !groupIds.includes(id))
        : [...new Set([...selectedIds, ...groupIds])];
      setSelectedIds(finalIds);
      if (!finalIds.includes(el.id)) return;
    } else if (!groupIds.every(id => selectedIds.includes(id))) {
      finalIds = groupIds;
      setSelectedIds(finalIds);
    }
    if (!el.locked) startMove(e, el.id, finalIds);
  };

  /* ---------- resize ---------- */
  const startResize = (e: React.PointerEvent, dir: Handle) => {
    e.stopPropagation();
    e.preventDefault();
    const selected = page.elements.filter(el => selectedIds.includes(el.id));
    if (!selected.length || selected.some(el => el.locked)) return;
    const single = selected.length === 1 ? selected[0] : null;
    const bbox = single ? rotatedBBox(single) : unionRect(selected.map(el => rotatedBBox(el)));
    if (!bbox) return;
    const start = toPage(e.clientX, e.clientY);
    const originals = new Map(selected.map(el => [el.id, { x: el.x, y: el.y, w: el.w, h: el.h, rotation: el.rotation }]));
    const hasE = dir.includes('e');
    const hasW = dir.includes('w');
    const hasN = dir.includes('n');
    const hasS = dir.includes('s');
    let moved = false;

    const center = single
      ? { x: single.x + single.w / 2, y: single.y + single.h / 2 }
      : { x: bbox.x + bbox.w / 2, y: bbox.y + bbox.h / 2 };
    const rot = single?.rotation ?? 0;
    const startW = single?.w ?? bbox.w;
    const startH = single?.h ?? bbox.h;
    const aspect = startW / startH;

    const move = (ev: PointerEvent) => {
      if (!moved) {
        moved = true;
        pushHistory();
      }
      const p = toPage(ev.clientX, ev.clientY);
      if (single) {
        const local = rotatePoint({ x: p.x - center.x, y: p.y - center.y }, -rot);
        let nw = hasE ? local.x + startW / 2 : hasW ? startW / 2 - local.x : startW;
        let nh = hasS ? local.y + startH / 2 : hasN ? startH / 2 - local.y : startH;
        nw = Math.max(8, nw);
        nh = Math.max(8, nh);
        if (ev.shiftKey && (hasE || hasW) && (hasN || hasS)) {
          const s = Math.max(nw / startW, nh / startH);
          nw = startW * s;
          nh = startH * s;
        }
        const anchorLocal = {
          x: hasW ? startW / 2 : hasE ? -startW / 2 : 0,
          y: hasN ? startH / 2 : hasS ? -startH / 2 : 0,
        };
        const anchorRot = rotatePoint(anchorLocal, rot);
        const anchorWorld = { x: center.x + anchorRot.x, y: center.y + anchorRot.y };
        const centerOffset = rotatePoint(
          {
            x: hasE ? nw / 2 : hasW ? -nw / 2 : 0,
            y: hasS ? nh / 2 : hasN ? -nh / 2 : 0,
          },
          rot,
        );
        const newCenter = { x: anchorWorld.x + centerOffset.x, y: anchorWorld.y + centerOffset.y };
        updateElements(
          {
            [single.id]: {
              x: round(newCenter.x - nw / 2, 0.1),
              y: round(newCenter.y - nh / 2, 0.1),
              w: round(nw, 0.1),
              h: round(nh, 0.1),
            },
          },
          { transient: true },
        );
        setHint({ text: `${Math.round(nw)} × ${Math.round(nh)}`, x: newCenter.x, y: newCenter.y - nh / 2 });
      } else {
        let nx = bbox.x;
        let ny = bbox.y;
        let nw = bbox.w;
        let nh = bbox.h;
        if (hasE) nw = p.x - bbox.x;
        if (hasW) {
          nw = bbox.x + bbox.w - p.x;
          nx = p.x;
        }
        if (hasS) nh = p.y - bbox.y;
        if (hasN) {
          nh = bbox.y + bbox.h - p.y;
          ny = p.y;
        }
        nw = Math.max(20, nw);
        nh = Math.max(20, nh);
        if (ev.shiftKey) {
          const s = Math.max(nw / bbox.w, nh / bbox.h);
          nw = bbox.w * s;
          nh = bbox.h * s;
          if (hasW) nx = bbox.x + bbox.w - nw;
          if (hasN) ny = bbox.y + bbox.h - nh;
        }
        const sx = nw / bbox.w;
        const sy = nh / bbox.h;
        const updates: Record<string, Partial<El>> = {};
        selected.forEach(el => {
          const o = originals.get(el.id)!;
          updates[el.id] = {
            x: round(nx + (o.x - bbox.x) * sx, 0.1),
            y: round(ny + (o.y - bbox.y) * sy, 0.1),
            w: round(o.w * sx, 0.1),
            h: round(o.h * sy, 0.1),
          };
        });
        updateElements(updates, { transient: true });
        setHint({ text: `${Math.round(nw)} × ${Math.round(nh)}`, x: nx + nw / 2, y: ny });
      }
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setHint(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    void aspect;
  };

  /* ---------- rotate ---------- */
  const startRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedIds.length !== 1) return;
    const el = page.elements.find(x => x.id === selectedIds[0]);
    if (!el || el.locked) return;
    const center = { x: el.x + el.w / 2, y: el.y + el.h / 2 };
    const start = toPage(e.clientX, e.clientY);
    const startAngle = Math.atan2(start.y - center.y, start.x - center.x) * (180 / Math.PI);
    const startRotation = el.rotation;
    let moved = false;
    const move = (ev: PointerEvent) => {
      if (!moved) {
        moved = true;
        pushHistory();
      }
      const p = toPage(ev.clientX, ev.clientY);
      const angle = Math.atan2(p.y - center.y, p.x - center.x) * (180 / Math.PI);
      let next = startRotation + angle - startAngle;
      if (ev.shiftKey) next = Math.round(next / 15) * 15;
      next = Math.round(next * 10) / 10;
      updateElements({ [el.id]: { rotation: next } }, { transient: true });
      setHint({ text: `${next}°`, x: center.x, y: el.y - 30 / view.zoom });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setHint(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const selectedEls = page.elements.filter(el => selectedIds.includes(el.id) && !el.hidden);
  const single = selectedEls.length === 1 ? selectedEls[0] : null;
  const singleBox = single ? rotatedBBox(single) : null;
  const groupBox = selectedEls.length > 1 ? unionRect(selectedEls.map(el => rotatedBBox(el))) : null;
  const handlesVisible = selectedEls.length > 0 && selectedEls.every(el => !el.locked);
  const hs = 9 / view.zoom;
  const hintScale = 1 / view.zoom;

  const editText = (el: El) => {
    if (el.type !== 'text') return;
    setSelectedIds([el.id]);
    setEditingId(el.id);
  };

  const commentPins = (() => {
    const pins = new Map<string, { key: string; x: number; y: number; count: number; elementId?: string }>();
    const pad = 18 / (view.zoom || 1);
    const elementsById = new Map(page.elements.map(el => [el.id, el]));
    comments
      .filter(c => c.pageId === page.id && !c.resolved)
      .forEach(c => {
        const key = c.elementId ?? `page-${c.id}`;
        const anchor = c.elementId ? elementsById.get(c.elementId) : undefined;
        const rawX = anchor ? anchor.x + anchor.w : c.x;
        const rawY = anchor ? anchor.y + 12 : c.y;
        const hit = pins.get(key);
        if (hit) hit.count += 1;
        else pins.set(key, {
          key,
          x: clamp(rawX, pad, size.width - pad),
          y: clamp(rawY, pad, size.height - pad),
          count: 1,
          elementId: c.elementId,
        });
      });
    return [...pins.values()];
  })();

  const renderTextEditor = (el: Extract<El, { type: 'text' }>) => {
    const pad = el.padding ?? 0;
    return (
      <textarea
        className="cv-text-editor"
        value={el.text}
        autoFocus
        spellCheck={false}
        onChange={e => {
          const text = e.target.value;
          const nextH = Math.max(el.fontSize * el.lineHeight + pad * 2, measureTextHeight({ ...el, text }));
          updateElements({ [el.id]: { text, h: Math.round(nextH) } }, { merge: `text-${el.id}` });
        }}
        onBlur={() => setEditingId(null)}
        onPointerDown={e => e.stopPropagation()}
        onContextMenu={e => e.stopPropagation()}
        onKeyDown={e => {
          e.stopPropagation();
          if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur();
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          padding: pad,
          margin: 0,
          border: 'none',
          outline: 'none',
          resize: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box',
          background: el.background && el.background.kind !== 'none' ? paintToCss(el.background) : 'transparent',
          borderRadius: el.backgroundRadius || 0,
          fontFamily: FONT_CSS_STACK(el.fontFamily),
          fontSize: el.fontSize,
          fontWeight: el.fontWeight,
          fontStyle: el.italic ? 'italic' : 'normal',
          color: el.color,
          lineHeight: el.lineHeight,
          letterSpacing: el.letterSpacing,
          textAlign: el.align,
          textTransform: el.uppercase ? 'uppercase' : 'none',
          textDecoration: el.underline ? 'underline' : 'none',
          zIndex: 6,
        }}
      />
    );
  };

  return (
    <div
      className={`cv-viewport ${space ? 'is-space' : ''} ${panning ? 'is-panning' : ''}`}
      ref={viewportRef}
      onPointerDown={onViewportDown}
      onContextMenu={e => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
        e.preventDefault();
        onCanvasContextMenu?.(e, toPage(e.clientX, e.clientY));
      }}
    >
      <div
        className="cv-stage"
        style={{ transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.zoom})`, width: size.width, height: size.height }}
      >
        <div
          className="cv-page"
          ref={pageRef}
          style={{ width: size.width, height: size.height }}
        >
          <div className="cv-page-clip">
            <PageBackground bg={page.background} />
            {page.elements.map(el => {
              if (el.hidden) return null;
              return (
                <div
                  key={el.id}
                  className={`cv-el ${selectedIds.includes(el.id) ? 'is-selected' : ''} ${el.locked ? 'is-locked' : ''}`}
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.w,
                    height: el.h,
                    transform: `rotate(${el.rotation}deg)`,
                    opacity: el.opacity,
                    cursor: el.locked ? 'default' : space ? 'grab' : 'move',
                  }}
                  onPointerDown={e => onElementDown(e, el)}
                  onContextMenu={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onElementContextMenu?.(e, el);
                  }}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    editText(el);
                  }}
                >
                  {editingId === el.id && el.type === 'text' ? renderTextEditor(el) : <ElementView el={el} />}
                  {el.locked && selectedIds.includes(el.id) && (
                    <span className="cv-lock-badge"><VellumIcon name="lock" size={Math.max(8, 10 / view.zoom)} /></span>
                  )}
                </div>
              );
            })}
          </div>

          {commentPins.map(pin => (
            <button
              key={pin.key}
              className="cv-comment-pin"
              style={{
                left: pin.x,
                top: pin.y,
                transform: `translate(-50%, -50%) scale(${1 / view.zoom})`,
              }}
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onCommentClick?.({ elementId: pin.elementId, x: pin.x, y: pin.y }); }}
              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onCommentClick?.({ elementId: pin.elementId, x: pin.x, y: pin.y }); }}
              title={`${pin.count} ${pin.count === 1 ? 'comment' : 'comments'}`}
              aria-label={`Open ${pin.count} ${pin.count === 1 ? 'comment' : 'comments'}`}
            >
              <VellumIcon name="comment" size={12} />
              {pin.count > 1 && <span>{pin.count}</span>}
            </button>
          ))}

          {guides.x !== null && (
            <div className="cv-guide cv-guide-x" style={{ left: guides.x, width: 1 / view.zoom, height: size.height }} />
          )}
          {guides.y !== null && (
            <div className="cv-guide cv-guide-y" style={{ top: guides.y, height: 1 / view.zoom, width: size.width }} />
          )}

          {groupBox && (
            <div
              className="cv-sel-group"
              style={{
                left: groupBox.x,
                top: groupBox.y,
                width: groupBox.w,
                height: groupBox.h,
                borderWidth: 1.5 / view.zoom,
              }}
            >
              {handlesVisible && HANDLES.map(h => (
                <span
                  key={h.id}
                  className="cv-handle"
                  style={{
                    left: `${h.x}%`,
                    top: `${h.y}%`,
                    width: hs,
                    height: hs,
                    borderWidth: 1.5 / view.zoom,
                    cursor: CURSORS[h.id],
                  }}
                  onPointerDown={e => startResize(e, h.id)}
                />
              ))}
            </div>
          )}

          {single && (
            <div
              className={`cv-sel ${single.locked ? 'is-locked' : ''}`}
              style={{
                left: single.x,
                top: single.y,
                width: single.w,
                height: single.h,
                transform: `rotate(${single.rotation}deg)`,
                borderWidth: 1.5 / view.zoom,
              }}
            >
              {handlesVisible && (
                <>
                  <div
                    className="cv-rotate-stem"
                    style={{ width: 1 / view.zoom, height: 26 / view.zoom, top: -26 / view.zoom }}
                  />
                  <span
                    className="cv-rotate"
                    style={{
                      width: 18 / view.zoom,
                      height: 18 / view.zoom,
                      top: -35 / view.zoom,
                      borderWidth: 1.5 / view.zoom,
                    }}
                    onPointerDown={startRotate}
                    title="Rotate"
                  >
                    <VellumIcon name="rotate" size={11 / view.zoom} strokeWidth={2} className="cv-rotate-icon" />
                  </span>
                  {HANDLES.map(h => (
                    <span
                      key={h.id}
                      className="cv-handle"
                      style={{
                        left: `${h.x}%`,
                        top: `${h.y}%`,
                        width: hs,
                        height: hs,
                        borderWidth: 1.5 / view.zoom,
                        cursor: CURSORS[h.id],
                      }}
                      onPointerDown={e => startResize(e, h.id)}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {hint && (
            <div
              className="cv-hint"
              style={{
                left: hint.x,
                top: hint.y - 10 / view.zoom,
                transform: `translate(-50%, -100%) scale(${hintScale})`,
                transformOrigin: 'bottom center',
              }}
            >
              {hint.text}
            </div>
          )}
        </div>
      </div>

      <div className="cv-controls" onPointerDown={e => e.stopPropagation()}>
        <button onClick={() => zoomBy(0.9)} aria-label="Zoom out" title="Zoom out"><VellumIcon name="minus" size={15} /></button>
        <button className="cv-zoom-val" onClick={() => zoomBy(1 / view.zoom)} title="Reset zoom">
          {Math.round(view.zoom * 100)}%
        </button>
        <button onClick={() => zoomBy(1.1)} aria-label="Zoom in" title="Zoom in"><VellumIcon name="plus" size={15} /></button>
        <span className="cv-ctrl-sep" />
        <button onClick={fit} aria-label="Fit to screen" title="Fit to screen"><VellumIcon name="fit" size={15} /></button>
        <span className="cv-ctrl-sep" />
        <button onClick={onOpenShortcuts} className="cv-help" title="Keyboard shortcuts">?</button>
      </div>

      <div className="cv-tip">
        {space ? 'Drag to pan' : 'Scroll to pan · ⌘/Ctrl + scroll to zoom · Space to pan'}
      </div>
    </div>
  );
}
