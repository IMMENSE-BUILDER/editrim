import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Loader2 } from 'lucide-react';
import { EditrimIcon } from './EditrimIcon';
import type { TextElement } from '../lib/types';
import {
  INLINE_LANGUAGES,
  INLINE_TONES,
  formatCharDelta,
  requestInlineTranslate,
  requestInlineWrite,
  truncateMessage,
  type InlineLanguage,
  type InlineRunRequest,
  type InlineWriteMode,
} from '../lib/inlineAi';
import '../styles/inline-ai.css';

const WRITE_ACTIONS: { mode: InlineWriteMode; label: string }[] = [
  { mode: 'rewrite', label: 'Rewrite' },
  { mode: 'shorten', label: 'Shorten' },
  { mode: 'expand', label: 'Expand' },
];

/** Floating, selection-anchored AI text actions with an explicit apply step. */
export function InlineAiBar({
  text,
  brandVoice,
  onApply,
}: {
  text: TextElement;
  brandVoice: string;
  onApply: (next: string, mode: 'replace' | 'insert') => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const runTicket = useRef(0);
  const busyRef = useRef(false);
  const [pos, setPos] = useState<{ left: number; top: number; drop: number; flip: boolean; below: boolean } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState<'tone' | 'translate' | null>(null);
  const [tone, setTone] = useState('');
  const [language, setLanguage] = useState<InlineLanguage | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<InlineRunRequest | null>(null);
  const [hiddenId, setHiddenId] = useState<string | null>(null);

  const source = text.text;

  const updatePosition = useCallback(() => {
    const bar = barRef.current;
    const width = Math.min(bar?.offsetWidth ?? 380, window.innerWidth - 24);
    const height = bar?.offsetHeight ?? 44;
    const half = Math.max(width, 1) / 2;
    const minLeft = 12 + half;
    const maxLeft = window.innerWidth - 12 - half;
    const clampLeft = (center: number) => (
      maxLeft >= minLeft ? Math.min(Math.max(center, minLeft), maxLeft) : window.innerWidth / 2
    );

    const selection = document.querySelector<HTMLElement>('.cv-sel');
    if (selection) {
      const rect = selection.getBoundingClientRect();
      if (!expanded) {
        // Compact trigger sits just above the selection, clear of the rotate handle.
        setPos(prev => {
          const below = rect.top - 46 < 12 + height;
          const left = clampLeft(rect.left + rect.width / 2);
          const top = below ? rect.bottom + 12 : rect.top - 46;
          const flip = below || rect.top < 260;
          if (prev && Math.abs(prev.left - left) < 0.5 && Math.abs(prev.top - top) < 0.5 && prev.drop === 8 && prev.flip === flip && prev.below === below) {
            return prev;
          }
          return { left, top, drop: 8, flip, below };
        });
        return;
      }

      // Expanded actions dock above the page strip so they never cover the artboard.
      const area = document.querySelector<HTMLElement>('.ed-canvas-area');
      const strip = document.querySelector<HTMLElement>('.page-strip');
      if (!area) {
        setPos(null);
        return;
      }
      const areaRect = area.getBoundingClientRect();
      const stripTop = strip?.getBoundingClientRect().top ?? areaRect.bottom;
      setPos(prev => {
        const left = clampLeft(areaRect.left + areaRect.width / 2);
        const top = Math.max(12 + height, stripTop - 12);
        if (prev && Math.abs(prev.left - left) < 0.5 && Math.abs(prev.top - top) < 0.5 && prev.drop === 8 && !prev.flip && !prev.below) {
          return prev;
        }
        return { left, top, drop: 8, flip: false, below: false };
      });
      return;
    }

    const area = document.querySelector<HTMLElement>('.ed-canvas-area');
    if (!area) {
      setPos(null);
      return;
    }
    const rect = area.getBoundingClientRect();
    setPos(prev => {
      const left = clampLeft(rect.left + rect.width / 2);
      const top = Math.max(Math.min(rect.bottom - 12, window.innerHeight - 12), 12 + height);
      if (prev && Math.abs(prev.left - left) < 0.5 && Math.abs(prev.top - top) < 0.5 && prev.drop === 8 && !prev.flip && !prev.below) return prev;
      return { left, top, drop: 8, flip: false, below: false };
    });
  }, [expanded]);

  useEffect(() => {
    updatePosition();
    const onChange = () => updatePosition();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    const interval = window.setInterval(onChange, 400);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
      window.clearInterval(interval);
    };
  }, [updatePosition]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition, text.id, source, busy, result, error, menu]);

  useEffect(() => {
    runTicket.current += 1;
    busyRef.current = false;
    setHiddenId(null);
    setExpanded(false);
    setMenu(null);
    setBusy(null);
    setResult(null);
    setError(null);
    setLastRun(null);
  }, [text.id]);

  useEffect(() => () => {
    runTicket.current += 1;
    busyRef.current = false;
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onPointerDown = (event: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menu]);

  useEffect(() => {
    if (!menu && !result && !error) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('.cmd-panel, .modal')) return;
      event.preventDefault();
      event.stopPropagation();
      if (menu) setMenu(null);
      else {
        setResult(null);
        setError(null);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [menu, result, error]);

  const run = async (request: InlineRunRequest) => {
    if (busyRef.current || !source.trim()) return;
    const ticket = ++runTicket.current;
    busyRef.current = true;
    setBusy(request.kind === 'translate' ? 'translate' : request.mode);
    setLastRun(request);
    setMenu(null);
    setResult(null);
    setError(null);
    try {
      const next = request.kind === 'translate'
        ? await requestInlineTranslate(source, request.language)
        : await requestInlineWrite(request.mode, source, request.tone, brandVoice);
      if (runTicket.current !== ticket) return;
      setResult(next);
    } catch (err) {
      if (runTicket.current !== ticket) return;
      const message = err instanceof Error ? err.message : 'The AI request failed. Try again.';
      setError(truncateMessage(message, 140));
    } finally {
      if (runTicket.current === ticket) {
        busyRef.current = false;
        setBusy(null);
      }
    }
  };

  const applyResult = (mode: 'replace' | 'insert') => {
    if (!result) return;
    const next = result;
    setResult(null);
    setError(null);
    onApply(next, mode);
  };

  if (hiddenId === text.id || !source.trim()) return null;

  const style = {
    left: pos?.left ?? 0,
    top: pos?.top ?? 0,
    visibility: pos ? 'visible' : 'hidden',
    '--iai-drop': `${pos?.drop ?? 8}px`,
  } as CSSProperties;
  const flipClass = pos?.flip ? 'is-below' : '';

  if (!expanded) {
    return (
      <div
        ref={barRef}
        className={`iai-bar ${pos?.below ? 'is-below' : ''}`}
        style={style}
      >
        <button
          className="iai-trigger"
          onClick={() => setExpanded(true)}
          aria-label="Open inline AI actions"
          title="AI text actions"
        >
          <EditrimIcon name="spark" size={13} /> AI
        </button>
      </div>
    );
  }

  return (
    <div
      ref={barRef}
      className={`iai-bar ${pos?.below ? 'is-below' : ''}`}
      style={style}
    >
      <div className="iai-pill" role="toolbar" aria-label="Inline AI text actions" aria-busy={Boolean(busy)}>
        <span className="iai-brand"><EditrimIcon name="spark" size={12} /> AI</span>
        <span className="iai-divider" aria-hidden="true" />

        {WRITE_ACTIONS.map(action => {
          const loading = busy === action.mode;
          return (
            <button
              key={action.mode}
              className={`iai-action ${loading ? 'is-loading' : ''}`}
              onClick={() => void run({ kind: 'write', mode: action.mode, tone })}
              disabled={Boolean(busy)}
              aria-label={action.label}
            >
              {loading && <Loader2 className="spin" size={14} />}
              {action.label}
            </button>
          );
        })}

        <span className="iai-divider" aria-hidden="true" />

        <div className="iai-menu-wrap">
          <button
            className={`iai-action ${menu === 'tone' ? 'is-open' : ''}`}
            onClick={() => setMenu(menu === 'tone' ? null : 'tone')}
            disabled={Boolean(busy)}
            aria-haspopup="menu"
            aria-expanded={menu === 'tone'}
          >
            Tone <EditrimIcon name="chevronDown" size={11} />
          </button>
          {menu === 'tone' && (
            <div className="iai-menu" role="menu" aria-label="Tone">
              {INLINE_TONES.map(option => (
                <button
                  key={option}
                  className={tone === option ? 'is-selected' : ''}
                  role="menuitemradio"
                  aria-checked={tone === option}
                  onClick={() => { setTone(option); void run({ kind: 'write', mode: 'rewrite', tone: option }); }}
                >
                  <span>{option}</span>
                  {tone === option && <EditrimIcon name="check" size={11} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="iai-menu-wrap">
          <button
            className={`iai-action ${menu === 'translate' ? 'is-open' : ''} ${busy === 'translate' ? 'is-loading' : ''}`}
            onClick={() => setMenu(menu === 'translate' ? null : 'translate')}
            disabled={Boolean(busy)}
            aria-haspopup="menu"
            aria-expanded={menu === 'translate'}
          >
            {busy === 'translate'
              ? <Loader2 className="spin" size={14} />
              : <EditrimIcon name="language" size={12} />}
            Translate <EditrimIcon name="chevronDown" size={11} />
          </button>
          {menu === 'translate' && (
            <div className="iai-menu" role="menu" aria-label="Translate">
              {INLINE_LANGUAGES.map(option => (
                <button
                  key={option}
                  className={language === option ? 'is-selected' : ''}
                  role="menuitemradio"
                  aria-checked={language === option}
                  onClick={() => { setLanguage(option); setMenu(null); void run({ kind: 'translate', language: option }); }}
                >
                  <span>{option}</span>
                  {language === option && <EditrimIcon name="check" size={11} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="iai-divider" aria-hidden="true" />
        <button
          className="iai-close"
          onClick={() => { setExpanded(false); setResult(null); setError(null); setMenu(null); }}
          aria-label="Close inline AI actions"
        >
          <EditrimIcon name="close" size={13} />
        </button>
      </div>

      {result && (
        <div className={`iai-result ${flipClass}`.trim()} role="dialog" aria-label="AI suggestion" aria-live="polite">
          <div className="iai-result-head">
            <span className="iai-result-label"><EditrimIcon name="spark" size={11} /> AI suggestion</span>
            <span className="iai-result-delta">{formatCharDelta(source, result)}</span>
          </div>
          <div className="iai-result-text" tabIndex={0}>{result}</div>
          <div className="iai-result-actions">
            <button className="iai-btn is-primary" onClick={() => applyResult('replace')}>
              <EditrimIcon name="check" size={11} /> Replace
            </button>
            <button className="iai-btn" onClick={() => applyResult('insert')}>
              <EditrimIcon name="arrowRight" size={11} /> Insert below
            </button>
            <button className="iai-btn is-ghost" onClick={() => lastRun && void run(lastRun)} disabled={!lastRun || Boolean(busy)}>
              <EditrimIcon name="refresh" size={11} /> Try again
            </button>
            <button className="iai-btn is-ghost" onClick={() => setResult(null)}>Close</button>
          </div>
        </div>
      )}

      {error && (
        <div className={`iai-error ${flipClass}`.trim()} role="alert">
          <span title={error}>{error}</span>
          <button
            className="iai-btn is-ghost"
            onClick={() => lastRun && void run(lastRun)}
            disabled={!lastRun || Boolean(busy)}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
