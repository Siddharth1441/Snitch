import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useProduct } from '../../hooks/useProduct.js'

const CreateProduct = () => {
  const navigate = useNavigate()
  const { handleCreateProduct, loading, error, success } = useProduct()

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceAmount, setPriceAmount] = useState('')
  const [priceCurrency, setPriceCurrency] = useState('INR')
  
  // Images: index 0 is Hero image, remaining indices 1-6 are secondary images
  const [heroImage, setHeroImage] = useState(null) // File object
  const [heroPreview, setHeroPreview] = useState(null)
  
  const [secondaryImages, setSecondaryImages] = useState([]) // Array of File objects
  const [secondaryPreviews, setSecondaryPreviews] = useState([])

  // Category tags
  const [tags, setTags] = useState(['STREETWEAR', 'LIMITED'])
  const [tagInput, setTagInput] = useState('')

  // Form field errors
  const [validationError, setValidationError] = useState('')

  // Handle Hero Image selection
  const handleHeroChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setHeroImage(file)
    setHeroPreview(URL.createObjectURL(file))
    if (validationError) setValidationError('')
  }

  const removeHeroImage = () => {
    setHeroImage(null)
    setHeroPreview(null)
  }

  // Handle Secondary Images selection
  const handleSecondaryChange = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const maxAllowed = 6 - secondaryImages.length
    const newFiles = files.slice(0, maxAllowed)

    setSecondaryImages((prev) => [...prev, ...newFiles])
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setSecondaryPreviews((prev) => [...prev, ...newPreviews])

    if (validationError) setValidationError('')
  }

  const removeSecondaryImage = (index) => {
    setSecondaryImages((prev) => prev.filter((_, i) => i !== index))
    setSecondaryPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle Tag addition & deletion
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault()
      const trimmed = tagInput.trim().toUpperCase()
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed])
        setTagInput('')
      }
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Calculate total drop assets
  const totalAssetsCount = (heroImage ? 1 : 0) + secondaryImages.length

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!heroImage && secondaryImages.length === 0) {
      setValidationError('PLEASE UPLOAD AT LEAST ONE DROP ASSET IMAGE')
      return
    }

    if (!title.trim()) {
      setValidationError('PRODUCT TITLE / DROP NAME IS REQUIRED')
      return
    }

    if (!description.trim()) {
      setValidationError('DESCRIPTION / DROP LORE IS REQUIRED')
      return
    }

    if (!priceAmount || isNaN(priceAmount) || Number(priceAmount) <= 0) {
      setValidationError('PLEASE ENTER A VALID PRICE AMOUNT GREATER THAN 0')
      return
    }

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('priceAmount', priceAmount)
    formData.append('priceCurrency', priceCurrency)

    // Append images (hero first, then secondary)
    if (heroImage) {
      formData.append('images', heroImage)
    }
    secondaryImages.forEach((img) => {
      formData.append('images', img)
    })

    try {
      await handleCreateProduct(formData)
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      console.error('Failed to create product:', err)
    }
  }

  return (
    <div className="min-h-screen bg-dot-matrix bg-[#f4f4f0] text-black font-sans selection:bg-[#ccff00] selection:text-black flex justify-center py-6 px-3 sm:px-6">
      <div className="w-full max-w-lg bg-[#f9f9f6] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-7 flex flex-col justify-between relative">

        {/* TOP HEADER */}
        <div className="flex justify-between items-center pb-4 border-b-4 border-black mb-6">
          <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tighter uppercase leading-none">
            NEW_DROP
          </h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-9 h-9 border-2 border-black bg-white hover:bg-[#ccff00] font-black text-xl flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>

        {/* ERROR / SUCCESS MESSAGES */}
        {(validationError || error) && (
          <div className="mb-6 p-4 bg-red-400 border-3 border-black text-black font-mono font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
            [ERROR]: {validationError || error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#ccff00] border-3 border-black text-black font-mono font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase flex items-center justify-between">
            <span>&#x2713; DROP PUBLISHED SUCCESSFULLY! REDIRECTING...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION: DROP ASSETS */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-serif font-black text-lg tracking-wide uppercase">
                DROP ASSETS [{totalAssetsCount}/7]
              </span>
            </div>

            {/* HERO IMAGE BOX */}
            <div className="relative border-3 border-black bg-[#e3e3dc] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 text-center min-h-[220px] flex flex-col items-center justify-center">
              {/* HERO BADGE */}
              <div className="absolute top-2 left-2 z-10 bg-[#ccff00] text-black font-black uppercase text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                HERO
              </div>

              {heroPreview ? (
                <div className="relative w-full h-48 group">
                  <img
                    src={heroPreview}
                    alt="Hero Preview"
                    className="w-full h-full object-contain border-2 border-black bg-white"
                  />
                  <button
                    type="button"
                    onClick={removeHeroImage}
                    className="absolute top-2 right-2 bg-black text-white hover:bg-red-600 font-bold text-xs px-2 py-1 border border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-colors cursor-pointer"
                  >
                    REMOVE
                  </button>
                </div>
              ) : (
                <label className="w-full h-48 border-2 border-dashed border-black bg-[#deded7] hover:bg-[#d4d4cc] flex flex-col items-center justify-center cursor-pointer transition-colors p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroChange}
                    className="hidden"
                  />
                  {/* Camera with Plus icon */}
                  <div className="relative mb-3">
                    <svg className="w-12 h-12 text-black stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 font-black text-base bg-[#ccff00] text-black border border-black px-1 leading-none">+</span>
                  </div>
                  <span className="font-serif font-black text-xs uppercase tracking-widest text-neutral-800">
                    UPLOAD HERO IMAGE
                  </span>
                </label>
              )}
            </div>

            {/* SECONDARY IMAGES GRID (3 BOXES) */}
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((slotIndex) => {
                const preview = secondaryPreviews[slotIndex]
                return (
                  <div
                    key={slotIndex}
                    className="relative border-3 border-black bg-[#e3e3dc] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] h-24 flex items-center justify-center overflow-hidden"
                  >
                    {preview ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={preview}
                          alt={`Secondary ${slotIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSecondaryImage(slotIndex)}
                          className="absolute top-1 right-1 bg-black text-white hover:bg-red-600 font-bold text-xs w-5 h-5 flex items-center justify-center border border-black cursor-pointer"
                        >
                          &#x2715;
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full border-2 border-dashed border-black bg-[#deded7] hover:bg-[#d4d4cc] flex items-center justify-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSecondaryChange}
                          className="hidden"
                          disabled={secondaryImages.length >= 6}
                        />
                        <span className="font-black text-2xl text-black">+</span>
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION: PRODUCT TITLE */}
          <div className="relative pt-2">
            <div className="inline-block bg-[#ccff00] text-black font-black uppercase text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-1">
              PRODUCT TITLE
            </div>
            <div className="border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (validationError) setValidationError('')
                }}
                placeholder="ENTER DROP NAME"
                className="w-full px-4 py-3 font-serif font-black text-xl sm:text-2xl tracking-tight text-black placeholder-neutral-400 uppercase outline-none bg-transparent"
              />
            </div>
          </div>

          {/* SECTION: DESCRIPTION / DROP LORE */}
          <div className="relative pt-2">
            <div className="inline-block bg-[#ccff00] text-black font-black uppercase text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-1">
              DESCRIPTION / DROP LORE
            </div>
            <div className="border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (validationError) setValidationError('')
                }}
                rows={4}
                placeholder="TELL THE STORY BEHIND THIS PIECE..."
                className="w-full px-4 py-3 font-mono font-bold text-sm tracking-tight text-black placeholder-neutral-400 uppercase outline-none resize-none bg-transparent"
              />
            </div>
          </div>

          {/* SECTION: VALUE & CURRENCY */}
          <div className="relative pt-2">
            <div className="border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 relative">
              <div className="absolute -top-3 left-3 bg-[#ccff00] text-black font-black uppercase text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                VALUE
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
                {/* Price Input */}
                <div className="flex-1 border-2 border-black px-3 py-2 bg-white">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceAmount}
                    onChange={(e) => {
                      setPriceAmount(e.target.value)
                      if (validationError) setValidationError('')
                    }}
                    placeholder="0.00"
                    className="w-full font-serif font-black text-3xl sm:text-4xl text-black outline-none bg-transparent placeholder-neutral-300"
                  />
                </div>

                {/* Currency Radios */}
                <div className="flex flex-wrap sm:flex-col justify-start gap-2 border-t-2 sm:border-t-0 sm:border-l-2 border-black pt-2 sm:pt-0 sm:pl-4">
                  {[
                    { code: 'USD', symbol: '$', label: 'USD $' },
                    { code: 'EUR', symbol: '€', label: 'EUR €' },
                    { code: 'INR', symbol: '₹', label: 'INR ₹' },
                    { code: 'GBP', symbol: '£', label: 'GBP £' },
                  ].map((curr) => (
                    <label
                      key={curr.code}
                      className="flex items-center gap-2 cursor-pointer select-none font-serif font-bold text-xs uppercase"
                    >
                      <input
                        type="radio"
                        name="currency"
                        value={curr.code}
                        checked={priceCurrency === curr.code}
                        onChange={(e) => setPriceCurrency(e.target.value)}
                        className="accent-black w-4 h-4 cursor-pointer"
                      />
                      <span>{curr.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: CATEGORY TAGS */}
          <div className="space-y-3 pt-2">
            <div className="border-b-2 border-black pb-1">
              <h3 className="font-serif font-black text-lg tracking-wide uppercase">
                CATEGORY TAGS
              </h3>
            </div>

            {/* Tag Pills Display */}
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag, idx) => {
                const isLime = idx % 2 === 0
                return (
                  <div
                    key={tag}
                    className={`border-2 border-black font-black uppercase text-xs px-3 py-1.5 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      isLime ? 'bg-[#ccff00] text-black' : 'bg-black text-white'
                    }`}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    >
                      &#x2715;
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Tag Add Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="ADD TAG (e.g. OUTERWEAR)..."
                className="flex-1 border-2 border-black px-3 py-1.5 font-mono text-xs font-bold uppercase outline-none bg-white placeholder-neutral-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-black text-white hover:bg-[#ccff00] hover:text-black font-black text-xs uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer"
              >
                + ADD
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON: PUBLISH DROP -> */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ccff00] hover:bg-[#b8e600] active:translate-x-1 active:translate-y-1 active:shadow-none font-serif font-black text-2xl sm:text-3xl uppercase border-4 border-black py-5 px-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>{loading ? 'PUBLISHING...' : 'PUBLISH DROP'}</span>
              <span className="text-3xl font-sans group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateProduct
