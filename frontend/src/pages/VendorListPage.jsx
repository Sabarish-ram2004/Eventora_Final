import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter, FiSearch, FiX, FiSliders, FiGrid, FiList } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'
import VendorCard, { VendorCardSkeleton } from '../components/common/VendorCard'
import { vendorAPI } from '../services/api'

const CATEGORIES = [
  { id: '', name: 'All Services', icon: '✨' },
  { id: 'HALL', name: 'Halls', icon: '🏛️' },
  { id: 'CATERING', name: 'Catering', icon: '🍽️' },
  { id: 'DECORATION', name: 'Decoration', icon: '🌸' },
  { id: 'PHOTOGRAPHY', name: 'Photography', icon: '📸' },
  { id: 'DJ_MUSIC', name: 'DJ & Music', icon: '🎵' },
  { id: 'TRANSPORT', name: 'Transport', icon: '🚗' },
  { id: 'BEAUTICIAN', name: 'Beauty', icon: '💄' },
  { id: 'TAILOR', name: 'Tailor', icon: '🪡' },
  { id: 'FULL_EVENT_HANDLER', name: 'Full Handler', icon: '🎪' },
]

const HALL_SUBTYPES = ['AC Hall','Non-AC Hall','Open Ground','Rooftop','Poolside']

export default function VendorListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    subtype: '',
  })
  const [debouncedCity, setDebouncedCity] = useState(filters.city)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(filters.city), 400)
    return () => clearTimeout(timer)
  }, [filters.city])

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        size: 12,
        ...(filters.category && { category: filters.category }),
        ...(debouncedCity && { city: debouncedCity }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.minRating && { minRating: filters.minRating }),
      }
      const res = await vendorAPI.getVendors(params)
      if (page === 0) setVendors(res.content || res || [])
      else setVendors(prev => [...prev, ...(res.content || [])])
      setTotal(res.totalElements || (res.content || res).length || 0)
    } catch { setVendors([]) }
    finally { setLoading(false) }
  }, [filters.category, debouncedCity, filters.minPrice, filters.maxPrice, filters.minRating, page])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  const updateFilter = (key, val) => {
    setPage(0)
    setFilters(prev => ({...prev, [key]: val}))
  }

  const clearFilters = () => {
    setPage(0)
    setFilters({ category: '', city: '', minPrice: '', maxPrice: '', minRating: '', subtype: '' })
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold text-3xl lg:text-5xl text-white mb-2">
            {filters.category
              ? <>{CATEGORIES.find(c => c.id === filters.category)?.icon} {CATEGORIES.find(c => c.id === filters.category)?.name}</>
              : <>All <span className="gradient-text">Event Services</span></>
            }
          </motion.h1>
          <p className="text-gray-400 font-body">
            {loading ? 'Searching...' : `${total} vendors available${debouncedCity ? ` in ${debouncedCity}` : ''}`}
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => updateFilter('category', cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-body transition-all ${
                filters.category === cat.id
                  ? 'btn-gold shadow-lg shadow-brand-gold/20'
                  : 'glass text-gray-400 hover:text-white hover:border-white/20'
              }`}>
              <span>{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filter – Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sidebar-filter rounded-3xl p-6 sticky top-28 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-white flex items-center gap-2">
                  <FiSliders className="w-4 h-4 text-brand-gold" /> Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 font-body transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              {/* City */}
              <div>
                <label className="text-gray-400 text-sm font-body block mb-2">City</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Enter city..." value={filters.city}
                    onChange={e => updateFilter('city', e.target.value)}
                    className="w-full input-glass rounded-xl pl-9 pr-3 py-2.5 text-sm font-body" />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-gray-400 text-sm font-body block mb-2">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice}
                    onChange={e => updateFilter('minPrice', e.target.value)}
                    className="input-glass rounded-xl px-3 py-2.5 text-sm font-body" />
                  <input type="number" placeholder="Max" value={filters.maxPrice}
                    onChange={e => updateFilter('maxPrice', e.target.value)}
                    className="input-glass rounded-xl px-3 py-2.5 text-sm font-body" />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-gray-400 text-sm font-body block mb-2">Minimum Rating</label>
                <div className="flex gap-2">
                  {[0,3,4,4.5].map(r => (
                    <button key={r} onClick={() => updateFilter('minRating', r === 0 ? '' : r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-body transition-all ${
                        filters.minRating == r || (!filters.minRating && r === 0)
                          ? 'btn-gold' : 'glass text-gray-400'
                      }`}>
                      {r === 0 ? 'All' : `${r}⭐`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtypes (for HALL) */}
              {filters.category === 'HALL' && (
                <div>
                  <label className="text-gray-400 text-sm font-body block mb-2">Hall Type</label>
                  <div className="space-y-2">
                    {HALL_SUBTYPES.map(t => (
                      <button key={t} onClick={() => updateFilter('subtype', filters.subtype === t ? '' : t)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-body transition-all ${
                          filters.subtype === t ? 'btn-gold' : 'glass text-gray-400 hover:text-white'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <button onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body transition-all mb-4 ${
                filterOpen ? 'btn-gold' : 'glass text-gray-400'
              }`}>
              <FiFilter className="w-4 h-4" />
              Filters {activeFiltersCount > 0 && <span className="bg-brand-gold text-brand-navy w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">{activeFiltersCount}</span>}
            </button>
          </div>

          {/* Grid */}
          <main className="flex-1 min-w-0">
            {/* AI note */}
            {!loading && vendors.length > 0 && (
              <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 font-body">
                <HiSparkles className="w-3.5 h-3.5 text-brand-gold" />
                Sorted by AI Ranking Score — best vendors first
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {loading && page === 0
                ? Array(6).fill(0).map((_, i) => <VendorCardSkeleton key={i} />)
                : vendors.map((v, i) => <VendorCard key={v.id} vendor={v} index={i} />)
              }
            </div>

            {/* Empty state */}
            {!loading && vendors.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-32">
                <div className="text-8xl mb-6 animate-float">🔍</div>
                <h3 className="font-display font-bold text-2xl text-white mb-3">No Vendors Found</h3>
                <p className="text-gray-400 font-body mb-6">
                  {activeFiltersCount > 0
                    ? 'Try adjusting your filters to see more results.'
                    : 'Be the first vendor in this category!'}
                </p>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="btn-gold px-6 py-3 rounded-xl font-body">
                    Clear All Filters
                  </button>
                )}
              </motion.div>
            )}

            {/* Load more */}
            {!loading && vendors.length < total && (
              <div className="text-center mt-10">
                <button onClick={() => setPage(p => p + 1)}
                  className="btn-outline-gold px-8 py-3 rounded-2xl font-body transition-all">
                  Load More
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
