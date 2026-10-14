import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../../auth/state/auth.slice.js'
import { useAuth } from '../../auth/hook/useAuth.js'
import axios from 'axios'

const accountApi = axios.create({ baseURL: '/api/auth', withCredentials: true })

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const { handleLogout } = useAuth()

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({ fullname: '', contact: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [becomeSellerLoading, setBecomeSellerLoading] = useState(false)
  const [becomeSellerError, setBecomeSellerError] = useState('')
  const [addressForm, setAddressForm] = useState({ fullname: '', phone: '', line1: '', city: '', state: '', pincode: '' })
  const [addressSaving, setAddressSaving] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    setFormData({ fullname: user.fullname || '', contact: user.contact || '' })
  }, [user, navigate])

  useEffect(() => {
    accountApi.get('/orders')
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess(false)
    try {
      setSaving(true)
      const res = await accountApi.put('/me', formData)
      dispatch(setUser(res.data.user))
      setSaveSuccess(true)
      setEditMode(false)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleBecomeSeller = async () => {
    if (!window.confirm('Upgrade to a Seller account? You can then list products.')) return
    setBecomeSellerError('')
    try {
      setBecomeSellerLoading(true)
      const res = await accountApi.post('/become-seller')
      dispatch(setUser(res.data.user))
      navigate('/seller/dashboard')
    } catch (err) {
      setBecomeSellerError(err?.response?.data?.message || 'Failed to upgrade account')
    } finally {
      setBecomeSellerLoading(false)
    }
  }

  const handleLogoutClick = () => {
    handleLogout()
    navigate('/')
  }

  if (!user) return null

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'GBP': return '£'
      default: return '₹'
    }
  }

  return (
    <div className="min-h-screen bg-dot-matrix bg-[#f4f4f0] text-black font-sans selection:bg-[#ccff00] selection:text-black">
      {/* NAVBAR */}
      <header className="w-full px-4 sm:px-10 py-4 flex justify-between items-center gap-4 border-b-4 border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <Link to="/" className="relative group inline-block">
          <div className="absolute inset-0 bg-[#ccff00] translate-x-1 translate-y-1 border-2 border-black" />
          <div className="relative bg-white border-2 border-black px-4 py-1.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase font-display block leading-none">SNITCH</span>
          </div>
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/" className="hidden sm:block text-xs font-mono font-bold uppercase tracking-widest hover:underline">
            SHOP
          </Link>
          <Link to="/cart" className="bg-black text-[#ccff00] border-2 border-black px-4 py-2 text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            CART
          </Link>
        </nav>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div>
          <span className="bg-black text-[#ccff00] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest">
            ACCOUNT
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black uppercase font-display tracking-tight leading-none">
            MY ARCHIVE
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            {/* Identity Card */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
              {/* Avatar */}
              <div className="w-16 h-16 bg-black text-[#ccff00] font-black text-3xl flex items-center justify-center border-2 border-black mb-4">
                {(user.fullname || 'U')[0].toUpperCase()}
              </div>
              
              {saveSuccess && (
                <div className="mb-4 p-2 bg-[#ccff00]/40 border-2 border-black text-black text-xs font-bold uppercase">
                  PROFILE UPDATED!
                </div>
              )}
              {saveError && (
                <div className="mb-4 p-2 bg-red-50 border-2 border-black text-red-700 text-xs font-bold uppercase">
                  {saveError}
                </div>
              )}

              {editMode ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1 block">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={formData.fullname}
                      onChange={e => setFormData(p => ({ ...p, fullname: e.target.value }))}
                      className="w-full border-2 border-black bg-white p-2.5 text-sm font-semibold text-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1 block">
                      CONTACT
                    </label>
                    <input
                      type="tel"
                      value={formData.contact}
                      onChange={e => setFormData(p => ({ ...p, contact: e.target.value }))}
                      placeholder="9876543210"
                      className="w-full border-2 border-black bg-white p-2.5 text-sm font-semibold text-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-black text-[#ccff00] py-2.5 text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer disabled:opacity-60"
                    >
                      {saving ? 'SAVING...' : 'SAVE'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditMode(false); setSaveError('') }}
                      className="flex-1 bg-white text-black py-2.5 text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">NAME</div>
                    <div className="font-black text-lg uppercase">{user.fullname}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">EMAIL</div>
                    <div className="font-mono text-sm break-all">{user.email}</div>
                  </div>
                  {user.contact && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">CONTACT</div>
                      <div className="font-mono text-sm">{user.contact}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">ROLE</div>
                    <span className={`inline-block px-2 py-0.5 text-xs font-black uppercase border-2 border-black ${user.role === 'seller' ? 'bg-black text-[#ccff00]' : 'bg-[#ccff00] text-black'}`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="w-full mt-2 bg-[#ccff00] text-black py-2.5 text-xs font-black uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  >
                    EDIT PROFILE
                  </button>
                </div>
              )}
            </div>

            {/* Become Seller */}
            {user.role === 'buyer' && (
              <div className="bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(204,255,0,1)] p-5">
                <div className="text-[#ccff00] font-black text-sm uppercase mb-2">GO SELLER</div>
                <p className="text-xs text-neutral-400 font-medium mb-4">
                  Upgrade your account to list products and manage drops on Snitch.
                </p>
                {becomeSellerError && (
                  <div className="mb-3 text-xs font-bold text-red-400 uppercase">{becomeSellerError}</div>
                )}
                <button
                  type="button"
                  onClick={handleBecomeSeller}
                  disabled={becomeSellerLoading}
                  className="w-full bg-[#ccff00] text-black py-2.5 text-xs font-black uppercase border-2 border-[#ccff00] shadow-[3px_3px_0px_0px_rgba(204,255,0,0.5)] hover:shadow-[5px_5px_0px_0px_rgba(204,255,0,0.5)] transition-all cursor-pointer disabled:opacity-60"
                >
                  {becomeSellerLoading ? 'UPGRADING...' : 'BECOME A SELLER'}
                </button>
              </div>
            )}

            {/* Seller Quick Links */}
            {user.role === 'seller' && (
              <div className="bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(204,255,0,1)] p-5">
                <div className="text-[#ccff00] font-black text-sm uppercase mb-3">SELLER HUB</div>
                <div className="space-y-2">
                  <Link to="/seller/dashboard" className="block w-full bg-[#ccff00] text-black py-2.5 text-xs font-black uppercase text-center border-2 border-[#ccff00] shadow-[3px_3px_0px_0px_rgba(204,255,0,0.5)] hover:shadow-[5px_5px_0px_0px_rgba(204,255,0,0.5)] transition-all">
                    DASHBOARD
                  </Link>
                  <Link to="/seller/create-product" className="block w-full bg-white text-black py-2.5 text-xs font-black uppercase text-center border-2 border-white hover:bg-neutral-100 transition-all">
                    + NEW DROP
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_0_#000] space-y-3">
              <h3 className="font-black uppercase">Addresses</h3>
              {(user.addresses || []).map((address) => (
                <p key={address._id} className="text-xs font-mono border-2 border-black p-2">
                  {address.fullname}, {address.line1}, {address.city}, {address.state} {address.pincode}
                </p>
              ))}
              <form className="space-y-2" onSubmit={async (e) => {
                e.preventDefault()
                setAddressSaving(true)
                try {
                  const res = await accountApi.post('/addresses', { ...addressForm, isDefault: true })
                  dispatch(setUser(res.data.user))
                  setAddressForm({ fullname: '', phone: '', line1: '', city: '', state: '', pincode: '' })
                } finally {
                  setAddressSaving(false)
                }
              }}>
                {['fullname','phone','line1','city','state','pincode'].map((field) => (
                  <input key={field} required value={addressForm[field]} onChange={(e) => setAddressForm((p) => ({ ...p, [field]: e.target.value }))} placeholder={field.toUpperCase()} className="w-full border-2 border-black px-2 py-1.5 font-mono text-[11px] uppercase" />
                ))}
                <button disabled={addressSaving} className="w-full bg-[#ccff00] border-2 border-black py-2 text-xs font-black uppercase">{addressSaving ? 'SAVING...' : 'SAVE ADDRESS'}</button>
              </form>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full bg-white text-black py-3 text-xs font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              SIGN OUT
            </button>
          </div>

          {/* RIGHT — Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
              <h2 className="text-2xl font-black uppercase font-display mb-5">ORDER ARCHIVE</h2>

              {ordersLoading ? (
                <div className="font-mono text-sm uppercase text-neutral-500 py-8 text-center">
                  LOADING ORDERS...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-5xl font-black text-neutral-200 mb-3">∅</div>
                  <p className="font-mono text-xs uppercase text-neutral-500 mb-4">
                    No orders yet. Start shopping!
                  </p>
                  <Link
                    to="/"
                    className="inline-block bg-black text-[#ccff00] border-2 border-black px-5 py-2.5 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    BROWSE DROPS
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const sym = getCurrencySymbol(order.price?.currency)
                    return (
                      <div key={order._id} className="border-2 border-black bg-[#f4f4f0] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                          <div>
                            <div className="text-[10px] font-mono uppercase text-neutral-500">ORDER ID</div>
                            <div className="font-mono text-xs font-bold break-all">{order.razorpay?.orderId || order._id}</div>
                            {order.createdAt && (
                              <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-[#ccff00] border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                              PAID
                            </span>
                            <span className="font-mono text-lg font-black">
                              {sym}{(order.price?.amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {(order.orderItems || []).map((item, i) => {
                            const img = item.images?.[0]?.uri || item.images?.[0]?.url
                            return (
                              <div key={i} className="flex items-center gap-3">
                                {img ? (
                                  <img src={img} alt={item.title} className="w-12 h-12 object-cover border-2 border-black shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 bg-neutral-200 border-2 border-black shrink-0 flex items-center justify-center text-neutral-400 text-xs font-mono">
                                    IMG
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-black uppercase text-sm truncate">{item.title}</div>
                                  <div className="font-mono text-xs text-neutral-500">QTY: {item.quantity} · {sym}{(item.price?.amount || 0).toLocaleString('en-IN')}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
