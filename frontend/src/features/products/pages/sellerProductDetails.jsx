import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useProduct } from '../../hooks/useProduct.js'

// ─── helpers ──────────────────────────────────────────────────────────────────

const getCurrencySymbol = (currency) => {
  const map = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  return map[currency] || '₹'
}

const getStockMeta = (n) => {
  if (n === 0) return { label: 'OUT OF STOCK', cls: 'bg-red-100 border-red-500 text-red-600' }
  if (n <= 5)  return { label: 'CRITICAL',     cls: 'bg-orange-100 border-orange-500 text-orange-600' }
  if (n <= 20) return { label: 'LOW STOCK',    cls: 'bg-yellow-100 border-yellow-500 text-yellow-700' }
  return               { label: 'IN STOCK',    cls: 'bg-green-100 border-green-600 text-green-700' }
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

// ─── sub-components ───────────────────────────────────────────────────────────

function ToastBanner({ type, message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [message, onDismiss])

  const isError = type === 'error'
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-4 px-5 py-3 border-3 border-black font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
        isError
          ? 'bg-red-100 border-l-[6px] border-l-red-500'
          : 'bg-[#f6ffe0] border-l-[6px] border-l-[#ccff00]'
      }`}
    >
      <span className="flex items-center gap-2">
        <span>{isError ? '⚠' : '✓'}</span>
        <span>{message}</span>
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="font-black text-base leading-none px-1 cursor-pointer hover:text-neutral-500 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

function VariantBadge({ name, value }) {
  return (
    <span className="inline-flex items-center gap-1 bg-[#f0f0ea] border border-black px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider">
      <span className="text-neutral-500">{name}</span>
      <span>:</span>
      <span className="text-black">{value}</span>
    </span>
  )
}

function StockPill({ stock }) {
  const { label, cls } = getStockMeta(stock)
  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest ${cls}`}>
      {label}
    </span>
  )
}

function FieldInput({ id, label, type = 'text', value, onChange, placeholder, min, step }) {
  return (
    <div>
      <label htmlFor={id} className="block mb-1 text-xs font-mono font-bold uppercase tracking-widest text-neutral-600">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full border-2 border-black bg-[#f9f9f6] px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:bg-white transition-all"
      />
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

const SellerProductDetails = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { handleGetProductById, handleCreateProductVariant, handleUpdateVariantStock, handleDeleteProductVariant, handleDeleteProduct } = useProduct()

  const [product, setProduct]          = useState(null)
  const [loading, setLoading]          = useState(true)
  const [saving, setSaving]            = useState(false)
  const [toast, setToast]              = useState(null)   // { type, message }

  // Create-variant form states
  const [size, setSize]                = useState('')
  const [color, setColor]              = useState('')
  const [material, setMaterial]        = useState('')
  const [customKey, setCustomKey]      = useState('')
  const [customValue, setCustomValue]  = useState('')
  const [newStock, setNewStock]        = useState('0')

  // Up to 7 variant images
  const [variantImages, setVariantImages]     = useState([]) // File objects
  const [variantPreviews, setVariantPreviews] = useState([]) // Data URLs

  // Per-variant stock editing drafts
  const [stockDrafts, setStockDrafts]   = useState({})

  // Active gallery image index
  const [activeImg, setActiveImg]      = useState(0)

  const variants   = product?.varients || product?.variants || []
  const totalStock = variants.reduce((s, v) => s + (v.stock || 0), 0)

  const showToast   = useCallback((type, message) => setToast({ type, message }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true)
      const p = await handleGetProductById(productId)
      setProduct(p)
      setActiveImg(0)
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Unable to load this product.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProduct()
  }, [loadProduct])

  // Handle image upload for variant (max 7)
  const handleVariantImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const maxAllowed = 7 - variantImages.length
    if (maxAllowed <= 0) {
      showToast('error', 'Maximum 7 variant images allowed per option.')
      return
    }

    const newFiles = files.slice(0, maxAllowed)
    setVariantImages((prev) => [...prev, ...newFiles])

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
    setVariantPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeVariantImage = (index) => {
    setVariantImages((prev) => prev.filter((_, i) => i !== index))
    setVariantPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const createVariant = async (event) => {
    event.preventDefault()
    const attributes = {}
    if (size.trim())        attributes.size     = size.trim()
    if (color.trim())       attributes.color    = color.trim()
    if (material.trim())    attributes.material = material.trim()
    if (customKey.trim() && customValue.trim()) {
      attributes[customKey.trim()] = customValue.trim()
    }

    if (!Object.keys(attributes).length) {
      showToast('error', 'Please fill in at least one attribute (Size, Color, Material, or Custom Key-Value).')
      return
    }

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('attributes', JSON.stringify(attributes))
      formData.append('stock', Number(newStock) || 0)
      variantImages.forEach((imgFile) => {
        formData.append('images', imgFile)
      })

      const res = await handleCreateProductVariant(productId, formData)
      if (res?.product) {
        setProduct(res.product)
      } else {
        await loadProduct()
      }

      // Reset form
      setSize('')
      setColor('')
      setMaterial('')
      setCustomKey('')
      setCustomValue('')
      setNewStock('0')
      setVariantImages([])
      setVariantPreviews([])
      showToast('success', 'Variant created successfully with uploaded images!')
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Unable to create variant.')
    } finally {
      setSaving(false)
    }
  }

  const updateStock = async (variantId) => {
    const currentVariant = variants.find((v) => v._id === variantId)
    const stock = Number(stockDrafts[variantId] ?? currentVariant?.stock ?? 0)
    if (!Number.isInteger(stock) || stock < 0) {
      showToast('error', 'Stock must be a non-negative whole number.')
      return
    }
    try {
      setSaving(true)
      const res = await handleUpdateVariantStock(productId, variantId, stock)
      if (res?.product) {
        setProduct(res.product)
      } else {
        await loadProduct()
      }
      setStockDrafts((d) => {
        const next = { ...d }
        delete next[variantId]
        return next
      })
      showToast('success', `Stock updated to ${stock} units.`)
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Unable to update stock.')
    } finally {
      setSaving(false)
    }
  }

  const deleteVariant = async (variantId) => {
    if (!window.confirm('Are you sure you want to remove this variant option?')) return
    try {
      setSaving(true)
      const res = await handleDeleteProductVariant(productId, variantId)
      if (res?.product) {
        setProduct(res.product)
      } else {
        await loadProduct()
      }
      showToast('success', 'Variant removed.')
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Unable to delete variant.')
    } finally {
      setSaving(false)
    }
  }

  const quickAddDefaultVariant = async () => {
    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('attributes', JSON.stringify({ option: 'Standard Item' }))
      formData.append('stock', 10)

      const res = await handleCreateProductVariant(productId, formData)
      if (res?.product) {
        setProduct(res.product)
      } else {
        await loadProduct()
      }
      showToast('success', 'Default Standard variant created with 10 units stock!')
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Unable to create default variant.')
    } finally {
      setSaving(false)
    }
  }

  // ── loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center">
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-12 h-12 border-4 border-black border-t-[#ccff00] rounded-full animate-spin mx-auto mb-6" />
          <p className="font-mono font-bold text-xs uppercase tracking-[3px]">
            Loading product control panel...
          </p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center p-4">
        <div className="bg-white border-4 border-red-500 p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-2xl font-black uppercase font-serif mb-2">Product Not Found</h2>
          <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-6">
            This product doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Link
            to="/seller/dashboard"
            className="inline-block bg-[#ccff00] border-2 border-black px-6 py-2.5 font-mono font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const images  = product.images || []
  const price   = product.price || {}
  const currSym = getCurrencySymbol(price.currency)

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-[#ccff00] selection:text-black flex flex-col">

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 w-full px-4 sm:px-10 py-4 flex flex-wrap justify-between items-center gap-4 border-b-4 border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link to="/" className="relative group inline-block">
            <div className="absolute inset-0 bg-[#ccff00] translate-x-1 translate-y-1 border-2 border-black transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
            <div className="relative bg-white border-2 border-black px-4 py-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase font-display block leading-none">
                SNITCH
              </span>
            </div>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-mono font-bold uppercase text-neutral-400">//</span>
            <span className="bg-black text-[#ccff00] font-mono font-bold text-[10px] uppercase tracking-widest px-3 py-1 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              SELLER_PRODUCT_EDITOR
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/seller/dashboard"
            className="bg-white border-2 border-black px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 transition-colors active:translate-x-0.5 active:translate-y-0.5"
          >
            ← DASHBOARD
          </Link>
          <button
            type="button"
            onClick={() => navigate(`/product/${productId}`)}
            className="bg-black text-[#ccff00] border-2 border-black px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-900 transition-colors cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            🌐 PUBLIC VIEW
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm(`Permanently delete "${product?.title}"? This action cannot be undone.`)) return
              try {
                await handleDeleteProduct(productId)
                navigate('/seller/dashboard')
              } catch {
                alert('Failed to delete product. Please try again.')
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white border-2 border-black px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            🗑 DELETE
          </button>
        </div>
      </header>

      {/* ── MAIN ──────────────────────────────────────────────────────────────── */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6 flex-grow">

        {/* TOAST */}
        {toast && (
          <ToastBanner type={toast.type} message={toast.message} onDismiss={dismissToast} />
        )}

        {/* ── PRODUCT HERO CARD ── */}
        <section className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <span className="inline-block bg-black text-[#ccff00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest mb-4">
            SELLER CONTROL PANEL // PRODUCT EDITOR
          </span>

          <div className="flex flex-wrap justify-between items-start gap-6">
            {/* Title + price */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-5xl font-black uppercase font-serif tracking-tight leading-none">
                {product.title}
              </h1>
              {product.description && (
                <p className="mt-3 text-sm text-neutral-600 max-w-2xl leading-relaxed">
                  {product.description}
                </p>
              )}
              <div className="mt-4 inline-flex items-baseline gap-1.5 bg-black text-[#ccff00] px-4 py-2.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(80,80,80,1)]">
                <span className="text-2xl font-black font-mono tracking-tight">
                  {currSym}{(price.amount || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest opacity-70">
                  {price.currency || 'INR'}
                </span>
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex flex-row sm:flex-col gap-3 flex-wrap">
              {[
                { label: 'VARIANTS',     value: variants.length,    icon: '🎨' },
                { label: 'TOTAL STOCK',  value: `${totalStock} U`,  icon: '📦' },
                { label: 'IMAGES',       value: images.length,      icon: '🖼️' },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="bg-[#ccff00] border-2 border-black px-4 py-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 min-w-[130px]"
                >
                  <span className="text-xl">{icon}</span>
                  <div>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[2px] text-neutral-600">{label}</div>
                    <div className="font-black text-lg tracking-tight leading-none">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MAIN PRODUCT IMAGES ── */}
        {images.length > 0 && (
          <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="inline-block bg-black text-[#ccff00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest mb-4">
              PRODUCT IMAGES // {images.length} {images.length === 1 ? 'ASSET' : 'ASSETS'}
            </span>

            {/* Hero image */}
            <div className="w-full h-72 sm:h-96 bg-[#e3e3dc] border-3 border-black overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-3">
              <img
                src={images[activeImg]?.url}
                alt={`${product.title} — view ${activeImg + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => { e.target.src = 'https://placehold.co/800x500/000000/ccff00?text=NO+IMAGE' }}
              />
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={`w-16 h-16 flex-shrink-0 overflow-hidden cursor-pointer transition-all border-2 ${
                      activeImg === idx
                        ? 'border-[#ccff00] outline outline-2 outline-black scale-105'
                        : 'border-black opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── CREATE VARIANT + STOCK REGISTER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">

          {/* ── CREATE VARIANT FORM ── */}
          <form
            onSubmit={createVariant}
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4"
          >
            <div>
              <span className="inline-block bg-black text-[#ccff00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest mb-3">
                + CREATE VARIANT
              </span>
              <h2 className="text-2xl font-black uppercase font-serif tracking-tight">New Variant Option</h2>
              <p className="mt-1 font-mono text-[11px] text-neutral-500 uppercase tracking-wider">
                Define option attributes, images, and stock level.
              </p>
            </div>

            <FieldInput
              id="var-size"
              label="Size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="E.G. S, M, L, XL, 32, 34"
            />
            <FieldInput
              id="var-color"
              label="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="E.G. BLACK, WHITE, NAVY"
            />
            <FieldInput
              id="var-material"
              label="Material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="E.G. COTTON, POLYESTER"
            />

            {/* Custom attribute optional row */}
            <div className="border-t-2 border-dashed border-neutral-300 pt-3 space-y-2">
              <span className="block text-[10px] font-mono font-bold uppercase text-neutral-500">
                + CUSTOM OPTION KEY & VALUE (OPTIONAL)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="KEY (FIT)"
                  className="w-full border-2 border-black bg-[#f9f9f6] px-2.5 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                />
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="VALUE (OVERSIZED)"
                  className="w-full border-2 border-black bg-[#f9f9f6] px-2.5 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                />
              </div>
            </div>

            {/* ── VARIANT IMAGE UPLOAD (UP TO 7 IMAGES) ── */}
            <div className="border-t-2 border-dashed border-neutral-300 pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="block text-[10px] font-mono font-bold uppercase text-neutral-600">
                  📸 VARIANT IMAGES (UP TO 7)
                </span>
                <span className="font-mono text-[10px] font-bold text-neutral-400">
                  {variantImages.length}/7
                </span>
              </div>

              {/* Upload trigger box */}
              {variantImages.length < 7 && (
                <label className="block border-2 border-dashed border-black bg-[#f9f9f6] hover:bg-[#ccff00]/10 p-3 text-center cursor-pointer transition-colors">
                  <span className="block font-mono text-xs font-bold uppercase text-black">
                    + UPLOAD VARIANT IMAGES
                  </span>
                  <span className="block font-mono text-[10px] text-neutral-500 uppercase mt-0.5">
                    SELECT UP TO {7 - variantImages.length} MORE IMAGE FILES
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleVariantImagesChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Preview thumbnails */}
              {variantPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {variantPreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square border-2 border-black overflow-hidden group">
                      <img src={src} alt={`Variant preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeVariantImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-black text-white w-5 h-5 flex items-center justify-center font-mono text-[10px] font-black cursor-pointer hover:bg-red-500"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FieldInput
              id="var-stock"
              label="Initial Stock (units)"
              type="number"
              min="0"
              step="1"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-black text-[#ccff00] border-2 border-black py-3 font-mono text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(80,80,80,1)] hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-0.5 active:translate-y-0.5"
            >
              {saving ? '⏳ SAVING...' : '+ CREATE VARIANT'}
            </button>
          </form>

          {/* ── STOCK REGISTER ── */}
          <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="inline-block bg-black text-[#ccff00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest mb-4">
              STOCK REGISTER
            </span>

            <div className="flex flex-wrap justify-between items-end gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-black uppercase font-serif tracking-tight">Inventory</h2>
                <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-wider mt-0.5">
                  Adjust live stock per variant option
                </p>
              </div>
              <div className="bg-black text-[#ccff00] px-4 py-2 font-mono font-bold text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(80,80,80,1)] whitespace-nowrap">
                {totalStock} UNITS TOTAL
              </div>
            </div>

            {/* Empty state — show Default Item card */}
            {variants.length === 0 ? (
              <div className="border-2 border-black bg-[#f9f9f6] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="bg-[#ccff00] text-black border border-black px-2 py-0.5 font-mono text-[10px] font-black uppercase">
                    DEFAULT ITEM
                  </span>
                  <span className="font-mono text-xs font-bold uppercase text-neutral-600">
                    STANDARD BASE PRODUCT DROP
                  </span>
                </div>
                <p className="font-mono text-xs text-neutral-500 max-w-md mx-auto uppercase">
                  No custom variants created yet. Create a default variant or define custom attributes (Size, Color, Material) on the left.
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={quickAddDefaultVariant}
                  className="bg-black text-[#ccff00] hover:bg-neutral-900 border-2 border-black px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  {saving ? '⏳ CREATING...' : '+ CREATE DEFAULT ITEM VARIANT (10 UNITS)'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, idx) => {
                  const isDirty = stockDrafts[variant._id] !== undefined
                  const attributeEntries = getAttributeEntries(variant.attributes)
                  const varImgs = variant.images || []

                  return (
                    <div
                      key={variant._id}
                      className={`flex flex-wrap items-center justify-between gap-4 p-4 border-2 transition-all ${
                        isDirty
                          ? 'border-[#ccff00] bg-[#fffde0] shadow-[3px_3px_0px_0px_rgba(180,180,0,1)]'
                          : 'border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      {/* Variant info & images preview */}
                      <div className="flex items-start gap-3 min-w-[180px]">
                        {/* Variant images thumbnails if available */}
                        {varImgs.length > 0 && (
                          <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                            {varImgs.slice(0, 3).map((img, i) => (
                              <img
                                key={i}
                                src={img.uri || img.url}
                                alt={`Variant image ${i + 1}`}
                                className="w-10 h-10 object-cover border border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                              />
                            ))}
                            {varImgs.length > 3 && (
                              <div className="w-10 h-10 bg-black text-[#ccff00] border border-black flex items-center justify-center font-mono text-[9px] font-bold">
                                +{varImgs.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-neutral-400">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <StockPill stock={variant.stock || 0} />
                            {isDirty && (
                              <span className="bg-[#ccff00] border border-black font-mono text-[9px] font-black uppercase px-1.5 py-0.5 tracking-widest">
                                UNSAVED
                              </span>
                            )}
                          </div>

                          {/* Attribute badges */}
                          <div className="flex flex-wrap gap-1">
                            {attributeEntries.length > 0 ? (
                              attributeEntries.map(([k, v]) => (
                                <VariantBadge key={k} name={k} value={v} />
                              ))
                            ) : (
                              <span className="font-mono text-xs font-bold">Standard Variant</span>
                            )}
                          </div>

                          <span className="font-mono text-[11px] text-neutral-500 uppercase">
                            CURRENT:{' '}
                            <strong className="text-black">{variant.stock || 0} units</strong>
                            {varImgs.length > 0 && (
                              <span className="ml-2 text-[10px] text-neutral-400">({varImgs.length} images)</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Stock editor & actions */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={stockDrafts[variant._id] ?? (variant.stock ?? 0)}
                          onChange={(e) =>
                            setStockDrafts((d) => ({ ...d, [variant._id]: e.target.value }))
                          }
                          aria-label={`New stock for variant ${idx + 1}`}
                          className="w-24 border-2 border-black bg-[#f9f9f6] px-2 py-2 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                        />
                        <button
                          type="button"
                          disabled={saving || !isDirty}
                          onClick={() => updateStock(variant._id)}
                          className={`border-2 border-black px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 active:translate-x-0.5 active:translate-y-0.5 ${
                            isDirty
                              ? 'bg-[#ccff00] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-lime-300'
                              : 'bg-[#e8e8e0] text-neutral-500 shadow-[2px_2px_0px_0px_rgba(180,180,180,1)]'
                          }`}
                        >
                          {saving ? '...' : 'UPDATE'}
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => deleteVariant(variant._id)}
                          title="Remove variant"
                          className="bg-red-500 hover:bg-red-600 text-white border-2 border-black px-2.5 py-2 font-mono text-xs font-black uppercase transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── PRODUCT METADATA ── */}
        <section className="bg-black border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <span className="inline-block bg-[#ccff00] text-black px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest mb-5">
            PRODUCT METADATA
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
            {[
              { label: 'PRODUCT ID',   value: product._id },
              { label: 'SELLER ID',    value: product.seller },
              { label: 'CREATED',      value: product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN') : 'N/A' },
              { label: 'UPDATED',      value: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-IN') : 'N/A' },
              { label: 'PRICE',        value: `${currSym}${(price.amount || 0).toLocaleString('en-IN')} ${price.currency || 'INR'}` },
              { label: 'IMAGES',       value: `${images.length} asset${images.length !== 1 ? 's' : ''}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-neutral-500 text-[9px] uppercase tracking-[2px] mb-1">{label}</div>
                <div className="text-[#ccff00] font-bold break-all leading-tight">{String(value)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-black text-[#ccff00] font-mono text-[11px] font-bold py-2.5 px-6 sm:px-12 flex justify-between items-center tracking-widest border-t-2 border-black uppercase select-none mt-8">
        <span>SYS.OK // SELLER PRODUCT EDITOR</span>
        <span>SNITCH V1.0.5</span>
      </footer>
    </div>
  )
}

export default SellerProductDetails