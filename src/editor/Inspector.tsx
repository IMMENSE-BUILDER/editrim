import { useRef, useState } from 'react';
import { GlassButton, GlassTabs } from '@/components/liquid-glass';
import {
  AlignCenter, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart,
  AlignHorizontalSpaceBetween, AlignLeft, AlignRight, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart, AlignVerticalSpaceBetween, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp,
  Copy, Eye, EyeOff, Image as ImageIcon, Lock, LockOpen, Maximize2, Palette, Shapes,
  Sparkles, Trash2, Type, Unlock, Wand2,
} from 'lucide-react';
import type {
  BrandKit, ChartElement, ChartKind, ConnectorElement, ConnectorRoute, DrawingElement,
  El, GridElement, ImageElement, MockupDevice, MockupElement, Page, QrElement,
  ShapeElement, TableElement, TextEffect, TextElement,
} from '../lib/types';
import type { EditorStore } from './useEditor';
import {
  ColorField, FontField, InspectorSection, NumberField, PaintField, Segmented, ShadowField, SliderField, ToggleRow,
} from './controls';
import { fontByFamily, FONTS } from '../lib/fonts';
import { PALETTES } from '../lib/palettes';
import { addAsset } from '../lib/storage';
import { canvasToBlob, renderPageCanvas } from '../lib/render';
import { compressImage } from '../lib/utils';
import { createConnector } from './factory';
import { useToast } from '../components/Toast';
import { PagePreview } from '../components/PagePreview';
import { EditrimIcon } from '../components/EditrimIcon';

type Props = {
  store: EditorStore;
  brand: BrandKit;
  onEditText: () => void;
  onOpenBackground: () => void;
  onOpenResize: () => void;
  onOpenBrand: () => void;
};

const typeIcon = (el: El) => {
  if (el.type === 'text') return <EditrimIcon name="text" size={14} />;
  if (el.type === 'image') return <EditrimIcon name="image" size={14} />;
  if (el.type === 'icon') return <EditrimIcon name="spark" size={14} />;
  if (el.type === 'chart') return <EditrimIcon name="chart" size={14} />;
  if (el.type === 'table') return <EditrimIcon name="table" size={14} />;
  if (el.type === 'qr') return <EditrimIcon name="qr" size={14} />;
  if (el.type === 'drawing') return <EditrimIcon name="draw" size={14} />;
  if (el.type === 'grid') return <EditrimIcon name="elements" size={14} />;
  if (el.type === 'mockup') return <EditrimIcon name="mockup" size={14} />;
  if (el.type === 'connector') return <EditrimIcon name="arrowRight" size={14} />;
  return <EditrimIcon name="elements" size={14} />;
};

export function Inspector({ store, brand, onEditText, onOpenBackground, onOpenResize, onOpenBrand }: Props) {
  const [tab, setTab] = useState<'design' | 'layers'>('design');
  const [alignTarget, setAlignTarget] = useState<'page' | 'selection'>('page');
  const [csvDraft, setCsvDraft] = useState('');
  const [gridCellIndex, setGridCellIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const replaceImageRef = useRef<HTMLInputElement>(null);
  const gridFileRef = useRef<HTMLInputElement>(null);
  const mockupFileRef = useRef<HTMLInputElement>(null);
  const { page, selected, selectedIds, design } = store;
  const single = selected.length === 1 ? selected[0] : null;
  const none = selected.length === 0;
  const text = single?.type === 'text' ? (single as TextElement) : null;
  const shape = single?.type === 'shape' ? (single as ShapeElement) : null;
  const image = single?.type === 'image' ? (single as ImageElement) : null;
  const icon = single?.type === 'icon' ? single : null;
  const chart = single?.type === 'chart' ? (single as ChartElement) : null;
  const table = single?.type === 'table' ? (single as TableElement) : null;
  const qr = single?.type === 'qr' ? (single as QrElement) : null;
  const drawing = single?.type === 'drawing' ? (single as DrawingElement) : null;
  const grid = single?.type === 'grid' ? (single as GridElement) : null;
  const mockup = single?.type === 'mockup' ? (single as MockupElement) : null;
  const connector = single?.type === 'connector' ? (single as ConnectorElement) : null;
  const pageTables = page.elements.filter((e): e is TableElement => e.type === 'table');
  const bg = page.background;
  const linearBg = bg.kind === 'linear' ? bg : { kind: 'linear' as const, from: '#F7F3E8', to: '#D8F55A', angle: 135 };
  const solidBg = bg.kind === 'solid' ? bg : { kind: 'solid' as const, color: '#FFFDF7' };
  const imageBg = bg.kind === 'image' ? bg : null;

  const patch = (p: Partial<El>, merge?: string) => {
    if (!single) return;
    store.patchElement(single.id, p, merge ? { merge } : undefined);
  };

  const patchAll = (p: Partial<El>, merge?: string) => {
    store.patchSelected(p, merge ? { merge } : undefined);
  };

  return (
    <aside className="inspector">
      <div className="insp-tabs">
        <GlassTabs
          aria-label="Inspector view"
          size="sm"
          value={tab}
          onValueChange={setTab}
          className="w-full [&_[role=radio]]:flex-1"
          options={[
            { value: 'design', label: 'Design' },
            {
              value: 'layers',
              label: (
                <span className="inline-flex items-center gap-1.5">
                  Layers <span>{page.elements.length}</span>
                </span>
              ),
            },
          ]}
        />
      </div>

      {tab === 'layers' ? (
        <div className="layer-panel">
          <div className="layer-list">
            {[...page.elements].reverse().map(el => {
              const isSel = selectedIds.includes(el.id);
              return (
                <div
                  key={el.id}
                  className={`layer-row ${isSel ? 'active' : ''} ${el.hidden ? 'is-hidden' : ''}`}
                  onClick={e => {
                    if (e.shiftKey) {
                      store.setSelectedIds(isSel ? selectedIds.filter(i => i !== el.id) : [...selectedIds, el.id]);
                    } else {
                      store.setSelectedIds([el.id]);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && store.setSelectedIds([el.id])}
                >
                  <span className="layer-type">{typeIcon(el)}</span>
                  <span className="layer-name">{el.name}</span>
                  <button
                    className="layer-action"
                    title={el.hidden ? 'Show' : 'Hide'}
                    onClick={e => {
                      e.stopPropagation();
                      store.patchElement(el.id, { hidden: !el.hidden });
                    }}
                  >
                    {el.hidden ? <EditrimIcon name="eyeOff" size={13} /> : <EditrimIcon name="eye" size={13} />}
                  </button>
                  <button
                    className="layer-action"
                    title={el.locked ? 'Unlock' : 'Lock'}
                    onClick={e => {
                      e.stopPropagation();
                      store.patchElement(el.id, { locked: !el.locked });
                    }}
                  >
                    {el.locked ? <EditrimIcon name="lock" size={13} /> : <EditrimIcon name="unlock" size={13} />}
                  </button>
                </div>
              );
            })}
            {page.elements.length === 0 && (
              <div className="layer-empty">Nothing on this page yet. Add text or a shape to begin.</div>
            )}
          </div>
          {selected.length > 0 && (
            <div className="layer-footer">
              <span>{selected.length} selected</span>
              <div>
                <button onClick={() => store.reorder('front')} title="Bring to front"><EditrimIcon name="chevronsUp" size={14} /></button>
                <button onClick={() => store.reorder('back')} title="Send to back"><EditrimIcon name="chevronsDown" size={14} /></button>
                <button onClick={() => store.duplicateSelected()} title="Duplicate"><EditrimIcon name="duplicate" size={14} /></button>
                <button onClick={() => store.deleteSelected()} title="Delete"><EditrimIcon name="trash" size={14} /></button>
              </div>
            </div>
          )}
        </div>
      ) : none ? (
        <div className="insp-scroll">
          <InspectorSection title="Page">
            <label className="field" style={{ marginBottom: 14 }}>
              <span className="field-label">Page name</span>
              <input
                className="input"
                value={page.name}
                onChange={e => store.setPageName(e.target.value)}
                onBlur={e => store.setPageName(e.target.value)}
              />
            </label>
            <label className="field" style={{ marginBottom: 14 }}>
              <span className="field-label">Speaker notes</span>
              <textarea
                className="input insp-notes"
                rows={3}
                value={page.notes ?? ''}
                placeholder="Shown only in presenter view."
                onChange={e => store.updatePage(p => ({ ...p, notes: e.target.value }), { merge: 'page-notes' })}
              />
            </label>
            <label className="field" style={{ marginBottom: 14 }}>
              <span className="field-label">Page transition</span>
              <select
                className="input"
                value={page.transition ?? 'none'}
                onChange={e => store.updatePage(p => ({ ...p, transition: e.target.value as Page['transition'] }))}
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
            </label>
            <div className="insp-size-row">
              <div>
                <span className="field-label">Canvas</span>
                <strong>{design.size.width} × {design.size.height}</strong>
                <span className="insp-muted">{design.size.name}</span>
              </div>
              <GlassButton material="clear" size="sm" onClick={onOpenResize} icon={<EditrimIcon name="fit" size={13} />} iconPosition="start">
                Resize
              </GlassButton>
            </div>
          </InspectorSection>

          <InspectorSection
            title="Background"
            action={
              page.background.kind === 'image' ? (
                <button className="insp-link" onClick={onOpenBackground}>Change photo</button>
              ) : undefined
            }
          >
            <Segmented
              value={page.background.kind === 'linear' ? 'linear' : page.background.kind === 'image' ? 'image' : 'solid'}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'linear', label: 'Gradient' },
                { value: 'image', label: 'Photo' },
              ]}
              onChange={v => {
                if (v === 'solid') store.setBackground({ kind: 'solid', color: '#F7F3E8' });
                if (v === 'linear') store.setBackground({ kind: 'linear', from: '#F7F3E8', to: brand.colors[1] ?? '#D8F55A', angle: 135 });
                if (v === 'image') onOpenBackground();
              }}
            />
            <div className="insp-bg-controls">
              {page.background.kind === 'solid' && (
                <>
                  <ColorField value={solidBg.color} onChange={c => store.setBackground({ kind: 'solid', color: c })} />
                  <div className="quick-swatches">
                    {PALETTES.slice(0, 6).map(p => (
                      <button key={p.name} title={p.name} style={{ background: p.colors[1] }} onClick={() => store.setBackground({ kind: 'solid', color: p.colors[1] })} />
                    ))}
                  </div>
                </>
              )}
              {page.background.kind === 'linear' && (
                <>
                  <div className="paint-gradient-row">
                    <ColorField value={linearBg.from} onChange={c => store.setBackground({ ...linearBg, from: c })} />
                    <span className="paint-arrow">→</span>
                    <ColorField value={linearBg.to} onChange={c => store.setBackground({ ...linearBg, to: c })} />
                  </div>
                  <SliderField label="Angle" value={linearBg.angle} min={0} max={360} onChange={a => store.setBackground({ ...linearBg, angle: a })} format={v => `${v}°`} />
                  <div className="bg-gradient-preview" style={{ background: `linear-gradient(${linearBg.angle}deg, ${linearBg.from}, ${linearBg.to})` }} />
                  <div className="gradient-presets">
                    {PALETTES.map(p => (
                      <button
                        key={p.name}
                        title={p.name}
                        style={{ background: `linear-gradient(135deg, ${p.colors[1]}, ${p.colors[3]})` }}
                        onClick={() => store.setBackground({ kind: 'linear', from: p.colors[1], to: p.colors[3], angle: 135 })}
                      />
                    ))}
                  </div>
                </>
              )}
              {imageBg && (
                <>
                  <div className="insp-bg-photo"><PagePreview page={{ ...page, elements: [] }} size={design.size} /></div>
                  <GlassButton material="clear" size="sm" className="w-full" onClick={onOpenBackground}>
                    Edit background photo
                  </GlassButton>
                </>
              )}
            </div>
          </InspectorSection>

          <InspectorSection title="This page">
            <div className="insp-page-actions">
              <button onClick={() => store.duplicatePage()}><EditrimIcon name="duplicate" size={14} /> Duplicate</button>
              <button onClick={() => store.addPage()}><EditrimIcon name="magic" size={14} /> Add page</button>
              <button onClick={() => store.deletePage()} disabled={design.pages.length <= 1} className="danger">
                <EditrimIcon name="trash" size={14} /> Delete
              </button>
            </div>
                      </InspectorSection>
        </div>
      ) : (
        <div className="insp-scroll">
          <div className="insp-selection-head">
            <div className="insp-sel-type">
              {single ? typeIcon(single) : <EditrimIcon name="spark" size={14} />}
              <div>
                <strong>{single ? single.name : `${selected.length} elements`}</strong>
                <span>{single ? single.type : 'Multiple selection'}</span>
              </div>
            </div>
            <div className="insp-sel-actions">
              <button onClick={store.toggleHidden} title="Show / hide">
                {selected.some(e => !e.hidden) ? <EditrimIcon name="eye" size={14} /> : <EditrimIcon name="eyeOff" size={14} />}
              </button>
              <button onClick={store.toggleLock} title={selected.every(e => e.locked) ? 'Unlock' : 'Lock'}>
                {selected.every(e => e.locked) ? <EditrimIcon name="lock" size={14} /> : <EditrimIcon name="unlock" size={14} />}
              </button>
              <button onClick={store.deleteSelected} title="Delete" className="danger"><EditrimIcon name="trash" size={14} /></button>
            </div>
          </div>

          {!single && (
            <InspectorSection title="Selection">
              <SliderField
                label="Opacity"
                value={Math.round(selected[0].opacity * 100)}
                min={0}
                max={100}
                onChange={v => patchAll({ opacity: v / 100 }, 'opacity')}
                format={v => `${v}%`}
              />
            </InspectorSection>
          )}

          {text && (
            <InspectorSection
              title="Text"
              action={<button className="insp-link" onClick={onEditText}>Edit on canvas</button>}
            >
              <FontField value={text.fontFamily} onChange={f => patch({ fontFamily: f } as Partial<TextElement>)} />
              <div className="insp-grid-2" style={{ marginTop: 10 }}>
                <NumberField label="Size" value={text.fontSize} min={4} max={800} onChange={n => patch({ fontSize: n } as Partial<TextElement>, 'font-size')} />
                <label className="num-field">
                  <span className="num-label">Weight</span>
                  <select
                    className="insp-select"
                    value={text.fontWeight}
                    onChange={e => patch({ fontWeight: Number(e.target.value) } as Partial<TextElement>)}
                  >
                    {fontByFamily(text.fontFamily).weights.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="insp-grid-2" style={{ marginTop: 8 }}>
                <NumberField label="Line" value={text.lineHeight} min={0.7} max={3} step={0.05} onChange={n => patch({ lineHeight: n } as Partial<TextElement>, 'line-height')} />
                <NumberField label="Spacing" value={text.letterSpacing} min={-20} max={60} step={0.5} onChange={n => patch({ letterSpacing: n } as Partial<TextElement>, 'letter-spacing')} />
              </div>
              <div className="insp-row" style={{ marginTop: 10 }}>
                <Segmented
                  value={text.align}
                  options={[
                    { value: 'left', label: <EditrimIcon name="alignLeft" size={14} /> },
                    { value: 'center', label: <EditrimIcon name="alignCenter" size={14} /> },
                    { value: 'right', label: <EditrimIcon name="alignRight" size={14} /> },
                  ]}
                  onChange={v => patch({ align: v } as Partial<TextElement>)}
                />
              </div>
              <div className="insp-row" style={{ marginTop: 8 }}>
                <Segmented
                  value={text.valign}
                  options={[
                    { value: 'top', label: 'Top' },
                    { value: 'middle', label: 'Middle' },
                    { value: 'bottom', label: 'Bottom' },
                  ]}
                  onChange={v => patch({ valign: v } as Partial<TextElement>)}
                />
              </div>
              <div className="insp-subhead">Curve</div>
              <SliderField
                label="Arc"
                value={text.curve ?? 0}
                min={-100}
                max={100}
                onChange={v => patch({ curve: v } as Partial<TextElement>, 'text-curve')}
                format={v => `${v}%`}
              />
              <div className="insp-subhead">Text effects</div>
              <div className="insp-effect-grid">
                {([
                  ['none', 'None'],
                  ['shadow', 'Shadow'],
                  ['lift', 'Lift'],
                  ['hollow', 'Hollow'],
                  ['splice', 'Splice'],
                  ['echo', 'Echo'],
                  ['neon', 'Neon'],
                  ['glitch', 'Glitch'],
                  ['background', 'Backdrop'],
                ] as [TextEffect, string][]).map(([kind, label]) => (
                  <button
                    key={kind}
                    className={(text.effect ?? 'none') === kind ? 'active' : ''}
                    onClick={() => patch({
                      effect: kind,
                      effectColor: text.effectColor ?? (kind === 'neon' ? '#38BDF8' : kind === 'glitch' ? '#22D3EE' : brand.colors[0] ?? '#14130F'),
                      effectIntensity: text.effectIntensity ?? 60,
                    } as Partial<TextElement>)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {(text.effect ?? 'none') !== 'none' && (
                <div style={{ marginTop: 8 }}>
                  <ColorField
                    label="Effect colour"
                    value={text.effectColor ?? '#14130F'}
                    onChange={c => patch({ effectColor: c } as Partial<TextElement>)}
                  />
                  <SliderField
                    label="Intensity"
                    value={text.effectIntensity ?? 60}
                    min={10}
                    max={100}
                    onChange={v => patch({ effectIntensity: v } as Partial<TextElement>, 'text-effect-inten')}
                    format={v => `${v}%`}
                  />
                </div>
              )}
              {text.strokeWidth ? (
                <div style={{ marginTop: 8 }}>
                  <ColorField label="Outline colour" value={text.strokeColor ?? '#14130F'} onChange={c => patch({ strokeColor: c } as Partial<TextElement>)} />
                  <NumberField label="Outline" value={text.strokeWidth} min={0} max={24} step={0.5} onChange={n => patch({ strokeWidth: n } as Partial<TextElement>, 'stroke-width')} />
                </div>
              ) : null}
              <div className="insp-toggle-row">
                <button className={text.italic ? 'active' : ''} onClick={() => patch({ italic: !text.italic } as Partial<TextElement>)}><em>I</em></button>
                <button className={text.underline ? 'active' : ''} onClick={() => patch({ underline: !text.underline } as Partial<TextElement>)}><u>U</u></button>
                <button className={text.uppercase ? 'active' : ''} onClick={() => patch({ uppercase: !text.uppercase } as Partial<TextElement>)}>AA</button>
              </div>
              <div style={{ marginTop: 10 }}>
                <ColorField label="Colour" value={text.color} onChange={c => patch({ color: c } as Partial<TextElement>)} />
              </div>
              <ToggleRow
                label="Highlight"
                checked={text.background?.kind === 'solid'}
                onChange={v => patch({ background: v ? { kind: 'solid', color: brand.colors[1] ?? '#D8F55A' } : { kind: 'none' }, backgroundRadius: v ? 4 : 0 } as Partial<TextElement>)}
              />
              {text.background?.kind === 'solid' && (
                <div style={{ marginTop: 8 }}>
                  <ColorField value={text.background.color} onChange={c => patch({ background: { kind: 'solid', color: c } } as Partial<TextElement>)} />
                  <div className="insp-grid-2" style={{ marginTop: 8 }}>
                    <NumberField label="Padding" value={text.padding ?? 0} min={0} max={100} onChange={n => patch({ padding: n } as Partial<TextElement>, 'padding')} />
                    <NumberField label="Radius" value={text.backgroundRadius ?? 0} min={0} max={200} onChange={n => patch({ backgroundRadius: n } as Partial<TextElement>, 'bg-radius')} />
                  </div>
                </div>
              )}
            </InspectorSection>
          )}

          {shape && (
            <InspectorSection title={shape.shape}>
              <PaintField paint={shape.fill} onChange={p => patch({ fill: p } as Partial<ShapeElement>)} />
              <div style={{ marginTop: 10 }}>
                <ColorField label="Border colour" value={shape.stroke} onChange={c => patch({ stroke: c } as Partial<ShapeElement>)} allowNone />
              </div>
              <div className="insp-grid-2" style={{ marginTop: 8 }}>
                <NumberField label="Border" value={shape.strokeWidth} min={0} max={80} step={0.5} onChange={n => patch({ strokeWidth: n } as Partial<ShapeElement>, 'stroke')} />
                {shape.shape === 'rect' && (
                  <NumberField label="Radius" value={shape.radius} min={0} max={500} onChange={n => patch({ radius: n } as Partial<ShapeElement>, 'radius')} />
                )}
              </div>
              <ToggleRow label="Dashed border" checked={Boolean(shape.dash)} onChange={v => patch({ dash: v } as Partial<ShapeElement>)} />
            </InspectorSection>
          )}

          {image && (
            <InspectorSection title="Image">
              <div className="insp-row" style={{ marginBottom: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => replaceImageRef.current?.click()}>
                  <EditrimIcon name="upload" size={13} /> Replace
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => patch({ filters: { ...image.filters, brightness: 108, contrast: 108, saturate: 112 } } as Partial<ImageElement>)}
                >
                  Auto enhance
                </button>
              </div>
              <input
                ref={replaceImageRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async e => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = '';
                  if (!file) return;
                  try {
                    const data = await compressImage(file, 2000, 0.9);
                    const src = await addAsset(file.name, data);
                    patch({ src } as Partial<ImageElement>);
                    toast('Image replaced');
                  } catch {
                    toast('Could not replace that image', 'error');
                  }
                }}
              />
              <ToggleRow label="Flip horizontally" checked={Boolean(image.flipX)} onChange={v => patch({ flipX: v } as Partial<ImageElement>)} />
              <ToggleRow label="Flip vertically" checked={Boolean(image.flipY)} onChange={v => patch({ flipY: v } as Partial<ImageElement>)} />
              <div className="insp-row" style={{ marginTop: 10 }}>
                <Segmented
                  value={image.fit}
                  options={[{ value: 'cover', label: 'Fill' }, { value: 'contain', label: 'Fit' }]}
                  onChange={v => patch({ fit: v } as Partial<ImageElement>)}
                />
              </div>
              <NumberField label="Corner radius" value={image.radius} min={0} max={500} onChange={n => patch({ radius: n } as Partial<ImageElement>, 'img-radius')} />
              <div className="insp-subhead">Crop & frame</div>
              <SliderField
                label="Zoom"
                value={Math.round((image.zoom ?? 1) * 100)}
                min={100}
                max={300}
                onChange={v => {
                  const zoom = v / 100;
                  const limit = (zoom - 1) / (2 * zoom);
                  patch({
                    zoom,
                    offsetX: Math.max(-limit, Math.min(limit, image.offsetX ?? 0)),
                    offsetY: Math.max(-limit, Math.min(limit, image.offsetY ?? 0)),
                  } as Partial<ImageElement>, 'img-zoom');
                }}
                format={v => `${v}%`}
              />
              {(() => {
                const zoom = Math.max(1, image.zoom ?? 1);
                const limit = Math.round(((zoom - 1) / (2 * zoom)) * 100);
                return (
                  <>
                    <SliderField
                      label="Pan X"
                      value={Math.round((image.offsetX ?? 0) * 100)}
                      min={-limit}
                      max={limit}
                      onChange={v => patch({ offsetX: v / 100 } as Partial<ImageElement>, 'img-pan-x')}
                      format={v => `${v}%`}
                    />
                    <SliderField
                      label="Pan Y"
                      value={Math.round((image.offsetY ?? 0) * 100)}
                      min={-limit}
                      max={limit}
                      onChange={v => patch({ offsetY: v / 100 } as Partial<ImageElement>, 'img-pan-y')}
                      format={v => `${v}%`}
                    />
                  </>
                );
              })()}
              <div className="insp-mask-grid">
                {([
                  ['none', 'None'], ['rect', 'Rect'], ['ellipse', 'Circle'], ['triangle', 'Tri'],
                  ['diamond', 'Diamond'], ['hexagon', 'Hex'], ['star', 'Star'], ['blob', 'Blob'], ['heart', 'Heart'],
                ] as const).map(([kind, label]) => (
                  <button
                    key={kind}
                    className={(image.mask ?? 'none') === kind ? 'active' : ''}
                    onClick={() => patch({ mask: kind } as Partial<ImageElement>)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {(image.zoom ?? 1) !== 1 || image.offsetX || image.offsetY || image.mask ? (
                <button
                  className="insp-link"
                  style={{ marginTop: 8 }}
                  onClick={() => patch({ zoom: 1, offsetX: 0, offsetY: 0, mask: 'none' } as Partial<ImageElement>)}
                >
                  Reset crop and frame
                </button>
              ) : null}
              <div className="insp-subhead">Filters</div>
              {(['brightness', 'contrast', 'saturate', 'blur'] as const).map(key => (
                <SliderField
                  key={key}
                  label={key[0].toUpperCase() + key.slice(1)}
                  value={image.filters[key]}
                  min={key === 'blur' ? 0 : 0}
                  max={key === 'blur' ? 20 : key === 'saturate' ? 250 : 200}
                  onChange={v => patch({ filters: { ...image.filters, [key]: v } } as Partial<ImageElement>, `filter-${key}`)}
                />
              ))}
              <SliderField label="Grayscale" value={image.filters.grayscale} min={0} max={100} onChange={v => patch({ filters: { ...image.filters, grayscale: v } } as Partial<ImageElement>, 'filter-gray')} />
              <SliderField label="Sepia" value={image.filters.sepia} min={0} max={100} onChange={v => patch({ filters: { ...image.filters, sepia: v } } as Partial<ImageElement>, 'filter-sepia')} />
              <SliderField label="Hue" value={image.filters.hue} min={-180} max={180} onChange={v => patch({ filters: { ...image.filters, hue: v } } as Partial<ImageElement>, 'filter-hue')} format={v => `${v}°`} />
              <div className="insp-subhead">Overlay</div>
              <ColorField
                label="Colour"
                value={image.overlay ?? '#14130F'}
                onChange={c => patch({ overlay: c, overlayOpacity: image.overlayOpacity ?? 0.25 } as Partial<ImageElement>)}
              />
              <SliderField
                label="Strength"
                value={Math.round((image.overlayOpacity ?? 0) * 100)}
                min={0}
                max={100}
                onChange={v => patch({ overlay: image.overlay ?? '#14130F', overlayOpacity: v / 100 } as Partial<ImageElement>, 'img-overlay')}
                format={v => `${v}%`}
              />
            </InspectorSection>
          )}

          {icon && (
            <InspectorSection title="Icon">
              <ColorField value={icon.color} onChange={c => patch({ color: c } as Partial<El>)} />
              <SliderField label="Stroke" value={icon.strokeWidth ?? 1.8} min={0.5} max={5} step={0.1} onChange={v => patch({ strokeWidth: v } as Partial<El>, 'icon-stroke')} />
            </InspectorSection>
          )}

          {chart && (
            <InspectorSection title="Chart">
              <label className="field">
                <span className="field-label">Type</span>
                <select
                  className="insp-select"
                  value={chart.chartKind}
                  onChange={e => patch({ chartKind: e.target.value as ChartKind } as Partial<ChartElement>)}
                >
                  {(['bar', 'column', 'line', 'area', 'pie', 'donut', 'progress'] as ChartKind[]).map(k => (
                    <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>
                  ))}
                </select>
              </label>
              <label className="field" style={{ marginTop: 8 }}>
                <span className="field-label">Link to table</span>
                <select
                  className="insp-select"
                  value={chart.source?.tableId ?? ''}
                  onChange={e => patch({ source: e.target.value ? { tableId: e.target.value } : undefined } as Partial<ChartElement>)}
                >
                  <option value="">Manual data</option>
                  {pageTables.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>
              {!chart.source?.tableId && (
                <>
                  <div className="insp-subhead">Data</div>
                  <div className="insp-data-table">
                    {chart.data.labels.map((lbl, r) => (
                      <div key={r} className="insp-data-row">
                        <input
                          value={lbl}
                          aria-label={`Label ${r + 1}`}
                          onChange={e => {
                            const labels = chart.data.labels.map((v, i) => (i === r ? e.target.value : v));
                            patch({ data: { ...chart.data, labels } } as Partial<ChartElement>, 'chart-data');
                          }}
                        />
                        {chart.data.series.map((s, si) => (
                          <input
                            key={si}
                            type="number"
                            value={s.values[r] ?? 0}
                            aria-label={`${s.name} value ${r + 1}`}
                            onChange={e => {
                              const series = chart.data.series.map((ss, j) =>
                                j === si
                                  ? { ...ss, values: ss.values.map((v, i) => (i === r ? Number(e.target.value) || 0 : v)) }
                                  : ss,
                              );
                              patch({ data: { ...chart.data, series } } as Partial<ChartElement>, 'chart-data');
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="insp-duo" style={{ marginTop: 6 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => patch({
                        data: {
                          labels: [...chart.data.labels, `Item ${chart.data.labels.length + 1}`],
                          series: chart.data.series.map(s => ({ ...s, values: [...s.values, 50] })),
                        },
                      } as Partial<ChartElement>)}
                    >+ Row</button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={chart.data.labels.length <= 1}
                      onClick={() => patch({
                        data: {
                          labels: chart.data.labels.slice(0, -1),
                          series: chart.data.series.map(s => ({ ...s, values: s.values.slice(0, -1) })),
                        },
                      } as Partial<ChartElement>)}
                    >− Row</button>
                  </div>
                  <div className="insp-subhead">Paste CSV</div>
                  <textarea
                    className="insp-csv"
                    rows={3}
                    placeholder={'Q1,40,60\nQ2,70,80'}
                    value={csvDraft}
                    onChange={e => setCsvDraft(e.target.value)}
                  />
                  <button
                    className="btn btn-secondary btn-sm btn-block"
                    style={{ marginTop: 6 }}
                    onClick={() => {
                      const lines = csvDraft.trim().split(/\r?\n/).map(l => l.split(',').map(c => c.trim())).filter(r => r.length >= 2);
                      if (!lines.length) return;
                      const labels = lines.map(r => r[0]);
                      const sCount = Math.max(1, lines[0].length - 1);
                      const series = Array.from({ length: sCount }, (_, si) => ({
                        name: `Series ${si + 1}`,
                        values: lines.map(r => Number(r[si + 1]) || 0),
                      }));
                      patch({ data: { labels, series } } as Partial<ChartElement>);
                      toast('Chart data imported');
                    }}
                  >Apply CSV</button>
                </>
              )}
              <div className="insp-subhead">Options</div>
              <ToggleRow label="Legend" checked={chart.showLegend} onChange={v => patch({ showLegend: v } as Partial<ChartElement>)} />
              <ToggleRow label="Value labels" checked={chart.showValues} onChange={v => patch({ showValues: v } as Partial<ChartElement>)} />
              <ToggleRow label="Gridlines" checked={chart.showGrid} onChange={v => patch({ showGrid: v } as Partial<ChartElement>)} />
              <ColorField label="Text colour" value={chart.textColor} onChange={c => patch({ textColor: c } as Partial<ChartElement>)} />
              <div style={{ marginTop: 8 }}>
                <FontField value={chart.fontFamily} onChange={f => patch({ fontFamily: f } as Partial<ChartElement>)} />
              </div>
              <div className="insp-subhead">Palette</div>
              <div className="swatch-grid">
                {PALETTES.slice(0, 6).map(p => (
                  <button
                    key={p.name}
                    title={p.name}
                    style={{ background: p.colors[0] }}
                    onClick={() => patch({ colors: p.colors } as Partial<ChartElement>)}
                  />
                ))}
              </div>
            </InspectorSection>
          )}

          {table && (
            <InspectorSection title="Table">
              <div className="insp-duo" style={{ marginBottom: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const cols = table.cells[0]?.length ?? 1;
                    const next = [...table.cells.map(r => [...r]), Array.from({ length: cols }, () => '')];
                    patch({ cells: next, rowHeights: Array.from({ length: next.length }, () => 1 / next.length) } as Partial<TableElement>);
                  }}
                >+ Row</button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const next = table.cells.map(r => [...r, '']);
                    const cols = next[0]?.length ?? 1;
                    patch({ cells: next, colWidths: Array.from({ length: cols }, () => 1 / cols) } as Partial<TableElement>);
                  }}
                >+ Col</button>
              </div>
              <div className="insp-duo" style={{ marginBottom: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={table.cells.length <= 1}
                  onClick={() => {
                    const next = table.cells.slice(0, -1);
                    patch({ cells: next, rowHeights: Array.from({ length: next.length }, () => 1 / next.length) } as Partial<TableElement>);
                  }}
                >− Row</button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={(table.cells[0]?.length ?? 1) <= 1}
                  onClick={() => {
                    const next = table.cells.map(r => r.slice(0, -1));
                    const cols = next[0]?.length ?? 1;
                    patch({ cells: next, colWidths: Array.from({ length: cols }, () => 1 / cols) } as Partial<TableElement>);
                  }}
                >− Col</button>
              </div>
              <ToggleRow label="Header row" checked={table.header} onChange={v => patch({ header: v } as Partial<TableElement>)} />
              <ColorField label="Header fill" value={table.headerFill} onChange={c => patch({ headerFill: c } as Partial<TableElement>)} />
              <ColorField label="Header text" value={table.headerColor} onChange={c => patch({ headerColor: c } as Partial<TableElement>)} />
              <ColorField label="Cell fill" value={table.fill} onChange={c => patch({ fill: c } as Partial<TableElement>)} />
              <ColorField label="Alt row fill" value={table.altFill ?? '#F7F4EC'} onChange={c => patch({ altFill: c } as Partial<TableElement>)} allowNone />
              <ColorField label="Border colour" value={table.borderColor} onChange={c => patch({ borderColor: c } as Partial<TableElement>)} />
              <ColorField label="Text colour" value={table.textColor} onChange={c => patch({ textColor: c } as Partial<TableElement>)} />
              <div className="insp-grid-2" style={{ marginTop: 8 }}>
                <NumberField label="Border" value={table.borderWidth} min={0} max={8} onChange={n => patch({ borderWidth: n } as Partial<TableElement>, 'tbl-bw')} />
                <NumberField label="Size" value={table.fontSize} min={8} max={48} onChange={n => patch({ fontSize: n } as Partial<TableElement>, 'tbl-fs')} />
                <NumberField label="Padding" value={table.padding} min={2} max={40} onChange={n => patch({ padding: n } as Partial<TableElement>, 'tbl-pad')} />
              </div>
              <div className="insp-row" style={{ marginTop: 8 }}>
                <Segmented
                  value={table.align}
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                  ]}
                  onChange={v => patch({ align: v } as Partial<TableElement>)}
                />
              </div>
              <label className="field" style={{ marginTop: 8 }}>
                <span className="field-label">Font</span>
                <select className="insp-select" value={table.fontFamily} onChange={e => patch({ fontFamily: e.target.value } as Partial<TableElement>)}>
                  {FONTS.map(f => <option key={f.family} value={f.family}>{f.family}</option>)}
                </select>
              </label>
            </InspectorSection>
          )}

          {qr && (
            <InspectorSection title="QR Code">
              <label className="field">
                <span className="field-label">URL or text</span>
                <input
                  className="insp-input"
                  value={qr.value}
                  onChange={e => patch({ value: e.target.value } as Partial<QrElement>, 'qr-val')}
                />
              </label>
              <ColorField label="Modules" value={qr.fg} onChange={c => patch({ fg: c } as Partial<QrElement>)} />
              <ColorField label="Background" value={qr.bg} onChange={c => patch({ bg: c } as Partial<QrElement>)} />
              <div className="insp-grid-2" style={{ marginTop: 8 }}>
                <label className="field">
                  <span className="field-label">ECC</span>
                  <select className="insp-select" value={qr.ecc} onChange={e => patch({ ecc: e.target.value as QrElement['ecc'] } as Partial<QrElement>)}>
                    {(['L', 'M', 'Q', 'H'] as const).map(lv => <option key={lv} value={lv}>{lv}</option>)}
                  </select>
                </label>
                <NumberField label="Margin" value={qr.margin} min={0} max={8} onChange={n => patch({ margin: n } as Partial<QrElement>, 'qr-margin')} />
              </div>
              <ToggleRow label="Rounded modules" checked={qr.rounded} onChange={v => patch({ rounded: v } as Partial<QrElement>)} />
            </InspectorSection>
          )}

          {drawing && (
            <InspectorSection title="Drawing">
              <ColorField
                label="Stroke colour"
                value={drawing.strokes[0]?.color ?? '#14130F'}
                onChange={c => patch({ strokes: drawing.strokes.map(s => ({ ...s, color: c })) } as Partial<DrawingElement>)}
              />
            </InspectorSection>
          )}

          {grid && (
            <InspectorSection title="Photo Grid">
              <SliderField label="Gap" value={grid.gap} min={0} max={40} onChange={v => patch({ gap: v } as Partial<GridElement>, 'grid-gap')} format={v => `${v}px`} />
              <SliderField label="Corner radius" value={grid.radius} min={0} max={48} onChange={v => patch({ radius: v } as Partial<GridElement>, 'grid-rad')} format={v => `${v}px`} />
              <div className="insp-subhead">Cells</div>
              <div className="insp-cell-list">
                {grid.cells.map((cell, ci) => (
                  <button
                    key={ci}
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setGridCellIndex(ci);
                      gridFileRef.current?.click();
                    }}
                  >
                    Replace #{ci + 1}
                  </button>
                ))}
              </div>
              <input
                ref={gridFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async e => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = '';
                  if (!file || gridCellIndex === null) return;
                  try {
                    const data = await compressImage(file, 2000, 0.9);
                    const src = await addAsset(file.name, data);
                    const nextCells = grid.cells.map((c, idx) => (idx === gridCellIndex ? { ...c, src } : c));
                    patch({ cells: nextCells } as Partial<GridElement>);
                    toast(`Updated cell #${gridCellIndex + 1}`);
                  } catch {
                    toast('Could not load that image', 'error');
                  }
                }}
              />
            </InspectorSection>
          )}

          {mockup && (
            <InspectorSection title="Mockup">
              <label className="field">
                <span className="field-label">Device</span>
                <select className="insp-select" value={mockup.device} onChange={e => patch({ device: e.target.value as MockupDevice } as Partial<MockupElement>)}>
                  {(['phone', 'tablet', 'laptop', 'browser', 'poster', 'polaroid'] as MockupDevice[]).map(d => (
                    <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </label>
              <ColorField label="Frame colour" value={mockup.frameColor} onChange={c => patch({ frameColor: c } as Partial<MockupElement>)} />
              <div className="insp-duo" style={{ marginTop: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => mockupFileRef.current?.click()}>Replace image</button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    const canvas = await renderPageCanvas(page, design.size, { scale: 1 });
                    const blob = await canvasToBlob(canvas, 'image/png', 0.92);
                    const dataUrl = await new Promise<string>((res, rej) => {
                      const fr = new FileReader();
                      fr.onload = () => res(String(fr.result));
                      fr.onerror = rej;
                      fr.readAsDataURL(blob);
                    });
                    const src = await addAsset(`${design.title}-mockup.png`, dataUrl);
                    patch({ src } as Partial<MockupElement>);
                    toast('Captured page into mockup');
                  }}
                >Use current page</button>
              </div>
              <input
                ref={mockupFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async e => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = '';
                  if (!file) return;
                  const data = await compressImage(file, 2000, 0.9);
                  const src = await addAsset(file.name, data);
                  patch({ src } as Partial<MockupElement>);
                  toast('Mockup image updated');
                }}
              />
            </InspectorSection>
          )}

          {connector && (
            <InspectorSection title="Connector">
              <Segmented
                value={connector.route}
                options={[
                  { value: 'straight', label: 'Straight' },
                  { value: 'elbow', label: 'Elbow' },
                  { value: 'curved', label: 'Curved' },
                ]}
                onChange={v => patch({ route: v as ConnectorRoute } as Partial<ConnectorElement>)}
              />
              <ColorField label="Stroke colour" value={connector.stroke} onChange={c => patch({ stroke: c } as Partial<ConnectorElement>)} />
              <NumberField label="Width" value={connector.strokeWidth} min={1} max={16} onChange={n => patch({ strokeWidth: n } as Partial<ConnectorElement>, 'conn-sw')} />
              <ToggleRow label="Start arrow" checked={connector.arrowStart} onChange={v => patch({ arrowStart: v } as Partial<ConnectorElement>)} />
              <ToggleRow label="End arrow" checked={connector.arrowEnd} onChange={v => patch({ arrowEnd: v } as Partial<ConnectorElement>)} />
              <ToggleRow label="Dashed" checked={Boolean(connector.dash)} onChange={v => patch({ dash: v } as Partial<ConnectorElement>)} />
            </InspectorSection>
          )}

          {!text && <InspectorSection title="Effects"><ShadowField shadow={selected[0]?.shadow} onChange={s => patchAll({ shadow: s })} /></InspectorSection>}
          {text && <InspectorSection title="Effects"><ShadowField shadow={text.shadow} onChange={s => patch({ shadow: s } as Partial<TextElement>)} /></InspectorSection>}

          <InspectorSection title="Arrange">
            <div className="insp-arrange">
              <button onClick={() => store.reorder('front')} title="Bring to front"><EditrimIcon name="chevronsUp" size={15} /></button>
              <button onClick={() => store.reorder('forward')} title="Bring forward"><EditrimIcon name="chevronUp" size={15} /></button>
              <button onClick={() => store.reorder('backward')} title="Send backward"><EditrimIcon name="chevronDown" size={15} /></button>
              <button onClick={() => store.reorder('back')} title="Send to back"><EditrimIcon name="chevronsDown" size={15} /></button>
            </div>
            <div className="insp-align">
              <button onClick={() => store.align('left', alignTarget)} title="Align left"><EditrimIcon name="alignHorizontalStart" size={15} /></button>
              <button onClick={() => store.align('hcenter', alignTarget)} title="Centre horizontally"><EditrimIcon name="alignHorizontalCenter" size={15} /></button>
              <button onClick={() => store.align('right', alignTarget)} title="Align right"><EditrimIcon name="alignHorizontalEnd" size={15} /></button>
              <button onClick={() => store.align('top', alignTarget)} title="Align top"><EditrimIcon name="alignVerticalStart" size={15} /></button>
              <button onClick={() => store.align('vcenter', alignTarget)} title="Centre vertically"><EditrimIcon name="alignVerticalCenter" size={15} /></button>
              <button onClick={() => store.align('bottom', alignTarget)} title="Align bottom"><EditrimIcon name="alignVerticalEnd" size={15} /></button>
            </div>
            {selected.length >= 2 && (
              <div className="insp-align-target">
                <button className={alignTarget === 'page' ? 'active' : ''} onClick={() => setAlignTarget('page')}>Page</button>
                <button className={alignTarget === 'selection' ? 'active' : ''} onClick={() => setAlignTarget('selection')}>Selection</button>
              </div>
            )}
            {selected.length >= 3 && (
              <div className="insp-align" style={{ marginTop: 6 }}>
                <button onClick={() => store.distribute('h')} title="Distribute horizontally"><EditrimIcon name="distributeH" size={15} /></button>
                <button onClick={() => store.distribute('v')} title="Distribute vertically"><EditrimIcon name="distributeV" size={15} /></button>
              </div>
            )}
            {selected.length >= 2 && (
              <button
                className="btn btn-secondary btn-sm btn-block"
                style={{ marginTop: 6 }}
                onClick={() => store.tidyUp()}
                title="Arrange the selection into an even grid"
              >
                <EditrimIcon name="elements" size={13} /> Tidy up
              </button>
            )}
            {selected.length === 2 && (
              <button
                className="btn btn-secondary btn-sm btn-block"
                style={{ marginTop: 6 }}
                onClick={() => store.addElements([createConnector(selected[0], selected[1], 'elbow', brand)])}
              >
                <EditrimIcon name="arrowRight" size={13} /> Connect selection
              </button>
            )}
            <div className="insp-duo">
              <button className="btn btn-secondary btn-sm" onClick={() => store.duplicateSelected()}><EditrimIcon name="duplicate" size={13} /> Duplicate</button>
              <button className="btn btn-secondary btn-sm" onClick={() => store.centerOnPage()}>Centre on page</button>
            </div>
          </InspectorSection>

          {single && (
            <InspectorSection title="Position & size">
              <div className="insp-grid-2">
                <NumberField label="X" value={single.x} onChange={n => patch({ x: n }, 'x')} />
                <NumberField label="Y" value={single.y} onChange={n => patch({ y: n }, 'y')} />
                <NumberField label="W" value={single.w} min={2} onChange={n => patch({ w: n }, 'w')} />
                <NumberField label="H" value={single.h} min={2} onChange={n => patch({ h: n }, 'h')} />
                <NumberField label="Rotate" value={single.rotation} min={-360} max={360} onChange={n => patch({ rotation: n }, 'rotation')} suffix="°" />
              </div>
              <SliderField label="Opacity" value={Math.round(single.opacity * 100)} min={0} max={100} onChange={v => patchAll({ opacity: v / 100 }, 'opacity')} format={v => `${v}%`} />
            </InspectorSection>
          )}

          <div className="insp-brand-strip">
            <span className="field-label">Brand</span>
            <div>
              {brand.colors.map(c => (
                <button
                  key={c}
                  style={{ background: c }}
                  onClick={() => {
                    if (text) patch({ color: c } as Partial<TextElement>);
                    else if (shape) patch({ fill: { kind: 'solid', color: c } } as Partial<ShapeElement>);
                    else if (image) patch({ overlay: c, overlayOpacity: 0.35 } as Partial<ImageElement>);
                    else if (icon) patch({ color: c } as Partial<El>);
                  }}
                  title={c}
                />
              ))}
              <button className="insp-brand-edit" onClick={onOpenBrand} title="Edit brand kit"><EditrimIcon name="palette" size={12} /></button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
