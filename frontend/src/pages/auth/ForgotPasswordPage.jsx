import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { RiSparklingFill } from 'react-icons/ri';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Password reset OTP sent!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-royal" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><span className="font-display text-4xl font-bold text-gold-gradient">EVENTORA</span></Link>
        </div>
        <div className="glass rounded-3xl p-8 border border-gold-500/20">
          <div className="text-center mb-8">
            <RiSparklingFill className="text-gold-400 text-3xl mx-auto mb-3 animate-glow" />
            <h2 className="font-display text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-white/50 text-sm">Enter your email to receive a reset OTP</p>
          </div>
          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <p className="text-white/70 mb-6">Check your email for the OTP. Use it to reset your password.</p>
              <Link to="/login" className="btn-gold block w-full py-3 rounded-xl text-center font-semibold">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 input-glass rounded-xl px-4 py-3">
                <FiMail className="text-gold-400/70 shrink-0" />
                <input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass w-full bg-transparent border-none py-0 text-sm" />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                {loading ? 'Sending...' : (<>Send Reset OTP <FiArrowRight /></>)}
              </button>
              <p className="text-center text-white/50 text-sm"><Link to="/login" className="text-gold-400 hover:text-gold-300">Back to login</Link></p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
