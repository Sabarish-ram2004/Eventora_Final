import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { FiCheck, FiX, FiClock, FiStar, FiUsers, FiTrendingUp, FiSettings, FiImage, FiDollarSign, FiHeart } from 'react-icons/fi'
import { HiSparkles, HiLightningBolt } from 'react-icons/hi'
import { bookingAPI, vendorAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const MOCK_CHART_DATA = [
  { month: 'Jan', bookings: 4, revenue: 85000 },
  { month: 'Feb', bookings: 7, revenue: 142000 },
  { month: 'Mar', bookings: 5, revenue: 98000 },
  { month: 'Apr', bookings: 9, revenue: 210000 },
  { month: 'May', bookings: 12, revenue: 285000 },
  { month: 'Jun', bookings: 8, revenue: 190000 },
]

const AI_SUGGESTIONS = [
  { icon: '📸', text: 'Add more gallery images to increase bookings by 40%', action: 'Add Images', priority: 'high' },
  { icon: '💬', text: 'Respond to queries within 2 hours for 3x more conversions', action: 'Enable Alerts', priority: 'medium' },
  { icon: '🏆', text: 'Complete your profile to rank higher in AI recommendations', action: 'Complete Profile', priority: 'high' },
  { icon: '⭐', text: 'Ask satisfied clients to leave a review to boost trust', action: 'Share Link', priority: 'low' },
]

export default function VendorDashboardPage() {
  const { user } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [updatingBooking, setUpdatingBooking] = useState(null)

  useEffect(() => {
    Promise.all([
      vendorAPI.getMyProfile(),
      bookingAPI.getVendorBookings({ page: 0, size: 20 }),
      vendorAPI.getStats(),
    ]).then(([v, b, s]) => {
      setVendor(v)
      setBookings(b.content || b || [])
      setStats(s)
    }).catch(err => console.error(err))
    .finally(() => setLoading(false))
  }, [])

  const handleBookingAction = async (bookingId, status, notes = '') => {
    setUpdatingBooking(bookingId)
    try {
      await bookingAPI.updateStatus(bookingId, { status, notes })
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
      toast.success(`Booking ${status.toLowerCase()}!`)
    } catch { toast.error('Failed to update booking') }
    finally { setUpdatingBooking(null) }
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
    </div>
  )

  const profileCompletion = vendor?.profileCompletionScore || 0
  const pendingBookings = bookings.filter(b => b.status === 'PENDING')

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HiSparkles className="w-5 h-5 text-brand-gold" />
                <span className="text-brand-gold text-sm font-body">Vendor Dashboard</span>
              </div>
              <h1 className="font-display font-bold text-3xl text-white">{vendor?.businessName || 'Your Business'}</h1>
              <p className="text-gray-400 font-body text-sm">{vendor?.city} · {vendor?.category?.replace('_',' ')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-body border ${
                vendor?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-300 border-green-500/20' :
                vendor?.status === 'PENDING_APPROVAL' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' :
                'bg-red-500/10 text-red-300 border-red-500/20'
              }`}>{vendor?.status}</span>
            </div>
          </div>
        </motion.div>

        {/* Profile Completion */}
        {profileCompletion < 100 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-dark rounded-2xl p-5 border border-brand-gold/20 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HiLightningBolt className="w-5 h-5 text-brand-gold" />
                <span className="font-display font-semibold text-white">Profile Completion</span>
              </div>
              <span className="gradient-text font-bold font-display text-xl">{profileCompletion}%</span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-purple to-brand-gold rounded-full transition-all duration-1000"
                style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="text-gray-400 text-xs font-body mt-2">Complete your profile to rank higher in AI search results</p>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Avg Rating', value: `${parseFloat(vendor?.avgRating||0).toFixed(1)}/5`, icon: <FiStar className="text-brand-gold" />, color: 'from-yellow-500/10 to-yellow-900/10' },
            { label: 'Total Bookings', value: vendor?.totalBookings || 0, icon: <FiUsers className="text-brand-gold" />, color: 'from-blue-500/10 to-blue-900/10' },
            { label: 'Wishlist Saves', value: vendor?.wishlistCount || 0, icon: <FiHeart className="text-red-400" />, color: 'from-red-500/10 to-red-900/10' },
            { label: 'AI Score', value: `${parseFloat(vendor?.overallRankingScore||0).toFixed(1)}/10`, icon: <HiSparkles className="text-purple-400" />, color: 'from-purple-500/10 to-purple-900/10' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-dark rounded-2xl p-5 bg-gradient-to-br ${s.color} border border-white/5`}>
              <div className="text-xl mb-2">{s.icon}</div>
              <div className="font-display font-bold text-2xl text-white">{s.value}</div>
              <div className="text-gray-400 text-xs font-body">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass-dark rounded-2xl w-fit mb-6 overflow-x-auto">
          {['overview','bookings','analytics','ai-insights'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-sm font-body capitalize whitespace-nowrap transition-all ${
                activeTab === tab ? 'btn-gold' : 'text-gray-400 hover:text-white'
              }`}>{tab.replace('-',' ')}</button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Pending Bookings Alert */}
            {pendingBookings.length > 0 && (
              <div className="glass-gold rounded-2xl p-4 border border-brand-gold/30">
                <div className="flex items-center gap-2 mb-2">
                  <FiClock className="w-4 h-4 text-brand-gold" />
                  <span className="font-semibold text-white font-body">{pendingBookings.length} Pending Booking Request{pendingBookings.length > 1 ? 's' : ''}</span>
                </div>
                <p className="text-gray-400 text-sm font-body">Review and respond to maintain quick response score</p>
              </div>
            )}

            {/* Revenue Chart */}
            <div className="glass-dark rounded-3xl p-6 border border-white/5">
              <h3 className="font-display font-semibold text-white text-xl mb-6">Revenue Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MOCK_CHART_DATA}>
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip contentStyle={{ background: '#1E2970', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '12px', color: '#fff', fontFamily: 'DM Sans' }}
                    formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="url(#goldGrad)" radius={[6,6,0,0]} />
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="font-display text-xl text-white mb-2">No Bookings Yet</h3>
                <p className="text-gray-400 font-body">Complete your profile to attract customers</p>
              </div>
            ) : bookings.map(b => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="glass-dark rounded-2xl p-5 border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-500">{b.bookingReference}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-body ${
                        b.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                        b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>{b.status}</span>
                    </div>
                    <h4 className="font-display font-semibold text-white">{b.user?.firstName} {b.user?.lastName}</h4>
                    <p className="text-gray-400 text-sm font-body">
                      {b.eventDate} · {b.guestCount ? `${b.guestCount} guests` : ''} · {b.occasion?.replace('_',' ')}
                    </p>
                    {b.specialRequirements && (
                      <p className="text-gray-500 text-xs font-body mt-1 italic">"{b.specialRequirements}"</p>
                    )}
                  </div>
                  {b.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button disabled={updatingBooking === b.id}
                        onClick={() => handleBookingAction(b.id, 'CONFIRMED')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 text-sm font-body transition-all">
                        <FiCheck className="w-4 h-4" /> Confirm
                      </button>
                      <button disabled={updatingBooking === b.id}
                        onClick={() => handleBookingAction(b.id, 'REJECTED')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 text-sm font-body transition-all">
                        <FiX className="w-4 h-4" /> Decline
                      </button>
                      <button disabled={updatingBooking === b.id}
                        onClick={() => handleBookingAction(b.id, 'WAITLISTED')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-gray-400 text-sm font-body transition-all">
                        Waitlist
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-dark rounded-3xl p-6 border border-white/5">
            <h3 className="font-display font-semibold text-white text-xl mb-6">Booking Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={MOCK_CHART_DATA}>
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E2970', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="bookings" stroke="#FFD700" strokeWidth={3} dot={{ fill: '#FFD700', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="space-y-4">
            <div className="glass-gold rounded-2xl p-4 border border-brand-gold/20 mb-6 flex items-center gap-3">
              <HiSparkles className="w-6 h-6 text-brand-gold flex-shrink-0" />
              <p className="text-gray-300 font-body text-sm">
                AI analyzes your profile, bookings, and market trends to give you actionable recommendations.
              </p>
            </div>
            {AI_SUGGESTIONS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-dark rounded-2xl p-5 border border-white/5 flex items-start gap-4">
                <span className="text-2xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-300 font-body text-sm">{s.text}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-body ${
                    s.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    s.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>{s.priority} priority</span>
                </div>
                <button className="btn-outline-gold px-4 py-2 rounded-xl text-xs font-body whitespace-nowrap transition-all">
                  {s.action}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
