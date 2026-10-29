import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Все события студенческих сообществ в одном месте: хакатоны, турниры, спектакли и волонтёрские акции. Выбирай, регистрируйся, приходи.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold tracking-wider text-ink uppercase">Разделы</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><Link className="transition hover:text-brand" to="/">Афиша мероприятий</Link></li>
            <li><Link className="transition hover:text-brand" to="/?upcoming=1&sort=popularity">Популярное</Link></li>
            <li><Link className="transition hover:text-brand" to="/me/registrations">Мои регистрации</Link></li>
            <li><Link className="transition hover:text-brand" to="/register">Стать участником</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold tracking-wider text-ink uppercase">Контакты</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-brand" /> <a className="hover:text-brand" href="mailto:events@campus.example">events@campus.example</a></li>
            <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-brand" /> <a className="hover:text-brand" href="tel:+78001234567">+7 (800) 123-45-67</a></li>
            <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-brand" /> Студенческий центр, корпус А, каб. 101</li>
            <li className="flex items-center gap-2.5"><Send className="h-4 w-4 text-brand" /> Студсовет: пн–пт, 10:00–18:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">© {new Date().getFullYear()} Пульс — афиша студенческих мероприятий</div>
    </footer>
  )
}
