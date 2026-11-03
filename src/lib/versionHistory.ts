import type { Design } from './types';
import { uid } from './utils';

/**
 * Version history storage.
 *
 * Lives in its own IndexedDB database (`editrim-history`) so snapshots can be
 * pruned, cleared and quota-managed independently from uploaded assets. Every
 * operation fails soft: a blocked or unavailable store resolves with an empty
 * result rather than throwing into the editor.
 */

export const HISTORY_DB_NAME = 'editrim-history';

export type SnapshotKind = 'autosave' | 'checkpoint' | 'restore' | 'opened';

export type Snapshot = {
  id: string;
  designId: string;
  at: number;
  label: string;
  kind: SnapshotKind;
  pageCount: number;
  design: Design;
};

const DB_VERSION = 1;
const STORE = 'snapshots';
const DESIGN_INDEX = 'designId';
const MAX_PER_DESIGN = 40;
const DEDUPE_WINDOW_MS = 30_000;

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  try {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  } catch {
    return Promise.resolve(null);
  }

  dbPromise = new Promise<IDBDatabase | null>(resolve => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(HISTORY_DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }

    request.onupgradeneeded = () => {
      try {
        const db = request.result;
        const store = db.objectStoreNames.contains(STORE)
          ? request.transaction!.objectStore(STORE)
          : db.createObjectStore(STORE, { keyPath: 'id' });
        if (!store.indexNames.contains(DESIGN_INDEX)) {
          store.createIndex(DESIGN_INDEX, 'designId', { unique: false });
        }
      } catch {
        // A partial schema is still useful; reads simply resolve empty.
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  }).then(db => {
    if (!db) dbPromise = null;
    return db;
  });

  return dbPromise;
}

/** Run one request against the snapshots store, resolving `null` on failure. */
function run<T>(
  mode: IDBTransactionMode,
  body: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return openDb()
    .then(
      db =>
        new Promise<T | null>(resolve => {
          if (!db) {
            resolve(null);
            return;
          }
          try {
            const transaction = db.transaction(STORE, mode);
            const request = body(transaction.objectStore(STORE));
            let value: T | null = null;
            request.onsuccess = () => {
              value = request.result;
            };
            transaction.oncomplete = () => resolve(value);
            transaction.onerror = () => resolve(null);
            transaction.onabort = () => resolve(null);
          } catch {
            resolve(null);
          }
        }),
    )
    .catch(() => null);
}

function pageSignature(design: Design): string {
  try {
    return JSON.stringify(design.pages ?? []);
  } catch {
    return '';
  }
}

async function readDesign(designId: string): Promise<Snapshot[]> {
  const rows = await run<Snapshot[]>('readonly', store =>
    store.index(DESIGN_INDEX).getAll(designId) as IDBRequest<Snapshot[]>,
  );
  return (rows ?? []).slice().sort((a, b) => b.at - a.at);
}

async function prune(designId: string): Promise<void> {
  const rows = await readDesign(designId);
  const stale = rows.slice(MAX_PER_DESIGN);
  await Promise.all(stale.map(snapshot => run('readwrite', store => store.delete(snapshot.id))));
}

/* Writes are queued so an autosave and a checkpoint created in the same tick
   cannot both see the same "newest" row and insert duplicates. */
let writeQueue: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(task, task);
  writeQueue = next.catch(() => undefined);
  return next;
}

/** Every snapshot for one design, newest first. */
export async function listSnapshots(designId: string): Promise<Snapshot[]> {
  try {
    return await readDesign(designId);
  } catch {
    return [];
  }
}

/**
 * Persist a version. Identical page content is folded into the newest row
 * instead of growing the timeline: within 30s that is a no-op, after that the
 * row is refreshed. An explicit checkpoint is promoted over a baseline or
 * autosave row (same content, different intent) so the action is visible.
 */
export async function saveSnapshot(
  design: Design,
  label: string,
  kind: SnapshotKind,
): Promise<Snapshot | null> {
  if (!design || typeof design.id !== 'string' || !Array.isArray(design.pages)) return null;
  return serialize(async () => {
    try {
      const now = Date.now();
      const rows = await readDesign(design.id);
      const newest = rows[0];
      const signature = pageSignature(design);

      if (newest && pageSignature(newest.design) === signature) {
        const withinWindow = now - newest.at < DEDUPE_WINDOW_MS;
        const sameIntent = kind === newest.kind && label === newest.label;

        // Identical content and the same label inside the window: leave it alone.
        if (withinWindow && sameIntent) return null;

        // An autosave never relabels a checkpoint the user made explicitly.
        if (kind === 'autosave' && (newest.kind === 'checkpoint' || newest.kind === 'restore')) {
          if (withinWindow) return null;
          const refreshed: Snapshot = { ...newest, at: now };
          const ok = await run<IDBValidKey>('readwrite', store => store.put(refreshed));
          return ok === null ? null : refreshed;
        }

        const updated: Snapshot = {
          ...newest,
          at: now,
          label,
          kind,
          pageCount: design.pages.length,
        };
        const ok = await run<IDBValidKey>('readwrite', store => store.put(updated));
        return ok === null ? null : updated;
      }

      const snapshot: Snapshot = {
        id: uid('snap'),
        designId: design.id,
        at: now,
        label,
        kind,
        pageCount: design.pages.length,
        design: structuredClone(design),
      };
      const ok = await run<IDBValidKey>('readwrite', store => store.put(snapshot));
      if (ok === null) return null;
      await prune(design.id);
      return snapshot;
    } catch {
      return null;
    }
  });
}

export async function deleteSnapshot(id: string): Promise<void> {
  try {
    await run('readwrite', store => store.delete(id));
  } catch {
    // fail soft
  }
}

export async function deleteAllForDesign(designId: string): Promise<void> {
  try {
    const rows = await readDesign(designId);
    await Promise.all(rows.map(snapshot => run('readwrite', store => store.delete(snapshot.id))));
  } catch {
    // fail soft
  }
}

/** Called by the editor's autosave timer. Safe to call repeatedly. */
export async function recordAutoSnapshot(design: Design): Promise<void> {
  try {
    await saveSnapshot(design, 'Autosave', 'autosave');
  } catch {
    // fail soft
  }
}
