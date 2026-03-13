import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'USER', label: 'Customer', icon: '👤', desc: 'Plan & book events' },
  { id: 'VENDOR', label: 'Vendor', icon: '🏢', desc: 'Offer your services' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1=form, 2=otp
  const [form, setForm] = useState({ username:'', email:'', password:'', firstName:'', lastName:'', phone:'', role:'USER' })
  const [otp, setOtp] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register(form)
      setStep(2)
    } catch (err) { toast.error(err?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.verifyEmail({ email: form.email, otp })
      toast.success('Email verified! 🎉 Please login.')
      navigate('/login')
    } catch (err) { toast.error(err?.message || 'Invalid OTP') }
    finally { setLoading(false) }
  }

  const resendOtp = async () => {
    try {
      await authAPI.forgotPassword({ email: form.email })
      toast.success('New OTP sent!')
    } catch { toast.error('Failed to resend') }
  }

  const strength = () => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const strengthColor = ['','bg-red-500','bg-orange-500','bg-yellow-500','bg-green-500']
  const strengthLabel = ['','Weak','Fair','Good','Strong']

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-mid to-black" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-brand-purple/20 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg">
        <div className="glass-dark rounded-3xl p-8 border border-brand-gold/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-gold to-brand-purple flex items-center justify-center mb-4 shadow-lg">
              <HiSparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-3xl gradient-text">Join Eventora</h1>
            <p className="text-gray-400 font-body mt-2">
              {step === 1 ? 'Create your free account' : 'Verify your email'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1,2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-brand-gold text-brand-navy' : 'glass text-gray-500'
                }`}>
                  {step > s ? <FiCheck className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`w-12 h-px ${step > s ? 'bg-brand-gold' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister} className="space-y-4">
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  {ROLES.map(r => (
                    <button key={r.id} type="button" onClick={() => setForm({...form, role: r.id})}
                      className={`p-4 rounded-2xl border transition-all text-center ${
                        form.role === r.id
                          ? 'border-brand-gold bg-brand-gold/10 shadow-lg shadow-brand-gold/10'
                          : 'glass border-white/10 hover:border-white/20'
                      }`}>
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <div className="font-semibold text-white text-sm font-body">{r.label}</div>
                      <div className="text-gray-500 text-xs font-body">{r.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[['firstName','First Name',FiUser],['lastName','Last Name',FiUser]].map(([field, placeholder, Icon]) => (
                    <div key={field} className="relative">
                      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder={placeholder} value={form[field]}
                        onChange={e => setForm({...form, [field]: e.target.value})}
                        className="w-full input-glass rounded-xl pl-10 pr-3 py-3.5 text-sm font-body" />
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" required placeholder="Username" value={form.username}
                    onChange={e => setForm({...form, username: e.target.value.toLowerCase().replace(/\s/g,'')})}
                    className="w-full input-glass rounded-2xl pl-12 pr-4 py-4 font-body" />
                </div>

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" required placeholder="Email address" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full input-glass rounded-2xl pl-12 pr-4 py-4 font-body" />
                </div>

                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" placeholder="Phone (optional)" value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full input-glass rounded-2xl pl-12 pr-4 py-4 font-body" />
                </div>

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} required placeholder="Password (min 8 chars)"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full input-glass rounded-2xl pl-12 pr-12 py-4 font-body" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    {showPass ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>

                {form.password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength() ? strengthColor[strength()] : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <p className="text-xs font-body text-gray-500">Strength: <span className="text-white">{strengthLabel[strength()]}</span></p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full btn-gold py-4 rounded-2xl font-body font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
                    : <>Create Account <FiArrowRight className="w-5 h-5" /></>}
                </button>

                <p className="text-center text-gray-400 text-sm font-body">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand-gold hover:text-brand-gold-light transition-colors font-semibold">Sign In</Link>
                </p>
              </motion.form>
            ) : (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify} className="space-y-5">
                <div className="text-center p-4 glass-gold rounded-2xl">
                  <p className="text-gray-400 text-sm font-body">OTP sent to</p>
                  <p className="text-brand-gold font-semibold font-body">{form.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-body block mb-2 text-center">Enter 6-digit OTP</label>
                  <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                    placeholder="• • • • • •"
                    className="w-full input-glass rounded-2xl px-4 py-5 text-center text-3xl font-mono tracking-[0.8em] font-bold" />
                </div>
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full btn-gold py-4 rounded-2xl font-body font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" /> : <>Verify & Continue <FiCheck className="w-5 h-5" /></>}
                </button>
                <div className="text-center">
                  <button type="button" onClick={resendOtp}
                    className="text-sm text-gray-400 hover:text-brand-gold transition-colors font-body">
                    Didn't receive? Resend OTP
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
