import React from 'react'
import { Link, useLocation } from 'react-router'

const OrderSuccess = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const orderId = queryParams.get('order_id') || 'SNITCH-2026-0001'

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <div className="border-b-4 border-black bg-[#ccff00] px-6 py-4">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.35em] text-black">
              Order confirmed
            </p>
          </div>

          <div className="px-6 py-10 sm:px-10 lg:px-12">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-[#ccff00] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <svg
                  className="h-10 w-10 text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12.5L9.5 17L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 className="font-serif text-4xl font-black uppercase tracking-tight sm:text-5xl">
                Thank you for your order
              </h1>
              <p className="mt-4 max-w-xl font-mono text-xs uppercase tracking-[0.2em] text-neutral-600 sm:text-sm">
                Your payment has been successfully processed.
              </p>
            </div>

            <div className="mt-10 grid gap-4 border-4 border-black bg-[#f4f4f0] p-5 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Order ID
                </p>
                <p className="mt-2 break-all font-mono text-sm font-bold uppercase text-black">
                  {orderId}
                </p>
              </div>

              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Status
                </p>
                <p className="mt-2 font-mono text-sm font-bold uppercase text-[#0d8f5d]">
                  Paid
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3 rounded-none border-4 border-black bg-white p-5 text-sm text-neutral-700">
              <div className="flex items-center justify-between gap-4 border-b-2 border-dashed border-black pb-3">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Dispatch
                </span>
                <span className="font-bold uppercase">Preparing your package</span>
              </div>

              <div className="flex items-center justify-between gap-4 border-b-2 border-dashed border-black pb-3">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Delivery
                </span>
                <span className="font-bold uppercase">Within 3-5 business days</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                  Support
                </span>
                <span className="font-bold uppercase">help@snitch.com</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center border-2 border-black bg-[#ccff00] px-6 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                Continue shopping
              </Link>

              <Link
                to="/cart"
                className="inline-flex items-center justify-center border-2 border-black bg-white px-6 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                View cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess