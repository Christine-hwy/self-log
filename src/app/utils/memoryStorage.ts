import { TravelMemory } from '../../data/site';

const DB_NAME = 'journey-footprints';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';
const MEMORIES_KEY = 'memories';
const LOCAL_STORAGE_KEY = 'journey.memories';

export async function loadStoredMemories(fallback: TravelMemory[]) {
  try {
    const db = await openMemoryDb();
    const memories = await readFromDb<TravelMemory[]>(db, MEMORIES_KEY);
    if (Array.isArray(memories)) return memories;
  } catch {
    return readLocalStorageMemories(fallback);
  }

  return readLocalStorageMemories(fallback);
}

export async function saveStoredMemories(memories: TravelMemory[]) {
  try {
    const db = await openMemoryDb();
    await writeToDb(db, MEMORIES_KEY, memories);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memoriesWithoutMedia(memories)));
  } catch {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memories));
  }
}

function openMemoryDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readFromDb<T>(db: IDBDatabase, key: string) {
  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

function writeToDb(db: IDBDatabase, key: string, value: TravelMemory[]) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function readLocalStorageMemories(fallback: TravelMemory[]) {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as TravelMemory[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function memoriesWithoutMedia(memories: TravelMemory[]) {
  return memories.map((memory) => ({
    ...memory,
    photos: memory.photos.map((photo) => ({ ...photo, url: '' })),
    videos: memory.videos.map((video) => ({ ...video, url: '' }))
  }));
}
