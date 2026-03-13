import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  FiMenu, FiX, FiHeart, FiUser, FiLogOut, FiGrid,
  FiCalendar, FiSettings, FiChevronDown, FiStar
} from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'

export default function Navbar() {
  const { isAuthenticated, user, logout, isVendor, isAdmin } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const categories = [
    { name: 'Halls', path: '/vendors?category=HALL', icon: '🏛️' },
    { name: 'Catering', path: '/vendors?category=CATERING', icon: '🍽️' },
    { name: 'Decoration', path: '/vendors?category=DECORATION', icon: '🌸' },
    { name: 'Photography', path: '/vendors?category=PHOTOGRAPHY', icon: '📸' },
    { name: 'DJ & Music', path: '/vendors?category=DJ_MUSIC', icon: '🎵' },
    { name: 'Transport', path: '/vendors?category=TRANSPORT', icon: '🚗' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'nav-frosted shadow-2xl shadow-black/50 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-gold to-brand-purple flex items-center justify-center shadow-lg group-hover:shadow-brand-gold/40 transition-shadow">
            <HiSparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl gradient-text tracking-wider">EVENTORA</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className="px-3 py-2 text-sm text-gray-300 hover:text-brand-gold transition-colors rounded-lg hover:bg-white/5 font-body"
            >
              <span className="mr-1">{cat.icon}</span>{cat.name}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className="relative p-2 text-gray-400 hover:text-brand-gold transition-colors rounded-lg hover:bg-white/5">
                <FiHeart className="w-5 h-5" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-brand-gold/30 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-xs font-bold text-white">
                    {(user?.firstName || user?.username || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 font-body">{user?.firstName || user?.username}</span>
                  <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-dark rounded-2xl overflow-hidden shadow-2xl border border-brand-gold/10"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-xs text-gray-500 font-body">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-purple/30 text-purple-300 border border-purple-500/30">
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-2">
                        {isVendor ? (
                          <NavDropdownItem icon={<FiGrid />} label="Vendor Dashboard" to="/vendor/dashboard" />
                        ) : isAdmin ? (
                          <NavDropdownItem icon={<FiSettings />} label="Admin Panel" to="/admin" />
                        ) : (
                          <NavDropdownItem icon={<FiCalendar />} label="My Bookings" to="/dashboard" />
                        )}
                        <NavDropdownItem icon={<FiHeart />} label="Wishlist" to="/wishlist" />
                        <NavDropdownItem icon={<FiUser />} label="Profile" to="/dashboard" />
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-body mt-1"
                        >
                          <FiLogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm btn-outline-gold rounded-xl font-body transition-all">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm btn-gold rounded-xl font-body transition-all flex items-center gap-2">
                <FiStar className="w-4 h-4" /> Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
          {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-dark border-t border-white/5 overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {categories.map(cat => (
                <Link key={cat.name} to={cat.path}
                  className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-brand-gold rounded-xl hover:bg-white/5 transition-all font-body">
                  <span>{cat.icon}</span>{cat.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5 flex gap-2">
                {isAuthenticated ? (
                  <button onClick={logout} className="flex-1 btn-outline-gold px-4 py-2.5 rounded-xl text-sm font-body">
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="flex-1 btn-outline-gold px-4 py-2.5 rounded-xl text-sm text-center font-body">Login</Link>
                    <Link to="/register" className="flex-1 btn-gold px-4 py-2.5 rounded-xl text-sm text-center font-body">Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function NavDropdownItem({ icon, label, to }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-body">
      <span className="text-brand-gold">{icon}</span> {label}
    </Link>
  )
}
