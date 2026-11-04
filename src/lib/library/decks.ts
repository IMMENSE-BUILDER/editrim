import type { Template } from '../types';
import { T, S, IMG, IC, page, NONE, bgSolid, PHOTOS, FONTS } from '../templateKit';

/**
 * Presentation, report and deck templates.
 *
 * Four systems, each with its own grid, margins, page-numbering and footer:
 *   dk-meridian      — bone / ink / vermillion, 12-column architectural report
 *   dk-tidal         — deep water report, alternating ink and sand spreads
 *   dk-studio-ledger — near-black agency credentials with a lime structural field
 *   dk-common-ground — forest / oat / clay community land trust annual report
 */

const F = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0 };

/* ============================================================
   1. MERIDIAN — urbanism & architecture
   ============================================================ */

const BONE = '#EAE5DC';
const MINK = '#1A1A18';
const VERM = '#D9482B';
const MMUTED = 'rgba(26,26,24,.6)';
const MRULE = 'rgba(26,26,24,.22)';

const meridianCover = page('Cover', bgSolid(BONE), [
  S('rect', 120, 102, 20, 20, { fill: VERM, name: 'Mark' }),
  T('MERIDIAN', 152, 99, 420, 24, { fontSize: 13, fontWeight: 600, letterSpacing: 3.8, color: MINK }),
  T('URBANISM  /  ARCHITECTURE  /  RESEARCH', 1080, 101, 720, 24, {
    fontSize: 11, fontWeight: 500, letterSpacing: 2.6, color: MMUTED, align: 'right',
  }),
  S('line', 120, 150, 1680, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('FIELD NOTES  —  04', 121, 190, 500, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 3.2, color: VERM,
  }),
  T('The city is\nnever finished.', 116, 246, 1000, 300, {
    fontFamily: FONTS.grotesk, fontSize: 118, fontWeight: 500, lineHeight: 0.95, letterSpacing: -4.6, color: MINK,
  }),
  T('MERIDIAN works on the parts of the city that already exist: the stair, the wall, the corner shop, the tree that predates the plan.', 121, 600, 660, 150, {
    fontSize: 20, lineHeight: 1.65, color: MMUTED,
  }),
  S('line', 121, 790, 140, 1, { fill: NONE, stroke: VERM, strokeWidth: 2 }),
  T('SELECTED WORK 2019 — 2026', 121, 816, 560, 22, {
    fontSize: 11, fontWeight: 500, letterSpacing: 2.8, color: MMUTED,
  }),
  T('meridian.practice', 121, 850, 560, 34, {
    fontFamily: FONTS.grotesk, fontSize: 22, fontWeight: 500, color: MINK,
  }),
  IMG(PHOTOS.arch, 1160, 190, 640, 700, {
    name: 'Alvalade Common', filters: { ...F, saturate: 72, contrast: 104 },
  }),
  T('ALVALADE COMMON  —  LISBON  —  2025', 1160, 904, 640, 22, {
    fontSize: 11, fontWeight: 500, letterSpacing: 2.4, color: MMUTED,
  }),
  S('line', 120, 956, 1680, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('MERIDIAN — URBANISM & ARCHITECTURE', 120, 978, 760, 22, {
    fontSize: 11, fontWeight: 500, letterSpacing: 2.6, color: MMUTED,
  }),
  T('01 / 04', 1580, 978, 220, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED, align: 'right' }),
]);

const meridianThesis = page('Thesis', bgSolid(BONE), [
  T('01  —  THESIS', 120, 100, 620, 22, { fontSize: 11, fontWeight: 600, letterSpacing: 3.2, color: VERM }),
  T('MERIDIAN', 1580, 100, 220, 22, { fontSize: 11, letterSpacing: 2.6, color: MMUTED, align: 'right' }),
  S('line', 120, 146, 1680, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('Repair is a\nform of planning.', 116, 196, 1140, 230, {
    fontFamily: FONTS.grotesk, fontSize: 96, fontWeight: 500, lineHeight: 1, letterSpacing: -3.6, color: MINK,
  }),
  T('Most of the city is already built. We begin with what is there, and ask what it can still become.', 1300, 206, 500, 200, {
    fontSize: 19, lineHeight: 1.62, color: MMUTED,
  }),
  S('line', 120, 500, 1680, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  S('line', 120, 540, 520, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('01', 120, 560, 80, 22, { fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: VERM }),
  T('Density is a promise', 120, 590, 500, 70, {
    fontFamily: FONTS.grotesk, fontSize: 32, fontWeight: 500, lineHeight: 1.1, color: MINK,
  }),
  T('A neighbourhood is a negotiation between privacy and company. We draw the terms before we draw the walls.', 120, 676, 470, 170, {
    fontSize: 19, lineHeight: 1.62, color: MMUTED,
  }),
  S('line', 700, 540, 520, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('02', 700, 560, 80, 22, { fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: VERM }),
  T('The ground floor is public', 700, 590, 500, 70, {
    fontFamily: FONTS.grotesk, fontSize: 32, fontWeight: 500, lineHeight: 1.1, color: MINK,
  }),
  T('Streets live at eye level. We give the first three metres the care usually spent on the roof.', 700, 676, 470, 170, {
    fontSize: 19, lineHeight: 1.62, color: MMUTED,
  }),
  S('line', 1280, 540, 520, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('03', 1280, 560, 80, 22, { fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: VERM }),
  T('Maintenance is design', 1280, 590, 500, 70, {
    fontFamily: FONTS.grotesk, fontSize: 32, fontWeight: 500, lineHeight: 1.1, color: MINK,
  }),
  T('A building that cannot be repaired in twenty years was never finished. We detail for the second owner.', 1280, 676, 470, 170, {
    fontSize: 19, lineHeight: 1.62, color: MMUTED,
  }),
  S('line', 120, 884, 1680, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('FOUNDED 2016', 120, 902, 360, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED }),
  T('TWELVE PEOPLE', 560, 902, 360, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED }),
  T('38 PROJECTS', 940, 902, 360, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED }),
  T('71% ADAPTIVE REUSE', 1320, 902, 460, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED }),
  S('line', 120, 956, 1680, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('MERIDIAN — URBANISM & ARCHITECTURE', 120, 978, 760, 22, {
    fontSize: 11, fontWeight: 500, letterSpacing: 2.6, color: MMUTED,
  }),
  T('02 / 04', 1580, 978, 220, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED, align: 'right' }),
]);

const meridianProject = page('Project', bgSolid(BONE), [
  T('02  —  PROJECT', 120, 100, 620, 22, { fontSize: 11, fontWeight: 600, letterSpacing: 3.2, color: VERM }),
  T('CASA VERMELHA  —  LISBON', 1460, 100, 340, 22, {
    fontSize: 11, letterSpacing: 2.4, color: MMUTED, align: 'right',
  }),
  S('line', 120, 146, 1680, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  IMG(PHOTOS.city, 120, 196, 860, 620, {
    name: 'Casa Vermelha', filters: { ...F, saturate: 64, contrast: 106 },
  }),
  T('CASA VERMELHA  —  42 HOMES AROUND A SHARED COURT', 120, 832, 860, 22, {
    fontSize: 11, fontWeight: 500, letterSpacing: 2.4, color: MMUTED,
  }),
  T('A block that\ngives back\nthe street.', 1050, 196, 740, 270, {
    fontFamily: FONTS.grotesk, fontSize: 70, fontWeight: 500, lineHeight: 1.05, letterSpacing: -2.6, color: MINK,
  }),
  T('On the site of a surface car park: 42 homes wrapped around a shared court, a covered market at the corner, and two passages that cut the block north to south.', 1052, 480, 680, 140, {
    fontSize: 19, lineHeight: 1.62, color: MMUTED,
  }),
  S('line', 1050, 640, 700, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('CLIENT', 1050, 660, 180, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED }),
  T('Câmara Municipal de Lisboa', 1230, 657, 520, 26, { fontSize: 18, color: MINK }),
  T('PROGRAMME', 1050, 718, 180, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED }),
  T('Housing  ·  market  ·  public court', 1230, 715, 520, 26, { fontSize: 18, color: MINK }),
  T('AREA', 1050, 776, 180, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED }),
  T('9,400 m² over four storeys', 1230, 773, 520, 26, { fontSize: 18, color: MINK }),
  T('STATUS', 1050, 834, 180, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED }),
  T('Completed 2025', 1230, 831, 520, 26, { fontSize: 18, color: MINK }),
  S('line', 1050, 884, 700, 2, { fill: NONE, stroke: VERM, strokeWidth: 2 }),
  T('SHORTLISTED  —  EU MIES AWARD 2026', 1050, 900, 700, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 2.8, color: VERM,
  }),
  S('line', 120, 956, 1680, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('MERIDIAN — URBANISM & ARCHITECTURE', 120, 978, 760, 22, {
    fontSize: 11, fontWeight: 500, letterSpacing: 2.6, color: MMUTED,
  }),
  T('03 / 04', 1580, 978, 220, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED, align: 'right' }),
]);

const meridianContact = page('Contact', bgSolid(BONE), [
  S('rect', 1360, 0, 560, 1080, { fill: VERM, name: 'Vermillion field' }),
  S('rect', 120, 102, 20, 20, { fill: MINK, name: 'Mark' }),
  T('MERIDIAN', 152, 99, 420, 24, { fontSize: 13, fontWeight: 600, letterSpacing: 3.8, color: MINK }),
  S('line', 120, 146, 1160, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('03  —  CONTACT', 121, 190, 600, 22, { fontSize: 11, fontWeight: 600, letterSpacing: 3.2, color: VERM }),
  T('Start a\nconversation.', 116, 250, 1150, 380, {
    fontFamily: FONTS.grotesk, fontSize: 128, fontWeight: 500, lineHeight: 0.95, letterSpacing: -4.8, color: MINK,
  }),
  T('We take on four projects a year. Tell us what is already there — a building, a street, a stubborn problem.', 121, 600, 780, 120, {
    fontSize: 21, lineHeight: 1.6, color: MMUTED,
  }),
  S('line', 121, 726, 900, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('Urban strategy', 121, 742, 620, 32, { fontFamily: FONTS.grotesk, fontSize: 22, color: MINK }),
  S('line', 121, 776, 900, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('Public realm', 121, 792, 620, 32, { fontFamily: FONTS.grotesk, fontSize: 22, color: MINK }),
  S('line', 121, 826, 900, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('Adaptive reuse & research', 121, 842, 620, 32, { fontFamily: FONTS.grotesk, fontSize: 22, color: MINK }),
  S('line', 121, 876, 900, 1, { fill: NONE, stroke: MRULE, strokeWidth: 1 }),
  T('STUDIO', 1440, 120, 420, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 3, color: 'rgba(234,229,220,.72)',
  }),
  T('Rua da Boavista 84\n1200-068 Lisbon\nPortugal', 1440, 164, 420, 120, {
    fontSize: 22, lineHeight: 1.7, color: BONE,
  }),
  S('line', 1440, 320, 360, 1, { fill: NONE, stroke: 'rgba(234,229,220,.35)', strokeWidth: 1 }),
  T('hello@meridian.practice', 1440, 348, 420, 32, { fontSize: 20, color: BONE }),
  T('+351 21 000 0000', 1440, 388, 420, 32, { fontSize: 20, color: BONE }),
  S('line', 1440, 470, 360, 1, { fill: NONE, stroke: 'rgba(234,229,220,.35)', strokeWidth: 1 }),
  T('Monday — Friday\n09:00 — 18:00', 1440, 498, 420, 80, { fontSize: 16, lineHeight: 1.7, color: 'rgba(234,229,220,.8)' }),
  T('LISBON  —  38.7223° N, 9.1393° W', 1440, 930, 420, 22, {
    fontSize: 11, letterSpacing: 2.2, color: 'rgba(234,229,220,.65)',
  }),
  T('MERIDIAN — URBANISM & ARCHITECTURE', 120, 978, 760, 22, {
    fontSize: 11, fontWeight: 500, letterSpacing: 2.6, color: MMUTED,
  }),
  T('04 / 04', 1130, 978, 200, 22, { fontSize: 11, letterSpacing: 2.4, color: MMUTED, align: 'right' }),
]);

/* ============================================================
   2. TIDAL — climate & water report
   ============================================================ */

const DEEP = '#0C1B2A';
const FOAM = '#8FD3C8';
const SAND = '#E6DCC5';
const SFADED = 'rgba(230,220,197,.62)';
const FRULE = 'rgba(143,211,200,.22)';
const DMUTED = 'rgba(12,27,42,.68)';
const DRULE = 'rgba(12,27,42,.22)';

const TIDE_BARS = [33, 51, 42, 78, 66, 99, 87, 117, 105, 132, 123, 144];

const tidalCover = page('Cover', bgSolid(DEEP), [
  S('ring', 1120, 60, 780, 780, { fill: NONE, stroke: 'rgba(143,211,200,.2)', strokeWidth: 1, name: 'Water ring 1' }),
  S('ring', 1215, 155, 590, 590, { fill: NONE, stroke: 'rgba(143,211,200,.3)', strokeWidth: 1, name: 'Water ring 2' }),
  S('ring', 1305, 245, 410, 410, { fill: NONE, stroke: 'rgba(143,211,200,.42)', strokeWidth: 1, name: 'Water ring 3' }),
  T('TIDAL', 100, 150, 1000, 300, {
    fontFamily: FONTS.dmSerif, fontSize: 250, lineHeight: 1, letterSpacing: 6, color: SAND,
  }),
  T('A REPORT ON WATER, WEATHER\nAND THE SHAPE OF THE COAST', 102, 500, 800, 100, {
    fontFamily: FONTS.oswald, fontSize: 16, lineHeight: 1.9, letterSpacing: 3, color: FOAM,
  }),
  S('line', 102, 640, 300, 1, { fill: NONE, stroke: FOAM, strokeWidth: 2 }),
  T('TIDAL RESEARCH UNIT', 102, 668, 700, 22, {
    fontSize: 11, letterSpacing: 2.8, color: SFADED,
  }),
  T('EDITION 02  /  MARCH 2026', 102, 698, 700, 22, {
    fontSize: 11, letterSpacing: 2.8, color: SFADED,
  }),
  ...TIDE_BARS.map((h, i) => S('rect', 100 + i * 136, 950 - h, 84, h, {
    fill: i === 11 ? SAND : FOAM,
    opacity: i === 11 ? 1 : 0.28 + i * 0.045,
    name: `Tide bar ${i + 1}`,
  })),
  S('line', 96, 950, 1660, 1, { fill: NONE, stroke: 'rgba(143,211,200,.42)', strokeWidth: 1 }),
  T('MONTHLY MEAN LEVEL — SAMPLE STATION, 2025', 102, 782, 900, 22, {
    fontSize: 10, letterSpacing: 2.4, color: 'rgba(143,211,200,.55)',
  }),
  T('MEASURED, NOT PREDICTED', 102, 1004, 700, 22, {
    fontSize: 11, letterSpacing: 2.6, color: 'rgba(143,211,200,.7)',
  }),
  T('01 / 04', 1688, 1004, 124, 22, {
    fontSize: 11, letterSpacing: 1.6, color: 'rgba(143,211,200,.7)', align: 'right',
  }),
]);

const tidalFindings = page('Findings', bgSolid(SAND), [
  T('FINDINGS', 96, 76, 600, 24, {
    fontFamily: FONTS.oswald, fontSize: 15, fontWeight: 500, letterSpacing: 4, color: DEEP,
  }),
  T('FIGURES ILLUSTRATIVE', 1500, 76, 324, 24, {
    fontSize: 11, letterSpacing: 2.6, color: DMUTED, align: 'right',
  }),
  S('line', 96, 116, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('The water is\nalready here.', 92, 156, 900, 200, {
    fontFamily: FONTS.dmSerif, fontSize: 80, lineHeight: 1.02, letterSpacing: -1.4, color: DEEP,
  }),
  T('Three things the last measuring year made hard to ignore.', 1044, 170, 780, 90, {
    fontSize: 20, lineHeight: 1.6, color: DMUTED,
  }),
  S('line', 96, 380, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('01', 96, 400, 60, 22, { fontFamily: FONTS.oswald, fontSize: 13, letterSpacing: 2, color: DMUTED }),
  T('Spring arrives earlier', 180, 392, 330, 70, {
    fontFamily: FONTS.manrope, fontSize: 26, fontWeight: 600, lineHeight: 1.15, color: DEEP,
  }),
  T('The spring peak now lands about nine days ahead of the twenty-year average, and the gap keeps opening.', 560, 394, 640, 100, {
    fontSize: 18, lineHeight: 1.55, color: DMUTED,
  }),
  S('line', 96, 545, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('02', 96, 565, 60, 22, { fontFamily: FONTS.oswald, fontSize: 13, letterSpacing: 2, color: DMUTED }),
  T('Salt moves inland', 180, 557, 330, 70, {
    fontFamily: FONTS.manrope, fontSize: 26, fontWeight: 600, lineHeight: 1.15, color: DEEP,
  }),
  T('In three of the five estuaries we survey, the salt line now sits further upstream than it did in 1998.', 560, 559, 640, 100, {
    fontSize: 18, lineHeight: 1.55, color: DMUTED,
  }),
  S('line', 96, 710, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('03', 96, 730, 60, 22, { fontFamily: FONTS.oswald, fontSize: 13, letterSpacing: 2, color: DMUTED }),
  T('Defences age quietly', 180, 722, 330, 70, {
    fontFamily: FONTS.manrope, fontSize: 26, fontWeight: 600, lineHeight: 1.15, color: DEEP,
  }),
  T('A third of the sea walls we inspected are past the design life written on their own drawings.', 560, 724, 640, 100, {
    fontSize: 18, lineHeight: 1.55, color: DMUTED,
  }),
  T('FROM THE FIELD', 1290, 380, 480, 22, {
    fontFamily: FONTS.oswald, fontSize: 12, letterSpacing: 3, color: DMUTED,
  }),
  T('NORFOLK, UK — 2025', 1290, 430, 480, 22, {
    fontFamily: FONTS.oswald, fontSize: 11, letterSpacing: 2, color: DMUTED,
  }),
  T('Three of eleven defences have no record of the last repair.', 1290, 458, 470, 80, {
    fontSize: 17, lineHeight: 1.5, color: 'rgba(12,27,42,.86)',
  }),
  T('LIMBURG, NL — 2025', 1290, 590, 480, 22, {
    fontFamily: FONTS.oswald, fontSize: 11, letterSpacing: 2, color: DMUTED,
  }),
  T('The peak came nine days early. The meadows held it.', 1290, 618, 470, 80, {
    fontSize: 17, lineHeight: 1.5, color: 'rgba(12,27,42,.86)',
  }),
  T('ESSEX, UK — 2024', 1290, 750, 480, 22, {
    fontFamily: FONTS.oswald, fontSize: 11, letterSpacing: 2, color: DMUTED,
  }),
  T('The marsh edge moved two fields inland in a single winter.', 1290, 778, 470, 80, {
    fontSize: 17, lineHeight: 1.5, color: 'rgba(12,27,42,.86)',
  }),
  T('TIDAL — A READING OF THE WATER LINE', 96, 1004, 800, 22, {
    fontSize: 11, letterSpacing: 2.6, color: DMUTED,
  }),
  T('02 / 04', 1688, 1004, 124, 22, { fontSize: 11, letterSpacing: 1.6, color: DMUTED, align: 'right' }),
]);

const CHART_BARS = [285, 235, 335, 370, 395, 380, 455, 485, 440, 525];

const tidalChart = page('Measurements', bgSolid(DEEP), [
  T('MEASUREMENTS', 96, 76, 600, 24, {
    fontFamily: FONTS.oswald, fontSize: 15, fontWeight: 500, letterSpacing: 4, color: FOAM,
  }),
  T('ILLUSTRATIVE — SAMPLE DATA, NOT A FORECAST', 1300, 76, 524, 24, {
    fontSize: 10, letterSpacing: 2.2, color: 'rgba(143,211,200,.8)', align: 'right',
  }),
  S('line', 96, 116, 1728, 1, { fill: NONE, stroke: FRULE, strokeWidth: 1 }),
  T('Twelve months at one station.', 92, 150, 1300, 120, {
    fontFamily: FONTS.dmSerif, fontSize: 68, lineHeight: 1.04, letterSpacing: -1, color: SAND,
  }),
  T('Mean water level, 2025 — sample values, centimetres above the 1990 baseline.', 96, 268, 1000, 28, {
    fontSize: 15, color: SFADED,
  }),
  S('line', 96, 560, 1728, 1, { fill: NONE, stroke: 'rgba(143,211,200,.2)', strokeWidth: 1 }),
  S('line', 96, 720, 1728, 1, { fill: NONE, stroke: 'rgba(143,211,200,.2)', strokeWidth: 1 }),
  S('line', 96, 860, 1728, 1, { fill: NONE, stroke: 'rgba(230,220,197,.45)', strokeWidth: 1 }),
  ...CHART_BARS.map((h, i) => S('rect', 110 + i * 104, 860 - h, 66, h, {
    fill: i === 9 ? SAND : FOAM,
    opacity: i === 9 ? 1 : 0.78,
    name: `Bar ${String(i + 1).padStart(2, '0')}`,
  })),
  T('JAN', 110, 880, 100, 22, { fontFamily: FONTS.oswald, fontSize: 12, letterSpacing: 2, color: SFADED }),
  T('JUN', 630, 880, 100, 22, { fontFamily: FONTS.oswald, fontSize: 12, letterSpacing: 2, color: SFADED }),
  T('DEC', 1044, 880, 100, 22, { fontFamily: FONTS.oswald, fontSize: 12, letterSpacing: 2, color: SFADED }),
  T('December closes at the highest level in the sample — and the last three months are the ones to watch.', 1240, 470, 560, 110, {
    fontSize: 17, lineHeight: 1.55, color: 'rgba(230,220,197,.86)',
  }),
  T('A sample year at a single station, drawn to show the shape of a season. Bars are illustrative, not a measurement or a projection.', 96, 912, 900, 60, {
    fontSize: 12, lineHeight: 1.6, color: 'rgba(230,220,197,.55)',
  }),
  T('TIDAL RESEARCH UNIT — MEASUREMENTS', 96, 1004, 800, 22, {
    fontSize: 11, letterSpacing: 2.6, color: 'rgba(143,211,200,.7)',
  }),
  T('03 / 04', 1688, 1004, 124, 22, {
    fontSize: 11, letterSpacing: 1.6, color: 'rgba(143,211,200,.7)', align: 'right',
  }),
]);
const tidalActions = page('Recommendations', bgSolid(SAND), [
  T('RECOMMENDATIONS', 96, 76, 700, 24, {
    fontFamily: FONTS.oswald, fontSize: 15, fontWeight: 500, letterSpacing: 4, color: DEEP,
  }),
  T('TIDAL — 2026', 1500, 76, 324, 24, { fontSize: 11, letterSpacing: 2.6, color: DMUTED, align: 'right' }),
  S('line', 96, 116, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('What we would do next.', 92, 156, 1060, 120, {
    fontFamily: FONTS.dmSerif, fontSize: 68, lineHeight: 1.04, letterSpacing: -1, color: DEEP,
  }),
  T('Four moves that cost less than waiting, and that a council can start this year.', 1090, 168, 730, 90, {
    fontSize: 19, lineHeight: 1.6, color: DMUTED,
  }),
  S('line', 96, 336, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('01', 96, 356, 60, 22, { fontFamily: FONTS.oswald, fontSize: 13, letterSpacing: 2, color: DMUTED }),
  T('Measure the small water', 170, 348, 380, 70, {
    fontFamily: FONTS.manrope, fontSize: 25, fontWeight: 600, lineHeight: 1.15, color: DEEP,
  }),
  T('Fund street-level gauges, not only tide gauges. Most of the damage starts at the kerb.', 590, 352, 780, 80, {
    fontSize: 18, lineHeight: 1.55, color: DMUTED,
  }),
  S('line', 96, 466, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('02', 96, 486, 60, 22, { fontFamily: FONTS.oswald, fontSize: 13, letterSpacing: 2, color: DMUTED }),
  T('Buy time with sand', 170, 478, 380, 70, {
    fontFamily: FONTS.manrope, fontSize: 25, fontWeight: 600, lineHeight: 1.15, color: DEEP,
  }),
  T('Soft edges and planted buffers cost less than concrete, and fail more gently when they fail.', 590, 482, 780, 80, {
    fontSize: 18, lineHeight: 1.55, color: DMUTED,
  }),
  S('line', 96, 596, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('03', 96, 616, 60, 22, { fontFamily: FONTS.oswald, fontSize: 13, letterSpacing: 2, color: DMUTED }),
  T('Publish the maintenance ledger', 170, 608, 380, 70, {
    fontFamily: FONTS.manrope, fontSize: 25, fontWeight: 600, lineHeight: 1.15, color: DEEP,
  }),
  T('Every defence should carry its build date, its design life and its last inspection in public.', 590, 612, 780, 80, {
    fontSize: 18, lineHeight: 1.55, color: DMUTED,
  }),
  S('line', 96, 726, 1728, 1, { fill: NONE, stroke: DRULE, strokeWidth: 1 }),
  T('04', 96, 746, 60, 22, { fontFamily: FONTS.oswald, fontSize: 13, letterSpacing: 2, color: DMUTED }),
  T('Decide where the water may go', 170, 738, 380, 70, {
    fontFamily: FONTS.manrope, fontSize: 25, fontWeight: 600, lineHeight: 1.15, color: DEEP,
  }),
  T('Choose the retreat now, while there is still room to choose it. Later is more expensive and less kind.', 590, 742, 780, 80, {
    fontSize: 18, lineHeight: 1.55, color: DMUTED,
  }),
  S('rect', 96, 872, 1728, 76, { fill: DEEP, name: 'Report band' }),
  T('The full report, methods and station list — tidal.report/2026', 128, 894, 1200, 32, {
    fontFamily: FONTS.manrope, fontSize: 18, fontWeight: 500, color: SAND,
  }),
  IC('arrow-up-right', 1752, 894, 28, FOAM, 1.8),
  T('TIDAL RESEARCH UNIT — EDITION 02', 96, 1004, 800, 22, {
    fontSize: 11, letterSpacing: 2.6, color: DMUTED,
  }),
  T('04 / 04', 1688, 1004, 124, 22, { fontSize: 11, letterSpacing: 1.6, color: DMUTED, align: 'right' }),
]);

/* ============================================================
   3. STUDIO LEDGER — creative agency credentials
   ============================================================ */

const LEDGER_INK = '#0D0D0D';
const LEDGER_LIME = '#D8F55A';
const LEDGER_PAPER = '#F2EFE6';
const LMUTED = 'rgba(242,239,230,.56)';
const LRULE = 'rgba(242,239,230,.18)';
const PMUTED = 'rgba(13,13,13,.6)';
const PRULE = 'rgba(13,13,13,.2)';

const ledgerCover = page('Cover', bgSolid(LEDGER_INK), [
  S('rect', 0, 0, 1920, 8, { fill: LEDGER_LIME, name: 'Lime edge' }),
  S('rect', 1128, 0, 792, 1080, { fill: LEDGER_LIME, name: 'Lime field' }),
  T('CREATIVE CREDENTIALS — 2026', 88, 78, 700, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 3.4, color: LMUTED,
  }),
  T('STUDIO', 84, 180, 1040, 170, {
    fontFamily: FONTS.black, fontSize: 150, lineHeight: 0.9, letterSpacing: -3, color: LEDGER_PAPER,
  }),
  T('LEDGER', 84, 322, 1040, 170, {
    fontFamily: FONTS.black, fontSize: 150, lineHeight: 0.9, letterSpacing: -3, color: LEDGER_LIME,
  }),
  T('An independent agency for brands that would rather be believed than noticed.', 88, 594, 800, 100, {
    fontSize: 22, lineHeight: 1.55, color: 'rgba(242,239,230,.72)',
  }),
  S('rect', 88, 752, 860, 3, { fill: LEDGER_LIME, name: 'Lime rule' }),
  T('EST. 2014 — LONDON & BERLIN', 88, 780, 700, 22, {
    fontSize: 11, letterSpacing: 3, color: LMUTED,
  }),
  T('01 / 04', 88, 978, 400, 22, { fontSize: 11, letterSpacing: 3, color: LMUTED }),
  T('INDEX', 1200, 78, 500, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 3.4, color: 'rgba(13,13,13,.6)',
  }),
  T('01', 1200, 140, 60, 26, { fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'rgba(13,13,13,.5)' }),
  T('Cover', 1268, 134, 420, 40, { fontFamily: FONTS.black, fontSize: 26, letterSpacing: -0.4, color: LEDGER_INK }),
  S('rect', 1200, 184, 672, 1, { fill: 'rgba(13,13,13,.2)', name: 'Index rule 1' }),
  T('02', 1200, 210, 60, 26, { fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'rgba(13,13,13,.5)' }),
  T('Selected work', 1268, 204, 460, 40, { fontFamily: FONTS.black, fontSize: 26, letterSpacing: -0.4, color: LEDGER_INK }),
  S('rect', 1200, 254, 672, 1, { fill: 'rgba(13,13,13,.2)', name: 'Index rule 2' }),
  T('03', 1200, 280, 60, 26, { fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'rgba(13,13,13,.5)' }),
  T('Process', 1268, 274, 460, 40, { fontFamily: FONTS.black, fontSize: 26, letterSpacing: -0.4, color: LEDGER_INK }),
  S('rect', 1200, 324, 672, 1, { fill: 'rgba(13,13,13,.2)', name: 'Index rule 3' }),
  T('04', 1200, 350, 60, 26, { fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'rgba(13,13,13,.5)' }),
  T('Contact', 1268, 344, 460, 40, { fontFamily: FONTS.black, fontSize: 26, letterSpacing: -0.4, color: LEDGER_INK }),
  S('rect', 1200, 394, 672, 1, { fill: 'rgba(13,13,13,.2)', name: 'Index rule 4' }),
  T('NEW BUSINESS — HELLO@STUDIOLEDGER.COM', 1200, 900, 620, 24, {
    fontSize: 11, letterSpacing: 2.4, color: 'rgba(13,13,13,.6)',
  }),
  T('INSTAGRAM — @STUDIOLEDGER', 1200, 930, 620, 24, {
    fontSize: 11, letterSpacing: 2.4, color: 'rgba(13,13,13,.6)',
  }),
  T('We work with founders, museums and one ferry company. No pitch theatre, no awards entered on your behalf.', 1200, 470, 620, 130, {
    fontSize: 19, lineHeight: 1.55, color: 'rgba(13,13,13,.72)',
  }),
]);

const ledgerWork = page('Selected work', bgSolid(LEDGER_PAPER), [
  S('rect', 0, 0, 1920, 8, { fill: LEDGER_LIME, name: 'Lime edge' }),
  T('02 / SELECTED WORK', 88, 64, 700, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 3.2, color: PMUTED,
  }),
  T('STUDIO LEDGER — CREDENTIALS', 1400, 64, 424, 22, {
    fontSize: 11, letterSpacing: 2.4, color: PMUTED, align: 'right',
  }),
  S('line', 88, 104, 1744, 1, { fill: NONE, stroke: PRULE, strokeWidth: 1 }),
  T('Work that earns\nits attention.', 84, 150, 1040, 170, {
    fontFamily: FONTS.black, fontSize: 72, lineHeight: 0.95, letterSpacing: -2, color: LEDGER_INK,
  }),
  IMG(PHOTOS.office, 88, 400, 700, 470, {
    name: 'Studio, Shoreditch', filters: { ...F, saturate: 62, contrast: 106 },
  }),
  T('STUDIO LEDGER — SHOREDITCH, LONDON', 88, 884, 700, 22, {
    fontSize: 11, letterSpacing: 2.4, color: PMUTED,
  }),
  S('line', 900, 376, 932, 1, { fill: NONE, stroke: PRULE, strokeWidth: 1 }),
  T('NORTHWIND', 900, 400, 460, 44, {
    fontFamily: FONTS.black, fontSize: 28, letterSpacing: -0.4, color: LEDGER_INK,
  }),
  T('BRAND — 2025', 1500, 404, 332, 24, { fontSize: 11, letterSpacing: 2.2, color: PMUTED, align: 'right' }),
  T('Identity and packaging for a cold-water swim brand, built for a shelf in a fishing town.', 900, 448, 620, 70, {
    fontSize: 18, lineHeight: 1.5, color: 'rgba(13,13,13,.72)',
  }),
  S('line', 900, 526, 932, 1, { fill: NONE, stroke: PRULE, strokeWidth: 1 }),
  T('HALO', 900, 550, 460, 44, {
    fontFamily: FONTS.black, fontSize: 28, letterSpacing: -0.4, color: LEDGER_INK,
  }),
  T('PRODUCT — 2024', 1500, 554, 332, 24, { fontSize: 11, letterSpacing: 2.2, color: PMUTED, align: 'right' }),
  T('A banking app that explains itself. Eight screens, one voice, no confetti.', 900, 598, 620, 70, {
    fontSize: 18, lineHeight: 1.5, color: 'rgba(13,13,13,.72)',
  }),
  S('line', 900, 676, 932, 1, { fill: NONE, stroke: PRULE, strokeWidth: 1 }),
  T('FIELDNOTE', 900, 700, 460, 44, {
    fontFamily: FONTS.black, fontSize: 28, letterSpacing: -0.4, color: LEDGER_INK,
  }),
  T('EDITORIAL — 2023', 1500, 704, 332, 24, { fontSize: 11, letterSpacing: 2.2, color: PMUTED, align: 'right' }),
  T('An editorial system for a slow-travel magazine that prints four times a year.', 900, 748, 620, 70, {
    fontSize: 18, lineHeight: 1.5, color: 'rgba(13,13,13,.72)',
  }),
  S('line', 900, 826, 932, 1, { fill: NONE, stroke: PRULE, strokeWidth: 1 }),
  T('Full case studies on request.', 900, 846, 620, 26, { fontSize: 15, color: PMUTED }),
  S('line', 88, 956, 1744, 1, { fill: NONE, stroke: PRULE, strokeWidth: 1 }),
  T('STUDIO LEDGER — CREDENTIALS 2026', 88, 978, 900, 22, {
    fontSize: 11, letterSpacing: 2.6, color: PMUTED,
  }),
  T('02 / 04', 1700, 978, 132, 22, { fontSize: 11, letterSpacing: 2.4, color: PMUTED, align: 'right' }),
]);

const ledgerProcess = page('Process', bgSolid(LEDGER_INK), [
  S('rect', 0, 0, 1920, 8, { fill: LEDGER_LIME, name: 'Lime edge' }),
  T('03 / PROCESS', 88, 64, 700, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 3.2, color: LMUTED,
  }),
  T('FOUR MOVES, NO THEATRE', 1400, 64, 424, 22, {
    fontSize: 11, letterSpacing: 2.4, color: LMUTED, align: 'right',
  }),
  S('line', 88, 104, 1744, 1, { fill: NONE, stroke: LRULE, strokeWidth: 1 }),
  T('How we get\nto good.', 84, 150, 1100, 180, {
    fontFamily: FONTS.black, fontSize: 84, lineHeight: 0.95, letterSpacing: -2.2, color: LEDGER_PAPER,
  }),
  S('rect', 88, 342, 220, 6, { fill: LEDGER_LIME, name: 'Lime rule' }),
  S('line', 88, 424, 1744, 1, { fill: NONE, stroke: LRULE, strokeWidth: 1 }),
  T('01', 88, 452, 120, 60, { fontFamily: FONTS.black, fontSize: 44, color: LEDGER_LIME }),
  T('Interrogate', 88, 512, 400, 40, { fontFamily: FONTS.manrope, fontSize: 26, fontWeight: 600, color: LEDGER_PAPER }),
  T('Two weeks of questions, one page of truth, and a decision about what the brand is for.', 88, 556, 380, 120, {
    fontSize: 17, lineHeight: 1.55, color: 'rgba(242,239,230,.6)',
  }),
  T('02', 520, 452, 120, 60, { fontFamily: FONTS.black, fontSize: 44, color: LEDGER_LIME }),
  T('Prototype', 520, 512, 400, 40, { fontFamily: FONTS.manrope, fontSize: 26, fontWeight: 600, color: LEDGER_PAPER }),
  T('We make the thing early and badly, then make it again with the parts that survived.', 520, 556, 380, 120, {
    fontSize: 17, lineHeight: 1.55, color: 'rgba(242,239,230,.6)',
  }),
  T('03', 952, 452, 120, 60, { fontFamily: FONTS.black, fontSize: 44, color: LEDGER_LIME }),
  T('Commit', 952, 512, 400, 40, { fontFamily: FONTS.manrope, fontSize: 26, fontWeight: 600, color: LEDGER_PAPER }),
  T('One direction, fully built. Not three options in a folder and a nervous email.', 952, 556, 380, 120, {
    fontSize: 17, lineHeight: 1.55, color: 'rgba(242,239,230,.6)',
  }),
  T('04', 1384, 452, 120, 60, { fontFamily: FONTS.black, fontSize: 44, color: LEDGER_LIME }),
  T('Hand over', 1384, 512, 400, 40, { fontFamily: FONTS.manrope, fontSize: 26, fontWeight: 600, color: LEDGER_PAPER }),
  T('Files, rules and a person who answers the phone twelve months later.', 1384, 556, 380, 120, {
    fontSize: 17, lineHeight: 1.55, color: 'rgba(242,239,230,.6)',
  }),
  S('rect', 88, 740, 1744, 150, { fill: LEDGER_LIME, name: 'Lime field' }),
  T('No decks about decks.\nWe make the thing.', 124, 768, 1200, 100, {
    fontFamily: FONTS.black, fontSize: 38, lineHeight: 1.08, letterSpacing: -0.8, color: LEDGER_INK,
  }),
  T('AVAILABLE FOR TWO NEW ENGAGEMENTS IN Q3 2026', 124, 890, 900, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: 'rgba(13,13,13,.62)',
  }),
  IC('arrow-up-right', 1728, 786, 56, LEDGER_INK, 1.6),
  T('STUDIO LEDGER — PROCESS', 88, 978, 900, 22, { fontSize: 11, letterSpacing: 2.6, color: LMUTED }),
  T('03 / 04', 1700, 978, 132, 22, { fontSize: 11, letterSpacing: 2.4, color: LMUTED, align: 'right' }),
]);

const ledgerContact = page('Contact', bgSolid(LEDGER_LIME), [
  S('rect', 0, 0, 1920, 8, { fill: LEDGER_INK, name: 'Ink edge' }),
  T('04 / CONTACT', 88, 64, 700, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 3.2, color: 'rgba(13,13,13,.6)',
  }),
  T('LONDON — BERLIN — EVERYWHERE', 1400, 64, 424, 22, {
    fontSize: 11, letterSpacing: 2.4, color: 'rgba(13,13,13,.6)', align: 'right',
  }),
  S('line', 88, 104, 1744, 1, { fill: NONE, stroke: 'rgba(13,13,13,.28)', strokeWidth: 1 }),
  T('Let’s make\nsomething\nuseful.', 84, 168, 1200, 400, {
    fontFamily: FONTS.black, fontSize: 128, lineHeight: 0.92, letterSpacing: -3, color: LEDGER_INK,
  }),
  T('Tell us what you are launching, and what has been tried already.', 88, 596, 760, 80, {
    fontSize: 20, lineHeight: 1.55, color: 'rgba(13,13,13,.7)',
  }),
  T('hello@studioledger.com', 88, 700, 900, 50, {
    fontFamily: FONTS.manrope, fontSize: 30, fontWeight: 600, color: LEDGER_INK,
  }),
  T('+44 20 7946 0031', 88, 752, 600, 32, { fontSize: 20, color: 'rgba(13,13,13,.7)' }),
  T('18 Rivington Street\nLondon EC2A 3DZ', 88, 792, 600, 72, { fontSize: 20, lineHeight: 1.6, color: 'rgba(13,13,13,.7)' }),
  S('rect', 1320, 150, 512, 760, { fill: LEDGER_INK, name: 'Ink panel' }),
  T('NEW BUSINESS', 1360, 190, 420, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 3, color: LEDGER_LIME,
  }),
  T('We reply within\ntwo working days.', 1360, 230, 430, 100, {
    fontFamily: FONTS.manrope, fontSize: 26, fontWeight: 600, lineHeight: 1.25, color: LEDGER_PAPER,
  }),
  S('line', 1360, 366, 432, 1, { fill: NONE, stroke: LRULE, strokeWidth: 1 }),
  T('CAPABILITIES', 1360, 396, 420, 22, {
    fontSize: 11, fontWeight: 600, letterSpacing: 2.8, color: 'rgba(242,239,230,.5)',
  }),
  T('Brand strategy', 1360, 434, 420, 32, { fontSize: 18, color: 'rgba(242,239,230,.86)' }),
  T('Identity systems', 1360, 474, 420, 32, { fontSize: 18, color: 'rgba(242,239,230,.86)' }),
  T('Digital product', 1360, 514, 420, 32, { fontSize: 18, color: 'rgba(242,239,230,.86)' }),
  T('Editorial & content', 1360, 554, 420, 32, { fontSize: 18, color: 'rgba(242,239,230,.86)' }),
  T('Campaign', 1360, 594, 420, 32, { fontSize: 18, color: 'rgba(242,239,230,.86)' }),
  T('SELECTED CLIENTS ON REQUEST', 1360, 830, 420, 22, {
    fontSize: 10, letterSpacing: 2.2, color: 'rgba(242,239,230,.45)',
  }),
  T('Brands, products and the occasional ferry company.', 1360, 690, 430, 80, {
    fontSize: 17, lineHeight: 1.5, color: 'rgba(242,239,230,.62)',
  }),
  T('STUDIO LEDGER — 2026', 88, 978, 700, 22, {
    fontSize: 11, letterSpacing: 2.6, color: 'rgba(13,13,13,.55)',
  }),
  T('04 / 04', 1700, 978, 132, 22, {
    fontSize: 11, letterSpacing: 2.4, color: 'rgba(13,13,13,.55)', align: 'right',
  }),
]);

/* ============================================================
   4. COMMON GROUND — community land trust annual report
   ============================================================ */

const FOREST = '#173A2E';
const OAT = '#E8DFC9';
const CLAY = '#C96F4A';
const CFADED = 'rgba(232,223,201,.7)';
const CRULE = 'rgba(232,223,201,.24)';
const OMUTED = 'rgba(23,58,46,.72)';
const ORULE = 'rgba(23,58,46,.22)';

const commonCover = page('Cover', bgSolid(FOREST), [
  IMG(PHOTOS.flowers, 1080, 0, 840, 1080, {
    name: 'Orchard, spring', filters: { ...F, saturate: 84, contrast: 104 },
  }),
  S('rect', 1080, 0, 840, 1080, { fill: 'rgba(23,58,46,.18)', name: 'Forest wash' }),
  S('rect', 104, 158, 860, 2, { fill: CLAY, name: 'Clay rule' }),
  T('Common Ground', 104, 58, 600, 34, {
    fontFamily: FONTS.fraunces, fontSize: 26, fontWeight: 600, color: OAT,
  }),
  T('ANNUAL REPORT 2025', 104, 116, 700, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 3.4, color: CFADED,
  }),
  T('A place to\nstay.', 100, 214, 940, 320, {
    fontFamily: FONTS.fraunces, fontSize: 150, fontWeight: 600, lineHeight: 0.92, letterSpacing: -3, color: OAT,
  }),
  T('Forty-six homes, held in trust.', 104, 536, 720, 60, {
    fontFamily: FONTS.fraunces, fontSize: 40, italic: true, color: CLAY,
  }),
  T('A community land trust in East Bristol. We hold land out of the market so the people who live here can stay here.', 104, 618, 720, 150, {
    fontFamily: FONTS.montserrat, fontSize: 20, lineHeight: 1.65, color: CFADED,
  }),
  T('AGM — 14 MAY 2026  /  ALL MEMBERS WELCOME', 104, 848, 760, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: CLAY,
  }),
  S('rect', 104, 890, 860, 1, { fill: CRULE, name: 'Foot rule' }),
  T('EST. 2011 — EASTON, BRISTOL', 104, 910, 600, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, letterSpacing: 2.6, color: CFADED,
  }),
  T('01 / 03', 104, 1000, 400, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, letterSpacing: 2.6, color: CFADED,
  }),
]);

const commonGlance = page('2025 at a glance', bgSolid(OAT), [
  T('2025 AT A GLANCE', 104, 72, 700, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 3.4, color: OMUTED,
  }),
  T('COMMON GROUND', 1500, 72, 324, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, letterSpacing: 2.8, color: OMUTED, align: 'right',
  }),
  S('line', 104, 112, 1712, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('The year in\nplain numbers.', 100, 156, 900, 200, {
    fontFamily: FONTS.fraunces, fontSize: 76, fontWeight: 600, lineHeight: 1.02, letterSpacing: -1.6, color: FOREST,
  }),
  T('A trust is a slow machine. These are the figures we report to members each spring, audited and unglamorous.', 1044, 172, 772, 120, {
    fontFamily: FONTS.montserrat, fontSize: 18, lineHeight: 1.65, color: OMUTED,
  }),
  S('line', 104, 380, 1712, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('HOMES IN TRUST', 104, 402, 300, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: OMUTED,
  }),
  T('46', 420, 386, 220, 64, {
    fontFamily: FONTS.fraunces, fontSize: 48, fontWeight: 600, lineHeight: 1, color: FOREST,
  }),
  T('Five added on Stafford Road', 700, 400, 760, 40, {
    fontFamily: FONTS.montserrat, fontSize: 16, color: OMUTED,
  }),
  S('line', 104, 498, 1712, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('PEOPLE HOUSED', 104, 520, 300, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: OMUTED,
  }),
  T('138', 420, 504, 220, 64, {
    fontFamily: FONTS.fraunces, fontSize: 48, fontWeight: 600, lineHeight: 1, color: FOREST,
  }),
  T('Including 34 children', 700, 518, 760, 40, {
    fontFamily: FONTS.montserrat, fontSize: 16, color: OMUTED,
  }),
  S('line', 104, 616, 1712, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('RENT CAP', 104, 638, 300, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: OMUTED,
  }),
  T('35%', 420, 622, 220, 64, {
    fontFamily: FONTS.fraunces, fontSize: 48, fontWeight: 600, lineHeight: 1, color: CLAY,
  }),
  T('Of local median income, written into every lease', 700, 636, 900, 40, {
    fontFamily: FONTS.montserrat, fontSize: 16, color: OMUTED,
  }),
  S('line', 104, 734, 1712, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('MEMBERS', 104, 756, 300, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 2.6, color: OMUTED,
  }),
  T('212', 420, 740, 220, 64, {
    fontFamily: FONTS.fraunces, fontSize: 48, fontWeight: 600, lineHeight: 1, color: FOREST,
  }),
  T('Up 38 this year, and every one of them has a vote', 700, 754, 980, 40, {
    fontFamily: FONTS.montserrat, fontSize: 16, color: OMUTED,
  }),
  S('line', 104, 852, 1712, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('Full accounts are filed with the Financial Conduct Authority and posted to members each June.', 104, 900, 900, 50, {
    fontFamily: FONTS.montserrat, fontSize: 13, lineHeight: 1.6, color: OMUTED,
  }),
  T('COMMON GROUND — ANNUAL REPORT 2025', 104, 1000, 900, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, letterSpacing: 2.6, color: OMUTED,
  }),
  T('02 / 03', 1700, 1000, 132, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, letterSpacing: 2.6, color: OMUTED, align: 'right',
  }),
]);

const commonAgm = page('Invitation', bgSolid(OAT), [
  IMG(PHOTOS.portrait, 1240, 0, 680, 1080, {
    name: 'Member portrait', filters: { ...F, saturate: 78, contrast: 104 },
  }),
  S('rect', 1240, 900, 680, 180, { fill: 'rgba(23,58,46,.9)', name: 'Image caption field' }),
  T('MEMBER PORTRAIT — SPRING 2025', 1272, 938, 600, 24, {
    fontFamily: FONTS.montserrat, fontSize: 10, letterSpacing: 2.4, color: CFADED,
  }),
  T('INVITATION', 104, 72, 700, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 3.4, color: OMUTED,
  }),
  T('COMMON GROUND', 900, 72, 300, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, letterSpacing: 2.8, color: OMUTED, align: 'right',
  }),
  S('line', 104, 112, 1096, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('Come to\nthe AGM.', 100, 168, 1000, 280, {
    fontFamily: FONTS.fraunces, fontSize: 120, fontWeight: 600, lineHeight: 0.94, letterSpacing: -2.4, color: FOREST,
  }),
  T('Once a year we open the books, argue about the orchard, and eat together. Members and neighbours are both welcome.', 104, 476, 700, 110, {
    fontFamily: FONTS.montserrat, fontSize: 18, lineHeight: 1.65, color: OMUTED,
  }),
  T('DATE', 104, 630, 180, 22, {
    fontFamily: FONTS.montserrat, fontSize: 10, fontWeight: 600, letterSpacing: 2.4, color: OMUTED,
  }),
  T('Thursday 14 May 2026', 300, 626, 620, 34, {
    fontFamily: FONTS.montserrat, fontSize: 20, fontWeight: 500, color: FOREST,
  }),
  S('line', 104, 672, 860, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('TIME', 104, 690, 180, 22, {
    fontFamily: FONTS.montserrat, fontSize: 10, fontWeight: 600, letterSpacing: 2.4, color: OMUTED,
  }),
  T('18:30 — 20:30', 300, 686, 620, 34, {
    fontFamily: FONTS.montserrat, fontSize: 20, fontWeight: 500, color: FOREST,
  }),
  S('line', 104, 732, 860, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('PLACE', 104, 750, 180, 22, {
    fontFamily: FONTS.montserrat, fontSize: 10, fontWeight: 600, letterSpacing: 2.4, color: OMUTED,
  }),
  T('The Old Laundry, Easton', 300, 746, 620, 34, {
    fontFamily: FONTS.montserrat, fontSize: 20, fontWeight: 500, color: FOREST,
  }),
  S('line', 104, 792, 860, 1, { fill: NONE, stroke: ORULE, strokeWidth: 1 }),
  T('SUPPER', 104, 810, 180, 22, {
    fontFamily: FONTS.montserrat, fontSize: 10, fontWeight: 600, letterSpacing: 2.4, color: OMUTED,
  }),
  T('Provided. Bring a neighbour.', 300, 806, 620, 34, {
    fontFamily: FONTS.montserrat, fontSize: 20, fontWeight: 500, color: FOREST,
  }),
  S('rect', 104, 872, 860, 2, { fill: CLAY, name: 'Clay rule' }),
  T('RSVP BY 7 MAY  —  MEMBERS@COMMONGROUND.ORG.UK', 104, 892, 900, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, fontWeight: 600, letterSpacing: 1.8, color: CLAY,
  }),
  T('COMMON GROUND — EASTON, BRISTOL', 104, 1000, 800, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, letterSpacing: 2.6, color: OMUTED,
  }),
  T('03 / 03', 1140, 1000, 60, 24, {
    fontFamily: FONTS.montserrat, fontSize: 11, letterSpacing: 2.6, color: OMUTED, align: 'right',
  }),
]);

export const DECK_TEMPLATES: Template[] = [
  {
    id: 'dk-meridian',
    name: 'MERIDIAN — Urbanism',
    category: 'Presentation',
    description: 'A four-page architecture and urbanism deck on a strict bone-and-ink grid, with one strong photograph.',
    size: { name: 'Presentation', width: 1920, height: 1080 },
    pages: [meridianCover, meridianThesis, meridianProject, meridianContact],
    tags: ['architecture', 'urbanism', 'deck', 'grid', 'editorial', 'vermillion'],
  },
  {
    id: 'dk-tidal',
    name: 'TIDAL — Water Report',
    category: 'Presentation',
    description: 'A climate and water report that alternates deep ink and sand spreads, with a chart built from bars.',
    size: { name: 'Presentation', width: 1920, height: 1080 },
    pages: [tidalCover, tidalFindings, tidalChart, tidalActions],
    tags: ['climate', 'report', 'data', 'chart', 'ocean', 'deck'],
  },
  {
    id: 'dk-studio-ledger',
    name: 'STUDIO LEDGER — Credentials',
    category: 'Presentation',
    description: 'Bold agency credentials: black and paper spreads cut by a lime field, with work, process and contact.',
    size: { name: 'Presentation', width: 1920, height: 1080 },
    pages: [ledgerCover, ledgerWork, ledgerProcess, ledgerContact],
    tags: ['agency', 'credentials', 'portfolio', 'bold', 'lime', 'deck'],
  },
  {
    id: 'dk-common-ground',
    name: 'COMMON GROUND — Annual Report',
    category: 'Presentation',
    description: 'A warm civic annual report for a community land trust: forest, oat and clay, with a plain-numbers ledger.',
    size: { name: 'Presentation', width: 1920, height: 1080 },
    pages: [commonCover, commonGlance, commonAgm],
    tags: ['annual report', 'community', 'land trust', 'civic', 'serif', 'deck'],
  },
];
