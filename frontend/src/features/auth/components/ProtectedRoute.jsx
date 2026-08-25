import { Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'

const ProtectedRoute = () => {
  const user = useSelector((state) => state.auth.user)
  const initialized = useSelector((state) => state.auth.initialized)

  // Wait for AuthInitializer to finish restoring session before deciding
  if (!initialized) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'seller') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute