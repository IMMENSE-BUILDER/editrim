import type { El, Page } from '../types';
import {
  FONTS, G, IC, IMG, NONE, P, PHOTOS, S, T,
  bgImage, bgSolid, page,
} from '../templateKit';
import {
  Palette, TemplateMeta, TypePair, dept, hairline, onDark, onLight, rgba, sizeFor, template,
} from './kitShared';

/* ------------------------------------------------------------------ */
/* Decks                                                               */
/* ------------------------------------------------------------------ */

export type DeckSlide =
  | { kind: 'cover'; kicker?: string; title: string; subtitle?: string; image?: string; meta?: string }
  | { kind: 'statement'; kicker?: string; title: string; body?: string; bullets?: string[]; image?: string }
  | { kind: 'data'; kicker?: string; title: string; stats: { value: string; label: string }[]; note?: string; image?: string }
  | { kind: 'quote'; quote: string; attribution?: string; kicker?: string; image?: string }
  | { kind: 'close'; kicker?: string; title: string; body?: string; contact?: string; cta?: string };

export type DeckSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: 'image' | 'type' | 'data' | 'editorial';
  brand: string;
  slides: DeckSlide[];
};

const DECK = { name: 'Presentation', width: 1920, height: 1080 };

function deckChrome(spec: DeckSpec, pageNo: number, total: number, color: string, accent: string): El[] {
  const f = spec.fonts;
  return [
    dept(spec.brand, 96, 54, 700, color, 10),
    dept(`${String(pageNo).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 1500, 54, 324, accent, 9, 'right'),
    hairline(96, 100, 1728, rgba(color, 0.22), 1),
    hairline(96, 1000, 1728, rgba(color, 0.16), 1),
    dept(spec.name, 96, 1020, 700, rgba(color, 0.4), 8),
  ];
}

export function deck(spec: DeckSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const slides = spec.slides.slice(0, 5);
  const total = slides.length;
  const pages = slides.map<Page>((slide, index) => {
    const pageNo = index + 1;
    const elements: El[] = [];

    if (slide.kind === 'cover') {
      if (spec.variant === 'image') {
        const bg = bgImage(slide.image ?? PHOTOS.city3, p.deep ?? p.ink, 0.46);
        const dark = p.deep ?? onLight(p);
        const fg = onDark(p);
        elements.push(
          S('rect', 0, 0, 1920, 1080, { fill: G(rgba(dark, 0.55), rgba(dark, 0.15), 90), name: 'Cover wash' }),
          ...deckChrome(spec, pageNo, total, fg, p.accent),
          dept(slide.kicker ?? 'A NEW PROPOSITION', 96, 240, 760, p.accent, 11),
          T(slide.title, 90, 310, 1180, 460, { fontFamily: f.display, fontSize: sizeFor(slide.title, 112, 64, 12), lineHeight: 0.94, letterSpacing: -4, color: fg }),
          T(slide.subtitle ?? '', 96, 760, 900, 120, { fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.45, color: rgba(fg, 0.72) }),
          S('rect', 1500, 820, 324, 80, { fill: p.accent, name: 'CTA field' }),
          T(slide.meta ?? '2026', 1500, 846, 324, 30, { fontFamily: f.body, fontSize: 13, fontWeight: 700, letterSpacing: 2.4, color: p.deep ?? p.ink, align: 'center' }),
          T('CONFIDENTIAL  /  NOT FOR CIRCULATION', 96, 930, 700, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(fg, 0.4) }),
        );
        return page('Cover', bg, elements);
      }
      const bg = bgSolid(p.bg);
      elements.push(
        ...deckChrome(spec, pageNo, total, p.ink, p.accent),
        dept(slide.kicker ?? 'A NEW PROPOSITION', 96, 170, 760, p.accent, 11),
        T(slide.title, 90, 230, 1200, 500, { fontFamily: f.display, fontSize: sizeFor(slide.title, 124, 68, 12), lineHeight: 0.9, letterSpacing: -5, color: p.ink }),
        T(slide.subtitle ?? '', 96, 760, 860, 120, { fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.45, color: rgba(p.ink, 0.62) }),
        IMG(slide.image ?? PHOTOS.architecture5, 1380, 180, 444, 600, { name: 'Cover image' }),
        S('rect', 1380, 690, 444, 90, { fill: p.accent, name: 'Image caption field' }),
        T(slide.meta ?? '2026', 1404, 714, 396, 40, { fontFamily: f.body, fontSize: 12, letterSpacing: 2, color: p.deep ?? p.ink }),
        T('PREPARED FOR ' + spec.brand.toUpperCase(), 96, 930, 700, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
      );
      return page('Cover', bg, elements);
    }

    if (slide.kind === 'statement') {
      const bg = bgSolid(p.bg);
      elements.push(
        ...deckChrome(spec, pageNo, total, p.ink, p.accent),
        dept(slide.kicker ?? 'THE ARGUMENT', 96, 160, 760, p.accent, 11),
        T(slide.title, 90, 220, 1200, 300, { fontFamily: f.display, fontSize: sizeFor(slide.title, 72, 44, 16), lineHeight: 1.02, letterSpacing: -2.4, color: p.ink }),
        T(slide.body ?? '', 96, 540, 800, 220, { fontFamily: f.body, fontSize: 24, lineHeight: 1.6, color: rgba(p.ink, 0.66) }),
        ...(slide.bullets ?? []).slice(0, 3).flatMap((bullet, i) => [
          hairline(96, 790 + i * 62, 760, rgba(p.ink, 0.16), 1),
          T(`0${i + 1}`, 96, 808 + i * 62, 50, 26, { fontFamily: f.body, fontSize: 10, letterSpacing: 1, color: p.accent }),
          T(bullet, 160, 806 + i * 62, 700, 36, { fontFamily: f.body, fontSize: 17, lineHeight: 1.35, color: rgba(p.ink, 0.72) }),
        ]),
        ...(slide.image ? [IMG(slide.image, 1020, 160, 804, 720, { name: 'Argument image' })] : []),
        ...(slide.image ? [
          S('rect', 1020, 800, 804, 80, { fill: p.accent, name: 'Caption field' }),
          T('FIELD STUDY  /  2026', 1044, 824, 756, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: p.deep ?? p.ink }),
        ] : []),
      );
      return page('Statement', bg, elements);
    }

    if (slide.kind === 'data') {
      const bg = bgSolid(p.deep ?? p.ink);
      const fg = onDark(p);
      const stats = slide.stats.slice(0, 4);
      elements.push(
        ...deckChrome(spec, pageNo, total, fg, p.accent),
        dept(slide.kicker ?? 'THE EVIDENCE', 96, 160, 760, p.accent, 11),
        T(slide.title, 90, 220, slide.image ? 960 : 1200, 240, { fontFamily: f.display, fontSize: sizeFor(slide.title, 56, 38, 16), lineHeight: 1.02, letterSpacing: -2.4, color: fg }),
        ...stats.flatMap((stat, i) => [
          T(stat.value, 96 + i * 440, 500, 400, 120, { fontFamily: f.display, fontSize: 86, lineHeight: 1.0, letterSpacing: -3, color: p.accent }),
          T(stat.label, 96 + i * 440, 630, 360, 90, { fontFamily: f.body, fontSize: 15, lineHeight: 1.5, color: rgba(fg, 0.56) }),
          hairline(96 + i * 440, 740, 360, rgba(fg, 0.2), 1),
        ]),
        ...Array.from({ length: 7 }, (_, i) =>
          S('rect', 96 + i * 80, 820 - i * 34, 44, 60 + i * 34, { fill: i === 6 ? p.accent : rgba(fg, 0.16), name: 'Bar' }),
        ),
        T(slide.note ?? 'Source: Editrim research, 2026', 96, 900, 760, 40, { fontFamily: f.body, fontSize: 12, lineHeight: 1.5, color: rgba(fg, 0.44) }),
        ...(slide.image ? [IMG(slide.image, 1080, 140, 744, 320, { name: 'Evidence image' })] : []),
        S('rect', 1100, 800, 724, 80, { fill: p.accent, name: 'Takeaway field' }),
        T('THE TAKEAWAY  /  ' + (slide.note ?? 'MEASURABLE PROGRESS'), 1124, 824, 676, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: p.deep ?? p.ink }),
      );
      return page('Evidence', bg, elements);
    }

    if (slide.kind === 'quote') {
      const bg = bgSolid(p.accent);
      elements.push(
        ...deckChrome(spec, pageNo, total, p.deep ?? p.ink, p.ink),
        dept(slide.kicker ?? 'IN THEIR WORDS', 96, 160, 760, rgba(p.deep ?? p.ink, 0.6), 11),
        T('\u201c', 96, 210, 260, 260, { fontFamily: f.display, fontSize: 240, lineHeight: 1, color: p.ink }),
        T(slide.quote, 160, 430, 1320, 380, { fontFamily: f.display, fontSize: sizeFor(slide.quote, 82, 46, 18), lineHeight: 1.12, letterSpacing: -1.8, color: p.deep ?? p.ink }),
        T(slide.attribution ?? '', 164, 840, 700, 40, { fontFamily: f.body, fontSize: 13, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.56), uppercase: true }),
        ...(slide.image ? [IMG(slide.image, 1520, 540, 300, 300, { name: 'Portrait', radius: 150 })] : []),
        S('ellipse', 1520, 540, 300, 300, { fill: NONE, stroke: p.ink, strokeWidth: 1, name: 'Portrait ring' }),
      );
      return page('Quote', bg, elements);
    }

    // close
    const bg = bgSolid(p.ink);
    elements.push(
      ...deckChrome(spec, pageNo, total, p.bg, p.accent),
      dept(slide.kicker ?? 'THE NEXT STEP', 96, 170, 760, p.accent, 11),
      T(slide.title, 90, 240, 1100, 300, { fontFamily: f.display, fontSize: sizeFor(slide.title, 72, 44, 14), lineHeight: 0.98, letterSpacing: -3, color: p.bg }),
      T(slide.body ?? '', 96, 560, 760, 160, { fontFamily: f.body, fontSize: 23, lineHeight: 1.6, color: rgba(p.bg, 0.6) }),
      S('rect', 96, 800, 380, 82, { fill: p.accent, radius: 41, name: 'CTA' }),
      T(slide.cta ?? 'LET\u2019S TALK', 96, 826, 380, 30, { fontFamily: f.body, fontSize: 14, fontWeight: 700, letterSpacing: 2.4, color: p.deep ?? p.ink, align: 'center' }),
      T(slide.contact ?? 'hello@editrim.studio', 1040, 700, 784, 60, { fontFamily: f.display, fontSize: 38, color: p.bg, align: 'right' }),
      T('EDITRIM  /  STRATEGY, DESIGN, DELIVERY', 1040, 780, 784, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.bg, 0.4), align: 'right' }),
      S('ellipse', 1640, 160, 180, 180, { fill: p.accent, name: 'Seal' }),
      T('FIN', 1640, 216, 180, 60, { fontFamily: f.display, fontSize: 34, color: p.deep ?? p.ink, align: 'center' }),
    );
    return page('Close', bg, elements);
  });
  return template(spec, DECK, pages);
}

/* ------------------------------------------------------------------ */
/* Web pages                                                           */
/* ------------------------------------------------------------------ */

export type WebVariant = 'split' | 'editorial' | 'product' | 'event' | 'studio' | 'shop';

export type WebSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: WebVariant;
  brand: string;
  nav: string[];
  headline: string;
  sub: string;
  cta: string;
  image?: string;
  image2?: string;
  image3?: string;
  items?: string[];
  meta?: string;
};

const WEB = { name: 'Website', width: 1440, height: 900 };

export function web(spec: WebSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];
  const nav = spec.nav.slice(0, 5);

  const navBar = (color: string, accent: string): El[] => [
    T(spec.brand, 64, 38, 400, 30, { fontFamily: f.display, fontSize: 20, letterSpacing: 2, color, uppercase: true }),
    ...nav.map((item, i) =>
      T(item, 560 + i * 112, 42, 104, 24, { fontFamily: f.body, fontSize: 11, letterSpacing: 1.6, color: rgba(color, 0.58), uppercase: true }),
    ),
    S('rect', 1270, 36, 106, 34, { fill: accent, radius: 17, name: 'Nav CTA' }),
    T(spec.cta, 1270, 44, 106, 20, { fontFamily: f.body, fontSize: 8, fontWeight: 700, letterSpacing: 1.4, color: p.deep ?? p.ink, align: 'center' }),
    hairline(64, 92, 1312, rgba(color, 0.18), 1),
  ];

  if (spec.variant === 'split') {
    const bg = bgSolid(p.bg);
    elements.push(
      ...navBar(p.ink, p.accent),
      T(spec.headline, 64, 170, 720, 300, { fontFamily: f.display, fontSize: sizeFor(spec.headline, 96, 54, 14), lineHeight: 0.96, letterSpacing: -3, color: p.ink }),
      T(spec.sub, 64, 490, 600, 120, { fontFamily: f.body, fontSize: 18, lineHeight: 1.6, color: rgba(p.ink, 0.62) }),
      S('rect', 64, 650, 240, 58, { fill: p.accent, radius: 29, name: 'CTA' }),
      T(spec.cta, 64, 668, 240, 22, { fontFamily: f.body, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: p.deep ?? p.ink, align: 'center' }),
      IMG(spec.image ?? PHOTOS.interior2, 780, 130, 596, 640, { name: 'Hero image' }),
      S('rect', 780, 770, 596, 80, { fill: p.ink, name: 'Caption field' }),
      T(spec.meta ?? 'A NEW WAY TO LIVE  /  2026', 804, 794, 548, 30, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: p.bg }),
      T('SCROLL  \u2193', 64, 820, 300, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
    );
    return template(spec, WEB, [page('Home', bg, elements)]);
  }

  if (spec.variant === 'editorial') {
    const bg = bgSolid(p.bg);
    elements.push(
      ...navBar(p.ink, p.accent),
      dept(spec.meta ?? 'ISSUE 14  /  AUTUMN 2026', 64, 120, 600, rgba(p.ink, 0.44), 9),
      T(spec.headline, 64, 170, 900, 240, { fontFamily: f.display, fontSize: sizeFor(spec.headline, 84, 48, 16), lineHeight: 1.0, letterSpacing: -2.4, color: p.ink }),
      T(spec.sub, 64, 430, 700, 100, { fontFamily: f.accent ?? f.body, fontSize: 22, lineHeight: 1.45, color: rgba(p.ink, 0.62) }),
      IMG(spec.image ?? PHOTOS.gallery, 64, 560, 820, 300, { name: 'Feature image' }),
      IMG(spec.image2 ?? PHOTOS.art3, 904, 560, 472, 300, { name: 'Secondary image' }),
      ...(spec.items ?? []).slice(0, 3).flatMap((item, i) => [
        hairline(64 + i * 436, 760, 400, rgba(p.ink, 0.2), 1),
        T(item, 64 + i * 436, 780, 400, 50, { fontFamily: f.body, fontSize: 13, lineHeight: 1.45, color: rgba(p.ink, 0.62) }),
      ]),
      T('READ THE ISSUE  \u2192', 64, 860, 300, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: p.accent }),
    );
    return template(spec, WEB, [page('Home', bg, elements)]);
  }

  if (spec.variant === 'product') {
    const bg = bgSolid(p.bg);
    elements.push(
      ...navBar(p.ink, p.accent),
      IMG(spec.image ?? PHOTOS.watch2, 64, 130, 700, 700, { name: 'Product image' }),
      S('rect', 64, 130, 700, 700, { fill: rgba(p.ink, 0.04), name: 'Product field' }),
      dept(spec.meta ?? 'NEW RELEASE', 840, 130, 400, p.accent, 10),
      T(spec.headline, 836, 170, 540, 230, { fontFamily: f.display, fontSize: sizeFor(spec.headline, 64, 40, 14), lineHeight: 1.0, letterSpacing: -2, color: p.ink }),
      T(spec.sub, 840, 390, 520, 120, { fontFamily: f.body, fontSize: 17, lineHeight: 1.6, color: rgba(p.ink, 0.6) }),
      ...(spec.items ?? []).slice(0, 4).flatMap((item, i) => [
        hairline(840, 540 + i * 46, 520, rgba(p.ink, 0.16), 1),
        T(item, 840, 552 + i * 46, 520, 30, { fontFamily: f.body, fontSize: 12, color: rgba(p.ink, 0.6) }),
      ]),
      T('$249', 840, 760, 300, 60, { fontFamily: f.display, fontSize: 44, color: p.ink }),
      S('rect', 1100, 760, 260, 58, { fill: p.ink, radius: 29, name: 'CTA' }),
      T(spec.cta, 1100, 778, 260, 22, { fontFamily: f.body, fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: p.bg, align: 'center' }),
    );
    return template(spec, WEB, [page('Product', bg, elements)]);
  }

  if (spec.variant === 'event') {
    const bg = bgImage(spec.image ?? PHOTOS.concertCrowd, p.deep ?? p.ink, 0.46);
    elements.push(
      S('rect', 0, 0, 1440, 900, { fill: G(rgba(p.ink, 0.72), rgba(p.ink, 0.3), 90), name: 'Wash' }),
      ...navBar(p.bg, p.accent),
      dept(spec.meta ?? '14\u201316 OCT 2026  /  LONDON', 64, 150, 700, p.accent, 11),
      T(spec.headline, 64, 220, 900, 360, { fontFamily: f.display, fontSize: sizeFor(spec.headline, 82, 48, 12), lineHeight: 0.92, letterSpacing: -3, color: p.bg }),
      T(spec.sub, 64, 550, 600, 100, { fontFamily: f.body, fontSize: 18, lineHeight: 1.6, color: rgba(p.bg, 0.72) }),
      S('rect', 64, 700, 260, 60, { fill: p.accent, radius: 30, name: 'CTA' }),
      T(spec.cta, 64, 720, 260, 22, { fontFamily: f.body, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: p.deep ?? p.ink, align: 'center' }),
      ...(spec.items ?? []).slice(0, 3).map((item, i) =>
        T(item, 900, 640 + i * 44, 476, 36, { fontFamily: f.body, fontSize: 13, letterSpacing: 1.6, color: rgba(p.bg, 0.72), align: 'right' }),
      ),
      T('THE FOUNDRY  /  LONDON E2', 900, 800, 476, 26, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.bg, 0.5), align: 'right' }),
      IC('arrow-right', 1280, 160, 36, p.accent, 1.5),
    );
    return template(spec, WEB, [page('Event', bg, elements)]);
  }

  if (spec.variant === 'studio') {
    const bg = bgSolid(p.bg);
    elements.push(
      ...navBar(p.ink, p.accent),
      dept(spec.meta ?? 'INDEPENDENT DESIGN STUDIO', 64, 140, 600, p.accent, 10),
      T(spec.headline, 64, 190, 900, 300, { fontFamily: f.display, fontSize: sizeFor(spec.headline, 76, 46, 14), lineHeight: 0.98, letterSpacing: -2.6, color: p.ink }),
      T(spec.sub, 980, 200, 396, 180, { fontFamily: f.body, fontSize: 17, lineHeight: 1.65, color: rgba(p.ink, 0.6) }),
      IMG(spec.image ?? PHOTOS.architecture2, 64, 480, 420, 300, { name: 'Project A' }),
      IMG(spec.image2 ?? PHOTOS.interior3, 508, 480, 420, 300, { name: 'Project B' }),
      IMG(spec.image3 ?? PHOTOS.building, 952, 480, 420, 300, { name: 'Project C' }),
      ...(spec.items ?? []).slice(0, 3).map((item, i) =>
        T(item, 64 + i * 444, 800, 420, 40, { fontFamily: f.body, fontSize: 12, letterSpacing: 1.2, color: rgba(p.ink, 0.58) }),
      ),
      T('SELECTED WORK  /  2022\u20132026', 64, 860, 500, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36) }),
    );
    return template(spec, WEB, [page('Studio', bg, elements)]);
  }

  // shop
  const bg = bgSolid(p.bg);
  elements.push(
    ...navBar(p.ink, p.accent),
    dept(spec.meta ?? 'THE BOOKSHOP  /  NEW ARRIVALS', 64, 130, 600, p.accent, 10),
    T(spec.headline, 64, 180, 900, 230, { fontFamily: f.display, fontSize: sizeFor(spec.headline, 68, 42, 16), lineHeight: 1.02, letterSpacing: -2, color: p.ink }),
    T(spec.sub, 950, 190, 426, 120, { fontFamily: f.body, fontSize: 16, lineHeight: 1.6, color: rgba(p.ink, 0.6) }),
    ...Array.from({ length: 4 }, (_, i) => {
      const x = 64 + i * 332;
      const image = [PHOTOS.book, PHOTOS.books2, PHOTOS.library, PHOTOS.books3][i];
      return [
        IMG(image, x, 430, 284, 320, { name: `Book ${i + 1}` }),
        T(spec.items?.[i] ?? 'A new book', x, 770, 284, 34, { fontFamily: f.body, fontSize: 13, fontWeight: 600, color: p.ink }),
        T(['$18', '$22', '$16', '$24'][i], x, 806, 284, 26, { fontFamily: f.body, fontSize: 12, color: rgba(p.ink, 0.5) }),
        S('rect', x, 850, 284, 1, { fill: rgba(p.ink, 0.18), name: 'Rule' }),
      ];
    }).flat(),
    T('BROWSE THE SHELVES  \u2192', 64, 870, 400, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: p.accent }),
  );
  return template(spec, WEB, [page('Shop', bg, elements)]);
}

type TemplateSpecResult = import('../types').Template;
