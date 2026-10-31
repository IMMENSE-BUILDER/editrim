import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Plus } from 'lucide-react';
import { Modal } from './Modal';
import { GROUP_ORDER, SIZE_PRESETS } from '../lib/presets';
import { createDesign } from '../lib/storage';
import type { Design } from '../lib/types';
import { useToast } from './Toast';

export function NewDesignModal({
  open,
  onClose,
  onCreated,
  initialGroup = 'Social',
  initialCustom = false,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (design: Design) => void;
  initialGroup?: string;
  initialCustom?: boolean;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState(initialGroup);
  const [custom, setCustom] = useState(initialCustom);
  const [w, setW] = useState(1080);
  const [h, setH] = useState(1080);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!open) return;
    setCustom(initialCustom);
    setGroup(initialGroup);
  }, [open, initialCustom, initialGroup]);

  const presets = useMemo(() => SIZE_PRESETS.filter(p => p.group === group), [group]);

  const start = (width: number, height: number, name: string) => {
    const design = createDesign({ title: title.trim() || name, width, height, category: group });
    toast('Canvas ready — make something good');
    onClose();
    if (onCreated) onCreated(design);
    else navigate(`/editor/${design.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a design"
      subtitle="Pick a size, or start from a blank canvas at any dimensions."
      width={760}
      footer={
        custom ? (
          <>
            <button className="btn btn-ghost" onClick={() => setCustom(false)}>Back to presets</button>
            <button className="btn btn-cobalt" onClick={() => start(w, h, 'Untitled design')}>
              Create canvas
              <ArrowRight size={15} />
            </button>
          </>
        ) : (
          <button className="btn btn-ghost" onClick={() => setCustom(true)}>
            <Plus size={15} /> Custom size
          </button>
        )
      }
    >
      {!custom ? (
        <>
          <div className="size-tabs" role="tablist">
            {GROUP_ORDER.map(g => (
              <button
                key={g}
                role="tab"
                aria-selected={group === g}
                className={`size-tab ${group === g ? 'active' : ''}`}
                onClick={() => setGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="size-grid">
            {presets.map(p => (
              <button key={p.id} className="size-card" onClick={() => start(p.w, p.h, p.name)}>
                <span className="size-card-shape" style={{ aspectRatio: `${p.w} / ${p.h}` }} />
                <span className="size-card-body">
                  <span className="size-card-name">{p.name}</span>
                  <span className="size-card-hint">{p.hint} · {p.w}×{p.h}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="size-custom-hint">
            <LayoutGrid size={16} />
            Need a different size? Use <button onClick={() => setCustom(true)}>custom dimensions</button>.
          </div>
        </>
      ) : (
        <div className="custom-size">
          <div className="field">
            <label className="field-label" htmlFor="design-title">Design name <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input id="design-title" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled design" />
          </div>
          <div className="custom-size-row">
            <div className="field">
              <label className="field-label" htmlFor="design-w">Width (px)</label>
              <input id="design-w" className="input" type="number" min={100} max={6000} value={w} onChange={e => setW(Math.max(100, Math.min(6000, Number(e.target.value) || 100)))} />
            </div>
            <span className="custom-x">×</span>
            <div className="field">
              <label className="field-label" htmlFor="design-h">Height (px)</label>
              <input id="design-h" className="input" type="number" min={100} max={6000} value={h} onChange={e => setH(Math.max(100, Math.min(6000, Number(e.target.value) || 100)))} />
            </div>
          </div>
          <div className="custom-size-preview">
            <div style={{ aspectRatio: `${w} / ${h}` }} />
            <span>{w} × {h} px</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
