import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiHeart, FiStar, FiUser, FiClock, FiCheck, FiX } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'
import { bookingAPI, wishlistAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLES = {
  PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: <FiClock className="w-3 h-3" /> },
  CONFIRMED: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: <FiCheck className="w-3 h-3" /> },
  REJECTED: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: <FiX className="w-3 h-3" /> },
  WAITLISTED: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', icon: <FiClock className="w-3 h-3" /> },
  CANCELLED: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', icon: <FiX className="w-3 h-3" /> },
  COMPLETED: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', icon: <FiStar className="w-3 h-3" /> },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bookings')

  useEffect(() => {
    Promise.all([
      bookingAPI.getMyBookings({ page: 0, size: 10 }),
      wishlistAPI.getWishlist(),
    ]).then(([b, w]) => {
      setBookings(b.content || b || [])
      setWishlist(w || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: <FiCalendar />, color: 'from-blue-500/20 to-blue-900/20' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'CONFIRMED').length, icon: <FiCheck />, color: 'from-green-500/20 to-green-900/20' },
    { label: 'Wishlist', value: wishlist.length, icon: <FiHeart />, color: 'from-red-500/20 to-red-900/20' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'COMPLETED').length, icon: <FiStar />, color: 'from-purple-500/20 to-purple-900/20' },
  ]

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-purple flex items-center justify-center text-white font-bold text-lg font-display">
              {(user?.firstName || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">
                Welcome, {user?.firstName || user?.username}!
              </h1>
              <p className="text-gray-400 text-sm font-body">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-dark rounded-2xl p-5 bg-gradient-to-br ${s.color} border border-white/5`}>
              <div className="text-brand-gold text-xl mb-2">{s.icon}</div>
              <div className="font-display font-bold text-2xl text-white">{s.value}</div>
              <div className="text-gray-400 text-xs font-body">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass-dark rounded-2xl w-fit mb-6">
          {['bookings','wishlist'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-body capitalize transition-all ${
                activeTab === tab ? 'btn-gold' : 'text-gray-400 hover:text-white'
              }`}>{tab}</button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="font-display text-xl text-white mb-2">No Bookings Yet</h3>
                <p className="text-gray-400 font-body mb-6">Start planning your dream event!</p>
                <Link to="/vendors" className="btn-gold px-6 py-3 rounded-xl font-body inline-block">Browse Vendors</Link>
              </div>
            ) : bookings.map(b => {
              const style = STATUS_STYLES[b.status] || STATUS_STYLES.PENDING
              return (
                <motion.div key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="glass-dark rounded-2xl p-5 border border-white/5 hover:border-brand-gold/10 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body border ${style.bg} ${style.text} ${style.border}`}>
                          {style.icon}{b.status}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{b.bookingReference}</span>
                      </div>
                      <h3 className="font-display font-semibold text-white text-lg">
                        {b.vendor?.businessName || 'Vendor'}
                      </h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-400 font-body">
                        <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5 text-brand-gold" />{b.eventDate}</span>
                        {b.guestCount && <span className="flex items-center gap-1"><FiUser className="w-3.5 h-3.5 text-brand-gold" />{b.guestCount} guests</span>}
                        <span className="capitalize">{b.occasion?.toLowerCase()?.replace('_',' ')}</span>
                      </div>
                      {b.vendorNotes && (
                        <div className="mt-3 p-3 glass rounded-xl">
                          <p className="text-xs text-gray-400 font-body"><span className="text-brand-gold">Vendor note:</span> {b.vendorNotes}</p>
                        </div>
                      )}
                    </div>
                    {b.quotedPrice && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-body">Quoted</p>
                        <p className="text-brand-gold font-bold font-display">₹{parseInt(b.quotedPrice).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div>
            {wishlist.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="font-display text-xl text-white mb-2">Your Wishlist is Empty</h3>
                <p className="text-gray-400 font-body mb-6">Save your favorite vendors for later!</p>
                <Link to="/vendors" className="btn-gold px-6 py-3 rounded-xl font-body inline-block">Explore Vendors</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.map(w => (
                  <Link key={w.id} to={`/vendors/${w.vendor?.id}`}
                    className="glass-dark rounded-2xl p-4 border border-white/5 hover:border-brand-gold/20 transition-all flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-navy-mid flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                      {w.vendor?.logoUrl ? <img src={w.vendor.logoUrl} alt="" className="w-full h-full object-cover" /> : '🏢'}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-white">{w.vendor?.businessName}</h4>
                      <p className="text-gray-400 text-sm font-body">{w.vendor?.city} · {w.vendor?.category?.replace('_',' ')}</p>
                    </div>
                    <FiHeart className="w-5 h-5 text-red-500 fill-red-500 ml-auto" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
