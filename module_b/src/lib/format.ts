const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const dateYearFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const weekdayFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
const shortFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const dayFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric' })
const monFmt = new Intl.DateTimeFormat('ru-RU', { month: 'short' })

const sameYear = (d: Date) => d.getFullYear() === new Date().getFullYear()

export const formatDate = (iso: string) => {
  const d = new Date(iso)
  return (sameYear(d) ? dateFmt : dateYearFmt).format(d)
}
export const formatTime = (iso: string) => timeFmt.format(new Date(iso))
export const formatWeekday = (iso: string) => weekdayFmt.format(new Date(iso))
export const formatShort = (iso: string) => shortFmt.format(new Date(iso))
export const formatDay = (iso: string) => dayFmt.format(new Date(iso))
export const formatMonth = (iso: string) => monFmt.format(new Date(iso)).replace('.', '')

/** «12 ноября, 15:00 – 18:00» или «12 ноября, 15:00 – 14 ноября, 10:00» */
export function formatRange(startIso: string, endIso: string) {
  const s = new Date(startIso)
  const e = new Date(endIso)
  const sameDay = s.toDateString() === e.toDateString()
  return sameDay
    ? `${formatDate(startIso)}, ${formatTime(startIso)} – ${formatTime(endIso)}`
    : `${formatDate(startIso)}, ${formatTime(startIso)} – ${formatDate(endIso)}, ${formatTime(endIso)}`
}

const rtf = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' })

/** «5 минут назад», «через 2 дня» */
export function relative(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return 'только что'
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day')
  return formatDate(iso)
}

/** Склонение: plural(5, ['место', 'места', 'мест']) */
export function plural(n: number, forms: [string, string, string]) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1]
  return forms[2]
}

/** ISO → значение для <input type="datetime-local"> в локальном времени */
export function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Значение datetime-local → ISO с часовым поясом */
export const fromLocalInput = (value: string) => new Date(value).toISOString()
