import { useEffect, useState } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { Modal } from './Modal';
import { getBrand, saveBrand, DEFAULT_BRAND } from '../lib/storage';
import { FONTS } from '../lib/fonts';
import type { BrandKit } from '../lib/types';
import { useToast } from './Toast';

export function BrandKitModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { toast } = useToast();
  const [kit, setKit] = useState<BrandKit>(() => getBrand());

  useEffect(() => {
    if (open) setKit(getBrand());
  }, [open]);

  const update = (patch: Partial<BrandKit>) => setKit(k => ({ ...k, ...patch }));

  const save = () => {
    saveBrand(kit);
    toast('Brand kit updated');
    onSaved?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Brand kit"
      subtitle="Keep your colours and type in one place. Available in every design."
      footer={
        <>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setKit({ ...DEFAULT_BRAND, colors: [...DEFAULT_BRAND.colors], fonts: [...DEFAULT_BRAND.fonts] });
            }}
          >
            <RotateCcw size={14} /> Reset
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
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
        {kit.colors.length < 8 && (
          <button className="brand-color-add" onClick={() => update({ colors: [...kit.colors, '#FFFFFF'] })}>
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      <div className="brand-fonts">
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
      <div className="brand-preview" style={{ fontFamily: `"${kit.fonts[0]}", sans-serif` }}>
        <span style={{ color: kit.colors[0] }}>Aa</span>
        <div>
          <strong style={{ color: kit.colors[0] }}>{kit.name || 'Your brand'}</strong>
          <span style={{ fontFamily: `"${kit.fonts[1]}", sans-serif` }}>The quick brown fox jumps over the lazy dog.</span>
        </div>
      </div>
    </Modal>
  );
}
