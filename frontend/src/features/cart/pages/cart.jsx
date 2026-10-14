import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useCart } from '../hook/useCart.js'
import { useRazorpay } from "react-razorpay";

const getAttributeEntries = (attributes) => {
  if (!attributes) return []
  let parsedAttributes = attributes
  if (typeof attributes === 'string') {
    try {
      parsedAttributes = JSON.parse(attributes)
    } catch {
      return [['Option', attributes]]
    }
  }
  if (typeof parsedAttributes !== 'object' || Array.isArray(parsedAttributes)) return []
  return Object.entries(parsedAttributes).filter(([key, value]) => key && value)
}

const getProductVariants = (product) => {
  if (Array.isArray(product?.varients)) return product.varients
  if (product?.varients && typeof product.varients === 'object') return [product.varients]
  return Array.isArray(product?.variants) ? product.variants : []
}

const Cart = () => {
  const navigate = useNavigate()
  const items = useSelector((state) => state.cart.items)
  const { handleGetCart, handleUpdateCartItem, handleRemoveCartItem, handleCreateCartOrder,handleVerifyCartOrder, getCheckoutConfig } = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paying, setPaying] = useState(false)
  const { Razorpay } = useRazorpay();
  const user = useSelector(state => state.auth.user)
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0]
  const [shipping, setShipping] = useState({
    fullname: defaultAddress?.fullname || user?.fullname || '',
    phone: defaultAddress?.phone || user?.contact || '',
    line1: defaultAddress?.line1 || '',
    line2: defaultAddress?.line2 || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    pincode: defaultAddress?.pincode || '',
    country: 'India',
  })
  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    try {
      setPaying(true)
      setError(null)
      const config = await getCheckoutConfig()
      const order = await handleCreateCartOrder(shipping)
      const options = {
      key: config.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Snitch",
      description: "Streetwear Archive — Secure Checkout",
      order_id: order.id,
      handler: async (response) => {
        const isVaild = await handleVerifyCartOrder(response)

        if (isVaild) {
          navigate(`/order-success?order_id=${response?.razorpay_order_id}`)
        }

      },
      prefill: {
        name: shipping.fullname || user?.fullname,
        email: user?.email,
        contact: shipping.phone || user?.contact,
      },
      theme: {
        color: "#ccff00",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to start checkout.')
    } finally {
      setPaying(false)
    }
  };

  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      handleGetCart()
        .catch((requestError) => setError(requestError?.response?.data?.message || 'Please log in to view your cart.'))
        .finally(() => setLoading(false))
    }, 0)
    return () => clearTimeout(fetchTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateQuantity = async (itemId, quantity) => {
    try {
      setError(null)
      await handleUpdateCartItem(itemId, quantity)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update cart.')
    }
  }

  const removeItem = async (itemId) => {
    try {
      setError(null)
      await handleRemoveCartItem(itemId)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to remove item.')
    }
  }




  const total = items.reduce((sum, item) => sum + (item.price?.amount || 0) * item.quantity, 0)
  const currency = items[0]?.price?.currency || 'INR'
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'

  return (
    <div className="min-h-screen bg-dot-matrix bg-[#f4f4f0] text-black font-sans">
      <header className="w-full px-4 sm:px-10 py-4 flex justify-between items-center gap-4 border-b-4 border-black bg-white shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <Link to="/" className="relative group inline-block"><div className="absolute inset-0 bg-[#ccff00] translate-x-1 translate-y-1 border-2 border-black" /><div className="relative bg-white border-2 border-black px-4 py-1.5"><span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase font-display block leading-none">SNITCH</span></div></Link>
        <div className="flex items-center gap-3">
          {user && (
            <Link to="/profile" className="hidden sm:block bg-white border-2 border-black px-3 py-2 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-all">ACCOUNT</Link>
          )}
          {!user && (
            <Link to="/login" state={{ from: '/cart' }} className="hidden sm:block bg-black text-[#ccff00] border-2 border-black px-3 py-2 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">LOGIN</Link>
          )}
          <Link to="/" className="bg-black text-[#ccff00] border-2 border-black px-4 py-2 text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">CONTINUE SHOPPING</Link>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6"><span className="bg-black text-[#ccff00] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest">SHOPPING ARCHIVE</span><h1 className="mt-4 text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight leading-none">YOUR CART</h1></div>
        {error && <div className="mb-5 border-3 border-red-500 bg-red-100 px-4 py-3 font-mono text-xs font-bold uppercase text-red-700">{error}</div>}
        {loading ? <div className="bg-white border-4 border-black p-10 text-center font-mono font-bold uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">LOADING CART...</div> : items.length === 0 ? <div className="bg-white border-4 border-black p-10 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"><h2 className="text-2xl font-black uppercase font-serif">YOUR CART IS EMPTY</h2><p className="mt-2 font-mono text-xs uppercase text-neutral-500">Select a variant from a product page to add it here.</p><Link to="/" className="inline-block mt-6 bg-[#ccff00] border-2 border-black px-5 py-3 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">BROWSE DROPS</Link></div> : <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start"><section className="space-y-4">{items.map((item) => { const product = item.product || {}; const variantId = item.variant?._id || item.variant; const variant = getProductVariants(product).find((entry) => String(entry._id) === String(variantId)); const variantAttributes = getAttributeEntries(variant?.attributes); const variantImage = variant?.images?.[0]?.uri || variant?.images?.[0]?.url; const image = variantImage || product.images?.[0]?.url; return <article key={item._id} className="bg-white border-3 border-black p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><div className="w-full sm:w-28 h-48 sm:h-28 shrink-0 border-2 border-black bg-[#e3e3dc] overflow-hidden">{image && <img src={image} alt={`${product.title} ${variant ? 'selected variant' : ''}`} className="w-full h-full object-cover" />}</div><div className="min-w-0 flex-1"><h2 className="font-black font-serif uppercase text-xl truncate">{product.title || 'Product'}</h2><div className="flex flex-wrap gap-1.5 mt-2">{variantAttributes.length > 0 ? variantAttributes.map(([key, value]) => <span key={key} className="border-2 border-black bg-[#f4f4f0] px-2 py-1 font-mono text-[10px] font-bold uppercase">{key}: {value}</span>) : <span className="border-2 border-black bg-[#f4f4f0] px-2 py-1 font-mono text-[10px] font-bold uppercase">STANDARD ITEM</span>}</div><p className="font-mono text-xs text-neutral-500 uppercase mt-2">{variant ? 'SELECTED VARIANT' : 'STANDARD ITEM'}</p><p className="font-mono font-bold mt-2">{symbol}{(item.price?.amount || 0).toLocaleString('en-IN')}</p></div><div className="flex items-center gap-2 self-start sm:self-center"><button type="button" onClick={() => item.quantity > 1 && updateQuantity(item._id, item.quantity - 1)} className="w-8 h-8 border-2 border-black bg-white font-black cursor-pointer">-</button><span className="w-8 text-center font-mono font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-8 h-8 border-2 border-black bg-white font-black cursor-pointer">+</button></div><button type="button" onClick={() => removeItem(item._id)} className="self-start sm:self-center border-2 border-black bg-red-400 px-2 py-2 font-mono text-[10px] font-bold uppercase cursor-pointer">REMOVE</button></article>})}</section><aside className="bg-black text-white border-4 border-black p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] space-y-4"><h2 className="text-2xl font-black font-serif uppercase text-[#ccff00]">CHECKOUT</h2>
            {['fullname','phone','line1','city','state','pincode'].map((field) => (
              <input key={field} value={shipping[field]} onChange={(e) => setShipping((prev) => ({ ...prev, [field]: e.target.value }))} placeholder={field.toUpperCase()} className="w-full bg-neutral-900 border border-neutral-600 px-3 py-2 font-mono text-xs text-white placeholder:text-neutral-500" />
            ))}
            <div className="mt-2 flex justify-between border-t border-neutral-600 pt-4 font-mono text-sm uppercase"><span>Items</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
            <div className="flex justify-between font-mono text-xs uppercase text-neutral-400"><span>Shipping</span><span>{total >= 1999 ? 'FREE' : `${symbol}99`}</span></div>
            <div className="flex justify-between border-t-2 border-[#ccff00] pt-4"><span className="font-mono text-xs uppercase">Total</span><strong className="text-2xl font-mono text-[#ccff00]">{symbol}{(total + (total >= 1999 ? 0 : 99)).toLocaleString('en-IN')}</strong></div>
            <button type="button" disabled={paying} className="w-full mt-2 bg-[#ccff00] text-black border-2 border-[#ccff00] py-3 font-mono text-xs font-black uppercase cursor-pointer disabled:opacity-50" onClick={handleCheckout}>{paying ? 'OPENING PAY...' : 'PAY WITH RAZORPAY'}</button></aside></div>}
      </main>
    </div>
  )
}

export default Cart
