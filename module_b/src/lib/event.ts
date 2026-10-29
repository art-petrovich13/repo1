import type { SyntheticEvent } from 'react'
import type { EventItem, EventState, NotificationType, RegistrationStatus } from '../api/types'

export const STATE_LABEL: Record<EventState, string> = {
  draft: 'Черновик',
  scheduled: 'Запланировано',
  ongoing: 'Идёт сейчас',
  finished: 'Завершено',
  cancelled: 'Отменено',
}

export const STATE_TONE: Record<EventState, 'brand' | 'success' | 'muted' | 'danger' | 'warning'> = {
  draft: 'warning',
  scheduled: 'brand',
  ongoing: 'success',
  finished: 'muted',
  cancelled: 'danger',
}

export const REG_STATUS_LABEL: Record<RegistrationStatus, string> = {
  active: 'Активна',
  cancelled: 'Отменена вами',
  cancelled_by_organizer: 'Отменена организатором',
}

export const NOTIFICATION_LABEL: Record<NotificationType, string> = {
  registration_confirmed: 'Регистрация',
  event_cancelled: 'Отмена',
  event_changed: 'Изменение',
  event_reminder: 'Напоминание',
  event_full: 'Места заняты',
}

/** Процент заполненности (null — без ограничения мест). */
export function fillPercent(e: Pick<EventItem, 'capacity' | 'registrations_count'>) {
  if (!e.capacity) return null
  return Math.min(100, Math.round((e.registrations_count / e.capacity) * 100))
}

/** Локальная SVG-обложка категории — запасной вариант (нет обложки или нет интернета). */
export function fallbackCover(e: Pick<EventItem, 'category'>) {
  const slug = e.category?.slug ?? 'fun'
  return `/uploads/covers/${['sport', 'science', 'culture', 'education', 'fun', 'volunteer'].includes(slug) ? slug : 'fun'}.svg`
}

export function coverOf(e: Pick<EventItem, 'cover_url' | 'category'>) {
  return e.cover_url ? (assetUrl(e.cover_url) as string) : fallbackCover(e)
}

/** onError для <img>: если внешнее фото не загрузилось — подставляем SVG категории. */
export const onCoverError = (e: Pick<EventItem, 'category'>) => (ev: SyntheticEvent<HTMLImageElement>) => {
  const img = ev.currentTarget
  const fallback = fallbackCover(e)
  if (!img.src.endsWith(fallback)) img.src = fallback
}

/** Абсолютный URL с бэкенда → относительный (через прокси Vite), чтобы не зависеть от хоста API. */
export function assetUrl(url: string | null | undefined) {
  if (!url) return null
  try {
    const u = new URL(url, window.location.origin)
    return u.pathname.startsWith('/uploads/') ? u.pathname : url
  } catch {
    return url
  }
}
