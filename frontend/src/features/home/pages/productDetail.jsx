import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useProduct } from '../../hooks/useProduct.js'

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

const getStockBadge = (stock) => {
  if (stock === 0) return { label: 'OUT OF STOCK', cls: 'bg-red-100 border-red-500 text-red-600' }
  if (stock <= 5) return { label: `LOW STOCK (${stock} LEFT)`, cls: 'bg-amber-100 border-amber-500 text-amber-700' }
  return { label: `IN STOCK (${stock})`, cls: 'bg-emerald-100 border-emerald-600 text-emerald-700' }
}

const ProductDetail = () => {
  const { productId } = useParams()
  const { handleGetProductById } = useProduct()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const productData = await handleGetProductById(productId)
        if (isMounted) {
          setProduct(productData)
          const vars = productData?.varients || productData?.variants || []
          if (vars.length > 0) {
            setSelectedVariantId(vars[0]._id)
          }
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
  const variants = product?.varients || product?.variants || []
  const selectedVariant = variants.find((v) => v._id === selectedVariantId)

  // Main product drop images (e.g. Navy Blue Polo) come FIRST in gallery
  const productImages = (product?.images || [])
    .map((img) => img.url)
    .filter(Boolean)

  // Selected variant images
  const selectedVariantImages = (selectedVariant?.images || [])
    .map((img) => img.uri || img.url)
    .filter(Boolean)

  // All variant images across all variants
  const allVariantImages = variants.flatMap((v) =>
    (v.images || []).map((img) => img.uri || img.url).filter(Boolean)
  )

  // Combine product images + variant images, eliminating duplicates
  const displayImages = Array.from(
    new Set([...productImages, ...selectedVariantImages, ...allVariantImages])
  )

  const activeImage = displayImages[activeImageIndex] || displayImages[0]

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId)
    const targetVar = variants.find((v) => v._id === variantId)
    const targetVarImgs = (targetVar?.images || []).map((img) => img.uri || img.url).filter(Boolean)
    if (targetVarImgs.length > 0) {
      const idx = displayImages.indexOf(targetVarImgs[0])
      if (idx !== -1) {
        setActiveImageIndex(idx)
      }
    }
  }

  return (
    <div className="min-h-screen bg-dot-matrix bg-[#f4f4f0] text-black font-sans selection:bg-[#ccff00] selection:text-black">
      <header className="relative z-20 w-full px-4 sm:px-10 py-4 flex flex-wrap justify-between items-center gap-4 border-b-4 border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <Link to="/" className="relative group inline-block">
          <div className="absolute inset-0 bg-[#ccff00] translate-x-1 translate-y-1 border-2 border-black transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
          <div className="relative bg-white border-2 border-black px-4 py-1.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase font-display block leading-none">SNITCH</span>
          </div>
        </Link>
        <Link to="/" className="bg-black text-[#ccff00] hover:bg-neutral-900 border-2 border-black px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          BACK TO CATALOG
        </Link>
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
                    <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
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
                        IN STOCK (DEFAULT ITEM)
                      </span>
                    )}
                  </div>

                  {variants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {variants.map((v) => {
                        const isSelected = v._id === selectedVariantId
                        const entries = getAttributeEntries(v.attributes)
                        const stockInfo = getStockBadge(v.stock || 0)
                        const isOutOfStock = (v.stock || 0) === 0
                        const hasVarImgs = (v.images || []).length > 0

                        return (
                          <button
                            key={v._id}
                            type="button"
                            onClick={() => handleSelectVariant(v._id)}
                            className={`p-3 border-2 text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#ccff00] bg-[#000] text-[#ccff00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                : 'border-black bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            } ${isOutOfStock ? 'opacity-60' : ''}`}
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
                                      {k}: {val}
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 font-mono text-[11px] font-bold uppercase border border-[#ccff00] bg-neutral-900 text-[#ccff00]">
                          OPTION: STANDARD BASE ITEM
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase text-neutral-300">
                        DEFAULT ITEM SELECTED
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <h2 className="font-mono text-xs font-bold uppercase text-neutral-500">DESCRIPTION</h2>
                  <p className="text-sm sm:text-base leading-relaxed text-neutral-700">{product.description}</p>
                </div>

                <button
                  type="button"
                  disabled={selectedVariant && (selectedVariant.stock || 0) === 0}
                  className="w-full bg-[#ccff00] hover:bg-lime-400 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-black px-5 py-3.5 font-mono text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  {selectedVariant && (selectedVariant.stock || 0) === 0 ? 'SOLD OUT' : '+ ADD DROP TO CART'}
                </button>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono uppercase pt-2">
                  <div className="bg-[#f4f4f0] border-2 border-black p-3"><span className="block text-neutral-500 text-[10px]">TOTAL ASSETS</span><strong>{displayImages.length}</strong></div>
                  <div className="bg-[#f4f4f0] border-2 border-black p-3"><span className="block text-neutral-500 text-[10px]">VARIANTS</span><strong>{variants.length}</strong></div>
                  <div className="bg-[#f4f4f0] border-2 border-black p-3"><span className="block text-neutral-500 text-[10px]">RELEASED</span><strong>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'LIVE'}</strong></div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProductDetail