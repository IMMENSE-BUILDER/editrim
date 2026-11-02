import { uid } from '../utils';

export type VideoAssetKind = 'video' | 'image' | 'audio';
export type VideoClipKind = 'video' | 'image' | 'text' | 'audio';
export type VideoTrackKind = 'video' | 'overlay' | 'audio';

export type VideoAsset = {
  id: string;
  name: string;
  kind: VideoAssetKind;
  src: string;
  duration: number;
  width: number;
  height: number;
  thumbnail: string;
  waveform?: number[];
  mime: string;
  size: number;
  missing?: boolean;
};

export type VideoTrack = {
  id: 'video' | 'overlay' | 'audio';
  name: string;
  kind: VideoTrackKind;
  hidden: boolean;
  muted: boolean;
  volume: number;
};

export type ClipFilters = {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
};

export type TextMotion = 'none' | 'fade' | 'rise' | 'pop';

export type TextOverlayStyle = {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  background: string;
  backgroundOpacity: number;
  width: number;
  lineHeight: number;
  letterSpacing: number;
  uppercase: boolean;
  shadow: boolean;
  motion: TextMotion;
};

export type VideoClip = {
  id: string;
  trackId: VideoTrack['id'];
  kind: VideoClipKind;
  name: string;
  assetId?: string;
  start: number;
  duration: number;
  inPoint: number;
  speed: number;
  opacity: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  x: number;
  y: number;
  scale: number;
  filters: ClipFilters;
  text?: TextOverlayStyle;
};

export type VideoProject = {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  background: string;
  tracks: VideoTrack[];
  clips: VideoClip[];
  assets: VideoAsset[];
  createdAt: number;
  updatedAt: number;
};

export const VIDEO_ASPECTS = [
  { id: '16:9', label: '16:9 · Widescreen', width: 1920, height: 1080 },
  { id: '9:16', label: '9:16 · Vertical', width: 1080, height: 1920 },
  { id: '1:1', label: '1:1 · Square', width: 1080, height: 1080 },
  { id: '4:5', label: '4:5 · Portrait', width: 1080, height: 1350 },
  { id: '21:9', label: '21:9 · Cinema', width: 2560, height: 1080 },
  { id: '4:3', label: '4:3 · Classic', width: 1440, height: 1080 },
] as const;

export const DEFAULT_TEXT: TextOverlayStyle = {
  content: 'Your headline',
  fontFamily: 'Inter',
  fontSize: 84,
  fontWeight: 700,
  color: '#F4F1EA',
  align: 'center',
  background: '#14130F',
  backgroundOpacity: 0,
  width: 0.72,
  lineHeight: 1.12,
  letterSpacing: -1,
  uppercase: false,
  shadow: true,
  motion: 'none',
};

export const DEFAULT_FILTERS: ClipFilters = { brightness: 1, contrast: 1, saturation: 1, blur: 0 };

export function createVideoTracks(): VideoTrack[] {
  return [
    { id: 'video', name: 'Video', kind: 'video', hidden: false, muted: false, volume: 1 },
    { id: 'overlay', name: 'Overlay', kind: 'overlay', hidden: false, muted: false, volume: 1 },
    { id: 'audio', name: 'Audio', kind: 'audio', hidden: false, muted: false, volume: 1 },
  ];
}

export function newVideoProject(name = 'Untitled video'): VideoProject {
  return {
    id: uid('video'),
    name,
    width: 1920,
    height: 1080,
    fps: 30,
    background: '#0B0911',
    tracks: createVideoTracks(),
    clips: [],
    assets: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function clipEnd(clip: VideoClip): number {
  return clip.start + clip.duration;
}

export function projectDuration(project: VideoProject): number {
  return project.clips.reduce((max, clip) => Math.max(max, clipEnd(clip)), 0);
}

export function trackDuration(project: VideoProject, trackId: VideoTrack['id']): number {
  return project.clips
    .filter(clip => clip.trackId === trackId)
    .reduce((max, clip) => Math.max(max, clipEnd(clip)), 0);
}

export function activeClips(project: VideoProject, trackId: VideoTrack['id'], time: number): VideoClip[] {
  return project.clips.filter(
    clip => clip.trackId === trackId && time >= clip.start && time < clipEnd(clip),
  );
}

export function clipOpacity(clip: VideoClip, time: number): number {
  const fadeIn = clip.fadeIn > 0 ? Math.min(1, (time - clip.start) / clip.fadeIn) : 1;
  const fadeOut = clip.fadeOut > 0 ? Math.min(1, (clipEnd(clip) - time) / clip.fadeOut) : 1;
  return Math.max(0, Math.min(1, clip.opacity * fadeIn * fadeOut));
}

export function formatTimecode(seconds: number, precise = true): string {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  const whole = Math.floor(remainder);
  if (!precise) return `${minutes}:${String(whole).padStart(2, '0')}`;
  const hundredths = Math.floor((remainder - whole) * 100);
  return `${minutes}:${String(whole).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

export function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export function createTextClip(at: number, style: Partial<TextOverlayStyle> = {}): VideoClip {
  return {
    id: uid('clip'),
    trackId: 'overlay',
    kind: 'text',
    name: style.content?.slice(0, 28) || 'Text overlay',
    start: Math.max(0, at),
    duration: 4,
    inPoint: 0,
    speed: 1,
    opacity: 1,
    volume: 1,
    fadeIn: 0,
    fadeOut: 0,
    x: 0.5,
    y: 0.5,
    scale: 1,
    filters: { ...DEFAULT_FILTERS },
    text: { ...DEFAULT_TEXT, ...style },
  };
}

export function normalizeVideoProject(project: VideoProject): VideoProject {
  return {
    ...project,
    createdAt: project.createdAt ?? project.updatedAt ?? Date.now(),
    updatedAt: project.updatedAt ?? Date.now(),
    clips: project.clips.map(clip => ({
      ...clip,
      speed: clip.speed && clip.speed > 0 ? clip.speed : 1,
      filters: { ...DEFAULT_FILTERS, ...(clip.filters ?? {}) },
      text: clip.text ? { ...DEFAULT_TEXT, ...clip.text, motion: clip.text.motion ?? 'none' } : clip.text,
    })),
  };
}

export function clipColor(kind: VideoClipKind): string {
  if (kind === 'video') return '#2440F0';
  if (kind === 'image') return '#8B5CFF';
  if (kind === 'audio') return '#1FBCC1';
  return '#D8F55A';
}

export function assetKindFromMime(mime: string): VideoAssetKind | null {
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  return null;
}

export function sanitizeVideoFilename(name: string): string {
  return (name.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'vellum-video');
}
