export * from './canvasFormats';
export * from './typography';
export * from './timeline';
export * from './vectors';
export * from './colorEngine';
export * from './presentationKit';
export * from './layoutEngine';
export * from './brandHub';

import { CANVAS_FORMATS, PRINT_STANDARDS, fitCanvas, printPixels } from './canvasFormats';
import { ALL_FONT_ASSETS, FONT_PAIRINGS, TEXT_EFFECTS } from './typography';
import { TIMELINE_COMPOSITIONS, TRANSITIONS, validateTimeline } from './timeline';
import { BUILT_IN_VECTORS, DEVICE_MOCKUPS, MASK_FRAMES, PARAMETRIC_SHAPES, VECTOR_ASSETS, clusterVectors, parametricPath } from './vectors';
import { GRADIENT_PRESETS, MOOD_PALETTES, toCssGradient } from './colorEngine';
import { CHART_WRAPPERS, SLIDE_ARCHETYPES, SLIDE_DECK_TEMPLATES, pieSlices } from './presentationKit';
import { LAYOUT_TEST_BOXES, reflowLayout } from './layoutEngine';
import { BRAND_ASSET_BUNDLE, DEFAULT_BRAND_HUB, checkBrandChange } from './brandHub';

export const ENGINE_SCHEMA_VERSION = '1.0.0';

export type SchemaCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export type EngineValidation = {
  ok: boolean;
  version: string;
  checks: SchemaCheck[];
  counts: Record<string, number>;
};

export function validateEngineSchema(): EngineValidation {
  const checks: SchemaCheck[] = [];
  const check = (name: string, ok: boolean, detail: string) => checks.push({ name, ok, detail });

  check('canvas formats', CANVAS_FORMATS.length >= 59 && CANVAS_FORMATS.every(format => format.width > 0 && format.height > 0),
    `${CANVAS_FORMATS.length} formats, all dimensions positive`);
  const a4 = printPixels(PRINT_STANDARDS.a4);
  const letter = printPixels(PRINT_STANDARDS['us-letter']);
  const card = printPixels(PRINT_STANDARDS['business-card']);
  check('print standards', a4.width === 1240 && a4.height === 1754 && letter.width === 1275 && card.width === 1050,
    `A4 ${a4.width}×${a4.height}, Letter ${letter.width}×${letter.height}, Card ${card.width}×${card.height}`);
  const fitted = fitCanvas(CANVAS_FORMATS[0], 800, 600, 24);
  check('aspect fit', fitted.width <= 752 && fitted.height <= 552, `${Math.round(fitted.width)}×${Math.round(fitted.height)}`);

  check('font providers', ALL_FONT_ASSETS.length >= 16 && ALL_FONT_ASSETS.every(font => font.source.length > 0),
    `${ALL_FONT_ASSETS.length} faces with source mappings`);
  check('text effects', TEXT_EFFECTS.length >= 6 && TEXT_EFFECTS.every(effect => effect.id.length > 0),
    `${TEXT_EFFECTS.length} serialisable presets`);
  check('font pairings', FONT_PAIRINGS.length >= 8 && FONT_PAIRINGS.every(pair => pair.header.family && pair.subheader.family && pair.body.family),
    `${FONT_PAIRINGS.length} three-role hierarchies`);

  const timelineErrors = TIMELINE_COMPOSITIONS.flatMap(validateTimeline);
  check('timeline clips', timelineErrors.length === 0 && TRANSITIONS.length >= 5,
    `${TIMELINE_COMPOSITIONS.length} compositions, ${TRANSITIONS.length} transitions, ${timelineErrors.length} errors`);

  const clusters = clusterVectors();
  check('vector library', VECTOR_ASSETS.length >= 30 && clusters.every(cluster => cluster.assetIds.length > 0),
    `${VECTOR_ASSETS.length} assets in ${clusters.length} clusters; built-ins sanitized=${BUILT_IN_VECTORS.every(asset => asset.sanitized)}`);
  check('parametric shapes', PARAMETRIC_SHAPES.every(shape => parametricPath(shape).startsWith('M')),
    `${PARAMETRIC_SHAPES.length} editable shapes`);
  check('frames and mockups', MASK_FRAMES.length >= 5 && DEVICE_MOCKUPS.length >= 4,
    `${MASK_FRAMES.length} clipping frames, ${DEVICE_MOCKUPS.length} device mockups`);

  check('mood palettes', MOOD_PALETTES.every(palette => palette.colors.length >= 3 && palette.colors.length <= 5),
    `${MOOD_PALETTES.length} palettes with 3–5 colours`);
  check('gradients', ['linear', 'radial', 'mesh'].every(kind => GRADIENT_PRESETS.some(gradient => gradient.kind === kind)) &&
    GRADIENT_PRESETS.every(gradient => toCssGradient(gradient).length > 0),
    `${GRADIENT_PRESETS.length} CSS/Canvas gradient specs`);

  const slideRoles = new Set<string>(SLIDE_ARCHETYPES.map(archetype => archetype.role));
  check('slide archetypes', ['title', 'agenda', 'conclusion', 'data'].every(role => slideRoles.has(role)) && SLIDE_DECK_TEMPLATES.length > 0,
    `${SLIDE_ARCHETYPES.length} archetypes, ${SLIDE_DECK_TEMPLATES.length} deck bundles`);
  const slices = pieSlices(CHART_WRAPPERS[0].spec, CHART_WRAPPERS[0].dataset);
  const sweep = slices.reduce((sum, slice) => sum + (slice.endAngle - slice.startAngle), 0);
  check('data wrappers', CHART_WRAPPERS.length >= 3 && Math.abs(sweep - Math.PI * 2) < 0.0001,
    `${CHART_WRAPPERS.length} chart wrappers; pie sweep=${sweep.toFixed(4)}`);

  const reflow = reflowLayout(LAYOUT_TEST_BOXES, {
    from: { name: 'Square', width: 1080, height: 1080 },
    to: { name: 'Wide', width: 1920, height: 1080 },
    mode: 'reflow',
    columns: 2,
  });
  check('layout reflow', !reflow.overflow && reflow.elements.length === LAYOUT_TEST_BOXES.length,
    `${reflow.elements.length} boxes, ${reflow.grid.columns} columns, overflow=${reflow.overflow}`);

  const fontCheck = checkBrandChange(DEFAULT_BRAND_HUB, { kind: 'font', values: ['Inter'] });
  const rogueFont = checkBrandChange(DEFAULT_BRAND_HUB, { kind: 'font', values: ['Comic Sans MS'] });
  check('brand lockouts', fontCheck.allowed && !rogueFont.allowed && DEFAULT_BRAND_HUB.assets.length >= 7 && BRAND_ASSET_BUNDLE.layoutPolicies.length > 0,
    `${DEFAULT_BRAND_HUB.locks.length} locks; locked font=${!rogueFont.allowed}; ${BRAND_ASSET_BUNDLE.layoutPolicies.length} locked layout policy`);

  const counts: Record<string, number> = {
    canvasFormats: CANVAS_FORMATS.length,
    printStandards: Object.keys(PRINT_STANDARDS).length,
    fontAssets: ALL_FONT_ASSETS.length,
    textEffects: TEXT_EFFECTS.length,
    fontPairings: FONT_PAIRINGS.length,
    timelineCompositions: TIMELINE_COMPOSITIONS.length,
    transitions: TRANSITIONS.length,
    vectorAssets: VECTOR_ASSETS.length,
    parametricShapes: PARAMETRIC_SHAPES.length,
    masks: MASK_FRAMES.length,
    moodPalettes: MOOD_PALETTES.length,
    gradients: GRADIENT_PRESETS.length,
    slideArchetypes: SLIDE_ARCHETYPES.length,
    chartWrappers: CHART_WRAPPERS.length,
    brandAssets: DEFAULT_BRAND_HUB.assets.length,
    brandLocks: DEFAULT_BRAND_HUB.locks.length,
  };

  return { ok: checks.every(item => item.ok), version: ENGINE_SCHEMA_VERSION, checks, counts };
}
