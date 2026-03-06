// IndexedDB wrapper for offline-first data storage
interface StoredData {
  id: string
  data: any
  timestamp: number
  synced: boolean
}

const DB_NAME = "ManaAarogyam"
const DB_VERSION = 1
const STORES = {
  PATIENTS: "patients",
  VISITS: "visits",
  CONSULTATIONS: "consultations",
  PRESCRIPTIONS: "prescriptions",
  SYNC_QUEUE: "syncQueue",
}

let db: IDBDatabase | null = null

export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create object stores
      Object.values(STORES).forEach((store) => {
        if (!database.objectStoreNames.contains(store)) {
          database.createObjectStore(store, { keyPath: "id" })
        }
      })
    }
  })
}

export async function saveData(store: string, data: any): Promise<void> {
  if (!db) await initializeDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([store], "readwrite")
    const objectStore = transaction.objectStore(store)

    const storedData: StoredData = {
      id: data.id || `${Date.now()}-${Math.random()}`,
      data,
      timestamp: Date.now(),
      synced: false,
    }

    const request = objectStore.put(storedData)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getData(store: string, id: string): Promise<any> {
  if (!db) await initializeDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([store], "readonly")
    const objectStore = transaction.objectStore(store)
    const request = objectStore.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result?.data || null)
  })
}

export async function getAllData(store: string): Promise<any[]> {
  if (!db) await initializeDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([store], "readonly")
    const objectStore = transaction.objectStore(store)
    const request = objectStore.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const results = request.result.map((item: StoredData) => item.data)
      resolve(results)
    }
  })
}

export async function deleteData(store: string, id: string): Promise<void> {
  if (!db) await initializeDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([store], "readwrite")
    const objectStore = transaction.objectStore(store)
    const request = objectStore.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function addToSyncQueue(action: string, store: string, data: any): Promise<void> {
  if (!db) await initializeDB()

  const syncItem = {
    id: `${Date.now()}-${Math.random()}`,
    action,
    store,
    data,
    timestamp: Date.now(),
    retries: 0,
  }

  return saveData(STORES.SYNC_QUEUE, syncItem)
}

export async function getSyncQueue(): Promise<any[]> {
  return getAllData(STORES.SYNC_QUEUE)
}

export async function clearSyncQueue(): Promise<void> {
  if (!db) await initializeDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORES.SYNC_QUEUE], "readwrite")
    const objectStore = transaction.objectStore(STORES.SYNC_QUEUE)
    const request = objectStore.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function removeSyncItem(id: string): Promise<void> {
  return deleteData(STORES.SYNC_QUEUE, id)
}

export const STORE_NAMES = STORES
