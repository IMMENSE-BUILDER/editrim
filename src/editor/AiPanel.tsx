import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { BrandKit, Page } from '../lib/types';
import type { EditorStore } from './useEditor';
import { useToast } from '../components/Toast';
import { PagePreview } from '../components/PagePreview';
import {
  AI_LANGUAGES, AI_MODEL_LABEL, AI_STYLES, AI_TONES, AiRequestError, callAi,
  checkAiHealth, summarizePage, summarizePageForEdit, type AiHealth,
} from '../lib/ai';
import { normalizeAiDesign, sanitizeAiSvg, svgToDataUrl } from '../lib/aiDesign';
import { applyEditPlan, normalizeEditPlan, summarizePlan, type EditPlan } from '../lib/aiCommands';
import { createImage, createText } from './factory';
import { renderPageCanvas, measureTextHeight } from '../lib/render';
import { EditrimIcon, type EditrimIconName } from '../components/EditrimIcon';

type Mode = 'design' | 'edit' | 'write' | 'critique';
type WriteMode = 'compose' | 'rewrite' | 'shorten' | 'expand';

type DesignResponse = { ok: true; spec: unknown; requestId: string; elapsedMs: number };
type CopyResponse = { ok: true; text: string; requestId: string; elapsedMs: number };
type SvgResponse = { ok: true; svg: string; requestId: string; elapsedMs: number };
type EditPlanResponse = { ok: true; plan: unknown; requestId: string; elapsedMs: number };
type CritiqueData = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: { title: string; detail: string; severity: 'low' | 'medium' | 'high' }[];
};
type CritiqueResponse = { ok: true; critique: CritiqueData; requestId: string; elapsedMs: number };

const STAGE_LABEL: Record<string, string> = {
  config: 'Server configuration',
  gateway: 'Vercel AI Gateway',
  model: 'Model response',
  parse: 'Response parsing',
  network: 'Network',
  timeout: 'Timeout',
  validation: 'Input validation',
  request: 'Request',
  rate_limit: 'Rate limit',
  internal: 'Server',
  unknown: 'Unknown',
};

async function renderPageSnapshot(store: EditorStore): Promise<string | undefined> {
  try {
    const maxDim = Math.max(store.design.size.width, store.design.size.height);
    const scale = Math.min(1, 1280 / maxDim);
    const canvas = await renderPageCanvas(store.page, store.design.size, { scale, transparent: false });
    const data = canvas.toDataURL('image/jpeg', 0.82);
    return data.length < 3_500_000 ? data : undefined;
  } catch {
    return undefined;
  }
}

function errorHint(err: AiRequestError): string | null {
  if (err.code === 'MISSING_API_KEY') {
    return 'Add AI_GATEWAY_API_KEY in Vercel → Project → Settings → Environment Variables and redeploy. For local dev, add it to .env.local and restart Vite.';
  }
  if (err.code === 'ENDPOINT_UNREACHABLE') {
    return 'The browser could not reach /api/ai. Make sure the Vercel function is deployed, or restart the local dev server.';
  }
  if (err.code === 'GATEWAY_401' || err.code === 'GATEWAY_403') {
    return 'Vercel AI Gateway rejected the key. Check AI_GATEWAY_API_KEY and that the key has gateway access.';
  }
  if (err.code === 'GATEWAY_402' || err.code === 'GATEWAY_429' || err.stage === 'rate_limit') {
    return 'The AI Gateway account is rate-limited or out of budget. Wait a moment or check the AI Gateway dashboard.';
  }
  if (err.stage === 'gateway' && (err.code.startsWith('GATEWAY_5') || !err.code.startsWith('GATEWAY_4'))) {
    return 'The gateway reached the model provider, but the provider failed before completing the response. Retry. If it persists, check the AI Gateway dashboard and the request ID.';
  }
  if (err.stage === 'parse' || err.stage === 'model') {
    return 'The model returned an answer Editrim could not use. Retrying usually fixes this; if not, try a simpler brief.';
  }
  if (err.stage === 'timeout') return 'Try a shorter prompt, or generate a design with fewer elements.';
  return null;
}

export function AiPanel({
  store,
  brand,
  focusRequest,
  onClose,
  onOpenBrand,
}: {
  store: EditorStore;
  brand: BrandKit;
  focusRequest?: { focus: 'write' | 'translate'; nonce: number } | null;
  onClose: () => void;
  onOpenBrand: () => void;
}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('design');
  const [health, setHealth] = useState<AiHealth | null | undefined>(undefined);

  const [designPrompt, setDesignPrompt] = useState('');
  const [style, setStyle] = useState('Editorial');
  const [designPage, setDesignPage] = useState<Page | null>(null);
  const [designMeta, setDesignMeta] = useState<{ name: string; elapsed: number; requestId: string } | null>(null);
  const [designBusy, setDesignBusy] = useState(false);
  const [designError, setDesignError] = useState<AiRequestError | null>(null);

  const [illustrationOpen, setIllustrationOpen] = useState(false);
  const [illustrationPrompt, setIllustrationPrompt] = useState('');
  const [illustrationSvg, setIllustrationSvg] = useState<string | null>(null);
  const [illustrationBusy, setIllustrationBusy] = useState(false);
  const [illustrationError, setIllustrationError] = useState<AiRequestError | null>(null);

  const [editInstruction, setEditInstruction] = useState('');
  const [editPlan, setEditPlan] = useState<EditPlan | null>(null);
  const [editPreview, setEditPreview] = useState<Page | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<AiRequestError | null>(null);

  const [writeMode, setWriteMode] = useState<WriteMode>('compose');
  const [writePrompt, setWritePrompt] = useState('');
  const [tone, setTone] = useState(AI_TONES[0]);
  const [useBrandVoice, setUseBrandVoice] = useState(false);
  const [copy, setCopy] = useState<string | null>(null);
  const [copyBusy, setCopyBusy] = useState(false);
  const [copyError, setCopyError] = useState<AiRequestError | null>(null);
  const [copyAction, setCopyAction] = useState<'write' | 'translate'>('write');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');

  const [critique, setCritique] = useState<CritiqueData | null>(null);
  const [critiqueBusy, setCritiqueBusy] = useState(false);
  const [critiqueError, setCritiqueError] = useState<AiRequestError | null>(null);
  const designResultRef = useRef<HTMLDivElement>(null);
  const copyResultRef = useRef<HTMLDivElement>(null);
  const critiqueResultRef = useRef<HTMLDivElement>(null);
  const editResultRef = useRef<HTMLDivElement>(null);
  const writePromptRef = useRef<HTMLTextAreaElement>(null);
  const translateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!designPage) return;
    const t = window.setTimeout(() => designResultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 80);
    return () => window.clearTimeout(t);
  }, [designPage]);

  useEffect(() => {
    if (!copy) return;
    const t = window.setTimeout(() => copyResultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 80);
    return () => window.clearTimeout(t);
  }, [copy]);

  useEffect(() => {
    if (!critique) return;
    const t = window.setTimeout(() => critiqueResultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 80);
    return () => window.clearTimeout(t);
  }, [critique]);

  useEffect(() => {
    if (!editPlan) return;
    const t = window.setTimeout(() => editResultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 80);
    return () => window.clearTimeout(t);
  }, [editPlan]);

  useEffect(() => {
    setEditPlan(null);
    setEditPreview(null);
  }, [store.page.id]);

  const selectedText = useMemo(() => {
    const el = store.selected.find(e => e.type === 'text');
    return el && el.type === 'text' ? el : null;
  }, [store.selected]);

  useEffect(() => {
    if (!focusRequest) return;
    setMode('write');
    const t = window.setTimeout(() => {
      if (focusRequest.focus === 'translate') {
        translateRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } else {
        if (selectedText) setWriteMode('rewrite');
        writePromptRef.current?.focus();
        writePromptRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 120);
    return () => window.clearTimeout(t);
    // The nonce is the explicit trigger; selectedText is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest?.nonce]);

  useEffect(() => {
    let alive = true;
    checkAiHealth().then(h => { if (alive) setHealth(h); });
    return () => { alive = false; };
  }, []);

  const healthReady = health?.configured === true;
  const healthBroken = health === null || health?.configured === false;

  const generateDesign = async () => {
    if (designBusy) return;
    if (!designPrompt.trim()) {
      toast('Describe the design first', 'error');
      return;
    }
    setDesignError(null);
    setDesignBusy(true);
    setDesignPage(null);
    setDesignMeta(null);
    try {
      const res = await callAi<DesignResponse>('design', {
        prompt: designPrompt.trim(),
        width: store.design.size.width,
        height: store.design.size.height,
        style,
        brandColors: brand.colors,
        brandFonts: brand.fonts,
      });
      let page: Page;
      try {
        page = normalizeAiDesign(res.spec, store.design.size, brand);
      } catch (err) {
        throw new AiRequestError({
          message: err instanceof Error ? err.message : 'The AI layout could not be used.',
          stage: 'validation',
          code: 'INVALID_LAYOUT',
          requestId: res.requestId,
          action: 'design',
        });
      }
      setDesignPage(page);
      setDesignMeta({ name: page.name, elapsed: res.elapsedMs, requestId: res.requestId });
    } catch (err) {
      const e = err instanceof AiRequestError ? err : new AiRequestError({
        message: err instanceof Error ? err.message : 'Design generation failed.',
        stage: 'unknown', code: 'DESIGN_FAILED',
      });
      setDesignError(e);
    } finally {
      setDesignBusy(false);
    }
  };

  const generateIllustration = async () => {
    if (illustrationBusy) return;
    if (!illustrationPrompt.trim()) {
      toast('Describe the illustration first', 'error');
      return;
    }
    setIllustrationError(null);
    setIllustrationBusy(true);
    setIllustrationSvg(null);
    try {
      const res = await callAi<SvgResponse>('illustration', {
        prompt: illustrationPrompt.trim(),
        palette: brand.colors.join(', '),
      });
      let svg: string;
      try {
        svg = sanitizeAiSvg(res.svg);
      } catch (err) {
        throw new AiRequestError({
          message: err instanceof Error ? err.message : 'The illustration was not safe to use.',
          stage: 'parse',
          code: 'INVALID_SVG',
          requestId: res.requestId,
          action: 'illustration',
        });
      }
      setIllustrationSvg(svg);
    } catch (err) {
      const e = err instanceof AiRequestError ? err : new AiRequestError({
        message: err instanceof Error ? err.message : 'Illustration generation failed.',
        stage: 'unknown', code: 'ILLUSTRATION_FAILED',
      });
      setIllustrationError(e);
    } finally {
      setIllustrationBusy(false);
    }
  };

  const generateCopy = async (action: 'write' | 'translate' = 'write') => {
    if (copyBusy) return;
    setCopyError(null);
    setCopyAction(action);
    setCopyBusy(true);
    setCopy(null);
    try {
      if (action === 'translate') {
        if (!selectedText) {
          throw new AiRequestError({
            message: 'Select a text layer on the canvas first, then translate it.',
            stage: 'validation', code: 'NO_SELECTED_TEXT',
          });
        }
        const res = await callAi<CopyResponse>('translate', {
          text: selectedText.text,
          language: targetLanguage,
        });
        setCopy(res.text);
      } else {
        if (!writePrompt.trim() && !selectedText) {
          throw new AiRequestError({
            message: 'Describe what to write, or select a text layer to rewrite.',
            stage: 'validation', code: 'EMPTY_BRIEF',
          });
        }
        if (writeMode !== 'compose' && !selectedText) {
          throw new AiRequestError({
            message: 'Select a text layer to rewrite, shorten or expand.',
            stage: 'validation', code: 'NO_SELECTED_TEXT',
          });
        }
        const res = await callAi<CopyResponse>('write', {
          mode: writeMode,
          prompt: writePrompt.trim(),
          text: selectedText?.text ?? '',
          tone,
          brandName: brand.name,
          brandVoice: useBrandVoice ? brand.voice : '',
        });
        setCopy(res.text);
      }
    } catch (err) {
      const e = err instanceof AiRequestError ? err : new AiRequestError({
        message: err instanceof Error ? err.message : 'Copy generation failed.',
        stage: 'unknown', code: 'WRITE_FAILED', action,
      });
      setCopyError(e);
    } finally {
      setCopyBusy(false);
    }
  };

  const addDesignPage = () => {
    if (!designPage) return;
    store.insertPage(designPage);
    toast('AI draft added as a new page');
    setDesignPage(null);
    setDesignMeta(null);
  };

  const insertIllustration = (asBackground = false) => {
    if (!illustrationSvg) return;
    const dataUrl = svgToDataUrl(illustrationSvg);
    if (asBackground) {
      store.setBackground({ kind: 'image', src: dataUrl, overlay: '#000000', overlayOpacity: 0 });
      toast('AI illustration set as the page background');
    } else {
      const img = createImage(dataUrl, store.page, store.design.size, 4 / 3);
      img.name = 'AI illustration';
      img.fit = 'cover';
      img.radius = 10;
      store.addElements([img]);
      toast('AI illustration added to the page');
    }
  };

  const replaceOrAddCopy = (replace: boolean) => {
    if (!copy) return;
    const text = copy.trim();
    if (replace && selectedText) {
      const h = measureTextHeight({ ...selectedText, text });
      store.patchElement(selectedText.id, { text, h: Math.max(24, h) });
      toast('Text replaced');
    } else {
      const el = createText('body', store.page, store.design.size, brand);
      el.text = text;
      el.w = Math.min(store.design.size.width * 0.6, 720);
      el.x = (store.design.size.width - el.w) / 2;
      el.y = store.design.size.height * 0.42;
      el.h = Math.max(40, measureTextHeight(el));
      store.addElements([el]);
      toast('Copy added to the page');
    }
  };

  const generateCritique = async () => {
    if (critiqueBusy) return;
    if (!store.page.elements.length) {
      toast('Add something to the page first', 'error');
      return;
    }
    setCritiqueError(null);
    setCritiqueBusy(true);
    setCritique(null);
    try {
      const res = await callAi<CritiqueResponse>('critique', {
        summary: summarizePage(store.design, store.page),
        image: await renderPageSnapshot(store),
      });
      setCritique(res.critique);
    } catch (err) {
      const e = err instanceof AiRequestError ? err : new AiRequestError({
        message: err instanceof Error ? err.message : 'Design review failed.',
        stage: 'unknown', code: 'CRITIQUE_FAILED',
      });
      setCritiqueError(e);
    } finally {
      setCritiqueBusy(false);
    }
  };

  const generateEditPlan = async () => {
    if (editBusy) return;
    if (!editInstruction.trim()) {
      toast('Describe the change you want', 'error');
      return;
    }
    if (!store.page.elements.length) {
      toast('Add something to the page first', 'error');
      return;
    }
    setEditError(null);
    setEditBusy(true);
    setEditPlan(null);
    setEditPreview(null);
    try {
      const res = await callAi<EditPlanResponse>('edit', {
        instruction: editInstruction.trim(),
        summary: summarizePageForEdit(store.design, store.page),
        width: store.design.size.width,
        height: store.design.size.height,
        brandColors: brand.colors,
        brandFonts: brand.fonts,
      });
      let plan: EditPlan;
      try {
        plan = normalizeEditPlan(res.plan, store.page, store.design.size, brand);
      } catch (err) {
        throw new AiRequestError({
          message: err instanceof Error ? err.message : 'The proposed edits could not be validated.',
          stage: 'validation',
          code: 'INVALID_COMMANDS',
          requestId: res.requestId,
          action: 'edit',
        });
      }
      setEditPlan(plan);
      setEditPreview(applyEditPlan(store.page, plan));
    } catch (err) {
      const e = err instanceof AiRequestError ? err : new AiRequestError({
        message: err instanceof Error ? err.message : 'The edit could not be planned.',
        stage: 'unknown', code: 'EDIT_FAILED', action: 'edit',
      });
      setEditError(e);
    } finally {
      setEditBusy(false);
    }
  };

  const applyCurrentEditPlan = () => {
    if (!editPlan) return;
    const plan = editPlan;
    store.updatePage(page => applyEditPlan(page, plan));
    toast(`${summarizePlan(plan)} applied — undo with ⌘Z`);
    setEditPlan(null);
    setEditPreview(null);
    setEditInstruction('');
  };

  const modeTabs: { id: Mode; label: string; icon: EditrimIconName }[] = [
    { id: 'design', label: 'Design', icon: 'spark' },
    { id: 'edit', label: 'Edit', icon: 'magic' },
    { id: 'write', label: 'Write', icon: 'pencil' },
    { id: 'critique', label: 'Review', icon: 'scan' },
  ];

  return (
    <div className="lp ai-panel">
      <div className="lp-head ai-head">
        <h3><EditrimIcon name="spark" size={15} /> AI Studio</h3>
        <span className="ai-beta">Beta</span>
        <button className="lp-close" onClick={onClose} aria-label="Close AI panel"><EditrimIcon name="close" size={16} /></button>
      </div>

      <div className={`ai-health ${healthBroken ? 'is-bad' : healthReady ? 'is-good' : ''}`}>
        <span className="ai-health-dot" />
        <div>
          <strong>
            {health === undefined ? 'Checking AI…' : healthReady ? 'AI ready' : health === null ? 'AI endpoint unreachable' : 'AI key missing'}
          </strong>
          {!healthReady && (
            <span>{health?.message ?? 'Testing /api/ai…'}</span>
          )}
        </div>
        {healthBroken && (
          <button
            onClick={() => { setHealth(undefined); checkAiHealth().then(setHealth); }}
            title="Recheck AI health"
          >
            <EditrimIcon name="refresh" size={12} />
          </button>
        )}
      </div>

      {health === null && (
        <div className="ai-config-note">
          <EditrimIcon name="info" size={14} />
          <span>If you are running locally, make sure the dev server was restarted after adding <code>AI_GATEWAY_API_KEY</code>. On Vercel, check the function deployment.</span>
        </div>
      )}

      <div className="ai-tabs" role="tablist" aria-label="AI Studio mode">
        {modeTabs.map(t => {
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={mode === t.id}
              className={mode === t.id ? 'active' : ''}
              onClick={() => setMode(t.id)}
            >
              <EditrimIcon name={t.icon} size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="lp-scroll ai-scroll">
        {mode === 'design' && (
          <>
            <div className="ai-lede">
              <span className="ai-eyebrow"><EditrimIcon name="magic" size={12} /> AI DESIGN</span>
              <h4>Describe it. Get a real first draft.</h4>
              <p>A complete, editable page — type, shapes and a photo — built for this canvas.</p>
            </div>

            <label className="field-label" htmlFor="ai-design-prompt">The brief</label>
            <textarea
              id="ai-design-prompt"
              className="ai-textarea"
              rows={4}
              value={designPrompt}
              onChange={e => setDesignPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateDesign(); }}
              placeholder="A launch poster for a slow coffee brand, warm and editorial, with a coffee photo…"
            />
            <div className="ai-suggestions">
              {[
                'Slow coffee launch, warm editorial',
                'Warehouse techno night, bold type',
                'Minimal climate startup pitch slide',
                'Playful birthday invitation, confetti',
              ].map(s => (
                <button key={s} onClick={() => setDesignPrompt(s)}>{s}</button>
              ))}
            </div>

            <div className="ai-field-row">
              <span className="field-label">Direction</span>
              <div className="ai-chip-row">
                {AI_STYLES.map(s => (
                  <button key={s} className={style === s ? 'active' : ''} onClick={() => setStyle(s)}>{s}</button>
                ))}
              </div>
            </div>

            <button className="btn btn-cobalt ai-run" onClick={generateDesign} disabled={designBusy || !designPrompt.trim()}>
              {designBusy ? <Loader2 size={15} className="spin" /> : <EditrimIcon name="spark" size={15} />}
              {designBusy ? 'Designing…' : designPage ? 'Regenerate draft' : 'Generate design'}
            </button>

              {designBusy && (
              <div className="ai-loading">
                <span className="ai-orbit"><EditrimIcon name="spark" size={15} /></span>
                <div>
                  <strong>Art-directing your page…</strong>
                  <span>Building an editable page for this canvas.</span>
                </div>
              </div>
            )}

            {designError && (
              <AiErrorCard error={designError} onRetry={generateDesign} />
            )}

            {designPage && !designBusy && (
              <div className="ai-result-card" ref={designResultRef}>
                <div className="ai-result-head">
                  <div>
                    <strong>{designPage.name || 'AI draft'}</strong>
                    <span>{designPage.elements.length} elements · {((designMeta?.elapsed ?? 0) / 1000).toFixed(1)}s</span>
                  </div>
                  <span className="ai-draft-badge">AI draft</span>
                </div>
                <div className="ai-design-preview">
                  <PagePreview page={designPage} size={store.design.size} />
                </div>
                <div className="ai-result-actions">
                  <button className="btn btn-cobalt btn-sm" onClick={addDesignPage}>Add as new page <EditrimIcon name="arrowRight" size={13} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={generateDesign} disabled={designBusy}><EditrimIcon name="refresh" size={13} /> Again</button>
                </div>
                <p className="ai-fineprint">Nothing has changed yet. Review the draft, then add it as a page. Every element stays editable.</p>
              </div>
            )}

            <div className="ai-divider" />

            <button className="ai-subsection-toggle" onClick={() => setIllustrationOpen(v => !v)} aria-expanded={illustrationOpen}>
              <span><EditrimIcon name="image" size={14} /> AI illustration</span>
              <span>{illustrationOpen ? '−' : '+'}</span>
            </button>
            {illustrationOpen && (
              <div className="ai-subsection">
                <p>Flat vector artwork for posters, backgrounds or accents. Generated as safe SVG.</p>
                <textarea
                  className="ai-textarea"
                  rows={3}
                  value={illustrationPrompt}
                  onChange={e => setIllustrationPrompt(e.target.value)}
                  placeholder="Three coffee cups and a sun, geometric, warm cream, coral and cobalt…"
                />
                <button className="btn btn-secondary btn-sm ai-run-secondary" onClick={generateIllustration} disabled={illustrationBusy || !illustrationPrompt.trim()}>
                  {illustrationBusy ? <Loader2 size={14} className="spin" /> : <EditrimIcon name="magic" size={14} />}
                  {illustrationBusy ? 'Drawing…' : 'Generate illustration'}
                </button>
                {illustrationError && <AiErrorCard error={illustrationError} onRetry={generateIllustration} />}
                {illustrationSvg && (
                  <div className="ai-illustration-result">
                    <img src={svgToDataUrl(illustrationSvg)} alt="AI-generated vector illustration" />
                    <div className="ai-result-actions">
                      <button className="btn btn-cobalt btn-sm" onClick={() => insertIllustration(false)}>Insert</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => insertIllustration(true)}>Use as background</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {mode === 'edit' && (
          <>
            <div className="ai-lede">
              <span className="ai-eyebrow"><EditrimIcon name="magic" size={12} /> AI EDIT</span>
              <h4>Ask for a change. See it first.</h4>
              <p>Editrim turns your instruction into explicit canvas commands. Nothing is applied until you approve the preview.</p>
            </div>

            <label className="field-label" htmlFor="ai-edit-prompt">What should change?</label>
            <textarea
              id="ai-edit-prompt"
              className="ai-textarea"
              rows={3}
              value={editInstruction}
              onChange={e => setEditInstruction(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateEditPlan(); }}
              placeholder="Make the headline cobalt, move the photo up-right, and add a short line under the CTA…"
            />
            <div className="ai-suggestions">
              {[
                'Make the headline cobalt',
                'Add a short line under the CTA',
                'Make the layout more minimal',
                'Move the photo to the left',
                'Change the background to warm cream',
              ].map(s => (
                <button key={s} onClick={() => setEditInstruction(s)}>{s}</button>
              ))}
            </div>

            <button className="btn btn-cobalt ai-run" onClick={generateEditPlan} disabled={editBusy || !editInstruction.trim() || !store.page.elements.length}>
              {editBusy ? <Loader2 size={15} className="spin" /> : <EditrimIcon name="magic" size={15} />}
              {editBusy ? 'Planning changes…' : editPlan ? 'Plan another change' : 'Plan this edit'}
            </button>

            {!store.page.elements.length && (
              <p className="ai-inline-note">This page is empty. Add elements or use AI Design first.</p>
            )}

            {editBusy && (
              <div className="ai-loading">
                <span className="ai-orbit"><EditrimIcon name="magic" size={15} /></span>
                <div>
                  <strong>Reading the scene, planning the edit…</strong>
                  <span>Commands are validated before they apply.</span>
                </div>
              </div>
            )}

            {editError && <AiErrorCard error={editError} onRetry={generateEditPlan} />}

            {editPlan && editPreview && !editBusy && (
              <div className="ai-result-card" ref={editResultRef}>
                <div className="ai-result-head">
                  <div>
                    <strong>{summarizePlan(editPlan)} proposed</strong>
                    <span>Preview only · one undo step when applied</span>
                  </div>
                  <span className="ai-draft-badge">Proposed</span>
                </div>
                <p className="ai-plan-summary">{editPlan.summary}</p>
                <div className="ai-design-preview">
                  <PagePreview page={editPreview} size={store.design.size} />
                </div>
                <ul className="ai-command-list">
                  {editPlan.commands.map((command, i) => (
                    <li key={i}>
                      <span className="ai-command-op">{command.op === 'add' ? 'add' : command.op}</span>
                      <span>{command.label}</span>
                    </li>
                  ))}
                </ul>
                {editPlan.warnings.length > 0 && (
                  <div className="ai-warnings">
                    {editPlan.warnings.map((w, i) => <p key={i}>{w}</p>)}
                  </div>
                )}
                <div className="ai-result-actions">
                  <button className="btn btn-cobalt btn-sm" onClick={applyCurrentEditPlan}>Apply changes <EditrimIcon name="arrowRight" size={13} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditPlan(null); setEditPreview(null); }}>Discard</button>
                </div>
                <p className="ai-fineprint">Only validated changes reach the canvas. Locked elements are skipped automatically.</p>
              </div>
            )}
          </>
        )}

        {mode === 'write' && (
          <>
            <div className="ai-lede">
              <span className="ai-eyebrow"><EditrimIcon name="pencil" size={12} /> AI WRITE</span>
              <h4>{selectedText ? 'Work with the text you selected.' : 'A first line, without the blank page.'}</h4>
              <p>{selectedText ? 'Rewrite, shorten, expand or translate it — then choose what to keep.' : 'Generate copy, then add it as a new text layer.'}</p>
            </div>

            {selectedText && (
              <div className="ai-selection">
                <span>Selected text</span>
                <p>{selectedText.text.length > 160 ? `${selectedText.text.slice(0, 160)}…` : selectedText.text}</p>
              </div>
            )}

            <div className="ai-write-modes">
              {(['compose', 'rewrite', 'shorten', 'expand'] as WriteMode[]).map(m => (
                <button
                  key={m}
                  className={writeMode === m ? 'active' : ''}
                  onClick={() => setWriteMode(m)}
                  disabled={!selectedText && m !== 'compose'}
                  title={!selectedText && m !== 'compose' ? 'Select a text layer first' : undefined}
                >
                  {m}
                </button>
              ))}
            </div>

            <label className="field-label" htmlFor="ai-write-prompt">{writeMode === 'compose' ? 'What should it say?' : 'Extra direction (optional)'}</label>
            <textarea
              id="ai-write-prompt"
              ref={writePromptRef}
              className="ai-textarea"
              rows={3}
              value={writePrompt}
              onChange={e => setWritePrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateCopy('write'); }}
              placeholder={writeMode === 'compose' ? 'A short launch line for a slow coffee brand…' : 'Make it warmer, keep it under 12 words…'}
            />

            <div className="ai-field-row">
              <span className="field-label">Tone</span>
              <select className="select ai-select" value={tone} onChange={e => setTone(e.target.value)}>
                {AI_TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="ai-voice-row">
              <label className={!brand.voice.trim() ? 'disabled' : ''}>
                <input
                  type="checkbox"
                  checked={useBrandVoice && Boolean(brand.voice.trim())}
                  onChange={e => setUseBrandVoice(e.target.checked)}
                  disabled={!brand.voice.trim()}
                />
                Match brand voice
              </label>
              {!brand.voice.trim() ? (
                <button onClick={onOpenBrand}>Add a voice sample</button>
              ) : (
                <span className="ai-voice-ok"><EditrimIcon name="check" size={11} /> {brand.name}</span>
              )}
            </div>

            <button className="btn btn-cobalt ai-run" onClick={() => generateCopy('write')} disabled={copyBusy || (writeMode !== 'compose' && !selectedText)}>
              {copyBusy && copyAction === 'write' ? <Loader2 size={15} className="spin" /> : <EditrimIcon name="spark" size={15} />}
              {copyBusy && copyAction === 'write' ? 'Writing…' : writeMode === 'compose' ? 'Write copy' : `${writeMode.charAt(0).toUpperCase()}${writeMode.slice(1)} selection`}
            </button>

            {copyError && copyAction === 'write' && <AiErrorCard error={copyError} onRetry={() => generateCopy('write')} />}

            {copy && !copyBusy && (
              <div className="ai-copy-result" ref={copyResultRef}>
                <div className="ai-result-head">
                  <strong>Copy</strong>
                  <button className="ai-icon-link" onClick={() => { navigator.clipboard?.writeText(copy); toast('Copied'); }} title="Copy text"><EditrimIcon name="copy" size={13} /></button>
                </div>
                <p>{copy}</p>
                <div className="ai-result-actions">
                  {selectedText && <button className="btn btn-cobalt btn-sm" onClick={() => replaceOrAddCopy(true)}>Replace selection</button>}
                  <button className={`btn ${selectedText ? 'btn-secondary' : 'btn-cobalt'} btn-sm`} onClick={() => replaceOrAddCopy(false)}>Add as text</button>
                </div>
              </div>
            )}

            <div className="ai-divider" />

            <div className="ai-translate" ref={translateRef}>
              <span className="ai-eyebrow">TRANSLATE</span>
              <p>Translate the selected text into another language.</p>
              <div className="ai-field-row">
                <select className="select ai-select" value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} aria-label="Target language">
                  {AI_LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={() => generateCopy('translate')} disabled={copyBusy || !selectedText}>
                  {copyBusy && copyAction === 'translate' ? <Loader2 size={14} className="spin" /> : <EditrimIcon name="spark" size={14} />}
                  Translate
                </button>
              </div>
              {!selectedText && <span className="ai-inline-note">Select a text layer on the canvas to translate.</span>}
            </div>

            {copyError && copyAction === 'translate' && <AiErrorCard error={copyError} onRetry={() => generateCopy('translate')} />}
          </>
        )}

        {mode === 'critique' && (
          <>
            <div className="ai-lede">
              <span className="ai-eyebrow"><EditrimIcon name="scan" size={12} /> AI REVIEW</span>
              <h4>A second pair of eyes.</h4>
              <p>An honest critique of hierarchy, spacing, contrast and legibility. Nothing is changed automatically.</p>
            </div>

            <div className="ai-review-target">
              <strong>{store.page.name}</strong>
              <span>{store.page.elements.length} elements · {store.design.size.width}×{store.design.size.height}</span>
            </div>
            <p className="ai-privacy-note">Visual review sends a temporary snapshot of this page to MiMo for inspection. Nothing is stored.</p>

            <button className="btn btn-cobalt ai-run" onClick={generateCritique} disabled={critiqueBusy || !store.page.elements.length}>
              {critiqueBusy ? <Loader2 size={15} className="spin" /> : <EditrimIcon name="scan" size={15} />}
              {critiqueBusy ? 'Reading the page…' : critique ? 'Review again' : 'Review this page'}
            </button>

            {critiqueError && <AiErrorCard error={critiqueError} onRetry={generateCritique} />}

            {critique && !critiqueBusy && (
              <div className="ai-critique" ref={critiqueResultRef}>
                <div className="ai-score-row">
                  <div className={`ai-score ${critique.score >= 75 ? 'good' : critique.score >= 50 ? 'okay' : 'low'}`}>
                    <strong>{critique.score}</strong>
                    <span>/ 100</span>
                  </div>
                  <div>
                    <span className="ai-draft-badge">AI review</span>
                    <p>{critique.summary}</p>
                  </div>
                </div>

                {critique.strengths.length > 0 && (
                  <div className="ai-review-block">
                    <h5>Working well</h5>
                    <ul>
                      {critique.strengths.map((s, i) => <li key={i}><EditrimIcon name="check" size={12} /> {s}</li>)}
                    </ul>
                  </div>
                )}

                {critique.improvements.length > 0 && (
                  <div className="ai-review-block">
                    <h5>Could be stronger</h5>
                    <div className="ai-improvements">
                      {critique.improvements.map((imp, i) => (
                        <div className="ai-improvement" key={i}>
                          <span className={`ai-severity ${imp.severity}`}>{imp.severity}</span>
                          <strong>{imp.title}</strong>
                          <p>{imp.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="ai-fineprint">AI critique is a suggestion, not a verdict. You know the brief.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AiErrorCard({ error, onRetry }: { error: AiRequestError; onRetry: () => void }) {
  const { toast } = useToast();
  const hint = errorHint(error);
  const stage = STAGE_LABEL[error.stage] ?? error.stage;

  const copyDiagnostics = () => {
    const text = [
      'Editrim AI error',
      `action: ${error.action ?? 'unknown'}`,
      `stage: ${error.stage}`,
      `code: ${error.code}`,
      `http: ${error.status ?? 'n/a'}`,
      `requestId: ${error.requestId ?? 'n/a'}`,
      `model: ${error.model ?? AI_MODEL_LABEL}`,
      `message: ${error.message}`,
      error.details ? `details: ${JSON.stringify(error.details)}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard?.writeText(text);
    toast('Diagnostics copied');
  };

  return (
    <div className="ai-error" role="alert">
      <div className="ai-error-head">
        <EditrimIcon name="alert" size={14} />
        <strong>{stage} error</strong>
        {error.status && <span>HTTP {error.status}</span>}
      </div>
      <p>{error.message}</p>
      {hint && <div className="ai-error-hint">{hint}</div>}
      <div className="ai-error-meta">
        <span>stage <code>{error.stage}</code></span>
        <span>code <code>{error.code}</code></span>
        {error.requestId && <span>request <code>{error.requestId}</code></span>}
      </div>
      {error.details && (
        <details className="ai-error-details">
          <summary>Upstream details</summary>
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        </details>
      )}
      <div className="ai-error-actions">
        <button onClick={onRetry}><EditrimIcon name="refresh" size={12} /> Try again</button>
        <button onClick={copyDiagnostics}><EditrimIcon name="copy" size={12} /> Copy diagnostics</button>
      </div>
    </div>
  );
}
