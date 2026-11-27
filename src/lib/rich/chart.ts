import { FONT_CSS_STACK } from '../fonts';
import type { ChartElement, Page, TableElement } from '../types';
import { evaluateTable } from './formula';
import { measurePrimCtx, type Prim } from './prims';

const DEFAULT_COLORS = ['#2440F0', '#14B8A6', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'];

function resolveChartData(el: ChartElement, page?: Page) {
  if (el.source?.tableId && page) {
    const tbl = page.elements.find(
      item => item.id === el.source!.tableId && item.type === 'table',
    ) as TableElement | undefined;
    if (tbl && tbl.cells.length >= 2 && (tbl.cells[0]?.length ?? 0) >= 2) {
      const evaluated = evaluateTable(tbl.cells);
      const headerRow = evaluated[0];
      const labels: string[] = [];
      const seriesCount = Math.max(1, headerRow.length - 1);
      const series = Array.from({ length: seriesCount }, (_, si) => ({
        name: String(headerRow[si + 1] ?? `Series ${si + 1}`),
        values: [] as number[],
      }));
      for (let r = 1; r < evaluated.length; r++) {
        const row = evaluated[r];
        const lbl = String(row[0] ?? '').trim();
        if (!lbl && row.slice(1).every(v => String(v).trim() === '')) continue;
        labels.push(lbl || `Row ${r}`);
        for (let si = 0; si < seriesCount; si++) {
          const raw = row[si + 1];
          const num = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(/[^0-9.-]/g, ''));
          series[si].values.push(Number.isFinite(num) ? num : 0);
        }
      }
      if (labels.length > 0) return { labels, series };
    }
  }
  return el.data;
}

function fmtNum(v: number): string {
  if (Math.abs(v) >= 1000) return `${Number((v / 1000).toFixed(1))}k`;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function truncateText(text: string, maxW: number, fontSize: number, family: string, weight = 500): string {
  if (maxW <= 4) return '';
  const ctx = measurePrimCtx();
  ctx.font = `${weight} ${fontSize}px ${FONT_CSS_STACK(family)}`;
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW) {
    s = s.slice(0, -1);
  }
  return s.length < text.length ? `${s}…` : s;
}

function arcSegmentPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = cx + rOuter * Math.cos(a0);
  const y0 = cy + rOuter * Math.sin(a0);
  const x1 = cx + rOuter * Math.cos(a1);
  const y1 = cy + rOuter * Math.sin(a1);
  if (rInner <= 0.5) {
    return `M ${cx} ${cy} L ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1} Z`;
  }
  const ix0 = cx + rInner * Math.cos(a1);
  const iy0 = cy + rInner * Math.sin(a1);
  const ix1 = cx + rInner * Math.cos(a0);
  const iy1 = cy + rInner * Math.sin(a0);
  return `M ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1} L ${ix0} ${iy0} A ${rInner} ${rInner} 0 ${large} 0 ${ix1} ${iy1} Z`;
}

export function buildChartPrims(el: ChartElement, page?: Page): Prim[] {
  const { labels, series } = resolveChartData(el, page);
  const colors = el.colors?.length ? el.colors : DEFAULT_COLORS;
  const family = el.fontFamily || 'Inter';
  const ink = el.textColor || '#14130F';
  const muted = '#7A756B';
  const gridColor = 'rgba(20, 19, 15, 0.12)';
  const prims: Prim[] = [];

  const W = Math.max(80, el.w);
  const H = Math.max(80, el.h);
  const fontSize = Math.max(10, Math.min(14, Math.round(Math.min(W, H) * 0.042)));
  const legendH = el.showLegend && series.length > 0 && el.chartKind !== 'progress' ? fontSize * 2.1 : 0;

  // Legend along top
  if (legendH > 0) {
    const items = el.chartKind === 'pie' || el.chartKind === 'donut' ? labels : series.map(s => s.name);
    let lx = 14;
    const ly = 12;
    items.forEach((name, idx) => {
      if (lx > W - 50) return;
      const c = colors[idx % colors.length];
      prims.push({ k: 'rect', x: lx, y: ly, w: 10, h: 10, r: 3, fill: c });
      const label = truncateText(name, Math.max(36, (W - 28) / items.length - 18), fontSize, family);
      prims.push({
        k: 'text',
        x: lx + 15,
        y: ly + 5,
        text: label,
        size: fontSize,
        family,
        weight: 500,
        color: ink,
        anchor: 'start',
        baseline: 'middle',
      });
      lx += Math.min(120, Math.max(58, label.length * fontSize * 0.62 + 26));
    });
  }

  // Progress Ring
  if (el.chartKind === 'progress') {
    const val = Math.max(0, Math.min(100, series[0]?.values[0] ?? 72));
    const cx = W / 2;
    const cy = H / 2;
    const rOuter = Math.max(16, Math.min(W, H) * 0.42);
    const strokeW = Math.max(8, rOuter * 0.22);
    const rInner = Math.max(6, rOuter - strokeW);
    prims.push({
      k: 'circle',
      cx,
      cy,
      r: (rOuter + rInner) / 2,
      stroke: 'rgba(20, 19, 15, 0.1)',
      sw: strokeW,
    });
    if (val > 0) {
      const span = Math.min(Math.PI * 1.999, (val / 100) * Math.PI * 2);
      prims.push({
        k: 'path',
        d: arcSegmentPath(cx, cy, rOuter, rInner, -Math.PI / 2, -Math.PI / 2 + span),
        fill: colors[0],
      });
    }
    if (el.showValues) {
      prims.push({
        k: 'text',
        x: cx,
        y: cy - (labels[0] ? fontSize * 0.4 : 0),
        text: `${Math.round(val)}%`,
        size: Math.max(16, Math.round(rInner * 0.56)),
        family,
        weight: 700,
        color: ink,
        anchor: 'middle',
        baseline: 'middle',
      });
    }
    if (labels[0]) {
      prims.push({
        k: 'text',
        x: cx,
        y: cy + fontSize * 1.25,
        text: truncateText(labels[0], rInner * 1.6, fontSize, family),
        size: fontSize,
        family,
        weight: 500,
        color: muted,
        anchor: 'middle',
        baseline: 'middle',
      });
    }
    return prims;
  }

  // Pie & Donut
  if (el.chartKind === 'pie' || el.chartKind === 'donut') {
    const vals = (series[0]?.values ?? []).map(v => Math.max(0, v));
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    const availH = H - legendH - 16;
    const availW = W - 16;
    const rOuter = Math.max(20, Math.min(availW, availH) * 0.44);
    const rInner = el.chartKind === 'donut' ? rOuter * 0.54 : 0;
    const cx = W / 2;
    const cy = legendH + availH / 2 + 4;
    let angle = -Math.PI / 2;

    vals.forEach((v, i) => {
      const frac = v / total;
      const next = angle + Math.max(0.002, frac * Math.PI * 2);
      const mid = (angle + next) / 2;
      prims.push({
        k: 'path',
        d: arcSegmentPath(cx, cy, rOuter, rInner, angle, next === angle + Math.PI * 2 ? next - 0.001 : next),
        fill: colors[i % colors.length],
        stroke: '#FFFFFF',
        sw: 1.5,
      });
      if (el.showValues && frac > 0.06) {
        const lr = rInner > 0 ? (rOuter + rInner) / 2 : rOuter * 0.65;
        prims.push({
          k: 'text',
          x: cx + lr * Math.cos(mid),
          y: cy + lr * Math.sin(mid),
          text: `${Math.round(frac * 100)}%`,
          size: fontSize,
          family,
          weight: 700,
          color: '#FFFFFF',
          anchor: 'middle',
          baseline: 'middle',
        });
      }
      angle = next;
    });

    if (el.chartKind === 'donut') {
      prims.push({
        k: 'text',
        x: cx,
        y: cy,
        text: fmtNum(total),
        size: Math.max(14, Math.round(rInner * 0.46)),
        family,
        weight: 700,
        color: ink,
        anchor: 'middle',
        baseline: 'middle',
      });
    }
    return prims;
  }

  // Cartesian charts: bar (horizontal), column (vertical), line, area
  const padL = el.chartKind === 'bar' ? Math.min(96, W * 0.24) : Math.min(48, W * 0.14);
  const padR = 16;
  const padT = legendH + 14;
  const padB = fontSize * 2.3;
  const plotW = Math.max(24, W - padL - padR);
  const plotH = Math.max(24, H - padT - padB);
  const allVals = series.flatMap(s => s.values);
  const maxVal = Math.max(1, ...allVals, 0);
  const count = Math.max(1, labels.length);
  const nSeries = Math.max(1, series.length);

  if (el.chartKind === 'bar') {
    const ticks = 4;
    for (let t = 0; t <= ticks; t++) {
      const gx = padL + (plotW * t) / ticks;
      if (el.showGrid) {
        prims.push({ k: 'path', d: `M ${gx} ${padT} L ${gx} ${padT + plotH}`, stroke: gridColor, sw: 1 });
      }
      prims.push({
        k: 'text',
        x: gx,
        y: padT + plotH + fontSize * 1.2,
        text: fmtNum((maxVal * t) / ticks),
        size: fontSize - 1,
        family,
        weight: 500,
        color: muted,
        anchor: 'middle',
        baseline: 'middle',
      });
    }
    const slotH = plotH / count;
    const groupH = slotH * 0.72;
    const barH = Math.max(4, (groupH - (nSeries - 1) * 3) / nSeries);
    labels.forEach((lbl, idx) => {
      const yBase = padT + idx * slotH + (slotH - groupH) / 2;
      prims.push({
        k: 'text',
        x: padL - 8,
        y: padT + idx * slotH + slotH / 2,
        text: truncateText(lbl, padL - 14, fontSize, family),
        size: fontSize,
        family,
        weight: 500,
        color: ink,
        anchor: 'end',
        baseline: 'middle',
      });
      series.forEach((s, si) => {
        const val = Math.max(0, s.values[idx] ?? 0);
        const bw = (val / maxVal) * plotW;
        const by = yBase + si * (barH + 3);
        prims.push({
          k: 'rect',
          x: padL,
          y: by,
          w: bw,
          h: barH,
          r: Math.min(5, barH / 2),
          fill: colors[si % colors.length],
        });
        if (el.showValues) {
          prims.push({
            k: 'text',
            x: Math.min(padL + plotW - 4, padL + bw + 6),
            y: by + barH / 2,
            text: fmtNum(val),
            size: fontSize - 1,
            family,
            weight: 600,
            color: ink,
            anchor: 'start',
            baseline: 'middle',
          });
        }
      });
    });
    return prims;
  }

  // Column, Line, Area
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const gy = padT + plotH - (plotH * t) / ticks;
    if (el.showGrid) {
      prims.push({ k: 'path', d: `M ${padL} ${gy} L ${padL + plotW} ${gy}`, stroke: gridColor, sw: 1 });
    }
    prims.push({
      k: 'text',
      x: padL - 6,
      y: gy,
      text: fmtNum((maxVal * t) / ticks),
      size: fontSize - 1,
      family,
      weight: 500,
      color: muted,
      anchor: 'end',
      baseline: 'middle',
    });
  }

  const slotW = plotW / count;
  labels.forEach((lbl, idx) => {
    prims.push({
      k: 'text',
      x: padL + idx * slotW + slotW / 2,
      y: padT + plotH + fontSize * 1.2,
      text: truncateText(lbl, slotW * 0.9, fontSize, family),
      size: fontSize,
      family,
      weight: 500,
      color: ink,
      anchor: 'middle',
      baseline: 'middle',
    });
  });

  if (el.chartKind === 'column') {
    const groupW = slotW * 0.68;
    const barW = Math.max(4, (groupW - (nSeries - 1) * 4) / nSeries);
    labels.forEach((_, idx) => {
      const xBase = padL + idx * slotW + (slotW - groupW) / 2;
      series.forEach((s, si) => {
        const val = Math.max(0, s.values[idx] ?? 0);
        const bh = (val / maxVal) * plotH;
        const bx = xBase + si * (barW + 4);
        const by = padT + plotH - bh;
        prims.push({
          k: 'rect',
          x: bx,
          y: by,
          w: barW,
          h: bh,
          r: Math.min(6, barW / 2),
          fill: colors[si % colors.length],
        });
        if (el.showValues) {
          prims.push({
            k: 'text',
            x: bx + barW / 2,
            y: Math.max(padT + 6, by - 6),
            text: fmtNum(val),
            size: fontSize - 1,
            family,
            weight: 600,
            color: ink,
            anchor: 'middle',
            baseline: 'alphabetic',
          });
        }
      });
    });
    return prims;
  }

  // Line / Area
  series.forEach((s, si) => {
    const color = colors[si % colors.length];
    const pts = labels.map((_, idx) => {
      const val = Math.max(0, s.values[idx] ?? 0);
      const px = padL + idx * slotW + slotW / 2;
      const py = padT + plotH - (val / maxVal) * plotH;
      return { x: px, y: py, val };
    });
    if (!pts.length) return;
    const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    if (el.chartKind === 'area') {
      const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;
      prims.push({ k: 'path', d: areaD, fill: color, opacity: 0.18 });
    }
    prims.push({ k: 'path', d: lineD, stroke: color, sw: 3, cap: 'round', join: 'round' });
    pts.forEach(p => {
      prims.push({ k: 'circle', cx: p.x, cy: p.y, r: 4.5, fill: '#FFFFFF', stroke: color, sw: 2.5 });
      if (el.showValues) {
        prims.push({
          k: 'text',
          x: p.x,
          y: Math.max(padT + 8, p.y - 10),
          text: fmtNum(p.val),
          size: fontSize - 1,
          family,
          weight: 600,
          color: ink,
          anchor: 'middle',
          baseline: 'alphabetic',
        });
      }
    });
  });

  return prims;
}
