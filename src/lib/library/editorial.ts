import type { ImageFilters, Template } from '../types';
import { T, S, IMG, page, NONE, G, bgSolid, PHOTOS, FONTS } from '../templateKit';

/**
 * Editorial, print and publication templates.
 * Each piece commits to a single art direction: risograph poster, izakaya menu,
 * supper-club ticket and a studio CV.
 */

const FILT = (over: Partial<ImageFilters> = {}): ImageFilters => ({
  brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0, ...over,
});

const rule = (x: number, y: number, w: number, color: string, thickness = 1) =>
  S('line', x, y, w, thickness, { fill: NONE, stroke: color, strokeWidth: thickness });

/* ------------------------------------------------------------------ */
/* 01 — Field Notes: risograph art-book poster                         */
/* ------------------------------------------------------------------ */

const NEWS = '#E9E4D8';
const RISO_INK = '#101010';
const FLUOR = '#FF4D1F';

const fieldNotes = page('Poster', bgSolid(NEWS), [
  T('FIELD NOTES  /  A JOURNAL OF HIGH GROUND', 72, 36, 640, 22, {
    fontFamily: FONTS.inter, fontSize: 12, fontWeight: 600, letterSpacing: 2.4,
    color: 'rgba(16,16,16,.72)',
  }),
  T('VOL. 03 — AUTUMN 2026', 900, 36, 268, 22, {
    fontFamily: FONTS.inter, fontSize: 12, fontWeight: 600, letterSpacing: 2.4,
    color: 'rgba(16,16,16,.72)', align: 'right',
  }),
  rule(72, 74, 1096, RISO_INK, 2),

  T('FIELD', 64, 100, 1140, 240, {
    fontFamily: FONTS.black, fontSize: 238, lineHeight: 0.88, letterSpacing: -6, color: RISO_INK,
  }),
  T('NOTES', 214, 308, 1000, 240, {
    fontFamily: FONTS.black, fontSize: 238, lineHeight: 0.88, letterSpacing: -6, color: FLUOR,
  }),
  S('rect', 1032, 104, 136, 136, { fill: FLUOR, name: 'Edition block' }),
  T('03', 1032, 144, 136, 64, {
    fontFamily: FONTS.serif, fontSize: 62, lineHeight: 1, color: NEWS, align: 'center', valign: 'middle',
  }),

  T('AN ATLAS OF HIGH GROUND', 72, 598, 420, 22, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 700, letterSpacing: 2.2, color: FLUOR,
  }),
  T('A field guide to the\nquiet parts of the map.', 72, 632, 424, 130, {
    fontFamily: FONTS.serif, fontSize: 44, lineHeight: 1.08, color: RISO_INK,
  }),
  T('Twelve walks above the treeline, recorded in ink and newsprint. No routes, no summit times — just weather, stone and the shape of a day.', 72, 792, 404, 136, {
    fontFamily: FONTS.inter, fontSize: 18, lineHeight: 1.62, color: '#2B2A25',
  }),
  T('CONTENTS', 72, 962, 300, 20, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 700, letterSpacing: 2.6, color: 'rgba(16,16,16,.6)',
  }),
  T('01   The long approach\n02   Weather, recorded\n03   A ridge in October', 72, 996, 404, 110, {
    fontFamily: FONTS.inter, fontSize: 17, lineHeight: 2.1, color: RISO_INK,
  }),
  T('48 pages · 12 walks · one fold-out map', 72, 1112, 404, 46, {
    fontFamily: FONTS.inter, fontSize: 13, lineHeight: 1.6, color: 'rgba(16,16,16,.55)',
  }),

  IMG(PHOTOS.mountain, 520, 560, 648, 830, {
    name: 'Plate 01 — mountain',
    filters: FILT({ grayscale: 100, contrast: 118, brightness: 96 }),
  }),
  S('rect', 520, 560, 118, 40, { fill: FLUOR, name: 'Plate tag' }),
  T('PLATE 01', 520, 571, 118, 20, {
    fontFamily: FONTS.inter, fontSize: 10, fontWeight: 700, letterSpacing: 2,
    color: NEWS, align: 'center',
  }),
  T('68° 12′ N — LATE OCTOBER', 930, 888, 380, 24, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.8, color: 'rgba(233,228,216,.95)',
    align: 'center', rotation: 90,
  }),
  T('PLATE 01 — GRANITE, CLOUD AND THE LAST OF THE LIGHT', 520, 1402, 648, 22, {
    fontFamily: FONTS.inter, fontSize: 10.5, letterSpacing: 2.2, color: 'rgba(16,16,16,.7)',
  }),

  rule(72, 1470, 1096, 'rgba(16,16,16,.4)', 1),
  T('FIELD NOTES', 72, 1494, 320, 20, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 600, letterSpacing: 3, color: 'rgba(16,16,16,.6)',
  }),
  T('Printed in two inks on recycled newsprint.\nSet in Archivo Black and Instrument Serif.', 72, 1522, 540, 60, {
    fontFamily: FONTS.inter, fontSize: 14, lineHeight: 1.6, color: 'rgba(16,16,16,.62)',
  }),
  T('Walk slowly.\nLook up.', 900, 1478, 268, 100, {
    fontFamily: FONTS.serif, fontSize: 42, lineHeight: 1.05, color: RISO_INK, align: 'right',
  }),
  T('ISSUE 03 — AUTUMN 2026', 72, 1680, 400, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.6, color: 'rgba(16,16,16,.55)',
  }),
  T('£14 / €16', 1000, 1680, 168, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.6, color: 'rgba(16,16,16,.55)', align: 'right',
  }),
]);

/* ------------------------------------------------------------------ */
/* 02 — Miso & Smoke: izakaya dinner menu                              */
/* ------------------------------------------------------------------ */

const CHAR = '#171310';
const BONE = '#EFE5D2';
const CHILI = '#D33A21';

const misoSmoke = page('Menu', bgSolid(CHAR), [
  IMG(PHOTOS.food, 0, 0, 1240, 780, {
    name: 'Robata spread',
    overlay: '#171310', overlayOpacity: 0.26,
    filters: FILT({ contrast: 106, saturate: 92, brightness: 88 }),
  }),
  S('rect', 0, 500, 1240, 280, { fill: G('rgba(23,19,16,0)', '#171310', 180), name: 'Photo fade' }),

  T('IZAKAYA  ·  BERMONDSEY  ·  EST. 2019', 64, 44, 700, 22, {
    fontFamily: FONTS.inter, fontSize: 11, letterSpacing: 3, color: 'rgba(239,229,210,.82)',
  }),
  T('MISO', 60, 318, 900, 250, {
    fontFamily: FONTS.condensed, fontSize: 260, lineHeight: 0.82, letterSpacing: 2, color: BONE,
  }),
  T('& SMOKE', 60, 508, 1080, 250, {
    fontFamily: FONTS.condensed, fontSize: 260, lineHeight: 0.82, letterSpacing: 2, color: BONE,
  }),
  S('rect', 64, 744, 220, 8, { fill: CHILI, name: 'Chilli rule' }),
  T('OPEN LATE  ·  WALK-INS ONLY', 980, 1037, 460, 26, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.8, color: 'rgba(239,229,210,.48)',
    align: 'center', rotation: 90,
  }),

  T('DINNER MENU  ·  SERVED 6PM UNTIL LATE', 64, 828, 600, 22, {
    fontFamily: FONTS.inter, fontSize: 12, fontWeight: 700, letterSpacing: 3.2, color: CHILI,
  }),
  T('ALL PRICES IN GBP', 900, 828, 276, 22, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.4, color: 'rgba(239,229,210,.45)', align: 'right',
  }),
  rule(64, 864, 1112, 'rgba(239,229,210,.22)', 1),

  T('SMALL PLATES', 64, 890, 400, 22, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CHILI,
  }),
  T('Miso aubergine, sesame, spring onion\nSmoked duck breast, yuzu kosho\nCrisp tofu, ginger and black vinegar\nKaraage, burnt chilli mayo', 64, 926, 840, 172, {
    fontFamily: FONTS.inter, fontSize: 21, lineHeight: 2, color: BONE,
  }),
  T('9\n12\n8\n11', 960, 926, 216, 172, {
    fontFamily: FONTS.inter, fontSize: 21, lineHeight: 2, color: BONE, align: 'right',
  }),

  T('ROBATA', 64, 1130, 400, 22, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CHILI,
  }),
  T('Chicken thigh, tare and shichimi\nPork belly, apple and mustard\nHispi cabbage, miso butter\nMackerel, salt and shiso', 64, 1166, 840, 172, {
    fontFamily: FONTS.inter, fontSize: 21, lineHeight: 2, color: BONE,
  }),
  T('10\n13\n9\n14', 960, 1166, 216, 172, {
    fontFamily: FONTS.inter, fontSize: 21, lineHeight: 2, color: BONE, align: 'right',
  }),

  T('RICE  &  SWEET', 64, 1370, 400, 22, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: CHILI,
  }),
  T('Clay pot rice, mushroom, egg yolk\nUdon, brown butter, kombu\nBlack sesame ice cream\nMiso caramel, buckwheat', 64, 1406, 840, 172, {
    fontFamily: FONTS.inter, fontSize: 21, lineHeight: 2, color: BONE,
  }),
  T('12\n11\n6\n7', 960, 1406, 216, 172, {
    fontFamily: FONTS.inter, fontSize: 21, lineHeight: 2, color: BONE, align: 'right',
  }),

  S('ellipse', 1004, 512, 172, 172, { fill: NONE, stroke: CHILI, strokeWidth: 2, name: 'Omakase stamp' }),
  T('OMAKASE\n6 COURSES\n£42', 1004, 556, 172, 86, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 600, letterSpacing: 2.2, lineHeight: 1.65,
    color: BONE, align: 'center',
  }),

  T('A discretionary 12.5% service charge is added.\nPlease tell us about allergies — the kitchen adapts.', 64, 1612, 740, 50, {
    fontFamily: FONTS.inter, fontSize: 12, lineHeight: 1.7, color: 'rgba(239,229,210,.45)',
  }),
  T('MISO & SMOKE  /  14 MARKET ROW, LONDON SE1', 64, 1700, 720, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.4, color: 'rgba(239,229,210,.5)',
  }),
  T('NO BOOKINGS — ARRIVE HUNGRY', 900, 1700, 276, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.4, color: CHILI, align: 'right',
  }),
]);

/* ------------------------------------------------------------------ */
/* 03 — The Long Table: supper-club ticket                             */
/* ------------------------------------------------------------------ */

const OLIVE = '#2C3327';
const BUTTER = '#E9C46A';
const TICKET = '#F3EEDF';

const longTable = page('Ticket', bgSolid(OLIVE), [
  T('THE LONG TABLE', 40, 46, 500, 22, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 600, letterSpacing: 3.4, color: BUTTER,
  }),
  T('SUPPER CLUB — SEASON 04', 640, 46, 400, 22, {
    fontFamily: FONTS.inter, fontSize: 11, letterSpacing: 3.4, color: 'rgba(233,196,106,.75)', align: 'right',
  }),

  S('rect', 40, 96, 1000, 800, { fill: TICKET, radius: 4, name: 'Ticket' }),
  S('ellipse', 722, 72, 44, 44, { fill: OLIVE, name: 'Top notch' }),
  S('ellipse', 722, 876, 44, 44, { fill: OLIVE, name: 'Bottom notch' }),
  S('line', 344, 495, 800, 1, {
    fill: NONE, stroke: 'rgba(44,51,39,.38)', strokeWidth: 2, dash: true, rotation: 90,
    name: 'Perforation',
  }),

  T('ADMIT ONE  —  SATURDAY 19 SEPTEMBER 2026', 84, 136, 560, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, letterSpacing: 3.2, color: 'rgba(44,51,39,.65)',
  }),
  T('THE\nLONG\nTABLE', 76, 178, 640, 390, {
    fontFamily: FONTS.serif, fontSize: 142, lineHeight: 0.9, letterSpacing: -2, color: OLIVE,
  }),
  rule(84, 604, 600, 'rgba(44,51,39,.25)', 1),
  T('Twelve seats. One table.\nSeven courses, cooked over fire.', 84, 630, 620, 80, {
    fontFamily: FONTS.serif, fontSize: 27, italic: true, lineHeight: 1.35, color: 'rgba(44,51,39,.85)',
  }),
  T('7PM — LATE', 84, 754, 300, 34, {
    fontFamily: FONTS.condensed, fontSize: 28, letterSpacing: 3, lineHeight: 1.1, color: OLIVE,
  }),
  T('THE OLD DAIRY\n12 MARKET LANE, LEWES', 430, 726, 260, 60, {
    fontFamily: FONTS.inter, fontSize: 13, lineHeight: 1.7, color: 'rgba(44,51,39,.8)',
  }),
  S('rect', 84, 810, 210, 40, { fill: BUTTER, radius: 20, name: 'Seat chip' }),
  T('ONE SEAT · £48', 84, 821, 210, 18, {
    fontFamily: FONTS.inter, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: OLIVE, align: 'center',
  }),

  T('SEAT 12', 742, 345, 300, 90, {
    fontFamily: FONTS.serif, fontSize: 78, lineHeight: 1, color: OLIVE,
    align: 'center', valign: 'middle', rotation: 90,
  }),
  T('Nº 0042  /  ADMIT ONE', 770, 736, 240, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2, color: 'rgba(44,51,39,.65)',
  }),
  S('rect', 776, 778, 4, 54, { fill: OLIVE }),
  S('rect', 802, 778, 8, 54, { fill: OLIVE }),
  S('rect', 828, 778, 3, 54, { fill: OLIVE }),
  S('rect', 854, 778, 7, 54, { fill: OLIVE }),
  S('rect', 880, 778, 5, 54, { fill: OLIVE }),

  T('Seating is communal — you will be sitting next to someone new.', 40, 940, 680, 44, {
    fontFamily: FONTS.inter, fontSize: 14, lineHeight: 1.5, color: 'rgba(239,233,216,.75)',
  }),
  T('THELONGTABLE.CO  /  @THELONGTABLE', 700, 940, 340, 40, {
    fontFamily: FONTS.inter, fontSize: 10.5, letterSpacing: 2.4, color: BUTTER, align: 'right',
  }),
  S('ring', 976, 1000, 56, 56, { fill: NONE, stroke: BUTTER, strokeWidth: 1.5, name: 'Mark' }),
]);

/* ------------------------------------------------------------------ */
/* 04 — Sable / Studio: portfolio CV, two pages                        */
/* ------------------------------------------------------------------ */

const OFF = '#FCFBF8';
const SABLE_INK = '#111110';
const SIGNAL = '#FF3B30';

const sableOne = page('CV', bgSolid(OFF), [
  T('CURRICULUM VITAE  /  2026', 64, 50, 500, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, letterSpacing: 2.6, color: 'rgba(17,17,16,.55)',
  }),
  T('SABLE.STUDIO', 900, 50, 276, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, letterSpacing: 2.6, color: 'rgba(17,17,16,.55)', align: 'right',
  }),

  T('SABLE', 60, 92, 760, 160, {
    fontFamily: FONTS.black, fontSize: 142, lineHeight: 0.9, letterSpacing: -7, color: SABLE_INK,
  }),
  T('/ STUDIO', 552, 176, 400, 46, {
    fontFamily: FONTS.grotesk, fontSize: 38, fontWeight: 500, letterSpacing: 7, color: SIGNAL,
  }),
  S('rect', 64, 292, 1112, 3, { fill: SIGNAL, name: 'Signal rule' }),

  T('CONTACT\nstudio@sable.design\n+44 7700 900 118', 64, 330, 400, 92, {
    fontFamily: FONTS.inter, fontSize: 12, lineHeight: 1.9, color: 'rgba(17,17,16,.75)',
  }),
  T('BASED\nBerlin, Germany\nWorking across Europe', 800, 330, 376, 92, {
    fontFamily: FONTS.inter, fontSize: 12, lineHeight: 1.9, color: 'rgba(17,17,16,.75)', align: 'right',
  }),

  T('01 / PROFILE', 64, 486, 190, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.8, color: SIGNAL,
  }),
  T('Sable is the independent studio of Ines Marchetti, working between brand identity, editorial design and the spaces where the two meet. Twelve years of practice, a preference for restraint, and a habit of reading the colophon first.', 270, 482, 906, 100, {
    fontFamily: FONTS.inter, fontSize: 18, lineHeight: 1.62, color: 'rgba(17,17,16,.86)',
  }),

  T('02 / EXPERIENCE', 64, 650, 190, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.8, color: SIGNAL,
  }),
  T('2019 — 2022  ·  Design Director, Studio Kern\nSet the visual language for cultural and civic clients; led a team of six across identity, print and digital.', 270, 690, 906, 62, {
    fontFamily: FONTS.inter, fontSize: 17, lineHeight: 1.55, color: 'rgba(17,17,16,.86)',
  }),
  T('2016 — 2019  ·  Senior Designer, Atelier Halm\nEditorial systems, catalogues and exhibition graphics for museums in Berlin and Basel.', 270, 800, 906, 62, {
    fontFamily: FONTS.inter, fontSize: 17, lineHeight: 1.55, color: 'rgba(17,17,16,.86)',
  }),
  T('2013 — 2016  ·  Designer, Field Office\nPackaging, identity and type for independent food and retail brands.', 270, 910, 906, 62, {
    fontFamily: FONTS.inter, fontSize: 17, lineHeight: 1.55, color: 'rgba(17,17,16,.86)',
  }),

  T('03 / SELECTED WORK', 64, 1040, 190, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.8, color: SIGNAL,
  }),
  T('KUNSTHALLE NORD — IDENTITY, SIGNAGE & WAYFINDING  /  2025\nA civic art hall, rebuilt from its letterhead outwards.', 270, 1080, 906, 54, {
    fontFamily: FONTS.inter, fontSize: 16, lineHeight: 1.6, color: 'rgba(17,17,16,.86)',
  }),
  T('FENNIMORE PRESS — CATALOGUE SERIES  /  2024\nTwelve books a year, one grid, no exceptions.', 270, 1165, 906, 54, {
    fontFamily: FONTS.inter, fontSize: 16, lineHeight: 1.6, color: 'rgba(17,17,16,.86)',
  }),
  T('HÔTEL SABLON — BRAND & INTERIORS  /  2023\nA small hotel with a large appetite for red.', 270, 1250, 906, 54, {
    fontFamily: FONTS.inter, fontSize: 16, lineHeight: 1.6, color: 'rgba(17,17,16,.86)',
  }),

  T('04 / CAPABILITIES', 64, 1376, 190, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.8, color: SIGNAL,
  }),
  T('Brand identity · Editorial & catalogue design · Art direction · Type systems · Packaging · Digital product', 270, 1372, 906, 30, {
    fontFamily: FONTS.inter, fontSize: 16, lineHeight: 1.6, color: 'rgba(17,17,16,.86)',
  }),
  T('05 / EDUCATION', 64, 1470, 190, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.8, color: SIGNAL,
  }),
  T('BA Graphic Design — HDK Berlin, 2012\nADC Young Guns 16 · D&AD Wood Pencil, 2024', 270, 1466, 906, 56, {
    fontFamily: FONTS.inter, fontSize: 15, lineHeight: 1.7, color: 'rgba(17,17,16,.78)',
  }),

  rule(64, 1650, 1112, 'rgba(17,17,16,.22)', 1),
  T('SABLE / STUDIO — CURRICULUM VITAE', 64, 1678, 600, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.6, color: 'rgba(17,17,16,.55)',
  }),
  T('PAGE 01 / 02', 976, 1678, 200, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.6, color: 'rgba(17,17,16,.55)', align: 'right',
  }),
]);

const sableTwo = page('Selected work', bgSolid(OFF), [
  T('SELECTED WORK  /  2023 — 2026', 64, 50, 600, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, letterSpacing: 2.6, color: 'rgba(17,17,16,.55)',
  }),
  T('SABLE.STUDIO', 900, 50, 276, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, letterSpacing: 2.6, color: 'rgba(17,17,16,.55)', align: 'right',
  }),
  S('rect', 64, 86, 1112, 3, { fill: SIGNAL, name: 'Signal rule' }),

  T('Kunsthalle Nord', 60, 118, 780, 104, {
    fontFamily: FONTS.serif, fontSize: 94, lineHeight: 1, letterSpacing: -1, color: SABLE_INK,
  }),
  T('Identity, signage & wayfinding\nHamburg, 2025 — ongoing', 840, 136, 336, 70, {
    fontFamily: FONTS.inter, fontSize: 15, lineHeight: 1.65, color: 'rgba(17,17,16,.7)', align: 'right',
  }),

  IMG(PHOTOS.office, 64, 264, 748, 700, {
    name: 'Kunsthalle reception',
    filters: FILT({ saturate: 78, contrast: 104 }),
  }),
  IMG(PHOTOS.arch, 844, 264, 332, 330, {
    name: 'Kunsthalle facade',
    filters: FILT({ saturate: 72, contrast: 106 }),
  }),
  T('Fig. 01 — Facade, 2025', 844, 610, 332, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2, color: 'rgba(17,17,16,.55)',
  }),
  T('CLIENT — Kunsthalle Nord\nSECTOR — Public art museum\nYEAR — 2025\nSCOPE — Identity, signage,\nwayfinding, print', 844, 654, 332, 150, {
    fontFamily: FONTS.inter, fontSize: 12, lineHeight: 1.9, color: 'rgba(17,17,16,.75)',
  }),

  T('Fig. 02 — Reception, Kunsthalle Nord', 64, 978, 748, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2, color: 'rgba(17,17,16,.55)',
  }),
  T('A building that speaks in one voice: one typeface, one grid, and one red line from the entrance to the last gallery door.', 64, 1020, 720, 120, {
    fontFamily: FONTS.serif, fontSize: 30, lineHeight: 1.3, color: SABLE_INK,
  }),
  T('01', 1010, 1010, 166, 120, {
    fontFamily: FONTS.black, fontSize: 100, lineHeight: 1, color: SIGNAL, align: 'right',
  }),

  rule(64, 1200, 1112, 'rgba(17,17,16,.22)', 1),
  T('02 / CAPABILITIES', 64, 1240, 190, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.8, color: SIGNAL,
  }),
  T('Brand identity · Editorial & catalogue design · Art direction · Type systems · Packaging · Digital product', 270, 1236, 906, 30, {
    fontFamily: FONTS.inter, fontSize: 16, lineHeight: 1.6, color: 'rgba(17,17,16,.86)',
  }),
  T('03 / EDUCATION', 64, 1320, 190, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.8, color: SIGNAL,
  }),
  T('BA Graphic Design — HDK Berlin, 2012 · Type & editorial, Werkplaats Typografie, 2014', 270, 1316, 906, 30, {
    fontFamily: FONTS.inter, fontSize: 15, lineHeight: 1.6, color: 'rgba(17,17,16,.78)',
  }),
  T('04 / CONTACT', 64, 1400, 190, 20, {
    fontFamily: FONTS.inter, fontSize: 10.5, fontWeight: 700, letterSpacing: 2.8, color: SIGNAL,
  }),
  T('studio@sable.design · +44 7700 900 118 · sable.studio', 270, 1396, 906, 30, {
    fontFamily: FONTS.inter, fontSize: 15, lineHeight: 1.6, color: 'rgba(17,17,16,.78)',
  }),

  S('rect', 64, 1500, 36, 36, { fill: SIGNAL, name: 'Signal mark' }),
  T('Available for commissions and collaborations from September 2026.', 116, 1506, 760, 24, {
    fontFamily: FONTS.inter, fontSize: 14, lineHeight: 1.5, color: 'rgba(17,17,16,.7)',
  }),
  rule(64, 1650, 1112, 'rgba(17,17,16,.22)', 1),
  T('SABLE / STUDIO — SELECTED WORK', 64, 1678, 600, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.6, color: 'rgba(17,17,16,.55)',
  }),
  T('PAGE 02 / 02', 976, 1678, 200, 20, {
    fontFamily: FONTS.inter, fontSize: 10, letterSpacing: 2.6, color: 'rgba(17,17,16,.55)', align: 'right',
  }),
]);

export const EDITORIAL_TEMPLATES: Template[] = [
  {
    id: 'ed-field-notes',
    name: 'Field Notes',
    category: 'Poster',
    description: 'A risograph field journal: oversized newsprint type, one grayscale plate and specimen captions.',
    size: { name: 'Poster', width: 1240, height: 1754 },
    pages: [fieldNotes],
    tags: ['poster', 'risograph', 'editorial', 'art book', 'outdoors'],
  },
  {
    id: 'ed-miso-smoke',
    name: 'Miso & Smoke',
    category: 'Menu',
    description: 'An izakaya dinner menu with a full-bleed food shot, tight price columns and a chilli accent.',
    size: { name: 'Menu', width: 1240, height: 1754 },
    pages: [misoSmoke],
    tags: ['menu', 'restaurant', 'izakaya', 'food', 'print'],
  },
  {
    id: 'ed-long-table',
    name: 'The Long Table',
    category: 'Invitation',
    description: 'A supper-club ticket with a perforated stub, butter-yellow ink and a communal seating note.',
    size: { name: 'Invitation', width: 1080, height: 1080 },
    pages: [longTable],
    tags: ['invitation', 'ticket', 'supper club', 'event'],
  },
  {
    id: 'ed-sable-resume',
    name: 'Sable / Studio',
    category: 'Resume',
    description: 'A two-page portfolio CV on a strict grid: signal-red rules, small caps and one project plate.',
    size: { name: 'Resume', width: 1240, height: 1754 },
    pages: [sableOne, sableTwo],
    tags: ['resume', 'cv', 'portfolio', 'studio', 'grid'],
  },
];
