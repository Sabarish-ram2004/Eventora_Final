import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiSearch, FiArrowRight, FiMapPin, FiCalendar, FiStar, FiUsers, FiTrendingUp, FiDollarSign, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { HiSparkles, HiLightningBolt } from 'react-icons/hi'
import VendorCard, { VendorCardSkeleton } from '../components/common/VendorCard'
import { vendorAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'HALL', name: 'Event Halls', icon: '🏛️', desc: 'Premium banquet halls', color: 'from-blue-500/20 to-blue-900/20', border: 'border-blue-500/20 hover:border-blue-400/50' },
  { id: 'CATERING', name: 'Catering', icon: '🍽️', desc: 'Exquisite culinary experiences', color: 'from-orange-500/20 to-red-900/20', border: 'border-orange-500/20 hover:border-orange-400/50' },
  { id: 'DECORATION', name: 'Decoration', icon: '🌸', desc: 'Creative event theming', color: 'from-pink-500/20 to-purple-900/20', border: 'border-pink-500/20 hover:border-pink-400/50' },
  { id: 'PHOTOGRAPHY', name: 'Photography', icon: '📸', desc: 'Capture every moment', color: 'from-gray-500/20 to-gray-900/20', border: 'border-gray-500/20 hover:border-gray-400/50' },
  { id: 'DJ_MUSIC', name: 'DJ & Music', icon: '🎵', desc: 'Live entertainment', color: 'from-violet-500/20 to-purple-900/20', border: 'border-violet-500/20 hover:border-violet-400/50' },
  { id: 'TRANSPORT', name: 'Transport', icon: '🚗', desc: 'Guest transportation', color: 'from-green-500/20 to-teal-900/20', border: 'border-green-500/20 hover:border-green-400/50' },
  { id: 'BEAUTICIAN', name: 'Beauty', icon: '💄', desc: 'Bridal beauty & makeover', color: 'from-rose-500/20 to-pink-900/20', border: 'border-rose-500/20 hover:border-rose-400/50' },
  { id: 'TAILOR', name: 'Tailor', icon: '🪡', desc: 'Custom event attire', color: 'from-amber-500/20 to-orange-900/20', border: 'border-amber-500/20 hover:border-amber-400/50' },
  { id: 'FULL_EVENT_HANDLER', name: 'Event Manager', icon: '🎪', desc: 'Complete event solutions', color: 'from-brand-purple/20 to-brand-navy/20', border: 'border-purple-500/20 hover:border-purple-400/50' },
]

const STATS = [
  { value: '50,000+', label: 'Events Managed', icon: <FiCalendar /> },
  { value: '12,000+', label: 'Verified Vendors', icon: <FiStar /> },
  { value: '2.8M+', label: 'Happy Guests', icon: <FiUsers /> },
  { value: '₹500Cr+', label: 'Transactions', icon: <FiDollarSign /> },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', event: 'Wedding', city: 'Mumbai', rating: 5, text: 'Eventora made our dream wedding a reality. The AI recommendations were spot-on and saved us lakhs!', avatar: 'PS' },
  { name: 'Rahul Gupta', event: 'Corporate Event', city: 'Delhi', rating: 5, text: 'Booking 5 different vendors through one platform was seamless. The vendor comparison tool is brilliant.', avatar: 'RG' },
  { name: 'Ananya Patel', event: 'Birthday Party', city: 'Bangalore', rating: 5, text: 'The chatbot helped me plan my daughter\'s birthday end-to-end in minutes. Absolutely love Eventora!', avatar: 'AP' },
]

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ triggerOnce: true })
  const numTarget = parseFloat(target.replace(/[^0-9.]/g, ''))

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = numTarget / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= numTarget) { setCount(numTarget); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, numTarget, duration])

  const formatted = target.includes('Cr') ? `₹${Math.floor(count)}Cr+`
    : target.includes('M') ? `${count.toFixed(1)}M+`
    : target.includes('+') ? `${Math.floor(count).toLocaleString()}+`
    : Math.floor(count).toLocaleString()

  return <span ref={ref} className="gradient-text font-display font-bold text-4xl lg:text-5xl">{formatted}</span>
}

export default function HomePage() {
  const [topVendors, setTopVendors] = useState([])
  const [loadingVendors, setLoadingVendors] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [showLoginReminder, setShowLoginReminder] = useState(false)
  const [budgetGuests, setBudgetGuests] = useState(100)
  const [budgetServices, setBudgetServices] = useState(['HALL','CATERING','DECORATION','PHOTOGRAPHY'])
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    vendorAPI.getTopVendors({ limit: 8 })
      .then(data => setTopVendors(Array.isArray(data) ? data : data.content || []))
      .catch(() => setTopVendors([]))
      .finally(() => setLoadingVendors(false))
  }, [])

  // Login reminder after scroll
  useEffect(() => {
    if (isAuthenticated) return
    const onScroll = () => {
      if (window.scrollY > 800 && !showLoginReminder) setShowLoginReminder(true)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [isAuthenticated, showLoginReminder])

  // Testimonial auto-rotate
  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCity) params.set('city', selectedCity)
    navigate(`/vendors?${params.toString()}`)
  }

  const budgetEstimate = () => {
    const serviceCosts = { HALL: 150000, CATERING: 1200*budgetGuests, DECORATION: 80000, PHOTOGRAPHY: 60000, DJ_MUSIC: 30000, TRANSPORT: 25000, BEAUTICIAN: 30000, TAILOR: 40000 }
    const total = budgetServices.reduce((sum, s) => sum + (serviceCosts[s] || 0), 0)
    return total
  }

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated BG */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-mid to-black" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.8s' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(255,215,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} ref={heroRef}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-28 pb-16">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 ai-badge px-4 py-2 rounded-full text-sm font-body font-medium text-white mb-6">
            <HiSparkles className="w-4 h-4 text-brand-gold animate-pulse" />
            AI-Powered Event Management Platform
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-display font-bold text-5xl sm:text-6xl lg:text-8xl leading-none mb-6">
            <span className="text-white">Create</span>
            <br />
            <span className="gradient-text">Extraordinary</span>
            <br />
            <span className="text-white">Events</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-gray-400 text-lg sm:text-xl font-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with India's finest event vendors — halls, catering, decoration, photography, and more — powered by cutting-edge AI recommendations.
          </motion.p>

          {/* Search Box */}
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vendors, halls, catering..."
                className="w-full input-glass rounded-2xl pl-12 pr-4 py-4 text-base font-body" />
            </div>
            <div className="relative">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                placeholder="City"
                className="w-full sm:w-40 input-glass rounded-2xl pl-10 pr-4 py-4 text-base font-body" />
            </div>
            <button type="submit" className="btn-gold px-8 py-4 rounded-2xl font-body font-semibold text-base whitespace-nowrap flex items-center gap-2">
              Search <FiArrowRight className="w-5 h-5" />
            </button>
          </motion.form>

          {/* Quick links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3">
            {['Weddings', 'Birthdays', 'Corporate', 'Anniversary'].map(tag => (
              <Link key={tag} to={`/vendors?occasion=${tag.toUpperCase()}`}
                className="px-4 py-2 rounded-full glass text-sm text-gray-400 hover:text-brand-gold hover:border-brand-gold/30 transition-all font-body">
                {tag}
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs font-body uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-brand-gold to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 via-transparent to-brand-gold/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => {
              const [ref, inView] = useInView({ triggerOnce: true })
              return (
                <motion.div key={stat.label} ref={ref}
                  initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15 }}
                  className="text-center glass-dark rounded-2xl p-6 border border-brand-gold/10 hover:border-brand-gold/20 transition-all">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-purple/20 flex items-center justify-center text-brand-gold text-xl">
                    {stat.icon}
                  </div>
                  <AnimatedCounter target={stat.value} />
                  <p className="text-gray-400 text-sm font-body mt-2">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SERVICE CATEGORIES ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl lg:text-5xl text-white mb-4">
              All Your Event Needs, <span className="gradient-text">One Platform</span>
            </h2>
            <p className="text-gray-400 font-body text-lg max-w-xl mx-auto">
              From intimate gatherings to grand celebrations — we've got every service covered.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => {
              const [ref, inView] = useInView({ triggerOnce: true })
              return (
                <motion.div key={cat.id} ref={ref}
                  initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ scale: 1.05, y: -4 }}>
                  <Link to={`/vendors?category=${cat.id}`}
                    className={`block p-5 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} transition-all duration-300 text-center group`}>
                    <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <h3 className="font-display font-semibold text-white text-sm mb-1">{cat.name}</h3>
                    <p className="text-gray-500 text-xs font-body line-clamp-1">{cat.desc}</p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── AI TOP VENDORS ── */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-purple/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="ai-badge px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white">
                  <HiSparkles className="w-3.5 h-3.5 text-brand-gold" /> AI Curated
                </div>
              </div>
              <h2 className="font-display font-bold text-4xl lg:text-5xl text-white">
                Top Vendors <span className="gradient-text">Near You</span>
              </h2>
            </div>
            <Link to="/vendors" className="hidden sm:flex items-center gap-2 text-brand-gold hover:text-brand-gold-light transition-colors font-body text-sm group">
              View All <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loadingVendors
              ? Array(8).fill(0).map((_, i) => <VendorCardSkeleton key={i} />)
              : topVendors.length > 0
                ? topVendors.map((v, i) => <VendorCard key={v.id} vendor={v} index={i} />)
                : (
                  <div className="col-span-full text-center py-20">
                    <div className="text-6xl mb-4">🏗️</div>
                    <h3 className="text-white font-display text-xl mb-2">Vendors Coming Soon</h3>
                    <p className="text-gray-400 font-body">Be the first vendor on Eventora!</p>
                    <Link to="/register" className="inline-block mt-6 btn-gold px-6 py-3 rounded-xl font-body">
                      Register as Vendor
                    </Link>
                  </div>
                )
            }
          </div>
        </div>
      </section>

      {/* ── AI TOOLS PANEL ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl lg:text-5xl text-white mb-4">
              Powerful <span className="gradient-text">AI Tools</span>
            </h2>
            <p className="text-gray-400 font-body text-lg">Smart tools to plan your perfect event</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Calculator */}
            <div className="glass-dark rounded-3xl p-8 border border-brand-gold/10 hover:border-brand-gold/20 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gold/30 to-brand-purple/30 flex items-center justify-center text-2xl">💰</div>
                <div>
                  <h3 className="font-display font-semibold text-white text-xl">AI Budget Calculator</h3>
                  <p className="text-gray-500 text-sm font-body">Estimate your event cost instantly</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm font-body mb-2 block">
                    Guest Count: <span className="text-brand-gold font-semibold">{budgetGuests}</span>
                  </label>
                  <input type="range" min="20" max="1000" value={budgetGuests}
                    onChange={e => setBudgetGuests(parseInt(e.target.value))}
                    className="w-full accent-brand-gold" />
                  <div className="flex justify-between text-xs text-gray-600 mt-1 font-body">
                    <span>20</span><span>500</span><span>1000</span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-body mb-2 block">Services needed:</label>
                  <div className="flex flex-wrap gap-2">
                    {['HALL','CATERING','DECORATION','PHOTOGRAPHY','DJ_MUSIC','TRANSPORT'].map(s => (
                      <button key={s} onClick={() => setBudgetServices(prev =>
                        prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                      )}
                        className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all ${
                          budgetServices.includes(s) ? 'btn-gold' : 'glass text-gray-400 hover:text-white'
                        }`}>
                        {s.replace('_',' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="glass-gold rounded-2xl p-5 mt-4">
                  <p className="text-gray-400 text-sm font-body mb-1">Estimated Budget</p>
                  <p className="gradient-text font-display font-bold text-3xl">
                    ₹{budgetEstimate().toLocaleString('en-IN')}
                  </p>
                  <p className="text-gray-500 text-xs font-body mt-1">±20% variance based on vendor and location</p>
                </div>
              </div>
            </div>

            {/* Smart Planner */}
            <div className="grid grid-rows-2 gap-6">
              <div className="glass-dark rounded-3xl p-6 border border-brand-gold/10 hover:border-brand-gold/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-900/30 flex items-center justify-center text-xl">📊</div>
                  <div>
                    <h3 className="font-display font-semibold text-white">Vendor Comparison</h3>
                    <p className="text-gray-500 text-xs font-body">Compare up to 3 vendors side-by-side</p>
                  </div>
                </div>
                <Link to="/vendors" className="btn-outline-gold w-full py-2.5 rounded-xl text-sm font-body flex items-center justify-center gap-2 transition-all">
                  Start Comparing <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="glass-dark rounded-3xl p-6 border border-brand-gold/10 hover:border-brand-gold/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/30 to-teal-900/30 flex items-center justify-center text-xl">🗓️</div>
                  <div>
                    <h3 className="font-display font-semibold text-white">Smart Event Planner</h3>
                    <p className="text-gray-500 text-xs font-body">AI-guided step-by-step event planning</p>
                  </div>
                </div>
                <button onClick={() => document.querySelector('[data-chatbot-open]')?.click()}
                  className="btn-gold w-full py-2.5 rounded-xl text-sm font-body flex items-center justify-center gap-2 transition-all">
                  <HiSparkles className="w-4 h-4" /> Plan with AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Loved by <span className="gradient-text">Thousands</span>
            </h2>
          </div>
          <div className="relative glass-dark rounded-3xl p-8 border border-brand-gold/10">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIdx}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(TESTIMONIALS[testimonialIdx].rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-gray-200 text-xl font-body italic leading-relaxed mb-6">
                  "{TESTIMONIALS[testimonialIdx].text}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-white font-bold font-display">
                    {TESTIMONIALS[testimonialIdx].avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white font-body">{TESTIMONIALS[testimonialIdx].name}</p>
                    <p className="text-gray-500 text-sm font-body">{TESTIMONIALS[testimonialIdx].event} · {TESTIMONIALS[testimonialIdx].city}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-brand-gold w-6' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGIN REMINDER ── */}
      <AnimatePresence>
        {showLoginReminder && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-6 z-40 glass-dark rounded-2xl p-5 border border-brand-gold/20 shadow-2xl max-w-xs"
          >
            <button onClick={() => setShowLoginReminder(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white text-sm">✕</button>
            <div className="flex items-center gap-2 mb-3">
              <HiSparkles className="w-5 h-5 text-brand-gold" />
              <span className="font-display font-semibold text-white text-sm">Join Eventora</span>
            </div>
            <p className="text-gray-400 text-xs font-body mb-4">
              Sign up to save vendors to wishlist, get personalized AI recommendations and book seamlessly.
            </p>
            <div className="flex gap-2">
              <Link to="/login" className="flex-1 btn-outline-gold py-2 rounded-xl text-xs text-center font-body">Login</Link>
              <Link to="/register" className="flex-1 btn-gold py-2 rounded-xl text-xs text-center font-body">Register Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
