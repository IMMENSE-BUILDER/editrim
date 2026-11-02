import { useState } from 'react';
import {
  AlignCenter, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart,
  AlignHorizontalSpaceBetween, AlignLeft, AlignRight, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart, AlignVerticalSpaceBetween, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp,
  Copy, Eye, EyeOff, Image as ImageIcon, Lock, LockOpen, Maximize2, Palette, Shapes,
  Sparkles, Trash2, Type, Unlock, Wand2,
} from 'lucide-react';
import type { El, ImageElement, ShapeElement, TextElement } from '../lib/types';
import type { BrandKit } from '../lib/types';
import type { EditorStore } from './useEditor';
import {
  ColorField, FontField, InspectorSection, NumberField, PaintField, Segmented, ShadowField, SliderField, ToggleRow,
} from './controls';
import { fontByFamily } from '../lib/fonts';
import { PALETTES } from '../lib/palettes';
import { PagePreview } from '../components/PagePreview';
import { VellumIcon } from '../components/VellumIcon';

type Props = {
  store: EditorStore;
  brand: BrandKit;
  onEditText: () => void;
  onOpenBackground: () => void;
  onOpenResize: () => void;
  onOpenBrand: () => void;
};

const typeIcon = (el: El) => {
  if (el.type === 'text') return <VellumIcon name="text" size={14} />;
  if (el.type === 'image') return <VellumIcon name="image" size={14} />;
  if (el.type === 'icon') return <VellumIcon name="spark" size={14} />;
  return <VellumIcon name="elements" size={14} />;
};

export function Inspector({ store, brand, onEditText, onOpenBackground, onOpenResize, onOpenBrand }: Props) {
  const [tab, setTab] = useState<'design' | 'layers'>('design');
  const { page, selected, selectedIds, design } = store;
  const single = selected.length === 1 ? selected[0] : null;
  const none = selected.length === 0;
  const text = single?.type === 'text' ? (single as TextElement) : null;
  const shape = single?.type === 'shape' ? (single as ShapeElement) : null;
  const image = single?.type === 'image' ? (single as ImageElement) : null;
  const icon = single?.type === 'icon' ? single : null;
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
        <button className={tab === 'design' ? 'active' : ''} onClick={() => setTab('design')}>Design</button>
        <button className={tab === 'layers' ? 'active' : ''} onClick={() => setTab('layers')}>
          Layers <span>{page.elements.length}</span>
        </button>
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
                    {el.hidden ? <VellumIcon name="eyeOff" size={13} /> : <VellumIcon name="eye" size={13} />}
                  </button>
                  <button
                    className="layer-action"
                    title={el.locked ? 'Unlock' : 'Lock'}
                    onClick={e => {
                      e.stopPropagation();
                      store.patchElement(el.id, { locked: !el.locked });
                    }}
                  >
                    {el.locked ? <VellumIcon name="lock" size={13} /> : <VellumIcon name="unlock" size={13} />}
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
                <button onClick={() => store.reorder('front')} title="Bring to front"><VellumIcon name="chevronsUp" size={14} /></button>
                <button onClick={() => store.reorder('back')} title="Send to back"><VellumIcon name="chevronsDown" size={14} /></button>
                <button onClick={() => store.duplicateSelected()} title="Duplicate"><VellumIcon name="duplicate" size={14} /></button>
                <button onClick={() => store.deleteSelected()} title="Delete"><VellumIcon name="trash" size={14} /></button>
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
            <div className="insp-size-row">
              <div>
                <span className="field-label">Canvas</span>
                <strong>{design.size.width} × {design.size.height}</strong>
                <span className="insp-muted">{design.size.name}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onOpenResize}>
                <VellumIcon name="fit" size={13} /> Resize
              </button>
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
                  <button className="btn btn-secondary btn-sm btn-block" onClick={onOpenBackground}>Edit background photo</button>
                </>
              )}
            </div>
          </InspectorSection>

          <InspectorSection title="This page">
            <div className="insp-page-actions">
              <button onClick={() => store.duplicatePage()}><VellumIcon name="duplicate" size={14} /> Duplicate</button>
              <button onClick={() => store.addPage()}><VellumIcon name="magic" size={14} /> Add page</button>
              <button onClick={() => store.deletePage()} disabled={design.pages.length <= 1} className="danger">
                <VellumIcon name="trash" size={14} /> Delete
              </button>
            </div>
                      </InspectorSection>
        </div>
      ) : (
        <div className="insp-scroll">
          <div className="insp-selection-head">
            <div className="insp-sel-type">
              {single ? typeIcon(single) : <VellumIcon name="spark" size={14} />}
              <div>
                <strong>{single ? single.name : `${selected.length} elements`}</strong>
                <span>{single ? single.type : 'Multiple selection'}</span>
              </div>
            </div>
            <div className="insp-sel-actions">
              <button onClick={store.toggleHidden} title="Show / hide">
                {selected.some(e => !e.hidden) ? <VellumIcon name="eye" size={14} /> : <VellumIcon name="eyeOff" size={14} />}
              </button>
              <button onClick={store.toggleLock} title={selected.every(e => e.locked) ? 'Unlock' : 'Lock'}>
                {selected.every(e => e.locked) ? <VellumIcon name="lock" size={14} /> : <VellumIcon name="unlock" size={14} />}
              </button>
              <button onClick={store.deleteSelected} title="Delete" className="danger"><VellumIcon name="trash" size={14} /></button>
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
                    { value: 'left', label: <VellumIcon name="alignLeft" size={14} /> },
                    { value: 'center', label: <VellumIcon name="alignCenter" size={14} /> },
                    { value: 'right', label: <VellumIcon name="alignRight" size={14} /> },
                  ]}
                  onChange={v => patch({ align: v } as Partial<TextElement>)}
                />
              </div>
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
            </InspectorSection>
          )}

          {icon && (
            <InspectorSection title="Icon">
              <ColorField value={icon.color} onChange={c => patch({ color: c } as Partial<El>)} />
              <SliderField label="Stroke" value={icon.strokeWidth ?? 1.8} min={0.5} max={5} step={0.1} onChange={v => patch({ strokeWidth: v } as Partial<El>, 'icon-stroke')} />
            </InspectorSection>
          )}

          {!text && <InspectorSection title="Effects"><ShadowField shadow={selected[0]?.shadow} onChange={s => patchAll({ shadow: s })} /></InspectorSection>}
          {text && <InspectorSection title="Effects"><ShadowField shadow={text.shadow} onChange={s => patch({ shadow: s } as Partial<TextElement>)} /></InspectorSection>}

          <InspectorSection title="Arrange">
            <div className="insp-arrange">
              <button onClick={() => store.reorder('front')} title="Bring to front"><VellumIcon name="chevronsUp" size={15} /></button>
              <button onClick={() => store.reorder('forward')} title="Bring forward"><VellumIcon name="chevronUp" size={15} /></button>
              <button onClick={() => store.reorder('backward')} title="Send backward"><VellumIcon name="chevronDown" size={15} /></button>
              <button onClick={() => store.reorder('back')} title="Send to back"><VellumIcon name="chevronsDown" size={15} /></button>
            </div>
            <div className="insp-align">
              <button onClick={() => store.align('left')} title="Align left"><VellumIcon name="alignHorizontalStart" size={15} /></button>
              <button onClick={() => store.align('hcenter')} title="Centre horizontally"><VellumIcon name="alignHorizontalCenter" size={15} /></button>
              <button onClick={() => store.align('right')} title="Align right"><VellumIcon name="alignHorizontalEnd" size={15} /></button>
              <button onClick={() => store.align('top')} title="Align top"><VellumIcon name="alignVerticalStart" size={15} /></button>
              <button onClick={() => store.align('vcenter')} title="Centre vertically"><VellumIcon name="alignVerticalCenter" size={15} /></button>
              <button onClick={() => store.align('bottom')} title="Align bottom"><VellumIcon name="alignVerticalEnd" size={15} /></button>
            </div>
            {selected.length >= 3 && (
              <div className="insp-align" style={{ marginTop: 6 }}>
                <button onClick={() => store.distribute('h')} title="Distribute horizontally"><VellumIcon name="distributeH" size={15} /></button>
                <button onClick={() => store.distribute('v')} title="Distribute vertically"><VellumIcon name="distributeV" size={15} /></button>
              </div>
            )}
            <div className="insp-duo">
              <button className="btn btn-secondary btn-sm" onClick={() => store.duplicateSelected()}><VellumIcon name="duplicate" size={13} /> Duplicate</button>
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
              <button className="insp-brand-edit" onClick={onOpenBrand} title="Edit brand kit"><VellumIcon name="palette" size={12} /></button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
