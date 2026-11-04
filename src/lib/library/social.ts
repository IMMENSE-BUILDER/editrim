import type { ImageFilters, Template } from '../types';
import {
  FONTS,
  IC,
  IMG,
  NONE,
  P,
  PHOTOS,
  S,
  T,
  bgSolid,
  page,
} from '../templateKit';

/** Social campaign templates. */

const fx = (over: Partial<ImageFilters>): ImageFilters => ({
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hue: 0,
  ...over,
});

/* ------------------------------------------------------------------ *
 * 01. ASTER SKIN — clinical beauty launch
 * ------------------------------------------------------------------ */

const ASTER_SAGE = '#DCE6D8';
const ASTER_GREEN = '#1C2A22';
const ASTER_BLUSH = '#E8B4B8';

const asterSkin = page('Launch', bgSolid(ASTER_SAGE), [
  S('rect', 40, 40, 1000, 1000, { fill: NONE, stroke: 'rgba(28,42,34,.20)', strokeWidth: 1, name: 'Hairline frame' }),

  IC('flower', 72, 70, 34, ASTER_GREEN, 1.3),
  T('ASTER SKIN', 122, 76, 360, 26, {
    fontFamily: FONTS.grotesk, fontSize: 15, fontWeight: 500, letterSpacing: 5, color: ASTER_GREEN,
  }),
  T('NEW YORK  /  01', 640, 78, 368, 24, {
    fontFamily: FONTS.grotesk, fontSize: 11, letterSpacing: 3, color: 'rgba(28,42,34,.62)', align: 'right',
  }),

  T('Skin,\nin its own\ntime.', 72, 138, 500, 300, {
    fontFamily: FONTS.fraunces, fontSize: 92, fontWeight: 400, lineHeight: 1.02, letterSpacing: -2, color: ASTER_GREEN,
  }),

  IMG(PHOTOS.portrait, 600, 128, 396, 520, {
    radius: 198,
    name: 'Portrait — arch crop',
    filters: fx({ brightness: 104, contrast: 105, grayscale: 100 }),
  }),
  T('CAMPAIGN / 01 — ASTER BARRIER SERUM', 600, 666, 396, 18, {
    fontFamily: FONTS.grotesk, fontSize: 10, letterSpacing: 2.2, color: 'rgba(28,42,34,.55)',
  }),

  S('ellipse', 72, 494, 112, 112, { fill: ASTER_BLUSH, name: 'Serum seal' }),
  T('SERUM\n30 ML', 72, 532, 112, 42, {
    fontFamily: FONTS.grotesk, fontSize: 12.5, fontWeight: 600, letterSpacing: 1.4, lineHeight: 1.35,
    align: 'center', color: ASTER_GREEN,
  }),
  T('A daily barrier layer,\nmorning and night.', 208, 512, 320, 62, {
    fontFamily: FONTS.fraunces, fontSize: 21, lineHeight: 1.4, color: 'rgba(28,42,34,.78)',
  }),

  S('line', 72, 648, 500, 1, { fill: NONE, stroke: 'rgba(28,42,34,.28)', strokeWidth: 1 }),
  T('THE FORMULA', 72, 674, 300, 20, {
    fontFamily: FONTS.grotesk, fontSize: 10.5, fontWeight: 600, letterSpacing: 3, color: ASTER_GREEN,
  }),
  T('Barrier repair,\nwithout the sting.', 72, 704, 500, 88, {
    fontFamily: FONTS.fraunces, fontSize: 38, lineHeight: 1.12, letterSpacing: -0.6, color: ASTER_GREEN,
  }),
  T('Ceramides, 6% niacinamide and panthenol. No fragrance, no essential oils.', 72, 800, 480, 56, {
    fontFamily: FONTS.manrope, fontSize: 16, lineHeight: 1.5, color: 'rgba(28,42,34,.72)',
  }),

  S('line', 72, 892, 936, 1, { fill: NONE, stroke: 'rgba(28,42,34,.24)', strokeWidth: 1 }),
  T('$68', 72, 912, 110, 40, { fontFamily: FONTS.grotesk, fontSize: 24, fontWeight: 500, color: ASTER_GREEN }),
  T('FRAGRANCE FREE  ·  pH 5.5  ·  VEGAN', 210, 922, 480, 22, {
    fontFamily: FONTS.grotesk, fontSize: 10, letterSpacing: 2, color: 'rgba(28,42,34,.62)',
  }),
  T('ASTER.SKIN', 808, 922, 200, 22, {
    fontFamily: FONTS.grotesk, fontSize: 10, letterSpacing: 2.4, color: 'rgba(28,42,34,.62)', align: 'right',
  }),
  T('NEW YORK  ·  LONDON  ·  ONLINE', 72, 978, 420, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(28,42,34,.42)',
  }),
]);

/* ------------------------------------------------------------------ *
 * 02. FIELDWORK — three-page workwear carousel
 * ------------------------------------------------------------------ */

const FIELD_CLAY = '#B4552D';
const FIELD_MOSS = '#3E4A31';
const FIELD_SAND = '#D9C7A7';

const fieldworkManifesto = page('Manifesto', bgSolid(FIELD_MOSS), [
  T('FIELDWORK', 64, 72, 420, 26, {
    fontFamily: FONTS.grotesk, fontSize: 14, fontWeight: 500, letterSpacing: 6, color: FIELD_SAND,
  }),
  T('SS/26  ·  VOL. 04', 604, 74, 412, 24, {
    fontFamily: FONTS.grotesk, fontSize: 10.5, letterSpacing: 2.8, color: 'rgba(217,199,167,.68)', align: 'right',
  }),
  S('line', 64, 124, 952, 1, { fill: NONE, stroke: 'rgba(217,199,167,.28)', strokeWidth: 1 }),

  T('04', 812, 128, 204, 200, {
    fontFamily: FONTS.oswald, fontSize: 170, fontWeight: 600, lineHeight: 1, letterSpacing: -4,
    color: 'rgba(217,199,167,.16)', align: 'right',
  }),
  T('MADE FOR\nTHE LONG\nSHIFT.', 60, 178, 760, 420, {
    fontFamily: FONTS.oswald, fontSize: 148, fontWeight: 600, lineHeight: 0.92, letterSpacing: -1,
    color: FIELD_SAND, uppercase: true,
  }),

  S('line', 64, 618, 952, 1, { fill: NONE, stroke: 'rgba(217,199,167,.28)', strokeWidth: 1 }),
  T('We build for the 6am load-in, the third coat of paint and the last cut of the day.', 64, 648, 620, 70, {
    fontFamily: FONTS.manrope, fontSize: 21, lineHeight: 1.55, color: 'rgba(217,199,167,.9)',
  }),
  T('12OZ CANVAS\nDOUBLE-SEAMED\nREPAIRED FREE', 748, 648, 268, 84, {
    fontFamily: FONTS.grotesk, fontSize: 10.5, letterSpacing: 2.4, lineHeight: 2.3, color: 'rgba(217,199,167,.62)',
  }),

  S('rect', 64, 790, 288, 72, { fill: FIELD_CLAY, name: 'Shop button' }),
  T('SHOP SS/26', 80, 812, 204, 28, {
    fontFamily: FONTS.grotesk, fontSize: 13, fontWeight: 600, letterSpacing: 3, color: FIELD_SAND, align: 'center',
  }),
  IC('arrow-right', 300, 812, 28, FIELD_SAND, 1.5),
  T('FREE REPAIRS  /  FOR LIFE', 640, 816, 376, 24, {
    fontFamily: FONTS.grotesk, fontSize: 10.5, letterSpacing: 2.2, color: 'rgba(217,199,167,.6)', align: 'right',
  }),

  S('line', 64, 950, 952, 1, { fill: NONE, stroke: 'rgba(217,199,167,.22)', strokeWidth: 1 }),
  T('FIELDWORK — OUTDOOR WORKWEAR', 64, 972, 500, 20, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2.4, color: 'rgba(217,199,167,.45)',
  }),
  T('MANIFESTO  /  01.03', 700, 972, 316, 20, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(217,199,167,.45)', align: 'right',
  }),
]);

const fieldworkMaterial = page('Material', bgSolid(FIELD_SAND), [
  IMG(PHOTOS.shoe, 0, 0, 620, 500, {
    name: 'Field trainer — material detail',
    zoom: 3,
    offsetY: -0.25,
    filters: fx({ brightness: 96, contrast: 112, grayscale: 100, sepia: 20 }),
  }),
  IMG(PHOTOS.mountain, 640, 0, 440, 500, {
    name: 'Long ridge', filters: fx({ brightness: 94, contrast: 110, saturate: 40 }),
  }),
  S('rect', 0, 436, 232, 64, { fill: FIELD_CLAY }),
  T('MATERIAL  /  02', 24, 456, 208, 24, {
    fontFamily: FONTS.grotesk, fontSize: 11, fontWeight: 500, letterSpacing: 3, color: FIELD_SAND,
  }),
  T('LEFT — KNIT UPPER AND SOLE UNIT  /  RIGHT — THE LONG RIDGE', 64, 514, 880, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(62,74,49,.58)',
  }),

  T('THE CLOTH', 64, 552, 300, 20, {
    fontFamily: FONTS.grotesk, fontSize: 10.5, fontWeight: 700, letterSpacing: 3, color: FIELD_CLAY,
  }),
  T('12oz canvas,\nwashed twice.', 60, 578, 660, 190, {
    fontFamily: FONTS.oswald, fontSize: 86, fontWeight: 600, lineHeight: 1, letterSpacing: -0.5, color: FIELD_MOSS,
  }),

  T('WEIGHT', 760, 578, 120, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: FIELD_CLAY,
  }),
  T('12 oz  /  407 gsm', 760, 596, 256, 24, {
    fontFamily: FONTS.manrope, fontSize: 15, fontWeight: 600, color: FIELD_MOSS,
  }),
  T('WEAVE', 760, 632, 120, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: FIELD_CLAY,
  }),
  T('3 × 1 twill', 760, 650, 256, 24, {
    fontFamily: FONTS.manrope, fontSize: 15, fontWeight: 600, color: FIELD_MOSS,
  }),
  T('FINISH', 760, 686, 120, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: FIELD_CLAY,
  }),
  T('Double wash, air dried', 760, 704, 256, 24, {
    fontFamily: FONTS.manrope, fontSize: 15, fontWeight: 600, color: FIELD_MOSS,
  }),
  T('ORIGIN', 760, 740, 120, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: FIELD_CLAY,
  }),
  T('Porto, Portugal', 760, 758, 256, 24, {
    fontFamily: FONTS.manrope, fontSize: 15, fontWeight: 600, color: FIELD_MOSS,
  }),

  T('Stiff on the first wear, soft by the tenth. Cut wide through the shoulder so a second jumper fits underneath.', 64, 790, 620, 58, {
    fontFamily: FONTS.manrope, fontSize: 17.5, lineHeight: 1.55, color: 'rgba(62,74,49,.82)',
  }),
  T('WOVEN IN PORTO  ·  CUT IN SHEFFIELD  ·  FINISHED BY HAND', 64, 880, 800, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2.2, color: 'rgba(62,74,49,.55)',
  }),

  S('line', 64, 950, 952, 1, { fill: NONE, stroke: 'rgba(62,74,49,.25)', strokeWidth: 1 }),
  T('FIELDWORK — OUTDOOR WORKWEAR', 64, 972, 500, 20, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2.4, color: 'rgba(62,74,49,.55)',
  }),
  T('MATERIAL  /  02.03', 700, 972, 316, 20, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(62,74,49,.55)', align: 'right',
  }),
]);

const fieldworkStockists = page('Sizing & stockists', bgSolid(FIELD_CLAY), [
  T('FIELDWORK', 64, 72, 420, 26, {
    fontFamily: FONTS.grotesk, fontSize: 14, fontWeight: 500, letterSpacing: 6, color: FIELD_SAND,
  }),
  S('line', 64, 124, 952, 1, { fill: NONE, stroke: 'rgba(217,199,167,.3)', strokeWidth: 1 }),

  T('FIND YOUR\nFIT.', 60, 168, 560, 200, {
    fontFamily: FONTS.oswald, fontSize: 96, fontWeight: 600, lineHeight: 0.94, letterSpacing: -0.5, color: FIELD_SAND,
  }),

  T('CHEST', 180, 374, 120, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(217,199,167,.6)',
  }),
  T('SLEEVE', 320, 374, 120, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(217,199,167,.6)',
  }),
  T('LENGTH', 460, 374, 120, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(217,199,167,.6)',
  }),
  T('XS\nS\nM\nL\nXL\nXXL', 64, 404, 80, 270, {
    fontFamily: FONTS.manrope, fontSize: 17.5, fontWeight: 600, lineHeight: 2.55, color: FIELD_SAND,
  }),
  T('34\n36\n38\n40\n42\n44', 180, 404, 120, 270, {
    fontFamily: FONTS.manrope, fontSize: 17.5, lineHeight: 2.55, color: 'rgba(217,199,167,.82)',
  }),
  T('24\n24.5\n25\n25.5\n26\n26.5', 320, 404, 120, 270, {
    fontFamily: FONTS.manrope, fontSize: 17.5, lineHeight: 2.55, color: 'rgba(217,199,167,.82)',
  }),
  T('26\n27\n28\n29\n30\n31', 460, 404, 120, 270, {
    fontFamily: FONTS.manrope, fontSize: 17.5, lineHeight: 2.55, color: 'rgba(217,199,167,.82)',
  }),

  T('LONDON — BROWNS', 620, 404, 380, 24, {
    fontFamily: FONTS.manrope, fontSize: 14, fontWeight: 600, letterSpacing: 0.4, color: FIELD_SAND,
  }),
  T('12 Broadwick Street, W1F', 620, 428, 380, 20, {
    fontFamily: FONTS.manrope, fontSize: 12.5, color: 'rgba(217,199,167,.62)',
  }),
  T('SHEFFIELD — THE WORKS', 620, 474, 380, 24, {
    fontFamily: FONTS.manrope, fontSize: 14, fontWeight: 600, letterSpacing: 0.4, color: FIELD_SAND,
  }),
  T('4 Matilda Way, S1', 620, 498, 380, 20, {
    fontFamily: FONTS.manrope, fontSize: 12.5, color: 'rgba(217,199,167,.62)',
  }),
  T('BERLIN — VOO STORE', 620, 544, 380, 24, {
    fontFamily: FONTS.manrope, fontSize: 14, fontWeight: 600, letterSpacing: 0.4, color: FIELD_SAND,
  }),
  T('Oderberger Straße 8, 10435', 620, 568, 380, 20, {
    fontFamily: FONTS.manrope, fontSize: 12.5, color: 'rgba(217,199,167,.62)',
  }),

  T('FIND A STOCKIST', 620, 640, 380, 68, {
    fontFamily: FONTS.grotesk, fontSize: 13, fontWeight: 600, letterSpacing: 3, color: FIELD_CLAY,
    align: 'center', valign: 'middle', background: P(FIELD_SAND), backgroundRadius: 34,
  }),
  IC('arrow-up-right', 940, 664, 22, FIELD_CLAY, 1.6),

  S('line', 64, 744, 952, 1, { fill: NONE, stroke: 'rgba(217,199,167,.28)', strokeWidth: 1 }),
  T('FIT NOTES', 64, 768, 200, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(217,199,167,.6)',
  }),
  T('Measure a jacket you already own, pit to pit. The canvas softens about half a size after the first wash. Between sizes, take the smaller one.', 64, 794, 900, 46, {
    fontFamily: FONTS.manrope, fontSize: 13.5, lineHeight: 1.55, color: 'rgba(217,199,167,.78)',
  }),

  S('line', 64, 950, 952, 1, { fill: NONE, stroke: 'rgba(217,199,167,.22)', strokeWidth: 1 }),
  T('FIELDWORK — SS/26  ·  SIZING & STOCKISTS', 64, 972, 600, 20, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2.4, color: 'rgba(217,199,167,.45)',
  }),
  T('STOCKISTS  /  03.03', 700, 972, 316, 20, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2, color: 'rgba(217,199,167,.45)', align: 'right',
  }),
]);

/* ------------------------------------------------------------------ *
 * 03. NOCTURNE — late-night radio story
 * ------------------------------------------------------------------ */

const NOCT_MIDNIGHT = '#10131C';
const NOCT_ICE = '#BFD7EA';
const NOCT_ORANGE = '#FF5C39';

const nocturne = page('Broadcast', bgSolid(NOCT_MIDNIGHT), [
  T('NOCTURNE', 72, 86, 460, 40, {
    fontFamily: FONTS.grotesk, fontSize: 26, fontWeight: 500, letterSpacing: 9, color: NOCT_ICE,
  }),

  T('SIGNALS\nAFTER DARK', 64, 184, 720, 240, {
    fontFamily: FONTS.oswald, fontSize: 112, fontWeight: 600, lineHeight: 0.94, letterSpacing: -0.5, color: NOCT_ICE,
  }),
  T('88.6', 780, 184, 228, 120, {
    fontFamily: FONTS.oswald, fontSize: 108, fontWeight: 600, lineHeight: 1, color: NOCT_ORANGE, align: 'right',
  }),
  T('FM  /  STEREO', 780, 300, 228, 20, {
    fontFamily: FONTS.grotesk, fontSize: 10, letterSpacing: 3, color: 'rgba(191,215,234,.55)', align: 'right',
  }),
  T('SERIES 04  /  LATE-NIGHT TRANSMISSION FROM THE OLD PRINT WORKS', 72, 418, 720, 20, {
    fontFamily: FONTS.grotesk, fontSize: 10, letterSpacing: 2.4, color: 'rgba(191,215,234,.5)',
  }),

  IMG(PHOTOS.concert, 72, 462, 936, 760, {
    radius: 3,
    name: 'Live room — concert',
    filters: fx({ brightness: 96, contrast: 112, saturate: 45, grayscale: 18, hue: 196 }),
    overlay: NOCT_MIDNIGHT,
    overlayOpacity: 0.26,
  }),

  T('00:00 — 04:00', 64, 1272, 520, 80, {
    fontFamily: FONTS.oswald, fontSize: 66, fontWeight: 600, lineHeight: 1, letterSpacing: 0, color: NOCT_ICE,
  }),
  T('EVERY FRIDAY', 700, 1284, 308, 24, {
    fontFamily: FONTS.grotesk, fontSize: 11, fontWeight: 600, letterSpacing: 3, color: NOCT_ORANGE, align: 'right',
  }),

  T("TONIGHT'S LINE-UP", 72, 1378, 500, 20, {
    fontFamily: FONTS.grotesk, fontSize: 10.5, fontWeight: 600, letterSpacing: 2.6, color: 'rgba(191,215,234,.62)',
  }),

  T('00:00', 72, 1424, 110, 30, {
    fontFamily: FONTS.oswald, fontSize: 20, fontWeight: 600, letterSpacing: 1, color: NOCT_ORANGE,
  }),
  T('ILSE VOSS', 190, 1420, 440, 36, {
    fontFamily: FONTS.oswald, fontSize: 30, fontWeight: 600, letterSpacing: 0.5, color: NOCT_ICE,
  }),
  T('Ambient, tape loops, half-heard voices', 190, 1456, 600, 22, {
    fontFamily: FONTS.grotesk, fontSize: 13, color: 'rgba(191,215,234,.55)',
  }),
  S('line', 72, 1496, 936, 1, { fill: NONE, stroke: 'rgba(191,215,234,.12)', strokeWidth: 1 }),

  T('01:30', 72, 1516, 110, 30, {
    fontFamily: FONTS.oswald, fontSize: 20, fontWeight: 600, letterSpacing: 1, color: NOCT_ORANGE,
  }),
  T('DARA MENS', 190, 1512, 440, 36, {
    fontFamily: FONTS.oswald, fontSize: 30, fontWeight: 600, letterSpacing: 0.5, color: NOCT_ICE,
  }),
  T('Live dub set, one take, no edits', 190, 1548, 600, 22, {
    fontFamily: FONTS.grotesk, fontSize: 13, color: 'rgba(191,215,234,.55)',
  }),
  S('line', 72, 1588, 936, 1, { fill: NONE, stroke: 'rgba(191,215,234,.12)', strokeWidth: 1 }),

  T('03:00', 72, 1608, 110, 30, {
    fontFamily: FONTS.oswald, fontSize: 20, fontWeight: 600, letterSpacing: 1, color: NOCT_ORANGE,
  }),
  T('THE QUIET HOUR', 190, 1604, 600, 36, {
    fontFamily: FONTS.oswald, fontSize: 30, fontWeight: 600, letterSpacing: 0.5, color: NOCT_ICE,
  }),
  T('Slow wave and field recordings, no talking', 190, 1640, 600, 22, {
    fontFamily: FONTS.grotesk, fontSize: 13, color: 'rgba(191,215,234,.55)',
  }),

  S('rect', 72, 1716, 936, 132, {
    fill: 'rgba(191,215,234,.05)', stroke: 'rgba(191,215,234,.16)', strokeWidth: 1, radius: 4, name: 'Listen panel',
  }),
  T('Sunday 01:00  ·  88.6 FM  ·  DAB+', 100, 1764, 560, 30, {
    fontFamily: FONTS.grotesk, fontSize: 17, color: NOCT_ICE,
  }),
  T('TUNE IN', 740, 1758, 232, 52, {
    fontFamily: FONTS.grotesk, fontSize: 13, fontWeight: 600, letterSpacing: 2.4, color: NOCT_MIDNIGHT,
    align: 'center', valign: 'middle', background: P(NOCT_ORANGE), backgroundRadius: 26,
  }),
  IC('arrow-up-right', 934, 1772, 22, NOCT_MIDNIGHT, 1.6),
]);

/* ------------------------------------------------------------------ *
 * 04. SUNDAY SERVICE — neighbourhood brunch story
 * ------------------------------------------------------------------ */

const SUN_BUTTER = '#F2C14E';
const SUN_ESPRESSO = '#3B2117';
const SUN_TOMATO = '#D94F3D';

const sundayService = page('Brunch', bgSolid(SUN_BUTTER), [
  IMG(PHOTOS.coffee, 0, 0, 500, 1560, {
    name: 'Morning coffee',
    filters: fx({ contrast: 103, saturate: 92, sepia: 10 }),
  }),
  S('rect', 0, 0, 500, 1560, { fill: 'rgba(59,33,23,.12)', name: 'Warm wash' }),

  S('rect', 0, 1560, 500, 360, { fill: SUN_TOMATO, name: 'Hours panel' }),
  T('SAT + SUN  ·  WALK-INS WELCOME', 44, 1596, 420, 20, {
    fontFamily: FONTS.grotesk, fontSize: 10.5, fontWeight: 600, letterSpacing: 2.4, color: SUN_BUTTER,
  }),
  T('8—3', 40, 1626, 430, 150, {
    fontFamily: FONTS.display, fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: -5, color: SUN_BUTTER,
  }),
  T('KITCHEN CLOSES 2:30', 44, 1806, 400, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2.2, color: 'rgba(242,193,78,.72)',
  }),

  IC('coffee', 560, 84, 30, SUN_ESPRESSO, 1.6),
  T('SUNDAY SERVICE', 602, 88, 398, 26, {
    fontFamily: FONTS.manrope, fontSize: 14, fontWeight: 800, letterSpacing: 3, color: SUN_ESPRESSO,
  }),

  T('BRUNCH\nALL DAY', 552, 200, 460, 200, {
    fontFamily: FONTS.display, fontSize: 100, fontWeight: 800, lineHeight: 0.92, letterSpacing: -3, color: SUN_ESPRESSO,
  }),
  T('Saturday and Sunday, 8 till 3.\nThe good table, the slow morning.', 560, 424, 440, 56, {
    fontFamily: FONTS.manrope, fontSize: 17, lineHeight: 1.55, color: 'rgba(59,33,23,.8)',
  }),

  T('ON THE TABLE', 560, 540, 300, 18, {
    fontFamily: FONTS.grotesk, fontSize: 10.5, fontWeight: 700, letterSpacing: 3, color: SUN_TOMATO,
  }),
  T('Buttered sourdough\nSoft eggs, chilli oil\nOx cheek hash\nRicotta hotcakes\nBottomless filter', 560, 578, 320, 210, {
    fontFamily: FONTS.manrope, fontSize: 17, fontWeight: 600, lineHeight: 2.35, color: SUN_ESPRESSO,
  }),
  T('6\n12\n15\n13\n4', 880, 578, 120, 210, {
    fontFamily: FONTS.manrope, fontSize: 17, lineHeight: 2.35, color: 'rgba(59,33,23,.8)', align: 'right',
  }),

  S('rect', 560, 830, 440, 100, { fill: SUN_TOMATO, radius: 4, name: "Today's special" }),
  T("TODAY'S SPECIAL", 584, 848, 300, 18, {
    fontFamily: FONTS.grotesk, fontSize: 9.5, letterSpacing: 2.4, color: 'rgba(242,193,78,.85)',
  }),
  T('Tomato & ricotta toast  ·  11', 584, 872, 392, 32, {
    fontFamily: FONTS.manrope, fontSize: 19, fontWeight: 600, color: SUN_BUTTER,
  }),

  T('HOURS  ·  SAT & SUN 8—3  ·  WEEKDAYS 7:30—14\nFIND US  ·  14 WILTON WAY, LONDON E8 1BG', 560, 970, 440, 44, {
    fontFamily: FONTS.manrope, fontSize: 11.5, lineHeight: 1.7, color: 'rgba(59,33,23,.75)',
  }),

  T('BOOK A TABLE', 560, 1046, 440, 76, {
    fontFamily: FONTS.grotesk, fontSize: 14, fontWeight: 600, letterSpacing: 3, color: SUN_BUTTER,
    align: 'center', valign: 'middle', background: P(SUN_ESPRESSO), backgroundRadius: 38,
  }),
  IC('arrow-up-right', 940, 1072, 22, SUN_BUTTER, 1.6),
  T('Groups of six or more, please book.\nEveryone else, just come.', 560, 1140, 440, 40, {
    fontFamily: FONTS.manrope, fontSize: 12.5, lineHeight: 1.55, color: 'rgba(59,33,23,.6)',
  }),

  S('line', 560, 1206, 440, 1, { fill: NONE, stroke: 'rgba(59,33,23,.28)', strokeWidth: 1 }),
  T('SEE YOU\nSUNDAY.', 552, 1240, 460, 190, {
    fontFamily: FONTS.display, fontSize: 88, fontWeight: 800, lineHeight: 0.96, letterSpacing: -3, color: SUN_ESPRESSO,
  }),

  S('line', 560, 1782, 440, 1, { fill: NONE, stroke: 'rgba(59,33,23,.25)', strokeWidth: 1 }),
  T('@SUNDAYSERVICE  ·  SUNDAYSERVICE.CO', 560, 1802, 440, 20, {
    fontFamily: FONTS.grotesk, fontSize: 9, letterSpacing: 1.8, color: 'rgba(59,33,23,.55)',
  }),
]);

/* ------------------------------------------------------------------ *
 * Collection
 * ------------------------------------------------------------------ */

export const SOCIAL_TEMPLATES: Template[] = [
  {
    id: 'so-aster-skin',
    name: 'Aster Skin — Launch',
    category: 'Instagram',
    description: 'A restrained clinical beauty launch: arched portrait, one product claim and the full formula, set in sage and deep green.',
    size: { name: 'Instagram Post', width: 1080, height: 1080 },
    pages: [asterSkin],
    tags: ['instagram', 'beauty', 'skincare', 'launch', 'serif', 'sage'],
  },
  {
    id: 'so-fieldwork',
    name: 'Fieldwork — Carousel',
    category: 'Instagram',
    description: 'A three-page workwear carousel: moss manifesto, sand material story with a photo pair, clay sizing and stockists.',
    size: { name: 'Instagram Post', width: 1080, height: 1080 },
    pages: [fieldworkManifesto, fieldworkMaterial, fieldworkStockists],
    tags: ['instagram', 'carousel', 'workwear', 'fashion', 'manifesto', 'specs'],
  },
  {
    id: 'so-nocturne',
    name: 'Nocturne — Broadcast',
    category: 'Story',
    description: 'A late-night radio story: ice type on midnight, one live-room photo, the time slot and tonight’s line-up.',
    size: { name: 'Instagram Story', width: 1080, height: 1920 },
    pages: [nocturne],
    tags: ['story', 'radio', 'music', 'night', 'line-up', 'concert'],
  },
  {
    id: 'so-sunday-service',
    name: 'Sunday Service — Brunch',
    category: 'Story',
    description: 'A neighbourhood brunch story: tall coffee photo, a receipt-like menu, hours, and a clear table-booking cue.',
    size: { name: 'Instagram Story', width: 1080, height: 1920 },
    pages: [sundayService],
    tags: ['story', 'brunch', 'cafe', 'menu', 'hospitality', 'butter'],
  },
];
