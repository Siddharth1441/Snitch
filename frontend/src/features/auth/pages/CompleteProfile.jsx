import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useDispatch } from 'react-redux'
import { setUser } from '../state/auth.slice.js'
import axios from 'axios'

const CompleteProfile = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const token = searchParams.get('token')

  const [isSeller, setIsSeller] = useState(false)
  const [contact, setContact] = useState('')
  const [contactError, setContactError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/register')
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setContactError('')

    const cleanContact = contact.replace(/\D/g, '')
    if (contact.trim() && !/^\d{10}$/.test(cleanContact)) {
      setContactError('Contact must be a valid 10-digit number')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(
        '/api/auth/complete-profile',
        { isSeller, contact: contact || undefined },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      )

      dispatch(setUser(response.data.user))
      setSuccess(true)

      setTimeout(() => {
        if (isSeller) {
          navigate('/seller/dashboard')
        } else {
          navigate('/')
        }
      }, 1500)
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dot-matrix relative overflow-x-hidden flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Background watermark */}
      <div className="absolute top-4 left-4 sm:left-10 text-[100px] sm:text-[180px] lg:text-[220px] font-black text-neutral-300/20 leading-none pointer-events-none select-none tracking-tighter uppercase font-display">
        SETUP
      </div>
      <div className="absolute bottom-4 right-4 sm:right-10 text-[100px] sm:text-[180px] lg:text-[220px] font-black text-neutral-300/20 leading-none pointer-events-none select-none tracking-tighter uppercase font-display">
        ROLE
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-[#ccff00] text-black font-black text-xs px-3 py-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest mb-4">
            GOOGLE — STEP 2 OF 2
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black tracking-tight uppercase leading-none font-display mb-3">
            ONE LAST<br />THING
          </h1>
          <p className="text-sm text-neutral-600 font-medium">
            Tell us how you'll be using Snitch. You can always change this later.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border-2 border-black text-red-700 text-xs font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-3.5 bg-[#ccff00]/40 border-2 border-black text-black text-xs font-extrabold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
            PROFILE COMPLETE! REDIRECTING...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Role selection */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2">
              I WANT TO
            </div>

            {/* Buyer card */}
            <label
              className={`w-full border-2 border-black p-4 flex items-start gap-3.5 cursor-pointer transition-all ${
                !isSeller
                  ? 'bg-[#ccff00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={!isSeller}
                onChange={() => setIsSeller(false)}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${!isSeller ? 'bg-black' : 'bg-white'}`}>
                {!isSeller && (
                  <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-sm font-black tracking-wide text-black uppercase leading-none mb-1">
                  SHOP THE ARCHIVE
                </div>
                <div className="text-xs text-neutral-600 font-medium">
                  Browse drops, add to cart, checkout. I'm here to buy.
                </div>
              </div>
            </label>

            {/* Seller card */}
            <label
              className={`w-full border-2 border-black p-4 flex items-start gap-3.5 cursor-pointer transition-all ${
                isSeller
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="seller"
                checked={isSeller}
                onChange={() => setIsSeller(true)}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSeller ? 'border-white bg-[#ccff00]' : 'border-black bg-white'}`}>
                {isSeller && (
                  <svg className="w-3 h-3 text-black fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
              <div>
                <div className={`text-sm font-black tracking-wide uppercase leading-none mb-1 ${isSeller ? 'text-[#ccff00]' : 'text-black'}`}>
                  SELL ON SNITCH
                </div>
                <div className={`text-xs font-medium ${isSeller ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  List products, manage drops, access merchant tools.
                </div>
              </div>
            </label>
          </div>

          {/* Contact field (optional) */}
          <div className="relative">
            <div className="absolute -top-3 left-4 z-20 bg-[#ccff00] text-black font-bold text-[10px] sm:text-xs tracking-widest px-3 py-0.5 border-2 border-black uppercase select-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              CONTACT (OPTIONAL)
            </div>
            <input
              type="tel"
              value={contact}
              onChange={(e) => { setContact(e.target.value); setContactError('') }}
              placeholder="9876543210"
              className={`w-full bg-white border-2 border-black p-3.5 sm:p-4 text-sm sm:text-base font-semibold text-black placeholder:text-neutral-400 focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                contactError ? 'border-red-600 bg-red-50/50' : ''
              }`}
            />
            {contactError && (
              <p className="mt-1.5 text-xs font-bold text-red-600 tracking-wide uppercase">
                {contactError}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-black text-[#ccff00] font-black text-base sm:text-xl tracking-[0.14em] uppercase py-4 sm:py-5 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-900 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'SETTING UP...' : 'ENTER THE ARCHIVE'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile
