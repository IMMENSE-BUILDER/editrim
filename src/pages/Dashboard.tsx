import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Logo } from '../components/Brand';
import { EditrimIcon } from '../components/EditrimIcon';
import { NewDesignModal } from '../components/NewDesignModal';
import { BrandKitModal } from '../components/BrandKitModal';
import { Modal } from '../components/Modal';
import { PagePreview } from '../components/PagePreview';
import { useToast } from '../components/Toast';
import { getDesign, listDesigns, deleteDesign, duplicateDesign, getBrand, storageUsage, saveDesign } from '../lib/storage';
import type { Design } from '../lib/types';
import { TEMPLATES } from '../lib/templates';
import { exportDesign } from '../lib/export';
import { formatBytes, timeAgo } from '../lib/utils';
import { SIZE_PRESETS } from '../lib/presets';

type Entry = { design: Design };

const QUICK = [
  { label: 'Social post', w: 1080, h: 1080, hint: '1:1' },
  { label: 'Story', w: 1080, h: 1920, hint: '9:16' },
  { label: 'Presentation', w: 1920, h: 1080, hint: '16:9' },
  { label: 'Poster', w: 1240, h: 1754, hint: 'A4' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Design | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<Design | null>(null);
  const [brand, setBrand] = useState(() => getBrand());
  const menuRef = useRef<HTMLDivElement>(null);

  const reload = () => {
    const list = listDesigns()
      .map(m => getDesign(m.id))
      .filter((d): d is Design => Boolean(d));
    setEntries(list.map(design => ({ design })));
    setBrand(getBrand());
  };

  useEffect(() => {
    reload();
    document.title = 'Your designs — Editrim';
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuId && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(({ design }) => !q || `${design.title} ${design.category}`.toLowerCase().includes(q));
  }, [entries, query]);

  const usage = storageUsage();
  const pageCount = entries.reduce((n, e) => n + e.design.pages.length, 0);

  const quickStart = (w: number, h: number, label: string) => {
    navigate(`/editor/new?w=${w}&h=${h}&name=${encodeURIComponent(`Untitled ${label.toLowerCase()}`)}`);
  };

  const openRename = (d: Design) => {
    setRenaming(d);
    setRenameValue(d.title);
    setMenuId(null);
  };

  const commitRename = () => {
    if (!renaming) return;
    const title = renameValue.trim() || 'Untitled design';
    const fresh = getDesign(renaming.id);
    if (fresh) {
      saveDesign({ ...fresh, title });
      toast('Design renamed');
    }
    setRenaming(null);
    reload();
  };

  const onDuplicate = (d: Design) => {
    const copy = duplicateDesign(d.id);
    setMenuId(null);
    if (copy) {
      reload();
      toast('Design duplicated');
    }
  };

  const onDownload = async (d: Design) => {
    setMenuId(null);
    try {
      await exportDesign(d, 0, { format: 'png', scale: 2, pages: 'current', transparent: false });
      toast('PNG downloaded');
    } catch {
      toast('Export failed — try opening the design', 'error');
    }
  };

  const onDelete = () => {
    if (!deleting) return;
    deleteDesign(deleting.id);
    setDeleting(null);
    reload();
    toast('Design deleted');
  };

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link to="/" className="dash-logo" aria-label="Editrim home">
          <Logo size={32} tone="light" />
        </Link>
        <nav className="dash-nav">
          <Link to="/dashboard" className="active"><EditrimIcon name="projects" size={17} /> Your designs</Link>
          <Link to="/templates"><EditrimIcon name="templates" size={17} /> Templates</Link>
          <Link to="/editor/new#ai"><EditrimIcon name="spark" size={17} /> AI Studio</Link>
          <button onClick={() => setBrandOpen(true)}><EditrimIcon name="palette" size={17} /> Brand kit</button>
        </nav>
        <button className="dash-new" onClick={() => setNewOpen(true)}>
          <EditrimIcon name="plus" size={17} /> New design
        </button>
        <div className="dash-side-bottom">
          <div className="dash-storage">
            <div className="dash-storage-head"><span>Local workspace</span><span>{formatBytes(usage)}</span></div>
            <div className="dash-storage-bar"><i style={{ width: `${Math.min(100, (usage / (5 * 1024 * 1024)) * 100)}%` }} /></div>
            <p>Saved in this browser. Nothing leaves your device.</p>
          </div>
          <div className="dash-side-note">
            <span>Editrim 1.0</span>
            <a href="https://github.com/IMMENSE-BUILDER/editrim" target="_blank" rel="noreferrer">Source <EditrimIcon name="arrowUpRight" size={11} /></a>
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div className="dash-search">
            <EditrimIcon name="search" size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your designs" aria-label="Search your designs" />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search"><EditrimIcon name="close" size={14} /></button>}
          </div>
          <div className="dash-top-actions">
            <Link to="/templates" className="btn btn-ghost"><EditrimIcon name="templates" size={15} /> Templates</Link>
            <div className="dash-avatar" title="Local workspace">
              <span>E</span>
            </div>
          </div>
        </header>

        <div className="dash-content">
          <section className="dash-heading">
            <div>
              <span className="eyebrow"><span className="dot" /> Local workspace</span>
              <h1>Your designs</h1>
              <p>{entries.length ? `${entries.length} ${entries.length === 1 ? 'design' : 'designs'} · ${pageCount} ${pageCount === 1 ? 'page' : 'pages'} · autosaved` : 'Everything starts with a blank page.'}</p>
            </div>
            <div className="dash-heading-actions">
              <Link to="/editor/new#ai" className="btn btn-secondary dash-ai-btn">
                <EditrimIcon name="spark" size={15} /> AI Studio
              </Link>
              <button className="btn btn-cobalt" onClick={() => setNewOpen(true)}>
                <EditrimIcon name="plus" size={16} /> New design
              </button>
            </div>
          </section>

          <section className="quick-row" aria-label="Quick start">
            {QUICK.map(q => (
              <button key={q.label} className="quick-card" onClick={() => quickStart(q.w, q.h, q.label)}>
                <span className="quick-shape" style={{ aspectRatio: `${q.w} / ${q.h}` }} />
                <span className="quick-copy">
                  <b>{q.label}</b>
                  <small>{q.hint} · {q.w}×{q.h}</small>
                </span>
                <EditrimIcon name="plus" size={15} className="quick-plus" />
              </button>
            ))}
          </section>

          {filtered.length > 0 ? (
            <section className="designs-section">
              <div className="designs-head">
                <h2>{query ? `Results for “${query}”` : 'Recent designs'}</h2>
                <span>{filtered.length} shown</span>
              </div>
              <div className="design-grid">
                {filtered.map(({ design }) => {
                  const ratio = design.size.width / design.size.height;
                  const artWidth = Math.min(100, (86 * ratio) / 0.8);
                  return (
                    <div className="design-card" key={design.id}>
                      <Link to={`/editor/${design.id}`} className="design-thumb" aria-label={`Open ${design.title}`}>
                        <div className="design-thumb-art" style={{ width: `${artWidth}%` }}>
                          <PagePreview page={design.pages[0]} size={design.size} />
                        </div>
                        <div className="design-hover">
                          <span>Open in editor <EditrimIcon name="arrowUpRight" size={13} /></span>
                        </div>
                      </Link>
                      <div className="design-info">
                        <div className="design-info-text">
                          <Link to={`/editor/${design.id}`} className="design-name">{design.title}</Link>
                          <span className="design-meta">
                            {design.category} · {design.size.width}×{design.size.height} · {timeAgo(design.updatedAt)}
                          </span>
                        </div>
                        <div className="design-menu-wrap" ref={menuId === design.id ? menuRef : undefined}>
                          <button
                            className="btn-icon design-menu-btn"
                            onClick={() => setMenuId(menuId === design.id ? null : design.id)}
                            aria-label={`Options for ${design.title}`}
                          >
                            <EditrimIcon name="more" size={17} />
                          </button>
                          {menuId === design.id && (
                            <div className="design-menu">
                              <button onClick={() => { setMenuId(null); navigate(`/editor/${design.id}`); }}><EditrimIcon name="pencil" size={14} /> Edit</button>
                              <button onClick={() => openRename(design)}><EditrimIcon name="pencil" size={14} /> Rename</button>
                              <button onClick={() => onDuplicate(design)}><EditrimIcon name="duplicate" size={14} /> Duplicate</button>
                              <button onClick={() => onDownload(design)}><EditrimIcon name="download" size={14} /> Download PNG</button>
                              <button onClick={() => { setMenuId(null); navigate(`/present/${design.id}`); }}><EditrimIcon name="present" size={14} /> Present</button>
                              <button className="danger" onClick={() => { setDeleting(design); setMenuId(null); }}><EditrimIcon name="trash" size={14} /> Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button className="design-card design-new-card" onClick={() => setNewOpen(true)}>
                  <span className="design-new-icon"><EditrimIcon name="plus" size={22} /></span>
                  <span>Create a new design</span>
                  <small>Any size, blank or from a template</small>
                </button>
              </div>
            </section>
          ) : (
            <section className="dash-empty">
              <div className="empty-art" aria-hidden="true">
                <div className="empty-card"><PagePreview page={TEMPLATES[0].pages[0]} size={TEMPLATES[0].size} /></div>
                <div className="empty-card"><PagePreview page={TEMPLATES[6].pages[0]} size={TEMPLATES[6].size} /></div>
                <div className="empty-card"><PagePreview page={TEMPLATES[8].pages[0]} size={TEMPLATES[8].size} /></div>
                <span className="empty-spark"><EditrimIcon name="magic" size={18} /></span>
              </div>
              <h2>{query ? 'No designs match that search' : 'Your canvas is waiting'}</h2>
              <p>
                {query
                  ? 'Try another word, or start something new.'
                  : 'Start from a blank canvas in any size, or borrow a layout from the template gallery. Everything autosaves as you work.'}
              </p>
              <div className="empty-actions">
                <button className="btn btn-cobalt" onClick={() => setNewOpen(true)}><EditrimIcon name="plus" size={16} /> New design</button>
                <Link to="/templates" className="btn btn-secondary">Browse templates</Link>
              </div>
              <div className="empty-sizes">
                {SIZE_PRESETS.slice(0, 4).map(p => (
                  <button key={p.id} onClick={() => navigate(`/editor/new?w=${p.w}&h=${p.h}&name=${encodeURIComponent(p.name)}`)}>
                    <span style={{ aspectRatio: `${p.w} / ${p.h}` }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="dash-templates">
            <div className="designs-head">
              <h2>Or start from a template</h2>
              <Link to="/templates" className="section-link">All templates <EditrimIcon name="arrowRight" size={14} /></Link>
            </div>
            <div className="dash-template-row">
              {TEMPLATES.slice(0, 5).map(t => (
                <Link key={t.id} to={`/editor/new?template=${t.id}`} className="dash-template">
                  <div className="dash-template-preview"><PagePreview page={t.pages[0]} size={t.size} /></div>
                  <span>{t.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <button className="dash-brand-fab" onClick={() => setBrandOpen(true)}>
          <EditrimIcon name="palette" size={15} /> Brand kit
          <span>{brand.colors.length}</span>
        </button>
      </main>

      <NewDesignModal open={newOpen} onClose={() => setNewOpen(false)} />
      <BrandKitModal open={brandOpen} onClose={() => setBrandOpen(false)} onSaved={reload} />

      <Modal
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title="Rename design"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setRenaming(null)}>Cancel</button>
            <button className="btn btn-cobalt" onClick={commitRename}>Save name</button>
          </>
        }
      >
        <div className="field">
          <label className="field-label" htmlFor="rename">Design name</label>
          <input
            id="rename"
            className="input"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && commitRename()}
            autoFocus
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this design?"
        subtitle="This cannot be undone — the design is removed from this browser."
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Keep it</button>
            <button className="btn btn-danger" onClick={onDelete}>Delete design</button>
          </>
        }
      >
        <div className="delete-preview">
          {deleting && (
            <>
              <div style={{ width: 84 }}>
                <PagePreview page={deleting.pages[0]} size={deleting.size} />
              </div>
              <div>
                <strong>{deleting.title}</strong>
                <span>{deleting.pages.length} {deleting.pages.length === 1 ? 'page' : 'pages'} · {deleting.size.width}×{deleting.size.height}</span>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
