import { useId } from 'react';
import type { CSSProperties } from 'react';
import type { Background, El, ImageElement, Paint, ShapeElement, TextElement } from '../lib/types';
import { FONT_CSS_STACK } from '../lib/fonts';
import { iconById } from '../lib/icons';
import { paintToCss, shadowToCss } from '../lib/render';
import { useResolvedSrc } from '../hooks/useResolvedSrc';

function shapePath(el: ShapeElement): string {
  const { w, h, shape } = el;
  switch (shape) {
    case 'triangle':
      return `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`;
    case 'diamond':
      return `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`;
    case 'hexagon':
      return `M ${w * 0.25} 0 L ${w * 0.75} 0 L ${w} ${h / 2} L ${w * 0.75} ${h} L ${w * 0.25} ${h} L 0 ${h / 2} Z`;
    case 'arrow':
      return `M 0 ${h * 0.3} L ${w * 0.64} ${h * 0.3} L ${w * 0.64} 0 L ${w} ${h / 2} L ${w * 0.64} ${h} L ${w * 0.64} ${h * 0.7} L 0 ${h * 0.7} Z`;
    case 'wave':
      return `M 0 ${h * 0.35} C ${w * 0.25} 0 ${w * 0.4} ${h * 0.7} ${w * 0.62} ${h * 0.35} C ${w * 0.78} ${h * 0.1} ${w * 0.88} ${h * 0.3} ${w} ${h * 0.22} L ${w} ${h} L 0 ${h} Z`;
    case 'blob':
      return `M ${w / 2} 0 C ${w * 0.83} 0 ${w} ${h * 0.275} ${w * 0.96} ${h * 0.54} C ${w * 0.92} ${h * 0.81} ${w * 0.7} ${h} ${w * 0.48} ${h * 0.97} C ${w * 0.22} ${h * 0.94} 0 ${h * 0.72} ${w * 0.02} ${h * 0.49} C ${w * 0.04} ${h * 0.24} ${w * 0.26} 0 ${w / 2} 0 Z`;
    case 'heart':
      return `M ${w / 2} ${h * 0.96} C ${w * 0.02} ${h * 0.66} 0 ${h * 0.14} ${w * 0.26} ${h * 0.1} C ${w * 0.4} ${h * 0.06} ${w * 0.47} ${h * 0.2} ${w / 2} ${h * 0.3} C ${w * 0.53} ${h * 0.2} ${w * 0.6} ${h * 0.06} ${w * 0.74} ${h * 0.1} C ${w} ${h * 0.14} ${w * 0.98} ${h * 0.66} ${w / 2} ${h * 0.96} Z`;
    case 'ring': {
      const orx = w / 2;
      const ory = h / 2;
      const irx = w * 0.31;
      const iry = h * 0.31;
      return `M 0 ${h / 2} a ${orx} ${ory} 0 1 0 ${w} 0 a ${orx} ${ory} 0 1 0 ${-w} 0 Z M ${w / 2 - irx} ${h / 2} a ${irx} ${iry} 0 1 1 ${irx * 2} 0 a ${irx} ${iry} 0 1 1 ${-irx * 2} 0 Z`;
    }
    default:
      return '';
  }
}

function starPoints(w: number, h: number, points = 5, inner = 0.42) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? 1 : inner;
    pts.push(`${w / 2 + Math.cos(a) * (w / 2) * rr},${h / 2 + Math.sin(a) * (h / 2) * rr}`);
  }
  return pts.join(' ');
}

function burstPoints(w: number, h: number, points = 12) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? 1 : 0.76;
    pts.push(`${w / 2 + Math.cos(a) * (w / 2) * rr},${h / 2 + Math.sin(a) * (h / 2) * rr}`);
  }
  return pts.join(' ');
}

function PaintFill({ paint, id }: { paint: Paint; id: string }) {
  if (paint.kind === 'none') return null;
  if (paint.kind === 'solid') return null;
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0" gradientTransform={`rotate(${paint.angle - 90} .5 .5)`}>
        <stop offset="0" stopColor={paint.from} />
        <stop offset="1" stopColor={paint.to} />
      </linearGradient>
    </defs>
  );
}

export function ShapeView({ el }: { el: ShapeElement }) {
  const rawId = useId();
  const gid = `g${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const fill = el.fill.kind === 'linear' ? `url(#${gid})` : el.fill.kind === 'solid' ? el.fill.color : 'none';
  const stroke = el.stroke === 'transparent' ? 'none' : el.stroke;
  const common = {
    fill,
    stroke,
    strokeWidth: el.strokeWidth || 0,
    strokeDasharray: el.dash ? `${(el.strokeWidth || 2) * 3} ${(el.strokeWidth || 2) * 2}` : undefined,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };
  const shadow = el.shadow ? { filter: `drop-shadow(${shadowToCss(el.shadow)})` } : undefined;

  let node;
  if (el.shape === 'rect') {
    node = <rect width={el.w} height={el.h} rx={el.radius} {...common} />;
  } else if (el.shape === 'ellipse') {
    node = <ellipse cx={el.w / 2} cy={el.h / 2} rx={el.w / 2} ry={el.h / 2} {...common} />;
  } else if (el.shape === 'line') {
    node = (
      <line
        x1={0}
        y1={el.h / 2}
        x2={el.w}
        y2={el.h / 2}
        stroke={el.stroke === 'transparent' ? (el.fill.kind === 'solid' ? el.fill.color : '#14130F') : el.stroke}
        strokeWidth={el.strokeWidth || Math.max(1, el.h)}
        strokeLinecap="round"
        strokeDasharray={el.dash ? `${(el.strokeWidth || 2) * 3} ${(el.strokeWidth || 2) * 2}` : undefined}
      />
    );
  } else if (el.shape === 'star') {
    node = <polygon points={starPoints(el.w, el.h)} {...common} />;
  } else if (el.shape === 'burst') {
    node = <polygon points={burstPoints(el.w, el.h)} {...common} />;
  } else if (el.shape === 'ring') {
    node = <path d={shapePath(el)} fillRule="evenodd" {...common} />;
  } else {
    node = <path d={shapePath(el)} {...common} />;
  }

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${el.w} ${el.h}`} preserveAspectRatio="none" style={shadow} aria-hidden="true">
      <PaintFill paint={el.fill} id={gid} />
      {node}
    </svg>
  );
}

function TextView({ el }: { el: TextElement }) {
  const justify = el.valign === 'middle' ? 'center' : el.valign === 'bottom' ? 'flex-end' : 'flex-start';
  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: justify,
    background: el.background && el.background.kind !== 'none' ? paintToCss(el.background) : undefined,
    borderRadius: el.backgroundRadius || 0,
    padding: el.padding || 0,
    boxSizing: 'border-box',
    fontFamily: FONT_CSS_STACK(el.fontFamily),
    fontSize: el.fontSize,
    fontWeight: el.fontWeight,
    fontStyle: el.italic ? 'italic' : 'normal',
    color: el.color,
    lineHeight: el.lineHeight,
    letterSpacing: el.letterSpacing,
    textAlign: el.align,
    textTransform: el.uppercase ? 'uppercase' : 'none',
    textDecoration: el.underline ? 'underline' : 'none',
    textShadow: el.shadow ? `${el.shadow.x}px ${el.shadow.y}px ${el.shadow.blur}px ${el.shadow.color}` : undefined,
    WebkitTextStroke: el.strokeWidth ? `${el.strokeWidth}px ${el.strokeColor}` : undefined,
    overflow: 'visible',
  };
  return (
    <div style={style}>
      <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', width: '100%' }}>
        {el.text}
      </span>
    </div>
  );
}

function imageClipPath(el: ImageElement): string {
  const mask = el.mask ?? 'none';
  if (mask === 'none') return `inset(0 round ${el.radius}px)`;
  if (mask === 'ellipse') return 'ellipse(50% 50% at 50% 50%)';
  if (mask === 'star') {
    const points = starPoints(el.w, el.h)
      .split(' ')
      .map(pair => pair.split(',').map(Number))
      .map(([x, y]) => `${x} ${y}`);
    return `path('M ${points.join(' L ')} Z')`;
  }
  const path = shapePath({ w: el.w, h: el.h, shape: mask } as ShapeElement);
  return path ? `path('${path}')` : `inset(0 round ${el.radius}px)`;
}

function ImageView({ el }: { el: ImageElement }) {
  const src = useResolvedSrc(el.src);
  const f = el.filters;
  const zoom = Math.max(1, el.zoom ?? 1);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: el.radius,
        clipPath: imageClipPath(el),
        overflow: 'hidden',
        background: '#e9e6dd',
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: el.fit,
            filter: `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hue}deg)`,
            transform: `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1}) scale(${zoom}) translate(${(el.offsetX ?? 0) * 100}%, ${(el.offsetY ?? 0) * 100}%)`,
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#a7a195', fontSize: 13 }}>
          Loading image…
        </div>
      )}
      {el.overlay && el.overlayOpacity ? (
        <div style={{ position: 'absolute', inset: 0, background: el.overlay, opacity: el.overlayOpacity }} />
      ) : null}
    </div>
  );
}

export function ElementView({ el }: { el: El }) {
  if (el.type === 'text') return <TextView el={el} />;
  if (el.type === 'shape') return <ShapeView el={el} />;
  if (el.type === 'image') return <ImageView el={el} />;

  const icon = iconById(el.icon);
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke={el.color} strokeWidth={el.strokeWidth ?? 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icon.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export function PageBackground({ bg }: { bg: Background }) {
  const src = useResolvedSrc(bg.kind === 'image' ? bg.src : undefined);
  if (bg.kind === 'solid') {
    return <div style={{ position: 'absolute', inset: 0, background: bg.color }} />;
  }
  if (bg.kind === 'linear') {
    return <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` }} />;
  }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#e7e4dc' }}>
      {src && (
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: bg.fit ?? 'cover',
            filter: bg.blur ? `blur(${bg.blur}px)` : undefined,
            transform: bg.blur ? 'scale(1.04)' : undefined,
          }}
        />
      )}
      {bg.overlay && <div style={{ position: 'absolute', inset: 0, background: bg.overlay, opacity: bg.overlayOpacity ?? 0.4 }} />}
    </div>
  );
}
