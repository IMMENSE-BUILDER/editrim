import type { El } from '../types';
import {
  FONTS, G, IC, IMG, NONE, P, PHOTOS, S, T,
  bgImage, bgSolid, page,
} from '../templateKit';
import {
  Palette, TemplateMeta, TypePair, barcode, dept, hairline, rgba, sizeFor, template,
} from './kitShared';

/* ------------------------------------------------------------------ */
/* Book covers                                                         */
/* ------------------------------------------------------------------ */

export type BookVariant = 'photo' | 'type' | 'abstract' | 'duotone' | 'minimal' | 'illustrated';

export type BookSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: BookVariant;
  image?: string;
  title: string;
  author: string;
  publisher: string;
  series?: string;
  endorsement?: string;
};

const BOOK = { name: 'Book Cover', width: 1600, height: 2400 };

export function bookCover(spec: BookSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'photo') {
    const background = bgImage(spec.image ?? PHOTOS.fogHills, p.deep ?? p.ink, 0.38);
    elements.push(
      S('rect', 0, 0, 1600, 700, { fill: G(rgba(p.ink, 0.84), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 1760, 1600, 640, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.92), 0), name: 'Bottom shade' }),
      T(spec.series ?? 'A NOVEL', 120, 100, 700, 26, { fontFamily: f.body, fontSize: 13, letterSpacing: 4, color: rgba(p.bg, 0.66), uppercase: true }),
      T(spec.title, 100, 230, 1400, 500, { fontFamily: f.display, fontSize: sizeFor(spec.title, 176, 96, 12), lineHeight: 0.9, letterSpacing: -5, color: p.bg }),
      T(spec.endorsement ?? '', 120, 1830, 800, 110, { fontFamily: f.accent ?? f.body, fontSize: 26, lineHeight: 1.4, color: rgba(p.bg, 0.72) }),
      T(spec.author, 120, 2150, 900, 60, { fontFamily: f.body, fontSize: 26, letterSpacing: 4, color: p.bg, uppercase: true }),
      T(spec.publisher, 120, 2250, 500, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.bg, 0.44) }),
      S('rect', 1320, 2190, 160, 4, { fill: p.accent, name: 'Publisher mark' }),
      ...barcode(1300, 2240, 180, 60, rgba(p.bg, 0.7), 14),
    );
    return template(spec, BOOK, [page('Cover', background, elements)]);
  }

  if (spec.variant === 'type') {
    elements.push(
      S('rect', 0, 0, 1600, 2400, { fill: p.bg, name: 'Cover field' }),
      dept(spec.series ?? 'A NOVEL', 120, 100, 600, rgba(p.ink, 0.44), 11),
      T(spec.title, 96, 250, 1408, 900, { fontFamily: f.display, fontSize: sizeFor(spec.title, 230, 120, 8), lineHeight: 0.84, letterSpacing: -8, color: p.ink, fontWeight: 700, uppercase: true }),
      S('rect', 100, 1290, 360, 6, { fill: p.accent, name: 'Accent rule' }),
      T(spec.author, 100, 1380, 900, 80, { fontFamily: f.body, fontSize: 34, letterSpacing: 4, color: p.ink, uppercase: true }),
      T(spec.endorsement ?? '', 100, 1580, 780, 120, { fontFamily: f.accent ?? f.body, fontSize: 26, lineHeight: 1.45, color: rgba(p.ink, 0.62) }),
      T(spec.publisher, 100, 2200, 500, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 3, color: rgba(p.ink, 0.44) }),
      S('ellipse', 1180, 1800, 300, 300, { fill: p.accent, name: 'Orb' }),
      S('ring', 1210, 1830, 240, 240, { fill: NONE, stroke: p.ink, strokeWidth: 1, name: 'Orbit' }),
      ...barcode(1280, 2220, 200, 70, rgba(p.ink, 0.6), 14),
    );
    return template(spec, BOOK, [page('Cover', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'abstract') {
    elements.push(
      S('rect', 0, 0, 1600, 2400, { fill: p.deep ?? p.ink, name: 'Cover field' }),
      S('ellipse', 760, 0, 840, 840, { fill: p.accent, name: 'Orb A' }),
      S('ellipse', 0, 920, 640, 640, { fill: p.soft ?? p.accent, opacity: 0.7, name: 'Orb B' }),
      S('rect', 980, 1180, 440, 440, { fill: p.bg, rotation: 18, opacity: 0.1, name: 'Square' }),
      T(spec.series ?? 'A NOVEL', 120, 100, 600, 26, { fontFamily: f.body, fontSize: 13, letterSpacing: 4, color: rgba(p.bg, 0.56), uppercase: true }),
      T(spec.title, 100, 300, 1400, 600, { fontFamily: f.display, fontSize: sizeFor(spec.title, 184, 100, 10), lineHeight: 0.9, letterSpacing: -5, color: p.bg }),
      T(spec.author, 120, 1740, 900, 70, { fontFamily: f.body, fontSize: 30, letterSpacing: 4, color: p.bg, uppercase: true }),
      T(spec.endorsement ?? '', 120, 1860, 780, 100, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.4, color: rgba(p.bg, 0.6) }),
      T(spec.publisher, 120, 2200, 500, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.bg, 0.4) }),
      S('diamond', 1240, 2180, 120, 120, { fill: p.accent, name: 'Mark' }),
    );
    return template(spec, BOOK, [page('Cover', bgSolid(p.deep ?? p.ink), elements)]);
  }

  if (spec.variant === 'duotone') {
    const background = bgImage(spec.image ?? PHOTOS.portrait, p.accent, 0.48);
    elements.push(
      S('rect', 0, 0, 1600, 2400, { fill: rgba(p.ink, 0.18), name: 'Duotone wash' }),
      T(spec.series ?? 'A NOVEL', 120, 100, 600, 26, { fontFamily: f.body, fontSize: 13, letterSpacing: 4, color: rgba(p.bg, 0.72), uppercase: true }),
      T(spec.title, 100, 260, 1400, 700, { fontFamily: f.display, fontSize: sizeFor(spec.title, 190, 100, 10), lineHeight: 0.88, letterSpacing: -5, color: p.bg }),
      S('rect', 100, 1780, 1400, 2, { fill: rgba(p.bg, 0.5), name: 'Rule' }),
      T(spec.author, 100, 1840, 900, 70, { fontFamily: f.body, fontSize: 30, letterSpacing: 4, color: p.bg, uppercase: true }),
      T(spec.endorsement ?? '', 100, 1960, 780, 100, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.4, color: rgba(p.bg, 0.7) }),
      T(spec.publisher, 100, 2210, 500, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.bg, 0.5) }),
      S('rect', 1300, 2200, 180, 4, { fill: p.bg, name: 'Publisher mark' }),
      ...barcode(1300, 2240, 180, 60, rgba(p.bg, 0.65), 14),
    );
    return template(spec, BOOK, [page('Cover', background, elements)]);
  }

  if (spec.variant === 'minimal') {
    elements.push(
      S('rect', 70, 70, 1460, 2260, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Frame' }),
      dept(spec.series ?? 'A NOVEL', 540, 130, 520, rgba(p.ink, 0.42), 10),
      T(spec.title, 200, 380, 1200, 400, { fontFamily: f.display, fontSize: sizeFor(spec.title, 110, 64, 14), lineHeight: 1.06, letterSpacing: -2, color: p.ink, align: 'center' }),
      hairline(720, 850, 160, p.accent, 1, ),
      T(spec.author, 200, 940, 1200, 50, { fontFamily: f.body, fontSize: 20, letterSpacing: 5, color: p.ink, align: 'center', uppercase: true }),
      T(spec.endorsement ?? '', 300, 1420, 1000, 120, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.5, color: rgba(p.ink, 0.5), align: 'center' }),
      T(spec.publisher, 200, 2200, 1200, 28, { fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.ink, 0.36), align: 'center' }),
      S('diamond', 780, 1100, 40, 40, { fill: p.accent, name: 'Ornament' }),
      T('01', 1420, 2270, 80, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.26), align: 'right' }),
    );
    return template(spec, BOOK, [page('Cover', bgSolid(p.bg), elements)]);
  }

  // illustrated
  elements.push(
    S('rect', 0, 0, 1600, 2400, { fill: p.bg, name: 'Cover field' }),
    S('rect', 120, 210, 1360, 1020, { fill: p.soft ?? p.accent, name: 'Illustration field' }),
    S('ellipse', 340, 380, 420, 420, { fill: p.accent, name: 'Sun' }),
    S('wave', 120, 840, 1360, 390, { fill: p.ink, name: 'Hill' }),
    S('wave', 120, 1000, 1360, 230, { fill: p.deep ?? p.ink, opacity: 0.7, name: 'Hill fore' }),
    T(spec.series ?? 'A NOVEL', 120, 120, 600, 26, { fontFamily: f.body, fontSize: 13, letterSpacing: 4, color: rgba(p.ink, 0.46), uppercase: true }),
    T(spec.title, 110, 1280, 1380, 500, { fontFamily: f.display, fontSize: sizeFor(spec.title, 156, 88, 11), lineHeight: 0.92, letterSpacing: -4, color: p.ink }),
    T(spec.author, 120, 1880, 900, 70, { fontFamily: f.body, fontSize: 30, letterSpacing: 4, color: p.ink, uppercase: true }),
    T(spec.endorsement ?? '', 120, 1990, 780, 100, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.4, color: rgba(p.ink, 0.6) }),
    T(spec.publisher, 120, 2210, 500, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.4) }),
    ...barcode(1300, 2240, 180, 60, rgba(p.ink, 0.55), 14),
  );
  return template(spec, BOOK, [page('Cover', bgSolid(p.bg), elements)]);
}

/* ------------------------------------------------------------------ */
/* Album covers                                                        */
/* ------------------------------------------------------------------ */

export type AlbumVariant = 'photo' | 'abstract' | 'type' | 'collage' | 'minimal' | 'duotone';

export type AlbumSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: AlbumVariant;
  image?: string;
  image2?: string;
  image3?: string;
  artist: string;
  title: string;
  label: string;
  year: string;
  tracks?: string[];
};

const ALBUM = { name: 'Album Cover', width: 1400, height: 1400 };

export function albumCover(spec: AlbumSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'photo') {
    const background = bgImage(spec.image ?? PHOTOS.concertCrowd, p.deep ?? p.ink, 0.36);
    elements.push(
      S('rect', 0, 0, 1400, 380, { fill: G(rgba(p.ink, 0.76), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 1000, 1400, 400, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.9), 0), name: 'Bottom shade' }),
      dept(spec.label, 72, 64, 600, rgba(p.bg, 0.58), 9),
      T(spec.artist, 64, 220, 900, 180, { fontFamily: f.display, fontSize: sizeFor(spec.artist, 106, 60, 12), lineHeight: 0.9, letterSpacing: -3, color: p.bg, uppercase: true }),
      T(spec.title, 64, 1020, 1000, 180, { fontFamily: f.display, fontSize: sizeFor(spec.title, 100, 56, 12), lineHeight: 0.94, letterSpacing: -2, color: p.bg }),
      T(spec.year, 1080, 1290, 248, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: rgba(p.bg, 0.5), align: 'right' }),
      ...(spec.tracks ?? []).slice(0, 3).map((track, i) =>
        T(track, 64, 1230 + i * 26, 700, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 1.6, color: rgba(p.bg, 0.54) }),
      ),
      T('01', 64, 1320, 100, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.35) }),
    );
    return template(spec, ALBUM, [page('Cover', background, elements)]);
  }

  if (spec.variant === 'abstract') {
    elements.push(
      S('rect', 0, 0, 1400, 1400, { fill: p.deep ?? p.ink, name: 'Field' }),
      S('ellipse', 620, 0, 760, 760, { fill: p.accent, name: 'Orb A' }),
      S('ring', 280, 460, 660, 660, { fill: NONE, stroke: rgba(p.bg, 0.3), strokeWidth: 2, name: 'Orbit' }),
      S('diamond', 900, 760, 300, 300, { fill: p.bg, opacity: 0.12, name: 'Diamond' }),
      dept(spec.label, 64, 60, 500, rgba(p.bg, 0.5), 9),
      T(spec.artist, 64, 160, 800, 160, { fontFamily: f.display, fontSize: sizeFor(spec.artist, 96, 54, 11), lineHeight: 0.9, letterSpacing: -3, color: p.bg, uppercase: true }),
      T(spec.title, 64, 980, 900, 160, { fontFamily: f.display, fontSize: sizeFor(spec.title, 82, 48, 14), lineHeight: 1.0, letterSpacing: -2, color: p.bg }),
      T(spec.year, 1080, 1280, 248, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: rgba(p.bg, 0.4), align: 'right' }),
      T('33 RPM', 64, 1290, 300, 22, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.36) }),
      S('star', 1180, 120, 60, 60, { fill: p.accent, name: 'Star' }),
    );
    return template(spec, ALBUM, [page('Cover', bgSolid(p.deep ?? p.ink), elements)]);
  }

  if (spec.variant === 'type') {
    elements.push(
      S('rect', 0, 0, 1400, 1400, { fill: p.accent, name: 'Field' }),
      dept(spec.label, 64, 60, 500, rgba(p.deep ?? p.ink, 0.56), 9),
      T(spec.artist, 48, 150, 1304, 240, { fontFamily: f.display, fontSize: sizeFor(spec.artist, 150, 76, 9), lineHeight: 0.86, letterSpacing: -6, color: p.deep ?? p.ink, fontWeight: 700, uppercase: true }),
      T(spec.title, 48, 500, 1304, 260, { fontFamily: f.display, fontSize: sizeFor(spec.title, 132, 68, 10), lineHeight: 0.88, letterSpacing: -5, color: p.deep ?? p.ink, fontWeight: 700, uppercase: true }),
      hairline(64, 850, 1272, rgba(p.deep ?? p.ink, 0.3), 2),
      T(spec.year, 64, 900, 300, 30, { fontFamily: f.body, fontSize: 12, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.6) }),
      T('LIMITED EDITION', 900, 900, 436, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.5), align: 'right' }),
      ...(spec.tracks ?? []).slice(0, 4).map((track, i) =>
        T(track, 64, 1000 + i * 26, 700, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 1.4, color: rgba(p.deep ?? p.ink, 0.58) }),
      ),
      S('ellipse', 1080, 1060, 240, 240, { fill: p.bg, name: 'Orb' }),
      T('01', 64, 1300, 100, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.36) }),
    );
    return template(spec, ALBUM, [page('Cover', bgSolid(p.accent), elements)]);
  }

  if (spec.variant === 'collage') {
    elements.push(
      S('rect', 0, 0, 1400, 1400, { fill: p.bg, name: 'Field' }),
      S('rect', 64, 120, 520, 520, { fill: p.soft ?? p.accent, rotation: -4, name: 'Backer A' }),
      IMG(spec.image ?? PHOTOS.concert3, 80, 136, 480, 480, { rotation: -4, name: 'Photo A' }),
      S('rect', 600, 80, 440, 440, { fill: p.accent, rotation: 5, name: 'Backer B' }),
      IMG(spec.image2 ?? PHOTOS.dj, 612, 96, 416, 416, { rotation: 5, name: 'Photo B' }),
      S('rect', 1040, 220, 300, 380, { fill: p.soft ?? p.accent, rotation: -2, name: 'Backer C' }),
      IMG(spec.image3 ?? PHOTOS.audio, 1052, 232, 276, 356, { rotation: -2, name: 'Photo C' }),
      dept(spec.label, 64, 64, 400, rgba(p.ink, 0.5), 9),
      T(spec.artist, 64, 800, 900, 120, { fontFamily: f.display, fontSize: sizeFor(spec.artist, 82, 48, 12), lineHeight: 0.92, letterSpacing: -2, color: p.ink, uppercase: true }),
      T(spec.title, 64, 940, 900, 100, { fontFamily: f.display, fontSize: sizeFor(spec.title, 64, 40, 14), lineHeight: 1.0, color: p.ink }),
      T(spec.year, 1100, 1300, 236, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.4), align: 'right' }),
      T('01 / 02', 64, 1300, 100, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.34) }),
    );
    return template(spec, ALBUM, [page('Cover', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'minimal') {
    elements.push(
      S('rect', 56, 56, 1288, 1288, { fill: NONE, stroke: rgba(p.ink, 0.16), strokeWidth: 1, name: 'Frame' }),
      dept(spec.label, 520, 100, 360, rgba(p.ink, 0.42), 9),
      T(spec.artist, 160, 400, 1080, 80, { fontFamily: f.display, fontSize: 54, letterSpacing: 4, color: p.ink, align: 'center', uppercase: true }),
      T(spec.title, 160, 560, 1080, 300, { fontFamily: f.display, fontSize: sizeFor(spec.title, 120, 64, 12), lineHeight: 1.0, letterSpacing: -2, color: p.ink, align: 'center' }),
      hairline(640, 930, 120, p.accent, 1),
      T(spec.year, 160, 990, 1080, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.4), align: 'center' }),
      T('A SIDE  /  B SIDE', 160, 1220, 1080, 24, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.3), align: 'center' }),
      S('diamond', 670, 1080, 60, 60, { fill: p.accent, name: 'Ornament' }),
      T('01', 1280, 1280, 60, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.26), align: 'right' }),
    );
    return template(spec, ALBUM, [page('Cover', bgSolid(p.bg), elements)]);
  }

  const background = bgImage(spec.image ?? PHOTOS.portrait, p.accent, 0.46);
  elements.push(
    S('rect', 0, 0, 1400, 1400, { fill: rgba(p.ink, 0.12), name: 'Duotone wash' }),
    dept(spec.label, 64, 60, 500, rgba(p.bg, 0.6), 9),
    T(spec.artist, 64, 160, 900, 180, { fontFamily: f.display, fontSize: sizeFor(spec.artist, 112, 60, 10), lineHeight: 0.9, letterSpacing: -4, color: p.bg, uppercase: true }),
    T(spec.title, 64, 1040, 1000, 180, { fontFamily: f.display, fontSize: sizeFor(spec.title, 92, 52, 13), lineHeight: 0.96, letterSpacing: -2, color: p.bg }),
    hairline(64, 1270, 800, rgba(p.bg, 0.4), 1),
    T(spec.year, 1100, 1270, 236, 30, { fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: rgba(p.bg, 0.5), align: 'right' }),
    T('STEREO', 64, 1310, 300, 22, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.4) }),
    S('rect', 1260, 60, 80, 80, { fill: p.bg, name: 'Mark' }),
  );
  return template(spec, ALBUM, [page('Cover', background, elements)]);
}

/* ------------------------------------------------------------------ */
/* Magazines                                                           */
/* ------------------------------------------------------------------ */

export type MagazineVariant = 'photo' | 'type' | 'split' | 'brutal' | 'quiet' | 'illustrated';

export type MagazineSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: MagazineVariant;
  image?: string;
  title: string;
  issue: string;
  price: string;
  date: string;
  coverLines: string[];
};

const MAG = { name: 'Magazine Cover', width: 1240, height: 1754 };

export function magazine(spec: MagazineSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'photo') {
    const background = bgImage(spec.image ?? PHOTOS.fashionModel, p.deep ?? p.ink, 0.28);
    elements.push(
      S('rect', 0, 0, 1240, 420, { fill: G(rgba(p.ink, 0.72), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 1300, 1240, 454, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.9), 0), name: 'Bottom shade' }),
      T(spec.title, 64, 60, 900, 120, { fontFamily: f.display, fontSize: 96, lineHeight: 0.9, letterSpacing: -2, color: p.bg, uppercase: true }),
      dept(spec.issue, 64, 190, 600, p.accent, 10),
      dept(spec.price, 900, 190, 276, rgba(p.bg, 0.6), 9, 'right'),
      ...spec.coverLines.slice(0, 3).map((line, i) =>
        T(line, 64, 1080 + i * 50, 760, 44, { fontFamily: f.body, fontSize: 20, letterSpacing: 1.4, color: p.bg }),
      ),
      T(spec.date, 64, 1640, 600, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.bg, 0.5) }),
      ...barcode(880, 1620, 276, 60, rgba(p.bg, 0.6), 18),
    );
    return template(spec, MAG, [page('Cover', background, elements)]);
  }

  if (spec.variant === 'type') {
    elements.push(
      T(spec.title, 48, 60, 1144, 180, { fontFamily: f.display, fontSize: sizeFor(spec.title, 180, 96, 8), lineHeight: 0.84, letterSpacing: -7, color: p.ink, fontWeight: 700, uppercase: true }),
      dept(spec.issue, 64, 260, 600, p.accent, 10),
      dept(spec.price, 900, 260, 276, rgba(p.ink, 0.44), 9, 'right'),
      hairline(64, 320, 1112, rgba(p.ink, 0.3), 2),
      ...spec.coverLines.slice(0, 4).map((line, i) =>
        T(line, 64, 360 + i * 64, 1100, 54, { fontFamily: f.body, fontSize: 26, letterSpacing: 0.4, color: rgba(p.ink, 0.7) }),
      ),
      IMG(spec.image ?? PHOTOS.art2, 64, 700, 1112, 760, { name: 'Cover image' }),
      T(spec.date, 64, 1520, 600, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.44) }),
      T('ISSUE ' + spec.issue, 900, 1520, 276, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.44), align: 'right' }),
      ...barcode(900, 1600, 276, 60, rgba(p.ink, 0.55), 18),
    );
    return template(spec, MAG, [page('Cover', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'split') {
    elements.push(
      S('rect', 0, 0, 1240, 860, { fill: p.accent, name: 'Top field' }),
      IMG(spec.image ?? PHOTOS.womanPortrait3, 0, 860, 1240, 894, { name: 'Bottom image' }),
      T(spec.title, 48, 50, 900, 160, { fontFamily: f.display, fontSize: sizeFor(spec.title, 140, 72, 8), lineHeight: 0.86, letterSpacing: -5, color: p.bg, uppercase: true }),
      dept(spec.issue, 64, 220, 600, rgba(p.bg, 0.66), 10),
      dept(spec.price, 900, 220, 276, rgba(p.bg, 0.5), 9, 'right'),
      ...spec.coverLines.slice(0, 2).map((line, i) =>
        T(line, 64, 340 + i * 62, 1000, 54, { fontFamily: f.body, fontSize: 24, letterSpacing: 0.4, color: p.bg }),
      ),
      S('rect', 0, 860, 1240, 894, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.7), 0), name: 'Image shade' }),
      T(spec.coverLines[2] ?? 'The new avant-garde', 64, 1500, 800, 80, { fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.3, color: p.bg }),
      T(spec.date, 64, 1640, 600, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.bg, 0.5) }),
      ...barcode(880, 1620, 276, 60, rgba(p.bg, 0.6), 18),
    );
    return template(spec, MAG, [page('Cover', bgSolid(p.bg), elements)]);
  }

  if (spec.variant === 'brutal') {
    elements.push(
      S('rect', 0, 0, 1240, 1754, { fill: p.ink, name: 'Field' }),
      T(spec.title, 40, 50, 1160, 300, { fontFamily: f.display, fontSize: sizeFor(spec.title, 220, 110, 7), lineHeight: 0.8, letterSpacing: -8, color: p.accent, uppercase: true }),
      dept(spec.issue, 64, 330, 600, p.bg, 11),
      dept(spec.price, 900, 330, 276, rgba(p.bg, 0.5), 9, 'right'),
      hairline(64, 380, 1112, rgba(p.bg, 0.3), 2),
      ...spec.coverLines.slice(0, 3).map((line, i) =>
        T(line, 64, 420 + i * 56, 1000, 48, { fontFamily: f.body, fontSize: 22, letterSpacing: 1, color: rgba(p.bg, 0.72) }),
      ),
      IMG(spec.image ?? PHOTOS.cyber, 64, 660, 1112, 720, { name: 'Cover image', filters: { brightness: 84, contrast: 120, saturate: 70, blur: 0, grayscale: 20, sepia: 0, hue: 0 } }),
      T(spec.date, 64, 1530, 600, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.bg, 0.4) }),
      T('READ THE FUTURE', 900, 1530, 276, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: p.accent, align: 'right' }),
      S('rect', 64, 1600, 1112, 2, { fill: p.accent, name: 'Rule' }),
      ...barcode(900, 1620, 276, 60, rgba(p.bg, 0.5), 18),
    );
    return template(spec, MAG, [page('Cover', bgSolid(p.ink), elements)]);
  }

  if (spec.variant === 'quiet') {
    elements.push(
      S('rect', 56, 56, 1128, 1642, { fill: NONE, stroke: rgba(p.ink, 0.14), strokeWidth: 1, name: 'Frame' }),
      T(spec.title, 160, 80, 920, 100, { fontFamily: f.display, fontSize: 74, lineHeight: 1.0, color: p.ink, align: 'center' }),
      dept(spec.issue, 160, 190, 920, rgba(p.ink, 0.4), 9),
      IMG(spec.image ?? PHOTOS.interior5, 180, 260, 880, 880, { name: 'Cover image', radius: 0 }),
      T(spec.coverLines[0] ?? '', 180, 1210, 880, 60, { fontFamily: f.accent ?? f.body, fontSize: 26, lineHeight: 1.35, color: p.ink, align: 'center' }),
      hairline(560, 1320, 120, p.accent, 1),
      T(spec.coverLines[1] ?? '', 240, 1370, 760, 60, { fontFamily: f.body, fontSize: 16, lineHeight: 1.5, color: rgba(p.ink, 0.58), align: 'center' }),
      T(spec.price, 180, 1540, 400, 26, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
      T(spec.date, 660, 1540, 400, 26, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.4), align: 'right' }),
      ...barcode(840, 1600, 240, 54, rgba(p.ink, 0.45), 16),
    );
    return template(spec, MAG, [page('Cover', bgSolid(p.bg), elements)]);
  }

  elements.push(
    S('rect', 0, 0, 1240, 1754, { fill: p.bg, name: 'Field' }),
    T(spec.title, 48, 50, 1144, 160, { fontFamily: f.display, fontSize: sizeFor(spec.title, 158, 82, 8), lineHeight: 0.86, letterSpacing: -6, color: p.ink, uppercase: true }),
    dept(spec.issue, 64, 230, 600, p.accent, 10),
    dept(spec.price, 900, 230, 276, rgba(p.ink, 0.44), 9, 'right'),
    S('rect', 64, 300, 1112, 820, { fill: p.soft ?? p.accent, name: 'Illustration field' }),
    S('ellipse', 280, 420, 420, 420, { fill: p.accent, name: 'Sun' }),
    S('wave', 64, 760, 1112, 360, { fill: p.ink, name: 'Hill' }),
    S('wave', 64, 900, 1112, 220, { fill: p.deep ?? p.ink, opacity: 0.65, name: 'Hill fore' }),
    ...spec.coverLines.slice(0, 3).map((line, i) =>
      T(line, 64, 1200 + i * 54, 1100, 46, { fontFamily: f.body, fontSize: 21, letterSpacing: 0.6, color: p.ink }),
    ),
    T(spec.date, 64, 1520, 600, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
    T('ILLUSTRATED ISSUE', 900, 1520, 276, 26, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: p.accent, align: 'right' }),
    ...barcode(900, 1600, 276, 60, rgba(p.ink, 0.5), 18),
  );
  return template(spec, MAG, [page('Cover', bgSolid(p.bg), elements)]);
}

/* ------------------------------------------------------------------ */
/* Editorial                                                           */
/* ------------------------------------------------------------------ */

export type EditorialVariant = 'feature' | 'photoEssay' | 'interview' | 'recipe' | 'travel' | 'opinion' | 'review' | 'portfolio' | 'newspaper';

export type EditorialSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: EditorialVariant;
  image?: string;
  image2?: string;
  publication: string;
  issue: string;
  section: string;
  title: string;
  deck: string;
  byline: string;
  body: string;
  items?: string[];
  meta?: string;
  twoPages?: boolean;
};

const EDIT = { name: 'Editorial', width: 1240, height: 1754 };

export function editorial(spec: EditorialSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];
  const background = bgSolid(p.bg);

  const masthead = (color = p.ink, accent = p.accent) => [
    T(spec.publication, 72, 56, 600, 40, { fontFamily: f.display, fontSize: 22, letterSpacing: 4, color, uppercase: true }),
    dept(spec.issue, 760, 64, 416, rgba(color, 0.44), 9, 'right'),
    hairline(72, 104, 1096, rgba(color, 0.28), 1),
  ];

  if (spec.variant === 'feature') {
    elements.push(
      ...masthead(),
      dept(spec.section, 72, 130, 600, p.accent, 10),
      T(spec.title, 64, 170, 1112, 260, { fontFamily: f.display, fontSize: sizeFor(spec.title, 92, 54, 12), lineHeight: 1.0, letterSpacing: -2.4, color: p.ink }),
      T(spec.deck, 72, 450, 760, 100, { fontFamily: f.accent ?? f.body, fontSize: 26, lineHeight: 1.45, color: rgba(p.ink, 0.66) }),
      T(spec.byline, 72, 570, 500, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.44), uppercase: true }),
      IMG(spec.image ?? PHOTOS.gallery2, 72, 620, 1096, 620, { name: 'Feature image' }),
      T(spec.body, 72, 1280, 560, 300, { fontFamily: f.body, fontSize: 16, lineHeight: 1.7, color: rgba(p.ink, 0.7) }),
      T(spec.body, 652, 1280, 516, 300, { fontFamily: f.body, fontSize: 16, lineHeight: 1.7, color: rgba(p.ink, 0.7) }),
      hairline(72, 1600, 1096, rgba(p.ink, 0.2), 1),
      dept(spec.meta ?? 'CONTINUED ON PAGE 42', 72, 1630, 700, rgba(p.ink, 0.4), 8),
      T('01', 1080, 1630, 88, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
    );
    return template(spec, EDIT, [page('Feature', background, elements)]);
  }

  if (spec.variant === 'photoEssay') {
    const bg = bgImage(spec.image ?? PHOTOS.desert, p.deep ?? p.ink, 0.24);
    elements.push(
      S('rect', 0, 0, 1240, 380, { fill: G(rgba(p.ink, 0.7), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 1400, 1240, 354, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.9), 0), name: 'Bottom shade' }),
      dept(spec.publication, 72, 56, 600, p.bg, 10),
      dept(spec.issue, 760, 56, 416, rgba(p.bg, 0.56), 9, 'right'),
      T(spec.title, 64, 130, 1000, 300, { fontFamily: f.display, fontSize: sizeFor(spec.title, 82, 50, 12), lineHeight: 0.96, letterSpacing: -2, color: p.bg }),
      T(spec.deck, 72, 1450, 760, 90, { fontFamily: f.accent ?? f.body, fontSize: 26, lineHeight: 1.4, color: rgba(p.bg, 0.8) }),
      T(spec.byline, 72, 1580, 500, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.bg, 0.5), uppercase: true }),
      T(spec.body, 72, 1640, 800, 70, { fontFamily: f.body, fontSize: 14, lineHeight: 1.5, color: rgba(p.bg, 0.6) }),
      S('rect', 900, 1520, 268, 80, { fill: p.accent, name: 'Caption field' }),
      T(spec.meta ?? 'PLATE 01', 920, 1544, 228, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: p.deep ?? p.ink }),
      T('02', 1080, 1680, 88, 22, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.4), align: 'right' }),
    );
    return template(spec, EDIT, [page('Photo essay', bg, elements)]);
  }

  if (spec.variant === 'interview') {
    elements.push(
      ...masthead(),
      dept(spec.section, 72, 130, 600, p.accent, 10),
      T(spec.title, 64, 170, 780, 260, { fontFamily: f.display, fontSize: sizeFor(spec.title, 58, 38, 12), lineHeight: 1.0, letterSpacing: -2, color: p.ink }),
      IMG(spec.image ?? PHOTOS.manPortrait3, 820, 160, 348, 420, { name: 'Portrait' }),
      T(spec.deck, 72, 420, 700, 90, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.45, color: rgba(p.ink, 0.64) }),
      T(spec.byline, 72, 530, 500, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.44), uppercase: true }),
      hairline(72, 600, 1096, rgba(p.ink, 0.2), 1),
      T('Q.', 72, 640, 60, 30, { fontFamily: f.display, fontSize: 28, color: p.accent }),
      T(spec.items?.[0] ?? 'What does a good day look like?', 130, 640, 1000, 60, { fontFamily: f.body, fontSize: 20, lineHeight: 1.5, color: p.ink }),
      T('A.', 72, 740, 60, 30, { fontFamily: f.display, fontSize: 28, color: p.accent }),
      T(spec.body, 130, 740, 1000, 240, { fontFamily: f.body, fontSize: 16, lineHeight: 1.7, color: rgba(p.ink, 0.7) }),
      T('Q.', 72, 1040, 60, 30, { fontFamily: f.display, fontSize: 28, color: p.accent }),
      T(spec.items?.[1] ?? 'And what gets in the way?', 130, 1040, 1000, 60, { fontFamily: f.body, fontSize: 20, lineHeight: 1.5, color: p.ink }),
      T('A.', 72, 1140, 60, 30, { fontFamily: f.display, fontSize: 28, color: p.accent }),
      T(spec.items?.[2] ?? spec.body, 130, 1140, 1000, 260, { fontFamily: f.body, fontSize: 16, lineHeight: 1.7, color: rgba(p.ink, 0.7) }),
      hairline(72, 1500, 1096, rgba(p.ink, 0.2), 1),
      dept(spec.meta ?? 'INTERVIEW  /  ISSUE 14', 72, 1530, 700, rgba(p.ink, 0.4), 8),
    );
    return template(spec, EDIT, [page('Interview', background, elements)]);
  }

  if (spec.variant === 'recipe') {
    elements.push(
      ...masthead(),
      dept(spec.section, 72, 130, 600, p.accent, 10),
      T(spec.title, 64, 170, 800, 260, { fontFamily: f.display, fontSize: sizeFor(spec.title, 58, 38, 13), lineHeight: 1.0, letterSpacing: -2, color: p.ink }),
      T(spec.deck, 72, 410, 700, 80, { fontFamily: f.accent ?? f.body, fontSize: 23, lineHeight: 1.4, color: rgba(p.ink, 0.64) }),
      IMG(spec.image ?? PHOTOS.food, 72, 520, 1096, 620, { name: 'Recipe image' }),
      T('SERVES 4  /  35 MINUTES', 72, 1180, 600, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.5) }),
      T('INGREDIENTS', 72, 1240, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: p.accent }),
      T((spec.items ?? []).join('\n'), 72, 1280, 400, 260, { fontFamily: f.body, fontSize: 13, lineHeight: 1.9, color: rgba(p.ink, 0.7) }),
      T('METHOD', 540, 1240, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: p.accent }),
      T(spec.body, 540, 1280, 628, 300, { fontFamily: f.body, fontSize: 15, lineHeight: 1.7, color: rgba(p.ink, 0.7) }),
      hairline(72, 1600, 1096, rgba(p.ink, 0.2), 1),
      dept(spec.meta ?? 'RECIPE  /  AUTUMN 2026', 72, 1630, 700, rgba(p.ink, 0.4), 8),
    );
    return template(spec, EDIT, [page('Recipe', background, elements)]);
  }

  if (spec.variant === 'travel') {
    elements.push(
      ...masthead(),
      dept(spec.section, 72, 130, 600, p.accent, 10),
      T(spec.title, 64, 170, 1000, 260, { fontFamily: f.display, fontSize: sizeFor(spec.title, 100, 56, 12), lineHeight: 0.98, letterSpacing: -2.4, color: p.ink }),
      T(spec.deck, 72, 450, 760, 90, { fontFamily: f.accent ?? f.body, fontSize: 25, lineHeight: 1.45, color: rgba(p.ink, 0.64) }),
      IMG(spec.image ?? PHOTOS.venice, 72, 580, 700, 560, { name: 'Travel image' }),
      IMG(spec.image2 ?? PHOTOS.italy, 792, 580, 376, 560, { name: 'Detail image' }),
      T('FIELD NOTES', 72, 1200, 300, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: p.accent }),
      T(spec.body, 72, 1240, 700, 280, { fontFamily: f.body, fontSize: 15, lineHeight: 1.7, color: rgba(p.ink, 0.7) }),
      T((spec.items ?? []).join('\n'), 820, 1240, 348, 220, { fontFamily: f.body, fontSize: 12, lineHeight: 2.0, color: rgba(p.ink, 0.6) }),
      hairline(72, 1580, 1096, rgba(p.ink, 0.2), 1),
      dept(spec.meta ?? 'ROUTE  /  07 DAYS', 72, 1610, 700, rgba(p.ink, 0.4), 8),
    );
    return template(spec, EDIT, [page('Travel', background, elements)]);
  }

  if (spec.variant === 'opinion') {
    elements.push(
      ...masthead(),
      dept(spec.section, 72, 130, 600, p.accent, 10),
      T(spec.title, 64, 170, 1000, 300, { fontFamily: f.display, fontSize: sizeFor(spec.title, 100, 54, 10), lineHeight: 1.0, letterSpacing: -2.4, color: p.ink }),
      T(spec.deck, 72, 500, 760, 100, { fontFamily: f.accent ?? f.body, fontSize: 26, lineHeight: 1.45, color: rgba(p.ink, 0.64) }),
      T(spec.byline, 72, 630, 500, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.44), uppercase: true }),
      hairline(72, 700, 1096, rgba(p.ink, 0.24), 2),
      T(spec.body, 72, 740, 700, 500, { fontFamily: f.body, fontSize: 16, lineHeight: 1.8, color: rgba(p.ink, 0.72) }),
      S('rect', 820, 740, 348, 360, { fill: p.accent, name: 'Pull quote field' }),
      T(spec.items?.[0] ?? 'The point is not to be right. The point is to be useful.', 844, 780, 300, 260, { fontFamily: f.accent ?? f.body, fontSize: 27, lineHeight: 1.4, color: p.bg }),
      T(spec.body, 72, 1300, 700, 240, { fontFamily: f.body, fontSize: 16, lineHeight: 1.8, color: rgba(p.ink, 0.72) }),
      T(spec.meta ?? 'ILLUSTRATION  /  EDITRIM', 820, 1180, 348, 24, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
      hairline(72, 1580, 1096, rgba(p.ink, 0.2), 1),
      dept('OPINION  /  THE EDITRIM REVIEW', 72, 1610, 700, rgba(p.ink, 0.4), 8),
    );
    return template(spec, EDIT, [page('Opinion', background, elements)]);
  }

  if (spec.variant === 'review') {
    elements.push(
      ...masthead(),
      dept(spec.section, 72, 130, 600, p.accent, 10),
      T(spec.title, 64, 170, 800, 220, { fontFamily: f.display, fontSize: sizeFor(spec.title, 64, 40, 13), lineHeight: 1.0, letterSpacing: -2, color: p.ink }),
      IMG(spec.image ?? PHOTOS.books3, 820, 160, 348, 460, { name: 'Book cover' }),
      T(spec.deck, 72, 420, 700, 90, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.45, color: rgba(p.ink, 0.64) }),
      T(spec.byline, 72, 530, 500, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.ink, 0.44), uppercase: true }),
      hairline(72, 600, 700, rgba(p.ink, 0.2), 1),
      T(spec.body, 72, 640, 700, 400, { fontFamily: f.body, fontSize: 16, lineHeight: 1.8, color: rgba(p.ink, 0.7) }),
      S('rect', 820, 680, 348, 160, { fill: p.ink, name: 'Rating field' }),
      T('4.5', 844, 710, 160, 70, { fontFamily: f.display, fontSize: 64, color: p.accent }),
      T('/ 5', 1000, 740, 140, 30, { fontFamily: f.body, fontSize: 14, color: rgba(p.bg, 0.5) }),
      T('A BOOK BY ' + (spec.items?.[0] ?? 'THE AUTHOR'), 820, 700, 348, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.4) }),
      T(spec.items?.[1] ?? 'Published by Fitzcarraldo Editions', 820, 880, 348, 50, { fontFamily: f.body, fontSize: 11, lineHeight: 1.5, color: rgba(p.ink, 0.56) }),
      hairline(72, 1100, 1096, rgba(p.ink, 0.2), 1),
      T(spec.items?.[2] ?? 'Also in this issue: the books we reread.', 72, 1140, 700, 40, { fontFamily: f.accent ?? f.body, fontSize: 20, color: rgba(p.ink, 0.6) }),
      dept(spec.meta ?? 'BOOKS  /  AUTUMN 2026', 72, 1610, 700, rgba(p.ink, 0.4), 8),
    );
    return template(spec, EDIT, [page('Review', background, elements)]);
  }

  if (spec.variant === 'portfolio') {
    elements.push(
      ...masthead(),
      dept(spec.section, 72, 130, 600, p.accent, 10),
      T(spec.title, 64, 170, 1000, 260, { fontFamily: f.display, fontSize: sizeFor(spec.title, 58, 38, 12), lineHeight: 1.0, letterSpacing: -2, color: p.ink }),
      T(spec.deck, 72, 410, 760, 80, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.4, color: rgba(p.ink, 0.64) }),
      IMG(spec.image ?? PHOTOS.architecture2, 72, 520, 700, 520, { name: 'Portfolio image A' }),
      IMG(spec.image2 ?? PHOTOS.interior6, 792, 520, 376, 520, { name: 'Portfolio image B' }),
      T(spec.body, 72, 1080, 700, 160, { fontFamily: f.body, fontSize: 15, lineHeight: 1.7, color: rgba(p.ink, 0.7) }),
      T((spec.items ?? []).join('\n'), 820, 1080, 348, 200, { fontFamily: f.body, fontSize: 12, lineHeight: 2.0, color: rgba(p.ink, 0.6) }),
      hairline(72, 1320, 1096, rgba(p.ink, 0.2), 1),
      T('01', 72, 1360, 100, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
      T('02', 200, 1360, 100, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
      T('03', 328, 1360, 100, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
      dept(spec.meta ?? 'PORTFOLIO  /  SELECTED WORK', 760, 1360, 408, rgba(p.ink, 0.4), 8, 'right'),
    );
    return template(spec, EDIT, [page('Portfolio', background, elements)]);
  }

  // newspaper
  elements.push(
    T(spec.publication, 120, 50, 1000, 70, { fontFamily: f.display, fontSize: 64, lineHeight: 1.0, color: p.ink, align: 'center' }),
    dept(spec.issue, 72, 80, 400, rgba(p.ink, 0.46), 9),
    dept('FULL EDITION', 900, 80, 268, rgba(p.ink, 0.46), 9, 'right'),
    hairline(72, 150, 1096, rgba(p.ink, 0.32), 3),
    T(spec.title, 72, 180, 1096, 220, { fontFamily: f.display, fontSize: sizeFor(spec.title, 100, 54, 13), lineHeight: 1.0, letterSpacing: -2.4, color: p.ink }),
    T(spec.deck, 72, 420, 700, 90, { fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.45, color: rgba(p.ink, 0.64) }),
    hairline(72, 540, 1096, rgba(p.ink, 0.2), 1),
    IMG(spec.image ?? PHOTOS.city4, 72, 580, 700, 480, { name: 'Front page image' }),
    T(spec.body, 72, 1100, 700, 380, { fontFamily: f.body, fontSize: 15, lineHeight: 1.75, color: rgba(p.ink, 0.72) }),
    T('INSIDE', 820, 580, 348, 22, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: p.accent }),
    ...(spec.items ?? []).slice(0, 5).map((line, i) => (
      T(`${i + 1}  ${line}`, 820, 620 + i * 54, 348, 46, { fontFamily: f.body, fontSize: 13, lineHeight: 1.45, color: rgba(p.ink, 0.66) })
    )),
    hairline(820, 920, 348, rgba(p.ink, 0.2), 1),
    T(spec.byline, 820, 960, 348, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.44) }),
    hairline(72, 1540, 1096, rgba(p.ink, 0.24), 1),
    dept(spec.meta ?? 'THE WEEKEND EDITION  /  PAGE 01', 72, 1570, 900, rgba(p.ink, 0.4), 8),
    ...barcode(980, 1650, 188, 50, rgba(p.ink, 0.5), 14),
  );
  return template(spec, EDIT, [page('Front page', background, elements)]);
}

type TemplateSpecResult = import('../types').Template;
