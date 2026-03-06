"use client"

import { useEffect, useState, useCallback } from "react"
import { saveData, getData, getAllData, deleteData, addToSyncQueue, initializeDB } from "@/lib/offline-storage"

export function useOfflineStorage(store: string) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initializeDB().then(() => setIsReady(true))
  }, [])

  const save = useCallback(
    async (data: any) => {
      if (!isReady) return
      await saveData(store, data)
      await addToSyncQueue("save", store, data)
    },
    [store, isReady],
  )

  const get = useCallback(
    async (id: string) => {
      if (!isReady) return null
      return getData(store, id)
    },
    [store, isReady],
  )

  const getAll = useCallback(async () => {
    if (!isReady) return []
    return getAllData(store)
  }, [store, isReady])

  const remove = useCallback(
    async (id: string) => {
      if (!isReady) return
      await deleteData(store, id)
      await addToSyncQueue("delete", store, { id })
    },
    [store, isReady],
  )

  return { save, get, getAll, remove, isReady }
}
