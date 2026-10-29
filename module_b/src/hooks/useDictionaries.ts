import { useEffect, useState } from 'react'
import { api } from '../api/endpoints'
import type { Category, Club } from '../api/types'

let cache: { clubs: Club[]; categories: Category[] } | null = null

/** Справочники Комьюнити и категорий (кэшируются на время сессии). */
export function useDictionaries() {
  const [data, setData] = useState(cache)

  useEffect(() => {
    if (cache) return
    Promise.all([api.clubs(), api.categories()])
      .then(([clubs, categories]) => {
        cache = { clubs, categories }
        setData(cache)
      })
      .catch(() => setData({ clubs: [], categories: [] }))
  }, [])

  return { clubs: data?.clubs ?? [], categories: data?.categories ?? [], loaded: data !== null }
}
