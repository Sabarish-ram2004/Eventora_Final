import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

export default function LoginPage() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpMode, setOtpMode] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPass, setNewPass] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form.emailOrUsername, form.password)
      if (data.user.role === 'VENDOR') navigate('/vendor/dashboard')
      else if (data.user.role === 'ADMIN') navigate('/admin')
      else navigate('/home')
    } catch (err) {
      toast.error(err?.message || 'Login failed. Please check your credentials.')
    } finally { setLoading(false) }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: forgotEmail })
      setOtpMode(true)
      toast.success('OTP sent to your email!')
    } catch (err) { toast.error(err?.message || 'Email not found') }
    finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.resetPassword({ email: forgotEmail, otp, newPassword: newPass })
      toast.success('Password reset! Please login.')
      setForgotMode(false); setOtpMode(false); setOtp(''); setNewPass(''); setForgotEmail('')
    } catch (err) { toast.error(err?.message || 'Reset failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-mid to-black" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md">
        <div className="glass-dark rounded-3xl p-8 border border-brand-gold/10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-gold to-brand-purple flex items-center justify-center mb-4 shadow-lg">
              <HiSparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-bold text-3xl gradient-text">EVENTORA</h1>
            <p className="text-gray-400 font-body mt-2">
              {forgotMode ? (otpMode ? 'Enter OTP & New Password' : 'Reset Your Password') : 'Welcome back'}
            </p>
          </div>

          {!forgotMode ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" required placeholder="Email or Username"
                  value={form.emailOrUsername} onChange={e => setForm({...form, emailOrUsername: e.target.value})}
                  className="w-full input-glass rounded-2xl pl-12 pr-4 py-4 font-body" />
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} required placeholder="Password"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full input-glass rounded-2xl pl-12 pr-12 py-4 font-body" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  {showPass ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setForgotMode(true)}
                  className="text-sm text-brand-gold hover:text-brand-gold-light font-body transition-colors">
                  Forgot password?
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-gold py-4 rounded-2xl font-body font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" />
                ) : <>Sign In <FiArrowRight className="w-5 h-5" /></>}
              </button>
              <p className="text-center text-gray-400 text-sm font-body mt-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-gold hover:text-brand-gold-light transition-colors font-semibold">
                  Register Free
                </Link>
              </p>
            </form>
          ) : !otpMode ? (
            /* FORGOT */
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" required placeholder="Your registered email"
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  className="w-full input-glass rounded-2xl pl-12 pr-4 py-4 font-body" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-gold py-4 rounded-2xl font-body font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" /> : 'Send OTP'}
              </button>
              <button type="button" onClick={() => setForgotMode(false)}
                className="w-full text-gray-400 text-sm font-body hover:text-white transition-colors py-2">
                ← Back to Login
              </button>
            </form>
          ) : (
            /* OTP RESET */
            <form onSubmit={handleReset} className="space-y-4">
              <input type="text" required placeholder="Enter 6-digit OTP" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value)}
                className="w-full input-glass rounded-2xl px-4 py-4 font-body text-center text-2xl tracking-[0.5em]" />
              <input type="password" required placeholder="New Password (min 8 chars)" minLength={8}
                value={newPass} onChange={e => setNewPass(e.target.value)}
                className="w-full input-glass rounded-2xl px-4 py-4 font-body" />
              <button type="submit" disabled={loading}
                className="w-full btn-gold py-4 rounded-2xl font-body font-semibold disabled:opacity-60">
                {loading ? '...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
