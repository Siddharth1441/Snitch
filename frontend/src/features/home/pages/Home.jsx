import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../../hooks/useProduct.js'
import { useAuth } from '../../auth/hook/useAuth.js'

const Home = () => {
  const user = useSelector((state) => state.auth.user)
  const { handleLogout } = useAuth()
  const { handleGetAllProducts, loading, error, products } = useProduct()

  // Local state for search, sort, view mode & modal
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'price-asc' | 'price-desc' | 'title'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [addedToCartToast, setAddedToCartToast] = useState(null)

  useEffect(() => {
    handleGetAllProducts()
  }, [])

  // Currency symbol helper
  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'USD':
        return '$'
      case 'EUR':
        return '€'
      case 'GBP':
        return '£'
      case 'INR':
      default:
        return '₹'
    }
  }

  // Filtered and sorted products catalog
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return []

    let result = products.filter((product) => {
      const titleMatch = product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const descMatch = product?.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return titleMatch || descMatch
    })

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      } else if (sortBy === 'price-asc') {
        return (a.price?.amount || 0) - (b.price?.amount || 0)
      } else if (sortBy === 'price-desc') {
        return (b.price?.amount || 0) - (a.price?.amount || 0)
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '')
      }
      return 0
    })

    return result
  }, [products, searchQuery, sortBy])

  const handleAddToCart = (productTitle) => {
    setAddedToCartToast(`"${productTitle}" ADDED TO CART ARCHIVE!`)
    setTimeout(() => {
      setAddedToCartToast(null)
    }, 3500)
  }

  return (
    <div className="min-h-screen bg-dot-matrix bg-[#f4f4f0] text-black font-sans selection:bg-[#ccff00] selection:text-black flex flex-col justify-between overflow-x-hidden relative">
      
      {/* BACKGROUND WATERMARK */}
      <div className="fixed top-1/3 -left-28 -rotate-90 text-[140px] sm:text-[240px] font-black text-neutral-300/20 leading-none pointer-events-none select-none tracking-tighter uppercase font-display z-0">
        SNITCH
      </div>

      {/* TOAST NOTIFICATION */}
      {addedToCartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#ccff00] text-black font-mono font-bold text-xs sm:text-sm px-6 py-3 border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase animate-in slide-in-from-bottom-5 duration-200 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping"></span>
          <span>{addedToCartToast}</span>
        </div>
      )}

      {/* ANNOUNCEMENT TICKER BANNER */}
      <div className="w-full bg-black text-[#ccff00] font-mono text-[10px] sm:text-xs font-bold py-1.5 px-4 overflow-hidden border-b-2 border-black tracking-widest uppercase">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <span className="truncate">// EXCLUSIVE STREETWEAR DROPS — FREE SHIPPING NATIONWIDE</span>
          <span className="hidden md:inline font-mono">STATUS: LIVE CATALOG</span>
        </div>
      </div>

      {/* TOP HEADER NAVIGATION BAR */}
      <header className="relative z-20 w-full px-4 sm:px-10 py-4 flex flex-wrap justify-between items-center gap-4 border-b-4 border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <Link to="/" className="relative group inline-block">
            <div className="absolute inset-0 bg-[#ccff00] translate-x-1 translate-y-1 border-2 border-black transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5"></div>
            <div className="relative bg-white border-2 border-black px-4 py-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase font-display block leading-none">
                SNITCH
              </span>
            </div>
          </Link>
          <span className="hidden sm:inline bg-black text-white font-mono font-bold text-[10px] uppercase px-2 py-1 border border-black tracking-widest">
            STOREFRONT
          </span>
        </div>

        {/* NAVIGATION LINKS & AUTH */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {user ? (
            <>
              <div className="bg-neon-lime border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {user.fullname || user.email}
                {user.isSeller && <span className="font-mono text-[9px] bg-black text-white px-1 ml-1 cursor-default">[SELLER]</span>}
              </div>

              {user.isSeller && (
                <Link
                  to="/seller"
                  className="bg-black text-[#ccff00] hover:bg-neutral-900 border-2 border-black px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                >
                  SELLER PORTAL ⚡
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-black px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white hover:bg-neutral-100 border-2 border-black px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="bg-neon-lime hover:bg-lime-400 text-black border-2 border-black px-4 py-1.5 text-xs font-mono font-black tracking-wider uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                REGISTER
              </Link>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-grow space-y-8">
        
        {/* HERO BANNER */}
        <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-9xl font-black font-display uppercase">
            DROP
          </div>
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-black text-[#ccff00] text-[11px] font-mono font-bold px-3 py-1 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
              <span>UNFILTERED STREETWEAR // PUBLIC ARCHIVE</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tighter uppercase leading-none text-black">
              EXPLORE ALL DROPS
            </h1>
            <p className="text-sm sm:text-base font-medium text-neutral-700 uppercase font-sans max-w-xl leading-relaxed">
              Discover curated streetwear collections created by independent sellers and creators across the platform.
            </p>

            <div className="pt-2 flex items-center gap-4 flex-wrap">
              <div className="bg-[#ccff00] border-2 border-black px-3.5 py-1.5 text-xs font-mono font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                {products.length} {products.length === 1 ? 'DROP LISTED' : 'TOTAL DROPS LISTED'}
              </div>
              <a
                href="#catalog-section"
                className="bg-black text-white hover:bg-neutral-800 border-2 border-black px-5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                BROWSE CATALOG ↓
              </a>
            </div>
          </div>
        </div>

        {/* CONTROLS TOOLBAR: SEARCH, SORT & VIEW MODES */}
        <div id="catalog-section" className="bg-white border-3 border-black p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          {/* SEARCH INPUT */}
          <div className="relative flex-grow max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PRODUCTS BY TITLE OR DESCRIPTION..."
              className="w-full bg-[#f9f9f6] border-2 border-black px-4 py-2.5 text-xs sm:text-sm font-mono font-bold placeholder-neutral-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ccff00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs bg-black text-white px-2 py-0.5 border border-black cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* SORT & LAYOUT TOGGLES */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* SORT SELECTOR */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase hidden sm:inline">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#f9f9f6] border-2 border-black px-3 py-2 text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer"
              >
                <option value="newest">NEWEST ARRIVALS</option>
                <option value="price-desc">PRICE: HIGH TO LOW</option>
                <option value="price-asc">PRICE: LOW TO HIGH</option>
                <option value="title">TITLE: A - Z</option>
              </select>
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center border-2 border-black bg-[#f9f9f6] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors cursor-pointer border-r border-black ${
                  viewMode === 'grid' ? 'bg-[#ccff00] text-black' : 'bg-white text-neutral-600 hover:bg-neutral-200'
                }`}
                title="Grid View"
              >
                GRID ☷
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#ccff00] text-black' : 'bg-white text-neutral-600 hover:bg-neutral-200'
                }`}
                title="List View"
              >
                LIST ☰
              </button>
            </div>
          </div>
        </div>

        {/* ERROR STATE DISPLAY */}
        {error && (
          <div className="p-4 bg-red-400 border-3 border-black text-black font-mono font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase flex justify-between items-center flex-wrap gap-2">
            <span>[ERROR FETCHING CATALOG]: {error}</span>
            <button
              onClick={() => handleGetAllProducts()}
              className="bg-black text-white hover:bg-neutral-800 px-3 py-1 text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
            >
              RETRY FETCH
            </button>
          </div>
        )}

        {/* LOADING STATE SKELETON */}
        {loading && products.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white border-3 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse space-y-4">
                <div className="w-full h-56 bg-neutral-200 border-2 border-black"></div>
                <div className="h-6 bg-neutral-200 w-3/4"></div>
                <div className="h-4 bg-neutral-200 w-1/2"></div>
                <div className="h-10 bg-neutral-300 w-full border border-black"></div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white border-4 border-black p-10 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-8">
            <div className="w-16 h-16 bg-[#ccff00] border-2 border-black mx-auto flex items-center justify-center text-3xl font-black mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🛍️
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight mb-2">
              {searchQuery ? 'NO MATCHING DROPS FOUND' : 'NO PRODUCTS AVAILABLE IN STOREFRONT'}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-neutral-600 uppercase max-w-md mx-auto mb-6">
              {searchQuery
                ? `No streetwear items match your search for "${searchQuery}". Try clearing the filter.`
                : 'There are currently no product drops published. Sellers will launch new streetwear items soon!'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-black text-[#ccff00] hover:bg-neutral-800 border-2 border-black px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                RESET SEARCH FILTER
              </button>
            ) : (
              <Link
                to={user?.isSeller ? "/seller/create-product" : "/login"}
                className="inline-block bg-[#ccff00] hover:bg-lime-400 text-black border-2 border-black px-6 py-3 text-xs sm:text-sm font-mono font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
              >
                {user?.isSeller ? "+ LAUNCH NEW DROP NOW" : "LOGIN TO LAUNCH PRODUCT"}
              </Link>
            )}
          </div>
        )}

        {/* PRODUCTS GRID VIEW */}
        {!loading && filteredProducts.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const mainImage = product.images?.[0]?.url
              const currencySym = getCurrencySymbol(product.price?.currency)
              const formattedPrice = (product.price?.amount || 0).toLocaleString('en-IN')
              const imageCount = product.images?.length || 0

              return (
                <div
                  key={product._id}
                  className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* IMAGE CONTAINER */}
                    <div className="relative w-full h-64 bg-[#e3e3dc] border-b-3 border-black overflow-hidden flex items-center justify-center">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://placehold.co/600x400/000000/ccff00?text=SNITCH+DROP'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-neutral-400 font-mono text-xs">
                          <span className="text-3xl mb-1">📷</span>
                          <span>NO IMAGE ASSET</span>
                        </div>
                      )}

                      {/* ASSET COUNT BADGE */}
                      <div className="absolute top-2 right-2 bg-black text-white font-mono font-bold text-[10px] px-2 py-0.5 border border-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                        {imageCount} {imageCount === 1 ? 'IMAGE' : 'IMAGES'}
                      </div>

                      {/* CURRENCY TAG */}
                      <div className="absolute top-2 left-2 bg-[#ccff00] text-black font-mono font-black text-[10px] px-2 py-0.5 border border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {product.price?.currency || 'INR'}
                      </div>
                    </div>

                    {/* CARD CONTENT */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xl font-black uppercase font-serif tracking-tight leading-snug line-clamp-1 group-hover:underline">
                          {product.title}
                        </h3>
                      </div>

                      <p className="text-xs font-medium text-neutral-600 line-clamp-2 leading-relaxed font-sans">
                        {product.description}
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t-2 border-dashed border-neutral-300">
                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 uppercase block">PRICE</span>
                          <span className="text-2xl font-black font-mono tracking-tight text-black">
                            {currencySym}{formattedPrice}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase block">RELEASE DATE</span>
                          <span className="text-xs font-mono font-bold text-neutral-800">
                            {product.createdAt
                              ? new Date(product.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'LIVE NOW'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product)
                        setActiveImageIndex(0)
                      }}
                      className="w-full bg-white hover:bg-neutral-100 text-black border-2 border-black py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-center"
                    >
                      INSPECT
                    </button>
                    <button
                      onClick={() => handleAddToCart(product.title)}
                      className="w-full bg-black text-[#ccff00] hover:bg-neutral-900 border-2 border-black py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-center"
                    >
                      + ADD DROP
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* PRODUCTS LIST VIEW */}
        {!loading && filteredProducts.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const mainImage = product.images?.[0]?.url
              const currencySym = getCurrencySymbol(product.price?.currency)
              const formattedPrice = (product.price?.amount || 0).toLocaleString('en-IN')

              return (
                <div
                  key={product._id}
                  className="bg-white border-3 border-black p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="flex items-center gap-4 flex-grow">
                    {/* THUMBNAIL */}
                    <div className="w-24 h-24 bg-[#e3e3dc] border-2 border-black flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://placehold.co/150x150/000000/ccff00?text=SNITCH'
                          }}
                        />
                      ) : (
                        <span className="text-2xl">📷</span>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black uppercase font-serif tracking-tight">
                          {product.title}
                        </h3>
                        <span className="bg-[#ccff00] text-black border border-black px-1.5 py-0.5 text-[10px] font-mono font-bold">
                          {product.price?.currency || 'INR'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-2 max-w-xl leading-relaxed">
                        {product.description}
                      </p>
                      <div className="text-[11px] font-mono text-neutral-500">
                        DATE: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'} | ASSETS: {product.images?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* PRICE & ACTIONS */}
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-200">
                    <div className="text-left md:text-right pr-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block">PRICE</span>
                      <span className="text-2xl font-black font-mono">
                        {currencySym}{formattedPrice}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProduct(product)
                        setActiveImageIndex(0)
                      }}
                      className="bg-white hover:bg-neutral-100 border-2 border-black px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      INSPECT
                    </button>
                    <button
                      onClick={() => handleAddToCart(product.title)}
                      className="bg-black text-[#ccff00] hover:bg-neutral-900 border-2 border-black px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* PRODUCT INSPECTION MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#f9f9f6] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative space-y-6 animate-in fade-in zoom-in duration-200">
            
            {/* MODAL HEADER */}
            <div className="flex justify-between items-start pb-4 border-b-4 border-black">
              <div>
                <span className="bg-[#ccff00] border border-black text-black font-mono font-bold text-[10px] px-2 py-0.5 uppercase mb-1 inline-block">
                  PRODUCT CATALOGUE // ID: {selectedProduct._id}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-serif uppercase tracking-tight leading-none text-black">
                  {selectedProduct.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-10 h-10 border-2 border-black bg-white hover:bg-[#ccff00] font-black text-xl flex items-center justify-center transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* GALLERY & DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GALLERY */}
              <div className="space-y-3">
                <div className="w-full h-64 sm:h-72 bg-[#e3e3dc] border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center">
                  {selectedProduct.images?.[activeImageIndex]?.url ? (
                    <img
                      src={selectedProduct.images[activeImageIndex].url}
                      alt={selectedProduct.title}
                      className="w-full h-full object-contain bg-white"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://placehold.co/600x400/000000/ccff00?text=SNITCH+DROP'
                      }}
                    />
                  ) : (
                    <span className="font-mono text-xs text-neutral-500">NO IMAGE AVAILABLE</span>
                  )}
                </div>

                {/* THUMBNAILS */}
                {selectedProduct.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 border-2 border-black flex-shrink-0 cursor-pointer overflow-hidden transition-all ${
                          activeImageIndex === idx ? 'ring-4 ring-[#ccff00] border-black scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`Thumb ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* PRICE DISPLAY */}
                  <div className="bg-black text-[#ccff00] p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono uppercase block text-neutral-400">PUBLIC PRICE</span>
                      <span className="text-3xl font-black font-mono">
                        {getCurrencySymbol(selectedProduct.price?.currency)}
                        {(selectedProduct.price?.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="bg-[#ccff00] text-black font-mono font-extrabold text-xs px-2.5 py-1 border border-black uppercase">
                      {selectedProduct.price?.currency || 'INR'}
                    </span>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest mb-1">
                      // DROP DETAILS & DESCRIPTION
                    </h4>
                    <div className="bg-white border-2 border-black p-4 text-xs font-medium text-neutral-800 leading-relaxed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-h-40 overflow-y-auto whitespace-pre-line">
                      {selectedProduct.description}
                    </div>
                  </div>

                  {/* METADATA */}
                  <div className="bg-[#e3e3dc] border-2 border-black p-3 space-y-1 text-xs font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">RELEASED AT:</span>
                      <span className="font-bold">
                        {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">MEDIA ASSETS:</span>
                      <span className="font-bold">{selectedProduct.images?.length || 0} IMAGES</span>
                    </div>
                  </div>
                </div>

                {/* MODAL ACTIONS */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="w-full bg-white hover:bg-neutral-100 text-black border-2 border-black py-2.5 text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    CLOSE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToCart(selectedProduct.title)
                      setSelectedProduct(null)
                    }}
                    className="w-full bg-[#ccff00] hover:bg-lime-400 text-black border-2 border-black py-2.5 text-xs font-mono font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    + ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-20 w-full bg-black text-[#ccff00] font-mono text-[11px] sm:text-xs py-3 px-6 sm:px-12 flex justify-between items-center tracking-widest border-t-2 border-black uppercase select-none mt-12">
        <span className="font-bold">SNITCH // STREETWEAR PUBLIC CATALOG</span>
        <span className="font-bold">ALL DROPS VERIFIED</span>
      </footer>
    </div>
  )
}

export default Home