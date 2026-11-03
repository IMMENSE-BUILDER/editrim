import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, Download, ImagePlus, Languages, Layers, Lock,
  Palette, PenLine, Play, ScanEye, Sparkles, Type, Wand2, Zap, LayoutGrid, MonitorPlay, Images,
} from 'lucide-react';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import { EditrimIcon, type EditrimIconName } from '../components/EditrimIcon';
import { PagePreview } from '../components/PagePreview';
import { TemplateCard } from '../components/TemplateCard';
import { TEMPLATES, getTemplate } from '../lib/templates';
import { SIZE_PRESETS } from '../lib/presets';
import { FONTS } from '../lib/fonts';
import { getBrand } from '../lib/storage';

const featured = ['cafe-opening', 'porter-pitch', 'night-shift', 'form-04', 'flash-sale'];

const FAQS = [
  {
    q: 'Is Editrim really free?',
    a: 'Yes. Every feature on this site — templates, the full editor, exports, presentations, brand kits — is free and available without an account. There is no paywall waiting at the download button.',
  },
  {
    q: 'Where are my designs stored?',
    a: 'In your browser. Editrim saves each design to local storage on this device, so it reopens exactly where you left it. Nothing is uploaded to a server. That also means clearing site data removes your designs, and they do not sync across devices.',
  },
  {
    q: 'What can I export?',
    a: 'PNG, JPG and PDF, at 1×, 2× or 3× resolution. Multi-page designs export as a single PDF or as numbered images. Transparent PNG is available for logos and cut-outs.',
  },
  {
    q: 'Can I use the designs commercially?',
    a: 'Yes. The templates and everything you make with them are yours. Editrim does not add a watermark or claim ownership. Check the licence of any photo you upload yourself, and note that template photos are loaded from Unsplash.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'You can browse, preview and present on a phone. The editor is built for a mouse and a real keyboard — we recommend a tablet or laptop for actual designing.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. There is no sign-up, no email capture and no “continue with Google” wall. Open the editor and start.',
  },
  {
    q: 'How does the AI work?',
    a: 'AI Studio sends your brief to Xiaomi MiMo V2.6 Flash through a Vercel AI Gateway serverless function. Text actions send the prompt and a compact description of the current page. AI Review renders a temporary snapshot of the page and sends that image for visual critique. Requests happen only when you press generate, and API keys stay on the server. Nothing is stored by Editrim. AI drafts are always previewed first, so nothing changes until you approve it. AI can be wrong — review the result. Image segmentation and inpainting (such as a background remover) are not implemented; AI illustrations are generated as sanitised vector SVG.',
  },
];

function useFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return { open, setOpen };
}

export default function Landing() {
  const cafe = getTemplate('cafe-opening')!;
  const pitch = getTemplate('porter-pitch')!;
  const gig = getTemplate('night-shift')!;
  const sale = getTemplate('flash-sale')!;
  const form = getTemplate('form-04')!;
  const featuredTemplates = featured.map(id => TEMPLATES.find(t => t.id === id)!).filter(Boolean);
  const brand = useMemo(() => getBrand(), []);
  const { open: faqOpen, setOpen: setFaqOpen } = useFaq();
  const [format, setFormat] = useState<'post' | 'story' | 'deck' | 'poster'>('post');

  useEffect(() => {
    document.title = 'Editrim — Design anything. Beautifully.';
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.landing .reveal'));
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach(node => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  const formats = {
    post: { label: 'Post', size: '1080 × 1080', page: cafe.pages[0], dims: cafe.size, note: 'Square post' },
    story: { label: 'Story', size: '1080 × 1920', page: sale.pages[0], dims: { name: 'Story', width: 1080, height: 1920 }, note: 'Full-screen story' },
    deck: { label: 'Deck', size: '1920 × 1080', page: pitch.pages[2], dims: pitch.size, note: 'Presentation slide' },
    poster: { label: 'Poster', size: '1240 × 1754', page: gig.pages[0], dims: gig.size, note: 'Print-ready poster' },
  } as const;
  const current = formats[format];

  return (
    <div className="landing">
      <SiteHeader />

      {/* ---------------- hero ---------------- */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <Link to="/#ai" className="hero-badge">
              <span className="chip chip-lime">New</span>
              AI Studio is here
              <EditrimIcon name="arrowRight" size={13} />
            </Link>
            <h1 className="hero-title">
              Make it look<br />
              like you hired<br />
              <span className="hero-accent">a designer.</span>
            </h1>
            <p className="hero-sub">
              Editrim is a full design studio in your browser. Posts, decks, posters,
              resumes — start from a real template, a blank page, or a sentence.
            </p>
            <div className="hero-ctas">
              <Link to="/dashboard" className="btn btn-cobalt btn-lg">
                Start designing
                <EditrimIcon name="arrowUpRight" size={17} />
              </Link>
              <Link to="/templates" className="btn btn-secondary btn-lg">
                Browse templates
              </Link>
            </div>
            <div className="hero-meta">
              <span><EditrimIcon name="check" size={14} /> Free forever</span>
              <span><EditrimIcon name="check" size={14} /> No sign-up</span>
              <span><EditrimIcon name="check" size={14} /> PNG, JPG &amp; PDF</span>
            </div>
          </div>

          <div className="hero-stage" aria-label="Examples of designs made in Editrim">
            <div className="hero-blob" />
            <div className="hero-card hero-card-a">
              <PagePreview page={cafe.pages[0]} size={cafe.size} ariaLabel="Café opening template" />
              <div className="hero-card-tag">Template · Café</div>
            </div>
            <div className="hero-card hero-card-b">
              <PagePreview page={sale.pages[0]} size={sale.size} ariaLabel="Flash sale story template" />
            </div>
            <div className="hero-card hero-card-c">
              <PagePreview page={gig.pages[0]} size={gig.size} ariaLabel="Music poster template" />
            </div>
            <div className="hero-float-chip hero-chip-saved">
              <span className="hero-chip-dot" /> Autosaved
            </div>
            <div className="hero-float-chip hero-chip-cursor">
              <span className="hero-cursor" />
              Snap to center
            </div>
            <div className="hero-float-chip hero-chip-type">
              <EditrimIcon name="type" size={15} /> 15 fonts, zero fuss
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div><strong>{TEMPLATES.length}</strong><span>designed templates</span></div>
          <div><strong>{SIZE_PRESETS.length}</strong><span>canvas sizes</span></div>
          <div><strong>6</strong><span>AI tools</span></div>
          <div><strong>3</strong><span>export formats</span></div>
          <div><strong>0</strong><span>sign-ups required</span></div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map(k => (
            <div className="marquee-group" key={k}>
              {['Posts', 'Decks', 'Posters', 'Stories', 'Resumes', 'Logos', 'Menus', 'Invites'].map(word => (
                <span key={word}>{word}<i>✦</i></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- promise ---------------- */}
      <section className="promise reveal">
        <div className="section-heading">
          <span className="eyebrow"><span className="dot" /> The short version</span>
          <h2>Serious tools.<br /><span className="serif-italic">Unserious learning curve.</span></h2>
        </div>
        <div className="promise-grid">
          <div className="promise-item">
            <span className="promise-num">01</span>
            <h3>Start with real design</h3>
            <p>Twenty templates made by a designer, not generated from a prompt. Open one and it is already editable, layered and aligned.</p>
          </div>
          <div className="promise-item">
            <span className="promise-num">02</span>
            <h3>Edit like you mean it</h3>
            <p>Snap, align, distribute, rotate, layer, lock. Real typography controls, real multi-page documents, real undo. No fake toolbar.</p>
          </div>
          <div className="promise-item">
            <span className="promise-num">03</span>
            <h3>Leave with a file</h3>
            <p>Download a crisp PNG, a JPG, or a print-ready PDF. Present full screen straight from the browser. No watermark, ever.</p>
          </div>
        </div>
      </section>

      {/* ---------------- templates ---------------- */}
      <section className="templates-section reveal" id="templates">
        <div className="section-row">
          <div className="section-heading">
            <span className="eyebrow"><span className="dot" /> Made to be stolen</span>
            <h2>Start here.<br /><span className="serif-italic">Make it yours.</span></h2>
          </div>
          <Link to="/templates" className="section-link">
            All {TEMPLATES.length} templates <EditrimIcon name="arrowUpRight" size={16} />
          </Link>
        </div>
        <div className="featured-grid">
          {featuredTemplates.map((t, i) => (
            <TemplateCard
              key={t.id}
              template={t}
              to={`/editor/new?template=${t.id}`}
              className={i === 0 ? 'is-large' : i === 1 ? 'is-tall' : ''}
              stack={t.id === 'porter-pitch'}
            />
          ))}
        </div>
      </section>

      {/* ---------------- editor ---------------- */}
      <section className="editor-section reveal" id="features">
        <div className="editor-copy">
          <span className="eyebrow"><span className="dot" /> The editor</span>
          <h2>Everything you need.<br /><span className="serif-italic">Nothing you don’t.</span></h2>
          <p>
            A proper canvas with snapping, guides, layers and multi-select. A quiet interface
            that gets out of the way. Familiar enough to use immediately, deep enough to keep going.
          </p>
          <ul className="check-list">
            <li><EditrimIcon name="check" size={15} /> Drag, resize and rotate with precision</li>
            <li><EditrimIcon name="check" size={15} /> Snap to edges, centres and other elements</li>
            <li><EditrimIcon name="check" size={15} /> 15 curated fonts, gradients and shadows</li>
            <li><EditrimIcon name="check" size={15} /> Undo, autosave and multi-page documents</li>
          </ul>
          <Link to="/editor/new" className="btn btn-primary" style={{ marginTop: 8 }}>
            Open the editor <EditrimIcon name="arrowRight" size={16} />
          </Link>
        </div>

        <div className="app-shot-wrap">
          <div className="app-shot">
            <div className="app-shot-top">
              <div className="app-shot-dots"><span /><span /><span /></div>
              <div className="app-shot-title">Porter — Seed Deck</div>
              <div className="app-shot-actions"><span>Present</span><b>Download</b></div>
            </div>
            <div className="app-shot-body">
              <div className="app-shot-rail">
                {(['templates', 'text', 'spark', 'image', 'palette'] as const).map((name, i) => (
                  <span key={i} className={i === 3 ? 'active' : ''}><EditrimIcon name={name} size={15} /></span>
                ))}
              </div>
              <div className="app-shot-panel">
                <div className="app-shot-panel-title">Elements</div>
                <div className="app-shot-search">Search elements…</div>
                <div className="app-shot-label">Shapes</div>
                <div className="app-shot-shapes">
                  <span /><span /><span /><span /><span /><span />
                </div>
                <div className="app-shot-label">Brand colours</div>
                <div className="app-shot-swatches">
                  {brand.colors.slice(0, 5).map(c => <span key={c} style={{ background: c }} />)}
                </div>
                <div className="app-shot-label">Type</div>
                <div className="app-shot-type">
                  <b style={{ fontFamily: 'Bricolage Grotesque' }}>Aa</b>
                  <span>Bricolage Grotesque</span>
                </div>
              </div>
              <div className="app-shot-canvas">
                <PagePreview page={pitch.pages[2]} size={pitch.size} />
                <div className="app-shot-selection">
                  <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
                </div>
                <div className="app-shot-zoom">86%</div>
              </div>
              <div className="app-shot-inspector">
                <div className="app-shot-panel-title">Design</div>
                <div className="app-shot-insp-row"><span>Fill</span><i style={{ background: '#D8F55A' }} /></div>
                <div className="app-shot-insp-row"><span>Stroke</span><i style={{ background: '#14130F' }} /></div>
                <div className="app-shot-insp-label">Opacity</div>
                <div className="app-shot-slider"><i /></div>
                <div className="app-shot-insp-label">Position</div>
                <div className="app-shot-inputs"><span>112</span><span>96</span></div>
                <div className="app-shot-inputs"><span>1420</span><span>220</span></div>
              </div>
            </div>
          </div>
          <div className="app-shot-chip app-shot-chip-one"><EditrimIcon name="bolt" size={14} /> Live snapping</div>
          <div className="app-shot-chip app-shot-chip-two"><EditrimIcon name="download" size={14} /> Export at 3×</div>
        </div>
      </section>

      {/* ---------------- AI studio ---------------- */}
      <section className="ai-section reveal" id="ai">
        <div className="ai-section-inner">
          <div className="ai-section-copy">
            <span className="eyebrow"><span className="dot" /> AI Studio</span>
            <h2>Start with a sentence.<br /><span className="serif-italic">Finish with something yours.</span></h2>
            <p>
              Describe a design, ask for the words, translate a line, or get a second opinion.
              Every result arrives as an editable draft — never a locked black box.
            </p>
            <div className="ai-capability-list">
              {[
                { icon: 'spark', title: 'AI design', body: 'A complete page from a brief — type, shapes and photo, all editable.' },
                { icon: 'pencil', title: 'AI writing', body: 'Generate, rewrite, shorten or expand copy in your brand voice.' },
                { icon: 'magic', title: 'AI edits', body: 'Ask for a change and review the exact commands before they apply.' },
                { icon: 'image', title: 'AI illustrations', body: 'Flat vector artwork generated as safe, reusable SVG.' },
                { icon: 'language', title: 'AI translation', body: 'Translate selected text into 16 languages without losing the layout.' },
                { icon: 'scan', title: 'AI review', body: 'An honest critique of hierarchy, contrast and legibility.' },
              ].map(item => {
                return (
                  <div className="ai-capability" key={item.title}>
                    <span><EditrimIcon name={item.icon as EditrimIconName} size={15} /></span>
                    <div><strong>{item.title}</strong><p>{item.body}</p></div>
                  </div>
                );
              })}
            </div>
            <div className="ai-section-actions">
              <Link to="/editor/new#ai" className="btn btn-cobalt">
                Try AI Studio <EditrimIcon name="arrowUpRight" size={16} />
              </Link>
              <span className="ai-powered"><span /> MiMo V2.6 Flash · Vercel AI Gateway</span>
            </div>
          </div>

          <div className="ai-demo">
            <div className="ai-demo-top">
              <span className="ai-demo-brand"><EditrimIcon name="spark" size={13} /> AI Studio</span>
              <span>WRITE</span>
            </div>
            <div className="ai-demo-prompt">
              <span className="ai-demo-label">YOUR BRIEF</span>
              <p>Write a launch line for a slow coffee brand called Bruma. Warm, editorial, confident.</p>
              <div className="ai-demo-cta"><EditrimIcon name="spark" size={13} /> Generate</div>
            </div>
            <div className="ai-demo-output">
              <div className="ai-demo-output-head">
                <span>AI COPY · DRAFT</span>
                <span className="ai-demo-draft">Draft</span>
              </div>
              <p>“Bruma: coffee that takes its time, so you can take yours.”</p>
              <div className="ai-demo-tools">
                <span>Rewrite</span><span>Shorten</span><span>Translate</span>
              </div>
            </div>
            <div className="ai-demo-foot">
              <span><EditrimIcon name="check" size={11} /> Editable before it lands</span>
              <span>MiMo V2.6 Flash</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- formats ---------------- */}
      <section className="formats-section reveal">
        <div className="section-row">
          <div className="section-heading">
            <span className="eyebrow"><span className="dot" /> One idea, every format</span>
            <h2>Design it once.<br /><span className="serif-italic">Resize it anywhere.</span></h2>
          </div>
          <p className="formats-note">Change the canvas size and every element scales with it. Your layout survives the trip from a square post to a full story.</p>
        </div>
        <div className="formats-stage">
          <div className="formats-tabs">
            {(Object.keys(formats) as (keyof typeof formats)[]).map(key => (
              <button
                key={key}
                className={format === key ? 'active' : ''}
                onClick={() => setFormat(key)}
              >
                {formats[key].label}
              </button>
            ))}
            <div className="formats-tabs-note">{current.size}</div>
          </div>
          <div className="formats-preview">
            <div className={`formats-frame frame-${format}`}>
              <PagePreview page={current.page} size={current.dims} />
            </div>
            <div className="formats-meta">
              <div>
                <span className="formats-kicker">Selected canvas</span>
                <strong>{current.note}</strong>
                <span>{current.size} px</span>
              </div>
              <div className="formats-badge"><EditrimIcon name="bolt" size={15} /> One-click resize</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- bento ---------------- */}
      <section className="bento-section reveal">
        <div className="section-heading">
          <span className="eyebrow"><span className="dot" /> Under the hood</span>
          <h2>The details that make<br /><span className="serif-italic">it feel finished.</span></h2>
        </div>
        <div className="bento">
          <div className="bento-card bento-brand">
            <div className="bento-icon"><EditrimIcon name="palette" size={18} /></div>
            <h3>Your brand, on tap</h3>
            <p>Save colours and fonts once. Apply them to any element from the brand panel.</p>
            <div className="bento-swatches">
              {brand.colors.map(c => <span key={c} style={{ background: c }} />)}
            </div>
            <div className="bento-brand-type" style={{ fontFamily: `"${brand.fonts[0]}", sans-serif` }}>
              Aa
              <span style={{ fontFamily: `"${brand.fonts[1]}", sans-serif` }}>{brand.fonts[0].split(' ')[0]} + {brand.fonts[1]}</span>
            </div>
          </div>
          <div className="bento-card bento-multipage">
            <div className="bento-icon"><EditrimIcon name="layers" size={18} /></div>
            <h3>Real multi-page</h3>
            <p>Build a whole deck, not one lonely slide. Reorder, duplicate and present pages.</p>
            <div className="bento-pages">
              {[pitch.pages[1], pitch.pages[2], pitch.pages[3]].map((p, i) => (
                <div key={i} style={{ transform: `rotate(${(i - 1) * 5}deg) translate(${i * 10}px, ${i * 4}px)` }}>
                  <PagePreview page={p} size={pitch.size} />
                </div>
              ))}
            </div>
          </div>
          <div className="bento-card bento-present">
            <div className="bento-icon light"><EditrimIcon name="present" size={18} /></div>
            <h3>Present without leaving</h3>
            <p>Full-screen, keyboard-driven presentation mode. No export, no PowerPoint.</p>
            <div className="bento-present-screen">
              <PagePreview page={pitch.pages[0]} size={pitch.size} />
              <span className="bento-play"><EditrimIcon name="play" size={14} fill="currentColor" /></span>
            </div>
          </div>
          <div className="bento-card bento-fonts">
            <div className="bento-icon"><EditrimIcon name="type" size={18} /></div>
            <h3>Type that behaves</h3>
            <p>Fifteen fonts, real weight and spacing controls, and text that wraps like it should.</p>
            <div className="bento-font-list">
              {['Instrument Serif', 'Bricolage Grotesque', 'Caveat'].map(f => (
                <span key={f} style={{ fontFamily: `"${f}", sans-serif` }}>
                  Aa <small>{FONTS.find(x => x.family === f)?.label}</small>
                </span>
              ))}
            </div>
          </div>
          <div className="bento-card bento-private">
            <div className="bento-icon"><EditrimIcon name="lock" size={18} /></div>
            <h3>Yours, privately</h3>
            <p>Designs live in your browser, not on our servers. No account, no tracking, no upload.</p>
            <div className="bento-private-tags">
              <span>No account</span><span>No upload</span><span>No tracking</span>
            </div>
            <div className="bento-private-badge"><span /><b>Local only</b></div>
          </div>
          <div className="bento-card bento-export">
            <div className="bento-icon"><EditrimIcon name="download" size={18} /></div>
            <h3>Export-ready</h3>
            <p>PNG, JPG and PDF at up to 3× resolution. Transparent background when you need it.</p>
            <div className="bento-export-chips">
              <span>PNG</span><span>JPG</span><span>PDF</span><b>3×</b>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- steps ---------------- */}
      <section className="steps-section reveal" id="how">
        <div className="section-heading">
          <span className="eyebrow"><span className="dot" /> How it works</span>
          <h2>Three steps.<br /><span className="serif-italic">No tutorials.</span></h2>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-num">01</span>
            <div className="step-visual step-visual-pick">
              <div className="step-mini-card"><PagePreview page={form.pages[0]} size={form.size} /></div>
              <div className="step-mini-card"><PagePreview page={cafe.pages[0]} size={cafe.size} /></div>
            </div>
            <h3>Pick a starting point</h3>
            <p>Choose from 20 templates, a preset size, or an empty canvas at exactly the dimensions you need.</p>
          </div>
          <div className="step">
            <span className="step-num">02</span>
            <div className="step-visual step-visual-edit">
              <div className="step-canvas">
                <PagePreview page={cafe.pages[0]} size={cafe.size} />
                <div className="step-handle step-h1" /><div className="step-handle step-h2" /><div className="step-handle step-h3" /><div className="step-handle step-h4" />
                <div className="step-guide" />
              </div>
            </div>
            <h3>Make it yours</h3>
            <p>Swap the words, colours and photos. Everything snaps into place, and every change can be undone.</p>
          </div>
          <div className="step">
            <span className="step-num">03</span>
            <div className="step-visual step-visual-export">
              <div className="step-file"><span>PNG</span><small>1080 × 1080</small></div>
              <div className="step-file"><span>PDF</span><small>4 pages</small></div>
              <div className="step-file"><span>JPG</span><small>2160 × 2160</small></div>
            </div>
            <h3>Take it with you</h3>
            <p>Download a file, copy a share link, or hit present and go full screen. No watermark hiding in the corner.</p>
          </div>
        </div>
      </section>

      {/* ---------------- pricing ---------------- */}
      <section className="pricing-section reveal" id="pricing">
        <div className="pricing-card">
          <div className="pricing-main">
            <span className="eyebrow">Pricing</span>
            <h2>Free. Actually free.</h2>
            <p>Every feature, every template, every export. No trial timer, no credit card, no “Pro” badge on the good fonts.</p>
            <Link to="/dashboard" className="btn btn-lime btn-lg">
              Start designing <EditrimIcon name="arrowUpRight" size={17} />
            </Link>
            <span className="pricing-small">No account needed. Nothing to cancel.</span>
          </div>
          <div className="pricing-list">
            <div className="pricing-row"><span>Unlimited designs</span><EditrimIcon name="check" size={16} /></div>
            <div className="pricing-row"><span>All 20 templates</span><EditrimIcon name="check" size={16} /></div>
            <div className="pricing-row"><span>Multi-page documents</span><EditrimIcon name="check" size={16} /></div>
            <div className="pricing-row"><span>PNG, JPG &amp; PDF export</span><EditrimIcon name="check" size={16} /></div>
            <div className="pricing-row"><span>Brand kits</span><EditrimIcon name="check" size={16} /></div>
            <div className="pricing-row"><span>AI writing, design &amp; review</span><EditrimIcon name="check" size={16} /></div>
            <div className="pricing-row"><span>Presentation mode</span><EditrimIcon name="check" size={16} /></div>
            <div className="pricing-row muted"><span>Team collaboration</span><span className="chip">Later</span></div>
            <div className="pricing-row muted"><span>Cloud sync</span><span className="chip">Later</span></div>
          </div>
        </div>
      </section>

      {/* ---------------- faq ---------------- */}
      <section className="faq-section reveal" id="faq">
        <div className="faq-heading">
          <span className="eyebrow"><span className="dot" /> Questions</span>
          <h2>The honest<br /><span className="serif-italic">answers.</span></h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div className={`faq-item ${faqOpen === i ? 'open' : ''}`} key={f.q}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}>
                <span>{f.q}</span>
                <EditrimIcon name="chevronDown" size={18} />
              </button>
              <div className="faq-answer"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- final cta ---------------- */}
      <section className="final-cta reveal">
        <div className="final-cta-inner">
          <span className="eyebrow light">Your move</span>
          <h2>Your next design<br />is <span className="serif-italic">already late.</span></h2>
          <div className="final-cta-actions">
            <Link to="/editor/new" className="btn btn-lime btn-lg">
              Start from blank <EditrimIcon name="arrowUpRight" size={17} />
            </Link>
            <Link to="/templates" className="btn final-btn-outline btn-lg">
              Use a template <EditrimIcon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
        <div className="final-cta-art" aria-hidden="true">
          <div className="final-card"><PagePreview page={gig.pages[0]} size={gig.size} /></div>
          <div className="final-card"><PagePreview page={cafe.pages[0]} size={cafe.size} /></div>
          <div className="final-card"><PagePreview page={sale.pages[0]} size={sale.size} /></div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
