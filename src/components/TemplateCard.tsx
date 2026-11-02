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
}: {
  template: Template;
  to: string;
  showMeta?: boolean;
  className?: string;
  stack?: boolean;
}) {
  const isLarge = className.includes('is-large');
  const stackable = stack || (template.pages.length > 1 && template.size.width > template.size.height);
  const frameRatio = isLarge ? 1.6 : 0.8;
  const pageRatio = template.size.width / template.size.height;
  const artWidth = Math.min(100, (86 * pageRatio) / frameRatio);

  return (
    <Link to={to} className={`template-card ${className}`} aria-label={`${template.name} template`}>
      <div className="template-card-preview">
        {stackable ? (
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
