import { projectDuration, normalizeVideoProject, newVideoProject, type VideoAsset, type VideoProject } from './types';
import { uid } from '../utils';

const DB_NAME = 'vellum-video-media';
const DB_VERSION = 1;
const STORE = 'media';
const LEGACY_PROJECT_KEY = 'vellum_video_project_v1';
const INDEX_KEY = 'vellum_video_projects_v1';
const PROJECT_PREFIX = 'vellum_video_project_v2_';
const LAST_KEY = 'vellum_video_last_id_v1';

export type VideoProjectMeta = {
  id: string;
  name: string;
  width: number;
  height: number;
  duration: number;
  clipCount: number;
  assetCount: number;
  poster: string | null;
  createdAt: number;
  updatedAt: number;
};

type PersistedAsset = Omit<VideoAsset, 'src'>;
type PersistedProject = Omit<VideoProject, 'assets'> & { assets: PersistedAsset[] };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadMediaBlob(id: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

function projectKey(id: string): string {
  return `${PROJECT_PREFIX}${id}`;
}

function readIndex(): VideoProjectMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(index: VideoProjectMeta[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function metaFor(project: VideoProject): VideoProjectMeta {
  const poster = project.assets.find(asset => asset.kind !== 'audio' && asset.thumbnail)?.thumbnail ?? null;
  return {
    id: project.id,
    name: project.name,
    width: project.width,
    height: project.height,
    duration: projectDuration(project),
    clipCount: project.clips.length,
    assetCount: project.assets.length,
    poster,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function writeProject(project: VideoProject): boolean {
  try {
    const assets: PersistedAsset[] = project.assets.map(({ src, ...asset }) => asset);
    const next = { ...project, assets, updatedAt: Date.now(), createdAt: project.createdAt || project.updatedAt || Date.now() };
    localStorage.setItem(projectKey(next.id), JSON.stringify(next));
    const index = readIndex().filter(item => item.id !== next.id);
    index.push(metaFor(next as unknown as VideoProject));
    writeIndex(index.sort((a, b) => b.updatedAt - a.updatedAt));
    localStorage.setItem(LAST_KEY, next.id);
    return true;
  } catch {
    return false;
  }
}

function migrateLegacy(): void {
  try {
    const raw = localStorage.getItem(LEGACY_PROJECT_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as PersistedProject;
    if (!parsed || !Array.isArray(parsed.clips)) return;
    const project = normalizeVideoProject({
      ...parsed,
      id: parsed.id || uid('video'),
      createdAt: parsed.createdAt || parsed.updatedAt || Date.now(),
      updatedAt: parsed.updatedAt || Date.now(),
    } as VideoProject);
    const assets: PersistedAsset[] = (parsed.assets ?? []).map(asset => {
      const { src: _src, ...rest } = asset as VideoAsset;
      return rest;
    });
    localStorage.setItem(projectKey(project.id), JSON.stringify({ ...project, assets }));
    const index = readIndex();
    if (!index.some(item => item.id === project.id)) {
      index.push(metaFor(project));
      writeIndex(index.sort((a, b) => b.updatedAt - a.updatedAt));
    }
    if (!localStorage.getItem(LAST_KEY)) localStorage.setItem(LAST_KEY, project.id);
    localStorage.removeItem(LEGACY_PROJECT_KEY);
  } catch {
    // Leave an unreadable legacy project untouched rather than losing it.
  }
}

export function listVideoProjects(): VideoProjectMeta[] {
  migrateLegacy();
  return readIndex().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveVideoProject(project: VideoProject): boolean {
  return writeProject(project);
}

export async function loadVideoProject(id?: string): Promise<VideoProject | null> {
  migrateLegacy();
  const targetId = id || localStorage.getItem(LAST_KEY) || readIndex()[0]?.id;
  if (!targetId) return null;
  try {
    const raw = localStorage.getItem(projectKey(targetId)) || localStorage.getItem(LEGACY_PROJECT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedProject;
    if (!parsed || !Array.isArray(parsed.clips) || !Array.isArray(parsed.assets)) return null;
    const project = normalizeVideoProject({
      ...parsed,
      id: parsed.id || targetId,
      createdAt: parsed.createdAt || parsed.updatedAt || Date.now(),
      updatedAt: parsed.updatedAt || Date.now(),
    } as VideoProject);
    const assets = await Promise.all(
      parsed.assets.map(async asset => {
        const blob = await loadMediaBlob(asset.id).catch(() => null);
        if (!blob) return { ...asset, src: '', missing: true };
        return { ...asset, src: URL.createObjectURL(blob), missing: false };
      }),
    );
    localStorage.setItem(LAST_KEY, project.id);
    return { ...project, assets };
  } catch {
    return null;
  }
}

export function createVideoProject(name = 'Untitled video'): VideoProject {
  const project = newVideoProject(name);
  writeProject(project);
  return project;
}

export function duplicateVideoProject(id: string): VideoProject | null {
  const raw = localStorage.getItem(projectKey(id));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedProject;
    const now = Date.now();
    const copy = {
      ...parsed,
      id: uid('video'),
      name: `${parsed.name} copy`,
      createdAt: now,
      updatedAt: now,
    } as VideoProject;
    writeProject(copy);
    return copy;
  } catch {
    return null;
  }
}

export function renameVideoProject(id: string, name: string): boolean {
  const raw = localStorage.getItem(projectKey(id));
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as PersistedProject;
    const project = { ...parsed, name: name.trim() || 'Untitled video', updatedAt: Date.now() };
    localStorage.setItem(projectKey(id), JSON.stringify(project));
    const index = readIndex().map(item => item.id === id ? { ...item, name: project.name, updatedAt: project.updatedAt } : item);
    writeIndex(index.sort((a, b) => b.updatedAt - a.updatedAt));
    return true;
  } catch {
    return false;
  }
}

export function deleteVideoProject(id: string): void {
  localStorage.removeItem(projectKey(id));
  const index = readIndex().filter(item => item.id !== id);
  writeIndex(index);
  if (localStorage.getItem(LAST_KEY) === id) {
    if (index[0]) localStorage.setItem(LAST_KEY, index[0].id);
    else localStorage.removeItem(LAST_KEY);
  }
}

export function getLastVideoProjectId(): string | null {
  migrateLegacy();
  return localStorage.getItem(LAST_KEY) || readIndex()[0]?.id || null;
}
