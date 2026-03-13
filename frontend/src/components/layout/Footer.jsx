import { Link } from 'react-router-dom'
import { HiSparkles } from 'react-icons/hi'
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Footer() {
  const services = [
    { name: 'Event Halls', path: '/vendors?category=HALL' },
    { name: 'Catering', path: '/vendors?category=CATERING' },
    { name: 'Decoration', path: '/vendors?category=DECORATION' },
    { name: 'Photography', path: '/vendors?category=PHOTOGRAPHY' },
    { name: 'DJ & Music', path: '/vendors?category=DJ_MUSIC' },
    { name: 'Transport', path: '/vendors?category=TRANSPORT' },
    { name: 'Beautician', path: '/vendors?category=BEAUTICIAN' },
    { name: 'Tailor', path: '/vendors?category=TAILOR' },
  ]

  return (
    <footer className="relative border-t border-brand-gold/10 mt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy to-black/90 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-gold to-brand-purple flex items-center justify-center">
                <HiSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl gradient-text tracking-wider">EVENTORA</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed font-body mb-6">
              India's premier AI-powered event management platform connecting you with the best vendors for every occasion.
            </p>
            <div className="flex gap-3">
              {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold/30 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              {services.map(s => (
                <li key={s.name}>
                  <Link to={s.path} className="text-gray-400 hover:text-brand-gold text-sm transition-colors font-body">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us','Blog','Careers','Press Kit','Partner With Us','Vendor Registration','Privacy Policy','Terms of Service'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-brand-gold text-sm transition-colors font-body">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              {[
                { icon: FiMail, text: 'support@eventora.com' },
                { icon: FiPhone, text: '+91 98765 43210' },
                { icon: FiMapPin, text: 'Mumbai, Maharashtra, India' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-gray-400 text-sm font-body">
                  <Icon className="w-4 h-4 text-brand-gold flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 glass-gold rounded-xl">
              <p className="text-xs text-gray-400 font-body mb-2">Subscribe to updates</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email"
                  className="flex-1 input-glass rounded-lg px-3 py-2 text-xs font-body" />
                <button className="btn-gold px-3 py-2 rounded-lg text-xs font-body">Go</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm font-body">© 2024 Eventora. All rights reserved. Built with ❤️ in India.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-500 text-xs font-body">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
