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

const ProductDetail = () => {
  const { productId } = useParams()
  const { handleGetProductById } = useProduct()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const productData = await handleGetProductById(productId)
        if (isMounted) setProduct(productData)
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
  }, [productId])

  const images = product?.images || []
  const activeImage = images[activeImageIndex]?.url || images[0]?.url
  const currencySymbol = getCurrencySymbol(product?.price?.currency)
  const formattedPrice = (product?.price?.amount || 0).toLocaleString('en-IN')

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
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {images.map((image, index) => (
                      <button key={image.url} type="button" onClick={() => setActiveImageIndex(index)} className={`aspect-square border-2 border-black overflow-hidden cursor-pointer ${index === activeImageIndex ? 'ring-4 ring-[#ccff00]' : 'opacity-70 hover:opacity-100'}`}>
                        <img src={image.url} alt={`${product.title} view ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <span className="inline-block bg-black text-[#ccff00] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest">PRODUCT FILE</span>
                <h1 className="mt-5 text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight leading-none">{product.title}</h1>
                <div className="mt-6 border-y-2 border-dashed border-neutral-300 py-5">
                  <span className="block text-xs font-mono font-bold text-neutral-500 uppercase">PRICE</span>
                  <span className="text-4xl font-black font-mono">{currencySymbol}{formattedPrice}</span>
                </div>
                <div className="mt-6 space-y-2">
                  <h2 className="font-mono text-xs font-bold uppercase text-neutral-500">DESCRIPTION</h2>
                  <p className="text-sm sm:text-base leading-relaxed text-neutral-700">{product.description}</p>
                </div>
                <button type="button" className="w-full mt-8 bg-[#ccff00] hover:bg-lime-400 border-2 border-black px-5 py-3 font-mono text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
                  + ADD DROP TO CART
                </button>
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-mono uppercase">
                  <div className="bg-[#f4f4f0] border-2 border-black p-3"><span className="block text-neutral-500">ASSETS</span><strong>{images.length}</strong></div>
                  <div className="bg-[#f4f4f0] border-2 border-black p-3"><span className="block text-neutral-500">RELEASED</span><strong>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'LIVE NOW'}</strong></div>
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