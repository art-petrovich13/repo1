import { http } from './client'
import type {
  AppNotification,
  AuthResponse,
  Category,
  Club,
  EventItem,
  EventPayload,
  Meta,
  MyReaction,
  Paginated,
  Participant,
  ReactionType,
  Registration,
  User,
} from './types'

type Msg<T> = { message: string; data: T }

export interface EventFilters {
  page?: number
  per_page?: number
  q?: string
  category_id?: number | ''
  club_id?: number | ''
  format?: 'offline' | 'online' | ''
  date_from?: string
  date_to?: string
  upcoming?: boolean
  sort?: 'starts_at' | 'popularity'
  order?: 'asc' | 'desc'
}

/** Убирает пустые параметры запроса. */
const clean = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null && v !== false))

export const api = {
  // ---------- Аутентификация ----------
  register: (body: { name: string; email: string; password: string; faculty: string; course: number }) =>
    http.post<{ message: string; user: User; debug_verify_url?: string }>('/auth/register', body).then((r) => r.data),
  verifyEmail: (token: string) => http.post<AuthResponse & { message: string }>('/auth/verify-email', { token }).then((r) => r.data),
  resendVerification: (email: string) => http.post<{ message: string }>('/auth/verify-email/resend', { email }).then((r) => r.data),
  login: (email: string, password: string) => http.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  logout: (refresh_token: string | null) => http.post('/auth/logout', { refresh_token }).then((r) => r.data),
  forgotPassword: (email: string) => http.post<{ message: string }>('/auth/password/forgot', { email }).then((r) => r.data),
  resetPassword: (body: { token: string; password: string; password_confirmation: string }) =>
    http.post<{ message: string }>('/auth/password/reset', body).then((r) => r.data),

  // ---------- Справочники и афиша ----------
  clubs: () => http.get<{ data: Club[] }>('/clubs').then((r) => r.data.data),
  categories: () => http.get<{ data: Category[] }>('/categories').then((r) => r.data.data),
  events: (filters: EventFilters) => http.get<Paginated<EventItem>>('/events', { params: clean(filters) }).then((r) => r.data),
  event: (id: number | string) => http.get<{ data: EventItem }>(`/events/${id}`).then((r) => r.data.data),

  // ---------- Студент ----------
  registerFor: (id: number) => http.post<Msg<EventItem>>(`/events/${id}/register`).then((r) => r.data),
  unregister: (id: number) => http.delete<Msg<EventItem>>(`/events/${id}/register`).then((r) => r.data),
  react: (id: number, type: ReactionType) => http.post<Msg<EventItem>>(`/events/${id}/reactions`, { type }).then((r) => r.data),
  unreact: (id: number, type: ReactionType) =>
    http.delete<Msg<EventItem>>(`/events/${id}/reactions`, { params: { type } }).then((r) => r.data),

  // ---------- Личный кабинет ----------
  me: () => http.get<{ data: User }>('/me').then((r) => r.data.data),
  updateMe: (body: Partial<Pick<User, 'name' | 'faculty' | 'course' | 'avatar_url'>>) =>
    http.patch<Msg<User>>('/me', body).then((r) => r.data),
  changePassword: (body: { current_password: string; password: string; password_confirmation: string }) =>
    http.post<{ message: string }>('/me/password', body).then((r) => r.data),
  myRegistrations: (params: { period?: 'upcoming' | 'past'; page?: number; per_page?: number }) =>
    http.get<Paginated<Registration>>('/me/registrations', { params: clean(params) }).then((r) => r.data),
  myReactions: (params: { type?: ReactionType | ''; page?: number; per_page?: number }) =>
    http.get<Paginated<MyReaction>>('/me/reactions', { params: clean(params) }).then((r) => r.data),
  notifications: (params: { page?: number; per_page?: number; unread?: boolean }) =>
    http.get<Paginated<AppNotification, Meta & { unread_count: number }>>('/me/notifications', { params: clean(params) }).then((r) => r.data),
  readNotification: (id: number) => http.patch<{ data: AppNotification }>(`/me/notifications/${id}/read`).then((r) => r.data.data),
  readAllNotifications: () => http.post<{ message: string }>('/me/notifications/read-all').then((r) => r.data),
  upload: (file: File, kind: 'cover' | 'avatar') => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    return http.post<{ data: { path: string; url: string } }>('/uploads', form).then((r) => r.data.data)
  },

  // ---------- Представитель ----------
  myEvents: (params: { status?: string; club_id?: number | ''; q?: string; page?: number; per_page?: number }) =>
    http.get<Paginated<EventItem>>('/me/events', { params: clean(params) }).then((r) => r.data),
  createEvent: (body: EventPayload) => http.post<Msg<EventItem>>('/events', body).then((r) => r.data),
  updateEvent: (id: number, body: Partial<EventPayload>) => http.patch<Msg<EventItem>>(`/events/${id}`, body).then((r) => r.data),
  publishEvent: (id: number) => http.post<Msg<EventItem>>(`/events/${id}/publish`).then((r) => r.data),
  cancelEvent: (id: number, reason: string) => http.post<Msg<EventItem>>(`/events/${id}/cancel`, { reason }).then((r) => r.data),
  deleteEvent: (id: number) => http.delete<{ message: string }>(`/events/${id}`).then((r) => r.data),
  participants: (id: number | string, params: { page?: number; per_page?: number; status?: string }) =>
    http
      .get<Paginated<Participant, Meta & { event: { id: number; title: string; capacity: number | null }; active_count: number }>>(
        `/events/${id}/participants`,
        { params: clean(params) },
      )
      .then((r) => r.data),
}
