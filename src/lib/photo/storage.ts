import type { PhotoSession } from './types';

const DB_NAME = 'vellum-photo-source';
const DB_VERSION = 1;
const STORE = 'source';
const SOURCE_KEY = 'current';
const SESSION_KEY = 'vellum_photo_session_v1';

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

export async function savePhotoSource(blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, SOURCE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPhotoSource(): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(SOURCE_KEY);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

export function savePhotoSession(session: PhotoSession): boolean {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, updatedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export async function loadPhotoSession(): Promise<{ session: PhotoSession; src: string | null } | null> {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PhotoSession;
    if (!session || !session.settings) return null;
    const blob = await loadPhotoSource().catch(() => null);
    return { session, src: blob ? URL.createObjectURL(blob) : null };
  } catch {
    return null;
  }
}

export function clearPhotoSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
