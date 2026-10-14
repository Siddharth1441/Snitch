import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../../hooks/useProduct.js'
import { useCart } from '../../cart/hook/useCart.js'
import { getRelatedProducts } from '../../products/services/product.api.js'
import axios from 'axios'

const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    case 'GBP':
      return '£'
    default:
      return '₹'
  }
}

const getAttributeEntries = (attr) => {
  if (!attr) return []
  let parsed = attr
  if (typeof attr === 'string') {
    try {
      parsed = JSON.parse(attr)
    } catch {
      return [['Option', attr]]
    }
  }
  if (parsed instanceof Map) {
    return Array.from(parsed.entries()).filter(([k, v]) => k && v)
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return Object.entries(parsed).filter(([k, v]) => k && v)
  }
  return []
}

const splitSizes = (value) => String(value || '')
  .split(',')
  .map((size) => size.trim())
  .filter(Boolean)

const getVariantSizes = (variant) => splitSizes(
  getAttributeEntries(variant?.attributes)
    .find(([key]) => key.toLowerCase() === 'size')?.[1]
)

const getProductVariants = (product) => {
  if (Array.isArray(product?.varients)) return product.varients
  return Array.isArray(product?.variants) ? product.variants : []
}

const getStockBadge = (stock) => {
  if (stock === 0) return { label: 'OUT OF STOCK', cls: 'bg-red-100 border-red-500 text-red-600' }
  return { label: 'IN STOCK', cls: 'bg-emerald-100 border-emerald-600 text-emerald-700' }
}

const ProductDetail = () => {
  const { productId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { handleGetProductById } = useProduct()
  const { handleAddItemToCart } = useCart()
  const cartItems = useSelector((state) => state.cart.items)
  const user = useSelector((state) => state.auth.user)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [cartError, setCartError] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [related, setRelated] = useState([])
  const [saved, setSaved] = useState(false)


  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const productData = await handleGetProductById(productId)
        if (isMounted) {
          setProduct(productData)
          const vars = getProductVariants(productData)
          const sizes = productData?.sizes || []
          if (vars.length > 0 && sizes.length === 0) {
            const inStockVariant = vars.find((variant) => (variant.stock || 0) > 0)
            setSelectedVariantId((inStockVariant || vars[0])._id)
          } else {
            setSelectedVariantId(null)
          }
          setSelectedSize(null)
          setActiveImageIndex(0)
          setQuantity(1)
          getRelatedProducts(productId).then((data) => setRelated(data.products || [])).catch(() => setRelated([]))
        }
      } catch (requestError) {
        if (isMounted) setError(requestError?.response?.data?.message || 'Unable to load this product.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (productId) loadProduct()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const currencySymbol = getCurrencySymbol(product?.price?.currency)
  const formattedPrice = (product?.price?.amount || 0).toLocaleString('en-IN')
  const variants = getProductVariants(product)
  const selectedVariant = variants.find((v) => v._id === selectedVariantId)

  // Main product drop images (e.g. Navy Blue Polo) come FIRST in gallery
  const productImages = (product?.images || [])
    .map((img) => img.url)
    .filter(Boolean)

  const availableSizes = Array.from(new Set([
    ...(product?.sizes || []).flatMap((size) => splitSizes(size)),
    ...variants
      .flatMap((variant) => getVariantSizes(variant))
  ]))

  // Only show the selected variant's photos. Base product photos are a fallback.
  const selectedVariantImages = (selectedVariant?.images || [])
    .map((img) => img.uri || img.url)
    .filter(Boolean)

  const displayImages = selectedVariantImages.length > 0
    ? Array.from(new Set(selectedVariantImages))
    : productImages

  const activeImage = displayImages[activeImageIndex] || displayImages[0]

  const handleSelectVariant = (variantId) => {
    const targetVar = variants.find((v) => v._id === variantId)
    const targetSizes = getVariantSizes(targetVar)
    if (selectedSize && targetSizes.length > 0 && !targetSizes.some((size) => String(size).toLowerCase() === String(selectedSize).toLowerCase())) return
    setSelectedVariantId(variantId)
    const nextSize = targetSizes.find((size) => String(size).toLowerCase() === String(selectedSize).toLowerCase()) || targetSizes[0]
    setSelectedSize(nextSize || selectedSize || null)
    setActiveImageIndex(0)
  }

  const handleSelectSize = (size) => {
    setSelectedSize(size)
    const matchingVariants = variants.filter((variant) =>
      getVariantSizes(variant).some((variantSize) => String(variantSize).toLowerCase() === String(size).toLowerCase())
    )
    const matchingVariant = matchingVariants.find((variant) => (variant.stock || 0) > 0) || matchingVariants[0]
    setSelectedVariantId(matchingVariant?._id || null)
    setActiveImageIndex(0)
  }

  const handleAddToCart = async () => {
    if (!selectedVariantId || !selectedVariant || (availableSizes.length > 0 && !selectedSize) || (selectedVariant.stock || 0) === 0) return
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    try {
      setAddingToCart(true)
      setCartError(null)
      await handleAddItemToCart({ productId, variantId: selectedVariantId, quantity })
    } catch (requestError) {
      setCartError(requestError?.response?.data?.message || 'Unable to add this item to cart.')
    } finally {
      setAddingToCart(false)
    }
  }

  const visibleVariants = variants

  return (
    <div className="min-h-screen bg-dot-matrix bg-[#f4f4f0] text-black font-sans selection:bg-[#ccff00] selection:text-black">
      <header className="relative z-20 w-full px-4 sm:px-10 py-4 flex flex-wrap justify-between items-center gap-4 border-b-4 border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <Link to="/" className="relative group inline-block">
          <div className="absolute inset-0 bg-[#ccff00] translate-x-1 translate-y-1 border-2 border-black transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
          <div className="relative bg-white border-2 border-black px-4 py-1.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase font-display block leading-none">SNITCH</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="bg-[#ccff00] hover:bg-lime-400 text-black border-2 border-black px-4 py-2 text-xs font-mono font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            CART ({cartItems.reduce((total, item) => total + (item.quantity || 0), 0)})
          </Link>
          {user && (
            <Link to="/profile" className="hidden sm:block bg-white border-2 border-black px-3 py-2 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-all">
              ACCOUNT
            </Link>
          )}
          <Link to="/" className="bg-black text-[#ccff00] hover:bg-neutral-900 border-2 border-black px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            BACK TO CATALOG
          </Link>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {loading && (
          <div className="bg-white border-4 border-black p-10 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono font-bold uppercase">
            LOADING DROP DETAILS...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-400 border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl font-black uppercase font-serif">DROP NOT FOUND</h1>
            <p className="mt-2 font-mono text-sm uppercase">{error}</p>
            <Link to="/" className="inline-block mt-6 bg-black text-[#ccff00] border-2 border-black px-5 py-3 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              RETURN TO CATALOG
            </Link>
          </div>
        )}

        {!loading && !error && product && (
          <div className="space-y-6">
            <div className="font-mono text-xs font-bold uppercase text-neutral-600">
              <Link to="/" className="hover:underline">CATALOG</Link> <span className="mx-2">/</span> PRODUCT FILE
            </div>

            <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
              {/* IMAGE GALLERY */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-[#e3e3dc] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
                  {activeImage ? (
                    <img key={`${selectedVariantId || 'base'}-${activeImage}`} src={activeImage} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-mono text-sm text-neutral-500 uppercase">NO IMAGE ASSET</span>
                  )}
                  <span className="absolute top-3 left-3 bg-[#ccff00] border-2 border-black px-2 py-1 font-mono text-xs font-black uppercase">
                    {product.price?.currency || 'INR'}
                  </span>
                  {activeImageIndex === 0 && (
                    <span className="absolute top-3 right-3 bg-black text-[#ccff00] border-2 border-black px-2 py-1 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                      MAIN DROP IMAGE
                    </span>
                  )}
                </div>

                {displayImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {displayImages.map((imgSrc, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`aspect-square border-2 border-black overflow-hidden cursor-pointer ${
                          index === activeImageIndex ? 'ring-4 ring-[#ccff00]' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgSrc} alt={`${product.title} view ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* DETAILS & VARIANT SELECTOR */}
              <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
                <div>
                  <span className="inline-block bg-black text-[#ccff00] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest">PRODUCT FILE</span>
                  <h1 className="mt-4 text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight leading-none">{product.title}</h1>
                </div>

                <div className="border-y-2 border-dashed border-neutral-300 py-4">
                  <span className="block text-xs font-mono font-bold text-neutral-500 uppercase">PRICE</span>
                  <span className="text-4xl font-black font-mono">{currencySymbol}{formattedPrice}</span>
                </div>

                {/* ── VARIANTS SECTION FOR BUYERS ── */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600">
                      SELECT OPTION / VARIANT ({variants.length > 0 ? variants.length : 'DEFAULT ITEM'})
                    </h2>
                    {selectedVariant ? (
                      <span className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${getStockBadge(selectedVariant.stock || 0).cls}`}>
                        {getStockBadge(selectedVariant.stock || 0).label}
                      </span>
                    ) : (
                      <span className="border border-emerald-600 bg-emerald-100 text-emerald-700 px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                        IN STOCK
                      </span>
                    )}
                  </div>

                  {availableSizes.length > 0 && (
                    <div className="border-2 border-black bg-[#f4f4f0] p-3">
                      <span className="block font-mono text-[10px] font-bold uppercase text-neutral-500 mb-2">SELECT SIZE <strong className="text-red-600">*</strong></span>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                          const sizeVariants = variants.filter((variant) =>
                            getVariantSizes(variant).some((variantSize) => String(variantSize).toLowerCase() === String(size).toLowerCase())
                          )
                          const isOutOfStock = sizeVariants.length > 0 && !sizeVariants.some((variant) => (variant.stock || 0) > 0)

                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleSelectSize(size)}
                              disabled={isOutOfStock}
                              className={`w-12 h-12 rounded-full border-2 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                                selectedSize === size
                                  ? 'bg-black text-[#ccff00] ring-4 ring-[#ccff00]'
                                  : 'bg-white text-black hover:bg-[#ccff00]'
                              }`}
                              aria-pressed={selectedSize === size}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                      {!selectedSize && <p className="mt-2 font-mono text-[10px] font-bold uppercase text-red-600">Please select a size to continue.</p>}
                    </div>
                  )}

                  {visibleVariants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {visibleVariants.map((v) => {
                        const isSelected = v._id === selectedVariantId
                        const variantSizes = getVariantSizes(v)
                        const isInSelectedSize = !selectedSize || variantSizes.length === 0 || variantSizes.some((size) => String(size).toLowerCase() === String(selectedSize).toLowerCase())
                        const entries = getAttributeEntries(v.attributes)
                        const stockInfo = getStockBadge(v.stock || 0)
                        const isOutOfStock = (v.stock || 0) === 0
                        const hasVarImgs = (v.images || []).length > 0

                        return (
                          <button
                            key={v._id}
                            type="button"
                            onClick={() => handleSelectVariant(v._id)}
                            disabled={!isInSelectedSize || isOutOfStock}
                            className={`p-3 border-2 text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#ccff00] bg-[#000] text-[#ccff00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                : 'border-black bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            } ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''} ${!isInSelectedSize ? 'opacity-35 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-1 w-full">
                              <div className="flex flex-wrap gap-1">
                                {entries.length > 0 ? (
                                  entries.map(([k, val]) => (
                                    <span
                                      key={k}
                                      className={`px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase border ${
                                        isSelected
                                          ? 'border-[#ccff00] bg-neutral-900 text-[#ccff00]'
                                          : 'border-black bg-neutral-100 text-black'
                                      }`}
                                    >
                                      {k.toLowerCase() === 'size' ? `SIZE: ${isSelected ? selectedSize : variantSizes.join(', ')}` : `${k}: ${val}`}
                                    </span>
                                  ))
                                ) : (
                                  <span className="font-mono text-xs font-bold">Standard Variant</span>
                                )}
                              </div>
                              {hasVarImgs && (
                                <span className={`font-mono text-[9px] font-bold uppercase px-1 border ${
                                  isSelected ? 'border-[#ccff00] text-[#ccff00]' : 'border-black text-neutral-500'
                                }`}>
                                  📸 {v.images.length}
                                </span>
                              )}
                            </div>

                            <span className={`font-mono text-[10px] font-bold uppercase ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                              {stockInfo.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-3.5 border-2 border-black bg-[#000] text-[#ccff00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                      <span className="px-2 py-0.5 font-mono text-[11px] font-bold uppercase border border-[#ccff00] bg-neutral-900 text-[#ccff00]">
                        {selectedSize ? `NO VARIANT FOR SIZE ${selectedSize}` : 'SELECT A SIZE TO VIEW ITS VARIANT'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <h2 className="font-mono text-xs font-bold uppercase text-neutral-500">DESCRIPTION</h2>
                  <p className="text-sm sm:text-base leading-relaxed text-neutral-700">{product.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold uppercase">Qty</span>
                  <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 border-2 border-black bg-white font-black cursor-pointer">-</button>
                  <span className="font-mono font-bold w-6 text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8 border-2 border-black bg-white font-black cursor-pointer">+</button>
                  {user && (
                    <button type="button" onClick={async () => {
                      const res = await axios.post(`/api/wishlist/${productId}`, {}, { withCredentials: true })
                      setSaved((res.data.products || []).some((p) => String(p._id || p) === String(productId)))
                    }} className="ml-auto border-2 border-black px-3 py-2 font-mono text-[10px] font-black uppercase cursor-pointer">
                      {saved ? 'SAVED' : 'WISHLIST'}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedVariantId || !selectedVariant || (availableSizes.length > 0 && !selectedSize) || (selectedVariant.stock || 0) === 0}
                  className="w-full bg-[#ccff00] hover:bg-lime-400 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-black px-5 py-3.5 font-mono text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  {addingToCart ? 'ADDING...' : !selectedSize && availableSizes.length > 0 ? 'SELECT SIZE FIRST' : selectedVariant && (selectedVariant.stock || 0) === 0 ? 'SOLD OUT' : '+ ADD DROP TO CART'}
                </button>
                {cartError && <p className="border-2 border-red-500 bg-red-100 px-3 py-2 font-mono text-xs font-bold uppercase text-red-700">{cartError}</p>}

                <div className="grid grid-cols-3 gap-3 text-xs font-mono uppercase pt-2">
                  <div className="bg-[#f4f4f0] border-2 border-black p-3"><span className="block text-neutral-500 text-[10px]">TOTAL ASSETS</span><strong>{displayImages.length}</strong></div>
                  <div className="bg-[#f4f4f0] border-2 border-black p-3"><span className="block text-neutral-500 text-[10px]">VARIANTS</span><strong>{variants.length}</strong></div>
                  <div className="bg-[#f4f4f0] border-2 border-black p-3"><span className="block text-neutral-500 text-[10px]">RELEASED</span><strong>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'LIVE'}</strong></div>
                </div>
              </div>
            </section>
            {related.length > 0 && (
              <section className="pt-4">
                <h2 className="text-2xl font-black uppercase font-serif mb-4">You may also like</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {related.map((item) => (
                    <Link key={item._id} to={`/product/${item._id}`} className="bg-white border-2 border-black">
                      <div className="h-40 bg-[#e3e3dc] border-b-2 border-black">
                        {item.images?.[0]?.url && <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="p-3">
                        <p className="font-black uppercase text-sm line-clamp-1">{item.title}</p>
                        <p className="font-mono text-xs font-bold">₹{(item.price?.amount || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ProductDetail