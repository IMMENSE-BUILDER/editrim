import type { BrandKit, DesignSize, El, Page, Paint, ShapeKind, TextElement } from './types';
import { FONTS } from './fonts';
import { measureTextHeight } from './render';
import { clamp } from './utils';
import { normalizeImage, normalizeShape, normalizeText } from './aiDesign';

const FONT_NAMES = new Set(FONTS.map(f => f.family));
const WEIGHTS = new Set([300, 400, 500, 600, 700, 800, 900]);
const SHAPES = new Set<ShapeKind>([
  'rect', 'ellipse', 'triangle', 'line', 'star', 'diamond', 'hexagon',
  'blob', 'heart', 'arrow', 'burst', 'wave', 'ring',
]);
const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+\s*)?\)|transparent)$/i;

const n = (v: unknown) => (typeof v === 'number' ? v : Number(v));
const str = (v: unknown, max = 800) => (typeof v === 'string' ? v.slice(0, max).trim() : '');
const isColor = (v: unknown): v is string => typeof v === 'string' && COLOR_RE.test(v.trim());

export type PreparedCommand =
  | { op: 'update'; id: string; patch: Partial<El>; label: string }
  | { op: 'delete'; id: string; label: string }
  | { op: 'add'; element: El; label: string }
  | { op: 'reorder'; id: string; position: 'front' | 'back' | 'forward' | 'backward'; label: string };

export type EditPlan = {
  summary: string;
  commands: PreparedCommand[];
  warnings: string[];
};

function resolveElement(id: string, page: Page): El | null {
  const direct = page.elements.find(e => e.id === id);
  if (direct) return direct;
  const numeric = id.replace(/^#/, '');
  if (/^\d+$/.test(numeric)) {
    return page.elements[Number(numeric) - 1] ?? null;
  }
  return null;
}

function flatten(command: Record<string, unknown>) {
  const set = command.set && typeof command.set === 'object' ? (command.set as Record<string, unknown>) : {};
  return { ...command, ...set };
}

function sanitizePatch(target: El, raw: Record<string, unknown>, pageSize: DesignSize): Partial<El> {
  const patch: Record<string, unknown> = {};
  const source = flatten(raw);

  const x = n(source.x);
  const y = n(source.y);
  const w = n(source.w);
  const h = n(source.h);
  if (Number.isFinite(x)) patch.x = clamp(x, -pageSize.width * 0.2, pageSize.width);
  if (Number.isFinite(y)) patch.y = clamp(y, -pageSize.height * 0.2, pageSize.height);
  if (Number.isFinite(w)) patch.w = clamp(w, 4, pageSize.width * 1.5);
  if (Number.isFinite(h)) patch.h = clamp(h, 2, pageSize.height * 1.5);
  if (Number.isFinite(n(source.rotation))) patch.rotation = clamp(n(source.rotation), -180, 180);
  if (Number.isFinite(n(source.opacity))) patch.opacity = clamp(n(source.opacity), 0.05, 1);

  if (target.type === 'text') {
    const text = str(source.text ?? source.content, 600);
    if (text) patch.text = text;
    const font = source.fontFamily ?? source.font;
    if (typeof font === 'string' && FONT_NAMES.has(font)) patch.fontFamily = font;
    const size = n(source.fontSize ?? source.size);
    if (Number.isFinite(size)) patch.fontSize = clamp(size, 8, Math.min(pageSize.width, pageSize.height) * 0.45);
    const weight = n(source.fontWeight ?? source.weight);
    if (WEIGHTS.has(weight)) patch.fontWeight = weight;
    if (isColor(source.color)) patch.color = source.color;
    if (['left', 'center', 'right'].includes(String(source.align))) patch.align = source.align;
    if (Number.isFinite(n(source.lineHeight))) patch.lineHeight = clamp(n(source.lineHeight), 0.8, 2.2);
    if (Number.isFinite(n(source.letterSpacing))) patch.letterSpacing = clamp(n(source.letterSpacing), -12, 40);
    if (typeof source.uppercase === 'boolean') patch.uppercase = source.uppercase;
    if (typeof source.italic === 'boolean') patch.italic = source.italic;
    const finalX = Number.isFinite(n(patch.x)) ? n(patch.x) : target.x;
    const finalW = Number.isFinite(n(patch.w)) ? n(patch.w) : target.w;
    if (finalX + finalW > pageSize.width - 4) {
      patch.w = Math.max(40, pageSize.width - finalX - 4);
    }
  }

  if (target.type === 'shape') {
    if (isColor(source.fill)) patch.fill = { kind: 'solid', color: source.fill } satisfies Paint;
    else if (source.fill && typeof source.fill === 'object') {
      const f = source.fill as Record<string, unknown>;
      if (f.kind === 'linear' && isColor(f.from) && isColor(f.to)) {
        patch.fill = { kind: 'linear', from: f.from, to: f.to, angle: clamp(n(f.angle) || 135, 0, 360) } satisfies Paint;
      }
    }
    if (isColor(source.stroke)) patch.stroke = source.stroke;
    if (Number.isFinite(n(source.strokeWidth))) patch.strokeWidth = clamp(n(source.strokeWidth), 0, 30);
    if (Number.isFinite(n(source.radius))) patch.radius = clamp(n(source.radius), 0, 500);
    if (longString(source.shape) && SHAPES.has(source.shape as ShapeKind)) patch.shape = source.shape;
  }

  if (target.type === 'image') {
    if (Number.isFinite(n(source.radius))) patch.radius = clamp(n(source.radius), 0, 1000);
    if (source.fit === 'cover' || source.fit === 'contain') patch.fit = source.fit;
    if (typeof source.flipX === 'boolean') patch.flipX = source.flipX;
    if (typeof source.flipY === 'boolean') patch.flipY = source.flipY;
  }

  return patch as Partial<El>;
}

function longString(v: unknown) {
  return typeof v === 'string' && v.length > 0;
}

function fitTextAfterPatch(target: TextElement, patch: Partial<El>, pageSize: DesignSize): Partial<El> {
  const merged: TextElement = { ...target, ...(patch as Partial<TextElement>) };
  let needed = measureTextHeight(merged);
  const maxH = Math.max(30, pageSize.height - Math.max(0, merged.y) - pageSize.height * 0.02);
  if (needed <= merged.h) return patch;
  if (needed <= maxH) return { ...patch, h: Math.ceil(needed) };
  let fontSize = merged.fontSize;
  let guard = 0;
  while (needed > maxH && fontSize > 9 && guard < 16) {
    fontSize = Math.max(9, fontSize * 0.92);
    needed = measureTextHeight({ ...merged, fontSize });
    guard++;
  }
  return { ...patch, fontSize, h: Math.ceil(Math.min(needed, maxH)) };
}

function addFromCommand(command: Record<string, unknown>, size: DesignSize, brand: BrandKit): { element: El; label: string } | null {
  const raw = flatten(command);
  if (raw.type === 'text' || command.op === 'add_text') {
    raw.type = 'text';
    const el = normalizeText(raw, size, brand);
    return el ? { element: el, label: `Add text “${el.text.slice(0, 46)}${el.text.length > 46 ? '…' : ''}”` } : null;
  }
  if (raw.type === 'image' || command.op === 'add_image') {
    const el = normalizeImage(raw, size);
    return el ? { element: el, label: `Add photo “${raw.photo ?? 'image'}”` } : null;
  }
  if (raw.type === 'shape' || command.op === 'add_shape') {
    const el = normalizeShape(raw, size);
    return el ? { element: el, label: `Add ${el.shape} shape` } : null;
  }
  return null;
}

export function normalizeEditPlan(
  raw: unknown,
  page: Page,
  size: DesignSize,
  brand: BrandKit,
): EditPlan {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const rawCommands = Array.isArray(data.commands) ? data.commands.slice(0, 8) : [];
  const commands: PreparedCommand[] = [];
  const warnings: string[] = [];
  let deleteCount = 0;

  for (const item of rawCommands) {
    if (!item || typeof item !== 'object') continue;
    const cmd = item as Record<string, unknown>;
    const op = str(cmd.op, 30);
    const id = str(cmd.id ?? cmd.targetId, 80);

    if (op === 'update') {
      const target = resolveElement(id, page);
      if (!target) {
        warnings.push(`Skipped an edit to an unknown element${id ? ` (${id})` : ''}.`);
        continue;
      }
      if (target.locked) {
        warnings.push(`Skipped locked element “${target.name}”.`);
        continue;
      }
      let patch = sanitizePatch(target, cmd, size);
      if (!Object.keys(patch).length) {
        warnings.push(`Skipped an empty edit to “${target.name}”.`);
        continue;
      }
      if (target.type === 'text') patch = fitTextAfterPatch(target, patch, size);
      const fields = Object.keys(patch).slice(0, 4).join(', ');
      commands.push({ op: 'update', id: target.id, patch, label: `Update “${target.name}” — ${fields}` });
    } else if (op === 'delete') {
      const target = resolveElement(id, page);
      if (!target) {
        warnings.push(`Skipped deleting an unknown element${id ? ` (${id})` : ''}.`);
        continue;
      }
      if (target.locked) {
        warnings.push(`Skipped locked element “${target.name}”.`);
        continue;
      }
      if (deleteCount >= 2) {
        warnings.push('Limited deletions to two elements for safety.');
        continue;
      }
      deleteCount++;
      commands.push({ op: 'delete', id: target.id, label: `Delete “${target.name}”` });
    } else if (op === 'add_text' || op === 'add_shape' || op === 'add_image') {
      const added = addFromCommand(cmd, size, brand);
      if (!added) {
        warnings.push(`Skipped an invalid ${op.replace('add_', '')} command.`);
        continue;
      }
      commands.push({ op: 'add', element: added.element, label: added.label });
    } else if (op === 'reorder') {
      const target = resolveElement(id, page);
      if (!target) {
        warnings.push(`Skipped reordering an unknown element${id ? ` (${id})` : ''}.`);
        continue;
      }
      const position = ['front', 'back', 'forward', 'backward'].includes(String(cmd.position))
        ? (cmd.position as 'front' | 'back' | 'forward' | 'backward')
        : 'front';
      commands.push({ op: 'reorder', id: target.id, position, label: `Move “${target.name}” ${position}` });
    } else {
      warnings.push(`Skipped unsupported command “${op || 'unknown'}”.`);
    }
  }

  if (!commands.length) {
    throw new Error('The AI did not propose any safe changes. Try a more specific instruction.');
  }

  return {
    summary: str(data.summary, 800) || `${commands.length} changes proposed.`,
    commands,
    warnings,
  };
}

export function applyEditPlan(page: Page, plan: EditPlan): Page {
  let elements = [...page.elements];
  for (const command of plan.commands) {
    if (command.op === 'update') {
      elements = elements.map(el => (el.id === command.id ? ({ ...el, ...command.patch } as El) : el));
    } else if (command.op === 'delete') {
      elements = elements.filter(el => el.id !== command.id);
    } else if (command.op === 'add') {
      elements.push(command.element);
    } else if (command.op === 'reorder') {
      const index = elements.findIndex(e => e.id === command.id);
      if (index === -1) continue;
      const [el] = elements.splice(index, 1);
      if (command.position === 'front') elements.push(el);
      else if (command.position === 'back') elements.unshift(el);
      else if (command.position === 'forward') elements.splice(Math.min(elements.length, index + 1), 0, el);
      else elements.splice(Math.max(0, index - 1), 0, el);
    }
  }
  return { ...page, elements };
}

export function summarizePlan(plan: EditPlan): string {
  return plan.commands.length === 1 ? '1 change' : `${plan.commands.length} changes`;
}
