import { Route, Routes } from 'react-router'
import { GuestOnly, RequireAdmin, RequireAuth, RequireRepresentative } from './components/layout/Guards'
import { Layout } from './components/layout/Layout'
import NotificationsPage from './pages/me/NotificationsPage'
import ProfilePage from './pages/me/ProfilePage'
import ReactionsPage from './pages/me/ReactionsPage'
import RegistrationsPage from './pages/me/RegistrationsPage'
import EventFormPage from './pages/manage/EventFormPage'
import MyEventsPage from './pages/manage/MyEventsPage'
import ParticipantsPage from './pages/manage/ParticipantsPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminPage from './pages/admin/AdminPage'
import LoginPage from './pages/auth/LoginPage'
import PasswordResetPage from './pages/auth/PasswordResetPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import EventPage from './pages/EventPage'
import HomePage from './pages/HomePage'

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
        <Route path="me/registrations" element={<RequireAuth><RegistrationsPage /></RequireAuth>} />
        <Route path="me/reactions" element={<RequireAuth><ReactionsPage /></RequireAuth>} />
        <Route path="me/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />

        <Route path="me/events" element={<RequireRepresentative><MyEventsPage /></RequireRepresentative>} />
        <Route path="me/events/new" element={<RequireRepresentative><EventFormPage /></RequireRepresentative>} />
        <Route path="me/events/:id/edit" element={<RequireRepresentative><EventFormPage key="edit" /></RequireRepresentative>} />
        <Route path="me/events/:id/participants" element={<RequireRepresentative><ParticipantsPage /></RequireRepresentative>} />

        <Route path="admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
