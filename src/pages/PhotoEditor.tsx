import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Brand';
import { EditrimIcon } from '../components/EditrimIcon';
import type { EditrimIconName } from '../components/EditrimIcon';
import { useToast } from '../components/Toast';
import { clamp, downloadBlob, safeFilename } from '../lib/utils';
import { FONTS } from '../lib/fonts';
import {
  computeHistogram,
  exportPhotoBlob,
  outputDimensions,
  renderPhotoToCanvas,
  rotatedDimensions,
  type HistogramData,
  type PhotoExportFormat,
} from '../lib/photo/render';
import { loadPhotoSession, savePhotoSession, savePhotoSource } from '../lib/photo/storage';
import {
  DEFAULT_ADJUSTMENTS,
  FILTER_PRESETS,
  PHOTO_ASPECTS,
  aspectRatio,
  centeredCropForAspect,
  createTextLayer,
  dragCropToPointer,
  translateCrop,
  type CropHandle,
  type PhotoAdjustments,
  type PhotoAspectId,
  type PhotoCrop,
  type PhotoFilterId,
  type PhotoSettings,
  type PhotoTextLayer,
} from '../lib/photo/types';
import '../styles/photo.css';

type Mode = 'adjust' | 'crop' | 'filters' | 'text';

const PREVIEW_MAX = 1400;
const DRAFT_MAX = 880;

const MODES: { id: Mode; label: string; icon: EditrimIconName }[] = [
  { id: 'adjust', label: 'Adjust', icon: 'sliders' },
  { id: 'crop', label: 'Crop', icon: 'crop' },
  { id: 'filters', label: 'Filters', icon: 'palette' },
  { id: 'text', label: 'Text', icon: 'text' },
];

const ADJUSTMENT_GROUPS: {
  title: string;
  icon: EditrimIconName;
  items: { key: keyof PhotoAdjustments; label: string; min: number; max: number; step: number; digits: number }[];
}[] = [
  {
    title: 'Light',
    icon: 'sun',
    items: [
      { key: 'exposure', label: 'Exposure', min: -3, max: 3, step: 0.05, digits: 2 },
      { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, digits: 0 },
      { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1, digits: 0 },
      { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1, digits: 0 },
      { key: 'whites', label: 'Whites', min: -100, max: 100, step: 1, digits: 0 },
      { key: 'blacks', label: 'Blacks', min: -100, max: 100, step: 1, digits: 0 },
    ],
  },
  {
    title: 'Color',
    icon: 'droplet',
    items: [
      { key: 'temperature', label: 'Temperature', min: -100, max: 100, step: 1, digits: 0 },
      { key: 'tint', label: 'Tint', min: -100, max: 100, step: 1, digits: 0 },
      { key: 'vibrance', label: 'Vibrance', min: -100, max: 100, step: 1, digits: 0 },
      { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, digits: 0 },
    ],
  },
  {
    title: 'Detail',
    icon: 'scan',
    items: [
      { key: 'clarity', label: 'Clarity', min: -100, max: 100, step: 1, digits: 0 },
      { key: 'sharpen', label: 'Sharpen', min: 0, max: 100, step: 1, digits: 0 },
      { key: 'blur', label: 'Blur', min: 0, max: 40, step: 1, digits: 0 },
    ],
  },
  {
    title: 'Effects',
    icon: 'histogram',
    items: [
      { key: 'vignette', label: 'Vignette', min: 0, max: 100, step: 1, digits: 0 },
      { key: 'grain', label: 'Grain', min: 0, max: 100, step: 1, digits: 0 },
      { key: 'fade', label: 'Fade', min: 0, max: 100, step: 1, digits: 0 },
    ],
  },
];

const TEXT_FONTS = ['Inter', 'Bricolage Grotesque', 'Instrument Serif', 'Space Grotesk', 'Bebas Neue', 'Caveat']
  .map(family => FONTS.find(font => font.family === family))
  .filter((font): font is NonNullable<typeof font> => Boolean(font));

const cloneSettings = (settings: PhotoSettings): PhotoSettings => ({
  adjustments: { ...settings.adjustments },
  transform: { ...settings.transform },
  crop: { ...settings.crop },
  filter: settings.filter,
  text: settings.text.map(layer => ({ ...layer })),
});

const freshSettings = (): PhotoSettings => ({
  adjustments: { ...DEFAULT_ADJUSTMENTS },
  transform: { rotate: 0, flipX: false, flipY: false },
  crop: { x: 0, y: 0, w: 1, h: 1 },
  filter: 'original',
  text: [],
});

const formatValue = (value: number, digits: number) => {
  const rounded = digits === 0 ? Math.round(value) : Number(value.toFixed(digits));
  return `${rounded > 0 ? '+' : ''}${digits === 0 ? rounded : rounded.toFixed(digits)}`;
};

const rotateCropClockwise = (crop: PhotoCrop): PhotoCrop => ({
  x: Math.round((1 - crop.y - crop.h) * 1e6) / 1e6,
  y: crop.x,
  w: crop.h,
  h: crop.w,
});

const inferAspect = (settings: PhotoSettings, naturalWidth: number, naturalHeight: number): PhotoAspectId => {
  const { crop } = settings;
  if (crop.w === 1 && crop.h === 1) return 'original';
  const rotated = rotatedDimensions(naturalWidth, naturalHeight, settings.transform.rotate);
  const pixelRatio = (crop.w * rotated.width) / (crop.h * rotated.height);
  const match = PHOTO_ASPECTS.find(item => 'ratio' in item && Math.abs(item.ratio - pixelRatio) < 0.015);
  return match ? match.id : 'free';
};

function Histogram({ data }: { data: HistogramData | null }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || 260;
    const height = canvas.clientHeight || 62;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!data) return;
    const bins = data.luma.length;
    const max = Math.max(1, ...data.luma);
    const channels: [number[], string][] = [
      [data.r, 'rgba(255,90,90,0.55)'],
      [data.g, 'rgba(110,230,140,0.5)'],
      [data.b, 'rgba(110,150,255,0.55)'],
    ];
    ctx.globalCompositeOperation = 'lighter';
    channels.forEach(([binsData, color]) => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      binsData.forEach((value, index) => {
        const x = (index / (bins - 1)) * canvas.width;
        const y = canvas.height - (value / max) * canvas.height * 0.94;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    data.luma.forEach((value, index) => {
      const x = (index / (bins - 1)) * canvas.width;
      const y = canvas.height - (value / max) * canvas.height * 0.9;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(244,241,234,0.7)';
    ctx.lineWidth = Math.max(1, dpr * 0.8);
    ctx.stroke();
  }, [data]);

  return <canvas ref={ref} className="ph-histogram-canvas" aria-label="Histogram" />;
}

function FilterThumb({ image, presetId }: { image: HTMLImageElement; presetId: PhotoFilterId }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const preset = FILTER_PRESETS.find(item => item.id === presetId) ?? FILTER_PRESETS[0];
    const rotated = rotatedDimensions(image.naturalWidth, image.naturalHeight, 0);
    const frame: PhotoSettings = {
      adjustments: { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments },
      transform: { rotate: 0, flipX: false, flipY: false },
      crop: centeredCropForAspect(1, rotated.width, rotated.height),
      filter: presetId,
      text: [],
    };
    const rendered = renderPhotoToCanvas(image, frame, { maxSize: 200 });
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    canvas.getContext('2d')?.drawImage(rendered, 0, 0);
  }, [image, presetId]);

  return <canvas ref={ref} className="ph-filter-canvas" aria-hidden="true" />;
}

export default function PhotoEditor() {
  const { toast } = useToast();
  const [name, setName] = useState('Untitled photo');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<PhotoSettings>(freshSettings);
  const [mode, setMode] = useState<Mode>('adjust');
  const [aspect, setAspect] = useState<PhotoAspectId>('original');
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [histogram, setHistogram] = useState<HistogramData | null>(null);
  const [renderSize, setRenderSize] = useState({ width: 1, height: 1 });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<PhotoExportFormat>('jpeg');
  const [exportQuality, setExportQuality] = useState(0.92);
  const [exportScale, setExportScale] = useState(1);
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const settingsRef = useRef(settings);
  const pastRef = useRef<PhotoSettings[]>([]);
  const futureRef = useRef<PhotoSettings[]>([]);
  const laneRef = useRef<{ key: string | null; at: number }>({ key: null, at: 0 });
  const cropDragRef = useRef<{ handle: CropHandle; startX: number; startY: number; crop: PhotoCrop } | null>(null);
  const textDragRef = useRef<{ id: string; startX: number; startY: number; layer: PhotoTextLayer } | null>(null);

  const syncHistory = useCallback(() => {
    setHistoryState({ canUndo: pastRef.current.length > 0, canRedo: futureRef.current.length > 0 });
  }, []);

  const applySettings = useCallback((next: PhotoSettings, options?: { coalesce?: string }) => {
    const previous = settingsRef.current;
    if (JSON.stringify(previous) === JSON.stringify(next)) return;
    const now = Date.now();
    const lane = options?.coalesce ?? null;
    const continues = lane !== null && laneRef.current.key === lane && now - laneRef.current.at < 700;
    if (!continues) {
      pastRef.current.push(previous);
      if (pastRef.current.length > 80) pastRef.current.shift();
      futureRef.current = [];
    }
    laneRef.current = { key: lane, at: now };
    settingsRef.current = next;
    setSettings(next);
    syncHistory();
  }, [syncHistory]);

  const undo = useCallback(() => {
    const previous = pastRef.current.pop();
    if (!previous) return;
    futureRef.current.push(settingsRef.current);
    laneRef.current = { key: null, at: 0 };
    settingsRef.current = previous;
    setSettings(previous);
    syncHistory();
  }, [syncHistory]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(settingsRef.current);
    laneRef.current = { key: null, at: 0 };
    settingsRef.current = next;
    setSettings(next);
    syncHistory();
  }, [syncHistory]);

  useEffect(() => {
    document.title = 'Photo — Editrim';
    let alive = true;
    (async () => {
      const restored = await loadPhotoSession().catch(() => null);
      if (!alive) {
        if (restored?.src) URL.revokeObjectURL(restored.src);
        return;
      }
      if (!restored?.src) {
        setReady(true);
        return;
      }
      try {
        const img = new Image();
        img.src = restored.src;
        await img.decode();
        if (!alive) {
          URL.revokeObjectURL(restored.src);
          return;
        }
        sourceUrlRef.current = restored.src;
        const restoredSettings = cloneSettings(restored.session.settings);
        setImage(img);
        setSettings(restoredSettings);
        settingsRef.current = restoredSettings;
        setName(restored.session.name || 'Untitled photo');
        setAspect(inferAspect(restoredSettings, img.naturalWidth, img.naturalHeight));
        setSelectedTextId(restoredSettings.text[0]?.id ?? null);
        setSaveState('saved');
      } catch {
        if (alive) toast('Could not reopen the last photo', 'error');
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
  }, []);

  useEffect(() => {
    if (!ready || !image) return;
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      const saved = savePhotoSession({
        name,
        sourceKey: 'current',
        width: image.naturalWidth,
        height: image.naturalHeight,
        settings: settingsRef.current,
        updatedAt: Date.now(),
      });
      setSaveState(saved ? 'saved' : 'error');
    }, 420);
    return () => window.clearTimeout(timer);
  }, [name, settings, image, ready]);

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    let settleTimer = 0;

    const draw = (maxSize: number) => {
      if (cancelled) return;
      const rendered = renderPhotoToCanvas(image, settings, {
        maxSize,
        ignoreCrop: mode === 'crop',
        ignoreText: mode === 'crop',
        original: comparing,
      });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = rendered.width;
      canvas.height = rendered.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, rendered.width, rendered.height);
      ctx.drawImage(rendered, 0, 0);
      setRenderSize({ width: rendered.width, height: rendered.height });
      if (!comparing && (mode === 'adjust' || mode === 'filters')) {
        setHistogram(computeHistogram(rendered));
      }
    };

    const frame = requestAnimationFrame(() => draw(DRAFT_MAX));
    settleTimer = window.setTimeout(() => draw(PREVIEW_MAX), 200);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, [image, settings, comparing, mode]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setStageSize({ width: Math.max(1, width), height: Math.max(1, height) });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [image]);

  const importFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('Choose an image file', 'error');
      return;
    }
    setLoading(true);
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      await savePhotoSource(file).catch(() => undefined);
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = url;
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'Photo';
      const next = freshSettings();
      setImage(img);
      settingsRef.current = next;
      setSettings(next);
      pastRef.current = [];
      futureRef.current = [];
      laneRef.current = { key: null, at: 0 };
      syncHistory();
      setName(baseName);
      setAspect('original');
      setMode('adjust');
      setSelectedTextId(null);
      setSaveState('saved');
      savePhotoSession({
        name: baseName,
        sourceKey: 'current',
        width: img.naturalWidth,
        height: img.naturalHeight,
        settings: next,
        updatedAt: Date.now(),
      });
    } catch {
      toast('Could not open that image', 'error');
    } finally {
      setLoading(false);
    }
  }, [syncHistory, toast]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === '\\') {
        event.preventDefault();
        setComparing(value => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  const rotateImage = (direction: 1 | -1) => {
    if (!image) return;
    const current = settingsRef.current;
    const rotate = ((current.transform.rotate + (direction === 1 ? 90 : 270)) % 360) as 0 | 90 | 180 | 270;
    const rotated = rotatedDimensions(image.naturalWidth, image.naturalHeight, rotate);
    const ratio = aspectRatio(aspect);
    let crop = current.crop;
    if (aspect === 'original') crop = { x: 0, y: 0, w: 1, h: 1 };
    else if (aspect === 'free') crop = direction === 1
      ? rotateCropClockwise(current.crop)
      : rotateCropClockwise(rotateCropClockwise(rotateCropClockwise(current.crop)));
    else crop = centeredCropForAspect(ratio, rotated.width, rotated.height);
    applySettings({
      ...current,
      transform: { ...current.transform, rotate },
      crop,
      text: current.text.map(layer => ({ ...layer })),
    });
  };

  const flipImage = (axis: 'x' | 'y') => {
    const current = settingsRef.current;
    const crop = axis === 'x'
      ? { ...current.crop, x: 1 - current.crop.x - current.crop.w }
      : { ...current.crop, y: 1 - current.crop.y - current.crop.h };
    applySettings({
      ...current,
      transform: {
        ...current.transform,
        flipX: axis === 'x' ? !current.transform.flipX : current.transform.flipX,
        flipY: axis === 'y' ? !current.transform.flipY : current.transform.flipY,
      },
      crop,
    });
  };

  const chooseAspect = (id: PhotoAspectId) => {
    if (!image) return;
    setAspect(id);
    const current = settingsRef.current;
    const rotated = rotatedDimensions(image.naturalWidth, image.naturalHeight, current.transform.rotate);
    const ratio = aspectRatio(id);
    const crop = id === 'original'
      ? { x: 0, y: 0, w: 1, h: 1 }
      : ratio
        ? centeredCropForAspect(ratio, rotated.width, rotated.height)
        : current.crop;
    applySettings({ ...current, crop });
  };

  const pointerPosition = (event: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, rect: null as DOMRect | null };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1),
      y: clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1),
      rect,
    };
  };

  const onCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const handle = (target.closest('[data-handle]')?.getAttribute('data-handle') ?? null) as CropHandle | null;
    if (!handle) return;
    const point = pointerPosition(event);
    cropDragRef.current = { handle, startX: point.x, startY: point.y, crop: { ...settingsRef.current.crop } };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = cropDragRef.current;
    if (!drag || !image) return;
    const point = pointerPosition(event);
    const current = settingsRef.current;
    let crop: PhotoCrop;
    if (drag.handle === 'move') {
      crop = translateCrop(drag.crop, point.x - drag.startX, point.y - drag.startY);
    } else {
      const rotated = rotatedDimensions(image.naturalWidth, image.naturalHeight, current.transform.rotate);
      crop = dragCropToPointer(
        drag.crop,
        drag.handle,
        point.x,
        point.y,
        rotated.width,
        rotated.height,
        aspectRatio(aspect),
      );
    }
    applySettings({ ...current, crop }, { coalesce: 'crop-drag' });
  };

  const endCropDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    cropDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const updateTextLayer = (id: string, patch: Partial<PhotoTextLayer>, coalesce?: string) => {
    const current = settingsRef.current;
    applySettings({
      ...current,
      text: current.text.map(layer => (layer.id === id ? { ...layer, ...patch } : layer)),
    }, coalesce ? { coalesce } : undefined);
  };

  const addText = () => {
    const current = settingsRef.current;
    const layer = createTextLayer('Your text');
    const next = { ...current, text: [...current.text, layer] };
    setMode('text');
    setSelectedTextId(layer.id);
    applySettings(next);
  };

  const removeText = (id: string) => {
    const current = settingsRef.current;
    applySettings({ ...current, text: current.text.filter(layer => layer.id !== id) });
    setSelectedTextId(null);
  };

  const onTextPointerDown = (event: React.PointerEvent<HTMLDivElement>, layer: PhotoTextLayer) => {
    event.stopPropagation();
    const point = pointerPosition(event);
    setSelectedTextId(layer.id);
    setMode('text');
    textDragRef.current = { id: layer.id, startX: point.x, startY: point.y, layer: { ...layer } };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onTextPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = textDragRef.current;
    if (!drag) return;
    const point = pointerPosition(event);
    const x = clamp(drag.layer.x + (point.x - drag.startX), 0, 1);
    const y = clamp(drag.layer.y + (point.y - drag.startY), 0, 1);
    updateTextLayer(drag.id, { x, y }, `text-move-${drag.id}`);
  };

  const endTextDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    textDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const selectedLayer = useMemo(
    () => settings.text.find(layer => layer.id === selectedTextId) ?? null,
    [settings.text, selectedTextId],
  );

  const exportDimensions = useMemo(() => {
    if (!image) return { width: 0, height: 0 };
    return outputDimensions(image, settings, exportScale);
  }, [image, settings, exportScale]);

  const runExport = async () => {
    if (!image || exporting) return;
    setExporting(true);
    try {
      const blob = await exportPhotoBlob(image, settings, exportFormat, exportQuality, exportScale);
      if (!blob) throw new Error('empty export');
      const extension = exportFormat === 'jpeg' ? 'jpg' : exportFormat;
      downloadBlob(blob, `${safeFilename(name || 'photo')}.${extension}`);
      toast('Photo exported');
      setExportOpen(false);
    } catch {
      toast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const resetAll = () => {
    if (!image) return;
    applySettings(freshSettings());
    setAspect('original');
    setSelectedTextId(null);
    toast('Reset');
  };

  const activeAspectRatio = aspectRatio(aspect);
  const fitScale = useMemo(() => {
    if (!stageSize.width || !stageSize.height || renderSize.width <= 1) return 1;
    return Math.min(1, stageSize.width / renderSize.width, stageSize.height / renderSize.height);
  }, [stageSize, renderSize]);
  const displaySize = {
    width: Math.max(1, Math.round(renderSize.width * fitScale)),
    height: Math.max(1, Math.round(renderSize.height * fitScale)),
  };
  const textScale = renderSize.width > 0 ? displaySize.width / renderSize.width : 1;

  return (
    <div
      className="photo-editor"
      data-mode={mode}
      data-ready={image ? 'yes' : 'no'}
      data-crop={JSON.stringify(settings.crop)}
      data-adjustments={JSON.stringify(settings.adjustments)}
      data-filter={settings.filter}
      data-text-count={settings.text.length}
      data-rotate={settings.transform.rotate}
      data-source-width={image?.naturalWidth ?? 0}
      data-source-height={image?.naturalHeight ?? 0}
      data-render-width={renderSize.width}
      data-render-height={renderSize.height}
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) void importFile(file);
      }}
    >
      <header className="ph-header">
        <div className="ph-left">
          <Link to="/dashboard" className="ph-back" title="Back to dashboard"><EditrimIcon name="arrowLeft" size={17} /></Link>
          <span className="ph-logo"><Logo size={26} wordmark={false} /></span>
          <div className="ph-title-wrap">
            <input value={name} onChange={event => setName(event.target.value)} aria-label="Photo name" />
            {image && (
              <span className="ph-save-status" aria-live="polite">
                {saveState === 'saving' ? 'Saving' : saveState === 'error' ? 'Save failed' : 'Saved'}
              </span>
            )}
          </div>
        </div>
        <div className="ph-center">
          <button className="ph-icon-btn" onClick={undo} disabled={!historyState.canUndo} title="Undo" aria-label="Undo"><EditrimIcon name="undo" size={17} /></button>
          <button className="ph-icon-btn" onClick={redo} disabled={!historyState.canRedo} title="Redo" aria-label="Redo"><EditrimIcon name="redo" size={17} /></button>
          <button
            className={`ph-compare ${comparing ? 'is-active' : ''}`}
            onPointerDown={() => setComparing(true)}
            onPointerUp={() => setComparing(false)}
            onPointerLeave={() => setComparing(false)}
            onPointerCancel={() => setComparing(false)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setComparing(true); }}
            onKeyUp={() => setComparing(false)}
            aria-pressed={comparing}
            title="Hold to compare with the original"
          >
            <EditrimIcon name="compare" size={16} /><span>Compare</span>
          </button>
        </div>
        <div className="ph-right">
          <input
            ref={fileInputRef}
            className="ph-file-input"
            type="file"
            accept="image/*"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
              event.target.value = '';
            }}
          />
          <button className="ph-ghost-btn ph-import-btn" onClick={() => fileInputRef.current?.click()}><EditrimIcon name="upload" size={15} /><span>Import</span></button>
          <button className="ph-ghost-btn ph-reset-btn" onClick={resetAll} disabled={!image}><EditrimIcon name="refresh" size={15} /><span>Reset</span></button>
          <button className="ph-export-btn" onClick={() => setExportOpen(true)} disabled={!image}><EditrimIcon name="download" size={15} /><span>Export</span></button>
        </div>
      </header>

      <div className="ph-body">
        <nav className="ph-rail" aria-label="Photo tools">
          {MODES.map(item => (
            <button
              key={item.id}
              className={`ph-rail-btn ${mode === item.id ? 'is-active' : ''}`}
              onClick={() => setMode(item.id)}
              disabled={!image}
              aria-pressed={mode === item.id}
            >
              <EditrimIcon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <main className="ph-stage" ref={stageRef}>
          {!image ? (
            <div className={`ph-empty ${loading ? 'is-loading' : ''}`}>
              <span className="ph-empty-mark"><EditrimIcon name="photo" size={30} /></span>
              <h2>No photo</h2>
              <button className="ph-primary-btn ph-choose" onClick={() => fileInputRef.current?.click()}>
                <EditrimIcon name="upload" size={15} /> Choose photo
              </button>
            </div>
          ) : (
            <div className="ph-frame" style={{ width: `${displaySize.width}px` }}>
              <canvas
                ref={canvasRef}
                className="ph-canvas"
                style={{ width: `${displaySize.width}px`, height: `${displaySize.height}px` }}
                aria-label="Photo preview"
              />
              {mode === 'crop' && (
                <div
                  className="ph-crop-layer"
                  onPointerDown={onCropPointerDown}
                  onPointerMove={onCropPointerMove}
                  onPointerUp={endCropDrag}
                  onPointerCancel={endCropDrag}
                >
                  <div
                    className="ph-crop-box"
                    data-handle="move"
                    style={{
                      left: `${settings.crop.x * 100}%`,
                      top: `${settings.crop.y * 100}%`,
                      width: `${settings.crop.w * 100}%`,
                      height: `${settings.crop.h * 100}%`,
                    }}
                  >
                    <span className="ph-crop-grid" aria-hidden="true" />
                    {(['nw', 'ne', 'sw', 'se'] as const).map(handle => (
                      <span key={handle} className={`ph-crop-handle is-${handle}`} data-handle={handle} />
                    ))}
                  </div>
                </div>
              )}
              {mode === 'text' && (
                <div className="ph-text-overlay">
                  {settings.text.map(layer => (
                    <div
                      key={layer.id}
                      className={`ph-text-box ${selectedTextId === layer.id ? 'is-selected' : ''}`}
                      data-text-id={layer.id}
                      style={{
                        left: `${layer.x * 100}%`,
                        top: `${layer.y * 100}%`,
                        transform: `translate(${layer.align === 'left' ? '0' : layer.align === 'right' ? '-100%' : '-50%'}, -50%) rotate(${layer.rotation}deg)`,
                        transformOrigin: layer.align === 'left' ? '0 50%' : layer.align === 'right' ? '100% 50%' : '50% 50%',
                        fontFamily: `"${layer.fontFamily}", system-ui, sans-serif`,
                        fontSize: `${Math.max(4, layer.size * textScale)}px`,
                        fontWeight: layer.weight,
                        lineHeight: 1.16,
                        textAlign: layer.align,
                      }}
                      onPointerDown={event => onTextPointerDown(event, layer)}
                      onPointerMove={onTextPointerMove}
                      onPointerUp={endTextDrag}
                      onPointerCancel={endTextDrag}
                    >
                      {layer.text || ' '}
                    </div>
                  ))}
                </div>
              )}
              {comparing && <span className="ph-compare-badge">Original</span>}
            </div>
          )}
          {loading && <div className="ph-loading"><span className="ph-spinner" />Loading</div>}
        </main>

        <aside className="ph-inspector">
          <div className="ph-inspector-head">
            <h2>{MODES.find(item => item.id === mode)?.label}</h2>
            <div className="ph-inspector-tools">
              <button className="ph-icon-btn" onClick={() => fileInputRef.current?.click()} title="Import another photo" aria-label="Import another photo"><EditrimIcon name="upload" size={16} /></button>
              <button className="ph-icon-btn" onClick={resetAll} disabled={!image} title="Reset all edits" aria-label="Reset all edits"><EditrimIcon name="refresh" size={16} /></button>
            </div>
          </div>

          <div className="ph-inspector-scroll">
            {image && mode === 'adjust' && (
              <>
                <div className="ph-histogram">
                  <Histogram data={histogram} />
                  <div className="ph-histogram-legend">
                    <span>{image.naturalWidth} × {image.naturalHeight}</span>
                    <span>{settings.filter === 'custom' ? 'Custom' : FILTER_PRESETS.find(item => item.id === settings.filter)?.name ?? 'Original'}</span>
                  </div>
                </div>
                {ADJUSTMENT_GROUPS.map(group => (
                  <section key={group.title} className="ph-section">
                    <h3 className="ph-section-title"><EditrimIcon name={group.icon} size={12} />{group.title}</h3>
                    {group.items.map(item => {
                      const value = settings.adjustments[item.key];
                      return (
                        <div className="ph-range" key={item.key} data-adjustment={item.key}>
                          <span className="ph-range-head">
                            <span>{item.label}</span>
                            <b>{formatValue(value, item.digits)}</b>
                          </span>
                          <input
                            type="range"
                            min={item.min}
                            max={item.max}
                            step={item.step}
                            value={value}
                            onChange={event => {
                              const next = Number(event.target.value);
                              const current = settingsRef.current;
                              applySettings({
                                ...current,
                                filter: 'custom',
                                adjustments: { ...current.adjustments, [item.key]: next },
                              }, { coalesce: `adjust-${item.key}` });
                            }}
                            onDoubleClick={() => {
                              const current = settingsRef.current;
                              applySettings({
                                ...current,
                                adjustments: { ...current.adjustments, [item.key]: DEFAULT_ADJUSTMENTS[item.key] },
                              });
                            }}
                            aria-label={item.label}
                          />
                        </div>
                      );
                    })}
                  </section>
                ))}
                <button
                  className="ph-text-btn"
                  onClick={() => {
                    const current = settingsRef.current;
                    applySettings({ ...current, adjustments: { ...DEFAULT_ADJUSTMENTS }, filter: 'original' });
                  }}
                >
                  Reset adjustments
                </button>
              </>
            )}

            {image && mode === 'crop' && (
              <>
                <section className="ph-section">
                  <h3 className="ph-section-title">Aspect</h3>
                  <div className="ph-aspect-grid">
                    {PHOTO_ASPECTS.map(item => {
                      const active = aspect === item.id;
                      const ratio = 'ratio' in item ? item.ratio : item.id === 'free' ? null : image.naturalWidth / image.naturalHeight;
                      const boxWidth = !ratio ? 20 : ratio >= 1 ? 26 : Math.max(10, 26 * ratio);
                      const boxHeight = !ratio ? 20 : ratio >= 1 ? Math.max(10, 26 / ratio) : 26;
                      return (
                        <button
                          key={item.id}
                          className={`ph-aspect-btn ${active ? 'is-active' : ''}`}
                          onClick={() => chooseAspect(item.id)}
                          aria-pressed={active}
                        >
                          <span className="ph-aspect-shape" style={{ width: boxWidth, height: boxHeight }} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
                <section className="ph-section">
                  <h3 className="ph-section-title">Transform</h3>
                  <div className="ph-btn-row">
                    <button className="ph-tool-btn" onClick={() => rotateImage(-1)} title="Rotate left"><EditrimIcon name="rotate" size={15} /><span>Left</span></button>
                    <button className="ph-tool-btn" onClick={() => rotateImage(1)} title="Rotate right"><EditrimIcon name="rotate" size={15} className="is-flipped" /><span>Right</span></button>
                    <button className={`ph-tool-btn ${settings.transform.flipX ? 'is-active' : ''}`} onClick={() => flipImage('x')} title="Flip horizontal"><EditrimIcon name="flipX" size={15} /><span>Flip X</span></button>
                    <button className={`ph-tool-btn ${settings.transform.flipY ? 'is-active' : ''}`} onClick={() => flipImage('y')} title="Flip vertical"><EditrimIcon name="flipY" size={15} /><span>Flip Y</span></button>
                  </div>
                </section>
                <section className="ph-section">
                  <h3 className="ph-section-title">Crop</h3>
                  <div className="ph-metric-row">
                    <span>Width</span><b>{Math.round(settings.crop.w * 100)}%</b>
                    <span>Height</span><b>{Math.round(settings.crop.h * 100)}%</b>
                  </div>
                  <div className="ph-btn-row ph-btn-row-spaced">
                    <button className="ph-tool-btn" onClick={() => chooseAspect('original')}><EditrimIcon name="fit" size={15} /><span>Full</span></button>
                    <button className="ph-primary-btn" onClick={() => setMode('adjust')}><EditrimIcon name="check" size={15} /><span>Apply</span></button>
                  </div>
                </section>
                {activeAspectRatio && (
                  <p className="ph-note">Locked to {PHOTO_ASPECTS.find(item => item.id === aspect)?.label}</p>
                )}
              </>
            )}

            {image && mode === 'filters' && (
              <section className="ph-section">
                <h3 className="ph-section-title">Presets</h3>
                <div className="ph-filter-grid">
                  {FILTER_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      className={`ph-filter-tile ${settings.filter === preset.id ? 'is-active' : ''}`}
                      onClick={() => {
                        const current = settingsRef.current;
                        applySettings({
                          ...current,
                          filter: preset.id,
                          adjustments: { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments },
                        });
                      }}
                      aria-pressed={settings.filter === preset.id}
                    >
                      <span className="ph-filter-thumb">
                        <FilterThumb image={image} presetId={preset.id} />
                        {settings.filter === preset.id && <span className="ph-filter-check"><EditrimIcon name="check" size={12} /></span>}
                      </span>
                      <span className="ph-filter-name">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {image && mode === 'text' && (
              <>
                <section className="ph-section">
                  <div className="ph-section-head">
                    <h3 className="ph-section-title">Layers</h3>
                    <button className="ph-text-btn ph-add-text" onClick={addText}><EditrimIcon name="plus" size={13} /> Add text</button>
                  </div>
                  {settings.text.length === 0 ? (
                    <p className="ph-panel-empty">No text layers.</p>
                  ) : (
                    <div className="ph-text-list">
                      {settings.text.map(layer => (
                        <div
                          key={layer.id}
                          className={`ph-text-item ${selectedTextId === layer.id ? 'is-active' : ''}`}
                          onClick={() => setSelectedTextId(layer.id)}
                        >
                          <EditrimIcon name="text" size={13} />
                          <span>{layer.text || 'Empty'}</span>
                          <button onClick={event => { event.stopPropagation(); removeText(layer.id); }} aria-label="Delete text"><EditrimIcon name="trash" size={13} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {selectedLayer ? (
                  <>
                    <section className="ph-section">
                      <h3 className="ph-section-title">Content</h3>
                      <textarea
                        className="ph-textarea"
                        value={selectedLayer.text}
                        onChange={event => updateTextLayer(selectedLayer.id, { text: event.target.value }, `text-content-${selectedLayer.id}`)}
                        rows={2}
                        aria-label="Text content"
                      />
                      <div className="ph-text-grid">
                        <label className="ph-field">
                          <span>Font</span>
                          <select
                            value={selectedLayer.fontFamily}
                            onChange={event => updateTextLayer(selectedLayer.id, { fontFamily: event.target.value })}
                          >
                            {TEXT_FONTS.map(font => <option key={font.family} value={font.family}>{font.label}</option>)}
                          </select>
                        </label>
                        <label className="ph-field">
                          <span>Weight</span>
                          <select
                            value={selectedLayer.weight}
                            onChange={event => updateTextLayer(selectedLayer.id, { weight: Number(event.target.value) })}
                          >
                            {[400, 500, 600, 700, 800].map(weight => <option key={weight} value={weight}>{weight}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="ph-text-grid">
                        <label className="ph-field">
                          <span>Size</span>
                          <input
                            type="number"
                            min={8}
                            max={400}
                            value={selectedLayer.size}
                            onChange={event => updateTextLayer(selectedLayer.id, { size: clamp(Number(event.target.value) || 8, 8, 400) }, `text-size-${selectedLayer.id}`)}
                          />
                        </label>
                        <label className="ph-field ph-field-color">
                          <span>Color</span>
                          <span className="ph-color-wrap">
                            <input
                              type="color"
                              value={selectedLayer.color}
                              onChange={event => updateTextLayer(selectedLayer.id, { color: event.target.value }, `text-color-${selectedLayer.id}`)}
                            />
                            <code>{selectedLayer.color.toUpperCase()}</code>
                          </span>
                        </label>
                      </div>
                    </section>

                    <section className="ph-section">
                      <h3 className="ph-section-title">Layout</h3>
                      <div className="ph-align-row">
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button
                            key={align}
                            className={`ph-tool-btn ${selectedLayer.align === align ? 'is-active' : ''}`}
                            onClick={() => updateTextLayer(selectedLayer.id, { align })}
                            aria-label={`Align ${align}`}
                          >
                            <EditrimIcon name={align === 'left' ? 'alignLeft' : align === 'right' ? 'alignRight' : 'alignCenter'} size={15} />
                          </button>
                        ))}
                      </div>
                      <div className="ph-range">
                        <span className="ph-range-head"><span>Rotation</span><b>{Math.round(selectedLayer.rotation)}°</b></span>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={selectedLayer.rotation}
                          onChange={event => updateTextLayer(selectedLayer.id, { rotation: Number(event.target.value) }, `text-rotation-${selectedLayer.id}`)}
                          aria-label="Text rotation"
                        />
                      </div>
                      <div className="ph-range">
                        <span className="ph-range-head"><span>Opacity</span><b>{Math.round(selectedLayer.opacity * 100)}%</b></span>
                        <input
                          type="range"
                          min={0.05}
                          max={1}
                          step={0.01}
                          value={selectedLayer.opacity}
                          onChange={event => updateTextLayer(selectedLayer.id, { opacity: Number(event.target.value) }, `text-opacity-${selectedLayer.id}`)}
                          aria-label="Text opacity"
                        />
                      </div>
                      <label className="ph-field">
                        <span>Horizontal</span>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.005}
                          value={selectedLayer.x}
                          onChange={event => updateTextLayer(selectedLayer.id, { x: Number(event.target.value) }, `text-x-${selectedLayer.id}`)}
                          aria-label="Text horizontal position"
                        />
                      </label>
                      <label className="ph-field">
                        <span>Vertical</span>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.005}
                          value={selectedLayer.y}
                          onChange={event => updateTextLayer(selectedLayer.id, { y: Number(event.target.value) }, `text-y-${selectedLayer.id}`)}
                          aria-label="Text vertical position"
                        />
                      </label>
                    </section>
                  </>
                ) : (
                  <p className="ph-panel-empty">No layer selected.</p>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {exportOpen && (
        <div className="ph-export-overlay" role="dialog" aria-modal="true" aria-label="Export photo">
          <div className="ph-export-card">
            <div className="ph-export-head">
              <h2>Export</h2>
              <button className="ph-icon-btn" onClick={() => setExportOpen(false)} aria-label="Close export"><EditrimIcon name="close" size={16} /></button>
            </div>

            <div className="ph-export-field">
              <span>Format</span>
              <div className="ph-seg">
                {(['jpeg', 'png', 'webp'] as PhotoExportFormat[]).map(format => (
                  <button
                    key={format}
                    className={exportFormat === format ? 'is-active' : ''}
                    onClick={() => setExportFormat(format)}
                  >
                    {format === 'jpeg' ? 'JPEG' : format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="ph-export-field">
              <span>Size</span>
              <div className="ph-seg">
                {[1, 0.5].map(scale => (
                  <button
                    key={scale}
                    className={exportScale === scale ? 'is-active' : ''}
                    onClick={() => setExportScale(scale)}
                  >
                    {scale === 1 ? 'Full' : 'Half'}
                  </button>
                ))}
              </div>
            </div>

            {exportFormat !== 'png' && (
              <div className="ph-export-field">
                <span>Quality</span>
                <div className="ph-range">
                  <span className="ph-range-head"><span>Compression</span><b>{Math.round(exportQuality * 100)}%</b></span>
                  <input
                    type="range"
                    min={0.4}
                    max={1}
                    step={0.01}
                    value={exportQuality}
                    onChange={event => setExportQuality(Number(event.target.value))}
                    aria-label="Export quality"
                  />
                </div>
              </div>
            )}

            <div className="ph-export-meta">
              <span>{exportDimensions.width} × {exportDimensions.height}</span>
              <span>{exportFormat === 'jpeg' ? 'JPG' : exportFormat.toUpperCase()}</span>
            </div>

            <div className="ph-export-actions">
              <button className="ph-ghost-btn" onClick={() => setExportOpen(false)}>Cancel</button>
              <button className="ph-primary-btn" onClick={runExport} disabled={exporting}>
                <EditrimIcon name="download" size={15} />{exporting ? 'Exporting' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
