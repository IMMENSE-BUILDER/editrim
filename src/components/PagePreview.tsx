import { useEffect, useRef, useState } from 'react';
import type { DesignSize, El, Page } from '../lib/types';
import { ElementView, PageBackground } from './ElementView';

export function PagePreview({
  page,
  size,
  className = '',
  ariaLabel,
}: {
  page: Page;
  size: DesignSize;
  className?: string;
  ariaLabel?: string;
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
            <PreviewElement key={el.id} el={el} />
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewElement({ el }: { el: El }) {
  if (el.hidden) return null;
  const filter =
    el.type === 'image' || el.type === 'icon'
      ? el.shadow
        ? `drop-shadow(${el.shadow.x}px ${el.shadow.y}px ${el.shadow.blur}px ${el.shadow.color})`
        : undefined
      : undefined;
  return (
    <div
      style={{
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.w,
        height: el.h,
        transform: `rotate(${el.rotation}deg)`,
        opacity: el.opacity,
        filter,
      }}
    >
      <ElementView el={el} />
    </div>
  );
}
