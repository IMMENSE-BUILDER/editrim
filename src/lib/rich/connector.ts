import type { ConnectorElement, El, Page } from '../types';
import type { Prim } from './prims';

function arrowTriangle(tipX: number, tipY: number, fromX: number, fromY: number, size: number): string {
  const angle = Math.atan2(tipY - fromY, tipX - fromX);
  const a1 = angle + Math.PI * 0.82;
  const a2 = angle - Math.PI * 0.82;
  const x1 = tipX + Math.cos(a1) * size;
  const y1 = tipY + Math.sin(a1) * size;
  const x2 = tipX + Math.cos(a2) * size;
  const y2 = tipY + Math.sin(a2) * size;
  return `M ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

export function buildConnectorPrims(el: ConnectorElement): Prim[] {
  const x1 = el.from.x - el.x;
  const y1 = el.from.y - el.y;
  const x2 = el.to.x - el.x;
  const y2 = el.to.y - el.y;
  const stroke = el.stroke || '#14130F';
  const sw = Math.max(1, el.strokeWidth || 3);
  const dash = el.dash ? `${sw * 3} ${sw * 2}` : undefined;

  let d = '';
  let startRef = { x: x2, y: y2 };
  let endRef = { x: x1, y: y1 };

  if (el.route === 'elbow') {
    const mx = (x1 + x2) / 2;
    d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${mx.toFixed(1)} ${y1.toFixed(1)} L ${mx.toFixed(1)} ${y2.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    startRef = { x: mx, y: y1 };
    endRef = { x: mx, y: y2 };
    if (Math.abs(mx - x1) < 1) startRef = { x: mx, y: y2 };
    if (Math.abs(x2 - mx) < 1) endRef = { x: mx, y: y1 };
  } else if (el.route === 'curved') {
    const dx = x2 - x1;
    const cx1 = x1 + dx * 0.5;
    const cy1 = y1;
    const cx2 = x2 - dx * 0.5;
    const cy2 = y2;
    d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cx1.toFixed(1)} ${cy1.toFixed(1)} ${cx2.toFixed(1)} ${cy2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    startRef = { x: cx1, y: cy1 };
    endRef = { x: cx2, y: cy2 };
  } else {
    d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }

  const prims: Prim[] = [
    { k: 'path', d, stroke, sw, cap: 'round', join: 'round', dash },
  ];

  const arrowSize = Math.max(9, sw * 3.5);
  if (el.arrowStart) {
    prims.push({ k: 'path', d: arrowTriangle(x1, y1, startRef.x, startRef.y, arrowSize), fill: stroke });
  }
  if (el.arrowEnd) {
    prims.push({ k: 'path', d: arrowTriangle(x2, y2, endRef.x, endRef.y, arrowSize), fill: stroke });
  }

  return prims;
}

function rectEdgePoint(el: El, towardX: number, towardY: number): { x: number; y: number } {
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const dx = towardX - cx;
  const dy = towardY - cy;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return { x: cx, y: cy };
  const hw = Math.max(1, el.w / 2);
  const hh = Math.max(1, el.h / 2);
  const tx = Math.abs(dx) > 0.0001 ? hw / Math.abs(dx) : Infinity;
  const ty = Math.abs(dy) > 0.0001 ? hh / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty);
  return { x: cx + dx * t, y: cy + dy * t };
}

export function syncConnectors(page: Page): Page {
  if (!page.elements.some(e => e.type === 'connector')) return page;
  const byId = new Map(page.elements.map(e => [e.id, e]));
  let changed = false;

  const elements = page.elements.map(el => {
    if (el.type !== 'connector') return el;
    const fromTarget = el.from.elementId ? byId.get(el.from.elementId) : undefined;
    const toTarget = el.to.elementId ? byId.get(el.to.elementId) : undefined;

    const toCenter = toTarget
      ? { x: toTarget.x + toTarget.w / 2, y: toTarget.y + toTarget.h / 2 }
      : { x: el.to.x, y: el.to.y };
    const fromCenter = fromTarget
      ? { x: fromTarget.x + fromTarget.w / 2, y: fromTarget.y + fromTarget.h / 2 }
      : { x: el.from.x, y: el.from.y };

    const p1 = fromTarget ? rectEdgePoint(fromTarget, toCenter.x, toCenter.y) : { x: el.from.x, y: el.from.y };
    const p2 = toTarget ? rectEdgePoint(toTarget, fromCenter.x, fromCenter.y) : { x: el.to.x, y: el.to.y };

    const nextFrom = fromTarget
      ? { elementId: fromTarget.id, x: Math.round(p1.x * 10) / 10, y: Math.round(p1.y * 10) / 10 }
      : { x: el.from.x, y: el.from.y };
    const nextTo = toTarget
      ? { elementId: toTarget.id, x: Math.round(p2.x * 10) / 10, y: Math.round(p2.y * 10) / 10 }
      : { x: el.to.x, y: el.to.y };

    const pad = Math.max(12, (el.strokeWidth || 3) * 3);
    const minX = Math.min(nextFrom.x, nextTo.x) - pad;
    const minY = Math.min(nextFrom.y, nextTo.y) - pad;
    const maxX = Math.max(nextFrom.x, nextTo.x) + pad;
    const maxY = Math.max(nextFrom.y, nextTo.y) + pad;
    const nx = Math.round(minX * 10) / 10;
    const ny = Math.round(minY * 10) / 10;
    const nw = Math.max(16, Math.round((maxX - minX) * 10) / 10);
    const nh = Math.max(16, Math.round((maxY - minY) * 10) / 10);

    if (
      el.from.elementId !== nextFrom.elementId ||
      el.to.elementId !== nextTo.elementId ||
      el.from.x !== nextFrom.x ||
      el.from.y !== nextFrom.y ||
      el.to.x !== nextTo.x ||
      el.to.y !== nextTo.y ||
      el.x !== nx ||
      el.y !== ny ||
      el.w !== nw ||
      el.h !== nh
    ) {
      changed = true;
      return { ...el, from: nextFrom, to: nextTo, x: nx, y: ny, w: nw, h: nh, rotation: 0 };
    }
    return el;
  });

  return changed ? { ...page, elements } : page;
}
