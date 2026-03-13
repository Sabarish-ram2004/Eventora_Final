import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart } from 'react-icons/fi'
import { wishlistAPI } from '../services/api'
import VendorCard, { VendorCardSkeleton } from '../components/common/VendorCard'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wishlistAPI.getWishlist()
      .then(data => setWishlist(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const vendors = wishlist.map(w => ({ ...w.vendor, wishlisted: true })).filter(Boolean)

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FiHeart className="w-5 h-5 text-red-400 fill-red-400" />
            <span className="text-red-400 text-sm font-body">My Wishlist</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            Saved Vendors <span className="text-gray-400 text-2xl font-body font-normal">({vendors.length})</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => <VendorCardSkeleton key={i} />)}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-7xl mb-6">💝</div>
            <h3 className="font-display font-bold text-2xl text-white mb-3">No Saved Vendors</h3>
            <p className="text-gray-400 font-body mb-8">Heart any vendor to save them here for later</p>
            <Link to="/vendors" className="btn-gold px-8 py-3 rounded-2xl font-body inline-block">Browse Vendors</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.map((v, i) => <VendorCard key={v.id} vendor={v} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
