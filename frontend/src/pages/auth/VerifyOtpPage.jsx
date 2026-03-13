import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { RiSparklingFill } from 'react-icons/ri';
import { FiArrowRight } from 'react-icons/fi';

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInput = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Please enter the 6-digit OTP');
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp: code });
      toast.success('Email verified! Please login 🎉');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      await authApi.resendOtp(email);
      toast.success('New OTP sent!');
    } catch (err) { toast.error(err.message); }
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
            <h2 className="font-display text-3xl font-bold text-white mb-2">Verify Email</h2>
            <p className="text-white/50 text-sm">Enter the 6-digit OTP sent to <span className="text-gold-400">{email}</span></p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => e.key === 'Backspace' && !digit && i > 0 && document.getElementById(`otp-${i-1}`)?.focus()}
                  className="w-12 h-14 text-center text-xl font-bold input-glass rounded-xl border-2 border-white/10 focus:border-gold-400/60"
                />
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
              {loading ? 'Verifying...' : (<>Verify OTP <FiArrowRight /></>)}
            </button>
          </form>
          <p className="text-center text-white/40 text-sm mt-4">
            Didn't receive?{' '}
            <button onClick={resend} className="text-gold-400 hover:text-gold-300">Resend OTP</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
