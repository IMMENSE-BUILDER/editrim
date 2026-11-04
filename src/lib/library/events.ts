import type { Template } from '../types';
import {
  T, S, IMG, IC, page, NONE, bgSolid, PHOTOS, FONTS,
} from '../templateKit';

/** Event, culture and audio templates. */

const MONO_PHOTO = { brightness: 92, contrast: 112, saturate: 0, blur: 0, grayscale: 100, sepia: 0, hue: 0 };
const WARM_PHOTO = { brightness: 103, contrast: 96, saturate: 64, blur: 0, grayscale: 0, sepia: 30, hue: 0 };

const SONIC_BLACK = '#0B0B0B';
const SONIC_CHROME = '#D7D9DD';
const SONIC_ORANGE = '#FF4D00';

const QUIET_BLUE = '#DCE7EF';
const QUIET_GRAPHITE = '#1E2328';
const QUIET_WHITE = '#FAF7F0';

const AFTER_BLACK = '#0B0B0B';
const AFTER_LIME = '#D8F55A';
const AFTER_WARM = '#FF7A45';
const AFTER_PAPER = '#F7F4EE';

const MARKET_PAPER = '#F1E6D0';
const MARKET_RED = '#D63B2F';
const MARKET_FOREST = '#2D4739';

const SONIC_ACTS = ['SABLE', 'KŌTA', 'MIRA VALE', 'DJ ORR', 'LUCENT', 'NIGHT BUS', 'VESSEL', '88 GHOST'];
const WAVE_BARS = [34, 58, 96, 42, 132, 74, 150, 54, 112, 88, 138, 46, 104, 66, 122];

/* ---------- 01. Festival poster — poster stack ---------- */
const sonicBloom = page('Poster', bgSolid(SONIC_BLACK), [
  T('DEAD AIR PRESENTS  /  FESTIVAL NO. 04', 56, 44, 700, 24, {
    fontFamily: FONTS.grotesk, fontSize: 12, fontWeight: 500, letterSpacing: 3.1,
    color: 'rgba(215,217,221,.7)', name: 'Kicker',
  }),
  T('12 SEPT 2026  ·  HAMBURG', 616, 44, 568, 24, {
    fontFamily: FONTS.grotesk, fontSize: 12, fontWeight: 500, letterSpacing: 3.1,
    color: 'rgba(215,217,221,.7)', align: 'right', name: 'Date top',
  }),
  S('line', 56, 88, 1128, 1, { fill: NONE, stroke: 'rgba(215,217,221,.26)', strokeWidth: 1, name: 'Top rule' }),

  IMG(PHOTOS.concert, 56, 112, 1128, 616, {
    filters: MONO_PHOTO, overlay: '#0B0B0B', overlayOpacity: 0.3, name: 'Crowd',
  }),

  T('SONIC', 48, 466, 1000, 240, {
    fontFamily: FONTS.black, fontSize: 232, fontWeight: 400, lineHeight: 0.86,
    letterSpacing: -7, color: '#F2F3F5', name: 'Sonic',
  }),
  T('BLOOM', 46, 690, 1160, 390, {
    fontFamily: FONTS.condensed, fontSize: 400, fontWeight: 400, lineHeight: 0.82,
    letterSpacing: -1, color: SONIC_ORANGE, name: 'Bloom',
  }),

  T('A ONE-DAY FESTIVAL OF LOUD MUSIC,\nLATE SETS AND NO QUIET CORNERS.', 56, 1112, 640, 64, {
    fontFamily: FONTS.grotesk, fontSize: 15, fontWeight: 400, lineHeight: 1.7, letterSpacing: 0.7,
    color: 'rgba(215,217,221,.68)', name: 'Standfirst',
  }),
  T('ONE STAGE  /  NINE ACTS\nDOORS 14:00  /  ALL DAY', 784, 1112, 400, 64, {
    fontFamily: FONTS.grotesk, fontSize: 15, fontWeight: 400, lineHeight: 1.7, letterSpacing: 0.9,
    color: 'rgba(215,217,221,.68)', align: 'right', name: 'Doors',
  }),

  S('line', 56, 1200, 1128, 1, { fill: NONE, stroke: 'rgba(215,217,221,.26)', strokeWidth: 1, name: 'Lineup rule' }),
  T('LINEUP', 56, 1216, 300, 24, {
    fontFamily: FONTS.grotesk, fontSize: 12, fontWeight: 600, letterSpacing: 3.4,
    color: SONIC_ORANGE, name: 'Lineup label',
  }),
  S('rect', 620, 1246, 1.5, 302, { fill: 'rgba(215,217,221,.24)', name: 'Grid divider' }),

  ...SONIC_ACTS.flatMap((act, i) => T(`${String(i + 1).padStart(2, '0')}   ${act}`, 56 + (i % 2) * 608, 1252 + Math.floor(i / 2) * 76, 500, 52, {
    fontFamily: FONTS.condensed, fontSize: 34, fontWeight: 400, lineHeight: 1.1, letterSpacing: 1.4,
    color: SONIC_CHROME, name: act,
  })),

  S('rect', 0, 1584, 1240, 170, { fill: SONIC_CHROME, name: 'Footer band' }),
  T('SAT 12 SEPT', 56, 1616, 460, 58, {
    fontFamily: FONTS.black, fontSize: 46, fontWeight: 400, lineHeight: 1, letterSpacing: -1.6,
    color: SONIC_BLACK, name: 'Date',
  }),
  T('THE FOUNDRY  ·  BALLINDASTRASSE 12\nHAMBURG  ·  DOORS 14:00', 640, 1608, 420, 62, {
    fontFamily: FONTS.grotesk, fontSize: 13, fontWeight: 500, lineHeight: 1.75, letterSpacing: 0.6,
    color: 'rgba(11,11,11,.8)', name: 'Venue',
  }),
  T('€24', 1080, 1614, 104, 50, {
    fontFamily: FONTS.condensed, fontSize: 46, fontWeight: 400, lineHeight: 1.05,
    color: SONIC_BLACK, align: 'right', name: 'Price',
  }),
  T('TICKETS AT THE DOOR  /  NO RE-ENTRY', 56, 1700, 800, 20, {
    fontFamily: FONTS.grotesk, fontSize: 10, fontWeight: 500, letterSpacing: 2.4,
    color: 'rgba(11,11,11,.6)', name: 'Small print',
  }),
]);

/* ---------- 02. Gallery invitation — quiet composition ---------- */
const quietHour = page('Invitation', bgSolid(QUIET_BLUE), [
  S('rect', 44, 44, 992, 992, { fill: NONE, stroke: 'rgba(30,35,40,.22)', strokeWidth: 1, name: 'Card rule' }),
  IC('eye', 88, 82, 17, QUIET_GRAPHITE, 1.4, { name: 'Private view' }),
  T('PRIVATE VIEW', 118, 84, 320, 20, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 600, letterSpacing: 3.2,
    color: QUIET_GRAPHITE, name: 'Eyebrow',
  }),
  T('NO. 07  —  2026', 748, 84, 236, 20, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 400, letterSpacing: 2.6,
    color: 'rgba(30,35,40,.6)', align: 'right', name: 'Number',
  }),

  S('ellipse', 566, 132, 340, 340, { fill: QUIET_WHITE, name: 'Artwork disc' }),
  S('rect', 806, 342, 200, 200, { fill: NONE, stroke: QUIET_GRAPHITE, strokeWidth: 1.4, name: 'Artwork frame' }),
  S('ring', 600, 470, 168, 168, { fill: NONE, stroke: QUIET_GRAPHITE, strokeWidth: 1.3, name: 'Artwork ring' }),
  S('line', 520, 676, 480, 1, { fill: NONE, stroke: 'rgba(30,35,40,.45)', strokeWidth: 1, name: 'Artwork line' }),
  S('ellipse', 886, 196, 15, 15, { fill: QUIET_GRAPHITE, name: 'Artwork dot' }),

  T('YOU ARE INVITED', 88, 736, 400, 20, {
    fontFamily: FONTS.inter, fontSize: 11, fontWeight: 600, letterSpacing: 3.4,
    color: 'rgba(30,35,40,.7)', name: 'Invite label',
  }),
  T('The Quiet Hour', 84, 762, 660, 110, {
    fontFamily: FONTS.serif, fontSize: 84, fontWeight: 400, lineHeight: 1, letterSpacing: -1.2,
    color: QUIET_GRAPHITE, name: 'Title',
  }),
  S('line', 88, 886, 120, 1, { fill: NONE, stroke: 'rgba(30,35,40,.5)', strokeWidth: 1, name: 'Title rule' }),
  T('An evening with the collection, lights low.\nNew paintings by Ines Arlo, and little else.', 88, 902, 620, 54, {
    fontFamily: FONTS.inter, fontSize: 15, fontWeight: 400, lineHeight: 1.65,
    color: 'rgba(30,35,40,.72)', name: 'Body',
  }),

  T('THURSDAY 12 MARCH', 88, 968, 232, 40, {
    fontFamily: FONTS.inter, fontSize: 10, fontWeight: 500, lineHeight: 1.7, letterSpacing: 1.8,
    color: 'rgba(30,35,40,.78)', name: 'Date',
  }),
  T('19:00 — 22:00', 320, 968, 200, 40, {
    fontFamily: FONTS.inter, fontSize: 10, fontWeight: 500, lineHeight: 1.7, letterSpacing: 1.8,
    color: 'rgba(30,35,40,.78)', name: 'Time',
  }),
  T('48 KANALSTRASSE\nHAMBURG', 600, 968, 380, 40, {
    fontFamily: FONTS.inter, fontSize: 10, fontWeight: 500, lineHeight: 1.7, letterSpacing: 1.8,
    color: 'rgba(30,35,40,.78)', name: 'Place',
  }),
  T('RSVP BY 05 MARCH   ·   STUDIO@GALLERYNORD.DE', 88, 1002, 700, 18, {
    fontFamily: FONTS.inter, fontSize: 9, fontWeight: 500, letterSpacing: 2.2,
    color: 'rgba(30,35,40,.55)', name: 'RSVP',
  }),
]);

/* ---------- 03. Podcast cover — cover art ---------- */
const afterHours = page('Cover', bgSolid(AFTER_BLACK), [
  S('ellipse', 64, 68, 12, 12, { fill: AFTER_LIME, name: 'Live dot' }),
  T('EP. 042', 88, 60, 300, 24, {
    fontFamily: FONTS.grotesk, fontSize: 12, fontWeight: 600, letterSpacing: 3,
    color: AFTER_LIME, name: 'Episode',
  }),
  S('rect', 846, 56, 138, 36, { fill: AFTER_WARM, radius: 18, name: 'On air pill' }),
  T('ON AIR', 846, 67, 138, 16, {
    fontFamily: FONTS.grotesk, fontSize: 10, fontWeight: 700, letterSpacing: 2.4,
    color: AFTER_BLACK, align: 'center', name: 'On air',
  }),

  T('AFTER', 56, 174, 900, 270, {
    fontFamily: FONTS.condensed, fontSize: 320, fontWeight: 400, lineHeight: 0.82,
    letterSpacing: 0, color: AFTER_PAPER, name: 'After',
  }),
  T('HOURS', 56, 420, 900, 270, {
    fontFamily: FONTS.condensed, fontSize: 320, fontWeight: 400, lineHeight: 0.82,
    letterSpacing: 0, color: AFTER_LIME, name: 'Hours',
  }),

  T('LATE-NIGHT CONVERSATIONS WITH PEOPLE\nWHO MAKE THINGS AND STAY UP LATE.', 64, 690, 620, 52, {
    fontFamily: FONTS.grotesk, fontSize: 14, fontWeight: 400, lineHeight: 1.7, letterSpacing: 1.3,
    color: 'rgba(247,244,238,.62)', name: 'Standfirst',
  }),

  ...WAVE_BARS.map((h, i) => S('rect', 64 + i * 60, 900 - h, 26, h, {
    fill: i === 7 || i === 12 ? AFTER_WARM : AFTER_LIME, name: `Wave ${i + 1}`,
  })),

  T('WITH MARA OKONKWO', 64, 940, 500, 22, {
    fontFamily: FONTS.grotesk, fontSize: 11, fontWeight: 500, letterSpacing: 2.6,
    color: 'rgba(247,244,238,.55)', name: 'Host',
  }),
  T('42 MIN', 836, 938, 100, 22, {
    fontFamily: FONTS.grotesk, fontSize: 12, fontWeight: 500, letterSpacing: 2.2,
    color: AFTER_LIME, align: 'right', name: 'Runtime',
  }),
]);

/* ---------- 04. Community market — handbill grid ---------- */
const MARKET_STALLS = [
  ['BRAMBLE & RYE', 'SOURDOUGH'],
  ['FERN & FLAME', 'CUT FLOWERS'],
  ['HOLLOW CLAY', 'STONEWARE'],
  ['ORCHARD PRESS', 'CIDER'],
  ['WILD THYME', 'PRESERVES'],
  ['LINEN & LOOM', 'TEXTILES'],
];

const makersMarket = page('Flyer', bgSolid(MARKET_PAPER), [
  T('COMMUNITY HALL  ·  SATURDAY 12 SEPTEMBER  ·  10AM — 4PM', 56, 54, 900, 24, {
    fontFamily: FONTS.grotesk, fontSize: 11, fontWeight: 600, letterSpacing: 2.6,
    color: MARKET_FOREST, name: 'Top line',
  }),
  S('line', 56, 88, 1128, 3, { fill: MARKET_FOREST, name: 'Masthead rule' }),

  T('MAKERS', 50, 118, 1160, 214, {
    fontFamily: FONTS.black, fontSize: 232, fontWeight: 400, lineHeight: 0.92,
    letterSpacing: -10, color: MARKET_FOREST, name: 'Makers',
  }),
  S('rect', 0, 348, 1240, 256, { fill: MARKET_RED, name: 'Red band' }),
  T('MARKET', 50, 366, 1160, 214, {
    fontFamily: FONTS.black, fontSize: 232, fontWeight: 400, lineHeight: 0.92,
    letterSpacing: -10, color: MARKET_PAPER, name: 'Market',
  }),

  T('A Saturday market of bread, blooms, ceramics,\npreserves and cider — made by hand and\nwithin walking distance.', 56, 626, 620, 120, {
    fontFamily: FONTS.serif, fontSize: 28, fontWeight: 400, lineHeight: 1.4,
    letterSpacing: 0, color: MARKET_FOREST, name: 'Intro',
  }),

  S('ellipse', 946, 618, 180, 180, { fill: NONE, stroke: MARKET_RED, strokeWidth: 2, rotation: -9, name: 'Stamp' }),
  T('FREE\nENTRY', 946, 668, 180, 80, {
    fontFamily: FONTS.condensed, fontSize: 30, fontWeight: 400, lineHeight: 1.05,
    letterSpacing: 2.4, color: MARKET_RED, align: 'center', rotation: -9, name: 'Stamp text',
  }),

  S('line', 56, 812, 1128, 1, { fill: NONE, stroke: 'rgba(45,71,57,.4)', strokeWidth: 1, name: 'Grid rule' }),
  S('rect', 640, 840, 1.5, 552, { fill: 'rgba(45,71,57,.38)', name: 'Column rule' }),

  ...MARKET_STALLS.map(([name, wares], i) => T(`${String(i + 1).padStart(2, '0')}   ${name}   ·   ${wares}`, 56, 856 + i * 92, 560, 40, {
    fontFamily: FONTS.condensed, fontSize: 32, fontWeight: 400, lineHeight: 1.05, letterSpacing: 1.1,
    color: MARKET_FOREST, name,
  })),

  IMG(PHOTOS.flowers, 700, 860, 460, 300, {
    filters: WARM_PHOTO, radius: 0, name: 'Flowers',
  }),
  T('GROWN AT HILL FARM, CUT FRIDAY', 700, 1174, 460, 20, {
    fontFamily: FONTS.grotesk, fontSize: 9, fontWeight: 500, letterSpacing: 2.2,
    color: 'rgba(45,71,57,.6)', name: 'Photo caption',
  }),
  T('OPEN 10AM — 4PM\nCOMMUNITY HALL, 12 MILL LANE\nDOGS AND BUGGIES WELCOME', 700, 1214, 460, 100, {
    fontFamily: FONTS.grotesk, fontSize: 13, fontWeight: 400, lineHeight: 1.85, letterSpacing: 0.5,
    color: 'rgba(45,71,57,.85)', name: 'Details',
  }),

  T('BRING A BAG.\nLEAVE WITH BREAD.', 56, 1400, 700, 110, {
    fontFamily: FONTS.black, fontSize: 40, fontWeight: 400, lineHeight: 1.12,
    letterSpacing: -1.4, color: MARKET_FOREST, name: 'Sign-off',
  }),

  S('rect', 0, 1520, 1240, 234, { fill: MARKET_FOREST, name: 'Footer band' }),
  S('line', 56, 1548, 1128, 1, { fill: NONE, stroke: 'rgba(241,230,208,.4)', strokeWidth: 1, dash: true, name: 'Tear line' }),
  T('SAT 12 SEPT\n10AM — 4PM', 56, 1578, 460, 130, {
    fontFamily: FONTS.condensed, fontSize: 60, fontWeight: 400, lineHeight: 1.02,
    letterSpacing: 1.6, color: MARKET_PAPER, name: 'Footer date',
  }),
  T('COMMUNITY HALL\n12 MILL LANE, E17\nFREE ENTRY  ·  ALL WELCOME', 700, 1584, 460, 80, {
    fontFamily: FONTS.grotesk, fontSize: 12, fontWeight: 400, lineHeight: 1.9, letterSpacing: 1.4,
    color: 'rgba(241,230,208,.8)', align: 'right', name: 'Footer address',
  }),
]);

export const EVENT_TEMPLATES: Template[] = [
  {
    id: 'ev-sonic-bloom',
    name: 'Sonic Bloom',
    category: 'Poster',
    description: 'A print festival poster: a full-bleed crowd shot, an oversized word stack and a tight lineup grid.',
    size: { name: 'Poster', width: 1240, height: 1754 },
    pages: [sonicBloom],
    tags: ['festival', 'poster', 'music', 'print', 'bold'],
  },
  {
    id: 'ev-quiet-hour',
    name: 'The Quiet Hour',
    category: 'Invitation',
    description: 'A gallery private-view invitation with a quiet shape composition and one serif line.',
    size: { name: 'Invitation', width: 1080, height: 1080 },
    pages: [quietHour],
    tags: ['invitation', 'gallery', 'minimal', 'serif', 'art'],
  },
  {
    id: 'ev-after-hours',
    name: 'After Hours',
    category: 'Podcast',
    description: 'Cover art for a late-night interview show — stacked condensed type, a shape-built waveform, one warm accent.',
    size: { name: 'Podcast Cover', width: 1000, height: 1000 },
    pages: [afterHours],
    tags: ['podcast', 'cover', 'audio', 'music', 'night'],
  },
  {
    id: 'ev-makers-market',
    name: 'Makers Market',
    category: 'Flyer',
    description: 'A letterpress-style community market handbill with a stall grid, stamp and tear-off footer.',
    size: { name: 'Flyer', width: 1240, height: 1754 },
    pages: [makersMarket],
    tags: ['market', 'flyer', 'community', 'print', 'grid'],
  },
];
