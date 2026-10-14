import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import axios from 'axios'

const accountApi = axios.create({ baseURL: '/api/auth', withCredentials: true })

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

const getFulfillmentLabel = (status) => {
  switch (status) {
    case 'processing':
      return 'Preparing your package'
    case 'shipped':
      return 'Your package has shipped'
    case 'delivered':
      return 'Delivered'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Fulfillment update unavailable'
  }
}

const OrderSuccess = () => {
  const location = useLocation()
  const orderId = new URLSearchParams(location.search).get('order_id')
  const [result, setResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!orderId) return undefined

    const controller = new AbortController()
    const requestKey = `${orderId}:${retryCount}`

    accountApi.get('/orders', { signal: controller.signal })
      .then(({ data }) => {
        const matchingOrder = (data.orders || []).find(
          (entry) => entry.razorpay?.orderId === orderId
        )
        if (!matchingOrder) {
          setResult({
            requestKey,
            error: 'We could not find a confirmed order with this reference.',
          })
          return
        }
        setResult({ requestKey, order: matchingOrder })
      })
      .catch((requestError) => {
        if (requestError.name !== 'CanceledError') {
          setResult({
            requestKey,
            error: requestError.response?.data?.message || 'Unable to load your order details.',
          })
        }
      })

    return () => controller.abort()
  }, [orderId, retryCount])

  const requestKey = `${orderId}:${retryCount}`
  const loading = Boolean(orderId) && result?.requestKey !== requestKey
  const order = result?.requestKey === requestKey ? result.order : null
  const error = result?.requestKey === requestKey ? result.error : ''
  const currencySymbol = getCurrencySymbol(order?.price?.currency)

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <div className="border-b-4 border-black bg-[#ccff00] px-6 py-4">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.35em] text-black">
              Order confirmation
            </p>
          </div>

          <div className="px-6 py-10 sm:px-10 lg:px-12">
            {!orderId ? (
              <div className="py-12 text-center">
                <h1 className="font-serif text-3xl font-black uppercase">Order reference missing</h1>
                <p className="mt-3 font-mono text-xs uppercase text-neutral-600">
                  Open this page from your payment confirmation to view your order details.
                </p>
              </div>
            ) : loading ? (
              <div className="py-12 text-center font-mono text-sm font-bold uppercase" role="status">
                Loading your order details...
              </div>
            ) : error ? (
              <div className="border-4 border-red-500 bg-red-50 p-6 text-center" role="alert">
                <h1 className="font-serif text-3xl font-black uppercase">Order not confirmed</h1>
                <p className="mt-3 font-mono text-xs uppercase text-red-700">{error}</p>
                {orderId && (
                  <p className="mt-3 break-all font-mono text-[10px] font-bold uppercase text-neutral-600">
                    Reference: {orderId}
                  </p>
                )}
                {orderId && (
                  <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="mt-5 border-2 border-black bg-[#ccff00] px-5 py-2.5 font-mono text-xs font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                  >
                    Try again
                  </button>
                )}
              </div>
            ) : order ? (
              <>
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
                    Your order and payment have been confirmed.
                  </p>
                </div>

                <div className="mt-10 grid gap-4 border-4 border-black bg-[#f4f4f0] p-5 sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                      Order ID
                    </p>
                    <p className="mt-2 break-all font-mono text-sm font-bold uppercase text-black">
                      {order.razorpay?.orderId || order._id}
                    </p>
                    {order.createdAt && (
                      <p className="mt-1 font-mono text-xs uppercase text-neutral-600">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                      Payment status
                    </p>
                    <p className="mt-2 font-mono text-sm font-bold uppercase text-[#0d8f5d]">
                      {order.status}
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold">
                      {currencySymbol}{(order.price?.amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <section className="mt-8 border-4 border-black bg-white p-5" aria-labelledby="order-items-heading">
                  <h2 id="order-items-heading" className="font-mono text-xs font-black uppercase tracking-widest">
                    Items in this order
                  </h2>
                  <div className="mt-4 divide-y-2 divide-dashed divide-neutral-300">
                    {(order.orderItems || []).map((item, index) => {
                      const image = item.images?.[0]?.uri || item.images?.[0]?.url
                      return (
                        <div key={`${item.productId || item.title}-${index}`} className="flex items-center gap-3 py-3">
                          {image ? (
                            <img src={image} alt={item.title || 'Ordered product'} className="h-16 w-16 shrink-0 border-2 border-black object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-black bg-neutral-100 font-mono text-[10px] font-bold">
                              NO IMAGE
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-black uppercase">{item.title || 'Product'}</p>
                            <p className="mt-1 font-mono text-xs uppercase text-neutral-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="shrink-0 font-mono text-sm font-bold">
                            {currencySymbol}{(item.price?.amount || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </section>

                <div className="mt-8 space-y-3 border-4 border-black bg-[#f4f4f0] p-5 text-sm text-neutral-700">
                  <div className="flex items-center justify-between gap-4 border-b-2 border-dashed border-black pb-3">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                      Fulfillment
                    </span>
                    <span className="text-right font-bold uppercase">
                      {getFulfillmentLabel(order.fulfillmentStatus)}
                    </span>
                  </div>

                  <p className="font-mono text-xs uppercase text-neutral-600">
                    We’ll update your order status as it moves through fulfillment. Check your order archive for the latest details.
                  </p>

                  <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-black pt-3">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
                      Support
                    </span>
                    <a className="font-bold uppercase underline" href="mailto:help@snitch.com">
                      help@snitch.com
                    </a>
                  </div>
                </div>
              </>
            ) : null}

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center border-2 border-black bg-[#ccff00] px-6 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                Continue shopping
              </Link>

              <Link
                to="/profile"
                className="inline-flex items-center justify-center border-2 border-black bg-black px-6 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#ccff00] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
