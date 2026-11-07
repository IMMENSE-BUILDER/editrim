import type { DesignSize, El } from '../types';
import {
  FONTS, G, IC, IMG, NONE, P, PHOTOS, S, T,
  bgImage, bgSolid, page,
} from '../templateKit';
import {
  Palette, TemplateMeta, TypePair, barcode, dept, hairline, rgba, sizeFor, template,
} from './kitShared';

/* ------------------------------------------------------------------ */
/* Social posts                                                        */
/* ------------------------------------------------------------------ */

export type SocialVariant = 'poster' | 'split' | 'type' | 'grid' | 'ticket' | 'collage' | 'duotone' | 'quiet';

export type SocialSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: SocialVariant;
  image?: string;
  image2?: string;
  image3?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
  meta?: string;
  footer?: string;
  cta?: string;
  price?: string;
};

const POST = { name: 'Instagram Post', width: 1080, height: 1080 };

export function social(spec: SocialSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];
  const titleSize = sizeFor(spec.title, 168, 98, 12);

  if (spec.variant === 'poster') {
    const background = bgImage(spec.image ?? PHOTOS.city, p.deep ?? p.ink, 0.44);
    elements.push(
      S('rect', 0, 0, 1080, 340, { fill: G(rgba(p.ink, 0.86), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 790, 1080, 290, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.88), 0), name: 'Bottom shade' }),
      dept(spec.kicker ?? 'FIELD NOTES  /  01', 64, 54, 540, p.bg, 12),
      dept(spec.meta ?? 'EST. 2026', 620, 54, 396, rgba(p.bg, 0.72), 11, 'right'),
      hairline(64, 100, 952, rgba(p.bg, 0.4), 1),
      T(spec.title, 64, 340, 952, 480, {
        fontFamily: f.display, fontSize: titleSize, lineHeight: 0.9, letterSpacing: -Math.min(5, titleSize * 0.03),
        color: p.bg, fontWeight: 700,
      }),
      T(spec.subtitle ?? spec.body ?? '', 64, 840, 610, 90, {
        fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.3, color: rgba(p.bg, 0.86),
      }),
      S('ellipse', 842, 780, 150, 150, { fill: p.accent, name: 'Seal' }),
      T(spec.price ?? 'NEW', 842, 842, 150, 40, {
        fontFamily: f.body, fontSize: 17, fontWeight: 700, letterSpacing: 1.8,
        color: p.deep ?? p.ink, align: 'center', uppercase: true,
      }),
      hairline(64, 962, 952, rgba(p.bg, 0.32), 1),
      dept(spec.footer ?? 'MADE IN SMALL BATCHES', 64, 988, 560, rgba(p.bg, 0.64), 10),
      dept(spec.cta ?? 'AVAILABLE NOW  \u2192', 620, 988, 396, p.accent, 10, 'right'),
    );
    return template(spec, POST, [page('Post', background, elements)]);
  }

  if (spec.variant === 'split') {
    const background = bgSolid(p.bg);
    elements.push(
      IMG(spec.image ?? PHOTOS.coffee, 548, 0, 532, 1080, {
        name: 'Hero image', filters: { brightness: 102, contrast: 106, saturate: 92, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
      }),
      S('rect', 0, 0, 548, 1080, { fill: p.accent, name: 'Type field' }),
      dept(spec.kicker ?? 'THE EDIT  /  04', 64, 54, 420, p.bg, 11),
      dept(spec.meta ?? 'SPRING 2026', 64, 90, 420, rgba(p.bg, 0.7), 10),
      T(spec.title, 64, 210, 430, 420, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 126, 78, 8), lineHeight: 0.94,
        letterSpacing: -Math.min(4, 126 * 0.025), color: p.bg, fontWeight: 700,
      }),
      T(spec.subtitle ?? spec.body ?? '', 64, 652, 400, 150, {
        fontFamily: f.accent ?? f.body, fontSize: 26, lineHeight: 1.38, color: rgba(p.bg, 0.9),
      }),
      ...(spec.items ?? []).slice(0, 3).map((item, i) =>
        T(item, 64, 812 + i * 34, 400, 28, {
          fontFamily: f.body, fontSize: 13, letterSpacing: 1.6, color: rgba(p.bg, 0.72), uppercase: true,
        }),
      ),
      S('rect', 64, 936, 220, 52, { fill: p.bg, radius: 26, name: 'CTA' }),
      T(spec.cta ?? 'SHOP THE EDIT', 64, 952, 220, 22, {
        fontFamily: f.body, fontSize: 10, fontWeight: 700, letterSpacing: 1.8,
        color: p.accent, align: 'center', uppercase: true,
      }),
      dept(spec.footer ?? 'SMALL BATCH / SLOW MADE', 64, 1020, 420, rgba(p.bg, 0.5), 9),
      T('01', 500, 984, 32, 32, { fontFamily: f.body, fontSize: 14, color: rgba(p.bg, 0.6), align: 'center' }),
      S('rect', 1020, 966, 28, 46, { fill: p.bg, name: 'Margin mark' }),
    );
    return template(spec, POST, [page('Post', background, elements)]);
  }

  if (spec.variant === 'type') {
    const background = bgSolid(p.bg);
    elements.push(
      dept(spec.kicker ?? 'A STUDY IN FORM', 64, 50, 520, rgba(p.ink, 0.62), 11),
      dept(spec.meta ?? 'VOL. 03', 620, 50, 396, rgba(p.ink, 0.5), 10, 'right'),
      hairline(64, 96, 952, rgba(p.ink, 0.24), 1),
      T(spec.title, 56, 140, 968, 560, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 190, 104, 8), lineHeight: 0.84,
        letterSpacing: -Math.min(6, 190 * 0.03), color: p.ink, fontWeight: 700, uppercase: true,
      }),
      T(spec.subtitle ?? '', 64, 690, 430, 150, {
        fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.34, color: rgba(p.ink, 0.74),
      }),
      IMG(spec.image ?? PHOTOS.watch, 586, 640, 414, 314, { radius: 4, name: 'Detail image' }),
      T(spec.body ?? 'A considered object, made to be used every day.', 586, 968, 414, 28, {
        fontFamily: f.body, fontSize: 11, letterSpacing: 1.4, color: rgba(p.ink, 0.56), uppercase: true,
      }),
      S('ellipse', 64, 874, 118, 118, { fill: p.accent, name: 'Accent seal' }),
      T(spec.price ?? '04', 64, 916, 118, 40, {
        fontFamily: f.body, fontSize: 20, fontWeight: 700, color: p.deep ?? p.ink, align: 'center',
      }),
      dept(spec.footer ?? 'EDITRIM EDITIONS', 64, 1018, 500, rgba(p.ink, 0.42), 9),
      dept(spec.cta ?? 'SEE THE OBJECT  \u2192', 620, 1018, 396, rgba(p.ink, 0.62), 9, 'right'),
      S('star', 520, 820, 44, 44, { fill: p.accent, name: 'Star' }),
    );
    return template(spec, POST, [page('Post', background, elements)]);
  }

  if (spec.variant === 'grid') {
    const background = bgSolid(p.bg);
    elements.push(
      dept(spec.kicker ?? 'THE WEEKLY', 64, 48, 500, p.ink, 11),
      dept(spec.meta ?? 'ISSUE 12  /  $\u2009  ' + '6', 620, 48, 396, rgba(p.ink, 0.5), 9, 'right'),
      hairline(64, 92, 952, rgba(p.ink, 0.3), 2),
      IMG(spec.image ?? PHOTOS.interior, 64, 132, 548, 548, { name: 'Lead image', radius: 2 }),
      T('PLATE 01', 64, 692, 120, 18, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.5) }),
      T(spec.subtitle ?? 'A room, a light, a way of living.', 64, 716, 548, 54, {
        fontFamily: f.accent ?? f.body, fontSize: 22, lineHeight: 1.35, color: rgba(p.ink, 0.72),
      }),
      T(spec.title, 660, 132, 356, 250, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 72, 44, 12), lineHeight: 1.02,
        letterSpacing: -1.5, color: p.ink, fontWeight: 700,
      }),
      T(spec.body ?? '', 660, 400, 356, 190, {
        fontFamily: f.body, fontSize: 17, lineHeight: 1.6, color: rgba(p.ink, 0.68),
      }),
      ...(spec.items ?? []).slice(0, 3).flatMap((item, i) => [
        T(`0${i + 1}`, 660, 610 + i * 64, 36, 24, { fontFamily: f.body, fontSize: 10, color: p.accent }),
        T(item, 704, 608 + i * 64, 312, 46, {
          fontFamily: f.body, fontSize: 14, lineHeight: 1.35, color: rgba(p.ink, 0.76),
        }),
      ]),
      hairline(64, 872, 952, rgba(p.ink, 0.24), 1),
      dept(spec.footer ?? 'REPORTED FROM THE FIELD', 64, 898, 560, rgba(p.ink, 0.46), 9),
      dept(spec.cta ?? 'READ THE ISSUE  \u2192', 620, 898, 396, p.accent, 9, 'right'),
      S('rect', 960, 132, 56, 56, { fill: p.accent, name: 'Edition mark' }),
      T('12', 960, 146, 56, 28, { fontFamily: f.body, fontSize: 14, fontWeight: 700, color: p.bg, align: 'center' }),
    );
    return template(spec, POST, [page('Post', background, elements)]);
  }

  if (spec.variant === 'ticket') {
    const background = bgSolid(p.bg);
    elements.push(
      S('rect', 48, 48, 984, 984, { fill: NONE, stroke: rgba(p.ink, 0.24), strokeWidth: 1, name: 'Ticket frame' }),
      dept(spec.kicker ?? 'ADMIT ONE  /  SEASON 04', 80, 80, 560, rgba(p.ink, 0.58), 10),
      dept(spec.meta ?? 'NO. 00412', 700, 80, 300, rgba(p.ink, 0.46), 9, 'right'),
      T(spec.title, 80, 150, 920, 300, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 100, 70, 10), lineHeight: 0.98,
        letterSpacing: -2, color: p.ink, fontWeight: 700,
      }),
      T(spec.body ?? '', 80, 470, 520, 120, {
        fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.4, color: rgba(p.ink, 0.7),
      }),
      hairline(80, 600, 920, rgba(p.ink, 0.4), 1, ),
      T('TOTAL', 80, 628, 200, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2.4, color: rgba(p.ink, 0.5) }),
      T(spec.price ?? '$48', 80, 664, 420, 170, {
        fontFamily: f.display, fontSize: 126, lineHeight: 0.9, color: p.accent, fontWeight: 700,
      }),
      T(spec.subtitle ?? 'Includes entry, a drink and the late set.', 80, 850, 460, 54, {
        fontFamily: f.body, fontSize: 15, lineHeight: 1.5, color: rgba(p.ink, 0.62),
      }),
      ...barcode(620, 666, 380, 74, p.ink, 22),
      T('SCAN AT THE DOOR', 620, 760, 380, 20, { fontFamily: f.body, fontSize: 9, letterSpacing: 1.8, color: rgba(p.ink, 0.44) }),
      dept(spec.footer ?? 'NON-TRANSFERABLE  /  ONE PER GUEST', 80, 980, 700, rgba(p.ink, 0.38), 8),
      dept(spec.cta ?? 'BOOK A TABLE  \u2192', 700, 980, 300, p.accent, 8, 'right'),
      S('ellipse', 520, 40, 16, 16, { fill: p.bg, stroke: rgba(p.ink, 0.22), strokeWidth: 1 }),
      S('ellipse', 520, 1024, 16, 16, { fill: p.bg, stroke: rgba(p.ink, 0.22), strokeWidth: 1 }),
    );
    return template(spec, POST, [page('Post', background, elements)]);
  }

  if (spec.variant === 'collage') {
    const background = bgSolid(p.bg);
    elements.push(
      S('rect', 48, 140, 388, 446, { fill: p.soft ?? p.accent, radius: 2, rotation: -3, name: 'Photo backer A' }),
      IMG(spec.image ?? PHOTOS.coffee, 58, 150, 368, 426, { rotation: -3, name: 'Collage image A' }),
      S('rect', 452, 200, 334, 386, { fill: p.soft ?? p.accent, radius: 2, rotation: 3, name: 'Photo backer B' }),
      IMG(spec.image2 ?? PHOTOS.flowers, 462, 210, 314, 366, { rotation: 3, name: 'Collage image B' }),
      S('rect', 760, 120, 268, 328, { fill: p.soft ?? p.accent, radius: 2, rotation: -1, name: 'Photo backer C' }),
      IMG(spec.image3 ?? PHOTOS.bread, 770, 130, 248, 308, { rotation: -1, name: 'Collage image C' }),
      dept(spec.kicker ?? 'A SMALL WORLD  /  01', 64, 52, 540, rgba(p.ink, 0.58), 11),
      dept(spec.meta ?? 'SPRING 2026', 620, 52, 396, rgba(p.ink, 0.44), 9, 'right'),
      hairline(64, 96, 952, rgba(p.ink, 0.28), 1),
      T(spec.title, 64, 620, 760, 210, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 66, 46, 16), lineHeight: 1.02,
        letterSpacing: -2, color: p.ink, fontWeight: 700,
      }),
      T(spec.body ?? '', 64, 850, 560, 100, {
        fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.4, color: rgba(p.ink, 0.66),
      }),
      T(spec.price ?? 'EST. 2019', 880, 854, 136, 30, {
        fontFamily: f.body, fontSize: 11, letterSpacing: 1.6, color: p.accent, align: 'right', uppercase: true,
      }),
      hairline(64, 940, 952, rgba(p.ink, 0.24), 1),
      dept(spec.footer ?? 'PHOTOGRAPHS FROM THE ARCHIVE', 64, 966, 600, rgba(p.ink, 0.42), 9),
      dept(spec.cta ?? 'SEE THE STORY  \u2192', 620, 966, 396, p.accent, 9, 'right'),
    );
    return template(spec, POST, [page('Post', background, elements)]);
  }

  if (spec.variant === 'duotone') {
    const background = bgImage(spec.image ?? PHOTOS.portrait, p.deep ?? p.accent, 0.42);
    elements.push(
      S('rect', 0, 0, 1080, 1080, { fill: rgba(p.accent, 0.22), name: 'Duotone wash' }),
      S('rect', 0, 0, 1080, 250, { fill: G(rgba(p.ink, 0.7), rgba(p.ink, 0), 180), name: 'Top shade' }),
      dept(spec.kicker ?? 'PORTRAIT  /  04', 64, 52, 500, p.bg, 11),
      dept(spec.meta ?? 'A STUDY IN LIGHT', 620, 52, 396, rgba(p.bg, 0.66), 9, 'right'),
      hairline(64, 94, 952, rgba(p.bg, 0.34), 1),
      T(spec.title, 64, 300, 760, 380, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 120, 74, 10), lineHeight: 0.92,
        letterSpacing: -3, color: p.bg, fontWeight: 700,
      }),
      T(spec.body ?? '', 64, 704, 500, 120, {
        fontFamily: f.accent ?? f.body, fontSize: 25, lineHeight: 1.38, color: rgba(p.bg, 0.8),
      }),
      S('rect', 64, 880, 260, 60, { fill: p.accent, radius: 30, name: 'CTA' }),
      T(spec.cta ?? 'READ THE STORY', 64, 900, 260, 24, {
        fontFamily: f.body, fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: p.bg, align: 'center',
      }),
      T('01 / 03', 880, 880, 136, 24, { fontFamily: f.body, fontSize: 10, letterSpacing: 2, color: rgba(p.bg, 0.6), align: 'right' }),
      hairline(64, 960, 952, rgba(p.bg, 0.28), 1),
      dept(spec.footer ?? 'PHOTOGRAPHED ON 35MM', 64, 984, 560, rgba(p.bg, 0.52), 9),
      dept(spec.price ?? 'EDITRIM  /  2026', 620, 984, 396, rgba(p.bg, 0.52), 9, 'right'),
    );
    return template(spec, POST, [page('Post', background, elements)]);
  }

  // quiet
  const background = bgSolid(p.bg);
  elements.push(
    S('rect', 44, 44, 992, 992, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1, name: 'Hairline frame' }),
    T(spec.kicker ?? 'ATELIER  /  NO. 9', 540, 96, 440, 30, {
      fontFamily: f.body, fontSize: 10, letterSpacing: 3, color: rgba(p.ink, 0.52), align: 'center', uppercase: true,
    }),
    T(spec.title, 140, 220, 800, 260, {
      fontFamily: f.display, fontSize: sizeFor(spec.title, 76, 52, 14), lineHeight: 1.02,
      letterSpacing: -1.4, color: p.ink, align: 'center', fontWeight: 400,
    }),
    IMG(spec.image ?? PHOTOS.perfume, 340, 500, 400, 300, { fit: 'cover', radius: 0, name: 'Still life' }),
    hairline(440, 826, 200, rgba(p.ink, 0.32), 1),
    T(spec.subtitle ?? 'A quiet composition in paper and light.', 260, 858, 560, 66, {
      fontFamily: f.accent ?? f.body, fontSize: 20, lineHeight: 1.5, color: rgba(p.ink, 0.64), align: 'center',
    }),
    T(spec.meta ?? 'EDITION OF 50', 540, 946, 440, 24, {
      fontFamily: f.body, fontSize: 9, letterSpacing: 2.4, color: rgba(p.ink, 0.4), align: 'center',
    }),
    T(spec.footer ?? 'MADE BY HAND  /  LISBON', 540, 976, 440, 22, {
      fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.34), align: 'center',
    }),
    T('9', 64, 900, 80, 80, { fontFamily: f.display, fontSize: 56, color: rgba(p.ink, 0.28), align: 'left' }),
    S('diamond', 972, 64, 30, 30, { fill: p.accent, name: 'Diamond mark' }),
  );
  return template(spec, POST, [page('Post', background, elements)]);
}

type TemplateSpecResult = import('../types').Template;

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

export type StoryVariant = 'full' | 'stack' | 'poster' | 'split' | 'editorial' | 'sale' | 'quote' | 'frames';

export type StorySpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: StoryVariant;
  image?: string;
  image2?: string;
  image3?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
  meta?: string;
  footer?: string;
  cta?: string;
  price?: string;
};

const STORY = { name: 'Instagram Story', width: 1080, height: 1920 };

export function story(spec: StorySpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'full') {
    const background = bgImage(spec.image ?? PHOTOS.mountain, p.deep ?? p.ink, 0.38);
    elements.push(
      S('rect', 0, 0, 1080, 500, { fill: G(rgba(p.ink, 0.62), rgba(p.ink, 0), 180), name: 'Top shade' }),
      S('rect', 0, 1220, 1080, 700, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.9), 0), name: 'Bottom shade' }),
      dept(spec.kicker ?? 'FIELD NOTES  /  03', 64, 90, 520, p.bg, 11),
      dept(spec.meta ?? '64.1466\u00b0 N', 620, 90, 396, rgba(p.bg, 0.62), 9, 'right'),
      hairline(64, 134, 952, rgba(p.bg, 0.3), 1),
      T(spec.title, 64, 250, 900, 460, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 112, 72, 11), lineHeight: 0.9,
        letterSpacing: -4, color: p.bg, fontWeight: 700,
      }),
      T(spec.subtitle ?? '', 64, 1300, 760, 120, {
        fontFamily: f.accent ?? f.body, fontSize: 42, lineHeight: 1.2, color: p.bg,
      }),
      T(spec.body ?? '', 64, 1440, 700, 130, {
        fontFamily: f.body, fontSize: 22, lineHeight: 1.6, color: rgba(p.bg, 0.74),
      }),
      S('rect', 64, 1620, 330, 70, { fill: p.accent, radius: 35, name: 'CTA' }),
      T(spec.cta ?? 'READ THE GUIDE', 64, 1644, 330, 26, {
        fontFamily: f.body, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: p.deep ?? p.ink, align: 'center',
      }),
      hairline(64, 1760, 952, rgba(p.bg, 0.26), 1),
      dept(spec.footer ?? 'SWIPE UP  /  THE LONG WAY NORTH', 64, 1788, 700, rgba(p.bg, 0.55), 9),
      dept(spec.price ?? '03 / 07', 820, 1788, 196, rgba(p.bg, 0.55), 9, 'right'),
    );
    return template(spec, STORY, [page('Story', background, elements)]);
  }

  if (spec.variant === 'stack') {
    const background = bgSolid(p.bg);
    elements.push(
      dept(spec.kicker ?? 'THE SUNDAY EDIT', 64, 80, 520, rgba(p.ink, 0.58), 11),
      dept(spec.meta ?? 'ISSUE 07', 620, 80, 396, rgba(p.ink, 0.42), 9, 'right'),
      hairline(64, 126, 952, rgba(p.ink, 0.26), 1),
      IMG(spec.image ?? PHOTOS.restaurantInterior, 64, 196, 952, 860, { radius: 4, name: 'Lead image' }),
      S('rect', 64, 996, 952, 60, { fill: p.accent, name: 'Image caption field' }),
      dept(spec.subtitle ?? 'LISBON  /  38.7223\u00b0 N', 84, 1018, 700, p.deep ?? p.ink, 9),
      T(spec.title, 64, 1130, 900, 280, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 88, 58, 12), lineHeight: 0.96,
        letterSpacing: -2.6, color: p.ink, fontWeight: 700,
      }),
      T(spec.body ?? '', 64, 1430, 620, 140, {
        fontFamily: f.body, fontSize: 21, lineHeight: 1.58, color: rgba(p.ink, 0.66),
      }),
      S('rect', 64, 1620, 300, 64, { fill: p.ink, radius: 32, name: 'CTA' }),
      T(spec.cta ?? 'BOOK A TABLE', 64, 1642, 300, 24, {
        fontFamily: f.body, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: p.bg, align: 'center',
      }),
      T(spec.price ?? 'FROM \u20ac48', 820, 1634, 196, 40, {
        fontFamily: f.display, fontSize: 26, color: p.accent, align: 'right',
      }),
      hairline(64, 1760, 952, rgba(p.ink, 0.22), 1),
      dept(spec.footer ?? 'RUA DAS FLORES 112  /  LISBON', 64, 1788, 700, rgba(p.ink, 0.4), 9),
      dept(spec.meta ?? 'OPEN WED\u2013SUN', 820, 1788, 196, rgba(p.ink, 0.4), 9, 'right'),
    );
    return template(spec, STORY, [page('Story', background, elements)]);
  }

  if (spec.variant === 'poster') {
    const background = bgSolid(p.bg);
    elements.push(
      dept(spec.kicker ?? 'A NIGHT OF', 64, 80, 520, p.accent, 12),
      dept(spec.meta ?? 'DOORS 8PM', 620, 80, 396, rgba(p.ink, 0.44), 9, 'right'),
      hairline(64, 126, 952, rgba(p.ink, 0.26), 1),
      T(spec.title, 56, 180, 968, 620, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 180, 104, 8), lineHeight: 0.84,
        letterSpacing: -6, color: p.ink, fontWeight: 700, uppercase: true,
      }),
      IMG(spec.image ?? PHOTOS.concert, 64, 840, 952, 700, {
        name: 'Live image', filters: { brightness: 90, contrast: 112, saturate: 72, blur: 0, grayscale: 20, sepia: 0, hue: 0 },
      }),
      S('rect', 64, 1540, 952, 170, { fill: p.accent, name: 'Info band' }),
      T(spec.subtitle ?? 'A LIVE SET IN THE ROUND', 88, 1570, 520, 110, {
        fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.3, color: p.deep ?? p.ink,
      }),
      T(spec.price ?? '\u20ac18', 760, 1560, 220, 110, {
        fontFamily: f.display, fontSize: 72, lineHeight: 1, color: p.deep ?? p.ink, align: 'right',
      }),
      T(spec.body ?? '', 64, 1740, 620, 72, {
        fontFamily: f.body, fontSize: 16, lineHeight: 1.5, color: rgba(p.ink, 0.6),
      }),
      dept(spec.footer ?? 'THE FOUNDRY  /  14 OCT 2026', 820, 1758, 196, rgba(p.ink, 0.46), 8, 'right'),
      T(spec.cta ?? 'TICKETS', 64, 1840, 300, 30, {
        fontFamily: f.body, fontSize: 12, fontWeight: 700, letterSpacing: 2.2, color: p.accent, uppercase: true,
      }),
    );
    return template(spec, STORY, [page('Story', background, elements)]);
  }

  if (spec.variant === 'split') {
    const background = bgSolid(p.bg);
    elements.push(
      S('rect', 0, 0, 1080, 820, { fill: p.ink, name: 'Top field' }),
      dept(spec.kicker ?? 'THE WEEKEND EDIT', 64, 80, 520, rgba(p.bg, 0.62), 11),
      dept(spec.meta ?? 'VOL. 02', 620, 80, 396, rgba(p.bg, 0.44), 9, 'right'),
      T(spec.title, 64, 180, 940, 420, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 108, 68, 10), lineHeight: 0.92,
        letterSpacing: -3, color: p.bg, fontWeight: 700,
      }),
      T(spec.subtitle ?? '', 64, 590, 620, 100, {
        fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.4, color: rgba(p.bg, 0.75),
      }),
      IMG(spec.image ?? PHOTOS.beach, 0, 820, 1080, 1100, { name: 'Bottom image' }),
      S('rect', 0, 1320, 1080, 600, { fill: G(rgba(p.ink, 0), rgba(p.ink, 0.9), 0), name: 'Bottom shade' }),
      T(spec.body ?? '', 64, 1420, 700, 130, {
        fontFamily: f.body, fontSize: 22, lineHeight: 1.6, color: rgba(p.bg, 0.78),
      }),
      S('rect', 64, 1600, 300, 64, { fill: p.accent, radius: 32, name: 'CTA' }),
      T(spec.cta ?? 'EXPLORE', 64, 1622, 300, 24, {
        fontFamily: f.body, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: p.deep ?? p.ink, align: 'center',
      }),
      dept(spec.footer ?? '36.1699\u00b0 N  /  115.1398\u00b0 W', 64, 1788, 700, rgba(p.bg, 0.55), 9),
      dept(spec.price ?? '02 / 04', 820, 1788, 196, rgba(p.bg, 0.55), 9, 'right'),
    );
    return template(spec, STORY, [page('Story', background, elements)]);
  }

  if (spec.variant === 'editorial') {
    const background = bgSolid(p.bg);
    elements.push(
      T(spec.kicker ?? 'THE REVIEW', 64, 72, 700, 60, {
        fontFamily: f.display, fontSize: 34, fontWeight: 700, letterSpacing: 4, color: p.ink, uppercase: true,
      }),
      dept(spec.meta ?? 'ISSUE 14  /  AUTUMN 2026', 620, 84, 396, rgba(p.ink, 0.46), 9, 'right'),
      hairline(64, 150, 952, rgba(p.ink, 0.32), 2),
      IMG(spec.image ?? PHOTOS.art, 0, 190, 1080, 980, {
        name: 'Cover image', filters: { brightness: 102, contrast: 108, saturate: 88, blur: 0, grayscale: 0, sepia: 0, hue: 0 },
      }),
      S('rect', 0, 1090, 1080, 70, { fill: p.accent, name: 'Cover line field' }),
      T(spec.subtitle ?? 'THE QUIET AVANT-GARDE', 64, 1106, 760, 34, {
        fontFamily: f.body, fontSize: 14, fontWeight: 700, letterSpacing: 3, color: p.deep ?? p.ink, uppercase: true,
      }),
      T(spec.title, 64, 1200, 900, 260, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 86, 54, 13), lineHeight: 1.0,
        letterSpacing: -2.4, color: p.ink, fontWeight: 700,
      }),
      T(spec.body ?? '', 64, 1450, 560, 170, {
        fontFamily: f.body, fontSize: 19, lineHeight: 1.65, color: rgba(p.ink, 0.66),
      }),
      T('INSIDE', 700, 1450, 316, 22, { fontFamily: f.body, fontSize: 9, letterSpacing: 2.6, color: rgba(p.ink, 0.46) }),
      ...(spec.items ?? []).slice(0, 4).map((item, i) =>
        T(`0${i + 1}  ${item}`, 700, 1484 + i * 38, 316, 30, {
          fontFamily: f.body, fontSize: 11, letterSpacing: 1.2, color: rgba(p.ink, 0.62),
        }),
      ),
      hairline(64, 1770, 952, rgba(p.ink, 0.22), 1),
      dept(spec.footer ?? 'ON SALE NOW  /  \u20ac9', 64, 1796, 700, rgba(p.ink, 0.4), 9),
      dept(spec.cta ?? 'SUBSCRIBE  \u2192', 820, 1796, 196, p.accent, 9, 'right'),
    );
    return template(spec, STORY, [page('Story', background, elements)]);
  }

  if (spec.variant === 'sale') {
    const background = bgSolid(p.accent);
    elements.push(
      dept(spec.kicker ?? 'MIDSEASON  /  ONLINE + IN STORE', 64, 82, 700, p.deep ?? p.ink, 10),
      dept(spec.meta ?? '48 HOURS ONLY', 700, 82, 316, rgba(p.deep ?? p.ink, 0.62), 9, 'right'),
      hairline(64, 128, 952, rgba(p.deep ?? p.ink, 0.32), 1),
      T(spec.title, 56, 190, 968, 460, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 170, 104, 7), lineHeight: 0.84,
        letterSpacing: -6, color: p.bg, fontWeight: 700, uppercase: true,
      }),
      T(spec.price ?? '50%', 64, 660, 520, 240, {
        fontFamily: f.display, fontSize: 220, lineHeight: 0.86, color: p.deep ?? p.ink, fontWeight: 700,
      }),
      T(spec.subtitle ?? 'OFF EVERYTHING', 560, 730, 456, 180, {
        fontFamily: f.display, fontSize: 48, lineHeight: 0.96, color: p.deep ?? p.ink, fontWeight: 700,
      }),
      IMG(spec.image ?? PHOTOS.shoe, 64, 980, 290, 330, { radius: 2, name: 'Product A' }),
      IMG(spec.image2 ?? PHOTOS.bag, 386, 980, 290, 330, { radius: 2, name: 'Product B' }),
      IMG(spec.image3 ?? PHOTOS.watch, 708, 980, 308, 330, { radius: 2, name: 'Product C' }),
      S('rect', 64, 1380, 952, 80, { fill: p.ink, radius: 40, name: 'CTA' }),
      T(spec.cta ?? 'SHOP THE SALE  \u2192', 64, 1406, 952, 32, {
        fontFamily: f.body, fontSize: 13, fontWeight: 700, letterSpacing: 2.6, color: p.bg, align: 'center',
      }),
      T(spec.body ?? 'Use code MIDSEASON at checkout.', 64, 1500, 700, 30, {
        fontFamily: f.body, fontSize: 14, letterSpacing: 1.2, color: rgba(p.deep ?? p.ink, 0.7),
      }),
      hairline(64, 1600, 952, rgba(p.deep ?? p.ink, 0.28), 1),
      dept(spec.footer ?? 'VELVET & VINE  /  EST. 2019', 64, 1626, 700, rgba(p.deep ?? p.ink, 0.5), 8),
      dept(spec.meta ?? 'WHILE STOCKS LAST', 820, 1626, 196, rgba(p.deep ?? p.ink, 0.5), 8, 'right'),
    );
    return template(spec, STORY, [page('Story', background, elements)]);
  }

  if (spec.variant === 'quote') {
    const background = bgSolid(p.deep ?? p.ink);
    elements.push(
      dept(spec.kicker ?? 'A NOTE ON MAKING', 64, 80, 520, rgba(p.bg, 0.55), 11),
      dept(spec.meta ?? 'EDITRIM  /  VOL. 01', 620, 80, 396, rgba(p.bg, 0.4), 9, 'right'),
      hairline(64, 126, 952, rgba(p.bg, 0.26), 1),
      T('\u201c', 64, 170, 300, 300, {
        fontFamily: f.display, fontSize: 280, lineHeight: 1, color: p.accent,
      }),
      T(spec.title, 110, 470, 860, 720, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 128, 76, 12), lineHeight: 1.02,
        letterSpacing: -2.8, color: p.bg, fontWeight: 400,
      }),
      T(spec.subtitle ?? '', 116, 1230, 600, 90, {
        fontFamily: f.accent ?? f.body, fontSize: 30, lineHeight: 1.4, color: rgba(p.bg, 0.66),
      }),
      S('ellipse', 820, 1280, 180, 180, { fill: p.accent, name: 'Seal' }),
      T(spec.price ?? '01', 820, 1340, 180, 60, {
        fontFamily: f.display, fontSize: 46, color: p.deep ?? p.ink, align: 'center',
      }),
      T(spec.body ?? '', 116, 1400, 560, 120, {
        fontFamily: f.body, fontSize: 20, lineHeight: 1.6, color: rgba(p.bg, 0.58),
      }),
      hairline(64, 1660, 952, rgba(p.bg, 0.22), 1),
      dept(spec.footer ?? 'WORDS TO KEEP  /  EDITION 01', 64, 1686, 700, rgba(p.bg, 0.42), 9),
      dept(spec.cta ?? 'SHARE THE NOTE  \u2192', 820, 1686, 196, p.accent, 9, 'right'),
    );
    return template(spec, STORY, [page('Story', background, elements)]);
  }

  // frames
  const background = bgSolid(p.bg);
  elements.push(
    dept(spec.kicker ?? 'THREE FRAMES  /  01', 64, 80, 520, rgba(p.ink, 0.58), 11),
    dept(spec.meta ?? 'A VISUAL NOTE', 620, 80, 396, rgba(p.ink, 0.42), 9, 'right'),
    hairline(64, 126, 952, rgba(p.ink, 0.26), 1),
    S('rect', 64, 190, 952, 620, { fill: p.soft ?? p.accent, name: 'Frame field' }),
    IMG(spec.image ?? PHOTOS.interior2, 84, 210, 912, 580, { name: 'Frame A' }),
    IMG(spec.image2 ?? PHOTOS.plant, 64, 860, 456, 420, { name: 'Frame B', rotation: -2 }),
    IMG(spec.image3 ?? PHOTOS.coffeeCup, 556, 880, 460, 400, { name: 'Frame C', rotation: 2 }),
    T(spec.title, 64, 1340, 900, 220, {
      fontFamily: f.display, fontSize: sizeFor(spec.title, 72, 48, 15), lineHeight: 1.02,
      letterSpacing: -2, color: p.ink, fontWeight: 700,
    }),
    T(spec.body ?? '', 64, 1600, 600, 120, {
      fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.45, color: rgba(p.ink, 0.64),
    }),
    S('rect', 64, 1730, 260, 58, { fill: p.ink, radius: 29, name: 'CTA' }),
    T(spec.cta ?? 'SEE MORE', 64, 1748, 260, 22, {
      fontFamily: f.body, fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: p.bg, align: 'center',
    }),
    dept(spec.footer ?? 'PHOTOGRAPHS  /  01\u201303', 820, 1748, 196, rgba(p.ink, 0.46), 8, 'right'),
  );
  return template(spec, STORY, [page('Story', background, elements)]);
}

/* ------------------------------------------------------------------ */
/* YouTube thumbnails                                                  */
/* ------------------------------------------------------------------ */

export type YoutubeVariant = 'face' | 'object' | 'split' | 'text' | 'dark';

export type YoutubeSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: YoutubeVariant;
  image?: string;
  title: string;
  subtitle?: string;
  channel?: string;
  meta?: string;
  cta?: string;
  badge?: string;
};

const YT = { name: 'YouTube Thumbnail', width: 1280, height: 720 };

export function youtube(spec: YoutubeSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'face') {
    const background = bgImage(spec.image ?? PHOTOS.manPortrait, p.deep ?? p.ink, 0.18);
    elements.push(
      S('rect', 0, 0, 720, 720, { fill: G(rgba(p.ink, 0.9), rgba(p.ink, 0.1), 90), name: 'Type shade' }),
      S('rect', 0, 0, 1280, 70, { fill: rgba(p.ink, 0.55), name: 'Top strip' }),
      dept(spec.channel ?? 'THE LONG TAKE', 32, 24, 600, p.bg, 10),
      dept(spec.meta ?? 'EPISODE 42', 900, 24, 348, rgba(p.bg, 0.6), 9, 'right'),
      T(spec.title, 44, 140, 760, 420, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 108, 64, 11), lineHeight: 0.92,
        letterSpacing: -2, color: p.bg, fontWeight: 700, uppercase: true,
      }),
      T(spec.subtitle ?? '', 44, 580, 620, 80, {
        fontFamily: f.body, fontSize: 22, lineHeight: 1.45, color: rgba(p.bg, 0.72),
      }),
      S('rect', 1040, 560, 190, 66, { fill: p.accent, radius: 6, name: 'Badge' }),
      T(spec.badge ?? 'NEW', 1040, 580, 190, 28, {
        fontFamily: f.body, fontSize: 17, fontWeight: 700, letterSpacing: 2, color: p.deep ?? p.ink, align: 'center',
      }),
      S('triangle', 44, 660, 0, 0, { fill: NONE, name: 'Spacer' }),
      IC('arrow-right', 700, 650, 26, p.accent, 2),
      T(spec.cta ?? 'WATCH NOW', 736, 648, 260, 26, {
        fontFamily: f.body, fontSize: 13, fontWeight: 700, letterSpacing: 2, color: p.accent, uppercase: true,
      }),
    );
    return template(spec, YT, [page('Thumbnail', background, elements)]);
  }

  if (spec.variant === 'object') {
    const background = bgSolid(p.bg);
    elements.push(
      S('ellipse', 760, 0, 500, 500, { fill: p.accent, name: 'Accent field' }),
      IMG(spec.image ?? PHOTOS.macbook, 700, 130, 520, 420, { name: 'Product image', rotation: -4 }),
      S('rect', 0, 0, 1280, 66, { fill: p.ink, name: 'Top strip' }),
      dept(spec.channel ?? 'OBJECTS  /  04', 28, 22, 600, p.bg, 10),
      dept(spec.meta ?? 'A SHORT FILM', 900, 22, 352, rgba(p.bg, 0.6), 9, 'right'),
      T(spec.title, 40, 110, 700, 380, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 72, 48, 10), lineHeight: 0.9,
        letterSpacing: -3, color: p.ink, fontWeight: 700, uppercase: true,
      }),
      T(spec.subtitle ?? '', 40, 500, 560, 80, {
        fontFamily: f.body, fontSize: 21, lineHeight: 1.45, color: rgba(p.ink, 0.68),
      }),
      S('rect', 40, 610, 240, 58, { fill: p.ink, radius: 29, name: 'CTA' }),
      T(spec.cta ?? 'WATCH THE FILM', 40, 628, 240, 22, {
        fontFamily: f.body, fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: p.bg, align: 'center',
      }),
      T(spec.badge ?? '04', 1180, 560, 60, 60, {
        fontFamily: f.display, fontSize: 40, color: p.accent, align: 'center',
      }),
      S('star', 1180, 120, 52, 52, { fill: p.ink, name: 'Star' }),
    );
    return template(spec, YT, [page('Thumbnail', background, elements)]);
  }

  if (spec.variant === 'split') {
    const background = bgSolid(p.bg);
    elements.push(
      S('rect', 640, 0, 640, 720, { fill: p.ink, name: 'Right field' }),
      IMG(spec.image ?? PHOTOS.workout, 0, 0, 640, 720, { name: 'Left image' }),
      S('rect', 640, 0, 8, 720, { fill: p.accent, name: 'Accent seam' }),
      dept(spec.channel ?? 'THE PROTOCOL', 680, 44, 540, rgba(p.bg, 0.5), 10),
      dept(spec.meta ?? 'WEEK 04', 1100, 44, 132, rgba(p.bg, 0.4), 9, 'right'),
      T(spec.title, 680, 130, 540, 380, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 98, 58, 10), lineHeight: 0.94,
        letterSpacing: -2, color: p.bg, fontWeight: 700, uppercase: true,
      }),
      T(spec.subtitle ?? '', 680, 540, 500, 80, {
        fontFamily: f.body, fontSize: 20, lineHeight: 1.45, color: rgba(p.bg, 0.66),
      }),
      T(spec.badge ?? '4 WEEKS', 680, 646, 240, 24, {
        fontFamily: f.body, fontSize: 11, fontWeight: 700, letterSpacing: 2.2, color: p.accent, uppercase: true,
      }),
      T(spec.cta ?? 'START HERE  \u2192', 1020, 646, 212, 24, {
        fontFamily: f.body, fontSize: 11, fontWeight: 700, letterSpacing: 1.8, color: p.bg, align: 'right',
      }),
      S('line', 680, 620, 552, 1, { fill: NONE, stroke: rgba(p.bg, 0.22), strokeWidth: 1 }),
    );
    return template(spec, YT, [page('Thumbnail', background, elements)]);
  }

  if (spec.variant === 'text') {
    const background = bgSolid(p.accent);
    elements.push(
      S('rect', 0, 0, 1280, 720, { fill: NONE, stroke: rgba(p.deep ?? p.ink, 0.24), strokeWidth: 2, name: 'Frame' }),
      dept(spec.channel ?? 'THE BRIEF  /  09', 32, 28, 600, rgba(p.deep ?? p.ink, 0.6), 10),
      dept(spec.meta ?? 'EXPLAINED', 900, 28, 348, rgba(p.deep ?? p.ink, 0.46), 9, 'right'),
      T(spec.title, 36, 100, 1208, 440, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 72, 48, 12), lineHeight: 0.86,
        letterSpacing: -4, color: p.deep ?? p.ink, fontWeight: 700, uppercase: true,
      }),
      T(spec.subtitle ?? '', 40, 550, 720, 80, {
        fontFamily: f.accent ?? f.body, fontSize: 24, lineHeight: 1.4, color: rgba(p.deep ?? p.ink, 0.66),
      }),
      S('ellipse', 1080, 540, 120, 120, { fill: p.bg, name: 'Play seal' }),
      T('\u25b6', 1080, 572, 120, 50, {
        fontFamily: f.body, fontSize: 34, color: p.deep ?? p.ink, align: 'center',
      }),
      T(spec.badge ?? '09', 40, 656, 200, 32, {
        fontFamily: f.body, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.5),
      }),
      T(spec.cta ?? 'THE FULL STORY', 940, 656, 300, 32, {
        fontFamily: f.body, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: rgba(p.deep ?? p.ink, 0.5), align: 'right',
      }),
    );
    return template(spec, YT, [page('Thumbnail', background, elements)]);
  }

  const background = bgImage(spec.image ?? PHOTOS.circuit, p.deep ?? '#05070A', 0.42);
  elements.push(
    S('rect', 0, 0, 1280, 720, { fill: rgba(p.deep ?? '#05070A', 0.35), name: 'Tech wash' }),
    dept(spec.channel ?? 'SIGNAL  /  EP. 12', 32, 26, 600, p.accent, 10),
    dept(spec.meta ?? '4K  /  18 MIN', 900, 26, 348, rgba(p.bg, 0.6), 9, 'right'),
    T(spec.title, 40, 130, 900, 360, {
      fontFamily: f.display, fontSize: sizeFor(spec.title, 96, 58, 12), lineHeight: 0.92,
      letterSpacing: -2.4, color: p.bg, fontWeight: 700, uppercase: true,
    }),
    T(spec.subtitle ?? '', 44, 510, 660, 90, {
      fontFamily: f.body, fontSize: 22, lineHeight: 1.45, color: rgba(p.bg, 0.7),
    }),
    S('rect', 44, 620, 260, 58, { fill: p.accent, radius: 29, name: 'CTA' }),
    T(spec.cta ?? 'WATCH THE BREAKDOWN', 44, 638, 260, 22, {
      fontFamily: f.body, fontSize: 8.5, fontWeight: 700, letterSpacing: 1.6, color: p.deep ?? '#05070A', align: 'center',
    }),
    T(spec.badge ?? 'LIVE', 1100, 600, 132, 44, {
      fontFamily: f.body, fontSize: 14, fontWeight: 700, letterSpacing: 2, color: p.accent, align: 'right',
    }),
    S('line', 44, 580, 600, 1, { fill: NONE, stroke: rgba(p.bg, 0.24), strokeWidth: 1 }),
    IC('bolt', 1180, 120, 56, p.accent, 1.6),
  );
  return template(spec, YT, [page('Thumbnail', background, elements)]);
}

/* ------------------------------------------------------------------ */
/* Podcast covers                                                      */
/* ------------------------------------------------------------------ */

export type PodcastVariant = 'mic' | 'type' | 'portrait' | 'abstract' | 'ticket';

export type PodcastSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: PodcastVariant;
  image?: string;
  show: string;
  title: string;
  host?: string;
  meta?: string;
  cta?: string;
  badge?: string;
};

const POD = { name: 'Podcast Cover', width: 1000, height: 1000 };

export function podcast(spec: PodcastSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const elements: El[] = [];

  if (spec.variant === 'mic') {
    const background = bgSolid(p.bg);
    elements.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.2), strokeWidth: 1, name: 'Frame' }),
      dept(spec.show, 80, 76, 500, rgba(p.ink, 0.54), 10),
      dept(spec.meta ?? 'EP. 42', 720, 76, 200, rgba(p.ink, 0.4), 9, 'right'),
      IMG(spec.image ?? PHOTOS.mic, 500, 130, 400, 400, { name: 'Microphone', radius: 200 }),
      T(spec.title, 80, 300, 420, 300, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 72, 44, 12), lineHeight: 1.02,
        letterSpacing: -1.6, color: p.ink, fontWeight: 700,
      }),
      T(spec.host ?? 'WITH MAYA CHEN', 80, 640, 400, 30, {
        fontFamily: f.body, fontSize: 12, letterSpacing: 2.2, color: rgba(p.ink, 0.48),
      }),
      S('rect', 80, 720, 840, 1, { fill: rgba(p.ink, 0.24), name: 'Rule' }),
      T(spec.cta ?? 'NEW EPISODES EVERY TUESDAY', 80, 760, 600, 26, {
        fontFamily: f.body, fontSize: 10, letterSpacing: 2.2, color: rgba(p.ink, 0.5),
      }),
      S('ellipse', 760, 740, 160, 160, { fill: p.accent, name: 'Episode seal' }),
      T(spec.badge ?? '42', 760, 790, 160, 60, {
        fontFamily: f.display, fontSize: 48, color: p.deep ?? p.ink, align: 'center',
      }),
      T('EDITRIM AUDIO', 80, 900, 400, 24, {
        fontFamily: f.body, fontSize: 9, letterSpacing: 3, color: rgba(p.ink, 0.36),
      }),
      T('01', 840, 900, 80, 24, { fontFamily: f.body, fontSize: 9, letterSpacing: 2, color: rgba(p.ink, 0.36), align: 'right' }),
    );
    return template(spec, POD, [page('Cover', background, elements)]);
  }

  if (spec.variant === 'type') {
    const background = bgSolid(p.accent);
    elements.push(
      S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.deep ?? p.ink, 0.24), strokeWidth: 1, name: 'Frame' }),
      dept(spec.show, 80, 76, 500, rgba(p.deep ?? p.ink, 0.56), 10),
      dept(spec.meta ?? 'SEASON 03', 720, 76, 200, rgba(p.deep ?? p.ink, 0.42), 9, 'right'),
      T(spec.title, 70, 170, 860, 440, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 116, 66, 11), lineHeight: 0.9,
        letterSpacing: -4, color: p.deep ?? p.ink, fontWeight: 700, uppercase: true,
      }),
      T(spec.host ?? 'HOSTED BY MAYA CHEN', 80, 650, 500, 28, {
        fontFamily: f.body, fontSize: 11, letterSpacing: 2.4, color: rgba(p.deep ?? p.ink, 0.56),
      }),
      S('line', 80, 710, 840, 1, { fill: NONE, stroke: rgba(p.deep ?? p.ink, 0.28), strokeWidth: 1 }),
      T(spec.cta ?? 'A SHOW ABOUT THE WORK BEHIND THE WORK', 80, 748, 600, 50, {
        fontFamily: f.body, fontSize: 13, lineHeight: 1.5, color: rgba(p.deep ?? p.ink, 0.58),
      }),
      S('ellipse', 790, 740, 130, 130, { fill: p.bg, name: 'Play button' }),
      T('\u25b6', 790, 782, 130, 46, { fontFamily: f.body, fontSize: 30, color: p.deep ?? p.ink, align: 'center' }),
      T(spec.badge ?? '42', 80, 880, 200, 50, {
        fontFamily: f.display, fontSize: 42, color: p.deep ?? p.ink,
      }),
      T('EDITRIM AUDIO', 800, 894, 120, 20, { fontFamily: f.body, fontSize: 8, letterSpacing: 1.8, color: rgba(p.deep ?? p.ink, 0.4), align: 'right' }),
    );
    return template(spec, POD, [page('Cover', background, elements)]);
  }

  if (spec.variant === 'portrait') {
    const background = bgSolid(p.bg);
    elements.push(
      IMG(spec.image ?? PHOTOS.womanPortrait, 0, 0, 1000, 720, { name: 'Host portrait', filters: { brightness: 96, contrast: 108, saturate: 86, blur: 0, grayscale: 15, sepia: 0, hue: 0 } }),
      S('rect', 0, 620, 1000, 380, { fill: p.ink, name: 'Bottom field' }),
      S('rect', 0, 620, 1000, 8, { fill: p.accent, name: 'Accent seam' }),
      dept(spec.show, 48, 660, 500, rgba(p.bg, 0.58), 10),
      dept(spec.meta ?? 'EP. 42', 800, 660, 152, rgba(p.bg, 0.4), 9, 'right'),
      T(spec.title, 48, 720, 680, 140, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 66, 40, 15), lineHeight: 1.02,
        letterSpacing: -1.2, color: p.bg, fontWeight: 700,
      }),
      T(spec.host ?? 'WITH MAYA CHEN', 48, 900, 500, 26, {
        fontFamily: f.body, fontSize: 10, letterSpacing: 2.2, color: rgba(p.bg, 0.48),
      }),
      S('ellipse', 820, 760, 120, 120, { fill: p.accent, name: 'Episode seal' }),
      T(spec.badge ?? '42', 820, 804, 120, 40, { fontFamily: f.display, fontSize: 32, color: p.deep ?? p.ink, align: 'center' }),
      T(spec.cta ?? 'NEW EPISODES WEEKLY', 820, 900, 130, 22, { fontFamily: f.body, fontSize: 8, letterSpacing: 1.6, color: rgba(p.bg, 0.44), align: 'right' }),
    );
    return template(spec, POD, [page('Cover', background, elements)]);
  }

  if (spec.variant === 'abstract') {
    const background = bgSolid(p.deep ?? p.ink);
    elements.push(
      S('ellipse', 560, 0, 440, 440, { fill: p.accent, name: 'Orb A' }),
      S('ring', 420, 300, 420, 420, { fill: NONE, stroke: rgba(p.bg, 0.28), strokeWidth: 2, name: 'Orbit' }),
      S('diamond', 700, 600, 200, 200, { fill: p.bg, opacity: 0.12, name: 'Diamond field' }),
      dept(spec.show, 64, 72, 500, rgba(p.bg, 0.55), 10),
      dept(spec.meta ?? 'SEASON 03', 700, 72, 236, rgba(p.bg, 0.4), 9, 'right'),
      T(spec.title, 64, 280, 620, 300, {
        fontFamily: f.display, fontSize: sizeFor(spec.title, 98, 58, 11), lineHeight: 0.9,
        letterSpacing: -3, color: p.bg, fontWeight: 700, uppercase: true,
      }),
      T(spec.host ?? 'HOSTED BY MAYA CHEN', 64, 650, 500, 26, {
        fontFamily: f.body, fontSize: 11, letterSpacing: 2.2, color: rgba(p.bg, 0.52),
      }),
      S('line', 64, 720, 872, 1, { fill: NONE, stroke: rgba(p.bg, 0.22), strokeWidth: 1 }),
      T(spec.cta ?? 'A SHOW ABOUT SYSTEMS, SIGNALS AND THE SPACE BETWEEN', 64, 758, 620, 60, {
        fontFamily: f.body, fontSize: 13, lineHeight: 1.55, color: rgba(p.bg, 0.58),
      }),
      T(spec.badge ?? '42', 820, 850, 116, 56, { fontFamily: f.display, fontSize: 44, color: p.accent, align: 'right' }),
      T('EDITRIM AUDIO', 64, 900, 300, 22, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.bg, 0.38) }),
    );
    return template(spec, POD, [page('Cover', background, elements)]);
  }

  const background = bgSolid(p.bg);
  elements.push(
    S('rect', 40, 40, 920, 920, { fill: NONE, stroke: rgba(p.ink, 0.24), strokeWidth: 1, name: 'Frame' }),
    dept(spec.show, 80, 76, 500, rgba(p.ink, 0.56), 10),
    dept(spec.meta ?? 'ADMIT ONE', 720, 76, 200, rgba(p.ink, 0.42), 9, 'right'),
    T(spec.title, 80, 160, 840, 300, {
      fontFamily: f.display, fontSize: sizeFor(spec.title, 94, 56, 12), lineHeight: 0.98,
      letterSpacing: -2.4, color: p.ink, fontWeight: 700,
    }),
    S('rect', 80, 540, 840, 2, { fill: p.ink, name: 'Rule' }),
    T(spec.host ?? 'WITH MAYA CHEN', 80, 580, 500, 26, {
      fontFamily: f.body, fontSize: 11, letterSpacing: 2.2, color: rgba(p.ink, 0.52),
    }),
    T(spec.cta ?? 'EVERY TUESDAY  /  EDITRIM AUDIO', 80, 620, 600, 26, {
      fontFamily: f.body, fontSize: 10, letterSpacing: 1.8, color: rgba(p.ink, 0.42),
    }),
    ...barcode(80, 700, 500, 70, p.ink, 20),
    T(spec.badge ?? '42', 700, 680, 220, 120, {
      fontFamily: f.display, fontSize: 96, color: p.accent, align: 'right',
    }),
    T('SCAN TO LISTEN', 80, 800, 300, 22, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.4) }),
    T('EDITRIM', 700, 830, 220, 22, { fontFamily: f.body, fontSize: 8, letterSpacing: 2, color: rgba(p.ink, 0.4), align: 'right' }),
  );
  return template(spec, POD, [page('Cover', background, elements)]);
}

/* ------------------------------------------------------------------ */
/* Banners                                                             */
/* ------------------------------------------------------------------ */

export type BannerVariant = 'split' | 'photo' | 'color' | 'grid' | 'sale' | 'email' | 'channel';

export type BannerSpec = TemplateMeta & {
  palette: Palette;
  fonts: TypePair;
  variant: BannerVariant;
  image?: string;
  brand: string;
  headline: string;
  sub?: string;
  cta?: string;
  meta?: string;
  items?: string[];
  size?: DesignSize;
};

export function banner(spec: BannerSpec): TemplateSpecResult {
  const { palette: p, fonts: f } = spec;
  const size = spec.size ?? { name: 'Banner', width: 1584, height: 396 };
  const w = size.width;
  const h = size.height;
  const elements: El[] = [];
  const pad = Math.round(h * 0.16);
  const headlineSize = sizeFor(spec.headline, Math.round(h * 0.22), Math.round(h * 0.12), Math.max(10, Math.round((w * 0.55) / (h * 0.22 * 0.55))));

  if (spec.variant === 'split') {
    const background = bgSolid(p.bg);
    elements.push(
      S('rect', 0, 0, Math.round(w * 0.58), h, { fill: p.accent, name: 'Type field' }),
      IMG(spec.image ?? PHOTOS.office, Math.round(w * 0.58), 0, Math.round(w * 0.42), h, { name: 'Hero image' }),
      dept(spec.brand, pad, Math.round(h * 0.12), Math.round(w * 0.4), rgba(p.bg, 0.72), Math.max(8, Math.round(h * 0.028))),
      T(spec.headline, pad, Math.round(h * 0.26), Math.round(w * 0.52), Math.round(h * 0.44), {
        fontFamily: f.display, fontSize: headlineSize, lineHeight: 0.96,
        letterSpacing: -Math.min(3, headlineSize * 0.03), color: p.bg, fontWeight: 700,
      }),
      T(spec.sub ?? '', pad, Math.round(h * 0.72), Math.round(w * 0.46), Math.round(h * 0.18), {
        fontFamily: f.body, fontSize: Math.max(10, Math.round(h * 0.045)), lineHeight: 1.45, color: rgba(p.bg, 0.8),
      }),
      S('rect', Math.round(w * 0.58) - 2, 0, 4, h, { fill: p.bg, name: 'Seam' }),
      T(spec.cta ?? 'LEARN MORE  \u2192', pad, Math.round(h * 0.88), Math.round(w * 0.3), Math.round(h * 0.08), {
        fontFamily: f.body, fontSize: Math.max(8, Math.round(h * 0.025)), fontWeight: 700, letterSpacing: 1.8, color: p.bg,
      }),
      T(spec.meta ?? 'EDITRIM  /  2026', Math.round(w * 0.6), Math.round(h * 0.88), Math.round(w * 0.36), Math.round(h * 0.08), {
        fontFamily: f.body, fontSize: Math.max(8, Math.round(h * 0.024)), letterSpacing: 1.6, color: rgba(p.bg, 0.58), align: 'right',
      }),
    );
    return template(spec, size, [page('Banner', background, elements)]);
  }

  if (spec.variant === 'photo') {
    const background = bgImage(spec.image ?? PHOTOS.city, p.deep ?? p.ink, 0.48);
    elements.push(
      S('rect', 0, 0, Math.round(w * 0.56), h, { fill: G(rgba(p.ink, 0.86), rgba(p.ink, 0.1), 90), name: 'Type shade' }),
      dept(spec.brand, pad, Math.round(h * 0.12), Math.round(w * 0.4), p.accent, Math.max(8, Math.round(h * 0.028))),
      T(spec.headline, pad, Math.round(h * 0.28), Math.round(w * 0.5), Math.round(h * 0.42), {
        fontFamily: f.display, fontSize: headlineSize, lineHeight: 0.94,
        letterSpacing: -Math.min(3, headlineSize * 0.03), color: p.bg, fontWeight: 700,
      }),
      T(spec.sub ?? '', pad, Math.round(h * 0.74), Math.round(w * 0.44), Math.round(h * 0.15), {
        fontFamily: f.body, fontSize: Math.max(9, Math.round(h * 0.04)), lineHeight: 1.45, color: rgba(p.bg, 0.72),
      }),
      S('rect', Math.round(w * 0.72), Math.round(h * 0.66), Math.round(w * 0.2), Math.round(h * 0.18), { fill: p.accent, radius: Math.round(h * 0.09), name: 'CTA' }),
      T(spec.cta ?? 'DISCOVER', Math.round(w * 0.72), Math.round(h * 0.7), Math.round(w * 0.2), Math.round(h * 0.08), {
        fontFamily: f.body, fontSize: Math.max(8, Math.round(h * 0.024)), fontWeight: 700, letterSpacing: 1.6, color: p.deep ?? p.ink, align: 'center',
      }),
      T(spec.meta ?? 'A NEW SEASON', Math.round(w * 0.72), Math.round(h * 0.88), Math.round(w * 0.24), Math.round(h * 0.06), {
        fontFamily: f.body, fontSize: Math.max(7, Math.round(h * 0.022)), letterSpacing: 1.6, color: rgba(p.bg, 0.58), align: 'right',
      }),
    );
    return template(spec, size, [page('Banner', background, elements)]);
  }

  if (spec.variant === 'color') {
    const background = bgSolid(p.ink);
    elements.push(
      S('ellipse', Math.round(w * 0.72), 0, Math.round(h * 0.9), Math.round(h * 0.9), { fill: p.accent, name: 'Accent orb' }),
      dept(spec.brand, pad, Math.round(h * 0.12), Math.round(w * 0.4), rgba(p.bg, 0.56), Math.max(8, Math.round(h * 0.028))),
      T(spec.headline, pad, Math.round(h * 0.24), Math.round(w * 0.66), Math.round(h * 0.46), {
        fontFamily: f.display, fontSize: headlineSize, lineHeight: 0.94,
        letterSpacing: -Math.min(3, headlineSize * 0.03), color: p.bg, fontWeight: 700,
      }),
      T(spec.sub ?? '', pad, Math.round(h * 0.74), Math.round(w * 0.5), Math.round(h * 0.14), {
        fontFamily: f.body, fontSize: Math.max(9, Math.round(h * 0.04)), lineHeight: 1.45, color: rgba(p.bg, 0.64),
      }),
      T(spec.cta ?? 'EXPLORE  \u2192', pad, Math.round(h * 0.9), Math.round(w * 0.3), Math.round(h * 0.06), {
        fontFamily: f.body, fontSize: Math.max(8, Math.round(h * 0.024)), fontWeight: 700, letterSpacing: 1.8, color: p.accent,
      }),
      T(spec.meta ?? 'EDITRIM  /  2026', Math.round(w * 0.78), Math.round(h * 0.86), Math.round(w * 0.18), Math.round(h * 0.08), {
        fontFamily: f.body, fontSize: Math.max(7, Math.round(h * 0.022)), letterSpacing: 1.6, color: rgba(p.bg, 0.5), align: 'right',
      }),
      S('line', pad, Math.round(h * 0.2), Math.round(w * 0.84), 1, { fill: NONE, stroke: rgba(p.bg, 0.22), strokeWidth: 1 }),
      S('diamond', Math.round(w * 0.88), Math.round(h * 0.12), Math.round(h * 0.1), Math.round(h * 0.1), { fill: p.bg, name: 'Diamond' }),
    );
    return template(spec, size, [page('Banner', background, elements)]);
  }

  if (spec.variant === 'grid') {
    const background = bgSolid(p.bg);
    elements.push(
      dept(spec.brand, pad, Math.round(h * 0.1), Math.round(w * 0.4), p.ink, Math.max(8, Math.round(h * 0.026))),
      T(spec.headline, pad, Math.round(h * 0.22), Math.round(w * 0.52), Math.round(h * 0.46), {
        fontFamily: f.display, fontSize: headlineSize, lineHeight: 0.94,
        letterSpacing: -Math.min(3, headlineSize * 0.03), color: p.ink, fontWeight: 700,
      }),
      ...(spec.items ?? []).slice(0, 3).flatMap((item, i) => [
        S('rect', Math.round(w * 0.62) + i * Math.round(w * 0.12), Math.round(h * 0.30), Math.round(w * 0.1), Math.round(h * 0.34), { fill: i === 0 ? p.accent : p.soft ?? rgba(p.ink, 0.08), name: 'Grid panel' }),
        T(`0${i + 1}`, Math.round(w * 0.62) + i * Math.round(w * 0.12), Math.round(h * 0.36), Math.round(w * 0.1), Math.round(h * 0.08), { fontFamily: f.body, fontSize: Math.max(8, Math.round(h * 0.024)), color: i === 0 ? p.deep ?? p.ink : rgba(p.ink, 0.5), align: 'center' }),
        T(item, Math.round(w * 0.62) + i * Math.round(w * 0.12), Math.round(h * 0.46), Math.round(w * 0.1), Math.round(h * 0.12), { fontFamily: f.body, fontSize: Math.max(7, Math.round(h * 0.022)), color: i === 0 ? p.deep ?? p.ink : rgba(p.ink, 0.56), align: 'center' }),
      ]),
      T(spec.sub ?? '', pad, Math.round(h * 0.74), Math.round(w * 0.46), Math.round(h * 0.14), {
        fontFamily: f.body, fontSize: Math.max(9, Math.round(h * 0.036)), lineHeight: 1.45, color: rgba(p.ink, 0.6),
      }),
      T(spec.cta ?? 'SEE THE WORK  \u2192', pad, Math.round(h * 0.9), Math.round(w * 0.3), Math.round(h * 0.06), {
        fontFamily: f.body, fontSize: Math.max(8, Math.round(h * 0.024)), fontWeight: 700, letterSpacing: 1.8, color: p.accent,
      }),
      T(spec.meta ?? '2026', Math.round(w * 0.88), Math.round(h * 0.9), Math.round(w * 0.08), Math.round(h * 0.06), {
        fontFamily: f.body, fontSize: Math.max(7, Math.round(h * 0.022)), letterSpacing: 1.6, color: rgba(p.ink, 0.42), align: 'right',
      }),
    );
    return template(spec, size, [page('Banner', background, elements)]);
  }

  if (spec.variant === 'sale') {
    const background = bgSolid(p.accent);
    elements.push(
      dept(spec.brand, pad, Math.round(h * 0.1), Math.round(w * 0.4), rgba(p.deep ?? p.ink, 0.62), Math.max(8, Math.round(h * 0.026))),
      T(spec.headline, pad, Math.round(h * 0.2), Math.round(w * 0.66), Math.round(h * 0.48), {
        fontFamily: f.display, fontSize: headlineSize, lineHeight: 0.9,
        letterSpacing: -Math.min(4, headlineSize * 0.035), color: p.deep ?? p.ink, fontWeight: 700, uppercase: true,
      }),
      T(spec.sub ?? '', pad, Math.round(h * 0.74), Math.round(w * 0.5), Math.round(h * 0.12), {
        fontFamily: f.body, fontSize: Math.max(9, Math.round(h * 0.038)), lineHeight: 1.45, color: rgba(p.deep ?? p.ink, 0.66),
      }),
      S('rect', Math.round(w * 0.74), Math.round(h * 0.68), Math.round(w * 0.18), Math.round(h * 0.18), { fill: p.ink, radius: Math.round(h * 0.09), name: 'CTA' }),
      T(spec.cta ?? 'SHOP NOW', Math.round(w * 0.74), Math.round(h * 0.72), Math.round(w * 0.18), Math.round(h * 0.08), {
        fontFamily: f.body, fontSize: Math.max(8, Math.round(h * 0.024)), fontWeight: 700, letterSpacing: 1.6, color: p.bg, align: 'center',
      }),
      T(spec.meta ?? '48 HOURS ONLY', Math.round(w * 0.74), Math.round(h * 0.9), Math.round(w * 0.22), Math.round(h * 0.06), {
        fontFamily: f.body, fontSize: Math.max(7, Math.round(h * 0.022)), letterSpacing: 1.6, color: rgba(p.deep ?? p.ink, 0.54), align: 'right',
      }),
      S('star', Math.round(w * 0.88), Math.round(h * 0.18), Math.round(h * 0.14), Math.round(h * 0.14), { fill: p.ink, name: 'Star' }),
    );
    return template(spec, size, [page('Banner', background, elements)]);
  }

  if (spec.variant === 'email') {
    const background = bgSolid(p.bg);
    elements.push(
      IMG(spec.image ?? PHOTOS.bread, Math.round(w * 0.58), 0, Math.round(w * 0.42), h, { name: 'Email image' }),
      dept(spec.brand, pad, Math.round(h * 0.14), Math.round(w * 0.4), rgba(p.ink, 0.56), Math.max(8, Math.round(h * 0.028))),
      T(spec.headline, pad, Math.round(h * 0.26), Math.round(w * 0.5), Math.round(h * 0.38), {
        fontFamily: f.display, fontSize: headlineSize, lineHeight: 0.96,
        letterSpacing: -Math.min(2, headlineSize * 0.03), color: p.ink, fontWeight: 700,
      }),
      T(spec.sub ?? '', pad, Math.round(h * 0.66), Math.round(w * 0.46), Math.round(h * 0.16), {
        fontFamily: f.body, fontSize: Math.max(9, Math.round(h * 0.038)), lineHeight: 1.45, color: rgba(p.ink, 0.6),
      }),
      S('rect', pad, Math.round(h * 0.84), Math.round(w * 0.24), Math.round(h * 0.1), { fill: p.ink, radius: Math.round(h * 0.05), name: 'CTA' }),
      T(spec.cta ?? 'READ THE NOTE', pad, Math.round(h * 0.865), Math.round(w * 0.24), Math.round(h * 0.06), {
        fontFamily: f.body, fontSize: Math.max(7, Math.round(h * 0.022)), fontWeight: 700, letterSpacing: 1.4, color: p.bg, align: 'center',
      }),
      T(spec.meta ?? 'WEEKLY NOTE  /  07', Math.round(w * 0.62), Math.round(h * 0.86), Math.round(w * 0.34), Math.round(h * 0.06), {
        fontFamily: f.body, fontSize: Math.max(7, Math.round(h * 0.022)), letterSpacing: 1.6, color: rgba(p.ink, 0.42), align: 'right',
      }),
      S('line', pad, Math.round(h * 0.76), Math.round(w * 0.9), 1, { fill: NONE, stroke: rgba(p.ink, 0.18), strokeWidth: 1 }),
    );
    return template(spec, size, [page('Email header', background, elements)]);
  }

  // channel art
  const background = bgImage(spec.image ?? PHOTOS.workspace, p.deep ?? p.ink, 0.5);
  elements.push(
    S('rect', 0, 0, Math.round(w * 0.62), h, { fill: G(rgba(p.ink, 0.88), rgba(p.ink, 0.05), 90), name: 'Type shade' }),
    dept(spec.brand, Math.round(w * 0.08), Math.round(h * 0.12), Math.round(w * 0.4), p.accent, 14),
    T(spec.headline, Math.round(w * 0.08), Math.round(h * 0.24), Math.round(w * 0.56), Math.round(h * 0.4), {
      fontFamily: f.display, fontSize: sizeFor(spec.headline, Math.round(h * 0.13), Math.round(h * 0.08), 14), lineHeight: 0.94,
      letterSpacing: -3, color: p.bg, fontWeight: 700,
    }),
    T(spec.sub ?? '', Math.round(w * 0.08), Math.round(h * 0.7), Math.round(w * 0.44), Math.round(h * 0.12), {
      fontFamily: f.body, fontSize: 22, lineHeight: 1.45, color: rgba(p.bg, 0.7),
    }),
    S('rect', Math.round(w * 0.08), Math.round(h * 0.86), Math.round(w * 0.16), Math.round(h * 0.07), { fill: p.accent, radius: Math.round(h * 0.035), name: 'CTA' }),
    T(spec.cta ?? 'SUBSCRIBE', Math.round(w * 0.08), Math.round(h * 0.878), Math.round(w * 0.16), Math.round(h * 0.04), {
      fontFamily: f.body, fontSize: 12, fontWeight: 700, letterSpacing: 2, color: p.deep ?? p.ink, align: 'center',
    }),
    T(spec.meta ?? 'NEW VIDEO EVERY FRIDAY', Math.round(w * 0.64), Math.round(h * 0.88), Math.round(w * 0.28), Math.round(h * 0.04), {
      fontFamily: f.body, fontSize: 11, letterSpacing: 2, color: rgba(p.bg, 0.56), align: 'right',
    }),
    S('line', Math.round(w * 0.08), Math.round(h * 0.2), Math.round(w * 0.84), 1, { fill: NONE, stroke: rgba(p.bg, 0.24), strokeWidth: 1 }),
  );
  return template(spec, size, [page('Channel art', background, elements)]);
}
