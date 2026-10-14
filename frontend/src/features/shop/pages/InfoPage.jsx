import React, { useState } from 'react'
import { useLocation } from 'react-router'
import StoreChrome from '../../../app/layout/StoreChrome.jsx'

const PAGES = {
  '/about': {
    title: 'About Snitch',
    body: 'Snitch is an independent streetwear marketplace. Sellers drop limited collections. Buyers shop, pay securely with Razorpay, and track orders from their account.',
  },
  '/shipping': {
    title: 'Shipping',
    body: 'We ship nationwide. Orders over ₹1,999 ship free. Standard delivery is 3–5 business days after payment confirmation. You will receive dispatch updates by email.',
  },
  '/returns': {
    title: 'Returns',
    body: 'Unworn items can be returned within 7 days of delivery. Size exchanges are subject to stock. Refunds are issued to the original payment method after inspection.',
  },
  '/faq': {
    title: 'FAQ',
    body: 'Need a size? Pick it on the product page before adding to cart. Payments are processed by Razorpay. Sellers manage stock from the seller portal. Order history lives in My Archive.',
  },
  '/contact': {
    title: 'Contact',
    body: 'Email support@snitch.com for order help. For seller onboarding, upgrade your account from Profile and list a drop from the seller portal.',
  },
}

const InfoPage = () => {
  const { pathname } = useLocation()
  const page = PAGES[pathname] || PAGES['/about']
  const [sent, setSent] = useState(false)

  return (
    <StoreChrome>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
          <h1 className="text-4xl font-black uppercase font-serif">{page.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-700">{page.body}</p>
          {pathname === '/contact' && (
            <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
              <input required placeholder="YOUR NAME" className="w-full border-2 border-black px-3 py-2 font-mono text-xs uppercase" />
              <input required type="email" placeholder="EMAIL" className="w-full border-2 border-black px-3 py-2 font-mono text-xs uppercase" />
              <textarea required rows={4} placeholder="MESSAGE" className="w-full border-2 border-black px-3 py-2 font-mono text-xs uppercase" />
              <button className="bg-[#ccff00] border-2 border-black px-5 py-2 font-mono text-xs font-black uppercase">{sent ? 'SENT' : 'SEND MESSAGE'}</button>
            </form>
          )}
        </div>
      </main>
    </StoreChrome>
  )
}

export default InfoPage
