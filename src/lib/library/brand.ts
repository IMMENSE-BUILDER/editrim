import type { Template } from '../types';
import {
  FONTS,
  IMG,
  NONE,
  PHOTOS,
  S,
  T,
  bgSolid,
  page,
} from '../templateKit';

/**
 * Identity, stationery and brand-system templates.
 * Four complete systems: aperture (photography), marrow (restaurant),
 * kite (fintech) and atelier no. 9 (fashion).
 */

/* ---------- shared mark builders ---------- */

const APERTURE_SILVER = '#C9C9C4';
const APERTURE_SHADE = '#8E8E88';

/** Six-blade iris diagram inside a hairline ring. d = overall mark diameter. */
function apertureMark(cx: number, cy: number, d: number, silver = APERTURE_SILVER, shade = APERTURE_SHADE) {
  const ring = d * 0.48;
  const hub = d * 0.17;
  const bladeLen = d * 0.255;
  const bladeWidth = Math.max(2, d * 0.018);
  const mid = (hub + ring) / 2 + d * 0.012;
  const blades = Array.from({ length: 6 }, (_, i) => {
    const angle = i * 60 - 90;
    const rad = (angle * Math.PI) / 180;
    const bx = cx + Math.cos(rad) * mid;
    const by = cy + Math.sin(rad) * mid;
    return S('rect', Math.round(bx - bladeWidth / 2), Math.round(by - bladeLen / 2), Math.round(bladeWidth), Math.round(bladeLen), {
      fill: i % 2 === 0 ? silver : shade,
      rotation: angle + 90,
      name: `Aperture blade ${i + 1}`,
    });
  });
  return [
    S('ellipse', cx - ring, cy - ring, ring * 2, ring * 2, {
      fill: NONE,
      stroke: silver,
      strokeWidth: Math.max(1, +(d * 0.0042).toFixed(2)),
      name: 'Aperture ring',
    }),
    S('hexagon', cx - hub, cy - hub, hub * 2, hub * 2, {
      fill: NONE,
      stroke: silver,
      strokeWidth: Math.max(1, +(d * 0.0036).toFixed(2)),
      rotation: 30,
      name: 'Aperture opening',
    }),
    ...blades,
  ];
}

/** M monogram built from two stems and two angled bars. */
function marrowMonogram(cx: number, cy: number) {
  const stem = 24;
  const wide = 168;
  const tall = 138;
  const left = cx - wide / 2;
  const top = cy - tall / 2;
  const dx = wide / 2 - stem;
  const dy = tall - 2;
  const len = Math.round(Math.hypot(dx, dy));
  const tilt = +((Math.atan2(dx, dy) * 180) / Math.PI).toFixed(2);
  return [
    S('rect', left, top, stem, tall, { fill: '#5A1F1B', name: 'M stem left' }),
    S('rect', left + wide - stem, top, stem, tall, { fill: '#5A1F1B', name: 'M stem right' }),
    S('rect', cx - dx / 2 - stem / 2, top + dy / 2 - len / 2, stem, len, {
      fill: '#5A1F1B', rotation: tilt, name: 'M diagonal left',
    }),
    S('rect', cx + dx / 2 - stem / 2, top + dy / 2 - len / 2, stem, len, {
      fill: '#5A1F1B', rotation: -tilt, name: 'M diagonal right',
    }),
  ];
}

/** Diamond frame, aperture cut and downward tail. */
function kiteMark(x: number, y: number, w: number, h: number, color: string, cut: string, tail = true) {
  const tw = Math.round(w * 0.37);
  const th = Math.round(h * 0.26);
  const parts = [
    S('diamond', x, y, w, h, { fill: color, name: 'Kite diamond' }),
    S('diamond', x + w / 4, y + h / 4, w / 2, h / 2, { fill: cut, name: 'Kite aperture' }),
  ];
  if (tail) {
    parts.push(S('triangle', x + (w - tw) / 2, y + h + Math.round(h * 0.07), tw, th, {
      fill: color, rotation: 180, name: 'Kite tail',
    }));
  }
  return parts;
}

/* ---------- 1. Aperture ---------- */

const aperturePrimary = page('Primary', bgSolid('#1A1A1A'), [
  S('rect', 40, 40, 920, 920, { fill: NONE, stroke: '#3A3A37', strokeWidth: 1, name: 'Frame' }),
  T('APERTURE', 72, 64, 420, 16, { fontSize: 9, letterSpacing: 3.6, color: APERTURE_SILVER, fontWeight: 500 }),
  T('IDENTITY  /  01', 600, 64, 328, 16, { fontSize: 9, letterSpacing: 3, color: '#8A8A84', align: 'right' }),
  ...apertureMark(436, 410, 400),
  T('APERTURE', 72, 664, 620, 110, {
    fontFamily: FONTS.black, fontSize: 88, letterSpacing: 4, color: '#F4F1EA', lineHeight: 1.05,
  }),
  T('PHOTOGRAPHY   ·   FILM   ·   DIRECTION', 76, 792, 640, 22, {
    fontSize: 12, letterSpacing: 4.2, color: APERTURE_SILVER,
  }),
  T('MARK 01 / PRIMARY', 716, 664, 212, 16, { fontSize: 9, letterSpacing: 2.4, color: '#F4F1EA' }),
  T('Six blades on a 60° axis.\nSilver on graphite.\nMinimum width 24 mm.', 716, 692, 212, 84, {
    fontSize: 11, lineHeight: 1.85, color: '#8A8A84',
  }),
  S('rect', 72, 878, 856, 1, { fill: '#3A3A37', name: 'Rule' }),
  T('EST. MMXVI', 72, 898, 300, 16, { fontSize: 9, letterSpacing: 3, color: '#8A8A84' }),
  T('LISBON, PORTUGAL', 600, 898, 328, 16, { fontSize: 9, letterSpacing: 3, color: '#8A8A84', align: 'right' }),
]);

const apertureApplication = page('Application', bgSolid('#1A1A1A'), [
  IMG(PHOTOS.portrait, 0, 0, 1000, 1000, {
    name: 'Portrait',
    filters: { brightness: 94, contrast: 112, saturate: 100, blur: 0, grayscale: 100, sepia: 0, hue: 0 },
    overlay: '#1A1A1A',
    overlayOpacity: 0.42,
    zoom: 1.24,
    offsetX: 0.11,
    offsetY: 0.02,
  }),
  T('APPLICATION  /  02', 72, 60, 400, 16, { fontSize: 9, letterSpacing: 3.2, color: APERTURE_SILVER }),
  T('REVERSED ON IMAGE', 600, 60, 328, 16, { fontSize: 9, letterSpacing: 2.8, color: APERTURE_SILVER, align: 'right' }),
  ...apertureMark(300, 336, 300),
  T('APERTURE', 72, 534, 600, 70, {
    fontFamily: FONTS.black, fontSize: 54, letterSpacing: 5, color: '#F4F1EA',
  }),
  T('PHOTOGRAPHY STUDIO', 76, 600, 600, 18, {
    fontSize: 9, letterSpacing: 4.6, color: APERTURE_SILVER,
  }),
  S('rect', 0, 660, 1000, 340, { fill: '#1A1A1A', name: 'Usage panel' }),
  S('rect', 0, 660, 1000, 1, { fill: 'rgba(201,201,196,.4)', name: 'Panel rule' }),
  T('USAGE', 72, 696, 300, 16, { fontSize: 9, letterSpacing: 3, color: APERTURE_SILVER }),
  T('Use the reversed lockup on photography darker\nthan 40% grey. Clear space equals the cap\nheight of the wordmark.', 72, 722, 520, 100, {
    fontSize: 12.5, lineHeight: 1.95, color: 'rgba(244,241,234,.7)',
  }),
  T('CLEAR SPACE', 680, 696, 248, 16, { fontSize: 9, letterSpacing: 3, color: APERTURE_SILVER }),
  T('X = CAP HEIGHT', 680, 722, 248, 18, { fontSize: 11, letterSpacing: 1.6, color: '#F4F1EA' }),
  T('MINIMUM WIDTH', 680, 776, 248, 16, { fontSize: 9, letterSpacing: 3, color: '#8A8A84' }),
  T('64 PX  /  24 MM', 680, 798, 248, 20, { fontSize: 12, color: '#F4F1EA' }),
  T('APERTURE.STUDIO', 72, 902, 400, 16, { fontSize: 9, letterSpacing: 3, color: '#8A8A84' }),
  T('02 / 02', 800, 902, 128, 16, { fontSize: 9, letterSpacing: 2.4, color: '#8A8A84', align: 'right' }),
]);

/* ---------- 2. Marrow ---------- */

const marrowFront = page('Front', bgSolid('#5A1F1B'), [
  S('rect', 40, 40, 970, 520, { fill: NONE, stroke: 'rgba(229,192,123,.5)', strokeWidth: 1.2, name: 'Border' }),
  T('RESTAURANT', 86, 60, 300, 16, { fontSize: 9, letterSpacing: 3.4, color: '#E5C07B' }),
  T('LONDON  ·  EST. 2019', 700, 60, 264, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(229,192,123,.65)', align: 'right' }),
  S('ellipse', 86, 132, 270, 270, { fill: '#E5C07B', name: 'Monogram disc' }),
  ...marrowMonogram(221, 267),
  T('MARROW', 86, 434, 520, 100, {
    fontFamily: FONTS.fraunces, fontSize: 82, fontWeight: 600, letterSpacing: 12, color: '#E5C07B',
  }),
  T('KITCHEN  &  CELLAR', 90, 528, 400, 16, { fontSize: 9, letterSpacing: 4.4, color: 'rgba(229,192,123,.72)' }),
  S('rect', 620, 132, 1, 360, { fill: 'rgba(229,192,123,.35)', name: 'Column rule' }),
  T('A NEIGHBOURHOOD KITCHEN\nCOOKING OVER FIRE.', 664, 148, 302, 60, {
    fontSize: 11, letterSpacing: 1.8, lineHeight: 2, color: '#E5C07B',
  }),
  T('SEASONAL  ·  OPEN FIRE  ·  LOW LIGHT', 664, 288, 302, 16, {
    fontSize: 8.5, letterSpacing: 2.2, color: 'rgba(229,192,123,.6)',
  }),
  T('42 LAMB’S CONDUIT STREET\nLONDON WC1N 3LL', 664, 356, 302, 50, {
    fontSize: 10, lineHeight: 2, color: 'rgba(229,192,123,.75)',
  }),
  T('MARROWLONDON.COM', 664, 500, 302, 16, { fontSize: 10, letterSpacing: 2.4, color: '#E5C07B' }),
]);

const marrowBack = page('Back', bgSolid('#E5C07B'), [
  S('rect', 62, 52, 926, 1, { fill: 'rgba(20,19,15,.32)', name: 'Top rule' }),
  T('MARROW', 62, 68, 300, 42, {
    fontFamily: FONTS.fraunces, fontSize: 28, fontWeight: 600, letterSpacing: 5, color: '#5A1F1B',
  }),
  T('KITCHEN & CELLAR', 700, 76, 288, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(20,19,15,.6)', align: 'right' }),
  T('Seasonal cooking over fire, in a small room on Lamb’s Conduit Street.', 62, 128, 926, 34, {
    fontFamily: FONTS.fraunces, fontSize: 22, color: '#14130F',
  }),
  S('rect', 62, 180, 926, 1, { fill: 'rgba(90,31,27,.45)', name: 'Rule' }),
  T('RESERVATIONS', 62, 212, 240, 16, { fontSize: 9, letterSpacing: 3, color: '#5A1F1B' }),
  T('STUDIO', 386, 212, 240, 16, { fontSize: 9, letterSpacing: 3, color: '#5A1F1B' }),
  T('HOURS', 706, 212, 240, 16, { fontSize: 9, letterSpacing: 3, color: '#5A1F1B' }),
  S('rect', 346, 204, 1, 210, { fill: 'rgba(20,19,15,.2)', name: 'Column rule' }),
  S('rect', 666, 204, 1, 210, { fill: 'rgba(20,19,15,.2)', name: 'Column rule' }),
  T('reservations@marrow.co\n+44 20 7946 0218', 62, 240, 260, 70, {
    fontSize: 13.5, lineHeight: 1.9, color: '#14130F',
  }),
  T('42 Lamb’s Conduit Street\nLondon WC1N 3LL\nUnited Kingdom', 386, 240, 250, 95, {
    fontSize: 13.5, lineHeight: 1.9, color: '#14130F',
  }),
  T('Tue – Thu   17:30 – 23:00\nFri – Sat   12:00 – 00:00\nSun   12:00 – 16:00', 706, 240, 282, 95, {
    fontSize: 12, lineHeight: 1.9, color: '#14130F',
  }),
  T('CLOSED MONDAY', 706, 342, 282, 14, { fontSize: 8.5, letterSpacing: 2.6, color: 'rgba(20,19,15,.55)' }),
  T('PRIVATE DINING  ·  18 COVERS', 706, 386, 282, 14, { fontSize: 8.5, letterSpacing: 2.2, color: 'rgba(20,19,15,.55)' }),
  S('rect', 0, 500, 1050, 100, { fill: '#5A1F1B', name: 'Footer band' }),
  T('BOOK A TABLE  —  MARROWLONDON.COM', 62, 536, 600, 20, { fontSize: 10, letterSpacing: 2.8, color: '#E5C07B' }),
  T('SINCE 2019', 700, 536, 288, 20, { fontSize: 10, letterSpacing: 2.8, color: 'rgba(229,192,123,.7)', align: 'right' }),
]);

/* ---------- 3. Kite ---------- */

const KITE_BLUE = '#2440F0';
const KITE_INK = '#101010';
const KITE_MUTED = '#6A6A66';

const kitePrimary = page('Primary', bgSolid(KITE_BLUE), [
  S('rect', 282, 0, 1, 1000, { fill: 'rgba(255,255,255,.16)', name: 'Grid vertical' }),
  S('rect', 500, 0, 1, 1000, { fill: 'rgba(255,255,255,.16)', name: 'Grid vertical' }),
  S('rect', 718, 0, 1, 1000, { fill: 'rgba(255,255,255,.16)', name: 'Grid vertical' }),
  S('rect', 0, 282, 1000, 1, { fill: 'rgba(255,255,255,.16)', name: 'Grid horizontal' }),
  S('rect', 0, 500, 1000, 1, { fill: 'rgba(255,255,255,.16)', name: 'Grid horizontal' }),
  S('rect', 0, 718, 1000, 1, { fill: 'rgba(255,255,255,.16)', name: 'Grid horizontal' }),
  T('KITE', 64, 88, 640, 200, {
    fontFamily: FONTS.manrope, fontSize: 188, fontWeight: 800, letterSpacing: -8, color: '#FFFFFF', lineHeight: 1,
  }),
  T('FINANCE FOR PEOPLE WHO MOVE.', 68, 300, 500, 18, {
    fontSize: 12, letterSpacing: 4, color: 'rgba(255,255,255,.8)',
  }),
  S('rect', 64, 372, 872, 3, { fill: '#FFFFFF', name: 'Rule' }),
  T('MOVE MONEY\nLIKE AIR.', 64, 430, 440, 150, {
    fontFamily: FONTS.manrope, fontSize: 52, fontWeight: 600, lineHeight: 1.18, letterSpacing: -1.4, color: '#FFFFFF',
  }),
  S('rect', 560, 372, 3, 564, { fill: '#FFFFFF', name: 'Rule' }),
  ...kiteMark(598, 438, 240, 280, '#FFFFFF', KITE_BLUE),
  T('KITE FINANCIAL', 64, 884, 300, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,.7)' }),
  T('MARK 01  /  COBALT', 640, 884, 296, 16, { fontSize: 9, letterSpacing: 2.6, color: 'rgba(255,255,255,.7)', align: 'right' }),
]);

const kiteConstruction = page('Construction', bgSolid('#FFFFFF'), [
  T('MARK  /  CONSTRUCTION', 72, 60, 420, 16, { fontSize: 9, letterSpacing: 3.2, color: KITE_BLUE, fontWeight: 600 }),
  T('Clear space & scale', 72, 86, 620, 54, {
    fontFamily: FONTS.manrope, fontSize: 38, fontWeight: 800, letterSpacing: -1.2, color: KITE_INK,
  }),
  T('X is half the mark width. Nothing enters the clear zone; at 44 px the mark reduces to a solid diamond.', 72, 150, 480, 60, {
    fontSize: 12.5, lineHeight: 1.7, color: '#4A4A48',
  }),
  S('rect', 58, 224, 400, 510, {
    fill: NONE, stroke: KITE_BLUE, strokeWidth: 1.5, dash: true, name: 'Clear space',
  }),
  ...kiteMark(158, 324, 200, 230, KITE_BLUE, '#FFFFFF'),
  T('X', 72, 416, 40, 20, { fontFamily: FONTS.manrope, fontSize: 12, fontWeight: 700, color: KITE_BLUE }),
  T('X = HALF THE MARK WIDTH', 58, 756, 400, 16, { fontSize: 9, letterSpacing: 2.2, color: KITE_BLUE }),
  T('MINIMUM SIZE', 548, 232, 380, 16, { fontSize: 9, letterSpacing: 3, color: '#8A8A84' }),
  ...kiteMark(548, 268, 88, 101, KITE_BLUE, '#FFFFFF'),
  T('88 PX — DIGITAL', 548, 432, 200, 16, { fontSize: 9, letterSpacing: 2.2, color: KITE_INK }),
  S('diamond', 690, 268, 44, 50, { fill: KITE_BLUE, name: 'Kite micro mark' }),
  T('44 PX — PRINT', 690, 432, 200, 16, { fontSize: 9, letterSpacing: 2.2, color: KITE_INK }),
  S('rect', 548, 480, 382, 1, { fill: '#DCDAD4', name: 'Rule' }),
  T('KITE', 548, 504, 360, 84, {
    fontFamily: FONTS.manrope, fontSize: 68, fontWeight: 800, letterSpacing: -2, color: KITE_INK, lineHeight: 1.1,
  }),
  T('FINANCE, SIMPLIFIED.', 550, 598, 360, 16, { fontSize: 9, letterSpacing: 3, color: KITE_MUTED }),
  T('Wordmark clear space equals the cap height.\nNever set the mark below 44 px.', 550, 646, 380, 44, {
    fontSize: 11, lineHeight: 1.7, color: KITE_MUTED,
  }),
  T('COBALT #2440F0   ·   MANROPE 800   ·   12-UNIT GRID', 72, 900, 700, 16, {
    fontSize: 9, letterSpacing: 2.2, color: KITE_MUTED,
  }),
  T('02 / 02', 800, 900, 128, 16, { fontSize: 9, letterSpacing: 2.2, color: KITE_MUTED, align: 'right' }),
]);

/* ---------- 4. Atelier No. 9 ---------- */

const ATELIER_PINK = '#F2B8C6';
const ATELIER_IVORY = '#F3EFE7';
const ATELIER_INK = '#111111';

const atelierFront = page('Front', bgSolid(ATELIER_INK), [
  S('rect', 384, 60, 1, 476, { fill: 'rgba(242,184,198,.34)', name: 'Rule vertical' }),
  S('rect', 64, 448, 922, 1, { fill: 'rgba(242,184,198,.34)', name: 'Rule horizontal' }),
  T('ATELIER NO. 9', 64, 52, 300, 16, { fontSize: 9, letterSpacing: 3.4, color: ATELIER_PINK }),
  T('PARIS  —  EST. 2021', 700, 52, 286, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(243,239,231,.55)', align: 'right' }),
  T('N°', 64, 92, 80, 30, { fontFamily: FONTS.serif, fontSize: 26, color: ATELIER_PINK, letterSpacing: 2 }),
  T('09', 58, 128, 310, 300, { fontFamily: FONTS.serif, fontSize: 244, lineHeight: 0.92, color: ATELIER_PINK }),
  T('ATELIER', 440, 116, 546, 110, { fontFamily: FONTS.serif, fontSize: 100, lineHeight: 0.92, letterSpacing: 4, color: ATELIER_IVORY }),
  T('PRÊT-À-PORTER  /  MADE TO MEASURE', 444, 244, 500, 18, { fontSize: 10, letterSpacing: 2.6, color: ATELIER_PINK }),
  T('Clothes cut for one body at a time.\nMade slowly, by hand, in a small Paris atelier.', 444, 292, 500, 76, {
    fontFamily: FONTS.serif, fontSize: 22, lineHeight: 1.5, color: ATELIER_IVORY,
  }),
  T('FALL / WINTER 26', 444, 400, 300, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(243,239,231,.5)' }),
  T('9 RUE DE TURENNE, 75004 PARIS', 64, 476, 500, 16, {
    fontSize: 9, letterSpacing: 2.6, color: 'rgba(243,239,231,.55)',
  }),
  T('BONJOUR@ATELIERNO9.COM', 64, 500, 500, 16, { fontSize: 9, letterSpacing: 2.6, color: ATELIER_PINK }),
  T('N° 09 / IDENTITY', 760, 476, 226, 16, {
    fontSize: 9, letterSpacing: 2.6, color: 'rgba(243,239,231,.55)', align: 'right',
  }),
  T('CARD 01', 760, 500, 226, 16, { fontSize: 9, letterSpacing: 2.6, color: 'rgba(243,239,231,.55)', align: 'right' }),
]);

const atelierBack = page('Back', bgSolid(ATELIER_IVORY), [
  S('rect', 64, 92, 922, 1, { fill: 'rgba(17,17,17,.22)', name: 'Rule top' }),
  S('rect', 352, 92, 1, 378, { fill: 'rgba(17,17,17,.16)', name: 'Rule vertical' }),
  S('rect', 700, 92, 1, 378, { fill: 'rgba(17,17,17,.16)', name: 'Rule vertical' }),
  S('rect', 64, 470, 922, 1, { fill: 'rgba(17,17,17,.22)', name: 'Rule bottom' }),
  T('ATELIER NO. 9', 64, 54, 320, 16, { fontSize: 9, letterSpacing: 3.4, color: ATELIER_INK }),
  T('STUDIO — PARIS', 700, 54, 286, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(17,17,17,.55)', align: 'right' }),
  S('rect', 64, 128, 28, 3, { fill: ATELIER_PINK, name: 'Tick' }),
  S('rect', 384, 128, 28, 3, { fill: ATELIER_PINK, name: 'Tick' }),
  S('rect', 732, 128, 28, 3, { fill: ATELIER_PINK, name: 'Tick' }),
  T('STUDIO', 64, 148, 240, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(17,17,17,.5)' }),
  T('CONTACT', 384, 148, 240, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(17,17,17,.5)' }),
  T('HOURS', 732, 148, 240, 16, { fontSize: 9, letterSpacing: 3, color: 'rgba(17,17,17,.5)' }),
  T('9 Rue de Turenne\n75004 Paris\nFrance', 64, 180, 260, 90, {
    fontSize: 14.5, lineHeight: 1.8, color: ATELIER_INK,
  }),
  T('BY APPOINTMENT ONLY', 64, 292, 260, 14, { fontSize: 8.5, letterSpacing: 2.2, color: 'rgba(17,17,17,.55)' }),
  T('bonjour@atelierno9.com\n+33 1 42 77 09 09\n@atelierno9', 384, 180, 280, 100, {
    fontSize: 14.5, lineHeight: 1.9, color: ATELIER_INK,
  }),
  T('MON – FRI   10:00 – 18:30\nSAT   11:00 – 16:00\nSUN   CLOSED', 732, 180, 254, 100, {
    fontSize: 12, lineHeight: 2, color: ATELIER_INK,
  }),
  T('COLLECTION APPOINTMENTS AVAILABLE', 732, 300, 254, 14, {
    fontSize: 8.5, letterSpacing: 1.8, color: 'rgba(17,17,17,.55)',
  }),
  T('MADE IN PARIS  ·  SINCE 2021', 64, 512, 520, 16, {
    fontSize: 9, letterSpacing: 2.6, color: 'rgba(17,17,17,.55)',
  }),
  T('SPRING / SUMMER 27', 600, 512, 330, 16, {
    fontSize: 9, letterSpacing: 2.6, color: 'rgba(17,17,17,.55)', align: 'right',
  }),
  S('rect', 950, 500, 36, 36, { fill: ATELIER_PINK, name: 'Pink block' }),
  T('9', 950, 512, 36, 24, { fontFamily: FONTS.serif, fontSize: 22, color: ATELIER_INK, align: 'center' }),
]);

/* ---------- export ---------- */

export const BRAND_TEMPLATES: Template[] = [
  {
    id: 'br-aperture',
    name: 'Aperture — Photography',
    category: 'Logo',
    description: 'A six-blade aperture mark for a photography studio — graphite board, reversed lockup over a portrait.',
    size: { name: 'Logo', width: 1000, height: 1000 },
    pages: [aperturePrimary, apertureApplication],
    tags: ['logo', 'photography', 'brand', 'monochrome', 'graphite', 'geometric'],
  },
  {
    id: 'br-marrow',
    name: 'Marrow — Restaurant Card',
    category: 'Business card',
    description: 'Oxblood and butter card for a fire-led restaurant — monogram front, full contact back.',
    size: { name: 'Business Card', width: 1050, height: 600 },
    pages: [marrowFront, marrowBack],
    tags: ['business card', 'restaurant', 'monogram', 'print', 'brand'],
  },
  {
    id: 'br-kite',
    name: 'Kite — Fintech',
    category: 'Logo',
    description: 'A cobalt kite glyph on a strict grid — primary board and a clear-space spec sheet.',
    size: { name: 'Logo', width: 1000, height: 1000 },
    pages: [kitePrimary, kiteConstruction],
    tags: ['logo', 'fintech', 'cobalt', 'grid', 'geometric', 'brand'],
  },
  {
    id: 'br-atelier-nine',
    name: 'Atelier No. 9 — Fashion Card',
    category: 'Business card',
    description: 'Black, pink and ivory card for a fashion atelier — serif wordmark, number 09, fine rule grid.',
    size: { name: 'Business Card', width: 1050, height: 600 },
    pages: [atelierFront, atelierBack],
    tags: ['business card', 'fashion', 'serif', 'pink', 'print', 'brand'],
  },
];
