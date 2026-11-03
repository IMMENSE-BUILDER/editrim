import { useEffect, useMemo, useRef, useState } from 'react';
import { EditrimIcon } from './EditrimIcon';
import { PagePreview } from './PagePreview';
import { useToast } from './Toast';
import { createDesign, saveDesign } from '../lib/storage';
import type { Design, DesignSize } from '../lib/types';
import {
  deleteSnapshot,
  listSnapshots,
  saveSnapshot,
  type Snapshot,
  type SnapshotKind,
} from '../lib/versionHistory';
import '../styles/history.css';

const KIND_LABEL: Record<SnapshotKind, string> = {
  autosave: 'Auto',
  checkpoint: 'Checkpoint',
  restore: 'Restore',
  opened: 'Opened',
};

const DAY_MS = 86_400_000;

function dayStart(ts: number) {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function dayLabel(ts: number) {
  const diff = Math.round((dayStart(Date.now()) - dayStart(ts)) / DAY_MS);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  const date = new Date(ts);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  const month = date.toLocaleDateString(undefined, { month: 'short' });
  return `${date.getDate()} ${month}${sameYear ? '' : ` ${date.getFullYear()}`}`;
}

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function pageCountLabel(count: number) {
  return `${count} ${count === 1 ? 'page' : 'pages'}`;
}

/** Largest sheet that fits a max width / max height box. */
function fitWidth(size: DesignSize, maxWidth: number, maxHeight: number) {
  const ratio = size.width / Math.max(1, size.height);
  return Math.max(10, Math.min(maxWidth, maxHeight * ratio));
}

type DayGroup = { key: number; label: string; items: Snapshot[] };

function groupByDay(snapshots: Snapshot[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const snapshot of snapshots) {
    const key = dayStart(snapshot.at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(snapshot);
    else groups.push({ key, label: dayLabel(snapshot.at), items: [snapshot] });
  }
  return groups;
}

function Sheet({ page, size, maxWidth, maxHeight }: {
  page: Design['pages'][number] | undefined;
  size: DesignSize;
  maxWidth: number;
  maxHeight: number;
}) {
  if (!page) {
    return (
      <span className="history-sheet-empty" aria-hidden="true">
        <EditrimIcon name="page" size={16} />
      </span>
    );
  }
  return (
    <span className="history-sheet" style={{ width: fitWidth(size, maxWidth, maxHeight) }}>
      <PagePreview page={page} size={size} />
    </span>
  );
}

function SnapshotRow({
  snapshot,
  selected,
  confirming,
  onSelect,
  onRestore,
  onCopy,
  onDelete,
}: {
  snapshot: Snapshot;
  selected: boolean;
  confirming: boolean;
  onSelect: () => void;
  onRestore: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const firstPage = snapshot.design.pages[0];
  return (
    <li className={`history-item ${selected ? 'is-selected' : ''}`}>
      <button
        type="button"
        className="history-item-main"
        onClick={onSelect}
        aria-expanded={selected}
      >
        <span className="history-thumb" aria-hidden="true">
          <Sheet page={firstPage} size={snapshot.design.size} maxWidth={64} maxHeight={78} />
        </span>
        <span className="history-meta">
          <span className="history-label">{snapshot.label}</span>
          <span className="history-meta-line">
            <span>{timeLabel(snapshot.at)}</span>
            <span className="history-sep" aria-hidden="true" />
            <span>{pageCountLabel(snapshot.pageCount)}</span>
          </span>
        </span>
        <span className={`history-kind history-kind-${snapshot.kind}`}>{KIND_LABEL[snapshot.kind]}</span>
        <span className="history-chevron" aria-hidden="true">
          <EditrimIcon name="chevronRight" size={14} />
        </span>
      </button>

      {selected && (
        <div className="history-detail">
          <div className="history-detail-preview">
            <Sheet page={firstPage} size={snapshot.design.size} maxWidth={280} maxHeight={190} />
          </div>
          <div className="history-actions">
            <button type="button" className="btn btn-cobalt btn-sm" onClick={onRestore}>
              <EditrimIcon name="refresh" size={13} />
              Restore
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCopy}>
              <EditrimIcon name="duplicate" size={13} />
              Save a copy
            </button>
            <button
              type="button"
              className={`btn btn-ghost btn-sm history-delete ${confirming ? 'is-confirming' : ''}`}
              onClick={onDelete}
            >
              <EditrimIcon name="trash" size={13} />
              {confirming ? 'Confirm delete' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * Right-side version history. Loads snapshots from IndexedDB on open, creates
 * a single baseline on the first ever open, and otherwise only writes when the
 * user asks for a checkpoint (or deletes a version).
 */
export function HistoryDrawer({
  open,
  onClose,
  design,
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  design: Design;
  onRestore: (design: Design) => void;
}): JSX.Element {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const panelRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const designRef = useRef(design);
  const onCloseRef = useRef(onClose);
  designRef.current = design;
  onCloseRef.current = onClose;

  const groups = useMemo(() => groupByDay(snapshots), [snapshots]);
  const currentPage = design.pages[0];

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setSelectedId(null);
    setConfirmId(null);

    void (async () => {
      const rows = await listSnapshots(design.id);
      if (cancelled) return;
      if (rows.length) {
        setSnapshots(rows);
      } else {
        const baseline = await saveSnapshot(designRef.current, 'Opened', 'opened');
        if (cancelled) return;
        setSnapshots(baseline ? [baseline] : []);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, design.id]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter(element => element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      // The drawer is modal: canvas shortcuts (Delete, arrows, undo) stay out.
      event.stopPropagation();
    };

    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      panel.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!confirmId) return;
    const timer = window.setTimeout(() => setConfirmId(null), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmId]);

  async function handleCheckpoint() {
    if (busy) return;
    setBusy(true);
    const snapshot = await saveSnapshot(designRef.current, 'Checkpoint', 'checkpoint');
    setBusy(false);
    if (!snapshot) {
      toast('Nothing new to save');
      return;
    }
    setSnapshots(prev => [snapshot, ...prev.filter(row => row.id !== snapshot.id)]);
    setSelectedId(snapshot.id);
    setConfirmId(null);
    toast('Checkpoint saved');
  }

  function handleCopy(snapshot: Snapshot) {
    const source = snapshot.design;
    const copy = createDesign({
      title: `${source.title} copy`,
      width: source.size.width,
      height: source.size.height,
      category: source.category,
    });
    copy.pages = structuredClone(source.pages);
    copy.size = { ...source.size };
    saveDesign(copy);
    toast('Copy created');
  }

  async function handleDelete(snapshot: Snapshot) {
    if (confirmId !== snapshot.id) {
      setConfirmId(snapshot.id);
      return;
    }
    setConfirmId(null);
    setSelectedId(current => (current === snapshot.id ? null : current));
    await deleteSnapshot(snapshot.id);
    setSnapshots(prev => prev.filter(row => row.id !== snapshot.id));
    toast('Version deleted');
  }

  if (!open) return <></>;

  const countLabel = `${snapshots.length} ${snapshots.length === 1 ? 'version' : 'versions'}`;

  return (
    <>
      <div className="history-scrim" onPointerDown={onClose} />
      <aside
        ref={panelRef}
        className="history-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        tabIndex={-1}
      >
        <header className="history-head">
          <div className="history-head-copy">
            <h2 id="history-title">Version history</h2>
            <p>Saved on this device.</p>
          </div>
          <div className="history-head-tools">
            {!loading && <span className="history-count">{countLabel}</span>}
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close version history">
              <EditrimIcon name="close" size={18} />
            </button>
          </div>
        </header>

        <div className="history-body" aria-busy={loading}>
          <section className="history-live" aria-label="Current state">
            <span className="history-thumb history-thumb-live" aria-hidden="true">
              <Sheet page={currentPage} size={design.size} maxWidth={64} maxHeight={78} />
            </span>
            <div className="history-live-copy">
              <div className="history-live-top">
                <span className="history-live-title">Current</span>
                <span className="history-live-badge">Live</span>
              </div>
              <span className="history-live-meta">{pageCountLabel(design.pages.length)}</span>
              <span className="history-live-name" title={design.title}>{design.title}</span>
            </div>
          </section>

          {!loading && snapshots.length === 0 ? (
            <div className="history-empty">
              <span className="history-empty-icon" aria-hidden="true">
                <EditrimIcon name="clock" size={20} />
              </span>
              <p>No versions yet.</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleCheckpoint} disabled={busy}>
                <EditrimIcon name="plus" size={14} />
                Save checkpoint
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm history-save"
                onClick={handleCheckpoint}
                disabled={busy || loading}
              >
                <EditrimIcon name="plus" size={14} />
                Save checkpoint
              </button>

              {loading ? (
                <div className="history-loading" aria-hidden="true">
                  {[0, 1, 2].map(row => (
                    <div className="history-skeleton" key={row}>
                      <span className="history-sk-thumb" />
                      <span className="history-sk-lines">
                        <span className="history-sk-line" />
                        <span className="history-sk-line history-sk-line-short" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="history-timeline">
                  {groups.map(group => (
                    <section className="history-group" key={group.key} aria-label={group.label}>
                      <h3 className="history-day">{group.label}</h3>
                      <ul className="history-list">
                        {group.items.map(snapshot => (
                          <SnapshotRow
                            key={snapshot.id}
                            snapshot={snapshot}
                            selected={selectedId === snapshot.id}
                            confirming={confirmId === snapshot.id}
                            onSelect={() => {
                              setConfirmId(null);
                              setSelectedId(current => (current === snapshot.id ? null : snapshot.id));
                            }}
                            onRestore={() => onRestore(structuredClone(snapshot.design))}
                            onCopy={() => handleCopy(snapshot)}
                            onDelete={() => void handleDelete(snapshot)}
                          />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
