import type { Background, IconElement, ImageElement, ImageFilters, Page, Paint, ShapeElement, ShapeKind, Template, TextElement } from './types';
import type { Shadow } from './types';
import { uid } from './utils';

/* ---------- helpers ---------- */

export const P = (color: string): Paint => ({ kind: 'solid', color });
export const G = (from: string, to: string, angle = 135): Paint => ({ kind: 'linear', from, to, angle });
export const NONE: Paint = { kind: 'none' };
export const bgSolid = (color: string): Background => ({ kind: 'solid', color });
export const bgGrad = (from: string, to: string, angle = 135): Background => ({ kind: 'linear', from, to, angle });
export const bgImage = (src: string, overlay?: string, overlayOpacity = 0.4): Background => ({
  kind: 'image',
  src,
  overlay,
  overlayOpacity,
});

type TextOpts = Partial<Omit<TextElement, 'type' | 'id' | 'x' | 'y' | 'w' | 'h' | 'text'>>;
function T(text: string, x: number, y: number, w: number, h: number, opts: TextOpts = {}): TextElement {
  return {
    id: uid('t'),
    type: 'text',
    name: opts.name ?? (text.slice(0, 24).replace(/\n/g, ' ') || 'Text'),
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    text,
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: 400,
    color: '#14130F',
    align: 'left',
    valign: 'top',
    lineHeight: 1.2,
    letterSpacing: 0,
    shadow: null,
    ...opts,
  };
}

type ShapeOpts = Omit<Partial<ShapeElement>, 'fill'> & { fill?: Paint | string };
function S(shape: ShapeKind, x: number, y: number, w: number, h: number, opts: ShapeOpts = {}): ShapeElement {
  const { fill, ...rest } = opts;
  return {
    id: uid('s'),
    type: 'shape',
    name: opts.name ?? shape[0].toUpperCase() + shape.slice(1),
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    shape,
    fill: typeof fill === 'string' ? P(fill) : fill ?? P('#14130F'),
    stroke: 'transparent',
    strokeWidth: 0,
    radius: 0,
    shadow: null,
    ...rest,
  };
}

const FILTERS: ImageFilters = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 };
type ImageOpts = Partial<Omit<ImageElement, 'type' | 'id' | 'x' | 'y' | 'w' | 'h' | 'src'>>;
function IMG(src: string, x: number, y: number, w: number, h: number, opts: ImageOpts = {}): ImageElement {
  return {
    id: uid('i'),
    type: 'image',
    name: opts.name ?? 'Image',
    x, y, w, h,
    rotation: 0,
    opacity: 1,
    src,
    fit: 'cover',
    radius: 0,
    filters: { ...FILTERS },
    shadow: null,
    ...opts,
  };
}

function IC(icon: string, x: number, y: number, size: number, color: string, strokeWidth = 1.7, opts: Partial<IconElement> = {}): IconElement {
  return {
    id: uid('ic'),
    type: 'icon',
    name: icon,
    x, y, w: size, h: size,
    rotation: 0,
    opacity: 1,
    icon,
    color,
    strokeWidth,
    shadow: null,
    ...opts,
  };
}

const SH = (x: number, y: number, blur: number, color: string): Shadow => ({ x, y, blur, color });

function page(name: string, background: Background, elements: (TextElement | ShapeElement | ImageElement | IconElement)[]): Page {
  return { id: uid('p'), name, background, elements };
}

/* ---------- stable image URLs (Unsplash, CORS-enabled) ---------- */
const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
const IMG_COFFEE = U('photo-1495474472287-4d71bcdd2085');
const IMG_WATCH = U('photo-1523275335684-37898b6baf30');
const IMG_SHOE = U('photo-1542291026-7eec264c27ff');
const IMG_MOUNTAIN = U('photo-1464822759023-fed622ff2c3b');
const IMG_TOMATO = U('photo-1592924357228-91a4daadcfea');
const IMG_INTERIOR = U('photo-1616486338812-3dadae4b4ace');
const IMG_ARCH = U('photo-1487958449943-2429e8be8625');
const IMG_CITY = U('photo-1477959858617-67f85cf4f1df');
const IMG_ATHLETE = U('photo-1517836357463-d25dfeac3438');
const IMG_PORTRAIT = U('photo-1494790108377-be9c29b29330');
const IMG_CONCERT = U('photo-1470229722913-7c0e2dbbafd3');
const IMG_FLOWERS = U('photo-1490750967868-88aa4486c946');
const IMG_FOOD = U('photo-1504674900247-0877df9cc836');
const IMG_OFFICE = U('photo-1497366754035-f200968a6e72');

const INK = '#14130F';
const PAPER = '#F4F1EA';
const CREAM = '#F7F0E3';
const COBALT = '#2440F0';
const LIME = '#D8F55A';
const CORAL = '#FF6A46';

/* ---------- 01. Café opening ---------- */
const cafe = page('Cover', bgImage(IMG_COFFEE, '#15110B', 0.5), [
  S('line', 80, 150, 920, 1, { fill: NONE, stroke: 'rgba(247,240,227,.45)', strokeWidth: 1 }),
  T('NOW OPEN  ·  EST. 2026', 80, 88, 500, 32, {
    fontSize: 22, letterSpacing: 3.4, color: 'rgba(247,240,227,.85)', fontWeight: 500,
  }),
  T('Bruma', 72, 195, 940, 190, {
    fontFamily: 'Instrument Serif', fontSize: 184, lineHeight: 1, color: CREAM, letterSpacing: -3,
  }),
  T('COFFEE  &  BREAD', 86, 390, 600, 40, {
    fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 7, color: LIME,
  }),
  T('A slower kind of morning,\non the corner of Mill Lane.', 82, 690, 660, 180, {
    fontFamily: 'Instrument Serif', fontSize: 62, lineHeight: 1.12, color: CREAM,
  }),
  T('12 MILL LANE\nOPEN 7 — 5, EVERY DAY', 760, 810, 240, 80, {
    fontSize: 17, letterSpacing: 1.8, lineHeight: 1.7, color: 'rgba(247,240,227,.86)', align: 'right',
  }),
  S('ellipse', 812, 566, 168, 168, { fill: LIME }),
  T('NEW', 812, 632, 168, 40, {
    fontFamily: 'Archivo Black', fontSize: 30, color: INK, align: 'center', rotation: -8,
  }),
  T('BRUMA', 80, 1000, 300, 30, {
    fontSize: 15, letterSpacing: 5, color: 'rgba(247,240,227,.7)',
  }),
]);

/* ---------- 02. Product launch ---------- */
const product = page('Cover', bgSolid('#EDE8DC'), [
  S('rect', 566, 84, 448, 654, { fill: LIME, radius: 224, rotation: 7 }),
  IMG(IMG_WATCH, 596, 144, 388, 540, { radius: 194 }),
  S('rect', 70, 108, 210, 42, { fill: NONE, stroke: INK, strokeWidth: 1.5, radius: 21 }),
  T('NEW RELEASE', 70, 119, 210, 22, { fontSize: 13, letterSpacing: 2.6, align: 'center', fontWeight: 600 }),
  T('FORM', 66, 188, 520, 160, { fontFamily: 'Archivo Black', fontSize: 152, lineHeight: 0.9, letterSpacing: -6 }),
  T('04', 66, 320, 300, 160, { fontFamily: 'Archivo Black', fontSize: 152, lineHeight: 0.9, letterSpacing: -6, color: COBALT }),
  T('The watch that disappears\non your wrist.', 72, 512, 430, 140, {
    fontFamily: 'Instrument Serif', fontSize: 54, lineHeight: 1.12, letterSpacing: -0.5,
  }),
  T('Brushed titanium · Sapphire glass · 40mm', 72, 684, 430, 30, { fontSize: 16, letterSpacing: 0.6, color: '#4F4B42' }),
  S('line', 72, 884, 936, 1, { fill: NONE, stroke: 'rgba(20,19,15,.22)', strokeWidth: 1 }),
  T('€249', 72, 910, 200, 54, { fontSize: 34, fontWeight: 700 }),
  T('SHIPS WORLDWIDE', 270, 922, 300, 30, { fontSize: 13, letterSpacing: 2.2, color: '#4F4B42' }),
  T('EXPLORE THE COLLECTION  →', 624, 922, 384, 30, { fontSize: 13, letterSpacing: 2.2, align: 'right', fontWeight: 600 }),
  S('star', 868, 596, 70, 70, { fill: CORAL }),
]);

/* ---------- 03. Quote ---------- */
const quote = page('Cover', bgSolid('#F5F1E7'), [
  S('ellipse', 860, -130, 360, 360, { fill: CORAL, opacity: 0.92 }),
  S('rect', 80, 120, 14, 840, { fill: LIME }),
  T('“', 116, 40, 300, 300, { fontFamily: 'Instrument Serif', fontSize: 300, color: CORAL, lineHeight: 1 }),
  T('Make it simple,\nbut significant.', 150, 330, 830, 340, {
    fontFamily: 'Instrument Serif', fontSize: 122, lineHeight: 1.01, letterSpacing: -2.5, color: INK,
  }),
  T('A note on good design', 154, 720, 500, 40, { fontSize: 19, letterSpacing: 3.5, color: '#6B675D' }),
  S('line', 152, 810, 280, 1, { fill: NONE, stroke: INK, strokeWidth: 1.5 }),
  T('VELLUM STUDIO / VOL. 01', 152, 840, 500, 30, { fontSize: 14, letterSpacing: 2.8, color: '#6B675D' }),
  IC('star', 854, 792, 70, INK, 1.4),
]);

/* ---------- 04. Flash sale story ---------- */
const sale = page('Cover', bgSolid(CORAL), [
  T('VELVET & VINE  /  MIDSEASON', 76, 100, 800, 30, { fontSize: 18, letterSpacing: 3.4, color: '#2A0E07', fontWeight: 500 }),
  T('FLASH', 68, 300, 944, 250, { fontFamily: 'Archivo Black', fontSize: 250, lineHeight: 0.86, letterSpacing: -10, color: CREAM }),
  T('SALE', 68, 480, 944, 250, { fontFamily: 'Archivo Black', fontSize: 250, lineHeight: 0.86, letterSpacing: -10, color: CREAM }),
  T('50%', 68, 730, 600, 240, { fontFamily: 'Bebas Neue', fontSize: 260, lineHeight: 0.9, color: INK }),
  T('OFF\nEVERYTHING', 520, 800, 420, 160, { fontFamily: 'Bebas Neue', fontSize: 78, lineHeight: 0.96, letterSpacing: 1, color: INK }),
  S('line', 76, 1000, 928, 1, { fill: NONE, stroke: 'rgba(20,19,15,.45)', strokeWidth: 1 }),
  T('48 HOURS ONLY', 76, 1030, 500, 36, { fontSize: 22, letterSpacing: 4, fontWeight: 700 }),
  T('ONLINE + IN STORE', 660, 1030, 340, 36, { fontSize: 18, letterSpacing: 2.4, align: 'right' }),
  IMG(IMG_SHOE, 76, 1170, 280, 330, { radius: 6, filters: { ...FILTERS, saturate: 60 } }),
  IMG(IMG_WATCH, 396, 1170, 280, 330, { radius: 6 }),
  IMG(IMG_FLOWERS, 716, 1170, 288, 330, { radius: 6 }),
  S('rect', 76, 1580, 560, 92, { fill: INK, radius: 46 }),
  T('SHOP THE SALE  →', 76, 1605, 560, 44, { fontSize: 20, letterSpacing: 2.4, color: CREAM, align: 'center', fontWeight: 600 }),
  T('Use code  FLASH50  at checkout', 700, 1660, 300, 30, { fontSize: 15, letterSpacing: 1.2, align: 'right', color: '#2A0E07' }),
  T('VELVET & VINE', 76, 1790, 500, 30, { fontSize: 14, letterSpacing: 5, color: 'rgba(20,19,15,.55)' }),
]);

/* ---------- 05. Travel story ---------- */
const travel = page('Cover', bgImage(IMG_MOUNTAIN, '#05080A', 0.18), [
  S('rect', 0, 0, 1080, 620, { fill: G('rgba(5,8,10,.72)', 'rgba(5,8,10,0)', 180) }),
  S('rect', 0, 1080, 1080, 840, { fill: G('rgba(5,8,10,0)', 'rgba(5,8,10,.82)', 0) }),
  T('FIELD NOTES  /  03', 74, 90, 500, 30, { fontSize: 18, letterSpacing: 4, color: 'rgba(255,255,255,.86)' }),
  T('NORTH', 66, 220, 940, 190, { fontFamily: 'Bebas Neue', fontSize: 230, letterSpacing: 4, lineHeight: 0.9, color: '#FFFFFF' }),
  T('COAST', 66, 390, 940, 190, { fontFamily: 'Bebas Neue', fontSize: 230, letterSpacing: 4, lineHeight: 0.9, color: '#FFFFFF' }),
  T('Seven days above the treeline.', 74, 620, 700, 60, { fontFamily: 'Instrument Serif', fontSize: 46, color: '#FFFFFF' }),
  S('line', 74, 1310, 120, 2, { fill: NONE, stroke: LIME, strokeWidth: 2 }),
  T('The long way north', 74, 1340, 800, 110, { fontFamily: 'Instrument Serif', fontSize: 88, color: '#FFFFFF', lineHeight: 1 }),
  T('A field guide to slow mornings, cold water and the\nquietest road in the country.', 76, 1470, 780, 100, {
    fontFamily: 'Inter', fontSize: 26, lineHeight: 1.55, color: 'rgba(255,255,255,.78)',
  }),
  T('LOCATION  64.1466° N, 21.9426° W', 76, 1710, 700, 26, { fontSize: 14, letterSpacing: 2.2, color: 'rgba(255,255,255,.6)' }),
  T('SWIPE  →', 840, 1710, 160, 26, { fontSize: 14, letterSpacing: 2.4, color: LIME, align: 'right' }),
]);

/* ---------- 06. Recipe story ---------- */
const recipe = page('Cover', bgSolid('#F3ECDD'), [
  IMG(IMG_TOMATO, 0, 0, 1080, 740),
  S('ellipse', 842, 640, 168, 168, { fill: CORAL }),
  T('RECIPE / 07', 842, 714, 168, 26, { fontSize: 14, letterSpacing: 2.6, color: CREAM, align: 'center' }),
  T('Tomato, basil &\na little patience.', 76, 806, 900, 230, {
    fontFamily: 'Instrument Serif', fontSize: 105, lineHeight: 1.02, letterSpacing: -2, color: '#201D16',
  }),
  T('SERVES 4   ·   35 MINUTES   ·   ONE PAN', 80, 1060, 700, 28, { fontSize: 15, letterSpacing: 2.6, color: '#6B675D' }),
  S('line', 80, 1112, 920, 1, { fill: NONE, stroke: 'rgba(32,29,22,.22)', strokeWidth: 1 }),
  T('INGREDIENTS', 80, 1150, 400, 26, { fontSize: 14, letterSpacing: 3, fontWeight: 700 }),
  T('6 ripe tomatoes\n1 head of garlic\nA good handful of basil\nOlive oil, salt, pepper\n200g stale bread', 80, 1192, 430, 300, {
    fontSize: 25, lineHeight: 1.65, color: '#3A372F',
  }),
  T('METHOD', 580, 1150, 400, 26, { fontSize: 14, letterSpacing: 3, fontWeight: 700 }),
  T('Halve the tomatoes. Tear the bread.\nWarm the oil, add garlic until golden.\nSimmer everything for 25 minutes.\nFinish with basil and a lot of pepper.', 580, 1192, 420, 300, {
    fontSize: 23, lineHeight: 1.65, color: '#3A372F',
  }),
  S('line', 80, 1540, 920, 1, { fill: NONE, stroke: 'rgba(32,29,22,.22)', strokeWidth: 1 }),
  T('BRUMA KITCHEN', 80, 1570, 400, 26, { fontSize: 13, letterSpacing: 4, color: '#6B675D' }),
  T('EAT SLOWLY', 700, 1570, 300, 26, { fontSize: 13, letterSpacing: 4, color: '#6B675D', align: 'right' }),
]);

/* ---------- 07. Pitch deck ---------- */
const pitch1 = page('Title', bgSolid(COBALT), [
  S('ellipse', 1480, -300, 760, 760, { fill: LIME, opacity: 0.96 }),
  S('ellipse', 1500, 600, 420, 420, { fill: NONE, stroke: 'rgba(255,255,255,.35)', strokeWidth: 2 }),
  T('PORTER  /  SEED ROUND 2026', 120, 96, 800, 30, { fontSize: 18, letterSpacing: 4, color: LIME }),
  T('The operating system\nfor independent cafés.', 112, 300, 1380, 420, {
    fontFamily: 'Bricolage Grotesque', fontSize: 108, lineHeight: 0.98, letterSpacing: -4, color: '#FFFFFF', fontWeight: 700,
  }),
  T('One place for orders, stock, staff and the numbers that matter.', 120, 756, 880, 80, {
    fontSize: 27, lineHeight: 1.5, color: 'rgba(255,255,255,.78)',
  }),
  S('line', 120, 940, 1680, 1, { fill: NONE, stroke: 'rgba(255,255,255,.25)', strokeWidth: 1 }),
  T('CONFIDENTIAL', 120, 970, 400, 26, { fontSize: 13, letterSpacing: 3.4, color: 'rgba(255,255,255,.65)' }),
  T('APRIL 2026', 1520, 970, 280, 26, { fontSize: 13, letterSpacing: 3.4, color: 'rgba(255,255,255,.65)', align: 'right' }),
]);

const pitch2 = page('Problem', bgSolid(PAPER), [
  T('01  /  THE PROBLEM', 112, 96, 600, 30, { fontSize: 15, letterSpacing: 3.4, color: '#6B675D' }),
  T('Independent cafés run on\neleven different tools.', 112, 180, 1180, 220, {
    fontFamily: 'Bricolage Grotesque', fontSize: 84, lineHeight: 1.04, letterSpacing: -2.4, fontWeight: 700,
  }),
  T('€4.2B', 112, 520, 640, 240, { fontFamily: 'Instrument Serif', fontSize: 220, lineHeight: 1, letterSpacing: -4, color: COBALT }),
  T('lost every year to overstock, missed shifts and\nmanual reconciliation across small hospitality.', 720, 560, 980, 120, {
    fontSize: 26, lineHeight: 1.55, color: '#3A372F',
  }),
  S('line', 112, 800, 1696, 1, { fill: NONE, stroke: 'rgba(20,19,15,.2)', strokeWidth: 1 }),
  ...['68% still close the day on paper', '4.1 hrs/week lost to stock counts', '1 in 3 orders never reaches the kitchen'].flatMap((label, i) => [
    T(`0${i + 1}`, 112 + i * 570, 850, 120, 60, { fontSize: 30, fontWeight: 700, color: COBALT }),
    T(label, 112 + i * 570, 905, 460, 80, { fontSize: 24, lineHeight: 1.4, color: '#3A372F' }),
  ]),
  T('PORTER', 112, 1000, 300, 24, { fontSize: 12, letterSpacing: 3, color: '#6B675D' }),
  T('02', 1770, 1000, 60, 24, { fontSize: 12, letterSpacing: 2, color: '#6B675D', align: 'right' }),
]);

const pitch3 = page('Product', bgSolid(INK), [
  T('02  /  THE PRODUCT', 112, 96, 600, 30, { fontSize: 15, letterSpacing: 3.4, color: LIME }),
  T('One calm dashboard\nfor the whole morning.', 112, 180, 1000, 220, {
    fontFamily: 'Bricolage Grotesque', fontSize: 84, lineHeight: 1.04, letterSpacing: -2.4, color: PAPER, fontWeight: 700,
  }),
  S('rect', 1100, 160, 700, 500, { fill: '#1E1C16', radius: 18, stroke: 'rgba(255,255,255,.12)', strokeWidth: 1 }),
  S('rect', 1130, 190, 210, 130, { fill: '#2A2820', radius: 12 }),
  S('rect', 1360, 190, 210, 130, { fill: '#2A2820', radius: 12 }),
  S('rect', 1590, 190, 180, 130, { fill: '#2A2820', radius: 12 }),
  T('TODAY', 1150, 215, 180, 24, { fontSize: 12, letterSpacing: 2, color: '#9B9689' }),
  T('€1,284', 1150, 245, 180, 50, { fontSize: 36, fontWeight: 700, color: PAPER }),
  T('ORDERS', 1380, 215, 180, 24, { fontSize: 12, letterSpacing: 2, color: '#9B9689' }),
  T('86', 1380, 245, 180, 50, { fontSize: 36, fontWeight: 700, color: PAPER }),
  T('COVERS', 1610, 215, 150, 24, { fontSize: 12, letterSpacing: 2, color: '#9B9689' }),
  T('124', 1610, 245, 150, 50, { fontSize: 36, fontWeight: 700, color: LIME }),
  S('line', 1130, 360, 640, 1, { fill: NONE, stroke: 'rgba(255,255,255,.12)', strokeWidth: 1 }),
  ...[0, 1, 2, 3].flatMap(i => [
    T(['FLAT WHITE', 'CROISSANT', 'COLD BREW', 'SOURDOUGH'][i], 1130, 390 + i * 62, 300, 30, { fontSize: 16, color: 'rgba(244,241,234,.75)' }),
    T(['12', '18', '9', '7'][i], 1690, 390 + i * 62, 80, 30, { fontSize: 16, color: 'rgba(244,241,234,.75)', align: 'right' }),
  ]),
  ...[
    ['01', 'Service, simplified.', 'Orders land in one queue. No tablets, no shouting.'],
    ['02', 'Stock that counts itself.', 'Every sale updates the shelf in real time.'],
    ['03', 'Numbers by 6am.', 'Yesterday, costed and reconciled before open.'],
  ].flatMap(([n, title, body], i) => [
    T(n, 112 + i * 570, 710, 80, 50, { fontSize: 26, fontWeight: 700, color: LIME }),
    T(title, 112 + i * 570, 760, 460, 40, { fontSize: 30, fontWeight: 600, color: PAPER }),
    T(body, 112 + i * 570, 810, 460, 80, { fontSize: 21, lineHeight: 1.5, color: 'rgba(244,241,234,.6)' }),
  ]),
  T('PORTER', 112, 1000, 300, 24, { fontSize: 12, letterSpacing: 3, color: 'rgba(244,241,234,.5)' }),
  T('03', 1770, 1000, 60, 24, { fontSize: 12, letterSpacing: 2, color: 'rgba(244,241,234,.5)', align: 'right' }),
]);

const pitch4 = page('Close', bgSolid(LIME), [
  T('PORTER  /  SEED ROUND 2026', 120, 96, 800, 30, { fontSize: 18, letterSpacing: 4, color: INK }),
  T('Let’s build a\nbetter morning.', 112, 250, 1400, 420, {
    fontFamily: 'Bricolage Grotesque', fontSize: 150, lineHeight: 0.92, letterSpacing: -5, color: INK, fontWeight: 800,
  }),
  T('hello@porter.app   ·   porter.app   ·   London & Lisbon', 120, 840, 1000, 40, { fontSize: 24, color: '#2A2A16' }),
  S('ellipse', 1500, 760, 280, 280, { fill: COBALT }),
  IC('arrow-up-right', 1570, 830, 140, LIME, 1.2),
  S('line', 120, 940, 1680, 1, { fill: NONE, stroke: 'rgba(20,19,15,.28)', strokeWidth: 1 }),
  T('Thank you.', 120, 968, 300, 26, { fontSize: 13, letterSpacing: 3.4, color: 'rgba(20,19,15,.6)' }),
]);

/* ---------- 08. Portfolio deck ---------- */
const port1 = page('Cover', bgSolid(INK), [
  IMG(IMG_ARCH, 980, 0, 940, 1080, { opacity: 0.82, filters: { ...FILTERS, saturate: 70 } }),
  S('rect', 980, 0, 940, 1080, { fill: 'rgba(20,19,15,.18)' }),
  T('MARA OKONKWO', 90, 96, 700, 28, { fontSize: 15, letterSpacing: 3.6, color: 'rgba(244,241,234,.75)' }),
  T('MARA\nOKONKWO', 84, 240, 900, 480, {
    fontFamily: 'Instrument Serif', fontSize: 168, lineHeight: 0.89, letterSpacing: -3, color: PAPER,
  }),
  T('Selected work\n2022 — 2026', 90, 760, 600, 130, { fontSize: 26, lineHeight: 1.5, color: 'rgba(244,241,234,.72)' }),
  S('line', 90, 946, 760, 1, { fill: NONE, stroke: 'rgba(244,241,234,.28)', strokeWidth: 1 }),
  T('ARCHITECTURE  /  INTERIORS  /  OBJECTS', 90, 972, 760, 24, { fontSize: 12, letterSpacing: 2.8, color: 'rgba(244,241,234,.5)' }),
]);

const port2 = page('Work', bgSolid('#EDE7DA'), [
  T('SELECTED WORK', 100, 90, 500, 28, { fontSize: 14, letterSpacing: 3.4, color: '#6B675D' }),
  T('Spaces that hold a pause.', 100, 150, 1100, 120, { fontFamily: 'Instrument Serif', fontSize: 88, letterSpacing: -1.5, lineHeight: 1 }),
  IMG(IMG_INTERIOR, 100, 330, 830, 600, {}),
  IMG(IMG_CITY, 960, 330, 830, 380, {}),
  T('CASA LUME  /  LISBON  /  2025', 100, 950, 600, 26, { fontSize: 13, letterSpacing: 2.4, color: '#6B675D' }),
  T('THE LONG ROOM  /  LONDON  /  2024', 960, 730, 600, 26, { fontSize: 13, letterSpacing: 2.4, color: '#6B675D' }),
  T('A house built around\none hour of afternoon light.', 960, 790, 560, 140, { fontFamily: 'Instrument Serif', fontSize: 40, lineHeight: 1.15 }),
  T('MARA OKONKWO  /  01', 100, 1010, 600, 24, { fontSize: 12, letterSpacing: 2.8, color: '#6B675D' }),
]);

const port3 = page('Contact', bgSolid(CORAL), [
  T('MARA OKONKWO', 100, 96, 600, 28, { fontSize: 14, letterSpacing: 3.4, color: 'rgba(20,19,15,.6)' }),
  T('Let’s make\nsomething.', 96, 220, 1400, 380, {
    fontFamily: 'Instrument Serif', fontSize: 190, lineHeight: 0.88, letterSpacing: -3, color: INK,
  }),
  S('ellipse', 1440, 300, 340, 340, { fill: COBALT }),
  IC('arrow-up-right', 1550, 410, 120, LIME, 1.2),
  T('hello@maraokonkwo.studio', 104, 760, 800, 60, { fontSize: 34, fontWeight: 500, color: INK }),
  T('+44 7700 900 112   ·   London', 104, 820, 600, 30, { fontSize: 20, color: 'rgba(20,19,15,.65)' }),
  S('line', 100, 940, 1720, 1, { fill: NONE, stroke: 'rgba(20,19,15,.3)', strokeWidth: 1 }),
  T('AVAILABLE FOR SELECT PROJECTS FROM MAY 2026', 100, 968, 900, 24, { fontSize: 12, letterSpacing: 2.8, color: 'rgba(20,19,15,.6)' }),
]);

/* ---------- 09. Music poster ---------- */
const gig = page('Poster', bgImage(IMG_CONCERT, '#070605', 0.58), [
  T('LIVE  /  ONE NIGHT ONLY', 84, 90, 600, 30, { fontSize: 17, letterSpacing: 4, color: LIME }),
  T('NIGHT', 70, 170, 1100, 300, { fontFamily: 'Bebas Neue', fontSize: 330, lineHeight: 0.82, letterSpacing: 2, color: '#FFFFFF' }),
  T('SHIFT', 70, 410, 1100, 300, { fontFamily: 'Bebas Neue', fontSize: 330, lineHeight: 0.82, letterSpacing: 2, color: '#FFFFFF' }),
  S('ellipse', 890, 700, 230, 230, { fill: LIME }),
  T('14\nNOV', 890, 765, 230, 120, { fontFamily: 'Archivo Black', fontSize: 58, lineHeight: 0.9, align: 'center', color: INK }),
  S('line', 84, 900, 1072, 2, { fill: NONE, stroke: LIME, strokeWidth: 2 }),
  T('A NIGHT OF LIVE ELECTRONIC MUSIC', 84, 930, 700, 30, { fontSize: 17, letterSpacing: 3, color: 'rgba(255,255,255,.72)' }),
  T('SABLE  ·  KŌTA  ·  MIRA VALE  ·  DJ ORR', 84, 1000, 1000, 80, { fontFamily: 'Instrument Serif', fontSize: 50, lineHeight: 1.3, color: '#FFFFFF' }),
  T('DOORS 8PM  /  ALL NIGHT', 84, 1590, 520, 30, { fontSize: 16, letterSpacing: 3, color: 'rgba(255,255,255,.65)' }),
  T('THE FOUNDRY, BERLIN', 84, 1640, 600, 30, { fontSize: 16, letterSpacing: 3, color: 'rgba(255,255,255,.65)' }),
  T('TICKETS  €18', 840, 1630, 316, 50, { fontSize: 26, fontWeight: 700, color: LIME, align: 'right' }),
  S('rect', 84, 1710, 170, 34, { fill: 'rgba(255,255,255,.14)', radius: 17 }),
  T('SOLD OUT SOON', 84, 1719, 170, 20, { fontSize: 10, letterSpacing: 1.6, color: '#FFFFFF', align: 'center' }),
]);

/* ---------- 10. Exhibition poster ---------- */
const exhibition = page('Poster', bgSolid('#EFEAE0'), [
  T('KUNSTHALLE NORD', 80, 78, 500, 28, { fontSize: 14, letterSpacing: 3, fontWeight: 600 }),
  T('12.09 — 03.11', 860, 78, 300, 28, { fontSize: 14, letterSpacing: 3, align: 'right' }),
  S('blob', 620, 160, 560, 560, { fill: CORAL }),
  S('ring', 500, 280, 360, 360, { fill: NONE, stroke: INK, strokeWidth: 2 }),
  IC('star', 740, 380, 120, LIME, 1.2, { rotation: 12 }),
  T('Forms\nof Quiet', 74, 780, 1080, 420, {
    fontFamily: 'Instrument Serif', fontSize: 240, lineHeight: 0.86, letterSpacing: -5, color: INK,
  }),
  S('line', 80, 1280, 1080, 1, { fill: NONE, stroke: 'rgba(20,19,15,.3)', strokeWidth: 1 }),
  T('An exhibition about the space between things.\nNew work by eleven artists, made slowly.', 80, 1320, 700, 100, {
    fontSize: 24, lineHeight: 1.6, color: '#4F4B42',
  }),
  T('OPEN TUE—SUN\n10:00 — 18:00', 900, 1320, 260, 100, { fontSize: 16, lineHeight: 1.7, letterSpacing: 1.2, align: 'right' }),
  T('ADMISSION FREE  /  KUNSTHALLE NORD, HAMBURG', 80, 1660, 900, 24, { fontSize: 11, letterSpacing: 2.4, color: '#6B675D' }),
]);

/* ---------- 11. Resume ---------- */
const resume = page('Resume', bgSolid('#FCFBF7'), [
  T('ELENA PARK', 88, 92, 700, 110, { fontFamily: 'Instrument Serif', fontSize: 92, letterSpacing: -1, lineHeight: 1 }),
  T('Product designer  ·  Design systems  ·  Berlin', 92, 196, 700, 30, { fontSize: 19, letterSpacing: 1.2, color: '#5C584E' }),
  T('elena.park@email.com\n+49 30 1234 5678\nelenapark.design', 840, 100, 320, 120, { fontSize: 15, lineHeight: 1.75, color: '#5C584E', align: 'right' }),
  S('line', 88, 270, 1064, 2, { fill: NONE, stroke: INK, strokeWidth: 2 }),
  T('PROFILE', 88, 320, 200, 24, { fontSize: 12, letterSpacing: 2.6, fontWeight: 700, color: COBALT }),
  T('Product designer with eight years of experience turning complex systems into calm, usable interfaces. I lead with research, prototype early, and care about the last five percent.', 88, 356, 1064, 100, {
    fontSize: 21, lineHeight: 1.55, color: '#3A372F',
  }),
  T('EXPERIENCE', 88, 500, 300, 24, { fontSize: 12, letterSpacing: 2.6, fontWeight: 700, color: COBALT }),
  ...[
    ['2022 — NOW', 'Senior Product Designer', 'Northwind', 'Led the design system and checkout rebuild. Shipped 14 releases; lifted conversion 18%.'],
    ['2019 — 2022', 'Product Designer', 'Fieldwork', 'Owned the end-to-end experience for a B2B logistics platform used by 40,000 drivers.'],
    ['2017 — 2019', 'UI Designer', 'Studio Common', 'Brand and interface work for early-stage teams across retail, culture and fintech.'],
  ].flatMap(([date, role, company, body], i) => [
    T(date, 88, 550 + i * 165, 200, 24, { fontSize: 13, letterSpacing: 1, color: '#6B675D' }),
    T(role, 300, 544 + i * 165, 500, 34, { fontSize: 25, fontWeight: 600 }),
    T(company, 300, 580 + i * 165, 400, 26, { fontSize: 16, color: COBALT, fontWeight: 500 }),
    T(body, 300, 614 + i * 165, 780, 80, { fontSize: 16, lineHeight: 1.5, color: '#4F4B42' }),
  ]),
  T('SELECTED WORK', 88, 1100, 300, 24, { fontSize: 12, letterSpacing: 2.6, fontWeight: 700, color: COBALT }),
  T('Atlas design system  —  120 components, adopted by 6 product teams.\nRue checkout  —  rebuilt in 9 weeks, +18% conversion.\nFieldwork driver app  —  offline-first redesign, 4.8★ store rating.', 88, 1140, 1000, 110, {
    fontSize: 18, lineHeight: 1.7, color: '#3A372F',
  }),
  T('EDUCATION', 88, 1310, 300, 24, { fontSize: 12, letterSpacing: 2.6, fontWeight: 700, color: COBALT }),
  T('BA, Interaction Design — UdK Berlin, 2017', 88, 1348, 700, 30, { fontSize: 18, color: '#3A372F' }),
  T('TOOLS', 88, 1430, 300, 24, { fontSize: 12, letterSpacing: 2.6, fontWeight: 700, color: COBALT }),
  T('Figma  ·  Framer  ·  Prototyping  ·  User research  ·  HTML / CSS  ·  Motion', 88, 1468, 1000, 40, { fontSize: 18, color: '#3A372F' }),
  S('line', 88, 1590, 1064, 1, { fill: NONE, stroke: '#DCD6C8', strokeWidth: 1 }),
  T('References available on request.', 88, 1612, 500, 24, { fontSize: 12, letterSpacing: 1.2, color: '#8A8477' }),
]);

/* ---------- 12. Business card ---------- */
const cardFront = page('Front', bgSolid(INK), [
  IC('star', 84, 84, 74, LIME, 1.2),
  T('NORTH & CO.', 84, 200, 700, 90, { fontFamily: 'Bricolage Grotesque', fontSize: 76, letterSpacing: -2, color: PAPER, fontWeight: 700 }),
  T('Brand studio for people\nwho care about the details.', 88, 330, 520, 100, { fontSize: 24, lineHeight: 1.5, color: 'rgba(244,241,234,.62)' }),
  T('NORTHAND.CO', 88, 500, 300, 24, { fontSize: 12, letterSpacing: 3.6, color: 'rgba(244,241,234,.4)' }),
  S('ellipse', 790, 420, 170, 170, { fill: COBALT }),
  IC('arrow-up-right', 840, 470, 70, PAPER, 1.4),
]);

const cardBack = page('Back', bgSolid('#F1EDE2'), [
  T('Ada Mensah', 84, 90, 700, 80, { fontFamily: 'Instrument Serif', fontSize: 76, letterSpacing: -1.5 }),
  T('Founder & Creative Director', 88, 176, 600, 30, { fontSize: 19, letterSpacing: 1.2, color: '#5C584E' }),
  S('line', 88, 320, 874, 1, { fill: NONE, stroke: 'rgba(20,19,15,.22)', strokeWidth: 1 }),
  ...[
    ['EMAIL', 'ada@northand.co'],
    ['PHONE', '+44 7700 900 341'],
    ['STUDIO', '14 Bell Yard, London'],
  ].flatMap(([k, v], i) => [
    T(k, 88, 366 + i * 58, 120, 22, { fontSize: 10, letterSpacing: 2.4, color: '#8A8477' }),
    T(v, 230, 358 + i * 58, 500, 28, { fontSize: 19, color: '#2A2720' }),
  ]),
  S('star', 900, 476, 56, 56, { fill: LIME }),
  T('NORTHAND.CO', 88, 530, 300, 20, { fontSize: 10, letterSpacing: 3, color: '#8A8477' }),
]);

/* ---------- 13. YouTube thumbnail ---------- */
const youtube = page('Thumbnail', bgSolid('#F2E63D'), [
  IMG(IMG_PORTRAIT, 780, 0, 500, 720, { filters: { ...FILTERS, contrast: 108, saturate: 90 } }),
  S('rect', 780, 0, 500, 720, { fill: 'rgba(242,230,61,.08)' }),
  S('rect', 64, 72, 150, 48, { fill: INK, radius: 24 }),
  T('EP. 12', 64, 84, 150, 24, { fontSize: 17, letterSpacing: 2, color: '#F2E63D', align: 'center', fontWeight: 700 }),
  T('I BUILT A\nDESIGN APP\nIN 24 HOURS', 56, 160, 780, 360, {
    fontFamily: 'Archivo Black', fontSize: 100, lineHeight: 0.9, letterSpacing: -3.5, color: INK,
  }),
  S('ellipse', 560, 500, 150, 150, { fill: CORAL, stroke: INK, strokeWidth: 4 }),
  T('24H', 560, 558, 150, 48, { fontFamily: 'Archivo Black', fontSize: 38, color: INK, align: 'center', rotation: -10 }),
  T('NO CODE  ·  JUST CURIOSITY', 64, 610, 600, 30, { fontSize: 17, letterSpacing: 2.6, fontWeight: 600 }),
]);

/* ---------- 14. Restaurant menu ---------- */
const menu = page('Menu', bgSolid('#13251C'), [
  T('OLIVE', 84, 96, 700, 150, { fontFamily: 'Instrument Serif', fontSize: 150, lineHeight: 0.9, color: '#F2ECDC', letterSpacing: -2 }),
  T('& ASH', 84, 216, 700, 120, { fontFamily: 'Instrument Serif', fontSize: 110, lineHeight: 0.9, color: LIME, letterSpacing: -1 }),
  T('KITCHEN  ·  BAR  ·  LATE', 88, 360, 500, 28, { fontSize: 14, letterSpacing: 3.4, color: 'rgba(242,236,220,.55)' }),
  S('line', 88, 430, 1064, 1, { fill: NONE, stroke: 'rgba(242,236,220,.24)', strokeWidth: 1 }),
  T('SMALL PLATES', 88, 470, 300, 24, { fontSize: 12, letterSpacing: 3.2, color: LIME, fontWeight: 600 }),
  ...[
    ['Charred leeks, hazelnut, brown butter', '9'],
    ['Sourdough, cultured butter, sea salt', '6'],
    ['Olives, orange peel, rosemary', '5'],
    ['Salt cod croquettes, smoked aioli', '11'],
  ].flatMap(([dish, price], i) => [
    T(dish, 88, 512 + i * 64, 850, 32, { fontSize: 22, color: '#F2ECDC' }),
    T(price, 1090, 512 + i * 64, 60, 32, { fontSize: 22, color: '#F2ECDC', align: 'right' }),
  ]),
  T('LARGE PLATES', 88, 820, 300, 24, { fontSize: 12, letterSpacing: 3.2, color: LIME, fontWeight: 600 }),
  ...[
    ['Roast chicken, preserved lemon, greens', '24'],
    ['Hand-rolled cavatelli, wild mushrooms', '21'],
    ['Whole bream, fennel, salsa verde', '27'],
    ['Charred hispi, tahini, pomegranate', '18'],
  ].flatMap(([dish, price], i) => [
    T(dish, 88, 862 + i * 64, 850, 32, { fontSize: 22, color: '#F2ECDC' }),
    T(price, 1090, 862 + i * 64, 60, 32, { fontSize: 22, color: '#F2ECDC', align: 'right' }),
  ]),
  T('SWEET', 88, 1170, 300, 24, { fontSize: 12, letterSpacing: 3.2, color: LIME, fontWeight: 600 }),
  ...[
    ['Olive oil cake, crème fraîche', '8'],
    ['Dark chocolate, sea salt, rye', '9'],
  ].flatMap(([dish, price], i) => [
    T(dish, 88, 1212 + i * 64, 850, 32, { fontSize: 22, color: '#F2ECDC' }),
    T(price, 1090, 1212 + i * 64, 60, 32, { fontSize: 22, color: '#F2ECDC', align: 'right' }),
  ]),
  S('line', 88, 1400, 1064, 1, { fill: NONE, stroke: 'rgba(242,236,220,.24)', strokeWidth: 1 }),
  T('A discretionary 12.5% service charge is added.\nPlease tell us about allergies — the kitchen will take care of you.', 88, 1430, 800, 70, {
    fontSize: 14, lineHeight: 1.7, color: 'rgba(242,236,220,.5)',
  }),
  T('OLIVE & ASH  /  18 CHALK LANE', 88, 1620, 700, 24, { fontSize: 11, letterSpacing: 2.6, color: 'rgba(242,236,220,.4)' }),
  IC('leaf', 1000, 1560, 100, LIME, 1.1),
]);

/* ---------- 15. Wedding invitation ---------- */
const wedding = page('Invitation', bgSolid('#F7EDE8'), [
  S('rect', 48, 48, 984, 984, { fill: NONE, stroke: '#B4553C', strokeWidth: 1.5 }),
  S('rect', 64, 64, 952, 952, { fill: NONE, stroke: 'rgba(180,85,60,.45)', strokeWidth: 1 }),
  IC('leaf', 440, 118, 56, '#6B7A5A', 1.2),
  T('TOGETHER WITH THEIR FAMILIES', 240, 214, 600, 24, { fontSize: 12, letterSpacing: 3.4, color: '#8A5A48', align: 'center' }),
  T('Amara', 170, 280, 740, 160, { fontFamily: 'Instrument Serif', fontSize: 150, lineHeight: 1, color: '#3B2A22', align: 'center', letterSpacing: -2 }),
  T('&', 470, 414, 140, 70, { fontFamily: 'Instrument Serif', fontSize: 62, color: '#B4553C', align: 'center', italic: true }),
  T('Jonah', 170, 486, 740, 160, { fontFamily: 'Instrument Serif', fontSize: 150, lineHeight: 1, color: '#3B2A22', align: 'center', letterSpacing: -2 }),
  T('ARE GETTING MARRIED', 290, 640, 500, 24, { fontSize: 12, letterSpacing: 3.8, color: '#8A5A48', align: 'center' }),
  S('line', 400, 696, 280, 1, { fill: NONE, stroke: 'rgba(180,85,60,.5)', strokeWidth: 1 }),
  T('SATURDAY, THE TWELFTH OF SEPTEMBER', 240, 730, 600, 26, { fontSize: 14, letterSpacing: 2.4, color: '#3B2A22', align: 'center' }),
  T('TWO THOUSAND AND TWENTY-SIX', 300, 762, 480, 24, { fontSize: 12, letterSpacing: 2.4, color: '#8A5A48', align: 'center' }),
  T('The Old Orchard  ·  Somerset', 280, 824, 520, 30, { fontFamily: 'Instrument Serif', fontSize: 30, color: '#3B2A22', align: 'center', italic: true }),
  T('CEREMONY 3PM  ·  DINNER & DANCING TO FOLLOW', 240, 892, 600, 22, { fontSize: 11, letterSpacing: 2, color: '#8A5A48', align: 'center' }),
  T('R.S.V.P.  ·  AMARAANDJONAH@EMAIL.COM', 280, 952, 520, 22, { fontSize: 10, letterSpacing: 2.2, color: '#8A5A48', align: 'center' }),
]);

/* ---------- 16. Logo / brand mark ---------- */
const logo = page('Brand mark', bgSolid('#F1EDE2'), [
  T('NORTH', 90, 88, 820, 28, { fontSize: 13, letterSpacing: 4, color: '#6B675D' }),
  S('star', 430, 240, 140, 140, { fill: COBALT }),
  T('North', 140, 400, 720, 180, { fontFamily: 'Bricolage Grotesque', fontSize: 170, letterSpacing: -6, align: 'center', lineHeight: 1, fontWeight: 700 }),
  T('& CO.', 140, 556, 720, 70, { fontSize: 40, letterSpacing: 14, align: 'center', color: '#5C584E' }),
  S('line', 380, 660, 240, 1, { fill: NONE, stroke: 'rgba(20,19,15,.3)', strokeWidth: 1 }),
  T('Brand studio  ·  London  ·  Est. 2019', 140, 692, 720, 26, { fontSize: 14, letterSpacing: 2, align: 'center', color: '#6B675D' }),
  ...[PAPER, INK, COBALT, LIME, CORAL].flatMap((c, i) => [
    S('ellipse', 330 + i * 76, 800, 52, 52, { fill: P(c) }),
  ]),
  T('MARK 01  /  PRIMARY', 90, 930, 400, 24, { fontSize: 10, letterSpacing: 2.6, color: '#8A8477' }),
]);

/* ---------- 17. Fitness flyer ---------- */
const fitness = page('Flyer', bgSolid(LIME), [
  T('MOVE', 70, 70, 1100, 260, { fontFamily: 'Archivo Black', fontSize: 230, lineHeight: 0.82, letterSpacing: -10, color: INK }),
  T('WITH', 70, 290, 1100, 260, { fontFamily: 'Archivo Black', fontSize: 230, lineHeight: 0.82, letterSpacing: -10, color: INK }),
  T('INTENT', 70, 510, 1100, 260, { fontFamily: 'Archivo Black', fontSize: 230, lineHeight: 0.82, letterSpacing: -10, color: COBALT }),
  T('A six-week strength series for people who sit down all day.', 76, 800, 760, 70, { fontSize: 25, lineHeight: 1.5, color: '#2A2A16' }),
  IMG(IMG_ATHLETE, 0, 920, 1240, 560, { filters: { ...FILTERS, grayscale: 100, contrast: 112 }, overlay: '#13251C', overlayOpacity: 0.2 }),
  S('rect', 70, 1510, 540, 150, { fill: INK }),
  T('STARTS 04 MAY', 96, 1536, 400, 30, { fontSize: 16, letterSpacing: 2.8, color: LIME }),
  T('MON & THU · 7AM · 45 MIN', 96, 1576, 480, 26, { fontSize: 17, color: PAPER }),
  T('THE FOUNDRY\n12 MILL LANE', 900, 1510, 270, 100, { fontSize: 17, lineHeight: 1.7, letterSpacing: 1.4, align: 'right', color: INK }),
  T('STRONGER  /  CALMER  /  TOGETHER', 70, 1690, 900, 24, { fontSize: 11, letterSpacing: 2.6, color: '#2A2A16' }),
]);

/* ---------- 18. LinkedIn banner ---------- */
const linkedin = page('Banner', bgSolid(COBALT), [
  S('ellipse', 1290, -80, 360, 360, { fill: LIME }),
  IC('arrow-up-right', 1430, 60, 110, COBALT, 1.3, { rotation: 8 }),
  T('ADA MENSAH', 70, 70, 500, 26, { fontSize: 13, letterSpacing: 3.6, color: 'rgba(255,255,255,.7)' }),
  T('Designing calm products\nfor complicated work.', 66, 120, 1100, 190, {
    fontFamily: 'Bricolage Grotesque', fontSize: 72, lineHeight: 1.02, letterSpacing: -2, color: '#FFFFFF', fontWeight: 700,
  }),
  T('PRODUCT DESIGN  ·  DESIGN SYSTEMS  ·  LONDON', 70, 336, 700, 24, { fontSize: 11, letterSpacing: 2.8, color: 'rgba(255,255,255,.6)' }),
  T('adamensah.design', 1150, 336, 364, 24, { fontSize: 13, letterSpacing: 1.4, color: LIME, align: 'right' }),
]);

/* ---------- 19. Podcast cover ---------- */
const podcast = page('Cover', bgSolid(INK), [
  S('ring', 580, 140, 360, 360, { fill: NONE, stroke: 'rgba(216,245,90,.35)', strokeWidth: 2 }),
  S('ellipse', 736, 296, 46, 46, { fill: CORAL }),
  T('THE', 80, 100, 840, 200, { fontFamily: 'Bebas Neue', fontSize: 200, lineHeight: 0.9, letterSpacing: 3, color: PAPER }),
  T('LONG', 80, 260, 840, 200, { fontFamily: 'Bebas Neue', fontSize: 200, lineHeight: 0.9, letterSpacing: 3, color: PAPER }),
  T('TAKE', 80, 420, 840, 200, { fontFamily: 'Bebas Neue', fontSize: 200, lineHeight: 0.9, letterSpacing: 3, color: LIME }),
  T('CONVERSATIONS ON CRAFT, CAREERS\nAND THE THINGS WE MAKE', 84, 690, 700, 70, { fontSize: 15, lineHeight: 1.8, letterSpacing: 2.4, color: 'rgba(244,241,234,.6)' }),
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].flatMap(i => [
    S('rect', 84 + i * 30, 830 + (i % 3) * 12, 6, 70 - (i % 4) * 14, { fill: i === 4 ? CORAL : LIME }),
  ]),
  T('SEASON 03  /  NEW EPISODES WEEKLY', 84, 940, 700, 24, { fontSize: 10, letterSpacing: 2.6, color: 'rgba(244,241,234,.45)' }),
]);

/* ---------- 20. Email header ---------- */
const email = page('Header', bgGrad('#F6F1E3', '#D8F55A', 100), [
  T('BRUMA  /  WEEKLY NOTE', 64, 52, 500, 26, { fontSize: 12, letterSpacing: 3.4, color: '#4F4B42' }),
  T('A better morning,\ndelivered.', 62, 96, 700, 180, { fontFamily: 'Bricolage Grotesque', fontSize: 72, lineHeight: 0.98, letterSpacing: -2.4, fontWeight: 700, color: INK }),
  T('Fresh bread, new beans and one good story.\nEvery Friday, before the queue.', 64, 270, 540, 70, { fontSize: 17, lineHeight: 1.6, color: '#3A372F' }),
  S('rect', 744, 176, 300, 68, { fill: INK, radius: 34 }),
  T('READ THE NOTE  →', 744, 197, 300, 30, { fontSize: 15, letterSpacing: 1.8, color: LIME, align: 'center', fontWeight: 600 }),
  S('ellipse', 1010, 46, 130, 130, { fill: CORAL }),
  T('07', 1010, 92, 130, 40, { fontFamily: 'Archivo Black', fontSize: 34, color: CREAM, align: 'center' }),
]);

/* ---------- export ---------- */

export const TEMPLATES: Template[] = [
  {
    id: 'cafe-opening', name: 'Bruma Café', category: 'Instagram', description: 'A moody opening announcement for a café or bakery.',
    size: { name: 'Instagram Post', width: 1080, height: 1080 }, pages: [cafe], tags: ['instagram', 'cafe', 'photo', 'serif'], featured: true,
  },
  {
    id: 'form-04', name: 'Form 04 Launch', category: 'Instagram', description: 'Product drop layout with an editorial, gallery feel.',
    size: { name: 'Instagram Post', width: 1080, height: 1080 }, pages: [product], tags: ['product', 'launch', 'bold'], featured: true,
  },
  {
    id: 'simple-significant', name: 'Simple & Significant', category: 'Instagram', description: 'A typographic quote card with a warm editorial palette.',
    size: { name: 'Instagram Post', width: 1080, height: 1080 }, pages: [quote], tags: ['quote', 'minimal', 'serif'],
  },
  {
    id: 'flash-sale', name: 'Flash Sale Story', category: 'Story', description: 'A loud, unmissable sale story that still looks designed.',
    size: { name: 'Instagram Story', width: 1080, height: 1920 }, pages: [sale], tags: ['sale', 'story', 'bold', 'retail'], featured: true,
  },
  {
    id: 'north-coast', name: 'North Coast', category: 'Story', description: 'Travel story with cinematic type over a full-bleed landscape.',
    size: { name: 'Instagram Story', width: 1080, height: 1920 }, pages: [travel], tags: ['travel', 'story', 'photo'],
  },
  {
    id: 'tomato-basil', name: 'Tomato & Basil', category: 'Story', description: 'A recipe story with a clean editorial recipe layout.',
    size: { name: 'Instagram Story', width: 1080, height: 1920 }, pages: [recipe], tags: ['food', 'recipe', 'story'],
  },
  {
    id: 'porter-pitch', name: 'Porter — Seed Deck', category: 'Presentation', description: 'A four-page pitch deck with a confident point of view.',
    size: { name: 'Presentation', width: 1920, height: 1080 }, pages: [pitch1, pitch2, pitch3, pitch4], tags: ['pitch', 'startup', 'deck', 'cobalt'], featured: true,
  },
  {
    id: 'mara-portfolio', name: 'Mara — Portfolio', category: 'Presentation', description: 'An architect’s portfolio deck: quiet, image-led, precise.',
    size: { name: 'Presentation', width: 1920, height: 1080 }, pages: [port1, port2, port3], tags: ['portfolio', 'architecture', 'deck'],
  },
  {
    id: 'night-shift', name: 'Night Shift', category: 'Poster', description: 'A live music poster with big condensed type and a photo.',
    size: { name: 'Poster', width: 1240, height: 1754 }, pages: [gig], tags: ['music', 'poster', 'event', 'bold'], featured: true,
  },
  {
    id: 'forms-of-quiet', name: 'Forms of Quiet', category: 'Poster', description: 'An exhibition poster built from shape and type alone.',
    size: { name: 'Poster', width: 1240, height: 1754 }, pages: [exhibition], tags: ['exhibition', 'poster', 'art', 'shape'],
  },
  {
    id: 'elena-resume', name: 'Elena — Resume', category: 'Resume', description: 'One-page resume with clear hierarchy and room to breathe.',
    size: { name: 'Resume', width: 1240, height: 1754 }, pages: [resume], tags: ['resume', 'cv', 'minimal', 'print'],
  },
  {
    id: 'north-card', name: 'North & Co. Card', category: 'Business card', description: 'Double-sided studio card — ink front, paper back.',
    size: { name: 'Business Card', width: 1050, height: 600 }, pages: [cardFront, cardBack], tags: ['business card', 'studio', 'brand'],
  },
  {
    id: 'built-in-24h', name: 'Built in 24 Hours', category: 'YouTube', description: 'A high-contrast thumbnail built to stop the scroll.',
    size: { name: 'YouTube Thumbnail', width: 1280, height: 720 }, pages: [youtube], tags: ['youtube', 'thumbnail', 'bold', 'creator'],
  },
  {
    id: 'olive-ash', name: 'Olive & Ash', category: 'Menu', description: 'A dark, confident restaurant menu with generous type.',
    size: { name: 'Menu', width: 1240, height: 1754 }, pages: [menu], tags: ['menu', 'restaurant', 'food', 'print'],
  },
  {
    id: 'amara-jonah', name: 'Amara & Jonah', category: 'Invitation', description: 'A warm, classic wedding invitation with a fine border.',
    size: { name: 'Invitation', width: 1080, height: 1080 }, pages: [wedding], tags: ['wedding', 'invitation', 'serif', 'classic'],
  },
  {
    id: 'north-mark', name: 'North — Brand Mark', category: 'Logo', description: 'A simple wordmark presentation board for a studio.',
    size: { name: 'Logo', width: 1000, height: 1000 }, pages: [logo], tags: ['logo', 'brand', 'wordmark'],
  },
  {
    id: 'move-intent', name: 'Move With Intent', category: 'Flyer', description: 'A fitness flyer with poster-scale type and a duotone photo.',
    size: { name: 'Flyer', width: 1240, height: 1754 }, pages: [fitness], tags: ['fitness', 'flyer', 'bold', 'photo'],
  },
  {
    id: 'ada-banner', name: 'Ada — Banner', category: 'Banner', description: 'A clean personal banner for LinkedIn or a portfolio.',
    size: { name: 'LinkedIn Banner', width: 1584, height: 396 }, pages: [linkedin], tags: ['banner', 'linkedin', 'personal'],
  },
  {
    id: 'long-take', name: 'The Long Take', category: 'Podcast', description: 'Podcast cover art with a bold, editorial type stack.',
    size: { name: 'Podcast Cover', width: 1000, height: 1000 }, pages: [podcast], tags: ['podcast', 'cover', 'audio', 'bold'],
  },
  {
    id: 'bruma-email', name: 'Bruma — Email Header', category: 'Banner', description: 'A warm newsletter header with a clear call to action.',
    size: { name: 'Email Header', width: 1200, height: 400 }, pages: [email], tags: ['email', 'header', 'newsletter', 'brand'],
  },
];

export const TEMPLATE_CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

export const getTemplate = (id: string) => TEMPLATES.find(t => t.id === id);

/** A blank starter design with a light grid feel. */
export const BLANK_SIZES = [
  { label: 'Social post', w: 1080, h: 1080 },
  { label: 'Story', w: 1080, h: 1920 },
  { label: 'Presentation', w: 1920, h: 1080 },
  { label: 'Poster', w: 1240, h: 1754 },
];

export const TEMPLATE_IMAGES = {
  coffee: IMG_COFFEE, watch: IMG_WATCH, shoe: IMG_SHOE, mountain: IMG_MOUNTAIN, tomato: IMG_TOMATO,
  interior: IMG_INTERIOR, arch: IMG_ARCH, city: IMG_CITY, athlete: IMG_ATHLETE, portrait: IMG_PORTRAIT,
  concert: IMG_CONCERT, flowers: IMG_FLOWERS, food: IMG_FOOD, office: IMG_OFFICE,
};
