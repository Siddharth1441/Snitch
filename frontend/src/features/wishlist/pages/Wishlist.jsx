import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import axios from 'axios'
import { useSelector } from 'react-redux'
import StoreChrome from '../../../app/layout/StoreChrome.jsx'

const api = axios.create({ baseURL: '/api/wishlist', withCredentials: true })

const Wishlist = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    api.get('/')
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [user, navigate])

  const remove = async (id) => {
    const res = await api.post(`/${id}`)
    setProducts(res.data.products || [])
  }

  return (
    <StoreChrome>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black uppercase font-serif">Wishlist</h1>
        {loading ? <p className="mt-6 font-mono uppercase">Loading...</p> : products.length === 0 ? (
          <div className="mt-8 bg-white border-4 border-black p-10 text-center">
            <p className="font-mono text-xs uppercase">No saved drops yet.</p>
            <Link to="/shop" className="inline-block mt-4 bg-[#ccff00] border-2 border-black px-5 py-2 font-mono text-xs font-black uppercase">Browse shop</Link>
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <div key={product._id} className="bg-white border-3 border-black shadow-[5px_5px_0_0_#000]">
                <Link to={`/product/${product._id}`}>
                  <div className="h-52 bg-[#e3e3dc] border-b-2 border-black">
                    {product.images?.[0]?.url && <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <h2 className="font-black uppercase">{product.title}</h2>
                    <p className="font-mono font-bold">₹{(product.price?.amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </Link>
                <button onClick={() => remove(product._id)} className="w-full border-t-2 border-black py-2 font-mono text-[10px] font-black uppercase bg-red-100 cursor-pointer">Remove</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </StoreChrome>
  )
}

export default Wishlist
