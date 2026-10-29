import { ArrowLeft, CalendarClock, Check, Globe, ImagePlus, Loader2, MapPin, Save, Send, Upload, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage, toApiError } from '../../api/errors'
import type { EventFormat, EventItem, EventPayload } from '../../api/types'
import { EventCard } from '../../components/events/EventCard'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useDictionaries } from '../../hooks/useDictionaries'
import { cn } from '../../lib/cn'
import { assetUrl } from '../../lib/event'
import { fromLocalInput, toLocalInput } from '../../lib/format'

const PRESET_COVERS = ['science', 'robotics', 'sport', 'culture', 'education', 'fun', 'volunteer', 'online'].map((n) => `/uploads/covers/${n}.svg`)

interface FormState {
  club_id: string
  category_id: string
  title: string
  description: string
  starts_at: string
  ends_at: string
  location: string
  format: EventFormat
  limited: boolean
  capacity: string
  cover_url: string | null
}

const empty: FormState = { club_id: '', category_id: '', title: '', description: '', starts_at: '', ends_at: '', location: '', format: 'offline', limited: true, capacity: '30', cover_url: PRESET_COVERS[0] }

export default function EventFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const { categories } = useDictionaries()
  const toast = useToast()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const clubs = useMemo(() => user?.clubs.filter((c) => c.verified) ?? [], [user])

  const [form, setForm] = useState<FormState>({ ...empty, club_id: clubs.length === 1 ? String(clubs[0].id) : '' })
  const [original, setOriginal] = useState<EventItem | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<null | 'save' | 'publish'>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // Загрузка мероприятия для редактирования
  useEffect(() => {
    if (!id) return
    api
      .event(id)
      .then((e) => {
        if (!e.can_manage) {
          toast.error('Вы не можете редактировать это мероприятие')
          navigate('/me/events', { replace: true })
          return
        }
        if (e.status === 'cancelled') {
          toast.error('Отменённое мероприятие нельзя редактировать')
          navigate('/me/events', { replace: true })
          return
        }
        setOriginal(e)
        setForm({
          club_id: String(e.club?.id ?? ''),
          category_id: String(e.category?.id ?? ''),
          title: e.title,
          description: e.description,
          starts_at: toLocalInput(e.starts_at),
          ends_at: toLocalInput(e.ends_at),
          location: e.location,
          format: e.format,
          limited: e.capacity !== null,
          capacity: String(e.capacity ?? 30),
          cover_url: e.cover_url ? (assetUrl(e.cover_url) as string) : null,
        })
      })
      .catch((e) => {
        toast.error(friendlyMessage(e))
        navigate('/me/events', { replace: true })
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
  }

  /** Клиентская валидация: обязательные поля, starts_at в будущем, ends_at > starts_at. */
  const validate = () => {
    const e: Record<string, string> = {}
    if (!isEdit && !form.club_id) e.club_id = 'Выберите Комьюнити'
    if (!form.category_id) e.category_id = 'Выберите категорию'
    if (form.title.trim().length < 3) e.title = 'Название — минимум 3 символа'
    if (!form.description.trim()) e.description = 'Добавьте описание'
    if (!form.location.trim()) e.location = form.format === 'online' ? 'Укажите ссылку на трансляцию' : 'Укажите место проведения'
    else if (form.format === 'online' && !/^https?:\/\//.test(form.location.trim())) e.location = 'Ссылка должна начинаться с http:// или https://'
    const startChanged = !original || toLocalInput(original.starts_at) !== form.starts_at
    if (!form.starts_at) e.starts_at = 'Укажите дату и время начала'
    else if (startChanged && new Date(form.starts_at) <= new Date()) e.starts_at = 'Дата начала должна быть в будущем'
    if (!form.ends_at) e.ends_at = 'Укажите дату и время окончания'
    else if (form.starts_at && new Date(form.ends_at) <= new Date(form.starts_at)) e.ends_at = 'Окончание должно быть позже начала'
    if (form.limited && (!Number(form.capacity) || Number(form.capacity) < 1)) e.capacity = 'Укажите число мест (от 1)'
    return e
  }

  const payload = (): EventPayload => ({
    ...(isEdit ? {} : { club_id: Number(form.club_id) }),
    category_id: Number(form.category_id),
    title: form.title.trim(),
    description: form.description.trim(),
    starts_at: fromLocalInput(form.starts_at),
    ends_at: fromLocalInput(form.ends_at),
    location: form.location.trim(),
    format: form.format,
    capacity: form.limited ? Number(form.capacity) : null,
    cover_url: form.cover_url,
  })

  const submit = async (publish: boolean) => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      toast.error('Проверьте заполнение формы')
      return
    }
    setBusy(publish ? 'publish' : 'save')
    try {
      const body = payload()
      if (isEdit && original) {
        // Отправляем только изменённые поля
        const changed = Object.fromEntries(
          Object.entries(body).filter(([k, v]) => {
            const before = (original as unknown as Record<string, unknown>)[k]
            if (k === 'category_id') return v !== original.category?.id
            if (k === 'starts_at' || k === 'ends_at') return new Date(v as string).getTime() !== new Date(before as string).getTime()
            if (k === 'cover_url') return v !== (original.cover_url ? assetUrl(original.cover_url) : null)
            return v !== before
          }),
        )
        let saved = original
        if (Object.keys(changed).length) saved = (await api.updateEvent(original.id, changed)).data
        if (publish && saved.status === 'draft') await api.publishEvent(saved.id)
        toast.success(publish ? 'Мероприятие опубликовано' : Object.keys(changed).length ? 'Изменения сохранены' : 'Изменений нет')
      } else {
        const created = await api.createEvent(body)
        if (publish) await api.publishEvent(created.data.id)
        toast.success(publish ? 'Мероприятие опубликовано в афише 🎉' : 'Черновик сохранён')
      }
      navigate('/me/events')
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.code === 'VALIDATION_ERROR') {
        setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v[0]])))
        toast.error('Сервер отклонил данные — проверьте поля')
      } else toast.error(friendlyMessage(apiErr))
    } finally {
      setBusy(null)
    }
  }

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const res = await api.upload(file, 'cover')
      set('cover_url', res.path)
      toast.success('Обложка загружена')
    } catch (err) {
      toast.error(toApiError(err).field('file') ?? friendlyMessage(err))
    } finally {
      setUploading(false)
    }
  }

  // Живое превью карточки
  const preview: EventItem = useMemo(() => {
    const cat = categories.find((c) => String(c.id) === form.category_id) ?? null
    const club = clubs.find((c) => String(c.id) === form.club_id)
    const now = new Date()
    const starts = form.starts_at ? new Date(form.starts_at) : new Date(now.getTime() + 86400000)
    const ends = form.ends_at ? new Date(form.ends_at) : new Date(starts.getTime() + 7200000)
    const cap = form.limited ? Number(form.capacity) || null : null
    const regs = original?.registrations_count ?? 0
    return {
      id: original?.id ?? 0,
      title: form.title || 'Название мероприятия',
      description: form.description,
      club: club ? { id: club.id, name: club.name } : original?.club ?? { id: 0, name: 'Ваше Комьюнити' },
      category: cat,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      location: form.location || (form.format === 'online' ? 'Ссылка на трансляцию' : 'Место проведения'),
      format: form.format,
      capacity: cap,
      registrations_count: regs,
      seats_left: cap ? Math.max(0, cap - regs) : null,
      is_full: cap ? regs >= cap : false,
      reactions: original?.reactions ?? { like: 0, interested: 0 },
      popularity: 0,
      cover_url: form.cover_url,
      status: original?.status ?? 'draft',
      state: 'scheduled',
      cancel_reason: null,
      published_at: null,
      created_at: now.toISOString(),
    }
  }, [form, categories, clubs, original])

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-[40rem]" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const isPublished = original?.status === 'published'

  return (
    <div>
      <Link to="/me/events" className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Мои мероприятия
      </Link>
      <PageHeader eyebrow={isEdit ? 'Редактирование' : 'Новое мероприятие'} title={isEdit ? original?.title ?? 'Мероприятие' : 'Создание мероприятия'} text={isPublished ? 'Мероприятие опубликовано. При изменении времени или места участники получат уведомление.' : 'Сохраните как черновик или сразу опубликуйте в афише.'} />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={(e: FormEvent) => (e.preventDefault(), submit(false))} className="space-y-6" noValidate>
          <Section title="Основное" step={1}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label="Комьюнити" value={form.club_id} onChange={(e) => set('club_id', e.target.value)} error={errors.club_id} disabled={isEdit} hint={isEdit ? 'Комьюнити изменить нельзя' : 'Только Комьюнити, где вы верифицированы'}>
                <option value="">Выберите…</option>
                {(isEdit && original?.club ? [{ id: original.club.id, name: original.club.name }] : clubs).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select label="Категория" value={form.category_id} onChange={(e) => set('category_id', e.target.value)} error={errors.category_id}>
                <option value="">Выберите…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <Input label="Название" value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder="Например: Хакатон «Умный кампус»" maxLength={150} />
            <Textarea label="Описание" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} placeholder="Расскажите, что будет, для кого и что взять с собой" maxLength={5000} hint={`${form.description.length} / 5000`} />
          </Section>

          <Section title="Когда и где" step={2}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Начало" type="datetime-local" icon={<CalendarClock className="h-4 w-4" />} value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} error={errors.starts_at} min={toLocalInput(new Date().toISOString())} />
              <Input label="Окончание" type="datetime-local" icon={<CalendarClock className="h-4 w-4" />} value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} error={errors.ends_at} min={form.starts_at || undefined} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold">Формат</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { v: 'offline', label: 'Офлайн', icon: MapPin, text: 'Аудитория, площадка' },
                    { v: 'online', label: 'Онлайн', icon: Globe, text: 'Трансляция по ссылке' },
                  ] as const
                ).map(({ v, label, icon: Icon, text }) => (
                  <button key={v} type="button" onClick={() => set('format', v)} className={cn('relative flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition', form.format === v ? 'border-brand bg-brand-soft/60 ring-4 ring-brand/10' : 'border-line hover:border-brand/40')}>
                    <span className={cn('grid h-10 w-10 place-items-center rounded-xl', form.format === v ? 'bg-brand text-white' : 'bg-surface-2 text-muted')}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{label}</span>
                      <span className="block text-xs text-muted">{text}</span>
                    </span>
                    {form.format === v && (
                      <motion.span layoutId="format-check" className="absolute top-3 right-3 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                        <Check className="h-3 w-3" />
                      </motion.span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label={form.format === 'online' ? 'Ссылка на трансляцию' : 'Место проведения'}
              icon={form.format === 'online' ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              error={errors.location}
              placeholder={form.format === 'online' ? 'https://meet.example.com/…' : 'Корпус А, аудитория 101'}
            />
          </Section>

          <Section title="Участники" step={3}>
            <label className="flex cursor-pointer items-center gap-3">
              <span className={cn('relative h-6 w-11 rounded-full transition-colors', form.limited ? 'bg-brand' : 'bg-line')}>
                <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 30 }} className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', form.limited ? 'right-0.5' : 'left-0.5')} />
              </span>
              <input type="checkbox" className="sr-only" checked={form.limited} onChange={(e) => set('limited', e.target.checked)} />
              <span className="text-sm font-semibold">Ограничить количество мест</span>
            </label>
            {form.limited && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <Input label="Вместимость" type="number" min={1} icon={<Users className="h-4 w-4" />} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} error={errors.capacity} wrapClassName="max-w-xs" hint={original ? `Сейчас зарегистрировано: ${original.registrations_count}` : undefined} />
              </motion.div>
            )}
          </Section>

          <Section title="Обложка" step={4}>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {PRESET_COVERS.map((src) => (
                <button key={src} type="button" onClick={() => set('cover_url', src)} className={cn('relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl ring-offset-2 ring-offset-surface transition', form.cover_url === src ? 'ring-3 ring-brand' : 'opacity-80 hover:opacity-100')}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {form.cover_url === src && (
                    <span className="absolute inset-0 grid place-items-center bg-black/25">
                      <Check className="h-5 w-5 text-white" />
                    </span>
                  )}
                </button>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs font-semibold text-muted transition hover:border-brand hover:text-brand">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                Своя
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </div>
            {form.cover_url && !PRESET_COVERS.includes(form.cover_url) && (
              <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                <img src={assetUrl(form.cover_url) ?? ''} alt="" className="h-14 w-20 rounded-lg object-cover" />
                <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
                  <ImagePlus className="h-4 w-4" /> Загружена своя обложка
                </span>
              </div>
            )}
          </Section>

          <div className="card sticky bottom-4 z-10 flex flex-col-reverse gap-2 p-4 shadow-lift sm:flex-row sm:justify-end">
            <Link to="/me/events" className="sm:mr-auto">
              <Button type="button" variant="ghost" className="w-full">
                Отмена
              </Button>
            </Link>
            <Button type="submit" variant={isPublished ? 'primary' : 'outline'} loading={busy === 'save'} disabled={busy !== null} icon={<Save className="h-4 w-4" />}>
              {isPublished ? 'Сохранить изменения' : 'Сохранить черновик'}
            </Button>
            {!isPublished && (
              <Button type="button" loading={busy === 'publish'} disabled={busy !== null} onClick={() => submit(true)} icon={<Send className="h-4 w-4" />}>
                Опубликовать
              </Button>
            )}
          </div>
        </form>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-xs font-bold tracking-[0.18em] text-muted uppercase">Превью карточки</p>
            <div className="pointer-events-none">
              <EventCard event={preview} />
            </div>
            <p className="mt-3 text-center text-xs text-muted">Так мероприятие будет выглядеть в афише</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Section({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: step * 0.06 }} className="card space-y-5 p-6 sm:p-7">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-gradient font-display text-sm text-white">{step}</span>
        {title}
      </h2>
      {children}
    </motion.section>
  )
}
