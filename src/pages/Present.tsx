import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EditrimIcon } from '../components/EditrimIcon';
import { PagePreview } from '../components/PagePreview';
import { getDesign } from '../lib/storage';
import type { Design } from '../lib/types';
import '../styles/present.css';

export default function Present() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState<Design | null>(null);
  const [missing, setMissing] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [controls, setControls] = useState(true);
  const [auto, setAuto] = useState(false);
  const hideTimer = useRef<number | null>(null);

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

  const pages = design?.pages.length ?? 0;
  const next = useCallback(() => setPageIndex(i => Math.min(pages - 1, i + 1)), [pages]);
  const prev = useCallback(() => setPageIndex(i => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        next();
        setControls(true);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
        setControls(true);
      } else if (e.key === 'Escape') {
        navigate(`/editor/${id}`);
      } else if (e.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => null);
      } else if (e.key === 'Home') {
        setPageIndex(0);
      } else if (e.key === 'End') {
        setPageIndex(pages - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, navigate, id, pages]);

  useEffect(() => {
    if (!auto) return;
    const t = window.setInterval(() => {
      setPageIndex(i => (i + 1 < pages ? i + 1 : 0));
    }, 5000);
    return () => window.clearInterval(t);
  }, [auto, pages]);

  const nudgeControls = () => {
    setControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControls(false), 3000);
  };

  useEffect(() => {
    nudgeControls();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

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

  const ratio = design.size.width / design.size.height;
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
    <div className={`present ${controls ? 'show-controls' : ''}`} onMouseMove={nudgeControls} onClick={nudgeControls}>
      <div className="present-stage" style={{ paddingBottom: 54 }}>
        <div className="present-page" style={{ width: w, height: h }}>
          <PagePreview page={design.pages[pageIndex]} size={design.size} />
        </div>
      </div>

      <button className="present-exit" onClick={() => navigate(`/editor/${id}`)} title="Exit presentation (Esc)">
        <EditrimIcon name="close" size={16} /> Exit
      </button>

      <div className="present-progress">
        {design.pages.map((p, i) => (
          <button
            key={p.id}
            className={i === pageIndex ? 'active' : ''}
            onClick={e => { e.stopPropagation(); setPageIndex(i); }}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>

      <div className="present-nav">
        <button
          className="present-arrow present-arrow-left"
          onClick={e => { e.stopPropagation(); prev(); }}
          disabled={pageIndex === 0}
          aria-label="Previous page"
        >
          <EditrimIcon name="chevronLeft" size={22} />
        </button>
        <button
          className="present-arrow present-arrow-right"
          onClick={e => { e.stopPropagation(); next(); }}
          disabled={pageIndex === pages - 1}
          aria-label="Next page"
        >
          <EditrimIcon name="chevronRight" size={22} />
        </button>
      </div>

      <div className="present-bar" onClick={e => e.stopPropagation()}>
        <button onClick={() => setAuto(a => !a)} title={auto ? 'Pause autoplay' : 'Autoplay'} className="present-tool">
          {auto ? <EditrimIcon name="pause" size={15} /> : <EditrimIcon name="play" size={15} />}
        </button>
        <span className="present-count">{pageIndex + 1} / {pages}</span>
        <span className="present-title">{design.title}</span>
        <div className="present-tools">
          <button
            className="present-tool"
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              else document.documentElement.requestFullscreen().catch(() => null);
            }}
            title="Fullscreen (F)"
          >
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
          <span><kbd>F</kbd> fullscreen</span>
          <span><kbd>Esc</kbd> edit</span>
        </div>
      )}
    </div>
  );
}
