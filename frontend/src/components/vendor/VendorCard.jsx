import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin, FiStar, FiExternalLink } from 'react-icons/fi';
import { RiSparklingFill } from 'react-icons/ri';
import { vendorApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function VendorCard({ vendor, aiRecommended = false }) {
  const [wishlisted, setWishlisted] = useState(vendor.wishlisted || false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const coverImage = vendor.coverBanner
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${vendor.coverBanner}`
    : null;

  const logoImage = vendor.brandLogo
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${vendor.brandLogo}`
    : null;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save vendors');
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await vendorApi.toggleWishlist(vendor.id);
      const added = res.data.data.added;
      setWishlisted(added);
      toast.success(added ? '❤️ Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setWishlistLoading(false);
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <FiStar
      key={i}
      className={i < Math.floor(vendor.avgRating || 0) ? 'star-filled fill-gold-500' : 'star-empty'}
      size={12}
    />
  ));

  return (
    <Link to={`/vendor/${vendor.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        className="vendor-card rounded-2xl overflow-hidden group cursor-pointer"
      >
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-royal-blue-800 to-royal-blue-950 overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={vendor.businessName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
              {getCategoryEmoji(vendor.category?.name)}
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* AI Badge */}
          {aiRecommended && (
            <div className="absolute top-3 left-3 ai-badge rounded-full px-2.5 py-1 flex items-center gap-1">
              <RiSparklingFill className="text-gold-400 text-xs" />
              <span className="text-gold-400 text-xs font-semibold">AI Pick</span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center heart-toggle"
          >
            <FiHeart
              className={wishlisted ? 'heart-filled fill-red-500' : 'text-white/70'}
              size={16}
            />
          </button>

          {/* Logo badge */}
          {logoImage && (
            <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full border-2 border-gold-400/50 overflow-hidden">
              <img src={logoImage} alt="logo" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-3 right-3 glass rounded-full px-2 py-0.5 text-xs text-white/80">
            {vendor.category?.name}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-white font-semibold text-sm leading-tight flex-1 mr-2 group-hover:text-gold-400 transition-colors">
              {vendor.businessName}
            </h3>
            <div className="shrink-0 text-right">
              <div className="text-gold-400 text-sm font-bold">
                {vendor.startingPrice ? `₹${(vendor.startingPrice / 1000).toFixed(0)}K+` : 'Quote'}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
            <FiMapPin size={11} />
            <span>{vendor.city}</span>
            {vendor.pincode && <span>• {vendor.pincode}</span>}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">{stars}</div>
            <span className="text-white/70 text-xs font-medium">
              {vendor.avgRating ? Number(vendor.avgRating).toFixed(1) : 'New'}
            </span>
            {vendor.reviewCount > 0 && (
              <span className="text-white/40 text-xs">({vendor.reviewCount})</span>
            )}
          </div>

          {/* AI Score bar */}
          {vendor.aiRankingScore && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/40">AI Score</span>
                <span className="text-gold-400 font-semibold">{Number(vendor.aiRankingScore).toFixed(0)}/100</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${vendor.aiRankingScore}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Map link */}
          {vendor.googleMapsLink && (
            <a
              href={vendor.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-blue-400 text-xs hover:text-blue-300 transition-colors mb-3"
            >
              <FiMapPin size={11} />
              View on Maps <FiExternalLink size={10} />
            </a>
          )}

          <button className="w-full glass rounded-xl py-2.5 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-all border border-gold-500/20 hover:border-gold-500/50">
            View Details
          </button>
        </div>
      </motion.div>
    </Link>
  );
}

function getCategoryEmoji(name) {
  const map = {
    'Hall': '🏛️', 'Catering': '🍽️', 'Decoration': '✨',
    'Photography': '📸', 'DJ / Music': '🎵', 'Transport': '🚗',
    'Beautician': '💄', 'Tailor': '🧵', 'Full Event Handler': '🎊',
  };
  return map[name] || '🎉';
}
