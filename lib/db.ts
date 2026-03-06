/**
 * IndexedDB Database Layer
 * Offline-first persistence for web
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb"

const DB_NAME = "mana-aarogyam"
const DB_VERSION = 2

interface ManaAarogyamDB extends DBSchema {
  patients: {
    key: string
    value: Record<string, any>
    indexes: {
      name: string
      phone: string
      village: string
      riskLevel: string
      createdAt: string
    }
  }
  consultations: {
    key: string
    value: Record<string, any>
    indexes: {
      patientId: string
      date: string
      createdAt: string
      status: string
    }
  }
  visits: {
    key: string
    value: Record<string, any>
    indexes: {
      patientId: string
      date: string
      synced: string
    }
  }
  settings: {
    key: string
    value: Record<string, any>
    indexes: {
      updatedAt: string
    }
  }
  syncQueue: {
    key: string
    value: Record<string, any>
    indexes: {
      createdAt: string
      entity: string
      action: string
    }
  }
  syncLog: {
    key: string
    value: Record<string, any>
    indexes: {
      timestamp: string
      status: string
    }
  }
  aiAnalysis: {
    key: string
    value: Record<string, any>
    indexes: {
      createdAt: string
    }
  }
  drafts: {
    key: string
    value: Record<string, any>
    indexes: {
      timestamp: string
    }
  }
}

export interface DBConfig {
  dbName: string
  version: number
}

export class IndexedDBManager {
  private db: IDBPDatabase<ManaAarogyamDB> | null = null
  private dbName: string
  private version: number

  constructor(config: DBConfig = { dbName: DB_NAME, version: DB_VERSION }) {
    this.dbName = config.dbName
    this.version = config.version
  }

  /**
   * Initialize database and create object stores
   */
  async init(): Promise<IDBPDatabase<ManaAarogyamDB>> {
    this.db = await openDB<ManaAarogyamDB>(this.dbName, this.version, {
      upgrade(db, _oldVersion, _newVersion, transaction) {
        createStoreWithIndexes(db, "patients", [
          ["name", "name"],
          ["phone", "phone"],
          ["village", "village"],
          ["riskLevel", "riskLevel"],
          ["createdAt", "createdAt"],
        ], transaction)

        createStoreWithIndexes(db, "consultations", [
          ["patientId", "patientId"],
          ["date", "date"],
          ["createdAt", "createdAt"],
          ["status", "status"],
        ], transaction)

        createStoreWithIndexes(db, "visits", [
          ["patientId", "patientId"],
          ["date", "date"],
          ["synced", "synced"],
        ], transaction)

        createStoreWithIndexes(db, "settings", [["updatedAt", "updatedAt"]], transaction)
        createStoreWithIndexes(db, "syncQueue", [
          ["createdAt", "createdAt"],
          ["entity", "entity"],
          ["action", "action"],
        ], transaction)
        createStoreWithIndexes(db, "syncLog", [
          ["timestamp", "timestamp"],
          ["status", "status"],
        ], transaction)
        createStoreWithIndexes(db, "aiAnalysis", [["createdAt", "createdAt"]], transaction)
        createStoreWithIndexes(db, "drafts", [["timestamp", "timestamp"]], transaction)
      },
    })

    return this.db
  }

  /**
   * Add a record to a store
   */
  async add<T extends { id: string }>(
    storeName: string,
    data: T
  ): Promise<string> {
    if (!this.db) await this.init()

    await (this.db as any).add(storeName, data)
    return data.id
  }

  /**
   * Put (update or insert) a record
   */
  async put<T extends { id: string }>(
    storeName: string,
    data: T
  ): Promise<string> {
    if (!this.db) await this.init()

    await (this.db as any).put(storeName, data)
    return data.id
  }

  /**
   * Get a single record by ID
   */
  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    if (!this.db) await this.init()

    return (await (this.db as any).get(storeName, id)) as T | undefined
  }

  /**
   * Get all records from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init()

    return (await (this.db as any).getAll(storeName)) as T[]
  }

  /**
   * Query by index
   */
  async queryByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    if (!this.db) await this.init()

    return (await (this.db as any).getAllFromIndex(storeName, indexName, value)) as T[]
  }

  /**
   * Delete a record
   */
  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init()

    await (this.db as any).delete(storeName, id)
  }

  /**
   * Clear entire store
   */
  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init()

    await (this.db as any).clear(storeName)
  }

  /**
   * Count records in store
   */
  async count(storeName: string): Promise<number> {
    if (!this.db) await this.init()

    return (this.db as any).count(storeName)
  }

  /**
   * Batch operations (transaction)
   */
  async batch<T>(
    storeName: string,
    operations: Array<{ type: 'put' | 'delete'; data?: T; id?: string }>
  ): Promise<void> {
    if (!this.db) await this.init()

    const tx = (this.db as any).transaction(storeName, "readwrite")
    for (const op of operations) {
      if (op.type === "put" && op.data) {
        await tx.store.put(op.data as never)
      } else if (op.type === "delete" && op.id) {
        await tx.store.delete(op.id)
      }
    }
    await tx.done
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

function createStoreWithIndexes(
  db: any,
  storeName: keyof ManaAarogyamDB,
  indexes: Array<[string, string]>,
  transaction: any,
) {
  const store = db.objectStoreNames.contains(storeName as string)
    ? transaction.objectStore(storeName)
    : db.createObjectStore(storeName as string, { keyPath: "id" })

  indexes.forEach(([name, keyPath]) => {
    if (!store.indexNames.contains(name)) {
      store.createIndex(name, keyPath)
    }
  })
}

// Singleton instance
let dbInstance: IndexedDBManager | null = null

export async function getDB(): Promise<IndexedDBManager> {
  if (!dbInstance) {
    dbInstance = new IndexedDBManager()
    await dbInstance.init()
  }
  return dbInstance
}
