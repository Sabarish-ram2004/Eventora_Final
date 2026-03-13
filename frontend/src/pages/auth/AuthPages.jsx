import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight } from 'react-icons/fi';
import { RiSparklingFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export function LoginPage() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.emailOrUsername || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.fullName || data.username}! 🎉`);
      if (data.role === 'ADMIN') navigate('/admin');
      else if (data.role === 'VENDOR') navigate('/vendor-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your Eventora account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          icon={<FiMail />}
          placeholder="Email or username"
          value={form.emailOrUsername}
          onChange={(v) => setForm({ ...form, emailOrUsername: v })}
        />
        <AuthInput
          icon={<FiLock />}
          type={showPwd ? 'text' : 'password'}
          placeholder="Password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          suffix={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-white/40 hover:text-white">
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          }
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-gold-400 text-sm hover:text-gold-300">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
        >
          {loading ? <LoadingDots /> : (<>Sign In <FiArrowRight /></>)}
        </button>
        <p className="text-center text-white/50 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium">
            Join free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', fullName: '', phone: '', role: 'USER',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please verify your email 📧');
      navigate(`/verify-email?email=${form.email}`);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join thousands of event planners on Eventora">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput icon={<FiUser />} placeholder="Username *" value={form.username} onChange={(v) => setForm({...form, username: v})} />
          <AuthInput placeholder="Full Name" value={form.fullName} onChange={(v) => setForm({...form, fullName: v})} />
        </div>
        <AuthInput icon={<FiMail />} type="email" placeholder="Email *" value={form.email} onChange={(v) => setForm({...form, email: v})} />
        <AuthInput
          icon={<FiLock />}
          type={showPwd ? 'text' : 'password'}
          placeholder="Password (min 8 chars) *"
          value={form.password}
          onChange={(v) => setForm({...form, password: v})}
          suffix={<button type="button" onClick={() => setShowPwd(!showPwd)} className="text-white/40 hover:text-white">{showPwd ? <FiEyeOff /> : <FiEye />}</button>}
        />
        <AuthInput placeholder="Phone (optional)" value={form.phone} onChange={(v) => setForm({...form, phone: v})} />

        {/* Role Selection */}
        <div>
          <p className="text-white/60 text-sm mb-3">I want to join as:</p>
          <div className="grid grid-cols-2 gap-3">
            {['USER', 'VENDOR'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({...form, role})}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  form.role === role ? 'btn-gold' : 'glass text-white/60 hover:text-white'
                }`}
              >
                {role === 'USER' ? '🎊 Event Planner' : '🏢 Vendor / Business'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
        >
          {loading ? <LoadingDots /> : (<>Create Account <FiArrowRight /></>)}
        </button>
        <p className="text-center text-white/50 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// ====================== Shared Components ======================
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-gradient-royal" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-display text-4xl font-bold text-gold-gradient tracking-wider">EVENTORA</span>
          </Link>
        </div>

        <div className="glass rounded-3xl p-8 border border-gold-500/20 shadow-card">
          <div className="text-center mb-8">
            <RiSparklingFill className="text-gold-400 text-2xl mx-auto mb-3 animate-glow" />
            <h1 className="font-display text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-white/50 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function AuthInput({ icon, type = 'text', placeholder, value, onChange, suffix }) {
  return (
    <div className="flex items-center gap-3 input-glass rounded-xl px-4 py-3">
      {icon && <span className="text-gold-400/70 shrink-0">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-glass w-full bg-transparent border-none py-0 text-sm"
      />
      {suffix}
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-royal-blue-950 rounded-full"
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

export default LoginPage;
