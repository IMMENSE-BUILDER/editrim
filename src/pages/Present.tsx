import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EditrimIcon } from '../components/EditrimIcon';
import { PagePreview } from '../components/PagePreview';
import { getDesign } from '../lib/storage';
import type { Design } from '../lib/types';
import '../styles/present.css';

const SYNC_KEY = (id: string) => `editrim.present.v1.${id}`;
const SYNC_CHANNEL = (id: string) => `editrim-present-${id}`;

type SyncMessage = { type: 'go' | 'hello'; index: number; source: string; at: number };

function clockText(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function Present() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const presenter = search.get('presenter') === '1';
  const navigate = useNavigate();

  const [design, setDesign] = useState<Design | null>(null);
  const [missing, setMissing] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [controls, setControls] = useState(true);
  const [auto, setAuto] = useState(false);
  const [black, setBlack] = useState(false);
  const [help, setHelp] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const pageRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const indexRef = useRef(0);
  const lastIndexRef = useRef(0);
  const startedAt = useRef(Date.now());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const clientId = useRef(`c_${Math.random().toString(36).slice(2, 10)}`).current;

  const pages = design?.pages.length ?? 0;

  useEffect(() => {
    if (!id) return;
    const d = getDesign(id);
    if (d) {
      setDesign(d);
      document.title = `${d.title} — Present — Editrim`;
    } else {
      setMissing(true);
    }
  }, [id]);

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.classList.add('presenting');
    return () => document.body.classList.remove('presenting');
  }, []);

  const nudge = useCallback(() => {
    setControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControls(false), 3000);
  }, []);

  useEffect(() => {
    nudge();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [nudge]);

  const commit = useCallback(
    (target: number, broadcast = true) => {
      if (pages <= 0) return;
      const next = Math.max(0, Math.min(pages - 1, target));
      indexRef.current = next;
      setPageIndex(next);
      setControls(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setControls(false), 3000);
      if (!broadcast) return;
      const message: SyncMessage = { type: 'go', index: next, source: clientId, at: Date.now() };
      const channel = channelRef.current;
      if (channel) {
        try {
          channel.postMessage(message);
        } catch {
          // channel closed between renders
        }
      } else if (id) {
        try {
          localStorage.setItem(SYNC_KEY(id), JSON.stringify(message));
        } catch {
          // storage may be unavailable in private browsing
        }
      }
    },
    [pages, clientId, id],
  );

  /* Cross-window sync: BroadcastChannel first, storage events as the fallback. */
  useEffect(() => {
    if (!id || pages <= 0) return;
    const channelName = SYNC_CHANNEL(id);

    const send = (message: SyncMessage) => {
      const channel = channelRef.current;
      if (channel) {
        try {
          channel.postMessage(message);
        } catch {
          // channel closed between renders
        }
        return;
      }
      try {
        localStorage.setItem(SYNC_KEY(id), JSON.stringify(message));
      } catch {
        // storage may be unavailable in private browsing
      }
    };

    const applyRemote = (raw: unknown) => {
      if (!raw || typeof raw !== 'object') return;
      const message = raw as { type?: unknown; index?: unknown; source?: unknown };
      if (message.source === clientId) return;
      if (message.type === 'hello') {
        send({ type: 'go', index: indexRef.current, source: clientId, at: Date.now() });
        return;
      }
      if (message.type !== 'go' || typeof message.index !== 'number' || !Number.isFinite(message.index)) return;
      const next = Math.max(0, Math.min(pages - 1, Math.round(message.index)));
      indexRef.current = next;
      setPageIndex(next);
      setControls(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setControls(false), 3000);
    };

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(channelName);
      channel.onmessage = event => applyRemote(event.data);
      channelRef.current = channel;
    }
    if (presenter) {
      send({ type: 'hello', index: indexRef.current, source: clientId, at: Date.now() });
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== SYNC_KEY(id) || !event.newValue) return;
      try {
        applyRemote(JSON.parse(event.newValue));
      } catch {
        // ignore malformed payloads
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      const channel = channelRef.current;
      if (channel) {
        channel.onmessage = null;
        channel.close();
        channelRef.current = null;
      }
      window.removeEventListener('storage', onStorage);
    };
  }, [id, pages, presenter, clientId]);

  /* Autoplay: 5s per page, loops. */
  useEffect(() => {
    if (!auto || pages <= 1) return;
    const timer = window.setInterval(() => {
      const next = indexRef.current + 1 >= pages ? 0 : indexRef.current + 1;
      commit(next);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [auto, pages, commit]);

  /* Presenter clock. */
  useEffect(() => {
    if (!presenter) return;
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [presenter]);

  /* Restart the incoming page transition on navigation. */
  useEffect(() => {
    if (lastIndexRef.current === pageIndex) return;
    lastIndexRef.current = pageIndex;
    const el = pageRef.current;
    if (!el) return;
    el.classList.remove('is-entering');
    void el.offsetWidth;
    el.classList.add('is-entering');
  }, [pageIndex]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => null);
    } else {
      document.documentElement.requestFullscreen().catch(() => null);
    }
  }, []);

  const closeWindow = useCallback(() => {
    if (window.opener) window.close();
    else navigate(`/editor/${id}`);
  }, [navigate, id]);

  const resetTimer = useCallback(() => {
    startedAt.current = Date.now();
    setElapsed(0);
  }, []);

  const openPresenter = useCallback(() => {
    window.open(`/present/${id}?presenter=1`, 'editrim-presenter', 'width=1280,height=800');
  }, [id]);

  const openAudience = useCallback(() => {
    window.open(`/present/${id}`, 'editrim-audience', 'width=1280,height=800');
  }, [id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (key === 'ArrowRight' || key === ' ' || key === 'PageDown') {
        event.preventDefault();
        commit(indexRef.current + 1);
        nudge();
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        event.preventDefault();
        commit(indexRef.current - 1);
        nudge();
      } else if (key === 'Home') {
        event.preventDefault();
        commit(0);
        nudge();
      } else if (key === 'End') {
        event.preventDefault();
        commit(pages - 1);
        nudge();
      } else if (key === 'Escape') {
        if (help) setHelp(false);
        else if (notesOpen) setNotesOpen(false);
        else if (black) setBlack(false);
        else if (presenter) closeWindow();
        else navigate(`/editor/${id}`);
      } else if (key === '?') {
        event.preventDefault();
        if (!event.repeat) setHelp(v => !v);
        nudge();
      } else if (key.toLowerCase() === 'b') {
        if (!event.repeat) setBlack(v => !v);
        nudge();
      } else if (key.toLowerCase() === 'n') {
        if (!event.repeat && !presenter) setNotesOpen(v => !v);
        nudge();
      } else if (key.toLowerCase() === 'a') {
        if (!event.repeat) setAuto(v => !v);
        nudge();
      } else if (key.toLowerCase() === 'f') {
        if (!event.repeat) toggleFullscreen();
        nudge();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commit, pages, nudge, help, notesOpen, black, presenter, closeWindow, navigate, id, toggleFullscreen]);

  if (missing) {
    return (
      <div className="present-missing">
        <h1>Design not found</h1>
        <p>This presentation is stored in another browser, or it was deleted.</p>
        <Link to="/dashboard" className="btn btn-lime">Back to your designs</Link>
      </div>
    );
  }

  if (!design) return <div className="present-loading">Loading presentation…</div>;

  const total = design.pages.length;
  if (total === 0) {
    return (
      <div className="present-missing">
        <h1>Nothing to present</h1>
        <p>This design has no pages yet. Add one in the editor, then present again.</p>
        <Link to={`/editor/${id}`} className="btn btn-lime">Back to editor</Link>
      </div>
    );
  }
  const index = Math.max(0, Math.min(pageIndex, total - 1));
  const page = design.pages[index];
  const nextPage = design.pages[index + 1] ?? null;
  const transition = page.transition ?? 'none';
  const notes = (page.notes ?? '').trim();
  const ratio = design.size.width / design.size.height;

  const helpPanel = help ? (
    <div className="present-help-scrim" onClick={() => setHelp(false)}>
      <div className="present-help" role="dialog" aria-label="Keyboard shortcuts" onClick={e => e.stopPropagation()}>
        <header>
          <h2>Shortcuts</h2>
          <button className="present-tool" onClick={() => setHelp(false)} title="Close (Esc)">
            <EditrimIcon name="close" size={14} />
          </button>
        </header>
        <div className="present-help-row"><span>Next</span><span className="present-help-keys"><kbd>→</kbd><kbd>Space</kbd><kbd>PgDn</kbd></span></div>
        <div className="present-help-row"><span>Previous</span><span className="present-help-keys"><kbd>←</kbd><kbd>PgUp</kbd></span></div>
        <div className="present-help-row"><span>First / last</span><span className="present-help-keys"><kbd>Home</kbd><kbd>End</kbd></span></div>
        <div className="present-help-row"><span>Autoplay</span><span className="present-help-keys"><kbd>A</kbd></span></div>
        <div className="present-help-row"><span>Black screen</span><span className="present-help-keys"><kbd>B</kbd></span></div>
        <div className="present-help-row"><span>Notes</span><span className="present-help-keys"><kbd>N</kbd></span></div>
        <div className="present-help-row"><span>Fullscreen</span><span className="present-help-keys"><kbd>F</kbd></span></div>
        <div className="present-help-row"><span>Exit</span><span className="present-help-keys"><kbd>Esc</kbd></span></div>
      </div>
    </div>
  ) : null;

  if (presenter) {
    const stacked = vp.w <= 900;
    const railWidth = Math.max(300, vp.w * 0.38);
    const paneW = stacked ? Math.max(220, vp.w - 32) : Math.max(260, vp.w - railWidth - 56);
    const paneH = stacked ? Math.max(160, vp.h * 0.42) : Math.max(180, vp.h - 150);
    let pw = paneW;
    let ph = pw / ratio;
    if (ph > paneH) {
      ph = paneH;
      pw = ph * ratio;
    }

    return (
      <div className="present present-presenter">
        <header className="presenter-top">
          <div className="presenter-top-left">
            <span className="presenter-mark"><EditrimIcon name="present" size={14} /></span>
            <strong>{design.title}</strong>
            <span className="presenter-page-name">{page.name}</span>
          </div>
          <div className="presenter-top-right">
            <span className="presenter-live"><span className="presenter-dot" /> Presenter</span>
            <button className="present-tool" onClick={closeWindow} title="Close presenter view">
              <EditrimIcon name="close" size={15} />
            </button>
          </div>
        </header>

        <div className="presenter-body">
          <section className={`presenter-stage ${black ? 'is-blank' : ''}`} onClick={black ? () => setBlack(false) : undefined}>
            <div ref={pageRef} className="present-page" data-transition={transition} style={{ width: pw, height: ph }}>
              <PagePreview page={page} size={design.size} />
            </div>
            {black && <div className="presenter-blank" />}
          </section>

          <aside className="presenter-rail">
            <div className="presenter-card presenter-clock">
              <div className="presenter-clock-face">
                <EditrimIcon name="clock" size={14} />
                <span className="presenter-clock-time">{clockText(elapsed)}</span>
              </div>
              <span className="presenter-clock-slide">{index + 1} / {total}</span>
              <button className="present-tool" onClick={resetTimer} title="Reset timer">
                <EditrimIcon name="refresh" size={14} />
              </button>
            </div>

            <div className="presenter-card presenter-next">
              <span className="presenter-label">Next slide</span>
              <div className="presenter-next-thumb">
                {nextPage ? (
                  <PagePreview page={nextPage} size={design.size} />
                ) : (
                  <div className="presenter-next-empty">End of deck</div>
                )}
              </div>
              <span className="presenter-next-name">{nextPage ? nextPage.name : '—'}</span>
            </div>

            <div className="presenter-card presenter-notes">
              <span className="presenter-label"><EditrimIcon name="comment" size={12} /> Notes</span>
              <p>{notes || 'No notes for this page.'}</p>
            </div>

            <div className="presenter-controls">
              <button className="btn btn-secondary btn-sm" onClick={() => commit(index - 1)} disabled={index === 0}>
                <EditrimIcon name="chevronLeft" size={14} /> Previous
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => commit(index + 1)} disabled={index === total - 1}>
                Next <EditrimIcon name="chevronRight" size={14} />
              </button>
            </div>

            <div className="presenter-tools">
              <button className={`presenter-tool ${black ? 'is-on' : ''}`} onClick={() => setBlack(v => !v)} title="Black screen (B)">
                <EditrimIcon name="moon" size={14} /> Black
              </button>
              <button className="presenter-tool" onClick={openAudience} title="Open audience window">
                <EditrimIcon name="external" size={14} /> Audience
              </button>
              <button className="presenter-tool" onClick={closeWindow} title="Close presenter view">
                <EditrimIcon name="close" size={14} /> Close
              </button>
            </div>
          </aside>
        </div>

        {helpPanel}
      </div>
    );
  }

  const padX = vp.w > 800 ? 72 : 20;
  const padY = vp.h > 600 ? 96 : 56;
  const maxW = Math.max(100, vp.w - padX * 2);
  const maxH = Math.max(100, vp.h - padY * 2 - 54);
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }

  return (
    <div
      className={`present ${controls ? 'show-controls' : ''} ${black ? 'is-black' : ''}`}
      onMouseMove={nudge}
      onClick={nudge}
    >
      <div className="present-stage">
        <div ref={pageRef} className="present-page" data-transition={transition} style={{ width: w, height: h }}>
          <PagePreview page={page} size={design.size} ariaLabel={`${design.title}, page ${index + 1}`} />
        </div>
      </div>

      <button className="present-exit" onClick={() => navigate(`/editor/${id}`)} title="Exit presentation (Esc)">
        <EditrimIcon name="close" size={16} /> Exit
      </button>

      <div className="present-progress" onClick={e => e.stopPropagation()}>
        {design.pages.map((p, i) => (
          <button
            key={p.id}
            className={i === index ? 'active' : ''}
            onClick={() => commit(i)}
            aria-label={`Go to page ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </div>

      <div className="present-nav">
        <button
          className="present-arrow present-arrow-left"
          onClick={e => { e.stopPropagation(); commit(index - 1); }}
          disabled={index === 0}
          aria-label="Previous page"
        >
          <EditrimIcon name="chevronLeft" size={22} />
        </button>
        <button
          className="present-arrow present-arrow-right"
          onClick={e => { e.stopPropagation(); commit(index + 1); }}
          disabled={index === total - 1}
          aria-label="Next page"
        >
          <EditrimIcon name="chevronRight" size={22} />
        </button>
      </div>

      <div className="present-bar" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setAuto(a => !a)}
          title={auto ? 'Pause autoplay (A)' : 'Autoplay (A)'}
          className={`present-tool ${auto ? 'is-on' : ''}`}
        >
          {auto ? <EditrimIcon name="pause" size={15} /> : <EditrimIcon name="play" size={15} />}
        </button>
        <span className="present-count">{index + 1} / {total}</span>
        <span className="present-title">{design.title}</span>
        <div className="present-tools">
          <button
            className={`present-tool ${notesOpen ? 'is-on' : ''}`}
            onClick={() => setNotesOpen(v => !v)}
            title="Speaker notes (N)"
          >
            <EditrimIcon name="comment" size={15} />
          </button>
          <button className={`present-tool ${help ? 'is-on' : ''}`} onClick={() => setHelp(v => !v)} title="Shortcuts (?)">
            <EditrimIcon name="help" size={15} />
          </button>
          <button className={`present-tool ${black ? 'is-on' : ''}`} onClick={() => setBlack(v => !v)} title="Black screen (B)">
            <EditrimIcon name="moon" size={15} />
          </button>
          <button className="present-tool" onClick={openPresenter} title="Presenter view">
            <EditrimIcon name="present" size={15} />
          </button>
          <button className="present-tool" onClick={toggleFullscreen} title="Fullscreen (F)">
            <EditrimIcon name="fit" size={15} />
          </button>
          <button className="present-tool" onClick={() => navigate(`/editor/${id}`)} title="Back to editor">
            <EditrimIcon name="arrowLeft" size={15} />
          </button>
        </div>
      </div>

      {controls && (
        <div className="present-hint">
          <span><kbd>←</kbd><kbd>→</kbd> navigate</span>
          <span><kbd>N</kbd> notes</span>
          <span><kbd>B</kbd> black</span>
          <span><kbd>?</kbd> shortcuts</span>
        </div>
      )}

      {notesOpen && (
        <aside className="present-notes" onClick={e => e.stopPropagation()}>
          <header>
            <span><EditrimIcon name="comment" size={12} /> Notes</span>
            <button className="present-tool" onClick={() => setNotesOpen(false)} title="Close notes">
              <EditrimIcon name="close" size={13} />
            </button>
          </header>
          <p>{notes || 'No notes for this page.'}</p>
        </aside>
      )}

      {helpPanel}

      {black && (
        <div
          className="present-black"
          onClick={e => { e.stopPropagation(); setBlack(false); nudge(); }}
          title="Press B to return"
        />
      )}
    </div>
  );
}
