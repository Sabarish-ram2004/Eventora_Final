import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { RiSparklingFill } from 'react-icons/ri';

export default function LoginReminderPopup({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[380px] max-w-[calc(100vw-32px)] glass rounded-3xl p-8 border border-gold-500/40 shadow-gold-glow"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <FiX size={20} />
            </button>
            <div className="text-center">
              <RiSparklingFill className="text-gold-400 text-4xl mx-auto mb-4 animate-glow" />
              <h3 className="font-display text-2xl font-bold text-gold-gradient mb-2">
                Join Eventora Free!
              </h3>
              <p className="text-white/60 text-sm mb-6">
                Save vendors to wishlist, track bookings, and get personalized AI recommendations.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex-1 btn-gold py-3 rounded-xl text-sm font-semibold"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex-1 glass py-3 rounded-xl text-sm text-white/80 hover:text-white text-center transition-all"
                >
                  Login
                </Link>
              </div>
              <button onClick={onClose} className="text-white/30 text-xs mt-4 hover:text-white/60">
                Continue browsing
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
