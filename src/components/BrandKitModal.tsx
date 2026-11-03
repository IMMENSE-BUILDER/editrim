import { useEffect, useRef, useState } from 'react';
import { EditrimIcon } from './EditrimIcon';
import { Modal } from './Modal';
import { addAsset, getBrand, saveBrand, DEFAULT_BRAND } from '../lib/storage';
import { compressImage } from '../lib/utils';
import { FONTS } from '../lib/fonts';
import type { BrandKit } from '../lib/types';
import { useToast } from './Toast';
import { useResolvedSrc } from '../hooks/useResolvedSrc';
import '../styles/brand-hub.css';

const MAX_LOGOS = 4;

/** Stored kits predate logos/palettes — normalise before editing or saving. */
function withCollections(kit: BrandKit): BrandKit {
  return { ...kit, logos: kit.logos ?? [], palettes: kit.palettes ?? [] };
}

function LogoTile({ src, index, onRemove }: { src: string; index: number; onRemove: () => void }) {
  const resolved = useResolvedSrc(src);
  return (
    <div className="brand-logo-tile">
      {resolved ? <img src={resolved} alt={`Logo ${index + 1}`} /> : <span className="brand-logo-placeholder" />}
      <button
        type="button"
        className="brand-logo-remove"
        onClick={onRemove}
        aria-label={`Remove logo ${index + 1}`}
      >
        <EditrimIcon name="close" size={11} />
      </button>
    </div>
  );
}

export function BrandKitModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { toast } = useToast();
  const [kit, setKit] = useState<BrandKit>(() => withCollections(getBrand()));
  const [paletteName, setPaletteName] = useState('');
  const [logoBusy, setLogoBusy] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setKit(withCollections(getBrand()));
      setPaletteName('');
      setLogoBusy(false);
    }
  }, [open]);

  const update = (patch: Partial<BrandKit>) => setKit(k => ({ ...k, ...patch }));

  const logos = kit.logos ?? [];
  const palettes = kit.palettes ?? [];

  const save = () => {
    saveBrand(withCollections(kit));
    toast('Brand kit updated');
    onSaved?.();
    onClose();
  };

  const pickLogo = () => logoInput.current?.click();

  const uploadLogos = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const images = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (!images.length) {
      toast('Choose an image file', 'error');
      return;
    }
    const room = MAX_LOGOS - logos.length;
    if (room <= 0) {
      toast(`Up to ${MAX_LOGOS} logos`, 'error');
      return;
    }
    setLogoBusy(true);
    try {
      const refs: string[] = [];
      for (const file of images.slice(0, room)) {
        const data = await compressImage(file, 512, 0.92);
        refs.push(await addAsset(file.name || 'logo', data));
      }
      setKit(k => ({ ...k, logos: [...(k.logos ?? []), ...refs].slice(0, MAX_LOGOS) }));
      if (images.length > room) toast(`Up to ${MAX_LOGOS} logos — the rest were skipped`, 'error');
      else toast(`${refs.length} ${refs.length === 1 ? 'logo' : 'logos'} added`);
    } catch {
      toast('That logo could not be added', 'error');
    } finally {
      setLogoBusy(false);
    }
  };

  const applyPalette = (palette: { name: string; colors: string[] }) => {
    update({ colors: palette.colors.slice(0, 8) });
    toast(`“${palette.name}” applied`);
  };

  const savePalette = () => {
    const name = paletteName.trim();
    if (!name) return;
    const entry = { name, colors: kit.colors.slice(0, 8) };
    setKit(k => {
      const list = k.palettes ?? [];
      const at = list.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
      return {
        ...k,
        palettes: at >= 0 ? list.map((p, i) => (i === at ? entry : p)) : [...list, entry],
      };
    });
    setPaletteName('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Brand kit"
      subtitle="Keep your colours, type and logos in one place. Available in every design."
      footer={
        <>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setKit({
                ...DEFAULT_BRAND,
                colors: [...DEFAULT_BRAND.colors],
                fonts: [...DEFAULT_BRAND.fonts],
                logos: [],
                palettes: [],
              });
              setPaletteName('');
            }}
          >
            <EditrimIcon name="undo" size={14} /> Reset
          </button>
          <button className="btn btn-cobalt" onClick={save}>Save brand kit</button>
        </>
      }
    >
      <div className="field" style={{ marginBottom: 22 }}>
        <label className="field-label" htmlFor="brand-name">Brand name</label>
        <input id="brand-name" className="input" value={kit.name} onChange={e => update({ name: e.target.value })} />
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <span className="field-label">Colours</span>
      </div>
      <div className="brand-colors">
        {kit.colors.map((c, i) => (
          <div className="brand-color" key={i}>
            <label style={{ background: c }}>
              <input
                type="color"
                value={c}
                onChange={e => {
                  const next = [...kit.colors];
                  next[i] = e.target.value;
                  update({ colors: next });
                }}
                aria-label={`Brand colour ${i + 1}`}
              />
            </label>
            <span>{c.toUpperCase()}</span>
            {kit.colors.length > 2 && (
              <button
                className="brand-color-remove"
                onClick={() => update({ colors: kit.colors.filter((_, j) => j !== i) })}
                aria-label="Remove colour"
              >
                <EditrimIcon name="trash" size={12} />
              </button>
            )}
          </div>
        ))}
        {kit.colors.length < 8 && (
          <button className="brand-color-add" onClick={() => update({ colors: [...kit.colors, '#FFFFFF'] })}>
            <EditrimIcon name="plus" size={16} /> Add
          </button>
        )}
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <span className="field-label">Palettes</span>
      </div>
      {palettes.length ? (
        <div className="brand-palette-list">
          {palettes.map(p => (
            <div className="brand-palette-row" key={p.name}>
              <button
                type="button"
                className="brand-palette-main"
                onClick={() => applyPalette(p)}
                title={`Use ${p.name}`}
              >
                <span className="brand-palette-swatches">
                  {p.colors.slice(0, 8).map((c, i) => <i key={i} style={{ background: c }} />)}
                </span>
                <span className="brand-palette-name">{p.name}</span>
              </button>
              <button
                type="button"
                className="brand-palette-remove"
                onClick={() => update({ palettes: palettes.filter(x => x.name !== p.name) })}
                aria-label={`Delete ${p.name}`}
              >
                <EditrimIcon name="trash" size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="brand-palette-empty">No palettes yet — save the colours above as a set.</p>
      )}
      <div className="brand-palette-save">
        <input
          className="input"
          value={paletteName}
          placeholder="Palette name"
          aria-label="Palette name"
          onChange={e => setPaletteName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              savePalette();
            }
          }}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={savePalette} disabled={!paletteName.trim()}>
          <EditrimIcon name="plus" size={13} /> Add
        </button>
      </div>
      <span className="brand-palette-hint">Save current colours as a palette — click one to load it back.</span>

      <div className="brand-fonts" style={{ marginTop: 22 }}>
        <div className="field">
          <label className="field-label" htmlFor="brand-heading">Heading font</label>
          <select
            id="brand-heading"
            className="select"
            value={kit.fonts[0]}
            onChange={e => update({ fonts: [e.target.value, kit.fonts[1] ?? 'Inter'] })}
          >
            {FONTS.map(f => <option key={f.family} value={f.family}>{f.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="brand-body">Body font</label>
          <select
            id="brand-body"
            className="select"
            value={kit.fonts[1]}
            onChange={e => update({ fonts: [kit.fonts[0], e.target.value] })}
          >
            {FONTS.map(f => <option key={f.family} value={f.family}>{f.label}</option>)}
          </select>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <span className="field-label">Logos <span className="brand-optional">{logos.length}/{MAX_LOGOS}</span></span>
      </div>
      <input
        ref={logoInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label="Upload brand logo"
        data-testid="brand-logo-input"
        onChange={e => {
          void uploadLogos(e.target.files);
          e.target.value = '';
        }}
      />
      {logos.length ? (
        <div className="brand-logo-grid">
          {logos.map((src, i) => (
            <LogoTile
              key={`${src}-${i}`}
              src={src}
              index={i}
              onRemove={() => update({ logos: logos.filter((_, j) => j !== i) })}
            />
          ))}
          {logos.length < MAX_LOGOS && (
            <button type="button" className="brand-logo-add" onClick={pickLogo} disabled={logoBusy} aria-label="Upload logo">
              <EditrimIcon name="upload" size={15} />
              <span>{logoBusy ? '…' : 'Add'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="brand-logo-empty">
          <EditrimIcon name="image" size={18} />
          <span>No logo yet.</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={pickLogo} disabled={logoBusy}>
            <EditrimIcon name="upload" size={14} /> {logoBusy ? 'Adding…' : 'Upload logo'}
          </button>
        </div>
      )}

      <div className="brand-preview" style={{ marginTop: 20, fontFamily: `"${kit.fonts[0]}", sans-serif` }}>
        <span style={{ color: kit.colors[0] }}>Aa</span>
        <div>
          <strong style={{ color: kit.colors[0] }}>{kit.name || 'Your brand'}</strong>
          <span style={{ fontFamily: `"${kit.fonts[1]}", sans-serif` }}>The quick brown fox jumps over the lazy dog.</span>
        </div>
      </div>

      <div className="field" style={{ marginTop: 18 }}>
        <label className="field-label" htmlFor="brand-voice">Brand voice sample <span className="brand-optional">optional</span></label>
        <textarea
          id="brand-voice"
          className="input"
          rows={3}
          value={kit.voice}
          onChange={e => update({ voice: e.target.value })}
          placeholder="Paste two or three sentences written in your brand's voice. AI copy can match it."
        />
        <span className="brand-voice-hint">Used only when you enable “Match brand voice” in AI Studio.</span>
      </div>
    </Modal>
  );
}
