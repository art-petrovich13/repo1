import { Route, Routes } from 'react-router'
import { GuestOnly, RequireAuth, RequireRepresentative } from './components/layout/Guards'
import { Layout } from './components/layout/Layout'
import ProfilePage from './pages/me/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/auth/LoginPage'
import PasswordResetPage from './pages/auth/PasswordResetPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import EventPage from './pages/EventPage'
import HomePage from './pages/HomePage'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="events/:id" element={<EventPage />} />

        <Route path="login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="password-reset" element={<PasswordResetPage />} />

        <Route path="me" element={<RequireAuth><ProfilePage /></RequireAuth>} />
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
