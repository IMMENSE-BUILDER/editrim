import type { El } from '../types';
import {
  FONTS, G, IC, IMG, NONE, P, PHOTOS, S, T,
  bgImage, bgSolid, page,
} from '../templateKit';
import {
  Palette, TemplateMeta, TypePair, barcode, dept, hairline, rgba, sizeFor, template,
} from './kitShared';

/* ------------------------------------------------------------------ */
/* Posters                                                             */
/* ------------------------------------------------------------------ */

export type PosterVariant = 'photo' | 'type' | 'split' | 'riso' | 'ticket' | 'grid';

export type PosterSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: PosterVariant;
  image?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  body?: string;
  meta?: string;
  date?: string;
  venue?: string;
  lineup?: string[];
  price?: string;
  footer?: string;
  cta?: string;
};

const POSTER = { name: 'Poster', width: 1240, height: 1754 };

export function poster(spec: PosterSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'photo') {
    const background = bgImage(spec.image ?? PHOTOS.concert, p.deep ?? p.ink, 0.42);
    elements.push(
      S('rect', 0, 0, 1240, 620, { fill: G(rgba(p.ink, 0.86), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 1120, 1240, 634, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.94), 0), name: 'Bottom shade' }),
      dept(spec.kicker ?? 'LIVE  /  ONE NIGHT ONLY', 72, 60, 700, p.bg, 12),
      dept(spec.meta ?? '2026', 900, 60, 268, rgba(p.bg, 0.6), 10, 'right'),
      hairline(72, 110, 1096, rgba(p.bg, 0.3), 1),
      T(spec.title, 64, 300, 1112, 620, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 170, 96, 10), lineHeight: 0.86,
        letterSpacing: -6, color: p.bg, fontWeight: 700, uppercase: true,
      }),
      T(spec.subtitle ?? '', 72, 1140, 760, 150, {
        fontFamily: f.accent ?? f.body, fontSize: 44, lineHeight: 1.2, color: p.bg,
      }),
      S('rect', 72, 1320, 1096, 170, { fill: p.accent, name: 'Info band' }),
      T(spec.date ?? '14 OCT 2026', 96, 1348, 300, 80, {
        fontFamily: f.display, fontSize: 36, lineHeight: 1.1, color: p.deep ?? p.ink, fontWeight: 700,
      }),
      T(spec.venue ?? 'THE FOUNDRY, LONDON', 420, 1350, 500, 32, {
        fontFamily: f.body, fontSize: 15, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.7), uppercase: true,
      }),
      T(spec.price ?? 'FROM \u20ac18', 900, 1350, 240, 72, {
        fontFamily: f.display, fontSize: 34, color: p.deep ?? p.ink, align: 'right',
      }),
      ...(spec.lineup ?? []).slice(0, 3).map((line, i) =>
        T(line, 72, 1510 + i * 34, 600, 28, {
          fontFamily: f.body, fontSize: 13, letterSpacing: 1.8, color: rgba(p.bg, 0.66), uppercase: true,
        }),
      ),
      hairline(72, 1640, 1096, rgba(p.bg, 0.28), 1),
      dept(spec.footer ?? 'DOORS 8PM  /  LATE BAR', 72, 1668, 700, rgba(p.bg, 0.5), 9),
      dept(spec.cta ?? 'TICKETS  \u2192', 900, 1668, 268, p.accent, 9, 'right'),
    );
    return template(spec, POSTER, [page('Poster', background, elements)]);
  }

  if (spec.variant === 'type') {
    const background = bgSolid(p.bg);
    elements.push(
      dept(spec.kicker ?? 'A NEW PLAY', 64, 56, 700, rgba(p.ink, 0.6), 12),
      dept(spec.meta ?? 'SEASON 04', 900, 56, 268, rgba(p.ink, 0.44), 9, 'right'),
      hairline(64, 104, 1112, rgba(p.ink, 0.28), 2),
      T(spec.title, 56, 140, 1128, 760, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 200, 108, 8), lineHeight: 0.82,
        letterSpacing: -7, color: p.ink, fontWeight: 700, uppercase: true,
      }),
      S('ellipse', 64, 900, 200, 200, { fill: p.accent, name: 'Accent orb' }),
      T('04', 64, 952, 200, 90, { fontFamily: f.display, fontSize: 74, color: p.deep ?? p.ink, align: 'center' }),
      IMG(spec.image ?? PHOTOS.gallery, 820, 820, 356, 356, { name: 'Production image', radius: 2 }),
      T(spec.subtitle ?? '', 64, 1140, 700, 130, {
        fontFamily: f.accent ?? f.body, fontSize: 38, lineHeight: 1.25, color: rgba(p.ink, 0.76),
      }),
      hairline(64, 1300, 1112, rgba(p.ink, 0.24), 1),
      T('DATE', 64, 1330, 200, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.date ?? '14 OCT \u2013 02 NOV', 64, 1360, 340, 60, { fontFamily: f.body, fontSize: 20, color: p.ink }),
      T('VENUE', 460, 1330, 200, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.venue ?? 'THE FOUNDRY, LONDON', 460, 1360, 380, 60, { fontFamily: f.body, fontSize: 20, color: p.ink }),
      T('PRICE', 900, 1330, 200, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.price ?? 'FROM \u20ac18', 900, 1360, 268, 60, { fontFamily: f.body, fontSize: 20, color: p.ink, align: 'right' }),
      T(spec.body ?? '', 64, 1460, 760, 90, {
        fontFamily: f.body, fontSize: 17, lineHeight: 1.55, color: rgba(p.ink, 0.6),
      }),
      hairline(64, 1620, 1112, rgba(p.ink, 0.2), 1),
      dept(spec.footer ?? 'BOOKING NOW  /  THEFOUNDRY.CO', 64, 1648, 700, rgba(p.ink, 0.4), 9),
      dept(spec.cta ?? 'BOOK TICKETS  \u2192', 900, 1648, 268, p.accent, 9, 'right'),
    );
    return template(spec, POSTER, [page('Poster', background, elements)]);
  }

  if (spec.variant === 'split') {
    const background = bgSolid(p.bg);
    elements.push(
      IMG(spec.image ?? PHOTOS.gallery2, 0, 0, 1240, 940, {
        name: 'Top image', filters: { brightness: 98, contrast: 108, saturate: 84, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
      }),
      S('rect', 0, 0, 1240, 240, { fill: G(rgba(p.ink, 0.6), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 940, 1240, 814, { fill: p.ink, name: 'Bottom field' }),
      dept(spec.kicker ?? 'EXHIBITION  /  03', 72, 60, 700, p.bg, 12),
      dept(spec.meta ?? 'FREE ENTRY', 900, 60, 268, rgba(p.bg, 0.56), 9, 'right'),
      T(spec.title, 72, 980, 1096, 300, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 96, 58, 13), lineHeight: 0.96,
        letterSpacing: -3, color: p.bg, fontWeight: 700,
      }),
      T(spec.subtitle ?? '', 72, 1290, 640, 100, {
        fontFamily: f.accent ?? f.body, fontSize: 28, lineHeight: 1.35, color: rgba(p.bg, 0.7),
      }),
      hairline(72, 1420, 1096, rgba(p.bg, 0.24), 1),
      T(spec.date ?? '14 OCT \u2013 02 NOV', 72, 1450, 300, 28, { fontFamily: f.body, fontSize: 13, letterSpacing: 1.8, color: rgba(p.bg, 0.6) }),
      T(spec.venue ?? 'KUNSTHALLE, LONDON', 420, 1450, 400, 28, { fontFamily: f.body, fontSize: 13, letterSpacing: 1.8, color: rgba(p.bg, 0.6) }),
      T(spec.price ?? 'FREE', 920, 1450, 248, 28, { fontFamily: f.body, fontSize: 13, letterSpacing: 1.8, color: p.accent, align: 'right' }),
      T(spec.body ?? '', 72, 1510, 700, 90, { fontFamily: f.body, fontSize: 16, lineHeight: 1.55, color: rgba(p.bg, 0.55) }),
      S('rect', 900, 1540, 268, 58, { fill: p.accent, radius: 29, name: 'CTA' }),
      T(spec.cta ?? 'PLAN A VISIT', 900, 1558, 268, 22, { fontFamily: f.body, fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: p.deep ?? p.ink, align: 'center' }),
      dept(spec.footer ?? 'OPEN WED\u2013SUN  /  10\u20136', 72, 1668, 700, rgba(p.bg, 0.4), 9),
    );
    return template(spec, POSTER, [page('Poster', background, elements)]);
  }

  if (spec.variant === 'riso') {
    const background = bgSolid(p.accent);
    elements.push(
      S('rect', 64, 64, 1112, 1626, { fill: NONE, stroke: rgba(p.deep ?? p.ink, 0.28), strokeWidth: 2, name: 'Frame' }),
      dept(spec.kicker ?? 'RISO  /  TWO INKS', 96, 94, 700, rgba(p.deep ?? p.ink, 0.66), 11),
      dept(spec.meta ?? 'EDITION 120', 900, 94, 240, rgba(p.deep ?? p.ink, 0.5), 9, 'right'),
      T(spec.title, 88, 160, 1060, 620, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 170, 96, 8), lineHeight: 0.84,
        letterSpacing: -6, color: p.ink, fontWeight: 700, uppercase: true,
      }),
      T(spec.title, 94, 166, 1060, 620, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 170, 96, 8), lineHeight: 0.84,
        letterSpacing: -6, color: p.bg, fontWeight: 700, uppercase: true, opacity: 0.18,
      }),
      S('ellipse', 870, 760, 280, 280, { fill: p.bg, name: 'Orb' }),
      T('\u2736', 870, 810, 280, 140, { fontFamily: f.display, fontSize: 100, color: p.ink, align: 'center' }),
      T(spec.subtitle ?? '', 96, 930, 700, 120, {
        fontFamily: f.accent ?? f.body, fontSize: 36, lineHeight: 1.25, color: p.ink,
      }),
      hairline(96, 1080, 1048, rgba(p.ink, 0.4), 2),
      T('DATE', 96, 1110, 200, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.5) }),
      T(spec.date ?? '14 OCT 2026', 96, 1138, 300, 40, { fontFamily: f.body, fontSize: 18, color: p.ink }),
      T('VENUE', 430, 1110, 200, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.5) }),
      T(spec.venue ?? 'THE FOUNDRY', 430, 1138, 300, 40, { fontFamily: f.body, fontSize: 18, color: p.ink }),
      T('TICKETS', 764, 1110, 200, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.5) }),
      T(spec.price ?? '\u20ac18', 764, 1138, 380, 40, { fontFamily: f.body, fontSize: 18, color: p.ink, align: 'right' }),
      T(spec.body ?? '', 96, 1220, 760, 110, { fontFamily: f.body, fontSize: 17, lineHeight: 1.55, color: rgba(p.ink, 0.7) }),
      S('rect', 96, 1420, 1048, 2, { fill: p.ink, name: 'Bottom rule' }),
      dept(spec.footer ?? 'PRINTED IN TWO INKS  /  LONDON', 96, 1450, 700, rgba(p.ink, 0.5), 9),
      dept(spec.cta ?? 'SEE THE EDITION  \u2192', 900, 1450, 240, p.ink, 9, 'right'),
      T('120', 96, 1540, 300, 100, { fontFamily: f.display, fontSize: 88, color: p.ink, opacity: 0.24 }),
    );
    return template(spec, POSTER, [page('Poster', background, elements)]);
  }

  if (spec.variant === 'ticket') {
    const background = bgSolid(p.bg);
    elements.push(
      S('rect', 56, 56, 1128, 1642, { fill: NONE, stroke: rgba(p.ink, 0.24), strokeWidth: 1, name: 'Ticket frame' }),
      dept(spec.kicker ?? 'ADMIT ONE  /  SEASON 04', 96, 96, 700, rgba(p.ink, 0.6), 11),
      dept(spec.meta ?? 'NO. 00412', 900, 96, 220, rgba(p.ink, 0.46), 9, 'right'),
      T(spec.title, 96, 180, 1048, 370, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 110, 70, 12), lineHeight: 0.94,
        letterSpacing: -3, color: p.ink, fontWeight: 700,
      }),
      T(spec.subtitle ?? '', 96, 550, 700, 100, {
        fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.35, color: rgba(p.ink, 0.7),
      }),
      hairline(96, 720, 1048, rgba(p.ink, 0.4), 2),
      T('DATE', 96, 760, 200, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.5) }),
      T(spec.date ?? '14 OCT 2026', 96, 790, 300, 40, { fontFamily: f.body, fontSize: 19, color: p.ink }),
      T('VENUE', 430, 760, 200, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.5) }),
      T(spec.venue ?? 'THE FOUNDRY, LONDON', 430, 790, 360, 40, { fontFamily: f.body, fontSize: 19, color: p.ink }),
      T('PRICE', 900, 760, 200, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.5) }),
      T(spec.price ?? '\u20ac18', 860, 790, 284, 80, { fontFamily: f.display, fontSize: 44, color: p.accent, align: 'right' }),
      hairline(96, 940, 1048, rgba(p.ink, 0.4), 2, ),
      T('DOORS 8PM', 96, 980, 300, 26, { fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: rgba(p.ink, 0.56) }),
      T('LATE BAR UNTIL 1AM', 96, 1012, 400, 26, { fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: rgba(p.ink, 0.56) }),
      ...barcode(620, 1000, 520, 100, p.ink, 26),
      T('SCAN AT THE DOOR', 620, 1120, 520, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 1.8, color: rgba(p.ink, 0.4), align: 'right' }),
      T(spec.body ?? '', 96, 1200, 700, 100, { fontFamily: f.body, fontSize: 16, lineHeight: 1.55, color: rgba(p.ink, 0.6) }),
      S('rect', 96, 1440, 1048, 2, { fill: p.ink, name: 'Bottom rule' }),
      dept(spec.footer ?? 'NON-TRANSFERABLE  /  ONE PER GUEST', 96, 1470, 800, rgba(p.ink, 0.4), 9),
      dept(spec.cta ?? 'BOOK A TABLE  \u2192', 900, 1470, 240, p.accent, 9, 'right'),
      T('FOUNDRY', 96, 1620, 300, 40, { fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: rgba(p.ink, 0.3) }),
    );
    return template(spec, POSTER, [page('Poster', background, elements)]);
  }

  const background = bgSolid(p.bg);
  elements.push(
    dept(spec.kicker ?? 'THE PROGRAMME', 72, 56, 700, p.ink, 11),
    dept(spec.meta ?? 'AUTUMN 2026', 900, 56, 268, rgba(p.ink, 0.44), 9, 'right'),
    hairline(72, 104, 1096, rgba(p.ink, 0.32), 2),
    IMG(spec.image ?? PHOTOS.architecture3, 72, 150, 650, 700, { name: 'Lead image' }),
    T(spec.title, 760, 150, 408, 400, {
      fontFamily: f.display, fontSize: sizeFor(spec.title, 80, 46, 10), lineHeight: 1.0,
      letterSpacing: -1.8, color: p.ink, fontWeight: 700,
    }),
    T(spec.body ?? '', 760, 580, 408, 240, {
      fontFamily: f.body, fontSize: 17, lineHeight: 1.6, color: rgba(p.ink, 0.66),
    }),
    hairline(72, 900, 1096, rgba(p.ink, 0.24), 1),
    T('01', 72, 940, 60, 30, { fontFamily: f.body, fontSize: 11, color: p.accent }),
    T('12 OCT  /  OPENING NIGHT', 150, 938, 500, 34, { fontFamily: f.body, fontSize: 16, color: p.ink }),
    T('18:00', 900, 938, 268, 34, { fontFamily: f.body, fontSize: 16, color: rgba(p.ink, 0.52), align: 'right' }),
    T('02', 72, 1010, 60, 30, { fontFamily: f.body, fontSize: 11, color: p.accent }),
    T('19 OCT  /  ARTIST WALKTHROUGH', 150, 1008, 600, 34, { fontFamily: f.body, fontSize: 16, color: p.ink }),
    T('11:00', 900, 1008, 268, 34, { fontFamily: f.body, fontSize: 16, color: rgba(p.ink, 0.52), align: 'right' }),
    T('03', 72, 1080, 60, 30, { fontFamily: f.body, fontSize: 11, color: p.accent }),
    T('26 OCT  /  LATE', 150, 1078, 500, 34, { fontFamily: f.body, fontSize: 16, color: p.ink }),
    T('20:00', 900, 1078, 268, 34, { fontFamily: f.body, fontSize: 16, color: rgba(p.ink, 0.52), align: 'right' }),
    hairline(72, 1160, 1096, rgba(p.ink, 0.24), 1),
    T(spec.subtitle ?? '', 72, 1200, 700, 120, {
      fontFamily: f.accent ?? f.body, fontSize: 32, lineHeight: 1.3, color: rgba(p.ink, 0.7),
    }),
    T(spec.date ?? '14 OCT \u2013 02 NOV', 72, 1380, 300, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 2, color: rgba(p.ink, 0.52) }),
    T(spec.venue ?? 'KUNSTHALLE, LONDON', 430, 1380, 400, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 2, color: rgba(p.ink, 0.52) }),
    T(spec.price ?? 'FREE', 920, 1380, 248, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 2, color: p.accent, align: 'right' }),
    hairline(72, 1460, 1096, rgba(p.ink, 0.2), 1),
    dept(spec.footer ?? 'KUNSTHALLE  /  DAILY 10\u20136', 72, 1490, 700, rgba(p.ink, 0.4), 9),
    dept(spec.cta ?? 'PLAN A VISIT  \u2192', 900, 1490, 268, p.accent, 9, 'right'),
  );
  return template(spec, POSTER, [page('Poster', background, elements)]);
}

/* ------------------------------------------------------------------ */
/* Flyers                                                              */
/* ------------------------------------------------------------------ */

export type FlyerVariant = 'photo' | 'info' | 'type' | 'workshop' | 'market';

export type FlyerSpec = Omit<PosterSpec, 'variant'> & {
  variant: FlyerVariant;
  schedule?: string[];
  address?: string;
  contact?: string;
  learn?: string[];
};

export function flyer(spec: FlyerSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];
  const base = { ...spec, variant: 'type' as PosterVariant };

  if (spec.variant === 'photo') {
    const background = bgImage(spec.image ?? PHOTOS.yoga, p.deep ?? p.ink, 0.4);
    elements.push(
      S('rect', 0, 0, 1240, 500, { fill: G(rgba(p.ink, 0.84), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 940, 1240, 814, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.94), 0), name: 'Bottom shade' }),
      dept(spec.kicker ?? 'A MORNING TO SLOW DOWN', 72, 60, 700, p.bg, 12),
      dept(spec.meta ?? 'SATURDAY  /  08:00', 900, 60, 268, rgba(p.bg, 0.56), 9, 'right'),
      hairline(72, 108, 1096, rgba(p.bg, 0.28), 1),
      T(spec.title, 64, 300, 1112, 520, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 140, 84, 11), lineHeight: 0.9,
        letterSpacing: -4, color: p.bg, fontWeight: 700, uppercase: true,
      }),
      T(spec.subtitle ?? '', 72, 1000, 700, 100, { fontFamily: f.accent ?? f.body, fontSize: 34, lineHeight: 1.3, color: p.bg }),
      ...(spec.schedule ?? []).slice(0, 4).map((line, i) =>
        T(line, 72, 1130 + i * 36, 640, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 1.4, color: rgba(p.bg, 0.7) }),
      ),
      S('rect', 800, 1120, 368, 180, { fill: p.accent, name: 'Details panel' }),
      T(spec.address ?? 'THE STABLES, LONDON', 824, 1148, 320, 50, { fontFamily: f.body, fontSize: 14, lineHeight: 1.4, color: p.deep ?? p.ink }),
      T(spec.contact ?? 'HELLO@THE-STABLES.CO', 824, 1210, 320, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 1.2, color: rgba(p.deep ?? p.ink, 0.66) }),
      T(spec.price ?? '\u00a318', 824, 1248, 320, 36, { fontFamily: f.display, fontSize: 30, color: p.deep ?? p.ink }),
      hairline(72, 1400, 1096, rgba(p.bg, 0.24), 1),
      dept(spec.footer ?? 'BRING A MAT  /  TEA AFTER', 72, 1430, 700, rgba(p.bg, 0.48), 9),
      dept(spec.cta ?? 'RESERVE A SPOT  \u2192', 900, 1430, 268, p.accent, 9, 'right'),
    );
    return template(spec, { name: 'Flyer', width: 1240, height: 1754 }, [page('Flyer', background, elements)]);
  }

  if (spec.variant === 'info') {
    const background = bgSolid(p.bg);
    elements.push(
      dept(spec.kicker ?? 'A PRACTICAL GUIDE', 64, 56, 700, rgba(p.ink, 0.56), 11),
      dept(spec.meta ?? 'AUTUMN 2026', 900, 56, 268, rgba(p.ink, 0.42), 9, 'right'),
      hairline(64, 104, 1112, rgba(p.ink, 0.28), 2),
      T(spec.title, 56, 150, 900, 440, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 118, 72, 11), lineHeight: 0.92,
        letterSpacing: -4, color: p.ink, fontWeight: 700, uppercase: true,
      }),
      IMG(spec.image ?? PHOTOS.craft, 820, 180, 356, 320, { name: 'Workshop image' }),
      T(spec.subtitle ?? '', 64, 620, 700, 100, { fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.35, color: rgba(p.ink, 0.7) }),
      ...(spec.schedule ?? []).slice(0, 4).map((line, i) =>
        T(line, 64, 780 + i * 44, 600, 34, { fontFamily: f.body, fontSize: 15, letterSpacing: 1.2, color: rgba(p.ink, 0.64) }),
      ),
      S('rect', 64, 990, 500, 2, { fill: p.ink, name: 'Rule' }),
      T('WHAT YOU LEARN', 64, 1020, 400, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      ...(spec.learn ?? []).slice(0, 4).map((line, i) =>
        T(line, 64, 1056 + i * 32, 600, 28, { fontFamily: f.body, fontSize: 14, color: rgba(p.ink, 0.7) }),
      ),
      T('ADDRESS', 760, 990, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.address ?? 'THE STABLES, LONDON', 760, 1020, 416, 60, { fontFamily: f.body, fontSize: 15, lineHeight: 1.4, color: p.ink }),
      T('CONTACT', 760, 1100, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.contact ?? 'HELLO@THE-STABLES.CO', 760, 1130, 416, 28, { fontFamily: f.body, fontSize: 13, color: p.ink }),
      T('PRICE', 760, 1190, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.price ?? '\u00a318', 760, 1220, 416, 50, { fontFamily: f.display, fontSize: 40, color: p.accent }),
      S('rect', 760, 1300, 300, 56, { fill: p.ink, radius: 28, name: 'CTA' }),
      T(spec.cta ?? 'BOOK A PLACE', 760, 1318, 300, 22, { fontFamily: f.body, fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: p.bg, align: 'center' }),
      hairline(64, 1450, 1112, rgba(p.ink, 0.2), 1),
      dept(spec.footer ?? 'SMALL GROUPS  /  ALL MATERIALS INCLUDED', 64, 1480, 900, rgba(p.ink, 0.4), 9),
    );
    return template(spec, { name: 'Flyer', width: 1240, height: 1754 }, [page('Flyer', background, elements)]);
  }

  if (spec.variant === 'workshop') {
    const background = bgSolid(p.accent);
    elements.push(
      S('rect', 48, 48, 1144, 1658, { fill: NONE, stroke: rgba(p.deep ?? p.ink, 0.26), strokeWidth: 1, name: 'Frame' }),
      dept(spec.kicker ?? 'A DAY IN THE STUDIO', 84, 84, 700, rgba(p.deep ?? p.ink, 0.6), 11),
      dept(spec.meta ?? 'LIMITED TO 12', 900, 84, 240, rgba(p.deep ?? p.ink, 0.46), 9, 'right'),
      T(spec.title, 76, 150, 1080, 540, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 140, 80, 10), lineHeight: 0.9,
        letterSpacing: -5, color: p.deep ?? p.ink, fontWeight: 700, uppercase: true,
      }),
      IMG(spec.image ?? PHOTOS.craft, 76, 720, 480, 360, { name: 'Workshop image' }),
      T(spec.subtitle ?? '', 596, 730, 540, 130, { fontFamily: f.accent ?? f.body, fontSize: 34, lineHeight: 1.3, color: p.deep ?? p.ink }),
      T(spec.body ?? '', 596, 870, 540, 160, { fontFamily: f.body, fontSize: 17, lineHeight: 1.6, color: rgba(p.deep ?? p.ink, 0.7) }),
      hairline(76, 1140, 1080, rgba(p.deep ?? p.ink, 0.3), 2),
      ...(spec.schedule ?? []).slice(0, 4).map((line, i) =>
        T(line, 76, 1180 + i * 40, 600, 30, { fontFamily: f.body, fontSize: 14, letterSpacing: 1.3, color: rgba(p.deep ?? p.ink, 0.7) }),
      ),
      T(spec.address ?? 'THE STABLES, LONDON', 760, 1180, 396, 40, { fontFamily: f.body, fontSize: 15, color: p.deep ?? p.ink }),
      T(spec.contact ?? 'HELLO@THE-STABLES.CO', 760, 1230, 396, 30, { fontFamily: f.body, fontSize: 12, color: rgba(p.deep ?? p.ink, 0.6) }),
      T(spec.price ?? '\u00a318', 760, 1300, 396, 90, { fontFamily: f.display, fontSize: 72, color: p.deep ?? p.ink }),
      S('rect', 76, 1460, 1080, 70, { fill: p.deep ?? p.ink, radius: 35, name: 'CTA' }),
      T(spec.cta ?? 'RESERVE YOUR PLACE  \u2192', 76, 1484, 1080, 26, { fontFamily: f.body, fontSize: 12, fontWeight: 700, letterSpacing: 2.4, color: p.bg, align: 'center' }),
      dept(spec.footer ?? 'ALL MATERIALS  /  LUNCH INCLUDED', 76, 1620, 700, rgba(p.deep ?? p.ink, 0.5), 9),
      dept(spec.meta ?? 'BOOK BY 01 OCT', 900, 1620, 256, rgba(p.deep ?? p.ink, 0.5), 9, 'right'),
    );
    return template(spec, { name: 'Flyer', width: 1240, height: 1754 }, [page('Flyer', background, elements)]);
  }

  if (spec.variant === 'market') {
    const background = bgSolid(p.bg);
    elements.push(
      S('rect', 56, 56, 1128, 1642, { fill: NONE, stroke: rgba(p.ink, 0.24), strokeWidth: 1, name: 'Frame' }),
      dept(spec.kicker ?? 'A WEEKEND MARKET', 96, 96, 700, p.ink, 11),
      dept(spec.meta ?? 'FREE ENTRY', 900, 96, 220, rgba(p.ink, 0.44), 9, 'right'),
      T(spec.title, 88, 160, 1060, 420, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 132, 76, 10), lineHeight: 0.92,
        letterSpacing: -4, color: p.ink, fontWeight: 700, uppercase: true,
      }),
      IMG(spec.image ?? PHOTOS.flowers, 88, 620, 520, 360, { name: 'Market image' }),
      T(spec.subtitle ?? '', 648, 630, 480, 120, { fontFamily: f.accent ?? f.body, fontSize: 32, lineHeight: 1.3, color: rgba(p.ink, 0.7) }),
      ...(spec.schedule ?? []).slice(0, 4).map((line, i) =>
        T(line, 648, 780 + i * 36, 480, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 1.2, color: rgba(p.ink, 0.62) }),
      ),
      hairline(88, 1040, 1064, rgba(p.ink, 0.28), 2),
      T('STALLHOLDERS', 88, 1080, 400, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      ...(spec.lineup ?? []).slice(0, 6).map((line, i) =>
        T(line, 88 + (i % 2) * 540, 1120 + Math.floor(i / 2) * 44, 480, 30, {
          fontFamily: f.body, fontSize: 14, letterSpacing: 1, color: rgba(p.ink, 0.68),
        }),
      ),
      T('ADDRESS', 88, 1320, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.address ?? 'THE STABLES, LONDON', 88, 1350, 500, 40, { fontFamily: f.body, fontSize: 16, color: p.ink }),
      T(spec.contact ?? 'HELLO@THE-STABLES.CO', 648, 1350, 480, 30, { fontFamily: f.body, fontSize: 12, color: rgba(p.ink, 0.58) }),
      T(spec.price ?? 'SAT + SUN', 900, 1430, 220, 40, { fontFamily: f.body, fontSize: 13, letterSpacing: 2, color: p.accent, align: 'right' }),
      S('rect', 88, 1520, 1064, 2, { fill: p.ink, name: 'Bottom rule' }),
      dept(spec.footer ?? 'BRING A TOTE  /  STAY A WHILE', 88, 1550, 700, rgba(p.ink, 0.4), 9),
      dept(spec.cta ?? 'SEE THE LINE-UP  \u2192', 900, 1550, 240, p.accent, 9, 'right'),
    );
    return template(spec, { name: 'Flyer', width: 1240, height: 1754 }, [page('Flyer', background, elements)]);
  }

  return poster(base);
}

/* ------------------------------------------------------------------ */
/* Menus                                                               */
/* ------------------------------------------------------------------ */

export type MenuItem = { name: string; description?: string; price: string };
export type MenuSection = { title: string; items: MenuItem[] };

export type MenuVariant = 'classic' | 'modern' | 'dark' | 'bistro' | 'tasting' | 'ramen' | 'dessert' | 'wine';

export type MenuSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: MenuVariant;
  image?: string;
  venue: string;
  title: string;
  subtitle?: string;
  meta?: string;
  sections: MenuSection[];
  footer?: string;
  twoPages?: boolean;
};

const MENU = { name: 'Menu', width: 1240, height: 1754 };

function menuHeader(spec: MenuSpec, pageNo: number, totalPages: number, color: string, accent: string) {
  const f = spec.fonts;
  return [
    dept(spec.meta ?? 'KITCHEN  /  BAR', 72, 56, 700, color, 10),
    dept(`${pageNo} / ${totalPages}`, 900, 56, 268, accent, 9, 'right'),
    hairline(72, 104, 1096, rgba(color, 0.28), 1),
  ];
}

function menuFooter(spec: MenuSpec, color: string, accent: string) {
  return [
    hairline(72, 1640, 1096, rgba(color, 0.2), 1),
    dept(spec.footer ?? 'PLEASE TELL US ABOUT ALLERGIES', 72, 1668, 760, rgba(color, 0.5), 8),
    dept(spec.venue, 900, 1668, 268, accent, 8, 'right'),
  ];
}

function menuSections(
  sections: MenuSection[],
  spec: MenuSpec,
  startY: number,
  opts: { x: number; w: number; nameSize: number; color: string; accent: string; descColor: string; rowGap: number; descSize: number },
): El[] {
  const f = spec.fonts;
  const out: El[] = [];
  let y = startY;
  for (const section of sections) {
    out.push(
      T(section.title, opts.x, y, opts.w, 30, {
        fontFamily: f.body, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: opts.accent, uppercase: true,
      }),
      hairline(opts.x, y + 36, opts.w, rgba(opts.color, 0.28), 1),
    );
    y += 58;
    for (const item of section.items) {
      out.push(
        T(item.name, opts.x, y, opts.w - 130, 30, {
          fontFamily: f.body, fontSize: opts.nameSize, fontWeight: 600, color: opts.color,
        }),
        T(item.price, opts.x + opts.w - 120, y, 120, 30, {
          fontFamily: f.body, fontSize: Math.max(12, opts.nameSize - 4), color: opts.color, align: 'right',
        }),
      );
      y += 30;
      if (item.description) {
        out.push(T(item.description, opts.x, y, opts.w - 130, 26, {
          fontFamily: f.body, fontSize: opts.descSize, lineHeight: 1.4, color: opts.descColor,
        }));
        y += 26;
      }
      y += opts.rowGap;
    }
    y += 18;
  }
  return out;
}

function splitMenuSections(sections: MenuSection[], twoPages: boolean): MenuSection[][] {
  if (!twoPages || sections.length < 2) return [sections];
  const totalItems = sections.reduce((n, s) => n + s.items.length, 0);
  if (totalItems < 12) return [sections];
  const half = Math.ceil(sections.length / 2);
  return [sections.slice(0, half), sections.slice(half)];
}

/** Split a menu group into two balanced columns without losing a section. */
function splitMenuColumns(sections: MenuSection[]): [MenuSection[], MenuSection[]] {
  const total = sections.reduce((n, section) => n + section.items.length, 0);
  const half = Math.ceil(total / 2);
  const left: MenuSection[] = [];
  const right: MenuSection[] = [];
  let remaining = half;
  for (const section of sections) {
    const take = Math.min(remaining, section.items.length);
    if (take > 0) left.push({ ...section, items: section.items.slice(0, take) });
    if (section.items.length - take > 0) right.push({ ...section, items: section.items.slice(take) });
    remaining -= take;
  }
  return [left, right];
}

export function menu(spec: MenuSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const groups = splitMenuSections(spec.sections, spec.twoPages ?? true);
  const pages = groups.map((group, index) => {
    const elements: El[] = [];
    const pageNo = index + 1;
    const total = groups.length;
    const [leftGroup, rightGroup] = splitMenuColumns(group);

    if (spec.variant === 'classic') {
      elements.push(...menuHeader(spec, pageNo, total, p.ink, p.accent));
      elements.push(
        T(spec.venue, 540, 130, 700, 28, {
          fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: rgba(p.ink, 0.52), align: 'center', uppercase: true,
        }),
        T(spec.title, 140, 170, 960, 200, {
          fontFamily: f.display, fontSize: 86, lineHeight: 1.0, letterSpacing: -1.6, color: p.ink, align: 'center',
        }),
        T(spec.subtitle ?? '', 260, 330, 720, 60, {
          fontFamily: f.accent ?? f.body, fontSize: 22, lineHeight: 1.4, color: rgba(p.ink, 0.6), align: 'center',
        }),
        S('ellipse', 580, 410, 80, 80, { fill: p.accent, name: 'Ornament' }),
        T('S', 580, 430, 80, 32, { fontFamily: f.display, fontSize: 26, color: p.deep ?? p.ink, align: 'center' }),
        ...menuSections(group, spec, 520, {
          x: 180, w: 880, nameSize: 22, color: p.ink, accent: p.accent,
          descColor: rgba(p.ink, 0.54), rowGap: 18, descSize: 13,
        }),
        ...menuFooter(spec, p.ink, p.accent),
      );
      return page(`Menu ${pageNo}`, bgSolid(p.bg), elements);
    }

    if (spec.variant === 'modern') {
      elements.push(...menuHeader(spec, pageNo, total, p.ink, p.accent));
      elements.push(
        IMG(spec.image ?? PHOTOS.restaurantInterior, 0, 120, 1240, 360, { name: 'Interior band' }),
        S('rect', 0, 120, 1240, 360, { fill: rgba(p.ink, 0.28), name: 'Image wash' }),
        T(spec.venue, 72, 180, 700, 40, { fontFamily: f.body, fontSize: 15, letterSpacing: 4, color: p.bg, uppercase: true }),
        T(spec.title, 72, 240, 1000, 160, {
          fontFamily: f.display, fontSize: 80, lineHeight: 0.94, letterSpacing: -3, color: p.bg,
        }),
        T(spec.subtitle ?? '', 72, 418, 600, 40, { fontFamily: f.body, fontSize: 14, letterSpacing: 1.6, color: rgba(p.bg, 0.72) }),
        ...menuSections(leftGroup, spec, 560, {
          x: 72, w: 520, nameSize: 19, color: p.ink, accent: p.accent,
          descColor: rgba(p.ink, 0.54), rowGap: 14, descSize: 12,
        }),
        ...menuSections(rightGroup, spec, 560, {
          x: 648, w: 520, nameSize: 19, color: p.ink, accent: p.accent,
          descColor: rgba(p.ink, 0.54), rowGap: 14, descSize: 12,
        }),
        ...menuFooter(spec, p.ink, p.accent),
      );
      return page(`Menu ${pageNo}`, bgSolid(p.bg), elements);
    }

    if (spec.variant === 'dark') {
      elements.push(...menuHeader(spec, pageNo, total, p.bg, p.accent));
      elements.push(
        T(spec.venue, 72, 130, 700, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: rgba(p.bg, 0.5), uppercase: true }),
        T(spec.title, 64, 170, 1112, 200, {
          fontFamily: f.display, fontSize: 120, lineHeight: 0.9, letterSpacing: -4, color: p.bg,
        }),
        IMG(spec.image ?? PHOTOS.restaurant3, 72, 410, 480, 300, { name: 'Dish image' }),
        T(spec.subtitle ?? '', 600, 420, 568, 130, { fontFamily: f.accent ?? f.body, fontSize: 34, lineHeight: 1.3, color: rgba(p.bg, 0.72) }),
        hairline(600, 570, 568, rgba(p.bg, 0.22), 1),
        ...menuSections(leftGroup, spec, 760, {
          x: 72, w: 520, nameSize: 21, color: p.bg, accent: p.accent,
          descColor: rgba(p.bg, 0.5), rowGap: 18, descSize: 12,
        }),
        ...menuSections(rightGroup, spec, 760, {
          x: 648, w: 520, nameSize: 21, color: p.bg, accent: p.accent,
          descColor: rgba(p.bg, 0.5), rowGap: 18, descSize: 12,
        }),
        ...menuFooter(spec, p.bg, p.accent),
      );
      return page(`Menu ${pageNo}`, bgSolid(p.deep ?? p.ink), elements);
    }

    if (spec.variant === 'bistro') {
      elements.push(...menuHeader(spec, pageNo, total, p.ink, p.accent));
      elements.push(
        T(spec.venue, 72, 128, 600, 28, { fontFamily: f.body, fontSize: 11, letterSpacing: 4, color: rgba(p.ink, 0.5), uppercase: true }),
        T(spec.title, 64, 170, 800, 220, { fontFamily: f.display, fontSize: 96, lineHeight: 0.94, letterSpacing: -2, color: p.ink }),
        S('rect', 900, 150, 268, 150, { fill: p.accent, name: 'Special card' }),
        T('TODAY\u2019S SPECIAL', 922, 178, 224, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: p.bg }),
        T(spec.subtitle ?? 'CÃ´te de boeuf,\nshallot butter', 922, 208, 224, 80, { fontFamily: f.accent ?? f.body, fontSize: 21, lineHeight: 1.3, color: p.bg }),
        hairline(72, 390, 1096, rgba(p.ink, 0.24), 2),
        ...menuSections(leftGroup, spec, 430, {
          x: 72, w: 520, nameSize: 22, color: p.ink, accent: p.accent,
          descColor: rgba(p.ink, 0.58), rowGap: 20, descSize: 13,
        }),
        ...menuSections(rightGroup, spec, 430, {
          x: 648, w: 520, nameSize: 22, color: p.ink, accent: p.accent,
          descColor: rgba(p.ink, 0.58), rowGap: 20, descSize: 13,
        }),
        ...menuFooter(spec, p.ink, p.accent),
      );
      return page(`Menu ${pageNo}`, bgSolid(p.bg), elements);
    }

    if (spec.variant === 'tasting') {
      elements.push(...menuHeader(spec, pageNo, total, p.ink, p.accent));
      elements.push(
        T(spec.title, 160, 190, 920, 130, { fontFamily: f.display, fontSize: 84, lineHeight: 1.0, color: p.ink, align: 'center' }),
        T(spec.subtitle ?? 'A MENU IN SIX MOVEMENTS', 220, 340, 800, 50, { fontFamily: f.body, fontSize: 12, letterSpacing: 3, color: rgba(p.ink, 0.5), align: 'center' }),
        hairline(460, 420, 320, p.accent, 2),
        ...menuSections(leftGroup, spec, 500, {
          x: 260, w: 720, nameSize: 24, color: p.ink, accent: p.accent,
          descColor: rgba(p.ink, 0.5), rowGap: 30, descSize: 14,
        }),
        ...menuFooter(spec, p.ink, p.accent),
      );
      return page(`Menu ${pageNo}`, bgSolid(p.bg), elements);
    }

    if (spec.variant === 'ramen') {
      const background = bgSolid(p.deep ?? p.ink);
      elements.push(...menuHeader(spec, pageNo, total, p.bg, p.accent));
      elements.push(
        IMG(spec.image ?? PHOTOS.food, 0, 120, 1240, 420, {
          name: 'Ramen image', filters: { brightness: 88, contrast: 112, saturate: 92, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
        }),
        S('rect', 0, 120, 1240, 420, { fill: rgba(p.ink, 0.52), name: 'Image wash' }),
        T(spec.venue, 72, 170, 700, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: rgba(p.bg, 0.62), uppercase: true }),
        T(spec.title, 64, 230, 1112, 200, { fontFamily: f.display, fontSize: 134, lineHeight: 0.86, letterSpacing: -5, color: p.bg, uppercase: true }),
        T(spec.subtitle ?? 'BROTH, NOODLE, TOPPING', 72, 430, 600, 40, { fontFamily: f.body, fontSize: 14, letterSpacing: 2.4, color: p.accent }),
        ...menuSections(leftGroup, spec, 610, {
          x: 72, w: 520, nameSize: 22, color: p.bg, accent: p.accent,
          descColor: rgba(p.bg, 0.5), rowGap: 18, descSize: 12,
        }),
        ...menuSections(rightGroup, spec, 610, {
          x: 648, w: 520, nameSize: 22, color: p.bg, accent: p.accent,
          descColor: rgba(p.bg, 0.5), rowGap: 18, descSize: 12,
        }),
        ...menuFooter(spec, p.bg, p.accent),
      );
      return page(`Menu ${pageNo}`, background, elements);
    }

    if (spec.variant === 'dessert') {
      elements.push(...menuHeader(spec, pageNo, total, p.ink, p.accent));
      elements.push(
        S('ellipse', 840, 120, 260, 260, { fill: p.accent, name: 'Dessert orb' }),
        S('ellipse', 900, 180, 140, 140, { fill: p.bg, name: 'Orb inner' }),
        T(spec.venue, 72, 130, 600, 28, { fontFamily: f.body, fontSize: 11, letterSpacing: 4, color: rgba(p.ink, 0.5), uppercase: true }),
        T(spec.title, 64, 180, 760, 180, { fontFamily: f.display, fontSize: 82, lineHeight: 0.94, letterSpacing: -2.4, color: p.ink }),
        T(spec.subtitle ?? '', 72, 360, 600, 80, { fontFamily: f.accent ?? f.body, fontSize: 28, lineHeight: 1.35, color: rgba(p.ink, 0.64) }),
        ...menuSections(group, spec, 500, {
          x: 100, w: 500, nameSize: 22, color: p.ink, accent: p.accent,
          descColor: rgba(p.ink, 0.52), rowGap: 20, descSize: 13,
        }),
        ...menuSections(rightGroup, spec, 500, {
          x: 680, w: 460, nameSize: 22, color: p.ink, accent: p.accent,
          descColor: rgba(p.ink, 0.52), rowGap: 20, descSize: 13,
        }),
        T('BAKED DAILY', 840, 420, 260, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.42), align: 'center' }),
        ...menuFooter(spec, p.ink, p.accent),
      );
      return page(`Menu ${pageNo}`, bgSolid(p.bg), elements);
    }

    // wine
    elements.push(...menuHeader(spec, pageNo, total, p.bg, p.accent));
    elements.push(
      T(spec.venue, 72, 128, 600, 28, { fontFamily: f.body, fontSize: 11, letterSpacing: 4, color: rgba(p.bg, 0.5), uppercase: true }),
      T(spec.title, 64, 170, 800, 180, { fontFamily: f.display, fontSize: 110, lineHeight: 0.92, letterSpacing: -3, color: p.bg }),
      T(spec.subtitle ?? 'BY THE GLASS  /  BY THE BOTTLE', 72, 370, 700, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 2.6, color: p.accent }),
      hairline(72, 430, 1096, rgba(p.bg, 0.24), 1),
      ...menuSections(leftGroup, spec, 470, {
        x: 72, w: 520, nameSize: 21, color: p.bg, accent: p.accent,
        descColor: rgba(p.bg, 0.48), rowGap: 18, descSize: 12,
      }),
      ...menuSections(rightGroup, spec, 470, {
        x: 648, w: 520, nameSize: 21, color: p.bg, accent: p.accent,
        descColor: rgba(p.bg, 0.48), rowGap: 18, descSize: 12,
      }),
      T('N', 920, 1160, 240, 260, {
        fontFamily: f.display, fontSize: 240, lineHeight: 1, color: rgba(p.bg, 0.04), align: 'center',
      }),
      ...menuFooter(spec, p.bg, p.accent),
    );
    return page(`Menu ${pageNo}`, bgSolid(p.deep ?? p.ink), elements);
  });

  return template(spec, MENU, pages);
}

/* ------------------------------------------------------------------ */
/* Invitations                                                         */
/* ------------------------------------------------------------------ */

export type InvitationVariant = 'botanical' | 'blacktie' | 'destination' | 'modern' | 'letterpress' | 'playful';

export type InvitationSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: InvitationVariant;
  image?: string;
  hosts: string;
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  dress?: string;
  rsvp?: string;
  note?: string;
};

const INVITE = { name: 'Invitation', width: 1080, height: 1080 };

export function invitation(spec: InvitationSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const front: El[] = [];
  const back: El[] = [];

  if (spec.variant === 'botanical') {
    front.push(
      S('rect', 40, 40, 1000, 1000, { fill: NONE, stroke: rgba(p.ink, 0.2), strokeWidth: 1, name: 'Frame' }),
      S('ellipse', 760, 20, 300, 300, { fill: p.soft ?? p.accent, name: 'Botanical field' }),
      IMG(spec.image ?? PHOTOS.flowers, 790, 50, 240, 260, { name: 'Flowers', mask: 'blob' }),
      dept('TOGETHER WITH THEIR FAMILIES', 96, 96, 600, rgba(p.ink, 0.52), 9),
      T(spec.hosts, 96, 150, 600, 40, { fontFamily: f.body, fontSize: 14, letterSpacing: 3, color: rgba(p.ink, 0.6), uppercase: true }),
      T(spec.title, 96, 230, 820, 300, { fontFamily: f.display, fontSize: sizeFor(spec.title, 106, 64, 12), lineHeight: 1.04, letterSpacing: -2, color: p.ink }),
      T(spec.subtitle ?? 'REQUEST THE PLEASURE OF YOUR COMPANY', 96, 560, 700, 50, { fontFamily: f.accent ?? f.body, fontSize: 20, lineHeight: 1.4, color: rgba(p.ink, 0.6) }),
      hairline(96, 700, 280, p.accent, 2),
      T(spec.date, 96, 750, 400, 40, { fontFamily: f.body, fontSize: 15, letterSpacing: 2.4, color: p.ink }),
      T(spec.time, 96, 790, 400, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 2, color: rgba(p.ink, 0.58) }),
      T(spec.venue, 640, 750, 340, 70, { fontFamily: f.accent ?? f.body, fontSize: 22, lineHeight: 1.3, color: p.ink, align: 'right' }),
      T(spec.address, 640, 830, 340, 50, { fontFamily: f.body, fontSize: 11, lineHeight: 1.5, color: rgba(p.ink, 0.5), align: 'right' }),
    );
    back.push(
      S('rect', 40, 40, 1000, 1000, { fill: NONE, stroke: rgba(p.ink, 0.2), strokeWidth: 1, name: 'Frame' }),
      dept('THE DETAILS', 96, 96, 600, p.accent, 10),
      T('Saturday', 96, 180, 500, 100, { fontFamily: f.display, fontSize: 72, color: p.ink }),
      T(spec.date, 96, 280, 500, 40, { fontFamily: f.body, fontSize: 15, letterSpacing: 2.4, color: rgba(p.ink, 0.6) }),
      hairline(96, 370, 888, rgba(p.ink, 0.24), 1),
      T('CEREMONY', 96, 410, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.time, 96, 440, 300, 30, { fontFamily: f.body, fontSize: 16, color: p.ink }),
      T('VENUE', 460, 410, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.venue, 460, 440, 500, 30, { fontFamily: f.body, fontSize: 16, color: p.ink }),
      T('ADDRESS', 460, 500, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.address, 460, 530, 500, 50, { fontFamily: f.body, fontSize: 13, lineHeight: 1.5, color: rgba(p.ink, 0.56) }),
      T('DRESS', 96, 620, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.dress ?? 'Garden formal', 96, 650, 300, 30, { fontFamily: f.body, fontSize: 14, color: p.ink }),
      T('RSVP', 96, 740, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.rsvp ?? 'rsvp@thegardens.co by 01 September', 96, 770, 700, 40, { fontFamily: f.body, fontSize: 13, color: p.ink }),
      T(spec.note ?? 'Dinner, dancing and a late-night fire.', 96, 880, 700, 40, { fontFamily: f.accent ?? f.body, fontSize: 20, color: rgba(p.ink, 0.6) }),
      T('01', 900, 920, 100, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.4), align: 'right' }),
    );
    return template(spec, INVITE, [page('Invitation', bgSolid(p.bg), front), page('Details', bgSolid(p.bg), back)]);
  }

  if (spec.variant === 'blacktie') {
    front.push(
      S('rect', 44, 44, 992, 992, { fill: NONE, stroke: rgba(p.accent, 0.45), strokeWidth: 1, name: 'Outer frame' }),
      S('rect', 60, 60, 960, 960, { fill: NONE, stroke: rgba(p.accent, 0.24), strokeWidth: 1, name: 'Inner frame' }),
      S('line', 460, 90, 160, 1, { fill: NONE, stroke: p.accent, strokeWidth: 1 }),
      dept('BLACK TIE', 540, 120, 500, p.accent, 10),
      T(spec.hosts, 90, 180, 900, 40, { fontFamily: f.body, fontSize: 13, letterSpacing: 4, color: rgba(p.bg, 0.6), align: 'center', uppercase: true }),
      T(spec.title, 90, 250, 900, 320, { fontFamily: f.display, fontSize: sizeFor(spec.title, 82, 52, 13), lineHeight: 1.06, letterSpacing: -1.8, color: p.bg, align: 'center' }),
      T(spec.subtitle ?? 'INVITE YOU TO CELEBRATE', 180, 540, 720, 40, { fontFamily: f.body, fontSize: 11, letterSpacing: 3.4, color: rgba(p.bg, 0.46), align: 'center' }),
      hairline(400, 620, 280, rgba(p.accent, 0.5), 1),
      T(spec.date, 90, 660, 900, 50, { fontFamily: f.accent ?? f.body, fontSize: 26, letterSpacing: 2.4, color: p.accent, align: 'center' }),
      T(spec.time, 90, 720, 900, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 2.4, color: rgba(p.bg, 0.56), align: 'center' }),
      T(spec.venue, 90, 800, 900, 40, { fontFamily: f.body, fontSize: 14, letterSpacing: 2.2, color: p.bg, align: 'center', uppercase: true }),
      T(spec.address, 90, 850, 900, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 1.2, color: rgba(p.bg, 0.4), align: 'center' }),
      S('diamond', 520, 920, 40, 40, { fill: p.accent, name: 'Diamond' }),
    );
    back.push(
      S('rect', 44, 44, 992, 992, { fill: NONE, stroke: rgba(p.accent, 0.45), strokeWidth: 1, name: 'Outer frame' }),
      dept('THE EVENING', 96, 96, 600, p.accent, 10),
      T('18:30', 96, 170, 300, 90, { fontFamily: f.display, fontSize: 62, color: p.bg }),
      T('Champagne reception', 96, 260, 400, 30, { fontFamily: f.body, fontSize: 13, color: rgba(p.bg, 0.56) }),
      T('19:30', 96, 350, 300, 90, { fontFamily: f.display, fontSize: 62, color: p.bg }),
      T('Dinner and speeches', 96, 440, 400, 30, { fontFamily: f.body, fontSize: 13, color: rgba(p.bg, 0.56) }),
      T('22:00', 96, 530, 300, 90, { fontFamily: f.display, fontSize: 62, color: p.bg }),
      T('Dancing until late', 96, 620, 400, 30, { fontFamily: f.body, fontSize: 13, color: rgba(p.bg, 0.56) }),
      hairline(96, 720, 888, rgba(p.accent, 0.3), 1),
      T('DRESS', 96, 760, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.bg, 0.4) }),
      T(spec.dress ?? 'Black tie', 96, 790, 400, 30, { fontFamily: f.body, fontSize: 15, color: p.bg }),
      T('RSVP', 600, 760, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.bg, 0.4) }),
      T(spec.rsvp ?? 'rsvp@blacktie.co by 01 September', 600, 790, 380, 40, { fontFamily: f.body, fontSize: 13, color: p.bg }),
      T(spec.note ?? 'A night of good food, good company and one very good band.', 96, 880, 700, 40, { fontFamily: f.accent ?? f.body, fontSize: 19, color: rgba(p.bg, 0.58) }),
    );
    return template(spec, INVITE, [page('Invitation', bgSolid(p.deep ?? p.ink), front), page('Details', bgSolid(p.deep ?? p.ink), back)]);
  }

  if (spec.variant === 'destination') {
    const background = bgImage(spec.image ?? PHOTOS.italy, p.deep ?? p.ink, 0.36);
    front.push(
      S('rect', 0, 0, 1080, 1080, { fill: G(rgba(p.ink, 0.3), rgba(p.ink, 0.72), 0), name: 'Wash' }),
      dept('DESTINATION WEDDING  /  PUGLIA', 64, 72, 700, p.bg, 10),
      T(spec.hosts, 64, 120, 700, 40, { fontFamily: f.body, fontSize: 13, letterSpacing: 3, color: rgba(p.bg, 0.66), uppercase: true }),
      T(spec.title, 64, 300, 900, 300, { fontFamily: f.display, fontSize: sizeFor(spec.title, 116, 68, 11), lineHeight: 0.98, letterSpacing: -2.4, color: p.bg }),
      T(spec.subtitle ?? 'A long weekend in the olive groves', 64, 620, 700, 50, { fontFamily: f.accent ?? f.body, fontSize: 24, color: rgba(p.bg, 0.74) }),
      S('rect', 64, 720, 952, 150, { fill: rgba(p.bg, 0.92), name: 'Details band' }),
      T(spec.date, 88, 748, 300, 40, { fontFamily: f.body, fontSize: 15, letterSpacing: 2.4, color: p.ink }),
      T(spec.time, 88, 790, 300, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 1.8, color: rgba(p.ink, 0.56) }),
      T(spec.venue, 460, 748, 500, 40, { fontFamily: f.body, fontSize: 15, letterSpacing: 2.4, color: p.ink, align: 'right' }),
      T(spec.address, 460, 790, 500, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 1.2, color: rgba(p.ink, 0.48), align: 'right' }),
      T('RSVP  /  ' + (spec.rsvp ?? 'STUDIO@THEOLIVES.CO'), 64, 900, 500, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.bg, 0.6) }),
      T('01', 900, 900, 100, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.bg, 0.5), align: 'right' }),
    );
    back.push(
      S('rect', 0, 0, 1080, 1080, { fill: p.deep ?? p.ink, name: 'Details field' }),
      dept('THE WEEKEND', 64, 72, 700, p.accent, 10),
      T('Friday', 64, 150, 300, 60, { fontFamily: f.display, fontSize: 44, color: p.bg }),
      T('Welcome dinner at the masseria', 64, 210, 500, 30, { fontFamily: f.body, fontSize: 13, color: rgba(p.bg, 0.56) }),
      T('Saturday', 64, 290, 300, 60, { fontFamily: f.display, fontSize: 44, color: p.bg }),
      T('Ceremony at 17:00, dinner at 19:30', 64, 350, 600, 30, { fontFamily: f.body, fontSize: 13, color: rgba(p.bg, 0.56) }),
      T('Sunday', 64, 430, 300, 60, { fontFamily: f.display, fontSize: 44, color: p.bg }),
      T('Poolside lunch and a slow goodbye', 64, 490, 600, 30, { fontFamily: f.body, fontSize: 13, color: rgba(p.bg, 0.56) }),
      hairline(64, 580, 952, rgba(p.bg, 0.22), 1),
      T('STAY', 64, 620, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.bg, 0.4) }),
      T('Masseria Le Fabriche\nContrada Le Fabriche, 74024', 64, 650, 500, 70, { fontFamily: f.body, fontSize: 13, lineHeight: 1.5, color: p.bg }),
      T('DRESS', 64, 760, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.bg, 0.4) }),
      T(spec.dress ?? 'Linen, garden formal', 64, 790, 400, 30, { fontFamily: f.body, fontSize: 14, color: p.bg }),
      T(spec.note ?? 'Olive groves, cold wine and a very long table.', 64, 900, 700, 40, { fontFamily: f.accent ?? f.body, fontSize: 21, color: rgba(p.bg, 0.62) }),
      T('02', 900, 900, 100, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.bg, 0.4), align: 'right' }),
    );
    return template(spec, INVITE, [page('Invitation', background, front), page('Details', bgSolid(p.deep ?? p.ink), back)]);
  }

  if (spec.variant === 'modern') {
    front.push(
      S('rect', 0, 0, 500, 1080, { fill: p.accent, name: 'Type panel' }),
      dept(spec.hosts, 64, 72, 380, rgba(p.bg, 0.7), 9),
      T(spec.title, 64, 180, 380, 420, { fontFamily: f.display, fontSize: sizeFor(spec.title, 90, 54, 8), lineHeight: 0.94, letterSpacing: -2.4, color: p.bg, fontWeight: 700 }),
      T(spec.subtitle ?? 'PLEASE JOIN US', 64, 780, 360, 50, { fontFamily: f.body, fontSize: 12, letterSpacing: 2.4, color: rgba(p.bg, 0.7) }),
      T(spec.date, 64, 850, 360, 40, { fontFamily: f.body, fontSize: 16, letterSpacing: 2, color: p.bg }),
      T(spec.time, 64, 892, 360, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 1.8, color: rgba(p.bg, 0.6) }),
      S('rect', 500, 0, 580, 1080, { fill: p.bg, name: 'Info panel' }),
      IMG(spec.image ?? PHOTOS.architecture5, 560, 80, 460, 420, { name: 'Venue image' }),
      T('THE VENUE', 560, 550, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.venue, 560, 580, 420, 60, { fontFamily: f.body, fontSize: 18, color: p.ink }),
      T('THE ADDRESS', 560, 670, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.address, 560, 700, 420, 70, { fontFamily: f.body, fontSize: 13, lineHeight: 1.5, color: rgba(p.ink, 0.6) }),
      T('RSVP  /  ' + (spec.rsvp ?? 'HELLO@STUDIO.CO'), 560, 820, 420, 40, { fontFamily: f.body, fontSize: 11, letterSpacing: 1.4, color: p.ink }),
      T('01 / 02', 560, 990, 100, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
    );
    back.push(
      S('rect', 0, 0, 1080, 1080, { fill: p.bg, name: 'Details field' }),
      dept('THE SCHEDULE', 64, 72, 600, p.accent, 10),
      T('Five o\u2019clock', 64, 160, 400, 80, { fontFamily: f.display, fontSize: 54, color: p.ink }),
      T('Ceremony on the terrace', 64, 240, 500, 30, { fontFamily: f.body, fontSize: 14, color: rgba(p.ink, 0.58) }),
      T('Seven o\u2019clock', 64, 330, 400, 80, { fontFamily: f.display, fontSize: 54, color: p.ink }),
      T('Dinner under the pergola', 64, 410, 500, 30, { fontFamily: f.body, fontSize: 14, color: rgba(p.ink, 0.58) }),
      T('Late', 64, 500, 400, 80, { fontFamily: f.display, fontSize: 54, color: p.ink }),
      T('Records and negronis', 64, 580, 500, 30, { fontFamily: f.body, fontSize: 14, color: rgba(p.ink, 0.58) }),
      hairline(64, 700, 952, rgba(p.ink, 0.24), 1),
      T('DRESS', 64, 740, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.dress ?? 'Warm formal', 64, 770, 400, 30, { fontFamily: f.body, fontSize: 14, color: p.ink }),
      T('NOTE', 600, 740, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.note ?? 'Bring a layer for the evening.', 600, 770, 400, 50, { fontFamily: f.body, fontSize: 13, lineHeight: 1.5, color: p.ink }),
      T('02 / 02', 900, 990, 120, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.4), align: 'right' }),
      S('rect', 64, 900, 952, 60, { fill: p.accent, name: 'Accent band' }),
      T('WE CANNOT WAIT TO SEE YOU', 64, 918, 952, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: p.bg, align: 'center' }),
    );
    return template(spec, INVITE, [page('Invitation', bgSolid(p.bg), front), page('Details', bgSolid(p.bg), back)]);
  }

  if (spec.variant === 'letterpress') {
    front.push(
      S('rect', 60, 60, 960, 960, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      S('rect', 74, 74, 932, 932, { fill: NONE, stroke: rgba(p.ink, 0.1), strokeWidth: 1, name: 'Inner frame' }),
      dept(spec.hosts, 540, 100, 500, rgba(p.ink, 0.48), 8),
      T('TOGETHER WITH THEIR FAMILIES', 240, 150, 600, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.ink, 0.44), align: 'center' }),
      T(spec.title, 140, 240, 800, 280, { fontFamily: f.display, fontSize: sizeFor(spec.title, 92, 56, 15), lineHeight: 1.06, color: p.ink, align: 'center' }),
      T(spec.subtitle ?? 'INVITE YOU TO CELEBRATE THEIR MARRIAGE', 220, 550, 640, 30, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.ink, 0.44), align: 'center' }),
      T(spec.date, 240, 640, 600, 40, { fontFamily: f.accent ?? f.body, fontSize: 22, letterSpacing: 2.4, color: p.ink, align: 'center' }),
      T(spec.time, 240, 690, 600, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: rgba(p.ink, 0.52), align: 'center' }),
      T(spec.venue, 240, 770, 600, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 2.4, color: p.ink, align: 'center', uppercase: true }),
      T(spec.address, 240, 810, 600, 30, { fontFamily: f.body, fontSize: 10, lineHeight: 1.5, color: rgba(p.ink, 0.44), align: 'center' }),
      S('diamond', 520, 900, 40, 40, { fill: p.accent, name: 'Ornament' }),
      T('01', 920, 980, 60, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.3), align: 'right' }),
    );
    back.push(
      S('rect', 60, 60, 960, 960, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      dept('THE ORDER OF THE DAY', 540, 100, 500, rgba(p.ink, 0.44), 8),
      T('Two o\u2019clock', 140, 190, 800, 60, { fontFamily: f.display, fontSize: 48, color: p.ink, align: 'center' }),
      T('Ceremony in the orchard', 200, 250, 680, 30, { fontFamily: f.body, fontSize: 12, color: rgba(p.ink, 0.5), align: 'center' }),
      T('Four o\u2019clock', 140, 330, 800, 60, { fontFamily: f.display, fontSize: 48, color: p.ink, align: 'center' }),
      T('Dinner and toasts', 200, 390, 680, 30, { fontFamily: f.body, fontSize: 12, color: rgba(p.ink, 0.5), align: 'center' }),
      T('Eight o\u2019clock', 140, 470, 800, 60, { fontFamily: f.display, fontSize: 48, color: p.ink, align: 'center' }),
      T('Dancing in the barn', 200, 530, 680, 30, { fontFamily: f.body, fontSize: 12, color: rgba(p.ink, 0.5), align: 'center' }),
      hairline(340, 620, 400, rgba(p.ink, 0.24), 1),
      T('DRESS', 240, 660, 600, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.ink, 0.4), align: 'center' }),
      T(spec.dress ?? 'Garden formal', 240, 690, 600, 30, { fontFamily: f.body, fontSize: 12, color: p.ink, align: 'center' }),
      T('RSVP', 240, 760, 600, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.ink, 0.4), align: 'center' }),
      T(spec.rsvp ?? 'rsvp@theorchard.co by 01 September', 240, 790, 600, 40, { fontFamily: f.body, fontSize: 11, color: p.ink, align: 'center' }),
      T(spec.note ?? 'A long lunch, a short speech, and a very good band.', 240, 880, 600, 40, { fontFamily: f.accent ?? f.body, fontSize: 17, color: rgba(p.ink, 0.6), align: 'center' }),
      T('02', 920, 980, 60, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.3), align: 'right' }),
    );
    return template(spec, INVITE, [page('Invitation', bgSolid(p.bg), front), page('Details', bgSolid(p.bg), back)]);
  }

  // playful
  front.push(
    S('rect', 0, 0, 1080, 1080, { fill: p.bg, name: 'Field' }),
    S('ellipse', 0, 0, 360, 360, { fill: p.accent, name: 'Orb A' }),
    S('ellipse', 780, 720, 300, 300, { fill: p.soft ?? p.accent, name: 'Orb B' }),
    S('star', 820, 140, 140, 140, { fill: p.ink, name: 'Star' }),
    dept(spec.hosts, 64, 72, 600, rgba(p.ink, 0.6), 9),
    T(spec.title, 80, 250, 900, 380, { fontFamily: f.display, fontSize: sizeFor(spec.title, 94, 60, 10), lineHeight: 0.92, letterSpacing: -3, color: p.ink, fontWeight: 700 }),
    T(spec.subtitle ?? 'A PARTY, A DINNER, A VERY GOOD TIME', 88, 620, 700, 60, { fontFamily: f.body, fontSize: 14, letterSpacing: 2.2, color: rgba(p.ink, 0.64) }),
    S('rect', 88, 720, 420, 100, { fill: p.ink, radius: 50, name: 'Date pill' }),
    T(spec.date, 108, 748, 380, 40, { fontFamily: f.body, fontSize: 18, letterSpacing: 2, color: p.bg, align: 'center' }),
    T(spec.time, 88, 850, 420, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 2, color: rgba(p.ink, 0.6) }),
    T(spec.venue, 88, 900, 600, 40, { fontFamily: f.body, fontSize: 16, color: p.ink }),
    T(spec.address, 88, 940, 600, 30, { fontFamily: f.body, fontSize: 11, color: rgba(p.ink, 0.5) }),
    T('01', 960, 980, 60, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.4), align: 'right' }),
  );
  back.push(
    S('rect', 0, 0, 1080, 1080, { fill: p.ink, name: 'Details field' }),
    S('ellipse', 780, 0, 300, 300, { fill: p.accent, name: 'Orb' }),
    dept('THE PLAN', 64, 72, 600, p.accent, 10),
    T('Arrive hungry.', 64, 160, 700, 100, { fontFamily: f.display, fontSize: 66, color: p.bg }),
    T('Dinner at seven, dancing at nine, cake at midnight.', 64, 280, 620, 80, { fontFamily: f.body, fontSize: 18, lineHeight: 1.5, color: rgba(p.bg, 0.7) }),
    T('DRESS', 64, 430, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.bg, 0.42) }),
    T(spec.dress ?? 'Something you can dance in', 64, 460, 500, 40, { fontFamily: f.body, fontSize: 14, color: p.bg }),
    T('RSVP', 64, 540, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.bg, 0.42) }),
    T(spec.rsvp ?? 'hello@thepartyparty.co', 64, 570, 500, 40, { fontFamily: f.body, fontSize: 14, color: p.bg }),
    T(spec.note ?? 'No gifts, just your best dance move.', 64, 700, 600, 60, { fontFamily: f.accent ?? f.body, fontSize: 22, lineHeight: 1.4, color: p.accent }),
    S('rect', 64, 860, 952, 70, { fill: p.accent, radius: 35, name: 'CTA' }),
    T('SEE YOU THERE', 64, 884, 952, 24, { fontFamily: f.body, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: p.ink, align: 'center' }),
    T('02', 960, 980, 60, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.bg, 0.4), align: 'right' }),
  );
  return template(spec, INVITE, [page('Invitation', bgSolid(p.bg), front), page('Details', bgSolid(p.ink), back)]);
}

/* ------------------------------------------------------------------ */
/* Business cards                                                      */
/* ------------------------------------------------------------------ */

export type CardVariant = 'minimal' | 'editorial' | 'dark' | 'split' | 'photo' | 'type';

export type CardSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: CardVariant;
  image?: string;
  personName: string;
  role: string;
  company: string;
  phone: string;
  email: string;
  site: string;
  address?: string;
  logo?: string;
  tagline?: string;
};

const CARD = { name: 'Business Card', width: 1050, height: 600 };

export function card(spec: CardSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const front: El[] = [];
  const back: El[] = [];

  if (spec.variant === 'minimal') {
    front.push(
      S('rect', 0, 0, 1050, 600, { fill: p.bg, name: 'Card' }),
      S('rect', 56, 56, 44, 44, { fill: p.accent, name: 'Mark' }),
      T(spec.company, 120, 64, 500, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: p.ink, uppercase: true }),
      T(spec.personName, 56, 220, 800, 100, { fontFamily: f.display, fontSize: 62, lineHeight: 1.0, letterSpacing: -1.6, color: p.ink }),
      T(spec.role, 56, 330, 500, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 2, color: rgba(p.ink, 0.54), uppercase: true }),
      hairline(56, 430, 280, rgba(p.ink, 0.24), 1),
      T(spec.tagline ?? 'Architecture  /  Interiors', 56, 460, 500, 30, { fontFamily: f.accent ?? f.body, fontSize: 17, color: rgba(p.ink, 0.6) }),
      T('01', 930, 500, 64, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.34), align: 'right' }),
    );
    back.push(
      S('rect', 0, 0, 1050, 600, { fill: p.accent, name: 'Card back' }),
      T(spec.personName, 56, 56, 600, 60, { fontFamily: f.display, fontSize: 42, color: p.bg }),
      T(spec.company, 56, 118, 500, 26, { fontFamily: f.body, fontSize: 11, letterSpacing: 3, color: rgba(p.bg, 0.7), uppercase: true }),
      hairline(56, 180, 938, rgba(p.bg, 0.3), 1),
      T('T', 56, 220, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.bg, 0.54) }),
      T(spec.phone, 56, 248, 400, 30, { fontFamily: f.body, fontSize: 16, color: p.bg }),
      T('E', 56, 300, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.bg, 0.54) }),
      T(spec.email, 56, 328, 400, 30, { fontFamily: f.body, fontSize: 16, color: p.bg }),
      T('W', 56, 380, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.bg, 0.54) }),
      T(spec.site, 56, 408, 400, 30, { fontFamily: f.body, fontSize: 16, color: p.bg }),
      T(spec.address ?? '12 Mill Lane, London E2', 620, 380, 374, 50, { fontFamily: f.body, fontSize: 12, lineHeight: 1.5, color: rgba(p.bg, 0.7), align: 'right' }),
      S('rect', 900, 60, 44, 44, { fill: p.bg, name: 'Mark' }),
    );
    return template(spec, CARD, [page('Front', bgSolid(p.bg), front), page('Back', bgSolid(p.accent), back)]);
  }

  if (spec.variant === 'editorial') {
    front.push(
      S('rect', 0, 0, 1050, 600, { fill: p.bg, name: 'Card' }),
      T(spec.personName.slice(0, 1), 44, 60, 200, 220, { fontFamily: f.display, fontSize: 220, lineHeight: 0.8, color: p.accent }),
      T(spec.personName, 250, 120, 700, 80, { fontFamily: f.display, fontSize: 54, color: p.ink }),
      T(spec.role, 252, 206, 500, 28, { fontFamily: f.body, fontSize: 11, letterSpacing: 2.4, color: rgba(p.ink, 0.52), uppercase: true }),
      hairline(252, 260, 720, rgba(p.ink, 0.24), 1),
      T(spec.company, 252, 292, 500, 30, { fontFamily: f.body, fontSize: 13, letterSpacing: 3, color: p.ink, uppercase: true }),
      T(spec.tagline ?? 'Editorial design and art direction', 252, 340, 600, 40, { fontFamily: f.accent ?? f.body, fontSize: 18, color: rgba(p.ink, 0.58) }),
      T('01', 900, 500, 80, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.34), align: 'right' }),
      S('rect', 56, 470, 160, 4, { fill: p.accent, name: 'Accent rule' }),
    );
    back.push(
      S('rect', 0, 0, 1050, 600, { fill: p.ink, name: 'Card back' }),
      T('CONTACT', 56, 56, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: p.accent }),
      T(spec.phone, 56, 96, 460, 30, { fontFamily: f.body, fontSize: 17, color: p.bg }),
      T(spec.email, 56, 136, 600, 30, { fontFamily: f.body, fontSize: 17, color: p.bg }),
      T(spec.site, 56, 176, 460, 30, { fontFamily: f.body, fontSize: 17, color: p.bg }),
      hairline(56, 240, 938, rgba(p.bg, 0.22), 1),
      T(spec.address ?? '12 Mill Lane, London E2', 56, 276, 500, 50, { fontFamily: f.body, fontSize: 12, lineHeight: 1.5, color: rgba(p.bg, 0.56) }),
      T(spec.company, 720, 500, 260, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 3, color: rgba(p.bg, 0.5), align: 'right', uppercase: true }),
      T('02', 900, 550, 80, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.3), align: 'right' }),
      S('ellipse', 900, 60, 80, 80, { fill: p.accent, name: 'Mark' }),
    );
    return template(spec, CARD, [page('Front', bgSolid(p.bg), front), page('Back', bgSolid(p.ink), back)]);
  }

  if (spec.variant === 'dark') {
    front.push(
      S('rect', 0, 0, 1050, 600, { fill: p.deep ?? p.ink, name: 'Card' }),
      S('rect', 56, 56, 938, 488, { fill: NONE, stroke: rgba(p.accent, 0.36), strokeWidth: 1, name: 'Frame' }),
      T(spec.company, 88, 88, 500, 26, { fontFamily: f.body, fontSize: 11, letterSpacing: 4, color: p.accent, uppercase: true }),
      T(spec.personName, 88, 210, 800, 100, { fontFamily: f.display, fontSize: 64, color: p.bg }),
      T(spec.role, 88, 320, 500, 28, { fontFamily: f.body, fontSize: 11, letterSpacing: 2.4, color: rgba(p.bg, 0.5), uppercase: true }),
      S('diamond', 900, 90, 44, 44, { fill: p.accent, name: 'Diamond' }),
      T(spec.tagline ?? 'Private clients  /  Worldwide', 88, 430, 500, 30, { fontFamily: f.accent ?? f.body, fontSize: 17, color: rgba(p.bg, 0.56) }),
      T('01', 900, 500, 60, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.3), align: 'right' }),
    );
    back.push(
      S('rect', 0, 0, 1050, 600, { fill: p.accent, name: 'Card back' }),
      T(spec.personName, 56, 56, 500, 50, { fontFamily: f.display, fontSize: 36, color: p.deep ?? p.ink }),
      T(spec.company, 56, 108, 500, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.deep ?? p.ink, 0.6), uppercase: true }),
      hairline(56, 160, 938, rgba(p.deep ?? p.ink, 0.24), 1),
      T(spec.phone, 56, 200, 300, 26, { fontFamily: f.body, fontSize: 15, color: p.deep ?? p.ink }),
      T(spec.email, 56, 238, 400, 26, { fontFamily: f.body, fontSize: 15, color: p.deep ?? p.ink }),
      T(spec.site, 56, 276, 300, 26, { fontFamily: f.body, fontSize: 15, color: p.deep ?? p.ink }),
      T(spec.address ?? '12 Mill Lane, London E2', 56, 330, 400, 50, { fontFamily: f.body, fontSize: 11, lineHeight: 1.5, color: rgba(p.deep ?? p.ink, 0.58) }),
      ...barcode(620, 200, 374, 80, p.deep ?? p.ink, 18),
      T('02', 900, 550, 80, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.34), align: 'right' }),
    );
    return template(spec, CARD, [page('Front', bgSolid(p.deep ?? p.ink), front), page('Back', bgSolid(p.accent), back)]);
  }

  if (spec.variant === 'split') {
    front.push(
      S('rect', 0, 0, 420, 600, { fill: p.accent, name: 'Color block' }),
      T(spec.personName, 56, 180, 320, 160, { fontFamily: f.display, fontSize: 54, lineHeight: 0.98, color: p.bg }),
      T(spec.role, 56, 370, 300, 50, { fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: rgba(p.bg, 0.7), uppercase: true }),
      T(spec.company, 480, 80, 500, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: p.ink, uppercase: true }),
      T(spec.tagline ?? 'Independent design studio', 480, 200, 480, 80, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.35, color: rgba(p.ink, 0.7) }),
      hairline(480, 330, 480, rgba(p.ink, 0.24), 1),
      T(spec.phone, 480, 370, 300, 28, { fontFamily: f.body, fontSize: 14, color: p.ink }),
      T(spec.email, 480, 408, 400, 28, { fontFamily: f.body, fontSize: 14, color: p.ink }),
      T(spec.site, 480, 446, 300, 28, { fontFamily: f.body, fontSize: 14, color: p.ink }),
      T('01', 900, 500, 80, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.3), align: 'right' }),
    );
    back.push(
      S('rect', 0, 0, 1050, 600, { fill: p.ink, name: 'Card back' }),
      S('ellipse', 700, 0, 340, 340, { fill: p.accent, name: 'Orb' }),
      T(spec.company, 56, 80, 400, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: p.bg, uppercase: true }),
      T(spec.personName, 56, 180, 500, 70, { fontFamily: f.display, fontSize: 44, color: p.bg }),
      T(spec.address ?? '12 Mill Lane, London E2', 56, 300, 500, 50, { fontFamily: f.body, fontSize: 13, lineHeight: 1.5, color: rgba(p.bg, 0.56) }),
      T(spec.phone, 56, 400, 300, 26, { fontFamily: f.body, fontSize: 14, color: p.bg }),
      T(spec.email, 56, 438, 400, 26, { fontFamily: f.body, fontSize: 14, color: p.bg }),
      T(spec.site, 56, 476, 300, 26, { fontFamily: f.body, fontSize: 14, color: p.accent }),
      T('02', 900, 550, 80, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.3), align: 'right' }),
    );
    return template(spec, CARD, [page('Front', bgSolid(p.bg), front), page('Back', bgSolid(p.ink), back)]);
  }

  if (spec.variant === 'photo') {
    front.push(
      S('rect', 0, 0, 1050, 600, { fill: p.bg, name: 'Card' }),
      IMG(spec.image ?? PHOTOS.interior, 580, 0, 470, 600, { name: 'Work image' }),
      S('rect', 580, 0, 470, 600, { fill: rgba(p.ink, 0.18), name: 'Image wash' }),
      T(spec.company, 56, 60, 460, 26, { fontFamily: f.body, fontSize: 11, letterSpacing: 4, color: p.accent, uppercase: true }),
      T(spec.personName, 56, 180, 470, 90, { fontFamily: f.display, fontSize: 52, color: p.ink }),
      T(spec.role, 56, 280, 460, 28, { fontFamily: f.body, fontSize: 11, letterSpacing: 2.2, color: rgba(p.ink, 0.52), uppercase: true }),
      T(spec.tagline ?? 'Spaces for slow living', 56, 350, 460, 50, { fontFamily: f.accent ?? f.body, fontSize: 20, lineHeight: 1.4, color: rgba(p.ink, 0.64) }),
      hairline(56, 450, 300, rgba(p.ink, 0.24), 1),
      T('01', 900, 540, 80, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.8), align: 'right' }),
    );
    back.push(
      S('rect', 0, 0, 1050, 600, { fill: p.accent, name: 'Card back' }),
      T(spec.personName, 56, 56, 500, 50, { fontFamily: f.display, fontSize: 36, color: p.deep ?? p.ink }),
      T(spec.company, 56, 108, 500, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.deep ?? p.ink, 0.6), uppercase: true }),
      hairline(56, 160, 938, rgba(p.deep ?? p.ink, 0.24), 1),
      T(spec.phone, 56, 200, 300, 26, { fontFamily: f.body, fontSize: 15, color: p.deep ?? p.ink }),
      T(spec.email, 56, 238, 400, 26, { fontFamily: f.body, fontSize: 15, color: p.deep ?? p.ink }),
      T(spec.site, 56, 276, 300, 26, { fontFamily: f.body, fontSize: 15, color: p.deep ?? p.ink }),
      T(spec.address ?? '12 Mill Lane, London E2', 620, 200, 374, 60, { fontFamily: f.body, fontSize: 12, lineHeight: 1.5, color: rgba(p.deep ?? p.ink, 0.6), align: 'right' }),
      ...barcode(620, 330, 374, 80, p.deep ?? p.ink, 18),
      T('02', 900, 550, 80, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.34), align: 'right' }),
    );
    return template(spec, CARD, [page('Front', bgSolid(p.bg), front), page('Back', bgSolid(p.accent), back)]);
  }

  // type
  front.push(
    S('rect', 0, 0, 1050, 600, { fill: p.ink, name: 'Card' }),
    T(spec.personName, 40, 80, 970, 280, { fontFamily: f.display, fontSize: sizeFor(spec.personName, 150, 80, 12), lineHeight: 0.86, letterSpacing: -5, color: p.bg, uppercase: true }),
    T(spec.role, 44, 400, 500, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 3, color: p.accent, uppercase: true }),
    T(spec.company, 44, 440, 500, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 3, color: rgba(p.bg, 0.5), uppercase: true }),
    T('01', 940, 520, 60, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.3), align: 'right' }),
    S('rect', 44, 520, 120, 4, { fill: p.accent, name: 'Accent rule' }),
  );
  back.push(
    S('rect', 0, 0, 1050, 600, { fill: p.bg, name: 'Card back' }),
    T(spec.phone, 56, 100, 400, 40, { fontFamily: f.body, fontSize: 22, color: p.ink }),
    T(spec.email, 56, 150, 600, 40, { fontFamily: f.body, fontSize: 22, color: p.ink }),
    T(spec.site, 56, 200, 400, 40, { fontFamily: f.body, fontSize: 22, color: p.accent }),
    hairline(56, 280, 938, rgba(p.ink, 0.24), 1),
    T(spec.address ?? '12 Mill Lane, London E2', 56, 320, 500, 60, { fontFamily: f.body, fontSize: 13, lineHeight: 1.5, color: rgba(p.ink, 0.56) }),
    T(spec.tagline ?? 'Design, direction, and the space between', 56, 440, 700, 40, { fontFamily: f.accent ?? f.body, fontSize: 20, color: rgba(p.ink, 0.6) }),
    T('02', 900, 550, 80, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.3), align: 'right' }),
  );
  return template(spec, CARD, [page('Front', bgSolid(p.ink), front), page('Back', bgSolid(p.bg), back)]);
}

/* ------------------------------------------------------------------ */
/* Resumes                                                             */
/* ------------------------------------------------------------------ */

export type ResumeVariant = 'classic' | 'sidebar' | 'editorial' | 'brutal' | 'swiss' | 'creative';

export type ResumeRole = { role: string; company: string; dates: string; bullets: string[] };

export type ResumeSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: ResumeVariant;
  image?: string;
  personName: string;
  title: string;
  summary: string;
  contact: string[];
  experience: ResumeRole[];
  skills: string[];
  education: string[];
};

const RESUME = { name: 'Resume', width: 1240, height: 1754 };

function experienceBlocks(
  spec: ResumeSpec,
  x: number,
  y: number,
  w: number,
  color: string,
  accent: string,
  roleSize: number,
  max = 3,
): El[] {
  const f = spec.fonts;
  const out: El[] = [];
  let cursor = y;
  for (const item of spec.experience.slice(0, max)) {
    out.push(
      T(item.role, x, cursor, w - 220, 30, { fontFamily: f.body, fontSize: roleSize, fontWeight: 600, color }),
      T(item.company, x, cursor + roleSize + 8, w - 220, 24, { fontFamily: f.body, fontSize: 14, color: rgba(color, 0.6) }),
      T(item.dates, x + w - 200, cursor, 200, 24, { fontFamily: f.body, fontSize: 12, letterSpacing: 1, color: accent, align: 'right' }),
    );
    cursor += roleSize + 40;
    for (const bullet of item.bullets.slice(0, 2)) {
      out.push(T(bullet, x, cursor, w, 26, { fontFamily: f.body, fontSize: 13, lineHeight: 1.45, color: rgba(color, 0.66) }));
      cursor += 24;
    }
    cursor += 34;
    out.push(hairline(x, cursor - 14, w, rgba(color, 0.16), 1));
  }
  return out;
}

export function resume(spec: ResumeSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'classic') {
    elements.push(
      T(spec.personName, 90, 92, 1060, 100, { fontFamily: f.display, fontSize: 88, color: p.ink, align: 'center' }),
      T(spec.title, 90, 200, 1060, 32, { fontFamily: f.body, fontSize: 12, letterSpacing: 3, color: p.accent, align: 'center', uppercase: true }),
      T(spec.contact.join('   \u00b7   '), 90, 244, 1060, 26, { fontFamily: f.body, fontSize: 12, color: rgba(p.ink, 0.56), align: 'center' }),
      hairline(90, 300, 1060, rgba(p.ink, 0.24), 2),
      T(spec.summary, 90, 340, 1060, 90, { fontFamily: f.accent ?? f.body, fontSize: 22, lineHeight: 1.45, color: rgba(p.ink, 0.72), align: 'center' }),
      dept('EXPERIENCE', 90, 470, 400, p.accent, 10),
      ...experienceBlocks(spec, 90, 510, 1060, p.ink, p.accent, 20, 3),
      dept('EDUCATION', 90, 1250, 400, p.accent, 10),
      ...spec.education.slice(0, 2).map((line, i) =>
        T(line, 90, 1290 + i * 30, 700, 30, { fontFamily: f.body, fontSize: 14, color: rgba(p.ink, 0.7) }),
      ),
      dept('SKILLS', 760, 1250, 300, p.accent, 10),
      T(spec.skills.join('   \u00b7   '), 760, 1290, 390, 80, { fontFamily: f.body, fontSize: 13, lineHeight: 1.6, color: rgba(p.ink, 0.66) }),
      hairline(90, 1480, 1060, rgba(p.ink, 0.2), 1),
      T(spec.personName, 90, 1510, 400, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.4), uppercase: true }),
      T('01 / 02', 950, 1510, 200, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.4), align: 'right' }),
    );
    return template(spec, RESUME, [page('Resume', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'sidebar') {
    elements.push(
      S('rect', 0, 0, 380, 1754, { fill: p.ink, name: 'Sidebar' }),
      T(spec.personName.slice(0, 1), 64, 64, 120, 100, { fontFamily: f.display, fontSize: 78, color: p.accent }),
      T(spec.personName, 64, 180, 300, 90, { fontFamily: f.display, fontSize: 42, lineHeight: 1.05, color: p.bg }),
      T(spec.title, 64, 290, 280, 50, { fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: p.accent, uppercase: true }),
      hairline(64, 360, 252, rgba(p.bg, 0.24), 1),
      dept('CONTACT', 64, 400, 200, p.accent, 9),
      ...spec.contact.slice(0, 4).map((line, i) =>
        T(line, 64, 440 + i * 30, 280, 26, { fontFamily: f.body, fontSize: 11, color: rgba(p.bg, 0.72) }),
      ),
      dept('SKILLS', 64, 650, 200, p.accent, 9),
      T(spec.skills.join('\n'), 64, 690, 280, 260, { fontFamily: f.body, fontSize: 12, lineHeight: 2.0, color: rgba(p.bg, 0.66) }),
      dept('EDUCATION', 64, 1020, 200, p.accent, 9),
      T(spec.education.join('\n'), 64, 1060, 280, 160, { fontFamily: f.body, fontSize: 12, lineHeight: 1.8, color: rgba(p.bg, 0.66) }),
      T('01', 64, 1640, 100, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.bg, 0.3) }),
      dept('PROFILE', 470, 90, 300, p.accent, 10),
      T(spec.summary, 470, 130, 690, 130, { fontFamily: f.accent ?? f.body, fontSize: 23, lineHeight: 1.5, color: rgba(p.ink, 0.7) }),
      hairline(470, 300, 690, rgba(p.ink, 0.2), 1),
      dept('EXPERIENCE', 470, 340, 300, p.accent, 10),
      ...experienceBlocks(spec, 470, 380, 690, p.ink, p.accent, 20, 3),
      hairline(470, 1420, 690, rgba(p.ink, 0.2), 1),
      T('References available on request.', 470, 1460, 500, 24, { fontFamily: f.body, fontSize: 11, color: rgba(p.ink, 0.44) }),
    );
    return template(spec, RESUME, [page('Resume', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'editorial') {
    elements.push(
      T(spec.personName, 72, 66, 1000, 90, { fontFamily: f.display, fontSize: 74, lineHeight: 0.96, color: p.ink }),
      T(spec.title, 72, 160, 700, 28, { fontFamily: f.body, fontSize: 12, letterSpacing: 3, color: p.accent, uppercase: true }),
      T(spec.contact.join('  /  '), 72, 204, 1096, 26, { fontFamily: f.body, fontSize: 11, letterSpacing: 1.2, color: rgba(p.ink, 0.5) }),
      hairline(72, 260, 1096, rgba(p.ink, 0.24), 2),
      T(spec.summary, 72, 300, 600, 120, { fontFamily: f.accent ?? f.body, fontSize: 23, lineHeight: 1.5, color: rgba(p.ink, 0.7) }),
      ...(spec.image ? [IMG(spec.image, 820, 290, 348, 260, { name: 'Portrait' })] : []),
      dept('EXPERIENCE', 72, 480, 300, p.accent, 10),
      ...experienceBlocks(spec, 72, 520, 1096, p.ink, p.accent, 21, 3),
      dept('EDUCATION', 72, 1260, 300, p.accent, 10),
      ...spec.education.slice(0, 2).map((line, i) =>
        T(line, 72, 1300 + i * 30, 600, 30, { fontFamily: f.body, fontSize: 14, color: rgba(p.ink, 0.68) }),
      ),
      dept('SKILLS', 760, 1260, 300, p.accent, 10),
      T(spec.skills.join('  /  '), 760, 1300, 408, 80, { fontFamily: f.body, fontSize: 12, lineHeight: 1.6, color: rgba(p.ink, 0.62) }),
      hairline(72, 1490, 1096, rgba(p.ink, 0.2), 1),
      T(spec.personName, 72, 1520, 400, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.4), uppercase: true }),
      T('01 / 02', 950, 1520, 218, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.4), align: 'right' }),
    );
    return template(spec, RESUME, [page('Resume', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'brutal') {
    elements.push(
      S('rect', 0, 0, 1240, 420, { fill: p.ink, name: 'Header block' }),
      T(spec.personName, 64, 72, 1112, 130, { fontFamily: f.display, fontSize: sizeFor(spec.personName, 96, 56, 12), lineHeight: 0.92, color: p.bg, uppercase: true }),
      T(spec.title, 64, 220, 800, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 3, color: p.accent, uppercase: true }),
      T(spec.contact.join('   /   '), 64, 310, 1112, 26, { fontFamily: f.body, fontSize: 11, letterSpacing: 1.2, color: rgba(p.bg, 0.6) }),
      T(spec.summary, 64, 470, 1112, 100, { fontFamily: f.body, fontSize: 18, lineHeight: 1.55, color: rgba(p.ink, 0.7) }),
      hairline(64, 620, 1112, rgba(p.ink, 0.24), 2),
      dept('EXPERIENCE', 64, 660, 300, p.accent, 10),
      ...experienceBlocks(spec, 64, 700, 700, p.ink, p.accent, 20, 3),
      dept('SKILLS', 820, 660, 300, p.accent, 10),
      T(spec.skills.join('\n'), 820, 700, 356, 260, { fontFamily: f.body, fontSize: 12, lineHeight: 2.0, color: rgba(p.ink, 0.66) }),
      dept('EDUCATION', 820, 1000, 300, p.accent, 10),
      T(spec.education.join('\n'), 820, 1040, 356, 120, { fontFamily: f.body, fontSize: 12, lineHeight: 1.8, color: rgba(p.ink, 0.66) }),
      hairline(64, 1420, 1112, rgba(p.ink, 0.2), 1),
      T('01', 64, 1450, 100, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
      T('PORTFOLIO ON REQUEST', 780, 1450, 396, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
    );
    return template(spec, RESUME, [page('Resume', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'swiss') {
    elements.push(
      T('CURRICULUM VITAE', 72, 64, 500, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: p.accent }),
      T(spec.personName, 72, 100, 1096, 100, { fontFamily: f.display, fontSize: 88, color: p.ink }),
      T(spec.title, 72, 210, 700, 28, { fontFamily: f.body, fontSize: 13, letterSpacing: 2.4, color: rgba(p.ink, 0.6), uppercase: true }),
      T(spec.contact.join('   \u00b7   '), 72, 254, 1096, 26, { fontFamily: f.body, fontSize: 11, color: rgba(p.ink, 0.5) }),
      hairline(72, 310, 1096, rgba(p.ink, 0.24), 2),
      T(spec.summary, 72, 350, 640, 120, { fontFamily: f.body, fontSize: 17, lineHeight: 1.6, color: rgba(p.ink, 0.68) }),
      dept('EXPERIENCE', 72, 500, 300, p.accent, 10),
      ...experienceBlocks(spec, 72, 540, 1096, p.ink, p.accent, 20, 3),
      dept('EDUCATION', 72, 1270, 300, p.accent, 10),
      ...spec.education.slice(0, 2).map((line, i) =>
        T(line, 72, 1310 + i * 30, 600, 30, { fontFamily: f.body, fontSize: 13, color: rgba(p.ink, 0.66) }),
      ),
      dept('SKILLS', 760, 1270, 300, p.accent, 10),
      T(spec.skills.join('\n'), 760, 1310, 408, 140, { fontFamily: f.body, fontSize: 12, lineHeight: 1.9, color: rgba(p.ink, 0.62) }),
      hairline(72, 1500, 1096, rgba(p.ink, 0.2), 1),
      T('01 / 02', 950, 1530, 218, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
    );
    return template(spec, RESUME, [page('Resume', bgSolid(p.bg), elements)]);
  }

  // creative
  elements.push(
    S('rect', 0, 0, 1240, 500, { fill: p.accent, name: 'Color header' }),
    T(spec.personName, 64, 70, 850, 130, { fontFamily: f.display, fontSize: sizeFor(spec.personName, 92, 54, 13), lineHeight: 0.94, color: p.bg }),
    T(spec.title, 64, 220, 700, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 3, color: rgba(p.bg, 0.72), uppercase: true }),
    T(spec.summary, 64, 300, 780, 100, { fontFamily: f.accent ?? f.body, fontSize: 22, lineHeight: 1.45, color: rgba(p.bg, 0.82) }),
    IMG(spec.image ?? PHOTOS.portrait, 920, 60, 248, 300, { name: 'Portrait', radius: 124 }),
    dept('EXPERIENCE', 64, 550, 300, p.accent, 10),
    ...experienceBlocks(spec, 64, 590, 1112, p.ink, p.accent, 21, 3),
    dept('SKILLS', 64, 1300, 300, p.accent, 10),
    T(spec.skills.join('   \u00b7   '), 64, 1340, 600, 80, { fontFamily: f.body, fontSize: 13, lineHeight: 1.6, color: rgba(p.ink, 0.64) }),
    dept('EDUCATION', 760, 1300, 300, p.accent, 10),
    T(spec.education.join('\n'), 760, 1340, 408, 120, { fontFamily: f.body, fontSize: 12, lineHeight: 1.8, color: rgba(p.ink, 0.64) }),
    T(spec.contact.join('   /   '), 64, 1510, 1112, 26, { fontFamily: f.body, fontSize: 10, color: rgba(p.ink, 0.46) }),
    T('01', 950, 1510, 218, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
  );
  return template(spec, RESUME, [page('Resume', bgSolid(p.bg), elements)]);
}

/* ------------------------------------------------------------------ */
/* Logo boards                                                         */
/* ------------------------------------------------------------------ */

export type LogoVariant = 'wordmark' | 'monogram' | 'abstract' | 'badge' | 'stacked';

export type LogoSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: LogoVariant;
  brand: string;
  mark: string;
  tagline: string;
  descriptor: string;
};

const LOGO = { name: 'Logo', width: 1000, height: 1000 };

export function logo(spec: LogoSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const primary: El[] = [];
  const usage: El[] = [];

  if (spec.variant === 'wordmark') {
    primary.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      dept('IDENTITY SYSTEM  /  PRIMARY', 80, 80, 420, rgba(p.ink, 0.4), 9),
      dept('2026', 800, 80, 120, rgba(p.ink, 0.4), 9, 'right'),
      T(spec.brand, 80, 300, 840, 200, { fontFamily: f.display, fontSize: sizeFor(spec.brand, 136, 72, 10), lineHeight: 0.9, letterSpacing: -4, color: p.ink, align: 'center' }),
      T(spec.tagline, 80, 520, 840, 40, { fontFamily: f.body, fontSize: 13, letterSpacing: 5, color: p.accent, align: 'center', uppercase: true }),
      hairline(420, 590, 160, rgba(p.ink, 0.3), 1),
      T(spec.descriptor, 80, 640, 840, 50, { fontFamily: f.accent ?? f.body, fontSize: 18, lineHeight: 1.4, color: rgba(p.ink, 0.56), align: 'center' }),
      T('01 / 02', 80, 900, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
      S('rect', 840, 120, 40, 40, { fill: p.accent, name: 'Mark' }),
    );
    usage.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      T('PRIMARY', 80, 80, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      S('rect', 80, 120, 840, 320, { fill: p.ink, name: 'Dark application' }),
      T(spec.brand, 120, 240, 760, 100, { fontFamily: f.display, fontSize: 64, color: p.bg, align: 'center' }),
      T('REVERSED', 80, 460, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      S('rect', 80, 500, 840, 300, { fill: p.accent, name: 'Colour application' }),
      T(spec.brand, 120, 620, 760, 90, { fontFamily: f.display, fontSize: 58, color: p.deep ?? p.ink, align: 'center' }),
      T('CLEAR SPACE  /  MINIMUM 24PX', 80, 850, 600, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 1.8, color: rgba(p.ink, 0.4) }),
      T('02 / 02', 840, 900, 80, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
    );
    return template(spec, LOGO, [page('Primary', bgSolid(p.bg), primary), page('Usage', bgSolid(p.bg), usage)]);
  }

  if (spec.variant === 'monogram') {
    primary.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      dept('IDENTITY SYSTEM  /  PRIMARY', 80, 80, 420, rgba(p.ink, 0.4), 9),
      dept('2026', 800, 80, 120, rgba(p.ink, 0.4), 9, 'right'),
      S('ellipse', 250, 180, 500, 500, { fill: p.accent, name: 'Monogram field' }),
      T(spec.mark, 250, 300, 500, 260, { fontFamily: f.display, fontSize: 250, lineHeight: 0.9, color: p.deep ?? p.ink, align: 'center' }),
      T(spec.brand, 80, 720, 840, 46, { fontFamily: f.body, fontSize: 18, letterSpacing: 8, color: p.ink, align: 'center', uppercase: true }),
      T(spec.tagline, 80, 780, 840, 40, { fontFamily: f.accent ?? f.body, fontSize: 16, color: rgba(p.ink, 0.56), align: 'center' }),
      T('01 / 02', 80, 900, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
      S('line', 380, 760, 240, 1, { fill: NONE, stroke: rgba(p.ink, 0.24), strokeWidth: 1 }),
    );
    usage.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      T('CONSTRUCTION', 80, 80, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      S('ring', 260, 120, 480, 480, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Construction ring' }),
      S('ellipse', 330, 190, 340, 340, { fill: p.accent, name: 'Monogram field' }),
      T(spec.mark, 330, 260, 340, 200, { fontFamily: f.display, fontSize: 170, color: p.deep ?? p.ink, align: 'center' }),
      T('CAP HEIGHT  /  OPTICAL CENTRE', 80, 640, 500, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 1.6, color: rgba(p.ink, 0.4) }),
      T('02 / 02', 840, 900, 80, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
      T(spec.brand, 80, 850, 400, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.4) }),
    );
    return template(spec, LOGO, [page('Primary', bgSolid(p.bg), primary), page('Construction', bgSolid(p.bg), usage)]);
  }

  if (spec.variant === 'abstract') {
    primary.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      dept('IDENTITY SYSTEM  /  PRIMARY', 80, 80, 420, rgba(p.ink, 0.4), 9),
      dept('2026', 800, 80, 120, rgba(p.ink, 0.4), 9, 'right'),
      S('ellipse', 300, 140, 400, 400, { fill: p.accent, name: 'Orb' }),
      S('rect', 430, 270, 260, 260, { fill: p.ink, rotation: 45, name: 'Square' }),
      S('ellipse', 360, 330, 160, 160, { fill: p.bg, name: 'Cutout' }),
      T(spec.brand, 80, 680, 840, 60, { fontFamily: f.body, fontSize: 22, letterSpacing: 8, color: p.ink, align: 'center', uppercase: true }),
      T(spec.tagline, 80, 740, 840, 40, { fontFamily: f.accent ?? f.body, fontSize: 17, color: rgba(p.ink, 0.58), align: 'center' }),
      T('01 / 02', 80, 900, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
    );
    usage.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      T('PALETTE', 80, 80, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      S('rect', 80, 120, 200, 200, { fill: p.ink, name: 'Ink swatch' }),
      S('rect', 300, 120, 200, 200, { fill: p.accent, name: 'Accent swatch' }),
      S('rect', 520, 120, 200, 200, { fill: p.bg, stroke: rgba(p.ink, 0.2), strokeWidth: 1, name: 'Paper swatch' }),
      T('INK', 80, 340, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.44) }),
      T('SIGNAL', 300, 340, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.44) }),
      T('PAPER', 520, 340, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.44) }),
      T('THE MARK', 80, 460, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      S('ellipse', 80, 500, 140, 140, { fill: p.accent, name: 'Orb' }),
      S('rect', 130, 550, 80, 80, { fill: p.ink, rotation: 45, name: 'Square' }),
      T('02 / 02', 840, 900, 80, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
      T(spec.brand, 80, 850, 400, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.4) }),
    );
    return template(spec, LOGO, [page('Primary', bgSolid(p.bg), primary), page('Palette', bgSolid(p.bg), usage)]);
  }

  if (spec.variant === 'badge') {
    primary.push(
      S('ring', 230, 130, 540, 540, { fill: NONE, stroke: p.accent, strokeWidth: 2, name: 'Badge ring' }),
      dept('IDENTITY SYSTEM  /  PRIMARY', 80, 80, 420, rgba(p.ink, 0.4), 9),
      dept('2026', 800, 80, 120, rgba(p.ink, 0.4), 9, 'right'),
      S('ellipse', 300, 200, 400, 400, { fill: p.ink, name: 'Badge field' }),
      T(spec.mark, 300, 310, 400, 200, { fontFamily: f.display, fontSize: 150, color: p.bg, align: 'center' }),
      T(spec.brand, 540, 230, 400, 40, { fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: p.bg, rotation: 0, align: 'center' }),
      T(spec.tagline, 80, 750, 840, 40, { fontFamily: f.accent ?? f.body, fontSize: 18, color: rgba(p.ink, 0.58), align: 'center' }),
      T('01 / 02', 80, 900, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
      S('diamond', 480, 670, 40, 40, { fill: p.accent, name: 'Diamond' }),
    );
    usage.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      T('APPLICATIONS', 80, 80, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      S('rect', 80, 130, 400, 300, { fill: p.ink, name: 'Dark tile' }),
      S('ellipse', 180, 200, 200, 200, { fill: p.accent, name: 'Badge mark' }),
      T(spec.mark, 180, 260, 200, 100, { fontFamily: f.display, fontSize: 74, color: p.deep ?? p.ink, align: 'center' }),
      S('rect', 500, 130, 400, 300, { fill: p.accent, name: 'Light tile' }),
      S('ellipse', 600, 200, 200, 200, { fill: p.ink, name: 'Badge mark' }),
      T(spec.mark, 600, 260, 200, 100, { fontFamily: f.display, fontSize: 74, color: p.bg, align: 'center' }),
      T('02 / 02', 840, 900, 80, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
    );
    return template(spec, LOGO, [page('Primary', bgSolid(p.bg), primary), page('Applications', bgSolid(p.bg), usage)]);
  }

  // stacked
  primary.push(
    S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
    dept('IDENTITY SYSTEM  /  PRIMARY', 80, 80, 420, rgba(p.ink, 0.4), 9),
    dept('2026', 800, 80, 120, rgba(p.ink, 0.4), 9, 'right'),
    T(spec.brand.split(' ')[0] ?? spec.brand, 80, 220, 840, 200, { fontFamily: f.display, fontSize: sizeFor(spec.brand, 120, 70, 8), lineHeight: 0.9, color: p.ink, align: 'center' }),
    T(spec.brand.split(' ').slice(1).join(' ') || 'STUDIO', 80, 460, 840, 80, { fontFamily: f.body, fontSize: 22, letterSpacing: 9, color: p.accent, align: 'center', uppercase: true }),
    hairline(420, 580, 160, rgba(p.ink, 0.3), 1),
    T(spec.tagline, 80, 620, 840, 40, { fontFamily: f.accent ?? f.body, fontSize: 17, color: rgba(p.ink, 0.56), align: 'center' }),
    T(spec.descriptor, 80, 720, 840, 50, { fontFamily: f.body, fontSize: 12, letterSpacing: 2, color: rgba(p.ink, 0.44), align: 'center', uppercase: true }),
    T('01 / 02', 80, 900, 200, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
  );
  usage.push(
    S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
    T('TYPE SYSTEM', 80, 80, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
    T('Aa', 80, 112, 300, 260, { fontFamily: f.display, fontSize: 200, color: p.ink }),
    T(f.display, 80, 380, 400, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.44) }),
    T('Aa', 520, 120, 300, 190, { fontFamily: f.accent ?? f.display, fontSize: 140, color: p.accent }),
    T(f.accent ?? f.body, 520, 320, 400, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.44) }),
    T('02 / 02', 840, 900, 80, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
    T(spec.brand, 80, 850, 400, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.4) }),
  );
  return template(spec, LOGO, [page('Primary', bgSolid(p.bg), primary), page('Type system', bgSolid(p.bg), usage)]);
}

/* ------------------------------------------------------------------ */
/* Certificates                                                        */
/* ------------------------------------------------------------------ */

export type CertificateVariant = 'classic' | 'modern' | 'minimal' | 'award' | 'dark';

export type CertificateSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: CertificateVariant;
  org: string;
  title: string;
  recipient: string;
  body: string;
  date: string;
  signers: [string, string];
  meta?: string;
};

const CERT = { name: 'Certificate', width: 1240, height: 1754 };

export function certificate(spec: CertificateSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'classic') {
    elements.push(
      S('rect', 56, 56, 1128, 1642, { fill: NONE, stroke: p.accent, strokeWidth: 2, name: 'Outer border' }),
      S('rect', 74, 74, 1092, 1606, { fill: NONE, stroke: rgba(p.ink, 0.16), strokeWidth: 1, name: 'Inner border' }),
      T(spec.org, 90, 120, 1060, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 5, color: p.accent, align: 'center', uppercase: true }),
      T(spec.title, 160, 230, 920, 160, { fontFamily: f.display, fontSize: 74, lineHeight: 1.05, color: p.ink, align: 'center' }),
      hairline(500, 390, 240, p.accent, 1),
      T('THIS CERTIFICATE IS PRESENTED TO', 180, 440, 880, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.ink, 0.46), align: 'center' }),
      T(spec.recipient, 120, 500, 1000, 130, { fontFamily: f.display, fontSize: 90, lineHeight: 1.0, color: p.ink, align: 'center' }),
      T(spec.body, 260, 700, 720, 180, { fontFamily: f.accent ?? f.body, fontSize: 20, lineHeight: 1.6, color: rgba(p.ink, 0.62), align: 'center' }),
      S('ellipse', 530, 940, 180, 180, { fill: p.accent, name: 'Seal' }),
      T('SEAL', 530, 1010, 180, 30, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: p.deep ?? p.ink, align: 'center' }),
      hairline(200, 1240, 300, rgba(p.ink, 0.24), 1),
      T(spec.signers[0], 200, 1270, 300, 30, { fontFamily: f.body, fontSize: 13, color: p.ink, align: 'center' }),
      T('DIRECTOR', 200, 1304, 300, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.44), align: 'center' }),
      hairline(740, 1240, 300, rgba(p.ink, 0.24), 1),
      T(spec.signers[1], 740, 1270, 300, 30, { fontFamily: f.body, fontSize: 13, color: p.ink, align: 'center' }),
      T('PROGRAMME LEAD', 740, 1304, 300, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.44), align: 'center' }),
      T(spec.date, 90, 1540, 500, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.44) }),
      T(spec.meta ?? 'CERTIFICATE NO. 0042', 700, 1540, 450, 30, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
    );
    return template(spec, CERT, [page('Certificate', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'modern') {
    elements.push(
      S('rect', 0, 0, 1240, 420, { fill: p.accent, name: 'Header block' }),
      T(spec.org, 80, 80, 700, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 4, color: p.bg, uppercase: true }),
      T(spec.title, 72, 150, 940, 160, { fontFamily: f.display, fontSize: 78, lineHeight: 1.02, color: p.bg }),
      T('CERTIFICATE OF ACHIEVEMENT', 80, 350, 700, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.bg, 0.7) }),
      T('PRESENTED TO', 80, 500, 500, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.ink, 0.44) }),
      T(spec.recipient, 72, 540, 1080, 140, { fontFamily: f.display, fontSize: 78, lineHeight: 1.0, color: p.ink }),
      hairline(72, 710, 1096, rgba(p.ink, 0.2), 1),
      T(spec.body, 72, 750, 760, 140, { fontFamily: f.body, fontSize: 16, lineHeight: 1.65, color: rgba(p.ink, 0.64) }),
      S('rect', 900, 740, 268, 200, { fill: p.bg, stroke: rgba(p.ink, 0.16), strokeWidth: 1, name: 'Detail card' }),
      T('DATE', 924, 768, 220, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
      T(spec.date, 924, 796, 220, 30, { fontFamily: f.body, fontSize: 13, color: p.ink }),
      T('NO.', 924, 844, 220, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
      T(spec.meta ?? '0042', 924, 872, 220, 30, { fontFamily: f.body, fontSize: 13, color: p.ink }),
      hairline(72, 1250, 1096, rgba(p.ink, 0.2), 1),
      T(spec.signers[0], 72, 1290, 300, 30, { fontFamily: f.body, fontSize: 12, color: p.ink }),
      T('PROGRAMME DIRECTOR', 72, 1324, 300, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
      T(spec.signers[1], 760, 1290, 300, 30, { fontFamily: f.body, fontSize: 12, color: p.ink }),
      T('HEAD OF STUDIO', 760, 1324, 300, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
      S('ellipse', 780, 1360, 160, 160, { fill: p.accent, name: 'Seal' }),
      T('SEAL', 780, 1424, 160, 24, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: p.deep ?? p.ink, align: 'center' }),
    );
    return template(spec, CERT, [page('Certificate', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'minimal') {
    elements.push(
      S('rect', 62, 62, 1116, 1630, { fill: NONE, stroke: rgba(p.ink, 0.2), strokeWidth: 1, name: 'Frame' }),
      T(spec.org, 90, 120, 1060, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 4, color: rgba(p.ink, 0.46), align: 'center', uppercase: true }),
      T(spec.title, 180, 300, 880, 140, { fontFamily: f.display, fontSize: 62, lineHeight: 1.08, color: p.ink, align: 'center' }),
      T('AWARDED TO', 180, 470, 880, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: p.accent, align: 'center' }),
      T(spec.recipient, 160, 520, 920, 120, { fontFamily: f.display, fontSize: 84, color: p.ink, align: 'center' }),
      T(spec.body, 260, 720, 720, 180, { fontFamily: f.accent ?? f.body, fontSize: 21, lineHeight: 1.6, color: rgba(p.ink, 0.58), align: 'center' }),
      hairline(500, 980, 240, rgba(p.ink, 0.24), 1),
      T(spec.date, 180, 1020, 880, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.4), align: 'center' }),
      T(spec.signers[0], 300, 1200, 300, 30, { fontFamily: f.body, fontSize: 12, color: p.ink, align: 'center' }),
      T(spec.signers[1], 640, 1200, 300, 30, { fontFamily: f.body, fontSize: 12, color: p.ink, align: 'center' }),
      hairline(300, 1170, 300, rgba(p.ink, 0.2), 1),
      hairline(640, 1170, 300, rgba(p.ink, 0.2), 1),
      T(spec.meta ?? 'NO. 0042', 180, 1580, 880, 24, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'center' }),
    );
    return template(spec, CERT, [page('Certificate', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'award') {
    elements.push(
      S('rect', 48, 48, 1144, 1658, { fill: NONE, stroke: rgba(p.accent, 0.5), strokeWidth: 1, name: 'Frame' }),
      S('rect', 64, 64, 1112, 1626, { fill: NONE, stroke: rgba(p.accent, 0.2), strokeWidth: 1, name: 'Inner frame' }),
      T(spec.org, 90, 120, 1060, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 5, color: p.accent, align: 'center', uppercase: true }),
      T(spec.title, 140, 250, 960, 180, { fontFamily: f.display, fontSize: 84, lineHeight: 1.02, color: p.bg, align: 'center' }),
      S('ellipse', 480, 470, 280, 280, { fill: p.accent, name: 'Award seal' }),
      T('AWARD', 480, 570, 280, 50, { fontFamily: f.body, fontSize: 14, letterSpacing: 4, color: p.deep ?? p.ink, align: 'center' }),
      T(spec.recipient, 120, 820, 1000, 130, { fontFamily: f.display, fontSize: 86, color: p.bg, align: 'center' }),
      T(spec.body, 260, 990, 720, 150, { fontFamily: f.accent ?? f.body, fontSize: 20, lineHeight: 1.6, color: rgba(p.bg, 0.64), align: 'center' }),
      hairline(200, 1260, 300, rgba(p.bg, 0.24), 1),
      T(spec.signers[0], 200, 1290, 300, 30, { fontFamily: f.body, fontSize: 12, color: p.bg, align: 'center' }),
      T('JURY CHAIR', 200, 1324, 300, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.4), align: 'center' }),
      hairline(740, 1260, 300, rgba(p.bg, 0.24), 1),
      T(spec.signers[1], 740, 1290, 300, 30, { fontFamily: f.body, fontSize: 12, color: p.bg, align: 'center' }),
      T('DIRECTOR', 740, 1324, 300, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.4), align: 'center' }),
      T(spec.date, 90, 1540, 500, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.bg, 0.4) }),
      T(spec.meta ?? 'NO. 0042', 700, 1540, 450, 30, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.bg, 0.3), align: 'right' }),
    );
    return template(spec, CERT, [page('Certificate', bgSolid(p.deep ?? p.ink), elements)]);
  }

  // dark
  elements.push(
    S('rect', 42, 42, 1156, 1670, { fill: NONE, stroke: rgba(p.accent, 0.36), strokeWidth: 1, name: 'Frame' }),
    T(spec.org, 90, 110, 1060, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 5, color: p.accent, align: 'center', uppercase: true }),
    T(spec.title, 140, 220, 960, 180, { fontFamily: f.display, fontSize: 82, lineHeight: 1.04, color: p.bg, align: 'center' }),
    T('PRESENTED TO', 180, 430, 880, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.bg, 0.4), align: 'center' }),
    T(spec.recipient, 120, 480, 1000, 140, { fontFamily: f.display, fontSize: 96, color: p.bg, align: 'center' }),
    T(spec.body, 260, 700, 720, 160, { fontFamily: f.accent ?? f.body, fontSize: 20, lineHeight: 1.6, color: rgba(p.bg, 0.6), align: 'center' }),
    S('rect', 500, 930, 240, 2, { fill: p.accent, name: 'Accent rule' }),
    T(spec.date, 180, 980, 880, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.bg, 0.44), align: 'center' }),
    T(spec.signers[0], 260, 1160, 320, 30, { fontFamily: f.body, fontSize: 12, color: p.bg, align: 'center' }),
    T(spec.signers[1], 660, 1160, 320, 30, { fontFamily: f.body, fontSize: 12, color: p.bg, align: 'center' }),
    hairline(260, 1130, 320, rgba(p.bg, 0.2), 1),
    hairline(660, 1130, 320, rgba(p.bg, 0.2), 1),
    T('NO. 0042', 180, 1580, 880, 24, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.3), align: 'center' }),
    S('ellipse', 1000, 1380, 120, 120, { fill: p.accent, name: 'Seal' }),
  );
  return template(spec, CERT, [page('Certificate', bgSolid(p.deep ?? p.ink), elements)]);
}

type TemplateSpecResult = import('../types').Template;
