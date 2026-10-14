import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useProduct } from '../../hooks/useProduct.js'
import StoreChrome from '../../../app/layout/StoreChrome.jsx'

export const CATEGORIES = [
  { id: 'tshirts', label: 'T-Shirts' },
  { id: 'shirts', label: 'Shirts' },
  { id: 'jeans', label: 'Jeans' },
  { id: 'trousers', label: 'Trousers' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'jackets', label: 'Jackets' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'accessories', label: 'Accessories' },
]

const Shop = () => {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { handleGetAllProducts, products, loading } = useProduct()
  const [search, setSearch] = useState(params.get('search') || '')

  const category = params.get('category') || ''
  const gender = params.get('gender') || ''
  const sort = params.get('sort') || 'newest'

  useEffect(() => {
    handleGetAllProducts()
  }, [])

  const filtered = useMemo(() => {
    let list = [...(products || [])]
    if (category) list = list.filter((p) => p.category === category)
    if (gender) list = list.filter((p) => p.gender === gender || p.gender === 'unisex' || !p.gender)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      if (sort === 'price-asc') return (a.price?.amount || 0) - (b.price?.amount || 0)
      if (sort === 'price-desc') return (b.price?.amount || 0) - (a.price?.amount || 0)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
    return list
  }, [products, category, gender, search, sort])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <StoreChrome>
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div>
          <span className="bg-black text-[#ccff00] px-3 py-1 font-mono text-[11px] font-bold uppercase">STORE</span>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight">SHOP ALL</h1>
        </div>

        <div className="bg-white border-4 border-black p-4 shadow-[5px_5px_0_0_#000] flex flex-col lg:flex-row gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SEARCH DROPS..." className="flex-1 border-2 border-black px-3 py-2 font-mono text-xs uppercase" />
          <select value={gender} onChange={(e) => update('gender', e.target.value)} className="border-2 border-black px-3 py-2 font-mono text-xs uppercase">
            <option value="">ALL GENDERS</option>
            <option value="men">MEN</option>
            <option value="women">WOMEN</option>
            <option value="unisex">UNISEX</option>
          </select>
          <select value={sort} onChange={(e) => update('sort', e.target.value)} className="border-2 border-black px-3 py-2 font-mono text-xs uppercase">
            <option value="newest">NEWEST</option>
            <option value="price-asc">PRICE LOW-HIGH</option>
            <option value="price-desc">PRICE HIGH-LOW</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => update('category', '')} className={`border-2 border-black px-3 py-1.5 text-[11px] font-mono font-black uppercase ${!category ? 'bg-[#ccff00]' : 'bg-white'}`}>ALL</button>
          {CATEGORIES.map((item) => (
            <button key={item.id} onClick={() => update('category', item.id)} className={`border-2 border-black px-3 py-1.5 text-[11px] font-mono font-black uppercase ${category === item.id ? 'bg-[#ccff00]' : 'bg-white'}`}>{item.label}</button>
          ))}
        </div>

        {loading && products.length === 0 ? (
          <p className="font-mono font-bold uppercase">Loading catalog...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-4 border-black p-10 text-center shadow-[8px_8px_0_0_#000]">
            <h2 className="text-2xl font-black uppercase">No products found</h2>
            <Link to="/shop" className="inline-block mt-4 bg-black text-[#ccff00] border-2 border-black px-5 py-2 font-mono text-xs font-bold uppercase">Reset filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <button key={product._id} type="button" onClick={() => navigate(`/product/${product._id}`)} className="text-left bg-white border-3 border-black shadow-[6px_6px_0_0_#000] overflow-hidden">
                <div className="h-56 bg-[#e3e3dc] border-b-2 border-black">
                  {product.images?.[0]?.url && <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-mono uppercase text-neutral-500">{product.category || 'drop'}</p>
                  <h3 className="font-black uppercase font-serif text-lg line-clamp-1">{product.title}</h3>
                  <p className="font-mono font-black mt-2">₹{(product.price?.amount || 0).toLocaleString('en-IN')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </StoreChrome>
  )
}

export default Shop
