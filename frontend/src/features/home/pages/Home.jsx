import React from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useAuth } from '../../auth/hook/useAuth.js'

const Home = () => {
  const user = useSelector((state) => state.auth.user)
  const { handleLogout } = useAuth()

  return (
    <div className="min-h-screen bg-dot-matrix relative text-black font-sans selection:bg-[#ccff00] selection:text-black flex flex-col justify-between overflow-x-hidden">
      
      {/* Background Typography Watermark */}
      <div className="fixed top-1/4 -right-16 rotate-90 text-[120px] sm:text-[200px] font-black text-neutral-300/20 leading-none pointer-events-none select-none tracking-tighter uppercase font-display z-0">
        SNITCH
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-6 flex flex-wrap justify-between items-center gap-4 border-b-2 border-black bg-white/80 backdrop-blur-md">
        <Link to="/" className="relative group inline-block">
          <div className="absolute inset-0 bg-[#ccff00] translate-x-1.5 translate-y-1.5 border-2 border-black transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
          <div className="relative bg-white border-2 border-black px-5 py-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tighter text-black uppercase font-display block leading-none">
              SNITCH
            </span>
          </div>
        </Link>

        {/* User Account / Navigation Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {user ? (
            <div className="flex items-center gap-3 flex-wrap">
              {user.role === 'seller' && (
                <>
                  <Link
                    to="/seller/dashboard"
                    className="bg-[#ccff00] text-black hover:bg-lime-400 border-2 border-black px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
                  >
                    SELLER DASHBOARD
                  </Link>
                  <Link
                    to="/seller/create-product"
                    className="bg-black text-[#ccff00] hover:bg-neutral-900 border-2 border-black px-4 py-1.5 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    + DROP
                  </Link>
                </>
              )}
              <div className="bg-[#e3e3dc] border-2 border-black px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {user.fullname || user.email} [{user.role || 'USER'}]
              </div>
              <button
                onClick={handleLogout}
                className="bg-black text-white hover:bg-red-600 border-2 border-black px-4 py-1.5 text-xs font-mono font-bold tracking-widest uppercase transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="bg-white hover:bg-neutral-100 text-black border-2 border-black px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="bg-[#ccff00] text-black border-2 border-black px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
              >
                INITIALIZE
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-12 flex-grow flex flex-col justify-center">
        
        {/* Banner Announcement */}
        <div className="inline-flex items-center gap-2 bg-black text-[#ccff00] text-xs font-mono font-bold px-3 py-1.5 border border-black mb-6 w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
          <span>SEASON_024 // DROPS LIVE NOW</span>
        </div>

        {/* Hero Title */}
        <div className="relative mb-8">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase font-display leading-[0.85] tracking-tighter text-black select-none">
            UNFILTERED<br />
            STREETWEAR<br />
            ARCHIVE
          </h1>
        </div>

        {/* User Welcome Card or Quick Call to Action */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            {user ? (
              <div>
                <div className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest mb-1">
                  // AUTHENTICATED SESSION
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
                  WELCOME BACK, {user.fullname || 'RECRUIT'}!
                </h2>
                <p className="text-xs sm:text-sm font-medium text-neutral-700 mb-6">
                  You are logged in as <span className="font-bold underline">{user.email}</span>. Access all restricted drops, exclusive lookbooks, and order tracking from your archive dashboard.
                </p>
                <div className="flex flex-wrap gap-3">
                  {user.role === 'seller' ? (
                    <>
                      <Link
                        to="/seller/dashboard"
                        className="bg-[#ccff00] text-black font-black text-xs px-5 py-2.5 border-2 border-black uppercase tracking-wider hover:bg-lime-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
                      >
                        OPEN SELLER DASHBOARD →
                      </Link>
                      <Link
                        to="/seller/create-product"
                        className="bg-black text-[#ccff00] font-mono text-xs px-5 py-2.5 border-2 border-black uppercase tracking-wider hover:bg-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
                      >
                        + NEW PRODUCT DROP
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#ccff00] text-black font-black text-xs px-4 py-2 border-2 border-black uppercase tracking-wider">
                        STATUS: ACTIVE RECRUIT
                      </div>
                      <div className="bg-black text-white font-mono text-xs px-4 py-2 border-2 border-black uppercase tracking-wider">
                        ROLE: {user.role || 'BUYER'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest mb-1">
                  // ACCESS RESTRICTED
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
                  JOIN THE RECRUITMENT GRID
                </h2>
                <p className="text-xs sm:text-sm font-medium text-neutral-700 mb-6">
                  Authenticate your identity or register a new passkey to secure your position in the upcoming high-contrast apparel drops.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/login"
                    className="bg-black text-[#ccff00] font-black text-sm px-6 py-3 border-2 border-black uppercase tracking-widest hover:bg-neutral-900 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    ENTER LOGIN →
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#ccff00] text-black font-black text-sm px-6 py-3 border-2 border-black uppercase tracking-widest hover:bg-lime-400 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    INITIALIZE ACCOUNT
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Polaroid Mini Card */}
          <div className="md:col-span-4 bg-white border-2 border-black p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-2 hover:rotate-0 transition-transform">
            <div className="w-full aspect-square bg-neutral-900 border border-black overflow-hidden mb-2">
              <img
                src="/streetwear_polaroid.png"
                alt="Snitch Lookbook"
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
            </div>
            <div className="text-[10px] font-mono font-bold text-neutral-600 uppercase flex justify-between">
              <span>LOOKBOOK_FW24</span>
              <span>SNITCH INC.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full bg-black text-[#ccff00] font-mono text-[11px] sm:text-xs py-2 px-6 sm:px-12 flex justify-between items-center tracking-widest border-t border-black uppercase select-none">
        <span className="font-bold">SYS.REQ.OK // HOME</span>
        <span className="font-bold">V.1.0.4</span>
      </footer>
    </div>
  )
}

export default Home
