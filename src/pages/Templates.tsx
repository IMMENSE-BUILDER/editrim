import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import { TemplateCard } from '../components/TemplateCard';
import { EditrimIcon } from '../components/EditrimIcon';
import { FormatGlyph } from '../components/FormatGlyph';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../lib/templates';

export default function Templates() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const category = params.get('category') ?? 'All';
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Templates — Editrim';
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter(t => {
      const inCat = category === 'All' || t.category === category;
      const inQuery = !q || `${t.name} ${t.category} ${t.description} ${t.tags.join(' ')}`.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [category, query]);

  const setCategory = (c: string) => {
    if (c === 'All') setParams({});
    else setParams({ category: c });
  };

  const surprise = () => {
    const pick = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    navigate(`/editor/new?template=${pick.id}`);
  };

  return (
    <div className="gallery-page">
      <SiteHeader />

      <div className="gallery-hero">
        <h1>Templates</h1>
      </div>

      <div className="gallery-bar">
        <div className="gallery-bar-inner">
          <div className="gallery-filters" role="tablist" aria-label="Template categories">
            {TEMPLATE_CATEGORIES.map(c => (
              <button
                key={c}
                className={`gallery-filter ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
                aria-selected={category === c}
                role="tab"
              >
                <FormatGlyph name={c} size="micro" /> {c}
              </button>
            ))}
          </div>
          <div className="gallery-search">
            <EditrimIcon name="search" size={15} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search templates"
              aria-label="Search templates"
            />
          </div>
        </div>
      </div>

      <div className="gallery-body">
        <div className="gallery-count">
          {results.length} {results.length === 1 ? 'template' : 'templates'}
          {category !== 'All' ? ` in ${category}` : ''}
          {query ? ` matching “${query}”` : ''}
        </div>

        {results.length > 0 ? (
          <div className="gallery-grid" key={category}>
            {results.map(t => (
              <TemplateCard key={t.id} template={t} to={`/editor/new?template=${t.id}`} lazy />
            ))}
          </div>
        ) : (
          <div className="gallery-empty">
            <h3>Nothing here yet.</h3>
            <p>Try another category or a different search. Or start with a blank canvas.</p>
            <button className="btn btn-primary" onClick={() => { setQuery(''); setCategory('All'); }} style={{ marginTop: 18 }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="gallery-cta">
        <div>
          <h2>Can’t find the right starting point?</h2>
          <p>Open a blank canvas at any size, or let us pick a template at random.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={surprise}>
            <EditrimIcon name="shuffle" size={15} /> Surprise me
          </button>
          <Link to="/editor/new" className="btn btn-primary">
            Start from blank <EditrimIcon name="arrowUpRight" size={16} />
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
