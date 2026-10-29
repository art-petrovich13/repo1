import { useCallback, useEffect, useState } from 'react'
import { friendlyMessage } from '../api/errors'
import type { Meta, Paginated } from '../api/types'

/** Загрузка постраничного списка с перезагрузкой при смене зависимостей. */
export function usePaged<T, M extends Meta = Meta>(load: (page: number) => Promise<Paginated<T, M>>, deps: unknown[]) {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<T[]>([])
  const [meta, setMeta] = useState<M | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loader = useCallback(load, deps)

  const reload = useCallback(
    (p = page) => {
      setLoading(true)
      setError(null)
      return loader(p)
        .then((res) => {
          // Если после удаления страница опустела — откатываемся на предыдущую
          if (res.data.length === 0 && p > 1) {
            setPage(p - 1)
            return
          }
          setItems(res.data)
          setMeta(res.meta)
        })
        .catch((e) => setError(friendlyMessage(e)))
        .finally(() => setLoading(false))
    },
    [loader, page],
  )

  useEffect(() => {
    setPage(1)
  }, [loader])

  useEffect(() => {
    reload(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loader])

  return { items, setItems, meta, loading, error, page, setPage, reload }
}
