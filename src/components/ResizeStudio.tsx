import { useEffect, useMemo, useState } from 'react';
import '../styles/resize.css';
import { Modal } from './Modal';
import { EditrimIcon } from './EditrimIcon';
import { useToast } from './Toast';
import type { Design } from '../lib/types';
import type { DesignMeta } from '../lib/storage';
import {
  RESIZE_TARGETS,
  createResizeVariant,
  listVariants,
  reflowPages,
  type ResizeTarget,
} from '../lib/resize';
import { clamp } from '../lib/utils';

const MAX_TARGETS = 6;

type CreatedVariant = { id: string; title: string; width: number; height: number };

const targetKey = (t: ResizeTarget) => `${t.name}::${t.width}x${t.height}`;

function ratioBox(w: number, h: number, box: number) {
  const ratio = w / h;
  return ratio >= 1
    ? { width: `${box}px`, height: `${Math.max(3, box / ratio)}px` }
    : { width: `${Math.max(3, box * ratio)}px`, height: `${box}px` };
}

function RatioDiagram({
  source,
  target,
  box = 15,
  on = false,
}: {
  source: { width: number; height: number };
  target: { width: number; height: number };
  box?: number;
  on?: boolean;
}) {
  return (
    <span className={`rsz-ratios ${on ? 'is-on' : ''}`} aria-hidden="true">
      <span className="rsz-mini">
        <i style={ratioBox(source.width, source.height, box)} />
      </span>
      <span className="rsz-ratio-sep" />
      <span className="rsz-mini">
        <i style={ratioBox(target.width, target.height, box)} />
      </span>
    </span>
  );
}

/**
 * Resize & variants — deep reflow of every page into channel sizes, with a
 * variant that stays linked to the master design through `rootId`.
 */
export function ResizeStudio({
  open,
  onClose,
  design,
  onOpenVariant,
}: {
  open: boolean;
  onClose: () => void;
  design: Design;
  onOpenVariant: (id: string) => void;
}): JSX.Element {
  const { toast } = useToast();
  const rootId = design.rootId ?? design.id;

  const [selected, setSelected] = useState<string[]>([]);
  const [customTargets, setCustomTargets] = useState<ResizeTarget[]>([]);
  const [customW, setCustomW] = useState(design.size.width);
  const [customH, setCustomH] = useState(design.size.height);
  const [variants, setVariants] = useState<DesignMeta[]>([]);
  const [created, setCreated] = useState<CreatedVariant[]>([]);
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setCustomTargets([]);
    setCustomW(design.size.width);
    setCustomH(design.size.height);
    setCreated([]);
    setWarnings(0);
    setVariants(listVariants(rootId).filter(v => v.id !== design.id));
    // Reset only when the studio is (re)opened or the master changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, design.id, rootId]);

  const targets = useMemo(() => [...RESIZE_TARGETS, ...customTargets], [customTargets]);

  const selectedTargets = useMemo(
    () => targets.filter(t => selected.includes(targetKey(t))),
    [targets, selected],
  );

  const groups = useMemo(() => {
    const order: string[] = [];
    for (const t of targets) {
      const g = t.group ?? 'Custom';
      if (!order.includes(g)) order.push(g);
    }
    return order.map(group => ({ group, items: targets.filter(t => (t.group ?? 'Custom') === group) }));
  }, [targets]);

  const toggle = (target: ResizeTarget) => {
    const key = targetKey(target);
    setSelected(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      if (prev.length >= MAX_TARGETS) return prev;
      return [...prev, key];
    });
  };

  const addCustom = () => {
    const width = clamp(Math.round(customW), 100, 6000);
    const height = clamp(Math.round(customH), 100, 6000);
    const target: ResizeTarget = { name: `${width} × ${height}`, width, height, group: 'Custom' };
    const key = targetKey(target);
    setCustomW(width);
    setCustomH(height);
    setCustomTargets(prev => (prev.some(t => targetKey(t) === key) ? prev : [...prev, target]));
    setSelected(prev => {
      if (prev.includes(key)) return prev;
      if (prev.length >= MAX_TARGETS) return prev;
      return [...prev, key];
    });
  };

  const create = () => {
    if (!selectedTargets.length) return;
    try {
      let totalWarnings = 0;
      const made = selectedTargets.map(target => {
        totalWarnings += reflowPages(design, target).warnings;
        const variant = createResizeVariant(design, target);
        return {
          id: variant.id,
          title: variant.title,
          width: variant.size.width,
          height: variant.size.height,
        };
      });
      setCreated(made);
      setWarnings(totalWarnings);
      setVariants(listVariants(rootId).filter(v => v.id !== design.id));
      toast(`Created ${made.length} variant${made.length === 1 ? '' : 's'}`);
    } catch {
      toast('Could not create variants — storage may be full', 'error');
    }
  };

  const atLimit = selected.length >= MAX_TARGETS;
  const count = selectedTargets.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resize & variants"
      subtitle="Fit every page into another size."
      width={720}
      footer={
        created.length ? (
          <>
            <span className="rsz-foot-note">
              {design.pages.length} {design.pages.length === 1 ? 'page' : 'pages'} per variant
            </span>
            <button className="btn btn-cobalt" onClick={onClose}>
              Done
            </button>
          </>
        ) : (
          <>
            <span className="rsz-foot-note">
              {count} selected · {design.pages.length} {design.pages.length === 1 ? 'page' : 'pages'} per variant
            </span>
            <button className="btn btn-cobalt" onClick={create} disabled={count === 0}>
              <EditrimIcon name="magic" size={15} />
              Create {count} variant{count === 1 ? '' : 's'}
            </button>
          </>
        )
      }
    >
      {created.length ? (
        <div className="rsz-root">
          <div className="rsz-result">
            <div className="rsz-result-head">
              <span className="rsz-kicker">Created</span>
              <span className="rsz-result-count">
                {created.length} variant{created.length === 1 ? '' : 's'} · {design.pages.length}{' '}
                {design.pages.length === 1 ? 'page' : 'pages'} each
              </span>
            </div>
            {warnings > 0 && <div className="rsz-warning">Some text was resized to fit</div>}
            <div className="rsz-variant-list">
              {created.map(v => (
                <div className="rsz-variant is-created" key={v.id}>
                  <EditrimIcon name="check" size={14} />
                  <span className="rsz-variant-title" title={v.title}>{v.title}</span>
                  <span className="rsz-variant-dims">{v.width} × {v.height}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => onOpenVariant(v.id)}>
                    Open
                    <EditrimIcon name="arrowRight" size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rsz-root">
          <div className="rsz-source">
            <span className="rsz-source-box">
              <i style={ratioBox(design.size.width, design.size.height, 22)} />
            </span>
            <div className="rsz-source-meta">
              <span className="rsz-kicker">Source</span>
              <b>{design.size.width} × {design.size.height}</b>
              <span className="rsz-source-pages">
                {design.pages.length} {design.pages.length === 1 ? 'page' : 'pages'}
              </span>
            </div>
          </div>

          <div className="rsz-summary">
            <span className="rsz-count">{count} / {MAX_TARGETS} selected</span>
            {count > 0 && (
              <span className="rsz-dims">
                {selectedTargets.map(t => `${t.width}×${t.height}`).join(' · ')}
              </span>
            )}
            <span className="rsz-pages">
              {design.pages.length} {design.pages.length === 1 ? 'page' : 'pages'} per variant
            </span>
          </div>

          <div className="rsz-groups">
            {groups.map(group => (
              <section className="rsz-group" key={group.group}>
                <div className="rsz-group-head">
                  <span>{group.group}</span>
                  <span>{group.items.length}</span>
                </div>
                <div className="rsz-grid">
                  {group.items.map(target => {
                    const key = targetKey(target);
                    const isOn = selected.includes(key);
                    const blocked = !isOn && atLimit;
                    return (
                      <button
                        key={key}
                        className={`rsz-target ${isOn ? 'is-on' : ''}`}
                        onClick={() => toggle(target)}
                        aria-pressed={isOn}
                        disabled={blocked}
                        title={blocked ? `Pick up to ${MAX_TARGETS} sizes` : `${target.name} · ${target.width} × ${target.height}`}
                      >
                        <RatioDiagram
                          source={design.size}
                          target={target}
                          on={isOn}
                        />
                        <span className="rsz-target-text">
                          <b>{target.name}</b>
                          <small>
                            {target.group === 'Custom' ? 'Custom size' : `${target.width} × ${target.height}`}
                          </small>
                        </span>
                        <span className="rsz-mark">
                          {isOn && <EditrimIcon name="check" size={12} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="rsz-custom">
            <div className="rsz-custom-fields">
              <div className="field">
                <label className="field-label" htmlFor="rsz-w">Width</label>
                <input
                  id="rsz-w"
                  className="input"
                  type="number"
                  min={100}
                  max={6000}
                  value={customW}
                  onChange={e => setCustomW(clamp(Number(e.target.value) || 100, 100, 6000))}
                  data-autofocus="false"
                />
              </div>
              <span className="rsz-times">×</span>
              <div className="field">
                <label className="field-label" htmlFor="rsz-h">Height</label>
                <input
                  id="rsz-h"
                  className="input"
                  type="number"
                  min={100}
                  max={6000}
                  value={customH}
                  onChange={e => setCustomH(clamp(Number(e.target.value) || 100, 100, 6000))}
                  data-autofocus="false"
                />
              </div>
            </div>
            <button className="btn btn-secondary btn-sm rsz-add" onClick={addCustom} disabled={atLimit}>
              <EditrimIcon name="plus" size={13} />
              Add
            </button>
          </div>

          {variants.length > 0 && (
            <section className="rsz-existing">
              <div className="rsz-group-head">
                <span>Variants</span>
                <span>{variants.length}</span>
              </div>
              <div className="rsz-variant-list">
                <div className="rsz-variant is-current">
                  <span className="rsz-current-dot" aria-hidden="true" />
                  <span className="rsz-variant-title" title={design.title}>{design.title}</span>
                  <span className="rsz-variant-dims">{design.size.width} × {design.size.height}</span>
                  <button className="btn btn-secondary btn-sm" disabled>
                    Current
                  </button>
                </div>
                {variants.map(v => (
                  <div className="rsz-variant" key={v.id}>
                    <EditrimIcon name="duplicate" size={14} />
                    <span className="rsz-variant-title" title={v.title}>{v.title}</span>
                    <span className="rsz-variant-dims">{v.width} × {v.height}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenVariant(v.id)}>
                      Open
                      <EditrimIcon name="arrowRight" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
