import { useEffect } from 'react'
import { useAuth } from '../hook/useAuth.js'
import { useSelector } from 'react-redux'
import { useCart } from '../../cart/hook/useCart.js'

/**
 * AuthInitializer
 * Mounted once at the app root. Fires GET /api/auth/me to restore
 * the user session from the httpOnly cookie before any protected
 * route can make a redirect decision.
 */
const AuthInitializer = ({ children }) => {
  const { handleGetMe } = useAuth()
  const { handleGetCart } = useCart()
  const initialized = useSelector((state) => state.auth.initialized)
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    handleGetMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (initialized && user) {
      handleGetCart().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user])

  // Show a minimal full-screen loader until we know the auth state
  if (!initialized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f4f0',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '4px solid #000',
            padding: '2rem 3rem',
            boxShadow: '8px 8px 0 #000',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              letterSpacing: '-2px',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            SNITCH
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              color: '#555',
            }}
          >
            RESTORING SESSION...
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default AuthInitializer
