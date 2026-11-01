import { chromium } from 'playwright';
import assert from 'node:assert';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
const result = await p.evaluate(async () => {
  const engine = await import('/src/lib/engine/index.ts');
  const canvas = await import('/src/lib/engine/canvasFormats.ts');
  const typo = await import('/src/lib/engine/typography.ts');
  const timeline = await import('/src/lib/engine/timeline.ts');
  const vectors = await import('/src/lib/engine/vectors.ts');
  const colors = await import('/src/lib/engine/colorEngine.ts');
  const deck = await import('/src/lib/engine/presentationKit.ts');
  const layout = await import('/src/lib/engine/layoutEngine.ts');
  const brand = await import('/src/lib/engine/brandHub.ts');
  const validation = engine.validateEngineSchema();
  const sanitized = vectors.sanitizeVectorSvg('<svg viewBox="0 0 24 24"><script>alert(1)</script><path d="M0 0h10v10z" onclick="x()" /></svg>');
  const canvasEl = document.createElement('canvas');
  canvasEl.width = 100;
  canvasEl.height = 100;
  const ctx = canvasEl.getContext('2d');
  const canvasGradient = ctx ? colors.toCanvasGradient(ctx, colors.GRADIENT_PRESETS[1], 100, 100) : null;
  if (ctx) colors.drawMeshGradient(ctx, colors.GRADIENT_PRESETS[3], 100, 100);
  const meshPixel = ctx ? [...ctx.getImageData(50, 50, 1, 1).data] : [0, 0, 0, 0];
  const lottie = timeline.lottieConfig(timeline.TIMELINE_COMPOSITIONS[0].overlays[0]);
  const reflow = layout.reflowLayout(layout.LAYOUT_TEST_BOXES, {
    from: { name: 'Square', width: 1080, height: 1080 },
    to: { name: 'Wide', width: 1920, height: 1080 },
    mode: 'reflow', columns: 2,
  });
  return {
    validation,
    counts: validation.counts,
    print: {
      a4: canvas.printPixels(canvas.PRINT_STANDARDS.a4),
      letter: canvas.printPixels(canvas.PRINT_STANDARDS['us-letter']),
      card: canvas.printPixels(canvas.PRINT_STANDARDS['business-card']),
    },
    aspect: canvas.CANVAS_FORMATS.slice(0, 5).map(f => `${f.name} ${f.aspectRatio}`),
    fonts: typo.ALL_FONT_ASSETS.map(f => `${f.family}:${f.provider}`),
    effects: typo.TEXT_EFFECTS.map(e => e.id),
    pairs: typo.FONT_PAIRINGS.map(p => `${p.id}:${p.header.family}/${p.subheader.family}/${p.body.family}`),
    transitions: timeline.TRANSITIONS.map(t => `${t.id}:${t.durationMs}`),
    timelineErrors: timeline.TIMELINE_COMPOSITIONS.flatMap(timeline.validateTimeline),
    vectors: vectors.VECTOR_ASSETS.length,
    clusters: vectors.clusterVectors(),
    parametrics: vectors.PARAMETRIC_SHAPES.map(s => ({ id: s.id, path: vectors.parametricPath(s).slice(0, 8) })),
    masks: vectors.MASK_FRAMES.length,
    mockups: vectors.DEVICE_MOCKUPS.length,
    sanitized,
    palettes: colors.MOOD_PALETTES.map(p => ({ id: p.id, colors: p.colors.length, moods: p.mood })),
    gradients: colors.GRADIENT_PRESETS.map(g => ({ kind: g.kind, css: colors.toCssGradient(g).slice(0, 30) })),
    archetypes: deck.SLIDE_ARCHETYPES.map(a => `${a.role}:${a.placeholders.length}`),
    charts: deck.CHART_WRAPPERS.map(c => `${c.id}:${c.spec.kind}`),
    pie: deck.pieSlices(deck.CHART_WRAPPERS[0].spec, deck.CHART_WRAPPERS[0].dataset),
    reflow: { overflow: reflow.overflow, mode: reflow.mode, boxes: reflow.elements },
    canvasGradient: canvasGradient instanceof CanvasGradient,
    meshPixel,
    lottie,
    brand: {
      assets: brand.DEFAULT_BRAND_HUB.assets.length,
      locks: brand.DEFAULT_BRAND_HUB.locks.length,
      allowed: brand.checkBrandChange(brand.DEFAULT_BRAND_HUB, { kind: 'font', values: ['Inter'] }),
      blocked: brand.checkBrandChange(brand.DEFAULT_BRAND_HUB, { kind: 'font', values: ['Comic Sans MS'] }),
      policy: brand.BRAND_ASSET_BUNDLE.layoutPolicies.length,
    },
  };
});
console.log('VALIDATION', JSON.stringify(result.validation, null, 2));
console.log('PRINT', result.print);
console.log('ASPECTS', result.aspect);
console.log('FONTS', result.fonts.length, result.fonts);
console.log('EFFECTS', result.effects);
console.log('PAIRS', result.pairs);
console.log('TRANSITIONS', result.transitions, 'errors', result.timelineErrors);
console.log('VECTORS', result.vectors, 'clusters', result.clusters, 'parametrics', result.parametrics, 'masks', result.masks, 'mockups', result.mockups);
console.log('SANITIZED', result.sanitized);
console.log('PALETTES', result.palettes);
console.log('GRADIENTS', result.gradients);
console.log('SLIDES', result.archetypes, result.charts, 'pie sum', result.pie.reduce((n, s) => n + (s.endAngle - s.startAngle), 0));
console.log('REFLOW', result.reflow);
console.log('CANVAS GRADIENT', result.canvasGradient, 'meshPixel', result.meshPixel, 'lottie', result.lottie);
console.log('BRAND', { assets: result.brand.assets, locks: result.brand.locks, allowed: result.brand.allowed.allowed, blocked: result.brand.blocked.violations, policies: result.brand.policy });
assert.equal(result.validation.ok, true, 'engine validation');
assert.ok(!result.sanitized.includes('<script') && !result.sanitized.includes('onclick'), 'script and handlers removed');
assert.ok(result.sanitized.includes('<path'), 'safe path preserved');
assert.ok(result.canvasGradient);
assert.ok(result.meshPixel[3] > 0);
assert.equal(result.lottie.renderer, 'svg');
assert.ok(!result.reflow.overflow);
assert.ok(result.brand.blocked.allowed === false);
await b.close();
console.log('ENGINE AUDIT OK');
