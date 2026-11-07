import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Template } from '../lib/types';
import { PagePreview } from './PagePreview';
import { FormatGlyph } from './FormatGlyph';

export function TemplateCard({
  template,
  to,
  showMeta = true,
  className = '',
  stack = false,
  lazy = false,
}: {
  template: Template;
  to: string;
  showMeta?: boolean;
  className?: string;
  stack?: boolean;
  lazy?: boolean;
}) {
  const isLarge = className.includes('is-large');
  const stackable = stack || (template.pages.length > 1 && template.size.width > template.size.height);
  const frameRatio = isLarge ? 1.6 : 0.8;
  const pageRatio = template.size.width / template.size.height;
  const artWidth = Math.min(100, (86 * pageRatio) / frameRatio);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [previewReady, setPreviewReady] = useState(!lazy);

  useEffect(() => {
    if (!lazy || previewReady) return;
    const node = cardRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setPreviewReady(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setPreviewReady(true);
        observer.disconnect();
      }
    }, { rootMargin: '900px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy, previewReady]);

  return (
    <Link ref={cardRef} to={to} className={`template-card ${className}`} aria-label={`${template.name} template`}>
      <div className="template-card-preview">
        {!previewReady ? (
          <span className="template-preview-placeholder" aria-hidden="true" />
        ) : stackable ? (
          <div className="template-stack">
            {template.pages.slice(0, 3).map((p, i) => {
              const transforms = [
                'rotate(-1deg) translate(0, 0)',
                'rotate(5deg) translate(18px, 62px)',
                'rotate(-6deg) translate(-18px, -62px)',
              ];
              return (
                <div key={p.id} style={{ transform: transforms[i], zIndex: 3 - i }}>
                  <PagePreview page={p} size={template.size} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="template-card-art" style={{ width: `${artWidth}%` }}>
            <PagePreview page={template.pages[0]} size={template.size} />
          </div>
        )}
        <span className="template-card-hover">Use template</span>
        {template.pages.length > 1 && <span className="template-pages">{template.pages.length} pages</span>}
      </div>
      {showMeta && (
        <div className="template-card-meta">
          <div>
            <div className="template-card-name">{template.name}</div>
            <div className="template-card-cat"><FormatGlyph name={template.category} size="xs" /> {template.category}</div>
          </div>
          <span className="template-card-size">{template.size.width} × {template.size.height}</span>
        </div>
      )}
    </Link>
  );
}
