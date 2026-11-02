import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Brand';
import { VellumIcon, type VellumIconName } from '../components/VellumIcon';
import { useToast } from '../components/Toast';
import { FONTS } from '../lib/fonts';
import { buildVideoAsset } from '../lib/video/media';
import {
  activeClips,
  assetKindFromMime,
  clipColor,
  clipEnd,
  createTextClip,
  DEFAULT_TEXT,
  formatTimecode,
  newVideoProject,
  projectDuration,
  sanitizeVideoFilename,
  VIDEO_ASPECTS,
  type TextOverlayStyle,
  type VideoAsset,
  type VideoClip,
  type VideoClipKind,
  type VideoProject,
  type VideoTrack,
} from '../lib/video/types';
import { renderVideoFrame, type MediaElementMap } from '../lib/video/render';
import { clearVideoProject, loadVideoProject, saveMediaBlob, saveVideoProject } from '../lib/video/storage';
import { clamp, downloadBlob, uid } from '../lib/utils';
import '../styles/video.css';

type DragMode = 'move' | 'trim-left' | 'trim-right';
type DragState = {
  clipId: string;
  mode: DragMode;
  startX: number;
  origStart: number;
  origDuration: number;
  origInPoint: number;
};
type DragPreview = { start: number; duration: number; inPoint: number };
type OverlayDrag = {
  clipId: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  rect: { left: number; top: number; width: number; height: number };
};
type SaveState = 'saved' | 'saving' | 'error';
type AudioGraph = {
  ctx: AudioContext;
  monitor: GainNode;
  capture: GainNode;
  destination: MediaStreamAudioDestinationNode;
};

const TRACK_ICONS: Record<VideoTrack['kind'], VellumIconName> = {
  video: 'film',
  overlay: 'layers',
  audio: 'music',
};

const KIND_ICONS: Record<VideoClipKind, VellumIconName> = {
  video: 'film',
  image: 'image',
  text: 'text',
  audio: 'music',
};

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function sourceDuration(project: VideoProject, clip: VideoClip): number {
  const asset = project.assets.find(item => item.id === clip.assetId);
  if (!asset) return clip.kind === 'video' || clip.kind === 'audio' ? 0 : 600;
  if (clip.kind === 'audio' || clip.kind === 'video') return Math.max(0.2, asset.duration || 5);
  return 600;
}

function resolveTrackStart(project: VideoProject, clip: VideoClip, desired: number, duration: number): number {
  const others = project.clips
    .filter(item => item.trackId === clip.trackId && item.id !== clip.id)
    .sort((a, b) => a.start - b.start);
  let start = Math.max(0, desired);
  for (let pass = 0; pass < 10; pass += 1) {
    const hit = others.find(item => start < clipEnd(item) && start + duration > item.start);
    if (!hit) break;
    const before = hit.start - duration;
    const after = clipEnd(hit);
    const choices = [before, after].filter(value => value >= 0);
    if (!choices.length) {
      start = after;
    } else {
      start = choices.reduce((best, value) => (Math.abs(value - desired) < Math.abs(best - desired) ? value : best), choices[0]);
    }
  }
  return Math.max(0, start);
}

function findFreeStart(project: VideoProject, trackId: VideoTrack['id'], desired: number, duration: number): number {
  const others = project.clips.filter(item => item.trackId === trackId).sort((a, b) => a.start - b.start);
  let start = Math.max(0, desired);
  others.forEach(item => {
    if (start + duration > item.start && start < clipEnd(item)) start = clipEnd(item);
  });
  return start;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="vd-field">
      <span className="vd-field-label">{label}{hint && <small>{hint}</small>}</span>
      {children}
    </label>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  onBegin,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
  onBegin?: () => void;
}) {
  return (
    <label className="vd-range">
      <span>{label}<b>{Math.round(value * 100) / 100}{suffix}</b></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={onBegin}
        onFocus={onBegin}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function IconButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  className = '',
}: {
  icon: VellumIconName;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`vd-icon-btn ${active ? 'is-active' : ''} ${className}`}
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
    >
      <VellumIcon name={icon} size={16} />
    </button>
  );
}

export default function VideoEditor() {
  const { toast } = useToast();
  const [project, setProject] = useState<VideoProject>(() => newVideoProject());
  const projectRef = useRef(project);
  const [ready, setReady] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const selectedClipRef = useRef<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const [loop, setLoop] = useState(false);
  const loopRef = useRef(false);
  const [zoom, setZoom] = useState(74);
  const zoomRef = useRef(74);
  const [snap, setSnap] = useState(true);
  const snapRef = useRef(true);
  const [masterVolume, setMasterVolume] = useState(0.85);
  const masterVolumeRef = useRef(0.85);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const dragPreviewRef = useRef<DragPreview | null>(null);
  const [overlayDrag, setOverlayDrag] = useState<OverlayDrag | null>(null);
  const overlaySnapshotRef = useRef<VideoProject | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportingRef = useRef(false);
  const exportCancelRef = useRef(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const pastRef = useRef<VideoProject[]>([]);
  const futureRef = useRef<VideoProject[]>([]);
  const lastGroupRef = useRef<string | null>(null);
  const lastGroupTimeRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const mediaRefs = useRef<MediaElementMap>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const drawRafRef = useRef<number | null>(null);
  const audioGraphRef = useRef<AudioGraph | null>(null);
  const sourceIdsRef = useRef<Set<string>>(new Set());

  const duration = useMemo(() => projectDuration(project), [project]);
  const selectedClip = project.clips.find(clip => clip.id === selectedClipId) ?? null;
  const selectedAsset = selectedClip?.assetId ? project.assets.find(asset => asset.id === selectedClip.assetId) : undefined;
  const contentDuration = Math.max(30, duration + 8);
  const contentWidth = Math.max(900, contentDuration * zoom);
  const clipCount = project.clips.length;

  useEffect(() => { projectRef.current = project; }, [project]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { loopRef.current = loop; }, [loop]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { snapRef.current = snap; }, [snap]);
  useEffect(() => { masterVolumeRef.current = masterVolume; }, [masterVolume]);
  useEffect(() => { selectedClipRef.current = selectedClipId; }, [selectedClipId]);
  useEffect(() => { exportingRef.current = exporting; }, [exporting]);

  const syncHistoryState = useCallback(() => {
    setHistoryState({ canUndo: pastRef.current.length > 0, canRedo: futureRef.current.length > 0 });
  }, []);

  const setProjectDirect = useCallback((next: VideoProject) => {
    projectRef.current = next;
    setProject(next);
    requestAnimationFrame(() => setSaveState('saving'));
  }, []);

  const commit = useCallback((mutator: VideoProject | ((current: VideoProject) => VideoProject), groupKey?: string) => {
    const previous = projectRef.current;
    const next = typeof mutator === 'function' ? mutator(previous) : mutator;
    if (next === previous) return;
    const now = Date.now();
    const newGroup = !groupKey || groupKey !== lastGroupRef.current || now - lastGroupTimeRef.current > 850;
    if (newGroup) {
      pastRef.current.push(previous);
      if (pastRef.current.length > 80) pastRef.current.shift();
      futureRef.current = [];
    }
    lastGroupRef.current = groupKey ?? null;
    lastGroupTimeRef.current = now;
    projectRef.current = next;
    setProject(next);
    syncHistoryState();
  }, [syncHistoryState]);

  const undo = useCallback(() => {
    const previous = pastRef.current.pop();
    if (!previous) return;
    futureRef.current.push(projectRef.current);
    projectRef.current = previous;
    setProject(previous);
    lastGroupRef.current = null;
    syncHistoryState();
  }, [syncHistoryState]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(projectRef.current);
    projectRef.current = next;
    setProject(next);
    lastGroupRef.current = null;
    syncHistoryState();
  }, [syncHistoryState]);

  const requestDraw = useCallback(() => {
    if (drawRafRef.current !== null) return;
    drawRafRef.current = requestAnimationFrame(() => {
      drawRafRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      renderVideoFrame(ctx, projectRef.current, currentTimeRef.current, mediaRefs.current, {
        showGuides: true,
        selectedClipId: selectedClipRef.current,
      });
    });
  }, []);

  const syncMedia = useCallback((time: number, shouldPlay: boolean) => {
    const current = projectRef.current;
    const activeIds = new Set<string>();
    const activate = (clip: VideoClip, track: VideoTrack) => {
      if (clip.kind === 'text' || clip.kind === 'image' || !clip.assetId) return;
      const asset = current.assets.find(item => item.id === clip.assetId);
      const el = mediaRefs.current.get(clip.assetId);
      if (!asset || !el || !(el instanceof HTMLMediaElement)) return;
      activeIds.add(clip.assetId);
      const fadeIn = clip.fadeIn > 0 ? Math.min(1, (time - clip.start) / clip.fadeIn) : 1;
      const fadeOut = clip.fadeOut > 0 ? Math.min(1, (clipEnd(clip) - time) / clip.fadeOut) : 1;
      const volume = clamp(clip.volume * track.volume * masterVolumeRef.current * Math.max(0, Math.min(fadeIn, fadeOut)), 0, 1);
      const target = Math.max(0, Math.min(asset.duration || clip.duration, clip.inPoint + (time - clip.start)));
      el.volume = volume;
      if (el.readyState >= 1 && (el.paused || Math.abs(el.currentTime - target) > 0.22)) {
        el.currentTime = target;
      }
      if (shouldPlay) {
        if (el.paused) el.play().catch(() => {});
      } else {
        el.pause();
      }
    };

    const videoTrack = current.tracks.find(track => track.id === 'video');
    const audioTrack = current.tracks.find(track => track.id === 'audio');
    if (videoTrack && !videoTrack.hidden) {
      activeClips(current, 'video', time).forEach(clip => activate(clip, videoTrack));
    }
    if (audioTrack && !audioTrack.hidden) {
      activeClips(current, 'audio', time).forEach(clip => activate(clip, audioTrack));
    }
    mediaRefs.current.forEach((el, id) => {
      if (activeIds.has(id) || !(el instanceof HTMLMediaElement)) return;
      el.pause();
    });
  }, []);

  const requestDrawAndSync = useCallback((time: number, shouldPlay: boolean) => {
    syncMedia(time, shouldPlay);
    requestDraw();
  }, [requestDraw, syncMedia]);

  const seekTo = useCallback((time: number) => {
    const nextTime = clamp(time, 0, Math.max(projectDuration(projectRef.current), 0));
    currentTimeRef.current = nextTime;
    setCurrentTime(nextTime);
    requestDrawAndSync(nextTime, false);
  }, [requestDrawAndSync]);

  const togglePlay = useCallback(() => {
    if (exportingRef.current) return;
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      syncMedia(currentTimeRef.current, false);
      return;
    }
    const projectDurationValue = projectDuration(projectRef.current);
    if (projectDurationValue <= 0) {
      toast('Add a clip to the timeline first');
      return;
    }
    audioGraphRef.current?.ctx.resume().catch(() => {});
    if (currentTimeRef.current >= projectDurationValue - 0.02) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
    }
    playingRef.current = true;
    setPlaying(true);
  }, [syncMedia, toast]);

  useEffect(() => {
    if (!playing) {
      syncMedia(currentTimeRef.current, false);
      return;
    }
    let raf = 0;
    let anchorWall = performance.now();
    let anchorTime = currentTimeRef.current;
    let lastUi = 0;
    const tick = (now: number) => {
      const total = projectDuration(projectRef.current);
      let next = anchorTime + (now - anchorWall) / 1000;
      if (next >= total) {
        if (loopRef.current) {
          anchorWall = now;
          anchorTime = 0;
          next = 0;
        } else {
          currentTimeRef.current = total;
          setCurrentTime(total);
          setPlaying(false);
          playingRef.current = false;
          syncMedia(total, false);
          requestDraw();
          return;
        }
      }
      currentTimeRef.current = next;
      if (now - lastUi > 33) {
        lastUi = now;
        setCurrentTime(next);
      }
      syncMedia(next, true);
      requestDraw();
      raf = requestAnimationFrame(tick);
    };
    syncMedia(anchorTime, true);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, requestDraw, syncMedia]);

  useEffect(() => { requestDraw(); }, [project, currentTime, selectedClipId, requestDraw]);

  useEffect(() => {
    if (!playing) return;
    const scroll = timelineScrollRef.current;
    if (!scroll) return;
    const x = currentTimeRef.current * zoomRef.current;
    if (x > scroll.scrollLeft + scroll.clientWidth - 90 || x < scroll.scrollLeft + 20) {
      scroll.scrollLeft = Math.max(0, x - scroll.clientWidth * 0.34);
    }
  }, [currentTime, playing]);

  useEffect(() => {
    if (!ready) return;
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      setSaveState(saveVideoProject(projectRef.current) ? 'saved' : 'error');
    }, 450);
    return () => window.clearTimeout(timer);
  }, [project, ready]);

  useEffect(() => {
    let cancelled = false;
    loadVideoProject().then(loaded => {
      if (cancelled) return;
      if (loaded) {
        projectRef.current = loaded;
        setProject(loaded);
        if (loaded.assets.some(asset => asset.missing)) toast('Some media files could not be restored. Re-import them to use them again.');
      }
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [toast]);

  useEffect(() => {
    const onBeforeUnload = () => { saveVideoProject(projectRef.current); };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!overlayDrag) return;
    const move = (event: PointerEvent) => {
      const dx = (event.clientX - overlayDrag.startX) / overlayDrag.rect.width;
      const dy = (event.clientY - overlayDrag.startY) / overlayDrag.rect.height;
      setProjectDirect({
        ...projectRef.current,
        clips: projectRef.current.clips.map(clip => clip.id === overlayDrag.clipId
          ? { ...clip, x: clamp(overlayDrag.origX + dx, -0.1, 1.1), y: clamp(overlayDrag.origY + dy, -0.1, 1.1) }
          : clip),
      });
    };
    const up = () => {
      if (overlaySnapshotRef.current && overlaySnapshotRef.current !== projectRef.current) {
        pastRef.current.push(overlaySnapshotRef.current);
        if (pastRef.current.length > 80) pastRef.current.shift();
        futureRef.current = [];
        syncHistoryState();
      }
      overlaySnapshotRef.current = null;
      setOverlayDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [overlayDrag, setProjectDirect, syncHistoryState]);

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      const current = projectRef.current;
      const clip = current.clips.find(item => item.id === drag.clipId);
      if (!clip) return;
      const delta = (event.clientX - drag.startX) / zoomRef.current;
      let next: DragPreview;
      if (drag.mode === 'move') {
        let start = Math.max(0, drag.origStart + delta);
        if (snapRef.current) {
          const points = [0, currentTimeRef.current, ...current.clips.filter(item => item.trackId === clip.trackId && item.id !== clip.id).flatMap(item => [item.start, clipEnd(item)])];
          const match = points.find(point => Math.abs(point - start) < 0.09);
          if (match !== undefined) start = match;
        }
        start = resolveTrackStart(current, clip, start, drag.origDuration);
        next = { start, duration: drag.origDuration, inPoint: drag.origInPoint };
      } else if (drag.mode === 'trim-left') {
        const previousEnd = current.clips
          .filter(item => item.trackId === clip.trackId && item.id !== clip.id && clipEnd(item) <= drag.origStart + 0.001)
          .reduce((max, item) => Math.max(max, clipEnd(item)), 0);
        const minBySource = clip.kind === 'video' || clip.kind === 'audio' ? Math.max(0, drag.origStart - drag.origInPoint) : 0;
        const minStart = Math.max(previousEnd, minBySource);
        const start = clamp(drag.origStart + delta, minStart, drag.origStart + drag.origDuration - 0.2);
        const shift = start - drag.origStart;
        next = {
          start,
          duration: drag.origDuration - shift,
          inPoint: clip.kind === 'video' || clip.kind === 'audio' ? drag.origInPoint + shift : 0,
        };
      } else {
        const nextClip = current.clips
          .filter(item => item.trackId === clip.trackId && item.id !== clip.id && item.start >= drag.origStart)
          .sort((a, b) => a.start - b.start)[0];
        const sourceMax = sourceDuration(current, clip) - drag.origInPoint;
        const maxByNext = nextClip ? nextClip.start - drag.origStart : 600;
        const maxDuration = Math.max(0.2, Math.min(sourceMax, maxByNext));
        next = {
          start: drag.origStart,
          duration: clamp(drag.origDuration + delta, 0.2, maxDuration),
          inPoint: drag.origInPoint,
        };
      }
      dragPreviewRef.current = next;
      setDragPreview(next);
    };
    const up = () => {
      const preview = dragPreviewRef.current;
      if (preview) {
        commit(current => ({
          ...current,
          clips: current.clips.map(item => item.id === drag.clipId
            ? { ...item, start: preview.start, duration: preview.duration, inPoint: preview.inPoint }
            : item),
        }));
      }
      dragPreviewRef.current = null;
      setDragPreview(null);
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [commit, drag]);

  const seekFromClientX = useCallback((clientX: number) => {
    const content = timelineContentRef.current;
    if (!content) return;
    const rect = content.getBoundingClientRect();
    seekTo((clientX - rect.left) / zoomRef.current);
  }, [seekTo]);

  useEffect(() => {
    if (!scrubbing) return;
    const move = (event: PointerEvent) => seekFromClientX(event.clientX);
    const up = () => setScrubbing(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [scrubbing, seekFromClientX]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (exportingRef.current) return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      } else if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        splitSelected();
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelected();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seekTo(currentTimeRef.current - (event.shiftKey ? 0.1 : 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        seekTo(currentTimeRef.current + (event.shiftKey ? 0.1 : 1));
      } else if (event.key.toLowerCase() === 't') {
        event.preventDefault();
        addText();
      } else if (event.key === 'Escape') {
        selectClip(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, seekTo, undo, redo]);

  const selectClip = useCallback((id: string | null) => {
    selectedClipRef.current = id;
    setSelectedClipId(id);
    if (id) setInspectorOpen(true);
  }, []);

  const updateClip = useCallback((id: string, patch: Partial<VideoClip>, groupKey?: string) => {
    commit(current => ({
      ...current,
      clips: current.clips.map(clip => clip.id === id ? { ...clip, ...patch } : clip),
    }), groupKey);
  }, [commit]);

  const updateText = useCallback((id: string, patch: Partial<TextOverlayStyle>, groupKey?: string) => {
    commit(current => ({
      ...current,
      clips: current.clips.map(clip => clip.id === id && clip.text
        ? { ...clip, text: { ...clip.text, ...patch }, name: patch.content ? patch.content.slice(0, 28) : clip.name }
        : clip),
    }), groupKey ? `text:${id}:${groupKey}` : undefined);
  }, [commit]);

  const updateTrack = useCallback((id: VideoTrack['id'], patch: Partial<VideoTrack>) => {
    commit(current => ({ ...current, tracks: current.tracks.map(track => track.id === id ? { ...track, ...patch } : track) }));
  }, [commit]);

  const deleteSelected = useCallback(() => {
    const id = selectedClipRef.current;
    if (!id) return;
    commit(current => ({ ...current, clips: current.clips.filter(clip => clip.id !== id) }));
    selectClip(null);
    toast('Clip removed');
  }, [commit, selectClip, toast]);

  const duplicateSelected = useCallback(() => {
    const id = selectedClipRef.current;
    const current = projectRef.current;
    const source = current.clips.find(clip => clip.id === id);
    if (!source) return;
    const start = source.trackId === 'overlay'
      ? clipEnd(source)
      : findFreeStart(current, source.trackId, clipEnd(source), source.duration);
    const copy: VideoClip = { ...source, id: uid('clip'), start };
    commit({ ...current, clips: [...current.clips, copy] });
    selectClip(copy.id);
  }, [commit, selectClip]);

  const splitSelected = useCallback(() => {
    const id = selectedClipRef.current;
    const time = currentTimeRef.current;
    const current = projectRef.current;
    const clip = current.clips.find(item => item.id === id);
    if (!clip) {
      toast('Select a clip to split');
      return;
    }
    if (time <= clip.start + 0.08 || time >= clipEnd(clip) - 0.08) {
      toast('Move the playhead inside the selected clip');
      return;
    }
    const leftDuration = time - clip.start;
    const rightDuration = clip.duration - leftDuration;
    const right: VideoClip = {
      ...clip,
      id: uid('clip'),
      start: time,
      duration: rightDuration,
      inPoint: clip.kind === 'video' || clip.kind === 'audio' ? clip.inPoint + leftDuration : 0,
    };
    const left: VideoClip = { ...clip, duration: leftDuration };
    commit({
      ...current,
      clips: current.clips.flatMap(item => item.id === clip.id ? [left, right] : [item]),
    });
    selectClip(right.id);
    toast('Clip split at playhead');
  }, [commit, selectClip, toast]);

  const addText = useCallback(() => {
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
    }
    const at = findFreeStart(projectRef.current, 'overlay', currentTimeRef.current, 4);
    const clip = createTextClip(at);
    commit(current => ({ ...current, clips: [...current.clips, clip] }));
    selectClip(clip.id);
    setLibraryOpen(false);
    toast('Text overlay added');
  }, [commit, selectClip, toast]);

  const applyAspect = useCallback((width: number, height: number) => {
    commit(current => {
      const ratio = height / current.height;
      return {
        ...current,
        width,
        height,
        clips: current.clips.map(clip => clip.text
          ? { ...clip, text: { ...clip.text, fontSize: Math.max(18, Math.round(clip.text.fontSize * ratio)) } }
          : clip),
      };
    });
  }, [commit]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    for (const file of list) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const kind = assetKindFromMime(file.type) ?? (['mp4', 'webm', 'mov', 'm4v', 'ogv'].includes(ext)
        ? 'video'
        : ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext)
          ? 'audio'
          : ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)
            ? 'image'
            : null);
      if (!kind) {
        toast(`"${file.name}" is not a video, image or audio file`);
        continue;
      }
      if (file.size > 500 * 1024 * 1024) {
        toast(`"${file.name}" is too large (500 MB limit)`);
        continue;
      }
      const id = uid('media');
      const src = URL.createObjectURL(file);
      try {
        const asset = await buildVideoAsset(file, id, src, kind);
        await saveMediaBlob(id, file).catch(() => {});
        commit(current => ({
          ...current,
          assets: [...current.assets, asset],
          name: current.assets.length === 0 && current.name === 'Untitled video'
            ? file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 42)
            : current.name,
        }));
        toast(`${file.name} imported`);
      } catch {
        URL.revokeObjectURL(src);
        toast(`Could not read "${file.name}"`);
      }
    }
  }, [commit, toast]);

  const addAssetToTimeline = useCallback((asset: VideoAsset) => {
    if (asset.missing || !asset.src) {
      toast('This media file is missing. Re-import it.');
      return;
    }
    if (playingRef.current) {
      setPlaying(false);
      playingRef.current = false;
    }
    const current = projectRef.current;
    const trackId: VideoTrack['id'] = asset.kind === 'video' ? 'video' : asset.kind === 'image' ? 'overlay' : 'audio';
    const baseDuration = asset.kind === 'image' ? 4 : Math.max(0.4, asset.duration || 5);
    const start = findFreeStart(current, trackId, currentTimeRef.current, baseDuration);
    const clip: VideoClip = {
      id: uid('clip'),
      trackId,
      kind: asset.kind,
      name: asset.name,
      assetId: asset.id,
      start,
      duration: baseDuration,
      inPoint: 0,
      opacity: 1,
      volume: asset.kind === 'image' ? 0 : 1,
      fadeIn: 0,
      fadeOut: 0,
      x: 0.5,
      y: 0.5,
      scale: asset.kind === 'image' ? 0.58 : 1,
    };
    commit({ ...current, clips: [...current.clips, clip] });
    selectClip(clip.id);
    setLibraryOpen(false);
    toast(`${asset.kind === 'image' ? 'Image' : asset.kind === 'video' ? 'Video' : 'Audio'} added to the timeline`);
  }, [commit, selectClip, toast]);

  const removeAsset = useCallback((assetId: string) => {
    commit(current => ({
      ...current,
      assets: current.assets.filter(asset => asset.id !== assetId),
      clips: current.clips.filter(clip => clip.assetId !== assetId),
    }));
    if (selectedClipRef.current && !projectRef.current.clips.some(clip => clip.id === selectedClipRef.current)) {
      selectClip(null);
    }
    toast('Media removed from project');
  }, [commit, selectClip, toast]);

  const renameProject = useCallback((name: string) => {
    commit(current => ({ ...current, name }), 'project:name');
  }, [commit]);

  const newProject = useCallback(() => {
    if (!window.confirm('Start a new video? The current timeline will be cleared.')) return;
    projectRef.current.assets.forEach(asset => { if (asset.src.startsWith('blob:')) URL.revokeObjectURL(asset.src); });
    const fresh = newVideoProject();
    clearVideoProject();
    pastRef.current = [];
    futureRef.current = [];
    projectRef.current = fresh;
    setProject(fresh);
    selectClip(null);
    seekTo(0);
    setSaveState('saved');
    syncHistoryState();
    toast('New video project');
  }, [seekTo, selectClip, syncHistoryState, toast]);

  const startClipDrag = (event: React.PointerEvent, clip: VideoClip, mode: DragMode) => {
    if (exportingRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    selectClip(clip.id);
    setDrag({
      clipId: clip.id,
      mode,
      startX: event.clientX,
      origStart: clip.start,
      origDuration: clip.duration,
      origInPoint: clip.inPoint,
    });
    dragPreviewRef.current = null;
    setDragPreview(null);
  };

  const startOverlayDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (exportingRef.current || playingRef.current) return;
    const id = selectedClipRef.current;
    const clip = projectRef.current.clips.find(item => item.id === id);
    if (!clip || (clip.kind !== 'text' && clip.kind !== 'image')) return;
    if (!activeClips(projectRef.current, 'overlay', currentTimeRef.current).some(item => item.id === clip.id)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const projectRatio = projectRef.current.width / projectRef.current.height;
    const boxRatio = rect.width / rect.height;
    let contentWidth = rect.width;
    let contentHeight = rect.height;
    let contentLeft = rect.left;
    let contentTop = rect.top;
    if (boxRatio > projectRatio) {
      contentWidth = rect.height * projectRatio;
      contentLeft = rect.left + (rect.width - contentWidth) / 2;
    } else {
      contentHeight = rect.width / projectRatio;
      contentTop = rect.top + (rect.height - contentHeight) / 2;
    }
    event.preventDefault();
    overlaySnapshotRef.current = projectRef.current;
    setOverlayDrag({
      clipId: clip.id,
      startX: event.clientX,
      startY: event.clientY,
      origX: clip.x,
      origY: clip.y,
      rect: { left: contentLeft, top: contentTop, width: contentWidth, height: contentHeight },
    });
  };

  const ensureAudioGraph = useCallback(async (): Promise<AudioGraph | null> => {
    try {
      let graph = audioGraphRef.current;
      if (!graph) {
        const Ctx = window.AudioContext;
        if (!Ctx) return null;
        const ctx = new Ctx();
        const monitor = ctx.createGain();
        const capture = ctx.createGain();
        const destination = ctx.createMediaStreamDestination();
        monitor.connect(ctx.destination);
        capture.connect(destination);
        graph = { ctx, monitor, capture, destination };
        audioGraphRef.current = graph;
      }
      if (graph.ctx.state === 'suspended') await graph.ctx.resume();
      projectRef.current.assets.forEach(asset => {
        if (asset.kind === 'image' || sourceIdsRef.current.has(asset.id)) return;
        const el = mediaRefs.current.get(asset.id);
        if (!el || !(el instanceof HTMLMediaElement)) return;
        try {
          const source = graph.ctx.createMediaElementSource(el);
          source.connect(graph.monitor);
          source.connect(graph.capture);
          sourceIdsRef.current.add(asset.id);
        } catch {
          // The element may already be attached to another context.
        }
      });
      return graph;
    } catch {
      return null;
    }
  }, []);

  const exportVideo = useCallback(async () => {
    if (exportingRef.current) return;
    const current = projectRef.current;
    const total = projectDuration(current);
    if (!total) {
      toast('Add at least one clip before exporting');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      toast('This browser cannot record video. Try Chrome or Edge.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    exportingRef.current = true;
    exportCancelRef.current = false;
    setExporting(true);
    setExportProgress(0);
    setPlaying(false);
    playingRef.current = false;
    setSelectedClipId(null);
    selectedClipRef.current = null;
    currentTimeRef.current = 0;
    setCurrentTime(0);
    syncMedia(0, false);
    requestDraw();

    const graph = await ensureAudioGraph();
    const stream = (canvas as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }).captureStream?.(current.fps || 30);
    if (!stream) {
      exportingRef.current = false;
      setExporting(false);
      toast('Canvas recording is not supported in this browser');
      return;
    }
    if (graph && current.assets.some(asset => asset.kind !== 'image')) {
      const audioTrack = graph.destination.stream.getAudioTracks()[0];
      if (audioTrack) stream.addTrack(audioTrack);
    }
    const mimeCandidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const mimeType = mimeCandidates.find(type => MediaRecorder.isTypeSupported(type)) ?? '';
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 8_000_000 } : { videoBitsPerSecond: 8_000_000 });
    } catch {
      exportingRef.current = false;
      setExporting(false);
      stream.getTracks().forEach(track => track.stop());
      toast('Could not start the video recorder');
      return;
    }
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    const stopped = new Promise<void>(resolve => { recorder.onstop = () => resolve(); });
    recorder.onerror = () => {
      exportCancelRef.current = true;
      toast('The video recorder stopped unexpectedly');
    };
    recorder.start(250);
    const wallStart = performance.now();
    let raf = 0;
    let lastUi = 0;
    const finish = async (cancelled: boolean) => {
      cancelAnimationFrame(raf);
      syncMedia(0, false);
      try { recorder.stop(); } catch { /* already stopped */ }
      await stopped;
      stream.getTracks().forEach(track => track.stop());
      exportingRef.current = false;
      setExporting(false);
      setCurrentTime(0);
      currentTimeRef.current = 0;
      setExportProgress(1);
      if (!cancelled && chunks.length) {
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        downloadBlob(blob, `${sanitizeVideoFilename(current.name)}.webm`);
        toast(`Exported ${sanitizeVideoFilename(current.name)}.webm`);
      } else if (cancelled) {
        toast('Export cancelled');
      }
      requestDraw();
    };
    const tick = (now: number) => {
      if (exportCancelRef.current) {
        finish(true);
        return;
      }
      const time = Math.min(total, (now - wallStart) / 1000);
      currentTimeRef.current = time;
      syncMedia(time, true);
      const ctx = canvas.getContext('2d');
      if (ctx) renderVideoFrame(ctx, current, time, mediaRefs.current, { showGuides: false });
      if (now - lastUi > 120) {
        lastUi = now;
        setCurrentTime(time);
        setExportProgress(total ? time / total : 0);
      }
      if (time >= total) {
        finish(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }, [ensureAudioGraph, requestDraw, syncMedia, toast]);

  const cancelExport = useCallback(() => {
    exportCancelRef.current = true;
  }, []);

  const totalClips = project.clips.length;
  const textClips = project.clips.filter(clip => clip.kind === 'text').length;
  const mediaClips = project.clips.filter(clip => clip.kind !== 'text').length;

  return (
    <div
      ref={containerRef}
      className={`video-editor ${exporting ? 'is-exporting' : ''} ${overlayDrag ? 'is-overlay-drag' : ''}`}
      data-clips={clipCount}
      data-width={project.width}
      data-height={project.height}
      data-duration={duration}
      data-current-time={currentTime}
      data-playing={playing}
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault();
        if (event.dataTransfer.files.length) handleFiles(event.dataTransfer.files);
      }}
    >
      <header className="vd-header">
        <div className="vd-left">
          <Link to="/dashboard" className="vd-back" title="Back to dashboard"><VellumIcon name="arrowLeft" size={17} /></Link>
          <Logo size={26} wordmark={false} />
          <div className="vd-title-wrap">
            <input value={project.name} onChange={event => renameProject(event.target.value)} aria-label="Video project name" />
            <span className={`vd-save is-${saveState}`}>
              <VellumIcon name={saveState === 'error' ? 'alert' : 'cloud'} size={10} />
              {saveState === 'saving' ? 'Saving' : saveState === 'error' ? 'Save failed' : 'Saved locally'}
            </span>
          </div>
        </div>
        <div className="vd-header-center">
          <IconButton icon="undo" label="Undo" onClick={undo} disabled={!historyState.canUndo} />
          <IconButton icon="redo" label="Redo" onClick={redo} disabled={!historyState.canRedo} />
          <span className="vd-header-chip">{project.width} × {project.height}</span>
          <span className="vd-header-chip vd-fps-chip">{project.fps} fps</span>
        </div>
        <div className="vd-right">
          <button className="vd-mobile-btn" onClick={() => setLibraryOpen(v => !v)} title="Media library"><VellumIcon name="film" size={15} /><span>Media</span></button>
          <button className="vd-mobile-btn" onClick={() => setInspectorOpen(v => !v)} title="Properties"><VellumIcon name="sliders" size={15} /><span>Edit</span></button>
          <button className="vd-import-btn" onClick={() => fileInputRef.current?.click()}><VellumIcon name="upload" size={15} /><span>Import</span></button>
          <button className="vd-export-btn" onClick={exportVideo} disabled={!clipCount || exporting}>
            <VellumIcon name="download" size={15} /><span>{exporting ? 'Rendering' : 'Export'}</span>
          </button>
        </div>
      </header>

      <div className="vd-body">
        <aside className={`vd-panel vd-library ${libraryOpen ? 'is-open' : ''}`}>
          <div className="vd-panel-head">
            <div><span className="vd-eyebrow">Project media</span><h2>Library</h2></div>
            <button className="vd-panel-close" onClick={() => setLibraryOpen(false)} aria-label="Close media library"><VellumIcon name="close" size={15} /></button>
          </div>
          <input
            ref={fileInputRef}
            className="vd-file-input"
            type="file"
            accept="video/*,image/*,audio/*"
            multiple
            onChange={event => {
              if (event.target.files) handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <button className="vd-dropzone" onClick={() => fileInputRef.current?.click()}>
            <span className="vd-dropzone-icon"><VellumIcon name="upload" size={22} /></span>
            <strong>Import media</strong>
            <small>Video, image or audio · drop files anywhere</small>
          </button>
          {project.assets.length > 0 ? (
            <div className="vd-media-list">
              {project.assets.map(asset => (
                <div
                  key={asset.id}
                  className={`vd-media-card ${asset.missing ? 'is-missing' : ''}`}
                  data-asset-id={asset.id}
                  data-kind={asset.kind}
                  onClick={() => addAssetToTimeline(asset)}
                  title={asset.missing ? 'Missing media — re-import the file' : 'Add to timeline'}
                >
                  <div className="vd-media-thumb" style={{ backgroundImage: `url(${asset.thumbnail})` }}>
                    <span className="vd-media-kind"><VellumIcon name={KIND_ICONS[asset.kind]} size={12} /></span>
                    <span className="vd-media-duration">{asset.kind === 'image' ? 'still' : formatTimecode(asset.duration, false)}</span>
                    <span className="vd-media-add"><VellumIcon name="plus" size={14} /></span>
                  </div>
                  <div className="vd-media-meta">
                    <strong>{asset.name}</strong>
                    <small>{asset.kind} · {formatBytes(asset.size)}</small>
                  </div>
                  <button
                    className="vd-media-remove"
                    onClick={event => { event.stopPropagation(); removeAsset(asset.id); }}
                    title="Remove media"
                    aria-label={`Remove ${asset.name}`}
                  >
                    <VellumIcon name="trash" size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="vd-empty-library">
              <VellumIcon name="film" size={22} />
              <p>No media yet. Import a video to start building.</p>
            </div>
          )}
          <div className="vd-panel-section">
            <span className="vd-eyebrow">Quick add</span>
            <button className="vd-quick-add" onClick={addText}><span><VellumIcon name="text" size={17} /></span><div><strong>Text overlay</strong><small>Add a title at the playhead</small></div></button>
            <button className="vd-quick-add" onClick={() => fileInputRef.current?.click()}><span><VellumIcon name="image" size={17} /></span><div><strong>Image overlay</strong><small>Use a PNG, JPG or SVG</small></div></button>
          </div>
          <div className="vd-library-tip">
            <VellumIcon name="spark" size={14} />
            <span>Click any media card to place it on the timeline. Everything stays in your browser.</span>
          </div>
        </aside>

        <main className="vd-main">
          <div className="vd-stage" ref={stageRef}>
            <div className="vd-stage-head">
              <span><span className="vd-live-dot" /> Preview</span>
              <span>{project.width} × {project.height} · {project.fps} fps</span>
            </div>
            <div className={`vd-canvas-wrap ${selectedClip && (selectedClip.kind === 'text' || selectedClip.kind === 'image') ? 'has-draggable-overlay' : ''}`} onPointerDown={startOverlayDrag}>
              <canvas ref={canvasRef} width={project.width} height={project.height} aria-label="Video preview" />
              {clipCount === 0 && (
                <div className="vd-empty-stage">
                  <span className="vd-empty-mark"><VellumIcon name="film" size={30} /></span>
                  <h2>Make your first cut.</h2>
                  <p>Import a video, drop it on the timeline and add a title. No timeline theory required.</p>
                  <div>
                    <button className="vd-primary-btn" onClick={() => fileInputRef.current?.click()}><VellumIcon name="upload" size={15} /> Import video</button>
                    <button className="vd-ghost-btn" onClick={addText}><VellumIcon name="text" size={15} /> Add text</button>
                  </div>
                </div>
              )}
            </div>
            <div className="vd-transport">
              <div className="vd-transport-left">
                <IconButton icon="skipStart" label="Go to start" onClick={() => seekTo(0)} />
                <IconButton icon="chevronLeft" label="Back one second" onClick={() => seekTo(currentTime - 1)} />
                <button className="vd-play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                  <VellumIcon name={playing ? 'pause' : 'play'} size={20} />
                </button>
                <IconButton icon="chevronRight" label="Forward one second" onClick={() => seekTo(currentTime + 1)} />
                <IconButton icon="skipEnd" label="Go to end" onClick={() => seekTo(duration)} />
                <span className="vd-time"><b>{formatTimecode(currentTime)}</b><small>/ {formatTimecode(duration)}</small></span>
              </div>
              <div className="vd-transport-right">
                <div className="vd-volume">
                  <VellumIcon name={masterVolume === 0 ? 'volumeOff' : 'volume'} size={15} />
                  <input type="range" min={0} max={1} step={0.01} value={masterVolume} onChange={event => setMasterVolume(Number(event.target.value))} aria-label="Master volume" />
                </div>
                <IconButton icon="loop" label="Loop playback" onClick={() => setLoop(value => !value)} active={loop} />
                <IconButton icon="fit" label="Fullscreen preview" onClick={() => stageRef.current?.requestFullscreen?.().catch(() => {})} />
              </div>
            </div>
          </div>

          <section className="vd-timeline" aria-label="Video timeline">
            <div className="vd-timeline-toolbar">
              <div className="vd-timeline-title"><span className="vd-eyebrow">Timeline</span><strong>{totalClips} clips · {formatTimecode(duration, false)}</strong></div>
              <div className="vd-timeline-tools">
                <IconButton icon="scissors" label="Split at playhead (S)" onClick={splitSelected} disabled={!selectedClip} />
                <IconButton icon="duplicate" label="Duplicate selected (Ctrl+D)" onClick={duplicateSelected} disabled={!selectedClip} />
                <IconButton icon="trash" label="Delete selected (Del)" onClick={deleteSelected} disabled={!selectedClip} />
                <span className="vd-tool-sep" />
                <IconButton icon="text" label="Add text overlay (T)" onClick={addText} />
                <button className={`vd-snap ${snap ? 'is-active' : ''}`} onClick={() => setSnap(value => !value)} title="Snap clips and playhead"><VellumIcon name="bolt" size={14} /> Snap</button>
                <span className="vd-tool-sep" />
                <IconButton icon="zoomOut" label="Zoom out timeline" onClick={() => setZoom(value => clamp(value - 12, 34, 180))} />
                <span className="vd-zoom-label">{Math.round(zoom)} px/s</span>
                <IconButton icon="zoomIn" label="Zoom in timeline" onClick={() => setZoom(value => clamp(value + 12, 34, 180))} />
              </div>
            </div>
            <div className="vd-timeline-body">
              <div className="vd-track-heads">
                <div className="vd-track-head-spacer"><span>TRACKS</span></div>
                {project.tracks.map(track => (
                  <div className="vd-track-head" key={track.id}>
                    <span className={`vd-track-icon is-${track.kind}`}><VellumIcon name={TRACK_ICONS[track.kind]} size={15} /></span>
                    <div><strong>{track.name}</strong><small>{project.clips.filter(clip => clip.trackId === track.id).length} clips</small></div>
                    <div className="vd-track-actions">
                      {track.kind === 'audio' ? (
                        <IconButton icon={track.muted ? 'volumeOff' : 'volume'} label={track.muted ? 'Unmute track' : 'Mute track'} onClick={() => updateTrack(track.id, { muted: !track.muted })} active={!track.muted} />
                      ) : (
                        <IconButton icon={track.hidden ? 'eyeOff' : 'eye'} label={track.hidden ? 'Show track' : 'Hide track'} onClick={() => updateTrack(track.id, { hidden: !track.hidden })} active={!track.hidden} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="vd-timeline-scroll" ref={timelineScrollRef}>
                <div
                  className="vd-timeline-content"
                  ref={timelineContentRef}
                  style={{ width: contentWidth, '--vd-grid': `${zoom}px` } as React.CSSProperties}
                  onPointerDown={event => {
                    if ((event.target as HTMLElement).closest('.vd-clip')) return;
                    event.preventDefault();
                    setScrubbing(true);
                    seekFromClientX(event.clientX);
                  }}
                >
                  <div className="vd-ruler">
                    {Array.from({ length: Math.ceil(contentWidth / zoom) + 1 }, (_, index) => {
                      const major = zoom >= 110 ? index % 1 === 0 : zoom >= 60 ? index % 2 === 0 : index % 5 === 0;
                      return (
                        <span key={index} className={`vd-tick ${major ? 'is-major' : ''}`} style={{ left: index * zoom }}>
                          {major && <b>{formatTimecode(index, false)}</b>}
                        </span>
                      );
                    })}
                  </div>
                  {project.tracks.map(track => (
                    <div className={`vd-lane vd-lane-${track.kind} ${track.hidden ? 'is-hidden' : ''}`} key={track.id}>
                      {project.clips.filter(clip => clip.trackId === track.id).map(clip => {
                        const preview = drag?.clipId === clip.id ? dragPreview : null;
                        const start = preview?.start ?? clip.start;
                        const clipDuration = preview?.duration ?? clip.duration;
                        const asset = clip.assetId ? project.assets.find(item => item.id === clip.assetId) : undefined;
                        const width = Math.max(18, clipDuration * zoom);
                        const backgroundImage = clip.kind === 'text'
                          ? undefined
                          : asset?.thumbnail ? `linear-gradient(90deg, rgba(11,9,17,.22), rgba(11,9,17,.72)), url(${asset.thumbnail})` : undefined;
                        return (
                          <div
                            key={clip.id}
                            className={`vd-clip vd-clip-${clip.kind} ${selectedClipId === clip.id ? 'is-selected' : ''} ${drag?.clipId === clip.id ? 'is-dragging' : ''}`}
                            data-clip-id={clip.id}
                            data-kind={clip.kind}
                            style={{
                              left: start * zoom,
                              width,
                              backgroundImage,
                              '--clip-color': clipColor(clip.kind),
                            } as React.CSSProperties}
                            onPointerDown={event => startClipDrag(event, clip, 'move')}
                          >
                            <span className="vd-trim vd-trim-left" onPointerDown={event => startClipDrag(event, clip, 'trim-left')} />
                            <div className="vd-clip-content">
                              <span className="vd-clip-icon"><VellumIcon name={KIND_ICONS[clip.kind]} size={12} /></span>
                              <span className="vd-clip-name">{clip.kind === 'text' ? (clip.text?.content ?? clip.name) : clip.name}</span>
                              {width > 110 && <span className="vd-clip-time">{formatTimecode(clipDuration, false)}</span>}
                            </div>
                            {clip.kind === 'audio' && asset?.waveform && (
                              <span className="vd-waveform" aria-hidden="true">
                                {asset.waveform.slice(0, 58).map((peak, index) => <i key={index} style={{ height: `${Math.max(8, peak * 34)}px` }} />)}
                              </span>
                            )}
                            <span className="vd-trim vd-trim-right" onPointerDown={event => startClipDrag(event, clip, 'trim-right')} />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="vd-playhead" style={{ left: currentTime * zoom }}><span /></div>
                </div>
              </div>
            </div>
            {clipCount === 0 && <div className="vd-timeline-empty"><VellumIcon name="film" size={15} /> Drop media into the library, then click a card to add it here.</div>}
          </section>
        </main>

        <aside className={`vd-panel vd-inspector ${inspectorOpen ? 'is-open' : ''}`}>
          <div className="vd-panel-head">
            <div><span className="vd-eyebrow">Inspector</span><h2>{selectedClip ? 'Clip properties' : 'Project'}</h2></div>
            <button className="vd-panel-close" onClick={() => setInspectorOpen(false)} aria-label="Close inspector"><VellumIcon name="close" size={15} /></button>
          </div>
          <div className="vd-inspector-scroll">
            {selectedClip ? (
              <>
                <div className="vd-selected-head">
                  <span className={`vd-selected-icon is-${selectedClip.kind}`}><VellumIcon name={KIND_ICONS[selectedClip.kind]} size={16} /></span>
                  <div><strong>{selectedClip.kind === 'text' ? (selectedClip.text?.content ?? selectedClip.name) : selectedClip.name}</strong><small>{selectedClip.kind} clip · {formatTimecode(selectedClip.duration, false)}</small></div>
                  <div className="vd-selected-actions">
                    <IconButton icon="duplicate" label="Duplicate clip" onClick={duplicateSelected} />
                    <IconButton icon="trash" label="Delete clip" onClick={deleteSelected} />
                  </div>
                </div>
                <div className="vd-inspector-section">
                  <div className="vd-section-title"><span>Timing</span><button onClick={splitSelected}><VellumIcon name="scissors" size={12} /> Split</button></div>
                  <div className="vd-inspector-grid">
                    <Field label="Start"><input type="number" step="0.1" min={0} value={Number(selectedClip.start.toFixed(2))} onChange={event => updateClip(selectedClip.id, { start: Math.max(0, Number(event.target.value)) }, 'timing:start')} /></Field>
                    <Field label="Duration"><input type="number" step="0.1" min={0.2} value={Number(selectedClip.duration.toFixed(2))} onChange={event => updateClip(selectedClip.id, { duration: Math.max(0.2, Number(event.target.value)) }, 'timing:duration')} /></Field>
                  </div>
                  <div className="vd-inspector-grid">
                    <Field label="Fade in"><input type="number" step="0.1" min={0} max={5} value={selectedClip.fadeIn} onChange={event => updateClip(selectedClip.id, { fadeIn: clamp(Number(event.target.value), 0, 5) }, 'fade:in')} /></Field>
                    <Field label="Fade out"><input type="number" step="0.1" min={0} max={5} value={selectedClip.fadeOut} onChange={event => updateClip(selectedClip.id, { fadeOut: clamp(Number(event.target.value), 0, 5) }, 'fade:out')} /></Field>
                  </div>
                  {selectedClip.kind !== 'text' && <RangeField label="Opacity" value={selectedClip.opacity} min={0} max={1} step={0.01} suffix="" onChange={value => updateClip(selectedClip.id, { opacity: value }, 'opacity')} />}
                  {(selectedClip.kind === 'video' || selectedClip.kind === 'audio') && <RangeField label="Volume" value={selectedClip.volume} min={0} max={1} step={0.01} suffix="" onChange={value => updateClip(selectedClip.id, { volume: value }, 'volume')} />}
                  {selectedClip.kind === 'image' && (
                    <>
                      <RangeField label="Size" value={selectedClip.scale} min={0.08} max={1.3} step={0.01} suffix="" onChange={value => updateClip(selectedClip.id, { scale: value }, 'scale')} />
                      <div className="vd-inspector-grid">
                        <Field label="X"><input type="range" min={0} max={1} step={0.01} value={selectedClip.x} onChange={event => updateClip(selectedClip.id, { x: Number(event.target.value) }, 'x')} /></Field>
                        <Field label="Y"><input type="range" min={0} max={1} step={0.01} value={selectedClip.y} onChange={event => updateClip(selectedClip.id, { y: Number(event.target.value) }, 'y')} /></Field>
                      </div>
                    </>
                  )}
                </div>
                {selectedClip.kind === 'text' && selectedClip.text && (
                  <div className="vd-inspector-section">
                    <div className="vd-section-title"><span>Text</span><span className="vd-tiny-badge">Editable</span></div>
                    <Field label="Content"><textarea rows={3} value={selectedClip.text.content} onChange={event => updateText(selectedClip.id, { content: event.target.value }, 'content')} /></Field>
                    <Field label="Font">
                      <select
                        value={selectedClip.text.fontFamily}
                        onChange={event => {
                          const nextFont = FONTS.find(font => font.family === event.target.value);
                          const weight = nextFont?.weights.includes(selectedClip.text?.fontWeight ?? 400)
                            ? selectedClip.text?.fontWeight ?? 400
                            : nextFont?.weights[0] ?? 400;
                          updateText(selectedClip.id, { fontFamily: event.target.value, fontWeight: weight }, 'font');
                        }}
                      >
                        {FONTS.map(font => <option key={font.family} value={font.family}>{font.label}</option>)}
                      </select>
                    </Field>
                    <div className="vd-inspector-grid">
                      <Field label="Size"><input type="number" min={12} max={320} value={Math.round(selectedClip.text.fontSize)} onChange={event => updateText(selectedClip.id, { fontSize: clamp(Number(event.target.value), 12, 320) }, 'size')} /></Field>
                      <Field label="Weight">
                        <select value={selectedClip.text.fontWeight} onChange={event => updateText(selectedClip.id, { fontWeight: Number(event.target.value) }, 'weight')}>
                          {(FONTS.find(font => font.family === selectedClip.text?.fontFamily)?.weights ?? [400, 700]).map(weight => <option key={weight} value={weight}>{weight}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="vd-swatch-row">
                      <label className="vd-color-field"><span>Colour</span><input type="color" value={selectedClip.text.color} onChange={event => updateText(selectedClip.id, { color: event.target.value }, 'color')} /><b>{selectedClip.text.color}</b></label>
                      <div className="vd-align-buttons">
                        {(['left', 'center', 'right'] as const).map(align => (
                          <button key={align} className={selectedClip.text?.align === align ? 'is-active' : ''} onClick={() => updateText(selectedClip.id, { align })} title={`Align ${align}`}>
                            <VellumIcon name={align === 'left' ? 'alignLeft' : align === 'right' ? 'alignRight' : 'alignCenter'} size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="vd-swatch-row">
                      <label className="vd-color-field"><span>Box</span><input type="color" value={selectedClip.text.background} onChange={event => updateText(selectedClip.id, { background: event.target.value }, 'background')} /><b>{Math.round(selectedClip.text.backgroundOpacity * 100)}%</b></label>
                      <input className="vd-inline-range" type="range" min={0} max={1} step={0.01} value={selectedClip.text.backgroundOpacity} onChange={event => updateText(selectedClip.id, { backgroundOpacity: Number(event.target.value) }, 'bgopacity')} />
                    </div>
                    <RangeField label="Width" value={selectedClip.text.width} min={0.15} max={1} step={0.01} suffix="" onChange={value => updateText(selectedClip.id, { width: value }, 'width')} />
                    <div className="vd-inspector-grid">
                      <Field label="X"><input type="range" min={0} max={1} step={0.01} value={selectedClip.x} onChange={event => updateClip(selectedClip.id, { x: Number(event.target.value) }, 'x')} /></Field>
                      <Field label="Y"><input type="range" min={0} max={1} step={0.01} value={selectedClip.y} onChange={event => updateClip(selectedClip.id, { y: Number(event.target.value) }, 'y')} /></Field>
                    </div>
                    <div className="vd-toggle-row">
                      <label><input type="checkbox" checked={selectedClip.text.uppercase} onChange={event => updateText(selectedClip.id, { uppercase: event.target.checked }, 'uppercase')} /> Uppercase</label>
                      <label><input type="checkbox" checked={selectedClip.text.shadow} onChange={event => updateText(selectedClip.id, { shadow: event.target.checked }, 'shadow')} /> Shadow</label>
                    </div>
                    <p className="vd-hint"><VellumIcon name="info" size={12} /> Drag the text directly on the preview to reposition it.</p>
                  </div>
                )}
                {selectedAsset && (
                  <div className="vd-inspector-section vd-asset-note">
                    <span className="vd-eyebrow">Source</span>
                    <div><VellumIcon name={KIND_ICONS[selectedAsset.kind]} size={14} /><strong>{selectedAsset.name}</strong></div>
                    <small>{selectedAsset.kind} · {formatBytes(selectedAsset.size)} · {selectedAsset.width ? `${selectedAsset.width} × ${selectedAsset.height}` : 'audio'}</small>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="vd-project-card">
                  <span className="vd-eyebrow">Project settings</span>
                  <h3>{project.name}</h3>
                  <p>Everything is saved in this browser. Export a WebM when you are done.</p>
                </div>
                <div className="vd-inspector-section">
                  <div className="vd-section-title"><span>Aspect ratio</span><span>{project.width} × {project.height}</span></div>
                  <div className="vd-aspect-grid">
                    {VIDEO_ASPECTS.map(aspect => (
                      <button key={aspect.id} className={project.width === aspect.width && project.height === aspect.height ? 'is-active' : ''} onClick={() => applyAspect(aspect.width, aspect.height)}>
                        <span className={`vd-aspect-shape is-${aspect.id.replace(':', '-')}`} />
                        <b>{aspect.id}</b>
                        <small>{aspect.label.split(' · ')[1]}</small>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="vd-inspector-section">
                  <div className="vd-section-title"><span>Project</span></div>
                  <div className="vd-inspector-grid">
                    <Field label="Frame rate">
                      <select value={project.fps} onChange={event => commit(current => ({ ...current, fps: Number(event.target.value) }))}>
                        <option value={24}>24 fps</option>
                        <option value={30}>30 fps</option>
                        <option value={60}>60 fps</option>
                      </select>
                    </Field>
                    <Field label="Background">
                      <div className="vd-color-row"><input type="color" value={project.background} onChange={event => commit(current => ({ ...current, background: event.target.value }), 'project:background')} /><b>{project.background}</b></div>
                    </Field>
                  </div>
                  <div className="vd-project-stats">
                    <div><strong>{formatTimecode(duration)}</strong><span>duration</span></div>
                    <div><strong>{totalClips}</strong><span>clips</span></div>
                    <div><strong>{mediaClips}</strong><span>media</span></div>
                    <div><strong>{textClips}</strong><span>text</span></div>
                  </div>
                </div>
                <div className="vd-inspector-section">
                  <div className="vd-section-title"><span>Track mix</span><span>Volume</span></div>
                  {project.tracks.map(track => (
                    <RangeField
                      key={track.id}
                      label={track.name}
                      value={track.volume}
                      min={0}
                      max={1}
                      step={0.01}
                      suffix=""
                      onChange={value => updateTrack(track.id, { volume: value })}
                    />
                  ))}
                </div>
                <div className="vd-inspector-section">
                  <div className="vd-section-title"><span>Start over</span></div>
                  <button className="vd-danger-link" onClick={newProject}><VellumIcon name="refresh" size={14} /> New video project</button>
                </div>
                <div className="vd-shortcuts">
                  <span className="vd-eyebrow">Keyboard</span>
                  <div><span>Play / pause</span><kbd>Space</kbd></div>
                  <div><span>Split clip</span><kbd>S</kbd></div>
                  <div><span>Delete clip</span><kbd>Del</kbd></div>
                  <div><span>Add text</span><kbd>T</kbd></div>
                  <div><span>Undo</span><kbd>⌘Z</kbd></div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      <div className="vd-media-pool" aria-hidden="true">
        {project.assets.map(asset => {
          if (asset.missing || !asset.src) return null;
          if (asset.kind === 'image') {
            return (
              <img
                key={asset.id}
                ref={element => {
                  if (element) mediaRefs.current.set(asset.id, element);
                  else mediaRefs.current.delete(asset.id);
                }}
                src={asset.src}
                alt=""
                onLoad={requestDraw}
              />
            );
          }
          if (asset.kind === 'video') {
            return (
              <video
                key={asset.id}
                ref={element => {
                  if (element) mediaRefs.current.set(asset.id, element);
                  else mediaRefs.current.delete(asset.id);
                }}
                src={asset.src}
                preload="auto"
                playsInline
                onLoadedData={requestDraw}
                onSeeked={requestDraw}
              />
            );
          }
          return (
            <audio
              key={asset.id}
              ref={element => {
                if (element) mediaRefs.current.set(asset.id, element);
                else mediaRefs.current.delete(asset.id);
              }}
              src={asset.src}
              preload="auto"
              onLoadedData={requestDraw}
            />
          );
        })}
      </div>

      {exporting && (
        <div className="vd-export-overlay" role="status" aria-live="polite">
          <div className="vd-export-card">
            <div className="vd-export-mark"><VellumIcon name="record" size={22} /></div>
            <span className="vd-eyebrow">Rendering in real time</span>
            <h2>Your video is taking shape.</h2>
            <p>WebM export records the canvas and mixed audio at {project.fps} fps. Keep this tab open.</p>
            <div className="vd-export-progress"><i style={{ transform: `scaleX(${Math.max(0.01, exportProgress)})` }} /></div>
            <div className="vd-export-meta"><span>{Math.round(exportProgress * 100)}%</span><span>{formatTimecode(currentTime)} / {formatTimecode(duration)}</span></div>
            <button className="vd-ghost-btn" onClick={cancelExport}>Cancel export</button>
          </div>
        </div>
      )}
    </div>
  );
}
