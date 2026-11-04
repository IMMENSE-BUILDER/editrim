import type { Template } from '../types';
import { T, S, IMG, IC, page, G, bgSolid, PHOTOS, FONTS } from '../templateKit';

/** Product, retail and commerce templates. */

/* ---------- 01. OMNI — hardware product hero (Instagram 1080) ---------- */
const OMNI_BLUE = '#1F4BFF';
const OMNI_STEEL = '#C7CDD6';
const OMNI_INK = '#0B0C0F';
const OMNI_LIGHT = '#EDF1F6';

const omni = page('Launch', bgSolid(OMNI_STEEL), [
  // One strong shape field: the blue horizon the product sits in.
  S('rect', 0, 0, 1080, 646, { fill: OMNI_BLUE }),
  T('OMNI  /  PRECISION INSTRUMENTS', 60, 44, 620, 24, {
    fontFamily: FONTS.inter, fontSize: 12, fontWeight: 600, letterSpacing: 3.2, color: OMNI_LIGHT,
  }),
  T('SERIES 01', 860, 44, 160, 24, {
    fontFamily: FONTS.inter, fontSize: 12, fontWeight: 600, letterSpacing: 3.2, color: OMNI_LIGHT, align: 'right',
  }),
  IMG(PHOTOS.watch, 270, 86, 540, 500, {
    name: 'OMNI watch', mask: 'ellipse', filters: { brightness: 102, contrast: 112, saturate: 100, blur: 0, grayscale: 100, sepia: 0, hue: 0 },
  }),
  T('THE OMNI ONE  —  40MM', 340, 596, 400, 24, {
    fontFamily: FONTS.inter, fontSize: 12, fontWeight: 500, letterSpacing: 3.2, color: OMNI_LIGHT, align: 'center',
  }),
  T('OMNI', 40, 652, 1000, 184, {
    fontFamily: FONTS.black, fontSize: 168, fontWeight: 400, lineHeight: 1, letterSpacing: 10, color: OMNI_INK, align: 'center',
  }),
  T('CASE — 40MM BRUSHED TITANIUM', 60, 862, 540, 24, {
    fontFamily: FONTS.inter, fontSize: 14, fontWeight: 500, letterSpacing: 1.4, color: '#3C4048',
  }),
  T('GLASS — SAPPHIRE, ANTI-REFLECTIVE', 60, 896, 540, 24, {
    fontFamily: FONTS.inter, fontSize: 14, fontWeight: 500, letterSpacing: 1.4, color: '#3C4048',
  }),
  T('RESERVE — 72 HOURS', 60, 930, 540, 24, {
    fontFamily: FONTS.inter, fontSize: 14, fontWeight: 500, letterSpacing: 1.4, color: '#3C4048',
  }),
  T('€349', 740, 842, 280, 60, {
    fontFamily: FONTS.black, fontSize: 46, lineHeight: 1, letterSpacing: 0, color: OMNI_INK, align: 'right',
  }),
  T('INCLUDES STRAP + TOOL', 740, 906, 280, 20, {
    fontFamily: FONTS.inter, fontSize: 10, fontWeight: 500, letterSpacing: 2.2, color: '#3C4048', align: 'right',
  }),
  S('rect', 60, 972, 380, 54, { name: 'Pre-order button', fill: OMNI_BLUE, radius: 27 }),
  T('PRE-ORDER  →', 60, 972, 380, 54, {
    fontFamily: FONTS.inter, fontSize: 13, fontWeight: 700, letterSpacing: 2.4, color: OMNI_LIGHT, align: 'center', valign: 'middle',
  }),
  T('OMNI.STUDIO  /  NO. 01 OF 500', 600, 990, 420, 20, {
    fontFamily: FONTS.inter, fontSize: 10, fontWeight: 500, letterSpacing: 2.2, color: '#3C4048', align: 'right',
  }),
]);

/* ---------- 02. SUNDAE SOCIAL — pop-up story (1080×1920) ---------- */
const PISTACHIO = '#BFD8A6';
const RASPBERRY = '#D94168';
const CHOCOLATE = '#3A2118';

const FLAVOURS: Array<[string, string]> = [
  ['01   PISTACHIO & SALTED HONEY', '£4.5'],
  ['02   RASPBERRY RIPPLE', '£4.5'],
  ['03   DARK CHOCOLATE SORBET', '£5'],
  ['04   LEMON & BASIL', '£4.5'],
];

const sundae = page('Pop-up', bgSolid(PISTACHIO), [
  T('A SUMMER POP-UP  /  HACKNEY', 72, 74, 640, 24, {
    fontFamily: FONTS.inter, fontSize: 13, fontWeight: 600, letterSpacing: 3.4, color: CHOCOLATE,
  }),
  T('SUNDAE', 60, 126, 960, 212, {
    fontFamily: FONTS.fraunces, fontSize: 190, fontWeight: 600, lineHeight: 0.9, letterSpacing: -5, color: CHOCOLATE,
  }),
  T('SOCIAL', 60, 300, 960, 212, {
    fontFamily: FONTS.fraunces, fontSize: 190, fontWeight: 600, lineHeight: 0.9, letterSpacing: -5, color: RASPBERRY,
  }),
  T('Ice cream, loud music and a very\nlong queue. Worth it.', 72, 504, 640, 80, {
    fontFamily: FONTS.serif, fontSize: 27, italic: true, lineHeight: 1.24, color: CHOCOLATE,
  }),
  S('burst', 856, 496, 152, 152, { name: 'Opening hours sticker', fill: RASPBERRY }),
  T('12—6', 856, 496, 152, 152, {
    fontFamily: FONTS.condensed, fontSize: 42, lineHeight: 1, letterSpacing: 1, color: '#F4F7EC', align: 'center', valign: 'middle',
  }),
  IMG(PHOTOS.flowers, 72, 632, 936, 560, { name: 'Flowers at the counter', radius: 18 }),
  T('THE MENU', 72, 1252, 500, 24, {
    fontFamily: FONTS.inter, fontSize: 13, fontWeight: 600, letterSpacing: 3.4, color: CHOCOLATE,
  }),
  ...FLAVOURS.flatMap(([name, price], i) => [
    T(name, 72, 1292 + i * 60, 700, 34, {
      fontFamily: FONTS.fraunces, fontSize: 24, fontWeight: 600, lineHeight: 1.1, letterSpacing: -0.2, color: CHOCOLATE,
    }),
    T(price, 900, 1292 + i * 60, 108, 34, {
      fontFamily: FONTS.dmSerif, fontSize: 23, lineHeight: 1.1, color: CHOCOLATE, align: 'right',
    }),
  ]),
  S('rect', 72, 1560, 936, 184, { name: 'Date card', fill: CHOCOLATE, radius: 20 }),
  T('SAT 12 JULY', 104, 1582, 440, 58, {
    fontFamily: FONTS.fraunces, fontSize: 46, fontWeight: 600, lineHeight: 1, letterSpacing: -1, color: PISTACHIO,
  }),
  T('12—6PM   ·   14 KILN LANE, HACKNEY E2', 104, 1652, 660, 24, {
    fontFamily: FONTS.inter, fontSize: 14, fontWeight: 500, letterSpacing: 1.6, color: 'rgba(191,216,166,.9)',
  }),
  T('NO TICKETS  ·  JUST TURN UP', 104, 1692, 560, 20, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 500, letterSpacing: 2.6, color: 'rgba(191,216,166,.62)',
  }),
  T('SUNDAE SOCIAL  /  @SUNDAESOCIAL', 72, 1834, 640, 22, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 500, letterSpacing: 3, color: 'rgba(58,33,24,.72)',
  }),
]);

/* ---------- 03. RUNWAY 07 — fashion film thumbnail (1280×720) ---------- */
const RUNWAY_RED = '#E63B2E';
const RUNWAY_BONE = '#EFE8DA';

const runway = page('Thumbnail', bgSolid('#0B0B0C'), [
  IMG(PHOTOS.portrait, 0, 0, 1280, 720, {
    name: 'Portrait still', overlay: '#08080A', overlayOpacity: 0.1,
    filters: { brightness: 94, contrast: 118, saturate: 100, blur: 0, grayscale: 100, sepia: 0, hue: 0 },
  }),
  S('rect', 0, 0, 1280, 250, { name: 'Top shade', fill: G('rgba(8,8,10,.9)', 'rgba(8,8,10,0)', 180) }),
  S('rect', 0, 0, 1280, 720, { name: 'Left shade', fill: G('rgba(8,8,10,.55)', 'rgba(8,8,10,0)', 90) }),
  S('rect', 0, 340, 1280, 380, { name: 'Bottom shade', fill: G('rgba(8,8,10,0)', 'rgba(8,8,10,.92)', 180) }),
  S('rect', 48, 48, 248, 44, { name: 'Season chip', fill: RUNWAY_RED }),
  T('SS26  /  FILM 07', 48, 48, 248, 44, {
    fontFamily: FONTS.inter, fontSize: 13, fontWeight: 600, letterSpacing: 2.6, color: RUNWAY_BONE, align: 'center', valign: 'middle',
  }),
  T('12:48', 1108, 54, 124, 30, {
    fontFamily: FONTS.inter, fontSize: 17, fontWeight: 600, letterSpacing: 1.6, color: RUNWAY_BONE, align: 'right',
  }),
  S('rect', 48, 288, 64, 5, { name: 'Red rule', fill: RUNWAY_RED }),
  T('THE LAST SHOW', 48, 306, 520, 26, {
    fontFamily: FONTS.inter, fontSize: 14, fontWeight: 600, letterSpacing: 4, color: RUNWAY_BONE,
  }),
  T('RUNWAY', 44, 340, 900, 250, {
    fontFamily: FONTS.condensed, fontSize: 246, fontWeight: 400, lineHeight: 0.86, letterSpacing: 4, color: RUNWAY_BONE,
    shadow: { x: 0, y: 8, blur: 28, color: 'rgba(0,0,0,.55)' },
  }),
  T('07', 880, 340, 360, 250, {
    fontFamily: FONTS.condensed, fontSize: 246, fontWeight: 400, lineHeight: 0.86, letterSpacing: 2, color: RUNWAY_RED, align: 'right',
  }),
  T('SEVEN LOOKS. ONE TAKE.', 48, 596, 620, 26, {
    fontFamily: FONTS.inter, fontSize: 14, fontWeight: 500, letterSpacing: 3, color: 'rgba(239,232,218,.82)',
  }),
  S('rect', 0, 650, 1280, 70, { name: 'Film bar', fill: RUNWAY_RED }),
  T('WATCH THE FILM  →', 48, 650, 480, 70, {
    fontFamily: FONTS.inter, fontSize: 13, fontWeight: 700, letterSpacing: 2.6, color: RUNWAY_BONE, valign: 'middle',
  }),
  T('DIR. A. MORROW  /  SHOT ON 35MM', 760, 650, 472, 70, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 500, letterSpacing: 2.2, color: 'rgba(239,232,218,.9)', align: 'right', valign: 'middle',
  }),
]);

/* ---------- 04. THE GOOD SHELF — grocer banner (1584×396) ---------- */
const SHELF_OLIVE = '#4E5B3E';
const SHELF_ORANGE = '#E86A33';
const SHELF_OAT = '#E9DFC9';

const goodShelf = page('Banner', bgSolid(SHELF_OAT), [
  S('rect', 0, 0, 16, 396, { name: 'Olive edge', fill: SHELF_OLIVE }),
  S('rect', 520, 56, 1, 284, { name: 'Divider', fill: 'rgba(78,91,62,.28)' }),
  IC('leaf', 64, 56, 28, SHELF_OLIVE, 1.8),
  T('THE GOOD SHELF', 104, 54, 400, 28, {
    fontFamily: FONTS.grotesk, fontSize: 20, fontWeight: 700, letterSpacing: 3.2, color: SHELF_OLIVE,
  }),
  T('ONLINE GROCER  /  EST. 2021', 64, 94, 400, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 500, letterSpacing: 2.4, color: 'rgba(78,91,62,.72)',
  }),
  S('rect', 556, 78, 24, 4, { name: 'Orange tick', fill: SHELF_ORANGE }),
  T("THIS WEEK'S BOX", 592, 70, 340, 22, {
    fontFamily: FONTS.inter, fontSize: 12, fontWeight: 600, letterSpacing: 3.2, color: SHELF_OLIVE,
  }),
  T('Eat the whole\nrainbow.', 552, 102, 480, 150, {
    fontFamily: FONTS.fraunces, fontSize: 60, fontWeight: 600, lineHeight: 1.02, letterSpacing: -1.5, color: SHELF_OLIVE,
  }),
  T('20% OFF YOUR FIRST BOX  ·  CODE SHELF20', 556, 258, 480, 22, {
    fontFamily: FONTS.inter, fontSize: 13, fontWeight: 600, letterSpacing: 1.8, color: SHELF_OLIVE,
  }),
  S('rect', 556, 296, 274, 52, { name: 'Shop button', fill: SHELF_OLIVE, radius: 26 }),
  T('BUILD YOUR BOX  →', 556, 296, 274, 52, {
    fontFamily: FONTS.inter, fontSize: 12, fontWeight: 700, letterSpacing: 2.2, color: SHELF_OAT, align: 'center', valign: 'middle',
  }),
  T('PICKED THURSDAY — AT YOUR DOOR FRIDAY', 64, 312, 432, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 500, letterSpacing: 2.2, color: 'rgba(78,91,62,.74)',
  }),
  S('ellipse', 1160, 8, 380, 380, { name: 'Orange field', fill: SHELF_ORANGE }),
  IMG(PHOTOS.tomato, 1190, 38, 320, 320, {
    name: 'Vine tomatoes', mask: 'ellipse', filters: { brightness: 104, contrast: 104, saturate: 110, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
  }),
  S('ellipse', 1124, 272, 116, 116, { name: 'Price badge', fill: SHELF_OAT }),
  T('£24', 1124, 292, 116, 44, {
    fontFamily: FONTS.black, fontSize: 30, lineHeight: 1, color: SHELF_OLIVE, align: 'center',
  }),
  T('A BOX', 1124, 338, 116, 16, {
    fontFamily: FONTS.inter, fontSize: 9, fontWeight: 600, letterSpacing: 2.4, color: SHELF_OLIVE, align: 'center',
  }),
]);

export const COMMERCE_TEMPLATES: Template[] = [
  {
    id: 'co-omni',
    name: 'OMNI — Hardware Launch',
    category: 'Instagram',
    description: 'A tall product hero with a single electric-blue field, one watch and a tight spec stack.',
    size: { name: 'Instagram Post', width: 1080, height: 1080 },
    pages: [omni],
    tags: ['product', 'launch', 'hardware', 'blue', 'specs'],
  },
  {
    id: 'co-sundae',
    name: 'Sundae Social',
    category: 'Story',
    description: 'A vertical ice-cream pop-up story with a flavour menu, date card and playful display type.',
    size: { name: 'Instagram Story', width: 1080, height: 1920 },
    pages: [sundae],
    tags: ['food', 'pop-up', 'story', 'menu', 'playful'],
  },
  {
    id: 'co-runway-07',
    name: 'Runway 07',
    category: 'YouTube',
    description: 'A black-and-bone fashion film thumbnail with a full-bleed portrait and condensed title.',
    size: { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    pages: [runway],
    tags: ['fashion', 'film', 'thumbnail', 'bold', 'red'],
  },
  {
    id: 'co-good-shelf',
    name: 'The Good Shelf',
    category: 'Banner',
    description: 'A wide grocer banner with a brand lockup, short offer, CTA and a circular produce feature.',
    size: { name: 'Banner', width: 1584, height: 396 },
    pages: [goodShelf],
    tags: ['retail', 'grocery', 'banner', 'offer', 'logo'],
  },
];
