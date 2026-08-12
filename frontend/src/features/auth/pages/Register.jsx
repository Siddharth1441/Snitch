import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../hook/useAuth.js'
import { setError } from '../state/auth.slice.js'

const Register = () => {
  const { handleRegister } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contact: '',
    password: '',
    isSeller: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const errors = {}

    if (!formData.fullname.trim()) {
      errors.fullname = 'Full Name is required'
    } else if (formData.fullname.trim().length < 3) {
      errors.fullname = 'Full Name must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    const cleanContact = formData.contact.replace(/\D/g, '')
    if (!formData.contact.trim()) {
      errors.contact = 'Contact is required'
    } else if (!/^\d{10}$/.test(cleanContact)) {
      errors.contact = 'Contact must be a valid 10-digit number'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
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

    // Clear specific field error & global Redux error when user updates input
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
      setValidationError('Please fix the errors highlighted below.')
      return
    }

    try {
      await handleRegister(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      console.error('Registration error:', err)
    }
  }

  const errorMessage = validationError || auth.error
  const isLoading = auth.loading

  return (
    <div className="min-h-screen bg-dot-matrix relative overflow-x-hidden flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Faint Background Watermark Typography */}
      <div className="absolute top-4 left-4 sm:left-10 text-[100px] sm:text-[180px] lg:text-[220px] font-black text-neutral-300/20 leading-none pointer-events-none select-none tracking-tighter uppercase font-display">
        JOIN
      </div>
      <div className="absolute bottom-4 right-4 sm:right-10 text-[100px] sm:text-[180px] lg:text-[220px] font-black text-neutral-300/20 leading-none pointer-events-none select-none tracking-tighter uppercase font-display">
        REGISTER
      </div>

      {/* Main Grid Wrapper */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center py-6 sm:py-10">
        
        {/* Left Column: Stacked Title & Polaroid Frame */}
        <div className="lg:col-span-5 flex flex-col justify-center items-start pl-2 sm:pl-4">
          
          {/* Main Title Stack + Skewed "NEW DROP" Badge */}
          <div className="relative z-20">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black leading-[0.88] tracking-tighter uppercase font-display select-none">
              JOIN<br />
              THE<br />
              ARCHIVE
            </h1>

            {/* Skewed Neon Lime Badge */}
            <div className="absolute top-1/2 left-28 sm:left-36 md:left-44 lg:left-32 -translate-y-1/2 z-30 bg-[#ccff00] text-black font-black text-base sm:text-xl lg:text-2xl px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-6 tracking-wider uppercase select-none whitespace-nowrap">
              NEW DROP
            </div>
          </div>

          {/* Skewed Polaroid Frame */}
          <div className="relative mt-8 sm:mt-10 w-64 sm:w-72 md:w-80 border-2 border-black bg-white p-3.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-3 transition-transform hover:rotate-0 duration-300">
            {/* Image Box */}
            <div className="relative w-full aspect-[4/3] bg-neutral-900 overflow-hidden border border-black mb-3">
              <img
                src="/streetwear_polaroid.png"
                alt="Streetwear Archive"
                className="w-full h-full object-cover filter grayscale contrast-125 brightness-95"
              />
              
              {/* Technical Badges Overlaid on Image */}
              <div className="absolute top-2 left-2 bg-black text-white font-mono text-[9px] px-1.5 py-0.5 border border-white/40 tracking-widest font-bold">
                TER V.01
              </div>
              <div className="absolute top-2 left-20 bg-neutral-200 text-black font-mono text-[8px] px-1.5 py-0.5 border border-black font-bold">
                GRID
              </div>
            </div>

            {/* Polaroid Metadata Footer */}
            <div className="space-y-0.5 text-[9px] font-mono text-neutral-600 uppercase font-semibold leading-snug">
              <div>[LOCATION: ARCHIVE_01]</div>
              <div>[TEXTURE: HIGH_CONTRAST]</div>
              <div className="text-black font-bold">// STATUS: ENCRYPTED</div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="lg:col-span-7 w-full max-w-xl mx-auto lg:max-w-none">
          
          {/* Header */}
          <div className="mb-7 sm:mb-9">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight uppercase leading-none font-display mb-2">
              CREATE ACCOUNT
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium tracking-wide">
              Enter the grid. Secure your spot.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-50 border-2 border-black text-red-700 text-xs font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
              {errorMessage}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 bg-[#ccff00]/40 border-2 border-black text-black text-xs font-extrabold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
              ACCOUNT CREATED! REDIRECTING...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7" noValidate>
            
            {/* FIELD 1: FULL NAME */}
            <div className="relative rotate-[0.5deg]">
              <div className="absolute -top-3 left-4 z-20 bg-black text-white font-serif text-[10px] sm:text-xs font-bold tracking-widest px-3 py-0.5 border border-black uppercase select-none">
                FULL NAME
              </div>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="JANE DOE"
                className={`w-full bg-white border-2 border-black p-3.5 sm:p-4 text-sm sm:text-base font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase ${
                  fieldErrors.fullname ? 'border-red-600 bg-red-50/50' : ''
                }`}
              />
              {fieldErrors.fullname && (
                <p className="mt-1.5 text-xs font-bold text-red-600 tracking-wide uppercase">
                  {fieldErrors.fullname}
                </p>
              )}
            </div>

            {/* FIELD 2: EMAIL */}
            <div className="relative -rotate-[0.8deg]">
              <div className="absolute -top-3 right-4 z-20 bg-black text-white font-serif text-[10px] sm:text-xs font-bold tracking-widest px-3 py-0.5 border border-black uppercase select-none">
                EMAIL
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="JANE@EXAMPLE.COM"
                className={`w-full bg-white border-2 border-black p-3.5 sm:p-4 text-sm sm:text-base font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase ${
                  fieldErrors.email ? 'border-red-600 bg-red-50/50' : ''
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs font-bold text-red-600 tracking-wide uppercase">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* FIELD 3: CONTACT */}
            <div className="relative rotate-[0.6deg]">
              <div className="absolute -top-3 left-5 z-20 bg-[#ccff00] text-black font-bold text-[10px] sm:text-xs tracking-widest px-3 py-0.5 border-2 border-black uppercase select-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                CONTACT
              </div>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="9876543210"
                className={`w-full bg-white border-2 border-black p-3.5 sm:p-4 text-sm sm:text-base font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  fieldErrors.contact ? 'border-red-600 bg-red-50/50' : ''
                }`}
              />
              {fieldErrors.contact && (
                <p className="mt-1.5 text-xs font-bold text-red-600 tracking-wide uppercase">
                  {fieldErrors.contact}
                </p>
              )}
            </div>

            {/* FIELD 4: PASSWORD */}
            <div className="relative -rotate-[0.5deg]">
              <div className="absolute -bottom-3 left-4 z-20 bg-black text-white font-serif text-[10px] sm:text-xs font-bold tracking-widest px-3 py-0.5 border border-black uppercase select-none">
                PASSWORD
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-white border-2 border-black p-3.5 sm:p-4 pr-12 text-sm sm:text-base font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    fieldErrors.password ? 'border-red-600 bg-red-50/50' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black hover:text-neutral-600 focus:outline-none p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-4 text-xs font-bold text-red-600 tracking-wide uppercase">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* FIELD 5: REGISTER AS SELLER */}
            <div className="relative rotate-[0.4deg] pt-2">
              <label
                htmlFor="isSeller"
                className="w-full bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3.5 cursor-pointer group select-none"
              >
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    id="isSeller"
                    name="isSeller"
                    checked={formData.isSeller}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 border-black flex items-center justify-center transition-colors ${
                      formData.isSeller ? 'bg-black' : 'bg-white'
                    }`}
                  >
                    {formData.isSeller && (
                      <svg
                        className="w-3.5 h-3.5 text-white fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black tracking-wide text-black uppercase leading-none mb-1">
                    REGISTER AS SELLER
                  </div>
                  <div className="text-xs text-neutral-600 font-medium">
                    Access merchant tools and drops.
                  </div>
                </div>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="relative pt-3 -rotate-[0.4deg]">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-[#ccff00] font-black text-base sm:text-xl tracking-[0.14em] uppercase py-4 sm:py-5 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-900 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'JOINING...' : 'JOIN THE ARCHIVE'}
              </button>
            </div>
          </form>

          {/* BOTTOM LINK */}
          <div className="text-center pt-6 sm:pt-7">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-serif font-bold text-black uppercase tracking-[0.18em] hover:text-neutral-700 underline underline-offset-4 decoration-neutral-400 hover:decoration-black transition-colors"
            >
              ALREADY IN? LOGIN HERE
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register


