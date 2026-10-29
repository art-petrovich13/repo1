export type Role = 'student' | 'admin'

export interface UserClub {
  id: number
  name: string
  verified: boolean
  verified_at: string | null
}

export interface User {
  id: number
  email: string
  name: string
  faculty: string | null
  course: number | null
  avatar_url: string | null
  role: Role
  is_blocked: boolean
  email_verified: boolean
  is_representative: boolean
  clubs: UserClub[]
  created_at: string
}

export interface Club {
  id: number
  name: string
  description: string | null
  published_events_count?: number
}

export interface Category {
  id: number
  name: string
  slug: string
}

export type EventStatus = 'draft' | 'published' | 'cancelled'
export type EventState = 'draft' | 'scheduled' | 'ongoing' | 'finished' | 'cancelled'
export type EventFormat = 'offline' | 'online'
export type ReactionType = 'like' | 'interested'
export type RegistrationStatus = 'active' | 'cancelled' | 'cancelled_by_organizer'

export interface EventItem {
  id: number
  title: string
  description: string
  club: { id: number; name: string } | null
  category: Category | null
  starts_at: string
  ends_at: string
  location: string
  format: EventFormat
  capacity: number | null
  registrations_count: number
  seats_left: number | null
  is_full: boolean
  reactions: Record<ReactionType, number>
  popularity: number
  cover_url: string | null
  status: EventStatus
  state: EventState
  cancel_reason: string | null
  published_at: string | null
  created_at: string
  // Только для авторизованного пользователя
  is_registered?: boolean
  registration_status?: RegistrationStatus | null
  my_reactions?: ReactionType[]
  can_manage?: boolean
}

export interface Registration {
  id: number
  event_id: number
  status: RegistrationStatus
  registered_at: string
  cancelled_at: string | null
  can_cancel: boolean
  is_visited: boolean
  event: EventItem
}

export interface MyReaction {
  id: number
  event_id: number
  type: ReactionType
  created_at: string
  event: EventItem
}

export type NotificationType =
  | 'registration_confirmed'
  | 'event_cancelled'
  | 'event_changed'
  | 'event_reminder'
  | 'event_full'

export interface AppNotification {
  id: number
  type: NotificationType
  title: string
  message: string
  payload: { event_id?: number }
  event_id: number | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface Participant {
  id: number
  user_id: number
  name: string
  email: string
  faculty: string | null
  course: number | null
  registered_at: string
  status: RegistrationStatus
}

export interface Meta {
  page: number
  per_page: number
  total: number
  last_page: number
  [key: string]: unknown
}

export interface Paginated<T, M = Meta> {
  data: T[]
  meta: M
}

export interface AuthResponse {
  user: User
  token_type: 'Bearer'
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface EventPayload {
  club_id?: number
  category_id: number
  title: string
  description: string
  starts_at: string
  ends_at: string
  location: string
  format: EventFormat
  capacity: number | null
  cover_url: string | null
}
