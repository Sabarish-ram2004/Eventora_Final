import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiStar, FiMapPin, FiHeart, FiPhone, FiMail, FiGlobe, FiArrowLeft, FiCalendar, FiUsers, FiCheck, FiShare2 } from 'react-icons/fi'
import { HiSparkles, HiBadgeCheck, HiLightningBolt } from 'react-icons/hi'
import { vendorAPI, wishlistAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  HALL: '🏛️', CATERING: '🍽️', DECORATION: '🌸', PHOTOGRAPHY: '📸',
  DJ_MUSIC: '🎵', TRANSPORT: '🚗', BEAUTICIAN: '💄', TAILOR: '🪡', FULL_EVENT_HANDLER: '🎪'
}

export default function VendorDetailPage() {
  const { id } = useParams()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    vendorAPI.getVendor(id)
      .then(data => { setVendor(data); setWishlisted(data.wishlisted || false) })
      .catch(() => toast.error('Vendor not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return }
    try {
      const res = await wishlistAPI.toggle(id)
      setWishlisted(res.wishlisted)
      toast.success(res.message)
    } catch { toast.error('Failed') }
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 font-body">Loading vendor details...</p>
      </div>
    </div>
  )

  if (!vendor) return (
    <div className="min-h-screen pt-24 flex items-center justify-center text-center">
      <div>
        <div className="text-7xl mb-4">😕</div>
        <h2 className="font-display font-bold text-2xl text-white mb-3">Vendor Not Found</h2>
        <Link to="/vendors" className="btn-gold px-6 py-3 rounded-xl font-body inline-block">Browse Vendors</Link>
      </div>
    </div>
  )

  const rating = parseFloat(vendor.avgRating || 0).toFixed(1)
  const price = vendor.startingPrice ? `₹${parseInt(vendor.startingPrice).toLocaleString('en-IN')}` : 'On Request'
  const isAIRecommended = (vendor.overallRankingScore || 0) > 7
  const mockGallery = vendor.gallery || [vendor.coverBannerUrl].filter(Boolean)

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Cover */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br from-brand-navy-mid to-brand-navy`}>
          {(vendor.coverBannerUrl || mockGallery[galleryIdx]) && (
            <img src={vendor.coverBannerUrl || mockGallery[galleryIdx]} alt={vendor.businessName}
              className="w-full h-full object-cover opacity-60" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="flex items-center gap-4">
            {vendor.logoUrl && (
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-gold/40 shadow-xl">
                <img src={vendor.logoUrl} alt="logo" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isAIRecommended && (
                  <span className="ai-badge px-2.5 py-0.5 rounded-full text-xs text-white flex items-center gap-1">
                    <HiSparkles className="w-3 h-3 text-brand-gold" /> AI Pick
                  </span>
                )}
                {vendor.isVerified && (
                  <span className="glass px-2.5 py-0.5 rounded-full text-xs text-blue-300 flex items-center gap-1">
                    <HiBadgeCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">{vendor.businessName}</h1>
              {vendor.tagline && <p className="text-gray-300 text-sm font-body">{vendor.tagline}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleWishlist}
              className={`w-10 h-10 glass rounded-xl flex items-center justify-center transition-all hover:border-red-400/50 ${wishlisted ? 'border-red-500/50' : ''}`}>
              <FiHeart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white hover:text-brand-gold transition-all">
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Back btn */}
        <button onClick={() => navigate(-1)}
          className="absolute top-6 left-6 glass w-10 h-10 rounded-xl flex items-center justify-center text-white hover:text-brand-gold transition-all">
          <FiArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Rating', value: `${rating}/5`, icon: <FiStar className="text-brand-gold" /> },
                { label: 'Reviews', value: vendor.totalReviews || 0, icon: '💬' },
                { label: 'Bookings', value: vendor.totalBookings || 0, icon: <FiCalendar className="text-brand-gold" /> },
              ].map(stat => (
                <div key={stat.label} className="glass-dark rounded-2xl p-4 text-center border border-white/5">
                  <div className="text-brand-gold text-xl mb-1 flex justify-center">{stat.icon}</div>
                  <div className="font-display font-bold text-2xl text-white">{stat.value}</div>
                  <div className="text-gray-500 text-xs font-body">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 glass-dark rounded-2xl w-fit">
              {['overview','services','reviews'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-body capitalize transition-all ${
                    activeTab === tab ? 'btn-gold' : 'text-gray-400 hover:text-white'
                  }`}>{tab}</button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    <div className="glass-dark rounded-2xl p-6 border border-white/5">
                      <h3 className="font-display font-semibold text-white text-lg mb-3">About</h3>
                      <p className="text-gray-400 font-body leading-relaxed">
                        {vendor.description || 'No description provided yet.'}
                      </p>
                    </div>

                    {vendor.amenities?.length > 0 && (
                      <div className="glass-dark rounded-2xl p-6 border border-white/5">
                        <h3 className="font-display font-semibold text-white text-lg mb-4">Amenities & Features</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {vendor.amenities.map(a => (
                            <div key={a} className="flex items-center gap-2 text-gray-300 font-body text-sm">
                              <FiCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />{a}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div className="glass-dark rounded-2xl p-6 border border-white/5">
                      <h3 className="font-display font-semibold text-white text-lg mb-4">Location</h3>
                      <div className="flex items-start gap-3 text-gray-400 font-body mb-4">
                        <FiMapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                        <span>{vendor.address}, {vendor.city} - {vendor.pincode}</span>
                      </div>
                      {vendor.googleMapsLink && (
                        <a href={vendor.googleMapsLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 btn-outline-gold px-4 py-2 rounded-xl text-sm font-body transition-all">
                          <FiMapPin className="w-4 h-4" /> View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="glass-dark rounded-2xl p-6 border border-white/5">
                    <h3 className="font-display font-semibold text-white text-lg mb-4">Service Packages</h3>
                    {vendor.services?.length > 0 ? (
                      <div className="space-y-4">
                        {vendor.services.map(s => (
                          <div key={s.id} className="glass rounded-2xl p-4 border border-brand-gold/10">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-white font-body">{s.serviceName}</h4>
                              <span className="text-brand-gold font-bold font-display">₹{parseInt(s.price || 0).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-400 text-sm font-body">{s.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 font-body">Services will be listed soon. Contact vendor directly.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="glass-dark rounded-2xl p-6 border border-white/5">
                    <h3 className="font-display font-semibold text-white text-lg mb-4">Customer Reviews</h3>
                    {vendor.reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {vendor.reviews.map(r => (
                          <div key={r.id} className="glass rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-xs font-bold text-white">
                                  {r.user?.firstName?.[0] || 'U'}
                                </div>
                                <span className="font-semibold text-white text-sm font-body">{r.user?.firstName} {r.user?.lastName}</span>
                              </div>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-700'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm font-body">{r.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 font-body">No reviews yet. Be the first to review!</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="glass-dark rounded-3xl p-6 border border-brand-gold/20 sticky top-28 shadow-2xl shadow-brand-gold/5">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm font-body">Starting from</p>
                <p className="gradient-text font-display font-bold text-4xl">{price}</p>
                <p className="text-gray-500 text-xs font-body">per event</p>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3 mb-6">
                {isAuthenticated ? (
                  <Link to={`/book/${vendor.id}`}
                    className="w-full btn-gold py-4 rounded-2xl font-body font-semibold text-center flex items-center justify-center gap-2">
                    <FiCalendar className="w-5 h-5" /> Book Now
                  </Link>
                ) : (
                  <Link to="/login"
                    className="w-full btn-gold py-4 rounded-2xl font-body font-semibold text-center flex items-center justify-center gap-2">
                    Login to Book
                  </Link>
                )}
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`}
                    className="w-full btn-outline-gold py-3 rounded-2xl font-body font-semibold text-center flex items-center justify-center gap-2 transition-all">
                    <FiPhone className="w-4 h-4" /> {vendor.phone}
                  </a>
                )}
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`}
                    className="w-full py-3 rounded-2xl font-body text-sm text-gray-400 text-center flex items-center justify-center gap-2 glass hover:text-white transition-all border border-white/5">
                    <FiMail className="w-4 h-4" /> Send Email
                  </a>
                )}
              </div>

              {/* Response Time */}
              <div className="glass-gold rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HiLightningBolt className="w-4 h-4 text-brand-gold" />
                  <span className="text-white text-sm font-body font-semibold">Quick Response</span>
                </div>
                <p className="text-gray-400 text-xs font-body">
                  Avg. response time: {vendor.avgResponseTimeHours <= 2 ? 'Under 2 hours' :
                    vendor.avgResponseTimeHours <= 24 ? 'Within 24 hours' : '1-2 days'}
                </p>
              </div>

              {/* AI Score */}
              {isAIRecommended && (
                <div className="mt-3 ai-badge rounded-2xl p-4 text-center">
                  <HiSparkles className="w-5 h-5 text-brand-gold mx-auto mb-1" />
                  <p className="text-white text-xs font-body">
                    AI Ranking Score: <span className="text-brand-gold font-bold">{parseFloat(vendor.overallRankingScore || 0).toFixed(1)}/10</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
