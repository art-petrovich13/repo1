import { Route, Routes } from 'react-router'
import { GuestOnly, RequireAuth, RequireRepresentative } from './components/layout/Guards'
import { Layout } from './components/layout/Layout'
import NotFoundPage from './pages/NotFoundPage'
import HomePage from './pages/HomePage'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="events/:id" element={<Placeholder title="Мероприятие" />} />

        <Route path="login" element={<GuestOnly><Placeholder title="Вход" /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><Placeholder title="Регистрация" /></GuestOnly>} />
        <Route path="verify-email" element={<Placeholder title="Подтверждение email" />} />
        <Route path="password-reset" element={<Placeholder title="Восстановление пароля" />} />

        <Route path="me" element={<RequireAuth><Placeholder title="Профиль" /></RequireAuth>} />
        <Route path="me/registrations" element={<RequireAuth><Placeholder title="Мои регистрации" /></RequireAuth>} />
        <Route path="me/reactions" element={<RequireAuth><Placeholder title="Мои реакции" /></RequireAuth>} />
        <Route path="me/notifications" element={<RequireAuth><Placeholder title="Уведомления" /></RequireAuth>} />

        <Route path="me/events" element={<RequireRepresentative><Placeholder title="Мои мероприятия" /></RequireRepresentative>} />
        <Route path="me/events/new" element={<RequireRepresentative><Placeholder title="Новое мероприятие" /></RequireRepresentative>} />
        <Route path="me/events/:id/edit" element={<RequireRepresentative><Placeholder title="Редактирование" /></RequireRepresentative>} />
        <Route path="me/events/:id/participants" element={<RequireRepresentative><Placeholder title="Участники" /></RequireRepresentative>} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
