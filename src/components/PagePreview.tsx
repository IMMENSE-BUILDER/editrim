import { useEffect, useRef, useState } from 'react';
import type { DesignSize, El, Page } from '../lib/types';
import { animState } from '../lib/animation';
import { ElementView, PageBackground } from './ElementView';

export function PagePreview({
  page,
  size,
  className = '',
  ariaLabel,
  time,
  interactiveLinks,
  onNavigatePage,
}: {
  page: Page;
  size: DesignSize;
  className?: string;
  ariaLabel?: string;
  time?: number;
  interactiveLinks?: boolean;
  onNavigatePage?: (pageId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(w);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const scale = width ? width / size.width : 0;

  return (
    <div
      ref={ref}
      className={`page-preview ${className}`}
      style={{ aspectRatio: `${size.width} / ${size.height}` }}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      {scale > 0 && (
        <div
          className="page-preview-scaler"
          style={{ width: size.width, height: size.height, transform: `scale(${scale})` }}
        >
          <PageBackground bg={page.background} />
          {page.elements.map(el => (
            <PreviewElement
              key={el.id}
              el={el}
              page={page}
              time={time}
              interactiveLinks={interactiveLinks}
              onNavigatePage={onNavigatePage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewElement({
  el,
  page,
  time,
  interactiveLinks,
  onNavigatePage,
}: {
  el: El;
  page: Page;
  time?: number;
  interactiveLinks?: boolean;
  onNavigatePage?: (pageId: string) => void;
}) {
  if (el.hidden) return null;
  const a = time !== undefined ? animState(el, time, page.duration ?? 5) : null;
  const renderedEl: El =
    a?.chars !== undefined && el.type === 'text' ? { ...el, text: el.text.slice(0, a.chars) } : el;
  const baseFilter =
    el.type === 'image' || el.type === 'icon'
      ? el.shadow
        ? `drop-shadow(${el.shadow.x}px ${el.shadow.y}px ${el.shadow.blur}px ${el.shadow.color})`
        : ''
      : '';
  const blurFilter = a && a.blur > 0.1 ? `blur(${a.blur.toFixed(1)}px)` : '';
  const filter = [baseFilter, blurFilter].filter(Boolean).join(' ') || undefined;
  const clipPath = a && a.clipX < 0.999 ? `inset(0 ${((1 - a.clipX) * 100).toFixed(2)}% 0 0)` : undefined;
  const opacity = (el.opacity ?? 1) * (a ? a.opacity : 1);
  const transform = a
    ? `translate(${a.dx}px, ${a.dy}px) rotate(${el.rotation + a.rotate}deg) scale(${a.scale})`
    : `rotate(${el.rotation}deg)`;

  return (
    <div
      style={{
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.w,
        height: el.h,
        transform,
        opacity,
        filter,
        clipPath,
      }}
    >
      <ElementView el={renderedEl} page={page} />
      {interactiveLinks && el.link && (el.link.url || el.link.pageId) && (
        el.link.pageId && onNavigatePage ? (
          <button
            type="button"
            className="pv-link-hit"
            onClick={() => onNavigatePage(el.link!.pageId!)}
            aria-label={`Go to page`}
          />
        ) : el.link.url ? (
          <a
            href={el.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pv-link-hit"
            aria-label={`Open ${el.link.url}`}
          />
        ) : null
      )}
    </div>
  );
}
