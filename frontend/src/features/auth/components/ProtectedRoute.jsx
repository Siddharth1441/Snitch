import { Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'

const hasAuthCookie = () => {
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('token='))
}

const ProtectedRoute = () => {
  const user = useSelector((state) => state.auth.user)

  if (!hasAuthCookie()) {
    return <Navigate to="/login" replace />
  }

  if (!user || user.role !== 'seller') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute