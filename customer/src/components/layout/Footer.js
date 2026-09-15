import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  FaLinkedinIn, FaGithub, FaTwitter, FaInstagram, FaFacebookF,
  FaApple, FaGooglePlay, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt,
  FaClock, FaRobot, FaCheck, FaArrowRight, FaPaperPlane,
  FaHeart,
} from 'react-icons/fa';
import { useApp } from '../../context/AppContext';

const productLinks = [
  { label: 'Home', to: '/' },
  { label: 'Find Parking', to: '/find-parking' },
  { label: 'Live Availability', to: '/find-parking' },
  { label: 'AI Parking Suggestions', to: '/find-parking' },
  { label: 'Smart Reservations', to: '/my-bookings' },
  { label: 'Parking History', to: '/my-bookings' },
  { label: 'Profile', to: '/profile' },
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Features', to: '/' },
  { label: 'Pricing', to: '/' },
  { label: 'Contact', to: '/contact' },
  { label: 'Careers', to: '/about' },
  { label: 'Blog', to: '/' },
  { label: 'Press', to: '/about' },
  { label: 'Partners', to: '/about' },
];

const supportLinks = [
  { label: 'Help Center', to: '/faq' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Report Issue', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const contactCards = [
  { icon: FaEnvelope, label: 'support@spotiq.com', gradient: 'from-[#bf8a2e] to-[#e7c588]' },
  { icon: FaPhoneAlt, label: '+91 XXXXX XXXXX', gradient: 'from-[#0a0a0b] to-[#e7c588]' },
  { icon: FaMapMarkerAlt, label: 'Ahmedabad, Gujarat, India', gradient: 'from-[#0a0a0b] to-[#e7c588]' },
  { icon: FaClock, label: '24\u00d77 Support', gradient: 'from-[#bf8a2e] to-[#e7c588]' },
];

const trustItems = [
  'Secure Payments',
  'AI Recommendations',
  'Real-time Availability',
  'Trusted by 10,000+ Drivers',
];

const stats = [
  { end: 50, suffix: 'K+', label: 'Bookings' },
  { end: 10, suffix: 'K+', label: 'Users' },
  { end: 500, suffix: '+', label: 'Parking Locations' },
  { end: 99.9, suffix: '%', label: 'Uptime', isDecimal: true },
];

const socialLinks = [
  { icon: FaLinkedinIn, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: FaGithub, label: 'GitHub', href: 'https://github.com' },
  { icon: FaTwitter, label: 'X (Twitter)', href: 'https://twitter.com' },
  { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: FaFacebookF, label: 'Facebook', href: 'https://facebook.com' },
];

const bottomLinks = [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Cookies', to: '/privacy' },
  { label: 'Sitemap', to: '/' },
  { label: 'Accessibility', to: '/' },
];

function AnimatedCounter({ end, suffix = '', isDecimal = false }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end, isDecimal]);

  return (
    <span ref={ref} className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#e7c588] via-[#f3e0ae] to-[#bf8a2e] bg-clip-text text-transparent">
      {isDecimal ? count.toFixed(1) : count}{suffix}
    </span>
  );
}

function LinkColumn({ title, links, delay }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {title && (
        <button
          className="lg:cursor-default flex items-center justify-between w-full lg:mb-5"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#e7c588]">{title}</h4>
          <span className="lg:hidden text-[#e7c588] text-xs">{isMobileOpen ? '\u2212' : '+'}</span>
        </button>
      )}
      <ul className={`space-y-3 mt-4 lg:mt-0 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
        {links.map((link, i) => (
          <motion.li
            key={link.label}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + i * 0.04 }}
          >
            <Link
              to={link.to}
              className="group flex items-center gap-2 text-[13px] text-[#f9f0d7]/70 hover:text-[#e7c588] transition-colors duration-300"
            >
              <span className="w-0 h-[1px] bg-[#e7c588] group-hover:w-3 transition-all duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
              <FaArrowRight className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[10px] text-[#e7c588]" />
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function Footer() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const footerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribeStatus('success');
    setEmail('');
    setTimeout(() => setSubscribeStatus(null), 4000);
  };

  return (
    <footer ref={footerRef} onMouseMove={handleMouseMove} className="relative overflow-hidden transition-colors duration-300">
      {/* SVG Wave Separator */}
      <div className="relative w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-[60px] lg:h-[80px]" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="footerWaveGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(231,197,136,0.10)" />
              <stop offset="50%" stopColor="rgba(231,197,136,0.06)" />
              <stop offset="100%" stopColor="rgba(231,197,136,0.10)" />
            </linearGradient>
            <linearGradient id="footerWaveGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(231,197,136,0.14)" />
              <stop offset="50%" stopColor="rgba(231,197,136,0.08)" />
              <stop offset="100%" stopColor="rgba(231,197,136,0.14)" />
            </linearGradient>
          </defs>
          {/* Light mode wave */}
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z"
            fill="url(#footerWaveGradLight)"
            className=""
          />
          <path
            d="M0,50 C360,80 720,20 1080,50 C1260,65 1380,40 1440,50 L1440,80 L0,80 Z"
            fill="#0a0a0b"
            className=""
          />
          {/* Dark mode wave */}
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z"
            fill="url(#footerWaveGradDark)"
            className=""
          />
          <path
            d="M0,50 C360,80 720,20 1080,50 C1260,65 1380,40 1440,50 L1440,80 L0,80 Z"
            fill="#0a0a0b"
            className=""
          />
        </svg>
      </div>

      {/* Main Footer */}
      <div className="bg-[#0a0a0b] relative transition-colors duration-300">
        {/* Floating gold orbs */}
        <div
          className="absolute top-20 left-[15%] w-[400px] h-[400px] rounded-full bg-[#e7c588]/[0.05] blur-[120px] pointer-events-none transition-transform duration-[2s] ease-out"
          style={{ transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 20}px)` }}
        />
        <div
          className="absolute bottom-20 right-[10%] w-[350px] h-[350px] rounded-full bg-[#e7c588]/[0.05] blur-[120px] pointer-events-none transition-transform duration-[2s] ease-out"
          style={{ transform: `translate(${(mousePos.x - 0.5) * -15}px, ${(mousePos.y - 0.5) * -15}px)` }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#e7c588]/[0.03] blur-[150px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 lg:pt-20 pb-10">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-14"
          >
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#e7c588] via-[#f3e0ae] to-[#bf8a2e] rounded-full opacity-60 group-hover:opacity-100 blur-[1px] group-hover:blur-[3px] transition-all duration-500" />
              <div className="relative flex items-center gap-2.5 px-6 py-2.5 bg-[#121214] rounded-full border border-[#e7c588]/30 transition-colors duration-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e7c588] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e7c588]" />
                </span>
                <FaRobot className="text-[#e7c588] text-sm" />
                <span className="text-sm font-semibold bg-gradient-to-r from-[#e7c588] via-[#f3e0ae] to-[#bf8a2e] bg-clip-text text-transparent">
                  AI Powered Parking
                </span>
              </div>
            </div>
          </motion.div>

          {/* Top Section — Brand + Links */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-4"
            >
              <Link to="/" className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#0a0a0b] flex items-center justify-center shadow-lg ring-1 ring-[#e7c588]/40 overflow-hidden">
                  <img src="/logoSpotIQ.png" alt="SpotIQ" className="w-10 h-10 object-contain" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-[#f9f0d7]">
                  Spot<span className="text-[#e7c588]">IQ</span>
                </span>
              </Link>

              <p className="text-sm text-[#f9f0d7]/70 leading-relaxed mb-7 max-w-[320px] transition-colors duration-300">
                Smart AI-powered parking platform helping drivers discover, reserve and pay for parking effortlessly.
              </p>

              {/* App Store Buttons */}
              <div className="flex gap-3 mb-7">
                {[{ icon: FaApple, store: 'App Store', label: 'Download on the' },
                  { icon: FaGooglePlay, store: 'Google Play', label: 'Get it on' }].map((btn) => (
                  <button
                    key={btn.store}
                    className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#121214] border border-[#e7c588]/25 hover:bg-[#1c1c1f] hover:border-[#e7c588]/50 transition-all duration-300"
                  >
                    <btn.icon className="text-lg text-[#e7c588] group-hover:text-[#f3e0ae] transition-colors" />
                    <div className="text-left">
                      <p className="text-[9px] text-[#f9f0d7]/60 leading-none">{btn.label}</p>
                      <p className="text-[11px] font-semibold text-[#f9f0d7] leading-tight mt-0.5">{btn.store}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Social Icons */}
              <div className="flex gap-2.5">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group w-10 h-10 rounded-xl bg-[#121214] border border-[#e7c588]/25 flex items-center justify-center text-[#f9f0d7]/70 hover:text-[#e7c588] hover:bg-[#1c1c1f] hover:border-[#e7c588]/60 hover:scale-110 hover:-rotate-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#e7c588]/20"
                  >
                    <s.icon className="text-sm group-hover:scale-110 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Link Columns */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-6">
              <LinkColumn title="Product" links={productLinks} delay={0.1} />
              <LinkColumn title="Company" links={companyLinks} delay={0.2} />
              <LinkColumn title="Support" links={supportLinks} delay={0.3} />
            </div>
          </div>

          {/* Contact + Newsletter Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Contact Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#e7c588] mb-5 transition-colors duration-300">Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contactCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#0a0a0b] border border-[#e7c588]/25 hover:bg-[#121214] hover:border-[#e7c588]/50 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-lg hover:shadow-[#e7c588]/10"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon className="text-black text-sm" />
                    </div>
                    <span className="text-[13px] text-[#f9f0d7]/80 group-hover:text-[#f9f0d7] transition-colors leading-tight">{card.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#e7c588] mb-5 transition-colors duration-300">Stay Updated</h4>
              <div className="p-5 rounded-2xl bg-[#121214] border border-[#e7c588]/25 transition-colors duration-300">
                <p className="text-sm text-[#f9f0d7]/70 mb-4 leading-relaxed transition-colors duration-300">
                  Receive parking tips, product updates and exclusive offers.
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <div className="relative flex-1">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/60 text-sm transition-colors duration-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0b] border border-[#e7c588]/25 text-[#f9f0d7] placeholder-[#f9f0d7]/40 text-sm focus:outline-none focus:border-[#e7c588] transition-all duration-300"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-[#e7c588] text-black text-sm font-bold hover:bg-[#f3e0ae] hover:shadow-lg hover:shadow-[#e7c588]/25 active:scale-95 transition-all duration-300 flex items-center gap-2"
                  >
                    <FaPaperPlane className="text-xs" />
                    <span className="hidden sm:inline">Subscribe</span>
                  </button>
                </form>
                <AnimatePresence>
                  {subscribeStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 mt-3 text-[#e7c588] text-sm"
                    >
                      <FaCheck className="text-xs" />
                      Subscribed successfully!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16"
          >
            {trustItems.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#0a0a0b] border border-[#e7c588]/25 text-center transition-colors duration-300"
              >
                <FaCheck className="text-[#e7c588] text-[10px] flex-shrink-0" />
                <span className="text-[12px] text-[#f9f0d7]/80 font-medium transition-colors duration-300">{item}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 py-10 rounded-2xl bg-[#121214] border border-[#e7c588]/25 transition-colors duration-300"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <AnimatedCounter end={stat.end} suffix={stat.suffix} isDecimal={stat.isDecimal} />
                <p className="text-xs text-[#f9f0d7]/60 mt-1.5 uppercase tracking-wider font-medium transition-colors duration-300">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Bottom Bar */}
          <div className="border-t border-[#e7c588]/25 pt-8 flex flex-col lg:flex-row items-center justify-between gap-5 transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-sm text-[#f9f0d7]/60 transition-colors duration-300">
              <span>\u00a9 2026 SpotIQ. Made with</span>
              <FaHeart className="text-[#e7c588] text-xs animate-pulse" />
              <span>in India</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {bottomLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[12px] text-[#f9f0d7]/50 hover:text-[#e7c588] hover:translate-y-[-1px] transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
