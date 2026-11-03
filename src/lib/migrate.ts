/**
 * One-time migration from the app's previous name.
 *
 * The rename changes localStorage keys and IndexedDB database names. Existing
 * designs, brand kits, video projects, media and photo sessions are copied to
 * the new names before the app renders, then the old entries are removed.
 */

const LEGACY_PREFIX = 'vellum';
const BRAND_PREFIX = 'editrim';

function migrateLocalStorage() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LEGACY_PREFIX)) keys.push(key);
    }
    for (const key of keys) {
      const nextKey = BRAND_PREFIX + key.slice(LEGACY_PREFIX.length);
      const value = localStorage.getItem(key);
      if (value !== null && localStorage.getItem(nextKey) === null) {
        localStorage.setItem(nextKey, value);
      }
      localStorage.removeItem(key);
    }
  } catch {
    // Storage can be unavailable in private modes; the app still runs.
  }
}

function openExistingDb(name: string): Promise<IDBDatabase | null> {
  return new Promise(resolve => {
    let missing = false;
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(name);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      missing = true;
      request.transaction?.abort();
    };
    request.onsuccess = () => {
      if (missing) {
        request.result.close();
        resolve(null);
        return;
      }
      resolve(request.result);
    };
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function openNewDb(name: string, storeName: string, keyPath?: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        if (keyPath) db.createObjectStore(storeName, { keyPath });
        else db.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(request.error ?? new Error('Database blocked'));
  });
}

function readAll(db: IDBDatabase, storeName: string): Promise<{ keys: IDBValidKey[]; values: unknown[] }> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const keys = store.getAllKeys();
    const values = store.getAll();
    tx.oncomplete = () => resolve({ keys: keys.result, values: values.result });
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function countRecords(db: IDBDatabase, storeName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).count();
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function migrateDb(oldName: string, newName: string, storeName: string, keyPath?: string) {
  const oldDb = await openExistingDb(oldName);
  if (!oldDb) return;
  if (!oldDb.objectStoreNames.contains(storeName)) {
    oldDb.close();
    return;
  }
  const { keys, values } = await readAll(oldDb, storeName);
  oldDb.close();
  if (!keys.length) {
    indexedDB.deleteDatabase(oldName);
    return;
  }

  const newDb = await openNewDb(newName, storeName, keyPath);
  try {
    if ((await countRecords(newDb, storeName)) > 0) return;
    await new Promise<void>((resolve, reject) => {
      const tx = newDb.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      keys.forEach((key, index) => {
        if (keyPath) store.put(values[index]);
        else store.put(values[index], key);
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    indexedDB.deleteDatabase(oldName);
  } finally {
    newDb.close();
  }
}

export async function migrateLegacyStorage(): Promise<void> {
  migrateLocalStorage();
  await Promise.allSettled([
    migrateDb('vellum-assets', 'editrim-assets', 'assets', 'id'),
    migrateDb('vellum-photo-source', 'editrim-photo-source', 'source'),
    migrateDb('vellum-video-media', 'editrim-video-media', 'media'),
  ]);
}
