import React from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  Zap,
  RotateCcw,
  ChevronUp
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080808] pt-20 lg:pt-28 pb-10 overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── BRAND STATEMENT ── */}
        <div className="mb-16 pb-12 border-b border-white/[0.06]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <Link to="/">
                <img
                  src="https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png"
                  alt="Pasoja"
                  className="h-14 md:h-18 object-contain brightness-0 invert mb-5"
                />
              </Link>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                Elevate your style with our curated collection of premium, ethically-made apparel.
              </p>
            </div>

            {/* Newsletter */}
            <div className="max-w-sm w-full">
              <h5 className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold mb-4">Join The List</h5>
              <div className="flex gap-0">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-white/30 transition-colors"
                />
                <button className="bg-white text-black px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/85 transition-all duration-300 shrink-0">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

          {/* Shop */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25 mb-6">Shop</h4>
            <ul className="flex flex-col gap-3">
              {['New Arrivals', 'Best Sellers', 'Men', 'Women', 'Accessories', 'Sale'].map((item) => (
                <li key={item}>
                  <Link to="/shop" className="text-sm text-white/45 hover:text-white transition-colors duration-300 font-medium">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25 mb-6">Help</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'My Account', path: '/account' },
                { label: 'Track Order', path: '/orders' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Contact Us', path: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm text-white/45 hover:text-white transition-colors duration-300 font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25 mb-6">Company</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Our Story', path: '/about' },
                { label: 'Contact', path: '/contact' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' }
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm text-white/45 hover:text-white transition-colors duration-300 font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25 mb-6">Contact</h4>
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-white/25 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/40 leading-snug">123 Fashion Street, Mumbai 400001</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-white/25 flex-shrink-0" />
                <p className="text-sm text-white/40">+91 98765 43210</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-white/25 flex-shrink-0" />
                <p className="text-sm text-white/40">hello@pasoja.com</p>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/40 transition-all duration-300"
                >
                  <Icon size={15} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── BENEFITS STRIP ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-10 border-y border-white/[0.06] mb-10">
          {[
            { icon: Truck, title: 'Free Shipping', sub: 'On all orders over ₹1999' },
            { icon: Zap, title: 'Fast Delivery', sub: 'Delivered in 3–5 working days' },
            { icon: RotateCcw, title: 'Easy Returns', sub: '30-day hassle-free returns' },
            { icon: ShieldCheck, title: 'Secure Checkout', sub: 'Encrypted payment gateway' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-start gap-3 p-3">
              <div className="p-2 border border-white/10 text-white/30 shrink-0">
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-white/70 mb-0.5">{title}</h4>
                <p className="text-[11px] text-white/30">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-5">
          <p className="text-white/25 text-[11px] tracking-wide text-center md:text-left">
            © {currentYear} Pasoja. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-[11px]">
            <Link to="/privacy" className="text-white/25 hover:text-white transition-colors font-medium tracking-wide">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/25 hover:text-white transition-colors font-medium tracking-wide">
              Terms of Service
            </Link>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 border border-white/15 text-white/40 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 order-first md:order-last"
            aria-label="Scroll to top"
          >
            <ChevronUp size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
