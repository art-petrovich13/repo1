import { isAxiosError } from 'axios'

/** Ошибка API в едином формате {"error": {"code", "message", "fields"}}. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string[]>

  constructor(status: number, code: string, message: string, fields: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }

  /** Первое сообщение для поля формы. */
  field(name: string): string | undefined {
    return this.fields[name]?.[0]
  }
}

/** Дружелюбные сообщения по кодам ошибок API. */
const FRIENDLY: Record<string, string> = {
  ALREADY_REGISTERED: 'Вы уже зарегистрированы на это мероприятие',
  EVENT_FULL: 'Все места заняты — регистрация закрыта',
  EVENT_STARTED: 'Мероприятие уже началось или прошло',
  EVENT_CANCELLED: 'Мероприятие отменено организатором',
  USER_BLOCKED: 'Ваш аккаунт заблокирован. Обратитесь к администратору',
  NOT_VERIFIED: 'Подтвердите email — ссылка отправлена на вашу почту',
  UNAUTHORIZED: 'Требуется вход в аккаунт',
  FORBIDDEN: 'Недостаточно прав для этого действия',
  NOT_FOUND: 'Не найдено',
  VALIDATION_ERROR: 'Проверьте правильность заполнения полей',
  ALREADY_PUBLISHED: 'Мероприятие уже опубликовано',
  EVENT_NOT_DRAFT: 'Удалить можно только черновик',
  NETWORK_ERROR: 'Сервер недоступен. Проверьте подключение',
  SERVER_ERROR: 'Что-то пошло не так. Попробуйте позже',
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (isAxiosError(err)) {
    if (!err.response) return new ApiError(0, 'NETWORK_ERROR', FRIENDLY.NETWORK_ERROR)
    const body = err.response.data as { error?: { code?: string; message?: string; fields?: Record<string, string[]> } }
    const code = body?.error?.code ?? (err.response.status >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR')
    return new ApiError(err.response.status, code, body?.error?.message ?? FRIENDLY[code] ?? 'Ошибка запроса', body?.error?.fields ?? {})
  }
  return new ApiError(0, 'UNKNOWN', err instanceof Error ? err.message : 'Неизвестная ошибка')
}

/** Коды, для которых показываем заготовленное дружелюбное сообщение вместо серверного. */
const PREFER_FRIENDLY = new Set(['ALREADY_REGISTERED', 'EVENT_FULL', 'EVENT_STARTED', 'EVENT_CANCELLED', 'USER_BLOCKED', 'NETWORK_ERROR', 'SERVER_ERROR'])

/** Сообщение для пользователя (code → дружелюбный текст). */
export function friendlyMessage(err: unknown): string {
  const e = toApiError(err)
  if (PREFER_FRIENDLY.has(e.code)) return FRIENDLY[e.code]
  return e.message || FRIENDLY[e.code] || 'Ошибка запроса'
}
