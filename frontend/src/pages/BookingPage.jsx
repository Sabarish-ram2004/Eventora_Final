import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiUsers, FiMapPin, FiFileText, FiCheck, FiArrowLeft } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'
import { vendorAPI, bookingAPI } from '../services/api'
import toast from 'react-hot-toast'

const OCCASIONS = ['WEDDING','BIRTHDAY','CORPORATE','ANNIVERSARY','BABY_SHOWER','GRADUATION','FESTIVAL','OTHER']

export default function BookingPage() {
  const { vendorId } = useParams()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [form, setForm] = useState({
    eventDate: '', eventTime: '', occasion: '', guestCount: '',
    venueAddress: '', specialRequirements: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    vendorAPI.getVendor(vendorId).then(setVendor).catch(() => toast.error('Vendor not found'))
  }, [vendorId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.eventDate) { toast.error('Please select event date'); return }
    setLoading(true)
    try {
      const res = await bookingAPI.create({
        vendorId,
        category: vendor.category,
        ...form,
        guestCount: form.guestCount ? parseInt(form.guestCount) : null,
      })
      setSuccess(res)
      toast.success('Booking request sent! 🎉')
    } catch (err) {
      toast.error(err?.message || 'Booking failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-3xl p-10 border border-brand-gold/20 text-center max-w-md shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mx-auto mb-6">
          <FiCheck className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="font-display font-bold text-3xl text-white mb-3">Booking Requested!</h2>
        <p className="text-gray-400 font-body mb-2">Your request has been sent to <span className="text-brand-gold">{vendor?.businessName}</span></p>
        <div className="glass-gold rounded-2xl p-4 my-6">
          <p className="text-gray-400 text-sm font-body">Booking Reference</p>
          <p className="text-brand-gold font-display font-bold text-2xl tracking-wider">{success.bookingReference}</p>
          <p className="text-gray-500 text-xs font-body mt-1">Status: {success.status}</p>
        </div>
        <p className="text-gray-500 text-sm font-body mb-8">The vendor will confirm or respond within 24 hours.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard')} className="flex-1 btn-gold py-3 rounded-xl font-body">My Bookings</button>
          <button onClick={() => navigate('/vendors')} className="flex-1 btn-outline-gold py-3 rounded-xl font-body">Browse More</button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-body mb-6 transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <HiSparkles className="w-5 h-5 text-brand-gold" />
            <span className="text-brand-gold text-sm font-body">Booking Request</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            Book {vendor?.businessName || '...'}
          </h1>
          {vendor && (
            <p className="text-gray-400 font-body mt-1">{vendor.city} · {vendor.category.replace('_',' ')}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="glass-dark rounded-3xl p-6 border border-brand-gold/10 space-y-5">
            <h3 className="font-display font-semibold text-white text-lg">Event Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm font-body block mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1 text-brand-gold" />Event Date *
                </label>
                <input type="date" required value={form.eventDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, eventDate: e.target.value})}
                  className="w-full input-glass rounded-2xl px-4 py-3 font-body text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-body block mb-2">Event Time</label>
                <input type="time" value={form.eventTime}
                  onChange={e => setForm({...form, eventTime: e.target.value})}
                  className="w-full input-glass rounded-2xl px-4 py-3 font-body text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm font-body block mb-2">Occasion</label>
                <select value={form.occasion} onChange={e => setForm({...form, occasion: e.target.value})}
                  className="w-full input-glass rounded-2xl px-4 py-3 font-body text-white bg-transparent">
                  <option value="">Select Occasion</option>
                  {OCCASIONS.map(o => <option key={o} value={o} className="bg-brand-navy">{o.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm font-body block mb-2">
                  <FiUsers className="inline w-4 h-4 mr-1 text-brand-gold" />Guest Count
                </label>
                <input type="number" min="1" placeholder="e.g. 150" value={form.guestCount}
                  onChange={e => setForm({...form, guestCount: e.target.value})}
                  className="w-full input-glass rounded-2xl px-4 py-3 font-body" />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm font-body block mb-2">
                <FiMapPin className="inline w-4 h-4 mr-1 text-brand-gold" />Venue Address
              </label>
              <input type="text" placeholder="Event venue address" value={form.venueAddress}
                onChange={e => setForm({...form, venueAddress: e.target.value})}
                className="w-full input-glass rounded-2xl px-4 py-3 font-body" />
            </div>

            <div>
              <label className="text-gray-400 text-sm font-body block mb-2">
                <FiFileText className="inline w-4 h-4 mr-1 text-brand-gold" />Special Requirements
              </label>
              <textarea rows={4} placeholder="Any special requests, dietary needs, themes, etc."
                value={form.specialRequirements}
                onChange={e => setForm({...form, specialRequirements: e.target.value})}
                className="w-full input-glass rounded-2xl px-4 py-3 font-body resize-none" />
            </div>
          </div>

          {/* Info Box */}
          <div className="glass-gold rounded-2xl p-4 flex gap-3">
            <HiSparkles className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-body font-semibold mb-1">How It Works</p>
              <p className="text-gray-400 text-xs font-body">
                Your booking request is sent to the vendor. They will confirm, waitlist, or suggest alternatives within 24 hours. You won't be charged until the vendor confirms.
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading || !vendor}
            className="w-full btn-gold py-5 rounded-2xl font-body font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-60">
            {loading ? (
              <><div className="w-6 h-6 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" /> Sending Request...</>
            ) : (
              <><FiCalendar className="w-5 h-5" /> Send Booking Request</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
