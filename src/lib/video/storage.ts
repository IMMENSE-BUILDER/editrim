import type { VideoAsset, VideoProject } from './types';

const DB_NAME = 'vellum-video-media';
const DB_VERSION = 1;
const STORE = 'media';
const PROJECT_KEY = 'vellum_video_project_v1';

type PersistedAsset = Omit<VideoAsset, 'src'>;

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

export function saveVideoProject(project: VideoProject): boolean {
  try {
    const assets: PersistedAsset[] = project.assets.map(({ src, ...asset }) => asset);
    localStorage.setItem(PROJECT_KEY, JSON.stringify({ ...project, assets, updatedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export async function loadVideoProject(): Promise<VideoProject | null> {
  try {
    const raw = localStorage.getItem(PROJECT_KEY);
    if (!raw) return null;
    const persisted = JSON.parse(raw) as Omit<VideoProject, 'assets'> & { assets: PersistedAsset[] };
    if (!Array.isArray(persisted.clips) || !Array.isArray(persisted.assets)) return null;
    const assets = await Promise.all(
      persisted.assets.map(async asset => {
        const blob = await loadMediaBlob(asset.id).catch(() => null);
        if (!blob) return { ...asset, src: '', missing: true };
        return { ...asset, src: URL.createObjectURL(blob), missing: false };
      }),
    );
    return { ...persisted, assets, updatedAt: persisted.updatedAt || Date.now() };
  } catch {
    return null;
  }
}

export function clearVideoProject(): void {
  localStorage.removeItem(PROJECT_KEY);
}
