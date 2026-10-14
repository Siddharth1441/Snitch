import React from 'react'
import { Link, NavLink } from 'react-router'
import { useSelector } from 'react-redux'
import { useAuth } from '../../features/auth/hook/useAuth.js'

const navClass = ({ isActive }) =>
  `text-[11px] font-mono font-black uppercase tracking-wider ${isActive ? 'underline' : 'hover:underline'}`

export const StoreHeader = () => {
  const user = useSelector((state) => state.auth.user)
  const cartItems = useSelector((state) => state.cart.items)
  const { handleLogout } = useAuth()
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0)

  return (
    <>
      <div className="w-full bg-black text-[#ccff00] font-mono text-[10px] sm:text-xs font-bold py-1.5 px-4 overflow-hidden border-b-2 border-black tracking-widest uppercase">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <span className="truncate">// FREE SHIPPING ON ORDERS OVER ₹1,999 — EASY 7-DAY RETURNS</span>
          <span className="hidden md:inline">SECURE CHECKOUT VIA RAZORPAY</span>
        </div>
      </div>
      <header className="relative z-20 w-full px-4 sm:px-10 py-4 flex flex-wrap justify-between items-center gap-4 border-b-4 border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <Link to="/" className="relative group inline-block">
            <div className="absolute inset-0 bg-[#ccff00] translate-x-1 translate-y-1 border-2 border-black transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
            <div className="relative bg-white border-2 border-black px-4 py-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase font-display block leading-none">SNITCH</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <NavLink to="/shop" className={navClass}>SHOP</NavLink>
            <NavLink to="/shop?gender=men" className={navClass}>MEN</NavLink>
            <NavLink to="/shop?gender=women" className={navClass}>WOMEN</NavLink>
            <NavLink to="/wishlist" className={navClass}>WISHLIST</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <Link to="/cart" className="bg-[#ccff00] hover:bg-lime-400 text-black border-2 border-black px-3 py-1.5 text-xs font-mono font-black tracking-wider uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            CART ({cartCount})
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="bg-white hover:bg-[#ccff00] border-2 border-black px-3 py-1.5 text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {user.fullname?.split(' ')[0] || 'ACCOUNT'}
              </Link>
              {user.role === 'seller' && (
                <Link to="/seller" className="bg-black text-[#ccff00] border-2 border-black px-3.5 py-1.5 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hidden sm:block">
                  PORTAL
                </Link>
              )}
              <button onClick={handleLogout} className="bg-red-500 text-white border-2 border-black px-3 py-1.5 text-xs font-mono font-bold uppercase cursor-pointer">OUT</button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-white border-2 border-black px-4 py-1.5 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">LOGIN</Link>
              <Link to="/register" className="bg-[#ccff00] border-2 border-black px-4 py-1.5 text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">REGISTER</Link>
            </>
          )}
        </div>
      </header>
    </>
  )
}

export const StoreFooter = () => (
  <footer className="relative z-20 w-full bg-black text-[#ccff00] border-t-4 border-black mt-12">
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8 grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div>
        <div className="text-2xl font-black uppercase tracking-tighter font-display mb-2">SNITCH</div>
        <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest leading-relaxed">Streetwear drops. Nationwide shipping. Est. 2026.</p>
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest mb-3 text-neutral-400">SHOP</div>
        <Link to="/shop" className="block text-xs font-mono font-bold hover:text-white">All products</Link>
        <Link to="/shop?category=tshirts" className="block text-xs font-mono font-bold hover:text-white">T-Shirts</Link>
        <Link to="/shop?category=jeans" className="block text-xs font-mono font-bold hover:text-white">Jeans</Link>
        <Link to="/shop?category=hoodies" className="block text-xs font-mono font-bold hover:text-white">Hoodies</Link>
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest mb-3 text-neutral-400">HELP</div>
        <Link to="/shipping" className="block text-xs font-mono font-bold hover:text-white">Shipping</Link>
        <Link to="/returns" className="block text-xs font-mono font-bold hover:text-white">Returns</Link>
        <Link to="/faq" className="block text-xs font-mono font-bold hover:text-white">FAQ</Link>
        <Link to="/contact" className="block text-xs font-mono font-bold hover:text-white">Contact</Link>
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest mb-3 text-neutral-400">COMPANY</div>
        <Link to="/about" className="block text-xs font-mono font-bold hover:text-white">About</Link>
        <Link to="/profile" className="block text-xs font-mono font-bold hover:text-white">My orders</Link>
        <Link to="/wishlist" className="block text-xs font-mono font-bold hover:text-white">Wishlist</Link>
      </div>
    </div>
    <div className="border-t border-neutral-800 py-2 px-6 sm:px-12 flex justify-between items-center text-[10px] font-mono text-neutral-600 uppercase">
      <span>© 2026 SNITCH</span>
      <span>SECURE PAYMENTS VIA RAZORPAY</span>
    </div>
  </footer>
)

const StoreChrome = ({ children }) => (
  <div className="min-h-screen bg-dot-matrix bg-[#f4f4f0] text-black font-sans selection:bg-[#ccff00] selection:text-black flex flex-col">
    <StoreHeader />
    <div className="flex-grow">{children}</div>
    <StoreFooter />
  </div>
)

export default StoreChrome
