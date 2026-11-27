import { applyBrandToDesign } from './brandApply';
import { createResizeVariant, type ResizeTarget } from './resize';
import { saveDesign } from './storage';
import type { BrandKit, Design, TextElement } from './types';

export type CampaignBriefInput = {
  headline?: string;
  subheadline?: string;
  cta?: string;
  applyBrand?: boolean;
};

/**
 * Applies optional headline/subheadline/CTA overrides (ranked by fontSize on page 0)
 * and optional Brand Kit styling to a cloned design, then persists it locally.
 */
export function applyCampaignBriefToDesign(
  source: Design,
  brief: CampaignBriefInput,
  brand: BrandKit,
): Design {
  let next: Design = structuredClone(source);
  const page = next.pages[0];
  if (page) {
    const texts = page.elements
      .filter((el): el is TextElement => el.type === 'text' && !el.hidden)
      .sort((a, b) => b.fontSize - a.fontSize || a.y - b.y);

    const h = brief.headline?.trim();
    const s = brief.subheadline?.trim();
    const c = brief.cta?.trim();

    if (h && texts[0]) texts[0].text = h;
    if (s && texts[1]) texts[1].text = s;
    if (c) {
      const ctaTarget =
        texts.slice(2).find(t => t.fontSize <= 24 || t.text.length <= 28) ??
        texts[texts.length - 1];
      if (ctaTarget && ctaTarget.id !== texts[0]?.id) {
        ctaTarget.text = c;
      }
    }
  }

  if (brief.applyBrand) {
    next = applyBrandToDesign(next, brand, 'all', 0).design;
  }
  return saveDesign(next);
}

/**
 * Generates multi-size campaign variants locally, sharing the base design's `rootId`.
 */
export function generateCampaignVariants(
  baseDesign: Design,
  targets: ResizeTarget[],
  brief: CampaignBriefInput,
  brand: BrandKit,
): { base: Design; variants: Design[] } {
  const preparedBase = applyCampaignBriefToDesign(baseDesign, brief, brand);
  const rootId = preparedBase.rootId ?? preparedBase.id;
  const baseWithRoot = preparedBase.rootId === rootId
    ? preparedBase
    : saveDesign({ ...preparedBase, rootId });

  const variants = targets.map(target => createResizeVariant(baseWithRoot, target));
  return { base: baseWithRoot, variants };
}
