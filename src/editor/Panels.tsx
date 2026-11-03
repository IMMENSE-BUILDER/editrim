import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Boxes, Check, ImagePlus, LayoutTemplate, Palette, Sparkles, Trash2, Upload, X,
} from 'lucide-react';
import type { BrandKit, El, Page, Paint, ShapeKind } from '../lib/types';
import type { EditorStore } from './useEditor';
import { addAsset, deleteAsset, listAssets, type AssetRecord } from '../lib/storage';
import { compressImage, uid } from '../lib/utils';
import { TEMPLATE_IMAGES } from '../lib/templates';
import { ICONS } from '../lib/icons';
import { FONT_PAIRS, PALETTES, SWATCHES } from '../lib/palettes';
import { CREATE_SHAPES, createIcon, createImage, createNumber, createShape, createText, PAGE_LAYOUTS } from './factory';
import { ColorField, Segmented, SliderField } from './controls';
import { ShapeView } from '../components/ElementView';
import { PagePreview } from '../components/PagePreview';
import { useToast } from '../components/Toast';
import { FONTS } from '../lib/fonts';
import { deleteComponent, listComponents, onComponentsChange, type SavedComponent } from '../lib/components';
import { AiPanel } from './AiPanel';
import { EditrimIcon } from '../components/EditrimIcon';
import { useResolvedSrc } from '../hooks/useResolvedSrc';
import { applyBrandToDesign, auditBrand, type BrandIssue } from '../lib/brandApply';

export type PanelTab = 'templates' | 'ai' | 'elements' | 'text' | 'uploads' | 'background' | 'brand';

const PHOTOS = [
  { name: 'Coffee', src: TEMPLATE_IMAGES.coffee, ratio: 0.8 },
  { name: 'Mountains', src: TEMPLATE_IMAGES.mountain, ratio: 1.5 },
  { name: 'Interior', src: TEMPLATE_IMAGES.interior, ratio: 0.75 },
  { name: 'Architecture', src: TEMPLATE_IMAGES.arch, ratio: 1.33 },
  { name: 'Food', src: TEMPLATE_IMAGES.food, ratio: 1.5 },
  { name: 'Portrait', src: TEMPLATE_IMAGES.portrait, ratio: 0.75 },
  { name: 'Flowers', src: TEMPLATE_IMAGES.flowers, ratio: 1.4 },
  { name: 'Concert', src: TEMPLATE_IMAGES.concert, ratio: 1.5 },
  { name: 'City', src: TEMPLATE_IMAGES.city, ratio: 1.4 },
];

function PanelHead({ title, onClose, children }: { title: string; onClose: () => void; children?: ReactNode }) {
  return (
    <div className="lp-head">
      <h3>{title}</h3>
      {children}
      <button className="lp-close" onClick={onClose} aria-label="Close panel"><EditrimIcon name="close" size={16} /></button>
    </div>
  );
}

export function LeftPanel({
  tab,
  store,
  brand,
  aiFocus,
  onClose,
  onOpenBrand,
}: {
  tab: PanelTab;
  store: EditorStore;
  brand: BrandKit;
  aiFocus?: { focus: 'write' | 'translate'; nonce: number } | null;
  onClose: () => void;
  onOpenBrand: () => void;
}) {
  const { toast } = useToast();
  const page = store.page;
  const [components, setComponents] = useState<SavedComponent[]>(() => listComponents());
  const [brandScope, setBrandScope] = useState<'page' | 'all'>('page');

  useEffect(() => onComponentsChange(() => setComponents(listComponents())), []);

  /** Brand check runs off the live design, so it follows every edit and kit change. */
  const brandAudit = useMemo(() => {
    if (tab !== 'brand') return { issues: [] as BrandIssue[], colorCount: 0, fontCount: 0 };
    const indexes = brandScope === 'all' ? store.design.pages.map((_, i) => i) : [store.pageIndex];
    const issues: BrandIssue[] = [];
    const colors = new Set<string>();
    const fonts = new Set<string>();
    for (const index of indexes) {
      const result = auditBrand(store.design, brand, index);
      result.issues.forEach(issue => {
        issues.push(issue);
        if (issue.kind === 'color') colors.add(issue.current.trim().toLowerCase());
        else fonts.add(issue.current);
      });
    }
    return { issues, colorCount: colors.size, fontCount: fonts.size };
  }, [tab, brand, brandScope, store.design, store.pageIndex]);

  /* Brand tab actions */
  const insertLogo = (src: string) => {
    const el = createImage(src, store.page, store.design.size);
    el.name = 'Brand logo';
    el.fit = 'contain';
    store.addElements([el]);
    toast('Logo inserted');
  };

  const runBrandApply = (mode: 'apply' | 'fix') => {
    const result = applyBrandToDesign(store.design, brand, brandScope, store.pageIndex);
    if (!result.changed) {
      toast('Nothing to change');
      return;
    }
    store.restoreDesign(result.design);
    const layers = `${result.changed} ${result.changed === 1 ? 'layer' : 'layers'}`;
    toast(mode === 'fix' ? `Fixed ${layers}` : `Restyled ${layers}`);
  };

  const insertComponent = (component: SavedComponent) => {
    const groupId = uid('g');
    const dx = (store.design.size.width - component.width) / 2;
    const dy = (store.design.size.height - component.height) / 2;
    const elements = component.elements.map(el => ({
      ...structuredClone(el),
      id: uid(el.type),
      groupId,
      x: el.x + dx,
      y: el.y + dy,
    })) as El[];
    store.addElements(elements);
    toast(`Inserted ${component.name}`);
  };

  if (tab === 'ai') {
    return <AiPanel store={store} brand={brand} focusRequest={aiFocus} onClose={onClose} onOpenBrand={onOpenBrand} />;
  }

  if (tab === 'templates') {
    return (
      <div className="lp">
        <PanelHead title="Start from a layout" onClose={onClose} />
        <div className="lp-scroll">
          <Link to="/templates" className="lp-banner">
            <span><EditrimIcon name="templates" size={16} /> Browse all templates</span>
            <EditrimIcon name="arrowUpRight" size={14} />
          </Link>
          <div className="layout-grid">
            {PAGE_LAYOUTS.map(layout => (
              <button
                key={layout.id}
                className="layout-card"
                onClick={() => {
                  const result = layout.build(store.page, store.design.size, brand);
                  store.updatePage(p => ({ ...p, background: result.background, elements: [...p.elements, ...result.elements] }));
                  store.setSelectedIds(result.elements.map(e => e.id));
                  toast('Layout added');
                }}
              >
                <div className={`layout-thumb lt-${layout.id}`}>
                  <span className="lt-a" /><span className="lt-b" /><span className="lt-c" /><span className="lt-d" />
                </div>
                <b>{layout.name}</b>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'elements') {
    return (
      <div className="lp">
        <PanelHead title="Elements" onClose={onClose} />
        <div className="lp-scroll">
          {components.length > 0 && (
            <>
              <div className="lp-section-title">Your components</div>
              <div className="component-list">
                {components.map(component => {
                  const preview: Page = {
                    id: `component-${component.id}`,
                    name: component.name,
                    background: { kind: 'solid', color: '#f4f1ea' },
                    elements: component.elements,
                  };
                  return (
                    <div className="component-card" key={component.id}>
                      <button
                        className="component-thumb"
                        onClick={() => insertComponent(component)}
                        title={`Insert ${component.name}`}
                      >
                        <PagePreview page={preview} size={{ name: component.name, width: component.width, height: component.height }} />
                      </button>
                      <div className="component-info">
                        <strong>{component.name}</strong>
                        <small>{component.elements.length} {component.elements.length === 1 ? 'layer' : 'layers'} · click to insert</small>
                      </div>
                      <button
                        className="component-delete"
                        onClick={() => {
                          try {
                            deleteComponent(component.id);
                            toast('Component deleted');
                          } catch {
                            toast('Could not delete this component', 'error');
                          }
                        }}
                        title={`Delete ${component.name}`}
                        aria-label={`Delete ${component.name}`}
                      >
                        <EditrimIcon name="trash" size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="lp-section-title">Shapes</div>
          <div className="shape-grid">
            {CREATE_SHAPES.map(s => {
              const mock = createShape(s.id, { ...page, elements: [] } as any, store.design.size, brand);
              return (
                <button key={s.id} className="shape-btn" onClick={() => { store.addElements([createShape(s.id, store.page, store.design.size, brand)]); }} title={s.label}>
                  <span className="shape-glyph">
                    <ShapeView el={{ ...mock, w: 24, h: 24, radius: Math.min(mock.radius, 4), strokeWidth: Math.min(mock.strokeWidth || 1.5, 2) }} />
                  </span>
                  <small>{s.label}</small>
                </button>
              );
            })}
          </div>

          <div className="lp-section-title">Lines</div>
          <div className="line-presets">
            {[
              { label: 'Solid', dash: false },
              { label: 'Dashed', dash: true },
              { label: 'Heavy', dash: false, width: 6 },
            ].map(v => (
              <button
                key={v.label}
                onClick={() => {
                  const line = createShape('line', store.page, store.design.size, brand);
                  line.dash = v.dash;
                  line.strokeWidth = v.width ?? 2;
                  line.w = store.design.size.width * 0.6;
                  line.x = store.design.size.width * 0.2;
                  store.addElements([line]);
                }}
              >
                <span style={{ borderTopStyle: v.dash ? 'dashed' : 'solid', borderTopWidth: v.width ?? 2 }} />
                {v.label}
              </button>
            ))}
          </div>

          <div className="lp-section-title">Graphics</div>
          <div className="icon-grid">
            {ICONS.map(icon => (
              <button key={icon.id} className="icon-btn" title={icon.label} onClick={() => store.addElements([createIcon(icon.id, store.page, store.design.size, brand)])}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {icon.paths.map((d, i) => <path key={i} d={d} />)}
                </svg>
              </button>
            ))}
          </div>

          <div className="lp-section-title">Photos</div>
          <div className="photo-grid">
            {PHOTOS.map(p => (
              <button key={p.name} className="photo-btn" onClick={() => store.addElements([createImage(p.src, store.page, store.design.size, p.ratio)])} title={`Add ${p.name}`}>
                <img src={p.src} alt={p.name} loading="lazy" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'text') {
    const addText = (preset: 'heading' | 'subheading' | 'body' | 'quote' | 'caption', font?: string) => {
      const el = createText(preset, store.page, store.design.size, brand);
      if (font) el.fontFamily = font;
      store.addElements([el]);
    };
    return (
      <div className="lp">
        <PanelHead title="Text" onClose={onClose} />
        <div className="lp-scroll">
          <div className="text-presets">
            {[
              { key: 'heading', label: 'Add a heading', size: '32px' },
              { key: 'subheading', label: 'Add a subheading', size: '24px' },
              { key: 'body', label: 'Add body text', size: '18px' },
              { key: 'quote', label: 'Add a quote', size: '28px' },
              { key: 'caption', label: 'Add a label', size: '13px' },
            ].map(p => (
              <button key={p.key} className="text-preset" onClick={() => addText(p.key as any)}>
                <span style={{ fontFamily: p.key === 'quote' ? 'Instrument Serif' : 'Bricolage Grotesque', fontSize: p.size }}>Aa</span>
                <span>{p.label}</span>
              </button>
            ))}
            <button className="text-preset" onClick={() => store.addElements([createNumber(store.page, store.design.size)])}>
              <span style={{ fontFamily: 'Archivo Black', fontSize: '26px' }}>86%</span>
              <span>Add a big number</span>
            </button>
          </div>

          <div className="lp-section-title">Font pairings</div>
          <div className="pair-list">
            {FONT_PAIRS.map(pair => (
              <button
                key={pair.name}
                className="pair-card"
                onClick={() => {
                  const heading = createText('heading', store.page, store.design.size, { ...brand, fonts: [pair.heading, pair.body] });
                  heading.text = 'A headline in ' + pair.heading.split(' ')[0];
                  heading.fontFamily = pair.heading;
                  heading.fontSize = Math.round(Math.min(store.design.size.width, store.design.size.height) * 0.06);
                  const body = createText('subheading', store.page, store.design.size, { ...brand, fonts: [pair.heading, pair.body] });
                  body.fontFamily = pair.body;
                  body.y = heading.y + heading.fontSize * 1.15;
                  body.text = 'With supporting copy set in ' + pair.body + '.';
                  body.fontSize = Math.round(Math.min(store.design.size.width, store.design.size.height) * 0.022);
                  store.addElements([heading, body]);
                }}
              >
                <span className="pair-head" style={{ fontFamily: `"${pair.heading}", sans-serif` }}>Design</span>
                <span className="pair-meta">
                  <b>{pair.name}</b>
                  <small style={{ fontFamily: `"${pair.body}", sans-serif` }}>{pair.heading} + {pair.body}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="lp-section-title">Brand fonts</div>
          <div className="brand-fonts-list">
            {brand.fonts.map((f, i) => (
              <button
                key={`${f}-${i}`}
                onClick={() => {
                  const selectedText = store.selected.find(el => el.type === 'text');
                  if (selectedText) store.patchElement(selectedText.id, { fontFamily: f } as Partial<El>);
                  else addText(i === 0 ? 'heading' : 'body', f);
                }}
                style={{ fontFamily: `"${f}", sans-serif` }}
              >
                <span>Aa</span>
                <b>{f}</b>
                <small>{i === 0 ? 'Heading' : 'Body'}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'uploads') {
    return <UploadsPanel store={store} onClose={onClose} />;
  }

  if (tab === 'background') {
    return (
      <div className="lp">
        <PanelHead title="Background" onClose={onClose} />
        <div className="lp-scroll">
          <BackgroundControls store={store} brand={brand} toast={toast} />
        </div>
      </div>
    );
  }

  const brandLogos = brand.logos ?? [];

  return (
    <div className="lp">
      <PanelHead title="Brand kit" onClose={onClose} />
      <div className="lp-scroll">
        <div className="brand-card">
          <span className="brand-card-mark">Aa</span>
          <div>
            <strong>{brand.name}</strong>
            <span>{brand.colors.length} colours · {brand.fonts.length} fonts</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onOpenBrand}>Edit</button>
        </div>
        <div className="lp-section-title">Colours</div>
        <div className="brand-color-grid">
          {brand.colors.map(c => (
            <button
              key={c}
              style={{ background: c }}
              title={c}
              onClick={() => {
                if (store.selected.length) {
                  store.selected.forEach(el => {
                    if (el.type === 'text') store.patchElement(el.id, { color: c } as Partial<El>);
                    else if (el.type === 'shape') store.patchElement(el.id, { fill: { kind: 'solid', color: c } } as Partial<El>);
                    else if (el.type === 'icon') store.patchElement(el.id, { color: c } as Partial<El>);
                    else store.patchElement(el.id, { overlay: c, overlayOpacity: 0.35 } as Partial<El>);
                  });
                } else {
                  store.setBackground({ kind: 'solid', color: c });
                }
              }}
            >
              <span>{c.toUpperCase()}</span>
            </button>
          ))}
        </div>

        <div className="lp-section-title">Type</div>
        {brand.fonts.map((f, i) => (
          <button
            key={f}
            className="brand-type-row"
            onClick={() => {
              const t = store.selected.find(e => e.type === 'text');
              if (t) store.patchElement(t.id, { fontFamily: f } as Partial<El>);
              else {
                const el = createText(i === 0 ? 'heading' : 'body', store.page, store.design.size, brand);
                el.fontFamily = f;
                store.addElements([el]);
              }
            }}
          >
            <span style={{ fontFamily: `"${f}", sans-serif` }}>{f}</span>
            <small>{i === 0 ? 'Heading' : 'Body'}</small>
          </button>
        ))}

        <div className="lp-section-title">
          Logos
          <button type="button" className="brand-manage" onClick={onOpenBrand}>Manage</button>
        </div>
        {brandLogos.length ? (
          <div className="brand-logo-strip">
            {brandLogos.map((src, i) => (
              <BrandLogoButton key={`${src}-${i}`} src={src} index={i} onInsert={insertLogo} />
            ))}
          </div>
        ) : (
          <button type="button" className="lp-action" onClick={onOpenBrand}>
            <EditrimIcon name="upload" size={14} /> Add a logo
          </button>
        )}

        <div className="lp-section-title">Apply brand to</div>
        <div className="brand-apply-scope">
          <Segmented
            value={brandScope}
            options={[
              { value: 'page', label: 'This page' },
              { value: 'all', label: 'All pages' },
            ]}
            onChange={setBrandScope}
          />
        </div>
        <button type="button" className="lp-action brand-apply-btn" onClick={() => runBrandApply('apply')}>
          <EditrimIcon name="spark" size={14} /> Apply to design
        </button>

        <div className="lp-section-title">
          Brand check
          {brandAudit.issues.length > 0 && (
            <button type="button" className="brand-check-fix" onClick={() => runBrandApply('fix')}>Fix all</button>
          )}
        </div>
        <div className="brand-check">
          {brandAudit.issues.length === 0 ? (
            <div className="brand-check-empty"><EditrimIcon name="check" size={13} /> On brand</div>
          ) : (
            <>
              <div className="brand-check-count">
                {brandAudit.colorCount} {brandAudit.colorCount === 1 ? 'colour' : 'colours'} · {brandAudit.fontCount} {brandAudit.fontCount === 1 ? 'font' : 'fonts'} off brand
              </div>
              <ul className="brand-check-list">
                {brandAudit.issues.slice(0, 4).map((issue, i) => (
                  <li className="brand-check-item" key={`${issue.pageId}-${issue.elementId}-${issue.kind}-${i}`}>
                    <span className="brand-check-name">{issue.elementName}</span>
                    <span className="brand-check-flow">
                      <span className="brand-check-dash" aria-hidden="true">—</span>
                      {issue.kind === 'color' && <i className="brand-check-dot" style={{ background: issue.current }} />}
                      <span>{issue.current}</span>
                      <span aria-hidden="true">→</span>
                      {issue.kind === 'color' && <i className="brand-check-dot" style={{ background: issue.suggested }} />}
                      <span className="brand-check-to">{issue.suggested}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {brandAudit.issues.length > 4 && (
                <span className="brand-check-more">+{brandAudit.issues.length - 4} more — Fix all sorts them</span>
              )}
            </>
          )}
        </div>

        <div className="lp-section-title">Quick actions</div>
        <button
          className="lp-action"
          onClick={() => {
            if (!store.selected.length) { toast('Select some text first', 'error'); return; }
            store.selected.forEach((el, i) => {
              if (el.type === 'text') store.patchElement(el.id, { fontFamily: brand.fonts[i % 2] } as Partial<El>);
            });
            toast('Brand fonts applied');
          }}
        >
          <EditrimIcon name="check" size={14} /> Apply brand fonts to selection
        </button>
        <button className="lp-action" onClick={() => store.setBackground({ kind: 'solid', color: brand.colors[1] ?? '#F4F1EA' })}>
          <EditrimIcon name="palette" size={14} /> Use brand background
        </button>
      </div>
    </div>
  );
}

/* ---------------- Brand ---------------- */

function BrandLogoButton({
  src,
  index,
  onInsert,
}: {
  src: string;
  index: number;
  onInsert: (src: string) => void;
}) {
  const resolved = useResolvedSrc(src);
  const label = `Logo ${index + 1}`;
  return (
    <button
      type="button"
      className="brand-logo-pick"
      title={`Insert ${label.toLowerCase()}`}
      onClick={() => resolved && onInsert(resolved)}
      disabled={!resolved}
    >
      {resolved ? <img src={resolved} alt={label} /> : <span className="brand-logo-placeholder" />}
      <span>Insert</span>
    </button>
  );
}

/* ---------------- Uploads ---------------- */

function UploadsPanel({ store, onClose }: { store: EditorStore; onClose: () => void }) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    listAssets().then(setAssets).catch(() => setAssets([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    setBusy(true);
    try {
      for (const file of list) {
        const data = await compressImage(file);
        const src = await addAsset(file.name, data);
        const dims = await new Promise<{ w: number; h: number }>(res => {
          const img = new Image();
          img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => res({ w: 1, h: 1 });
          img.src = data;
        });
        const aspect = dims.w && dims.h ? dims.w / dims.h : 1;
        const el = createImage(src, store.page, store.design.size, aspect);
        store.addElements([el]);
      }
      refresh();
      toast(`${list.length} ${list.length === 1 ? 'image' : 'images'} added`);
    } catch {
      toast('That image could not be added', 'error');
    } finally {
      setBusy(false);
    }
  };

  const insert = (a: AssetRecord) => {
    const aspect = a.width && a.height ? a.width / a.height : 1;
    store.addElements([createImage(`asset:${a.id}`, store.page, store.design.size, aspect)]);
  };

  return (
    <div className="lp">
      <PanelHead title="Uploads" onClose={onClose} />
      <div className="lp-scroll">
        <div
          className={`upload-zone ${drag ? 'is-drag' : ''} ${busy ? 'is-busy' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          <EditrimIcon name="upload" size={20} />
          <b>{busy ? 'Processing…' : 'Drop images here'}</b>
          <span>or click to choose · JPG, PNG, WebP, GIF</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => { if (e.target.files) upload(e.target.files); e.target.value = ''; }}
        />
        {assets.length > 0 ? (
          <>
            <div className="lp-section-title">Your images <span>{assets.length}</span></div>
            <div className="asset-grid">
              {assets.map(a => (
                <div key={a.id} className="asset-item">
                  <button onClick={() => insert(a)} title={`Insert ${a.name}`}>
                    <img src={a.dataUrl} alt={a.name} loading="lazy" />
                  </button>
                  <button
                    className="asset-delete"
                    title="Remove from library"
                    onClick={async e => {
                      e.stopPropagation();
                      await deleteAsset(a.id);
                      refresh();
                      toast('Image removed');
                    }}
                  >
                    <EditrimIcon name="trash" size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Background ---------------- */

function BackgroundControls({ store, brand, toast }: { store: EditorStore; brand: BrandKit; toast: (m: string, k?: 'success' | 'error') => void }) {
  const bg = store.page.background;
  const kind = bg.kind === 'linear' ? 'linear' : bg.kind === 'image' ? 'image' : 'solid';
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const uploadBg = async (file: File) => {
    setBusy(true);
    try {
      const data = await compressImage(file);
      const src = await addAsset(file.name, data);
      store.setBackground({ kind: 'image', src, overlay: '#000000', overlayOpacity: 0.25 });
      toast('Background image added');
    } catch {
      toast('Could not load that image', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-controls">
      <Segmented
        value={kind}
        options={[
          { value: 'solid', label: 'Colour' },
          { value: 'linear', label: 'Gradient' },
          { value: 'image', label: 'Photo' },
        ]}
        onChange={v => {
          if (v === 'solid') store.setBackground({ kind: 'solid', color: bg.kind === 'solid' ? bg.color : '#F6F1E7' });
          if (v === 'linear') store.setBackground({ kind: 'linear', from: brand.colors[1] ?? '#F6F1E7', to: brand.colors[0] ?? '#2440F0', angle: 135 });
          if (v === 'image') store.setBackground({ kind: 'image', src: TEMPLATE_IMAGES.coffee, overlay: '#000000', overlayOpacity: 0.2 });
        }}
      />

      {bg.kind === 'solid' && (
        <>
          <div className="lp-section-title">Colour</div>
          <ColorField value={bg.color} onChange={c => store.setBackground({ kind: 'solid', color: c })} />
          <div className="swatch-grid">
            {SWATCHES.map(c => <button key={c} style={{ background: c }} onClick={() => store.setBackground({ kind: 'solid', color: c })} title={c} />)}
          </div>
          <div className="lp-section-title">Palettes</div>
          {PALETTES.map(p => (
            <button key={p.name} className="palette-row" onClick={() => store.setBackground({ kind: 'solid', color: p.colors[1] })}>
              <span>{p.name}</span>
              <span className="palette-dots">{p.colors.map(c => <i key={c} style={{ background: c }} />)}</span>
            </button>
          ))}
        </>
      )}

      {bg.kind === 'linear' && (
        <>
          <div className="lp-section-title">Gradient</div>
          <div className="paint-gradient-row">
            <ColorField value={bg.from} onChange={c => store.setBackground({ ...bg, from: c })} />
            <span className="paint-arrow">→</span>
            <ColorField value={bg.to} onChange={c => store.setBackground({ ...bg, to: c })} />
          </div>
          <SliderField label="Angle" value={bg.angle} min={0} max={360} onChange={a => store.setBackground({ ...bg, angle: a })} format={v => `${v}°`} />
          <div className="bg-gradient-preview" style={{ background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` }} />
          <div className="lp-section-title">Presets</div>
          <div className="gradient-grid">
            {PALETTES.map(p => (
              <button key={p.name} title={p.name} onClick={() => store.setBackground({ kind: 'linear', from: p.colors[1], to: p.colors[3], angle: 135 })}>
                <span style={{ background: `linear-gradient(135deg, ${p.colors[1]}, ${p.colors[3]})` }} />
                <small>{p.name}</small>
              </button>
            ))}
          </div>
        </>
      )}

      {bg.kind === 'image' && (
        <>
          <div className="lp-section-title">Photo</div>
          <div className="bg-photo-grid">
            {PHOTOS.map(p => (
              <button key={p.name} className={bg.src === p.src ? 'active' : ''} onClick={() => store.setBackground({ kind: 'image', src: p.src, overlay: bg.overlay ?? '#000000', overlayOpacity: bg.overlayOpacity ?? 0.2, blur: bg.blur })}>
                <img src={p.src} alt={p.name} loading="lazy" />
              </button>
            ))}
          </div>
          <button className="lp-action" onClick={() => fileRef.current?.click()} disabled={busy}>
            <EditrimIcon name="image" size={14} /> {busy ? 'Uploading…' : 'Upload your own photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { if (e.target.files?.[0]) uploadBg(e.target.files[0]); e.target.value = ''; }} />
          <div className="lp-section-title">Overlay</div>
          <ColorField value={bg.overlay ?? '#000000'} onChange={c => store.setBackground({ ...bg, overlay: c })} />
          <SliderField label="Overlay strength" value={Math.round((bg.overlayOpacity ?? 0.2) * 100)} min={0} max={100} onChange={v => store.setBackground({ ...bg, overlayOpacity: v / 100 })} format={v => `${v}%`} />
          <SliderField label="Blur" value={bg.blur ?? 0} min={0} max={30} onChange={v => store.setBackground({ ...bg, blur: v })} format={v => `${v}px`} />
        </>
      )}

      <div className="lp-section-title">Reset</div>
      <button className="lp-action" onClick={() => store.setBackground({ kind: 'solid', color: '#FFFFFF' })}>
        <EditrimIcon name="palette" size={14} /> White background
      </button>
    </div>
  );
}
