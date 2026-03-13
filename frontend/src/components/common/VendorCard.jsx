import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiStar, FiMapPin, FiCamera } from 'react-icons/fi'
import { HiSparkles, HiBadgeCheck } from 'react-icons/hi'
import { wishlistAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  HALL: '🏛️', CATERING: '🍽️', DECORATION: '🌸', PHOTOGRAPHY: '📸',
  DJ_MUSIC: '🎵', TRANSPORT: '🚗', BEAUTICIAN: '💄', TAILOR: '🪡',
  FULL_EVENT_HANDLER: '🎪'
}

const CATEGORY_COLORS = {
  HALL: 'from-blue-600 to-blue-900', CATERING: 'from-orange-600 to-red-900',
  DECORATION: 'from-pink-600 to-purple-900', PHOTOGRAPHY: 'from-gray-600 to-gray-900',
  DJ_MUSIC: 'from-violet-600 to-purple-900', TRANSPORT: 'from-green-600 to-teal-900',
  BEAUTICIAN: 'from-rose-600 to-pink-900', TAILOR: 'from-amber-600 to-orange-900',
  FULL_EVENT_HANDLER: 'from-brand-purple to-brand-navy',
}

export default function VendorCard({ vendor, index = 0 }) {
  const [wishlisted, setWishlisted] = useState(vendor.wishlisted || false)
  const [wishloading, setWishloading] = useState(false)
  const { isAuthenticated } = useAuth()
  const isAIRecommended = (vendor.overallRankingScore || 0) > 7
  const category = vendor.category || 'HALL'
  const rating = parseFloat(vendor.avgRating || 0).toFixed(1)
  const price = vendor.startingPrice ? `₹${parseInt(vendor.startingPrice).toLocaleString('en-IN')}` : 'On Request'

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isAuthenticated) { toast.error('Please login to wishlist'); return }
    setWishloading(true)
    try {
      const res = await wishlistAPI.toggle(vendor.id)
      setWishlisted(res.wishlisted)
      toast.success(res.message)
    } catch { toast.error('Failed') }
    finally { setWishloading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="card-vendor group cursor-pointer"
    >
      <Link to={`/vendors/${vendor.id}`} className="block">
        <div className={`relative h-48 bg-gradient-to-br ${CATEGORY_COLORS[category] || 'from-brand-navy-light to-brand-navy'} overflow-hidden`}>
          {vendor.coverBannerUrl ? (
            <img src={vendor.coverBannerUrl} alt={vendor.businessName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-30">{CATEGORY_ICONS[category]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {isAIRecommended && (
            <div className="absolute top-3 left-3 ai-badge px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white">
              <HiSparkles className="w-3 h-3 text-brand-gold" />AI Pick
            </div>
          )}
          {vendor.isVerified && (
            <div className="absolute top-3 right-12 glass px-2 py-1 rounded-full flex items-center gap-1 text-xs text-blue-300">
              <HiBadgeCheck className="w-3.5 h-3.5" />Verified
            </div>
          )}
          <button onClick={handleWishlist} disabled={wishloading}
            className="absolute top-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center hover:border-red-400/50 transition-all">
            <FiHeart className={`w-4 h-4 transition-all ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
          {vendor.logoUrl && (
            <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl overflow-hidden border-2 border-brand-gold/40">
              <img src={vendor.logoUrl} alt="logo" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-brand-gold font-body font-medium uppercase tracking-wide">
              {CATEGORY_ICONS[category]} {category.replace('_',' ')}
            </span>
            <div className="flex items-center gap-1">
              <FiStar className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
              <span className="text-sm font-semibold text-white">{rating}</span>
              <span className="text-xs text-gray-500">({vendor.totalReviews || 0})</span>
            </div>
          </div>
          <h3 className="font-display font-semibold text-white text-lg leading-snug mb-1 group-hover:text-brand-gold transition-colors line-clamp-1">
            {vendor.businessName}
          </h3>
          {vendor.tagline && <p className="text-gray-400 text-xs font-body line-clamp-1 mb-3">{vendor.tagline}</p>}
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-body mb-3">
            <FiMapPin className="w-3 h-3 flex-shrink-0 text-brand-gold" />
            <span className="truncate">{vendor.city}{vendor.pincode ? `, ${vendor.pincode}` : ''}</span>
          </div>
          {vendor.amenities?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {vendor.amenities.slice(0,3).map(a => (
                <span key={a} className="text-xs px-2 py-0.5 rounded-full glass text-gray-300 font-body">{a}</span>
              ))}
              {vendor.amenities.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-full glass text-gray-500 font-body">+{vendor.amenities.length-3}</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-xs text-gray-500 font-body">Starting from</p>
              <p className="text-brand-gold font-bold text-lg font-display">{price}</p>
            </div>
            <div className="btn-gold px-4 py-2 rounded-xl text-sm font-body font-semibold">View Details</div>
          </div>
          {vendor.googleMapsLink && (
            <a href={vendor.googleMapsLink} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-gray-400 hover:text-brand-gold transition-colors border border-white/5 hover:border-brand-gold/20 font-body">
              <FiMapPin className="w-3 h-3" /> View on Google Maps
            </a>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export function VendorCardSkeleton() {
  return (
    <div className="card-vendor overflow-hidden">
      <div className="h-48 shimmer-card" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between"><div className="h-3 w-20 shimmer-card rounded" /><div className="h-3 w-12 shimmer-card rounded" /></div>
        <div className="h-5 w-3/4 shimmer-card rounded" />
        <div className="h-3 w-1/2 shimmer-card rounded" />
        <div className="flex gap-2"><div className="h-5 w-16 shimmer-card rounded-full" /><div className="h-5 w-16 shimmer-card rounded-full" /></div>
        <div className="h-10 shimmer-card rounded-xl" />
      </div>
    </div>
  )
}
