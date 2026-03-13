import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { RiSparklingFill } from 'react-icons/ri';

// ====================== COUNTER SECTION ======================
export function CounterSection() {
  const counters = [
    { value: 5000, suffix: '+', label: 'Verified Vendors', icon: '🏆' },
    { value: 50000, suffix: '+', label: 'Events Managed', icon: '🎊' },
    { value: 1000, suffix: '+', label: 'Cities Covered', icon: '🌆' },
    { value: 4.9, suffix: '★', label: 'Avg Rating', icon: '⭐', decimal: true },
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 border border-gold-500/20">
          {counters.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-2">{c.icon}</div>
              <div className="font-display text-4xl font-bold text-gold-gradient">
                {inView ? <CountUp end={c.value} decimal={c.decimal} suffix={c.suffix} /> : '0'}
              </div>
              <div className="text-white/50 text-sm mt-1">{c.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ end, decimal, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [end]);

  return <span>{decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}</span>;
}

// ====================== BUDGET CALCULATOR ======================
export function BudgetCalculator() {
  const [guests, setGuests] = useState(100);
  const [occasion, setOccasion] = useState('wedding');
  const [tier, setTier] = useState('mid');
  const [breakdown, setBreakdown] = useState(null);

  const PRICES = {
    wedding: {
      budget: { hall: 40000, catering: 25000, decoration: 20000, photography: 15000, music: 10000, beauty: 8000 },
      mid: { hall: 90000, catering: 70000, decoration: 50000, photography: 35000, music: 20000, beauty: 15000 },
      premium: { hall: 250000, catering: 150000, decoration: 150000, photography: 80000, music: 60000, beauty: 30000 },
    },
    birthday: {
      budget: { hall: 15000, catering: 10000, decoration: 8000, photography: 8000, music: 5000, beauty: 3000 },
      mid: { hall: 35000, catering: 25000, decoration: 20000, photography: 20000, music: 15000, beauty: 8000 },
      premium: { hall: 80000, catering: 60000, decoration: 50000, photography: 40000, music: 30000, beauty: 15000 },
    },
    corporate: {
      budget: { hall: 30000, catering: 20000, decoration: 10000, photography: 10000, music: 8000, beauty: 0 },
      mid: { hall: 70000, catering: 50000, decoration: 25000, photography: 25000, music: 20000, beauty: 0 },
      premium: { hall: 200000, catering: 120000, decoration: 60000, photography: 50000, music: 40000, beauty: 0 },
    },
  };

  const calculate = () => {
    const base = PRICES[occasion][tier];
    const guestMultiplier = guests / 100;
    const adjusted = {};
    let total = 0;
    Object.entries(base).forEach(([k, v]) => {
      const val = Math.round(v * (k === 'catering' ? guestMultiplier : 1));
      adjusted[k] = val;
      total += val;
    });
    setBreakdown({ items: adjusted, total });
  };

  const icons = { hall: '🏛️', catering: '🍽️', decoration: '✨', photography: '📸', music: '🎵', beauty: '💄' };

  return (
    <div className="glass rounded-3xl p-8 border border-gold-500/20">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">💰</span>
        <div>
          <h3 className="text-white font-bold text-xl">Budget Calculator</h3>
          <p className="text-white/50 text-sm">AI-powered cost estimation</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-gold-400 text-sm font-medium mb-2">Guest Count</label>
          <div className="space-y-2">
            <input
              type="range" min="20" max="2000" step="10"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-white/50 text-xs">
              <span>20</span>
              <span className="text-gold-400 font-bold">{guests} guests</span>
              <span>2000</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gold-400 text-sm font-medium mb-2">Occasion</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="input-glass w-full rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="wedding">Wedding / Marriage</option>
            <option value="birthday">Birthday Party</option>
            <option value="corporate">Corporate Event</option>
          </select>
        </div>

        <div>
          <label className="block text-gold-400 text-sm font-medium mb-2">Budget Tier</label>
          <div className="flex gap-2">
            {[['budget', '💚'], ['mid', '💛'], ['premium', '❤️']].map(([t, emoji]) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tier === t ? 'btn-gold' : 'glass text-white/60 hover:text-white'
                }`}
              >
                {emoji} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={calculate} className="btn-gold w-full py-3 rounded-xl font-semibold mb-6">
        Calculate My Budget ✨
      </button>

      {breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-gold-500/20"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {Object.entries(breakdown.items).map(([key, val]) => val > 0 && (
              <div key={key} className="bg-white/5 rounded-xl p-3">
                <div className="text-xl mb-1">{icons[key]}</div>
                <div className="text-white/50 text-xs capitalize">{key}</div>
                <div className="text-white font-semibold text-sm">₹{val.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gold-500/20">
            <span className="text-white font-bold text-lg">Estimated Total</span>
            <span className="text-gold-gradient font-display text-3xl font-bold">
              ₹{breakdown.total.toLocaleString()}
            </span>
          </div>
          <p className="text-white/30 text-xs mt-2">
            * Estimates vary by location and vendor. Get exact quotes from vendors on Eventora.
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ====================== VENDOR COMPARISON ======================
export function VendorComparison() {
  const features = [
    { label: 'AI Ranking Score', key: 'score' },
    { label: 'Avg Rating', key: 'rating' },
    { label: 'Response Time', key: 'response' },
    { label: 'Starting Price', key: 'price' },
    { label: 'Total Bookings', key: 'bookings' },
    { label: 'Profile Complete', key: 'complete' },
  ];

  const mockVendors = [
    { name: 'Grand Palace', score: 92, rating: '4.9 ★', response: '< 1 hr', price: '₹80K', bookings: 245, complete: '98%', recommended: true },
    { name: 'Royal Events', score: 85, rating: '4.7 ★', response: '2-4 hrs', price: '₹60K', bookings: 180, complete: '90%', recommended: false },
    { name: 'Dream Makers', score: 78, rating: '4.5 ★', response: '4-8 hrs', price: '₹45K', bookings: 120, complete: '82%', recommended: false },
  ];

  return (
    <div className="glass rounded-3xl p-8 border border-gold-500/20 overflow-x-auto">
      <h3 className="text-white font-bold text-xl mb-6">⚖️ Vendor Comparison Engine</h3>
      <table className="w-full min-w-[500px]">
        <thead>
          <tr>
            <th className="text-white/50 text-sm text-left pb-4 pr-4">Feature</th>
            {mockVendors.map((v, i) => (
              <th key={i} className="text-center pb-4 px-4">
                <div className={`rounded-xl p-3 ${v.recommended ? 'bg-gradient-gold text-royal-blue-950' : 'glass text-white'}`}>
                  <div className="font-bold text-sm">{v.name}</div>
                  {v.recommended && <div className="text-xs opacity-70 flex items-center justify-center gap-1 mt-1"><RiSparklingFill /> AI Choice</div>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={i} className="border-t border-white/5">
              <td className="py-3 pr-4 text-white/50 text-sm">{f.label}</td>
              {mockVendors.map((v, j) => (
                <td key={j} className="py-3 px-4 text-center">
                  <span className={`text-sm font-semibold ${j === 0 ? 'text-gold-400' : 'text-white/70'}`}>
                    {v[f.key]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ====================== SMART EVENT PLANNER ======================
export function SmartEventPlanner() {
  const [formData, setFormData] = useState({ occasion: 'wedding', date: '', guests: '', city: '' });
  const [plan, setPlan] = useState(null);

  const PLANS = {
    wedding: [
      { phase: '6+ Months', tasks: ['Book venue/hall', 'Finalize catering', 'Book photographer'], urgent: true },
      { phase: '3-4 Months', tasks: ['Book decoration', 'Order outfits from tailor', 'Book DJ/band'] },
      { phase: '1-2 Months', tasks: ['Book beautician', 'Arrange transport', 'Print invitations'] },
      { phase: '1 Week', tasks: ['Final vendor confirmations', 'Guest list finalization', 'Rehearsal'] },
    ],
    birthday: [
      { phase: '1 Month', tasks: ['Book venue', 'Plan theme & decor', 'Send invitations'], urgent: true },
      { phase: '2 Weeks', tasks: ['Order cake', 'Book photographer', 'Confirm catering'] },
      { phase: '1 Week', tasks: ['Buy party supplies', 'Confirm RSVPs', 'Plan entertainment'] },
    ],
    corporate: [
      { phase: '2+ Months', tasks: ['Book conference venue', 'Plan AV requirements', 'Arrange catering'], urgent: true },
      { phase: '1 Month', tasks: ['Send invitations', 'Book transport', 'Confirm speakers'] },
      { phase: '1 Week', tasks: ['Tech rehearsal', 'Coordinate with vendors', 'Prepare agenda'] },
    ],
  };

  const generate = () => setPlan(PLANS[formData.occasion]);

  return (
    <div className="glass rounded-3xl p-8 border border-gold-500/20">
      <h3 className="text-white font-bold text-xl mb-6">📋 Smart Event Planner</h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gold-400 text-sm font-medium mb-2">Occasion</label>
          <select
            value={formData.occasion}
            onChange={(e) => setFormData({...formData, occasion: e.target.value})}
            className="input-glass w-full rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="corporate">Corporate Event</option>
          </select>
        </div>
        <div>
          <label className="block text-gold-400 text-sm font-medium mb-2">Event Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="input-glass w-full rounded-xl px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-gold-400 text-sm font-medium mb-2">Guest Count</label>
          <input
            type="number"
            placeholder="e.g. 200"
            value={formData.guests}
            onChange={(e) => setFormData({...formData, guests: e.target.value})}
            className="input-glass w-full rounded-xl px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-gold-400 text-sm font-medium mb-2">City</label>
          <input
            type="text"
            placeholder="e.g. Mumbai"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="input-glass w-full rounded-xl px-4 py-2.5 text-sm"
          />
        </div>
      </div>
      <button onClick={generate} className="btn-gold w-full py-3 rounded-xl font-semibold mb-6">
        Generate My Event Plan ✨
      </button>
      {plan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {plan.map((phase, i) => (
            <div key={i} className={`rounded-2xl p-4 ${phase.urgent ? 'border border-gold-500/40 bg-gold-500/5' : 'glass'}`}>
              <div className={`text-sm font-bold mb-3 ${phase.urgent ? 'text-gold-400' : 'text-white'}`}>
                📅 {phase.phase} Before
                {phase.urgent && <span className="ml-2 text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full">Critical</span>}
              </div>
              <ul className="space-y-2">
                {phase.tasks.map((task, j) => (
                  <li key={j} className="flex items-center gap-2 text-white/70 text-sm">
                    <FiCheck className="text-green-400 shrink-0" size={14} /> {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ====================== TESTIMONIALS ======================
export function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);
  const testimonials = [
    { name: 'Priya & Rahul', occasion: 'Wedding, Mumbai', rating: 5, text: 'Eventora made our wedding planning so seamless! Found the perfect hall, caterer, and photographer all in one place. The AI recommendations were spot on!', avatar: '👰' },
    { name: 'Anjali Sharma', occasion: 'Birthday, Delhi', rating: 5, text: 'Booked 3 vendors through Eventora for my daughter\'s birthday. The vendor comparison tool saved us hours of research. Highly recommend!', avatar: '🎂' },
    { name: 'TechCorp Events', occasion: 'Corporate, Bangalore', rating: 4, text: 'Professional platform with genuine vendor reviews. The budget calculator helped us plan a 500-person conference within budget.', avatar: '🏢' },
    { name: 'Meera Nair', occasion: 'Wedding, Chennai', rating: 5, text: 'The AI chatbot helped me create a complete wedding timeline in minutes. Found vendors I never would have discovered otherwise!', avatar: '💍' },
  ];

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="glass rounded-3xl p-8 max-w-2xl mx-auto border border-white/10"
        >
          <div className="text-5xl mb-4 text-center">{testimonials[current].avatar}</div>
          <div className="flex justify-center mb-4">
            {Array.from({ length: testimonials[current].rating }, (_, i) => (
              <span key={i} className="text-gold-400 text-lg">★</span>
            ))}
          </div>
          <p className="text-white/80 text-center italic text-lg leading-relaxed mb-6">
            "{testimonials[current].text}"
          </p>
          <div className="text-center">
            <div className="text-white font-semibold">{testimonials[current].name}</div>
            <div className="text-white/40 text-sm">{testimonials[current].occasion}</div>
          </div>
        </motion.div>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-gold-400 w-6' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default CounterSection;
