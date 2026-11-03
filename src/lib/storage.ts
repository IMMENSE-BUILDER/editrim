import type { Background, BrandKit, Design, Page, Template } from './types';
import { uid } from './utils';

const INDEX_KEY = 'editrim.index.v1';
const DESIGN_KEY = (id: string) => `editrim.design.v1.${id}`;
const BRAND_KEY = 'editrim.brand.v1';

export type DesignMeta = {
  id: string;
  title: string;
  category: string;
  width: number;
  height: number;
  pageCount: number;
  createdAt: number;
  updatedAt: number;
  templateId?: string;
};

function readIndex(): DesignMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(items: DesignMeta[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(items));
}

export function listDesigns(): DesignMeta[] {
  return readIndex().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getDesign(id: string): Design | null {
  try {
    const raw = localStorage.getItem(DESIGN_KEY(id));
    if (!raw) return null;
    return JSON.parse(raw) as Design;
  } catch {
    return null;
  }
}

export function getMeta(id: string): DesignMeta | null {
  return readIndex().find(d => d.id === id) ?? null;
}

export function saveDesign(design: Design) {
  const next = { ...design, updatedAt: Date.now() };
  localStorage.setItem(DESIGN_KEY(design.id), JSON.stringify(next));
  const index = readIndex();
  const meta: DesignMeta = {
    id: design.id,
    title: design.title,
    category: design.category,
    width: design.size.width,
    height: design.size.height,
    pageCount: design.pages.length,
    createdAt: design.createdAt,
    updatedAt: next.updatedAt,
    templateId: design.templateId,
  };
  const i = index.findIndex(d => d.id === design.id);
  if (i >= 0) index[i] = meta;
  else index.push(meta);
  writeIndex(index);
  return next;
}

export function deleteDesign(id: string) {
  localStorage.removeItem(DESIGN_KEY(id));
  writeIndex(readIndex().filter(d => d.id !== id));
}

export function duplicateDesign(id: string): Design | null {
  const d = getDesign(id);
  if (!d) return null;
  const copy: Design = {
    ...structuredClone(d),
    id: uid('d'),
    title: `${d.title} copy`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveDesign(copy);
  return copy;
}

export function renameDesign(id: string, title: string) {
  const d = getDesign(id);
  if (!d) return;
  d.title = title;
  saveDesign(d);
}

export function newPage(background: Background = { kind: 'solid', color: '#FFFFFF' }): Page {
  return { id: uid('p'), name: 'Page', background, elements: [] };
}

export function createDesign(opts: {
  title: string;
  width: number;
  height: number;
  category?: string;
  template?: Template;
}): Design {
  const now = Date.now();
  const design: Design = {
    id: uid('d'),
    title: opts.title,
    category: opts.category ?? opts.template?.category ?? 'Custom',
    size: { name: opts.template?.size.name ?? `${opts.width} × ${opts.height}`, width: opts.width, height: opts.height },
    pages: opts.template ? structuredClone(opts.template.pages) : [newPage()],
    createdAt: now,
    updatedAt: now,
    templateId: opts.template?.id,
  };
  saveDesign(design);
  return design;
}

export function fromTemplate(template: Template): Design {
  return createDesign({
    title: template.name,
    width: template.size.width,
    height: template.size.height,
    category: template.category,
    template,
  });
}

export function storageUsage() {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      total += (localStorage.getItem(k) ?? '').length * 2;
    }
  } catch {
    // ignore
  }
  return total;
}

/* ---------------- Brand kit ---------------- */

export const DEFAULT_BRAND: BrandKit = {
  name: 'My brand',
  colors: ['#2440F0', '#D8F55A', '#14130F', '#F4F1EA', '#FF6A46'],
  fonts: ['Bricolage Grotesque', 'Inter'],
  voice: '',
};

export function getBrand(): BrandKit {
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    if (!raw) return { ...DEFAULT_BRAND };
    return { ...DEFAULT_BRAND, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_BRAND };
  }
}

export function saveBrand(kit: BrandKit) {
  localStorage.setItem(BRAND_KEY, JSON.stringify(kit));
}

/* ---------------- Uploaded assets (IndexedDB) ---------------- */

const DB_NAME = 'editrim-assets';
const STORE = 'assets';
const memCache = new Map<string, string>();

export type AssetRecord = {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
  width?: number;
  height?: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export async function addAsset(name: string, dataUrl: string): Promise<string> {
  const id = uid('asset');
  let width: number | undefined;
  let height: number | undefined;
  if (dataUrl.startsWith('data:image') && !dataUrl.startsWith('data:image/svg')) {
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = dataUrl;
      });
      width = img.naturalWidth;
      height = img.naturalHeight;
    } catch {
      // dimensions are optional
    }
  }
  const rec: AssetRecord = { id, name, dataUrl, createdAt: Date.now(), width, height };
  await tx('readwrite', s => s.put(rec));
  memCache.set(id, dataUrl);
  return `asset:${id}`;
}

export async function listAssets(): Promise<AssetRecord[]> {
  const all = await tx<AssetRecord[]>('readonly', s => s.getAll());
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAsset(id: string): Promise<string | null> {
  if (memCache.has(id)) return memCache.get(id)!;
  const rec = await tx<AssetRecord | undefined>('readonly', s => s.get(id));
  if (!rec) return null;
  memCache.set(id, rec.dataUrl);
  return rec.dataUrl;
}

export async function deleteAsset(id: string) {
  memCache.delete(id);
  await tx('readwrite', s => s.delete(id));
}

export const isAssetSrc = (src: string) => src.startsWith('asset:');
export const assetId = (src: string) => src.slice('asset:'.length);

export async function resolveSrc(src: string): Promise<string> {
  if (!isAssetSrc(src)) return src;
  const data = await getAsset(assetId(src));
  return data ?? '';
}

/** Inline uploaded assets as data URLs — used for share links. */
export async function hydrateAssets(design: Design): Promise<Design> {
  const copy = structuredClone(design);
  await Promise.all(
    copy.pages.flatMap(p =>
      p.elements.map(async el => {
        if (el.type === 'image' && isAssetSrc(el.src)) {
          const data = await resolveSrc(el.src);
          if (data) el.src = data;
        }
      }),
    ),
  );
  await Promise.all(
    copy.pages.map(async p => {
      if (p.background.kind === 'image' && isAssetSrc(p.background.src)) {
        const data = await resolveSrc(p.background.src);
        if (data) p.background.src = data;
      }
    }),
  );
  return copy;
}
