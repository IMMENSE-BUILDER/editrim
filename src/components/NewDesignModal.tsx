import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutGrid, Plus, Search, X } from 'lucide-react';
import { Modal } from './Modal';
import { FormatGlyph } from './FormatGlyph';
import { GROUP_ORDER, SIZE_PRESETS, type SizePreset } from '../lib/presets';
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
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setCustom(initialCustom);
    setGroup(initialGroup);
    setQuery('');
  }, [open, initialCustom, initialGroup]);

  const presets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      const score = (p: SizePreset) => {
        const name = p.name.toLowerCase();
        if (name.startsWith(q)) return 0;
        if (name.split(/\s+/).some(word => word.startsWith(q))) return 1;
        return 2;
      };
      return SIZE_PRESETS
        .filter(p => `${p.name} ${p.group} ${p.hint}`.toLowerCase().includes(q))
        .sort((a, b) => score(a) - score(b));
    }
    return SIZE_PRESETS.filter(p => p.group === group);
  }, [group, query]);

  const start = (width: number, height: number, name: string, category = group) => {
    const design = createDesign({ title: title.trim() || name, width, height, category });
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
      subtitle={`Design library — ${SIZE_PRESETS.length} formats across social, print, brand, web and docs. Or set any size.`}
      width={760}
      footer={
        custom ? (
          <>
            <button className="btn btn-ghost" onClick={() => setCustom(false)}>Back to presets</button>
            <button className="btn btn-cobalt" onClick={() => start(w, h, 'Untitled design', 'Custom')}>
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
          <div className="size-search">
            <Search size={15} />
            <input
              className="size-search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && presets[0]) start(presets[0].w, presets[0].h, presets[0].name, presets[0].name);
              }}
              placeholder={`Search ${SIZE_PRESETS.length} formats`}
              aria-label="Search design formats"
              data-autofocus="false"
            />
            {query && (
              <button className="size-search-clear" onClick={() => setQuery('')} aria-label="Clear format search">
                <X size={14} />
              </button>
            )}
          </div>
          {!query.trim() ? (
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
          ) : (
            <div className="size-results-count" aria-live="polite">{presets.length} {presets.length === 1 ? 'format' : 'formats'} matching “{query.trim()}”</div>
          )}
          <div className="size-grid" key={query.trim() ? 'search' : group}>
            {presets.map((p, i) => (
              <button
                key={p.id}
                className="size-card"
                onClick={() => start(p.w, p.h, p.name, p.name)}
                style={{ animationDelay: `${Math.min(i, 8) * 18}ms` }}
              >
                <FormatGlyph formatId={p.id} ratio={p.w / p.h} />
                <span className="size-card-body">
                  <span className="size-card-name">{p.name}</span>
                  <span className="size-card-hint">{query.trim() ? `${p.group} · ${p.hint} · ` : `${p.hint} · `}{p.w}×{p.h}</span>
                </span>
                <ArrowRight size={14} className="size-card-go" />
              </button>
            ))}
          </div>
          {presets.length === 0 && (
            <div className="size-empty">
              <strong>No formats match “{query.trim()}”.</strong>
              <p>Try “story”, “print”, “banner” or a format name.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setQuery('')}>Clear search</button>
            </div>
          )}
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
