import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../hook/useAuth.js'
import { setError } from '../state/auth.slice.js'
import ContinueWithGoogle from '../components/ContinueWithGoogle.jsx'

const Login = () => {
  const { handleLogin } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    stayConnected: false,
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const errors = {}

    if (!formData.email.trim()) {
      errors.email = 'EMAIL IS REQUIRED'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'INVALID EMAIL FORMAT'
    }

    if (!formData.password) {
      errors.password = 'PASSKEY IS REQUIRED'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (validationError) {
      setValidationError('')
    }
    if (auth.error) {
      dispatch(setError(null))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    setSuccess(false)

    if (!validateForm()) {
      setValidationError('PLEASE FIX THE ERRORS BELOW')
      return
    }

    try {
      const res = await handleLogin({
        email: formData.email,
        password: formData.password,
      })
      setSuccess(true)
      setTimeout(() => {
        if (res?.user?.role === 'seller') {
          navigate('/seller/dashboard')
        } else {
          navigate('/')
        }
      }, 1000)
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  const errorMessage = validationError || auth.error
  const isLoading = auth.loading

  return (
    <div className="min-h-screen bg-dot-matrix relative overflow-x-hidden flex flex-col justify-between font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* Background Faded Vertical Watermark Typography */}
      <div className="fixed top-1/2 -left-16 -translate-y-1/2 -rotate-90 text-[110px] sm:text-[160px] lg:text-[200px] font-black text-neutral-300/25 leading-none pointer-events-none select-none tracking-tighter uppercase font-display z-0">
        [ACCESS]
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-6 flex justify-between items-center">
        {/* SNITCH Logo Box with Neon Lime Offset Shadow */}
        <Link to="/" className="relative group inline-block">
          <div className="absolute inset-0 bg-[#ccff00] translate-x-1.5 translate-y-1.5 border-2 border-black transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
          <div className="relative bg-white border-2 border-black px-5 py-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tighter text-black uppercase font-display block leading-none">
              SNITCH
            </span>
          </div>
        </Link>

        {/* RETURN Button */}
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white font-mono text-xs sm:text-sm font-bold tracking-widest px-6 py-2.5 border-2 border-black hover:bg-neutral-800 transition-all uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          RETURN
        </button>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* LEFT COLUMN: Stacked / Tilted Polaroid Streetwear Card */}
        <div className="lg:col-span-6 flex justify-center items-center">
          <div className="relative w-full max-w-md bg-white border-2 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-3 hover:rotate-0 transition-transform duration-300">
            
            {/* Polaroid Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="font-serif text-sm font-bold text-black tracking-tight">
                Snitch Inc.
              </span>
              <span className="bg-[#ccff00] text-black font-black text-xs px-2.5 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-wider">
                FW_24
              </span>
            </div>

            {/* Streetwear Image Box */}
            <div className="relative w-full aspect-[4/5] bg-neutral-900 overflow-hidden border border-black mb-3">
              <img
                src="/streetwear_polaroid.png"
                alt="Snitch Editorial"
                className="w-full h-full object-cover filter grayscale contrast-125 brightness-95"
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
            </div>

            {/* Polaroid Footer */}
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-600 uppercase font-semibold">
              <span>[ARCHIVE_SERIES // 024]</span>
              <span className="text-black font-bold">SNITCH.CO</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Brutalist Cyberpunk Login Card */}
        <div className="lg:col-span-6 flex justify-center items-center">
          <div className="relative w-full max-w-lg mt-6 lg:mt-0">
            
            {/* Offset Neon Lime Background Drop Shadow Box */}
            <div className="absolute inset-0 bg-[#ccff00] translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 border-2 border-black"></div>

            {/* Main Login Box */}
            <div className="relative z-10 bg-[#fbfbf9] border-2 border-black p-6 sm:p-10 pt-10 sm:pt-12">
              
              {/* Overlapping HUGE LOGIN Title */}
              <div className="absolute -top-8 sm:-top-10 left-4 sm:left-6 z-20">
                <h1 className="text-6xl sm:text-7xl font-black text-black tracking-tighter uppercase font-display leading-none select-none">
                  LOGIN
                </h1>
              </div>

              {/* Subtitle with Neon Lime Vertical Accent Bar */}
              <div className="flex items-center gap-2.5 mt-2 mb-8">
                <span className="w-1.5 h-5 bg-[#ccff00] border border-black inline-block shrink-0"></span>
                <p className="text-xs sm:text-sm font-semibold tracking-wider text-neutral-800 uppercase font-mono">
                  ACCESS THE ARCHIVE. SECURE YOUR DROPS.
                </p>
              </div>

              {/* Segmented Dashed Right Line Accents */}
              <div className="absolute right-3.5 top-20 bottom-20 hidden sm:flex flex-col justify-between pointer-events-none opacity-60">
                <div className="w-1 h-7 bg-neutral-400"></div>
                <div className="w-1 h-7 bg-neutral-400"></div>
                <div className="w-1 h-7 bg-neutral-400"></div>
                <div className="w-1 h-7 bg-neutral-400"></div>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="mb-6 p-3.5 bg-red-50 border-2 border-black text-red-700 text-xs font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
                  {errorMessage}
                </div>
              )}

              {success && (
                <div className="mb-6 p-3.5 bg-[#ccff00]/40 border-2 border-black text-black text-xs font-extrabold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
                  ACCESS GRANTED! REDIRECTING...
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* IDENTITY / EMAIL */}
                <div>
                  <label className="block font-serif text-xs font-bold text-neutral-900 tracking-wider mb-2 uppercase">
                    IDENTITY / EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="USER@SNITCH.COM"
                    className={`w-full bg-white border border-neutral-400 focus:border-black focus:border-2 p-3.5 text-sm sm:text-base font-medium text-black placeholder:text-neutral-400 focus:outline-none tracking-wide transition-colors uppercase ${
                      fieldErrors.email ? 'border-red-600 bg-red-50/50' : ''
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-[11px] font-bold text-red-600 uppercase">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* PASSKEY */}
                <div>
                  <label className="block font-serif text-xs font-bold text-neutral-900 tracking-wider mb-2 uppercase">
                    PASSKEY
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="........"
                    className={`w-full bg-white border border-neutral-400 focus:border-black focus:border-2 p-3.5 text-sm sm:text-base font-medium text-black placeholder:text-neutral-400 focus:outline-none tracking-wide transition-colors ${
                      fieldErrors.password ? 'border-red-600 bg-red-50/50' : ''
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-[11px] font-bold text-red-600 uppercase">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Checkbox & Recover Link */}
                <div className="flex justify-between items-center pt-1 text-xs font-serif font-bold uppercase tracking-wider">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none text-neutral-900">
                    <input
                      type="checkbox"
                      name="stayConnected"
                      checked={formData.stayConnected}
                      onChange={handleChange}
                      className="w-4 h-4 border border-black accent-black rounded-none cursor-pointer"
                    />
                    <span>STAY CONNECTED</span>
                  </label>
                  <Link
                    to="#"
                    className="text-neutral-900 underline hover:text-black transition-colors"
                  >
                    RECOVER
                  </Link>
                </div>

                {/* ENTER Button with Neon Drop Shadow */}
                <div className="relative pt-2">
                  <div className="absolute inset-0 bg-[#ccff00] translate-x-1.5 translate-y-1.5 border border-black"></div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative z-10 w-full bg-black text-[#ccff00] font-black text-lg sm:text-xl py-4 flex items-center justify-center gap-3 tracking-widest uppercase hover:bg-neutral-900 transition-colors border border-black cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? (
                      <span>AUTHENTICATING...</span>
                    ) : (
                      <>
                        <span>ENTER</span>
                        <span className="text-xl">→</span>
                      </>
                    )}
                  </button>
                </div>

                {/* OR DIVIDER */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t-2 border-black"></div>
                  <span className="flex-shrink mx-4 text-xs font-mono font-bold text-black uppercase tracking-widest bg-[#fbfbf9] px-2">
                    OR
                  </span>
                  <div className="flex-grow border-t-2 border-black"></div>
                </div>

                {/* GOOGLE OAUTH BUTTON */}
                <ContinueWithGoogle href="/api/auth/google" label="CONTINUE WITH GOOGLE" />
              </form>

              {/* Bottom Divider */}
              <div className="my-6 border-t border-neutral-300"></div>

              {/* Register Link */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-wider text-neutral-800 uppercase">
                <span>NEW RECRUIT?</span>
                <Link
                  to="/register"
                  className="border-2 border-black bg-white px-3.5 py-1 text-black hover:bg-[#ccff00] transition-colors uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  INITIALIZE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Status Bar */}
      <footer className="relative z-20 w-full bg-black text-[#ccff00] font-mono text-[11px] sm:text-xs py-2 px-6 sm:px-12 flex justify-between items-center tracking-widest border-t border-black uppercase select-none">
        <span className="font-bold">SYS.REQ.OK</span>
        <span className="font-bold">V.1.0.4</span>
      </footer>
    </div>
  )
}

export default Login