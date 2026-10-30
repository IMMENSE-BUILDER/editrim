import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import type { Paint, Shadow } from '../lib/types';
import { FONTS } from '../lib/fonts';
import { SWATCHES } from '../lib/palettes';
import { clamp, round } from '../lib/utils';

export function InspectorSection({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="insp-section">
      <div className="insp-section-head">
        <h4>{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = -99999,
  max = 99999,
  step = 1,
  suffix,
  className = '',
}: {
  label?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}) {
  const [text, setText] = useState(String(round(value, 1)));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(String(round(value, 1)));
  }, [value]);

  const commit = (raw: string) => {
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(round(clamp(n, min, max), 1));
    setText(String(round(clamp(Number.isFinite(n) ? n : value, min, max), 1)));
  };

  return (
    <label className={`num-field ${className}`}>
      {label && <span className="num-label">{label}</span>}
      <input
        type="number"
        value={text}
        step={step}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={e => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== '' && Number.isFinite(n)) onChange(round(clamp(n, min, max), 1));
        }}
        onBlur={e => {
          focused.current = false;
          commit(e.target.value);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
      />
      {suffix && <span className="num-suffix">{suffix}</span>}
    </label>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (n: number) => string;
}) {
  return (
    <div className="slider-field">
      <div className="slider-head">
        <span>{label}</span>
        <span className="slider-value">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  full = true,
}: {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  full?: boolean;
}) {
  return (
    <div className={`segmented ${full ? 'full' : ''}`}>
      {options.map(o => (
        <button
          key={o.value}
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
          title={o.title}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorField({
  value,
  onChange,
  label,
  allowNone = false,
}: {
  value: string;
  onChange: (c: string) => void;
  label?: string;
  allowNone?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [hex, setHex] = useState(value.toUpperCase());

  useEffect(() => {
    setHex(value.toUpperCase());
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onMove = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open]);

  const normalized = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000';

  const openPopover = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = 224;
    const height = 250;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, r.left - 8));
    let top = r.bottom + 5;
    if (top + height > window.innerHeight - 8) top = Math.max(8, r.top - height - 5);
    setPos({ left, top });
    setOpen(v => !v);
  };

  return (
    <div className="color-field" ref={ref}>
      {label && <span className="field-label">{label}</span>}
      <button type="button" className="color-trigger" onClick={openPopover} ref={triggerRef}>
        <span className="color-chip" style={{ background: value === 'transparent' ? 'repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0/8px 8px' : value }} />
        <span className="color-hex-text">{value === 'transparent' ? 'None' : hex}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="color-pop" style={{ position: 'fixed', left: pos.left, top: pos.top }}>
          <div className="color-pop-top">
            <label className="color-native" style={{ background: normalized }}>
              <input type="color" value={normalized} onChange={e => onChange(e.target.value)} aria-label="Pick colour" />
            </label>
            <div className="color-hex-input">
              <span>#</span>
              <input
                value={hex.replace('#', '')}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9a-f]/gi, '').slice(0, 6);
                  setHex(`#${v.toUpperCase()}`);
                  if (v.length === 6) onChange(`#${v}`);
                }}
                aria-label="Hex colour"
              />
            </div>
            {allowNone && (
              <button className="color-none" onClick={() => { onChange('transparent'); setOpen(false); }}>
                None
              </button>
            )}
          </div>
          <div className="color-swatches">
            {SWATCHES.map(c => (
              <button
                key={c}
                style={{ background: c }}
                className={value.toLowerCase() === c.toLowerCase() ? 'active' : ''}
                onClick={() => onChange(c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function FontField({ value, onChange }: { value: string; onChange: (f: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onMove = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open]);

  const list = FONTS.filter(f => f.label.toLowerCase().includes(q.toLowerCase()));

  const toggle = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = 258;
    const height = 330;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, r.left - 8));
    let top = r.bottom + 5;
    if (top + height > window.innerHeight - 8) top = Math.max(8, r.top - height - 5);
    setPos({ left, top });
    setOpen(v => !v);
  };

  return (
    <div className="font-field" ref={ref}>
      <button type="button" className="font-trigger" onClick={toggle} ref={triggerRef}>
        <span className="font-trigger-sample" style={{ fontFamily: `"${value}", sans-serif` }}>Aa</span>
        <span className="font-trigger-name">{value}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="font-pop" style={{ position: 'fixed', left: pos.left, top: pos.top }}>
          <div className="font-search">
            <Search size={13} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search fonts" autoFocus />
          </div>
          <div className="font-list">
            {list.map(f => (
              <button
                key={f.family}
                className={value === f.family ? 'active' : ''}
                onClick={() => { onChange(f.family); setOpen(false); setQ(''); }}
              >
                <span style={{ fontFamily: `"${f.family}", sans-serif` }}>{f.label}</span>
                <small>{f.category}</small>
                {value === f.family && <Check size={13} />}
              </button>
            ))}
            {list.length === 0 && <div className="font-empty">No fonts found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export function PaintField({ paint, onChange, label }: { paint: Paint; onChange: (p: Paint) => void; label?: string }) {
  const kind = paint.kind === 'linear' ? 'linear' : 'solid';
  const solid = paint.kind === 'solid' ? paint.color : paint.kind === 'linear' ? paint.from : '#14130F';
  return (
    <div className="paint-field">
      {label && <span className="field-label">{label}</span>}
      <Segmented
        value={kind}
        options={[
          { value: 'solid', label: 'Solid' },
          { value: 'linear', label: 'Gradient' },
        ]}
        onChange={v => {
          if (v === 'solid') onChange({ kind: 'solid', color: solid });
          else onChange({ kind: 'linear', from: solid, to: '#D8F55A', angle: 135 });
        }}
      />
      {paint.kind === 'solid' && <ColorField value={paint.color} onChange={c => onChange({ kind: 'solid', color: c })} />}
      {paint.kind === 'linear' && (
        <div className="paint-gradient">
          <div className="paint-gradient-row">
            <ColorField value={paint.from} onChange={c => onChange({ ...paint, from: c })} />
            <span className="paint-arrow">→</span>
            <ColorField value={paint.to} onChange={c => onChange({ ...paint, to: c })} />
          </div>
          <SliderField label="Angle" value={paint.angle} min={0} max={360} onChange={a => onChange({ ...paint, angle: a })} format={v => `${v}°`} />
          <div className="paint-preview" style={{ background: `linear-gradient(${paint.angle}deg, ${paint.from}, ${paint.to})` }} />
        </div>
      )}
      {paint.kind === 'none' && <div className="muted-note">No fill</div>}
    </div>
  );
}

export function ShadowField({ shadow, onChange }: { shadow?: Shadow | null; onChange: (s: Shadow | null) => void }) {
  const enabled = Boolean(shadow);
  return (
    <div className="shadow-field">
      <div className="toggle-row">
        <span>Drop shadow</span>
        <button
          className={`switch ${enabled ? 'on' : ''}`}
          onClick={() => onChange(enabled ? null : { x: 0, y: 8, blur: 24, color: 'rgba(0,0,0,0.22)' })}
          aria-pressed={enabled}
          aria-label="Toggle drop shadow"
        >
          <i />
        </button>
      </div>
      {shadow && (
        <div className="shadow-controls">
          <div className="shadow-nums">
            <NumberField label="X" value={shadow.x} onChange={x => onChange({ ...shadow, x })} min={-100} max={100} />
            <NumberField label="Y" value={shadow.y} onChange={y => onChange({ ...shadow, y })} min={-100} max={100} />
            <NumberField label="Blur" value={shadow.blur} onChange={blur => onChange({ ...shadow, blur })} min={0} max={200} />
          </div>
          <ColorField value={shadow.color.startsWith('rgba') ? '#000000' : shadow.color} onChange={color => onChange({ ...shadow, color })} />
        </div>
      )}
    </div>
  );
}

export function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="insp-reset" onClick={onClick} title="Reset">
      <RotateCcw size={12} />
    </button>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked} aria-label={label}>
        <i />
      </button>
    </div>
  );
}

export function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button className="btn-icon" onClick={onClose} aria-label="Close">
      <X size={18} />
    </button>
  );
}
