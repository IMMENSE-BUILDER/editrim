import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GlassButton, GlassTabs } from '@/components/liquid-glass';
import { RangeSlider } from '@/components/liquid-glass/controls/RangeSlider';
import { EditrimIcon } from './EditrimIcon';
import { Modal } from './Modal';

export type MagicBrushMode = 'erase' | 'grab';

export function MagicBrushModal({
  open,
  onClose,
  imageSrc,
  mode,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  mode: MagicBrushMode;
  onApply: (mask: Uint8ClampedArray, width: number, height: number) => Promise<void> | void;
}) {
  const displayRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const drawingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);

  const [size, setSize] = useState<{ w: number; h: number }>({ w: 640, h: 480 });
  const [brushSize, setBrushSize] = useState(36);
  const [tool, setTool] = useState<'paint' | 'unpaint'>('paint');
  const [hasStrokes, setHasStrokes] = useState(false);
  const [busy, setBusy] = useState(false);

  const redrawOverlay = () => {
    const disp = displayRef.current;
    const mask = maskCanvasRef.current;
    if (!disp || !mask) return;
    const dctx = disp.getContext('2d')!;
    dctx.clearRect(0, 0, disp.width, disp.height);
    dctx.save();
    dctx.globalAlpha = 0.55;
    dctx.drawImage(mask, 0, 0);
    dctx.restore();
  };

  useEffect(() => {
    if (!open || !imageSrc) return;
    setBusy(false);
    setHasStrokes(false);
    setTool('paint');
    historyRef.current = [];
    let cancelled = false;
    const img = new Image();
    img.src = imageSrc;
    img.decode()
      .then(() => {
        if (cancelled) return;
        const maxSide = 960;
        const scale = Math.min(1, maxSide / Math.max(1, img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        setSize({ w, h });
        const mask = document.createElement('canvas');
        mask.width = w;
        mask.height = h;
        maskCanvasRef.current = mask;
        requestAnimationFrame(() => redrawOverlay());
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, imageSrc]);

  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / Math.max(1, rect.width)) * size.w,
      y: ((e.clientY - rect.top) / Math.max(1, rect.height)) * size.h,
    };
  };

  const paintSegment = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const ctx = mask.getContext('2d')!;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    if (tool === 'unpaint') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = mode === 'grab' ? '#2440F0' : '#EF4444';
    }
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
    redrawOverlay();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const mask = maskCanvasRef.current;
    if (!mask || busy) return;
    const ctx = mask.getContext('2d')!;
    historyRef.current.push(ctx.getImageData(0, 0, mask.width, mask.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pt = toCanvasPoint(e);
    lastPtRef.current = pt;
    paintSegment(pt, { x: pt.x + 0.01, y: pt.y + 0.01 });
    setHasStrokes(true);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastPtRef.current) return;
    const pt = toCanvasPoint(e);
    paintSegment(lastPtRef.current, pt);
    lastPtRef.current = pt;
  };

  const onUp = () => {
    drawingRef.current = false;
    lastPtRef.current = null;
  };

  const undo = () => {
    const mask = maskCanvasRef.current;
    const prev = historyRef.current.pop();
    if (!mask || !prev) return;
    mask.getContext('2d')!.putImageData(prev, 0, 0);
    redrawOverlay();
    setHasStrokes(historyRef.current.length > 0);
  };

  const clear = () => {
    const mask = maskCanvasRef.current;
    if (!mask) return;
    mask.getContext('2d')!.clearRect(0, 0, mask.width, mask.height);
    historyRef.current = [];
    redrawOverlay();
    setHasStrokes(false);
  };

  const submit = async () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const data = maskCanvas.getContext('2d')!.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    const binary = new Uint8ClampedArray(maskCanvas.width * maskCanvas.height);
    let any = false;
    for (let i = 0; i < binary.length; i++) {
      const a = data[i * 4 + 3];
      if (a > 10) {
        binary[i] = 255;
        any = true;
      }
    }
    if (!any) return;
    setBusy(true);
    try {
      await onApply(binary, maskCanvas.width, maskCanvas.height);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'grab' ? 'Magic Grab — Brush subject' : 'Magic Eraser — Brush object to remove'}
      subtitle={
        mode === 'grab'
          ? 'Paint over the subject to lift it into a separate editable layer.'
          : 'Paint over objects or blemishes to heal them from surrounding pixels.'
      }
      width={780}
      footer={
        <>
          <GlassButton material="clear" size="sm" onClick={onClose} disabled={busy}>Cancel</GlassButton>
          <GlassButton
            material="tinted"
            size="sm"
            className="bg-[#2440F0] text-white"
            onClick={submit}
            disabled={busy || !hasStrokes}
            icon={busy ? <Loader2 size={14} className="spin" /> : <EditrimIcon name="magic" size={14} />}
            iconPosition="start"
          >
            {busy ? 'Processing…' : mode === 'grab' ? 'Lift subject' : 'Erase & heal'}
          </GlassButton>
        </>
      }
    >
      <div className="magic-brush-bar">
        <GlassTabs
          aria-label="Brush tool"
          size="sm"
          value={tool}
          onValueChange={v => setTool(v as 'paint' | 'unpaint')}
          options={[
            { value: 'paint', label: 'Brush' },
            { value: 'unpaint', label: 'Restore' },
          ]}
        />
        <div className="magic-brush-slider">
          <span>Size</span>
          <div className="w-32">
            <RangeSlider
              label=""
              showValue={false}
              size="sm"
              color="#2440F0"
              min={8}
              max={120}
              step={2}
              value={brushSize}
              onChange={setBrushSize}
            />
          </div>
          <small>{brushSize}px</small>
        </div>
        <div className="magic-brush-actions">
          <GlassButton material="clear" size="sm" onClick={undo} disabled={busy || !hasStrokes}>Undo</GlassButton>
          <GlassButton material="clear" size="sm" onClick={clear} disabled={busy || !hasStrokes}>Clear</GlassButton>
        </div>
      </div>

      <div className="magic-brush-stage">
        <div className="magic-brush-frame" style={{ aspectRatio: `${size.w} / ${size.h}` }}>
          <img src={imageSrc} alt="" draggable={false} />
          <canvas
            ref={displayRef}
            width={size.w}
            height={size.h}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        </div>
      </div>
    </Modal>
  );
}
