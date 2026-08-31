import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedCloudinaryImage from '../OptimizedCloudinaryImage';
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
    <footer className="bg-[#0a0a0a] pt-16 md:pt-24 pb-10 overflow-hidden border-t border-zinc-800 text-white font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-5 md:px-12">

        {/* ── BRAND STATEMENT & NEWSLETTER ── */}
        <div className="mb-14 pb-10 border-b border-zinc-800/80">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <Link to="/">
                <OptimizedCloudinaryImage
                  src="https://res.cloudinary.com/dcjn4y284/image/upload/v1786029668/p3jd3nuet4vkqbfd5qaz.png"
                  alt="Pasoja"
                  preset="logo"
                  className="h-12 md:h-16 object-cover brightness-0 invert mb-4"
                />
              </Link>
              <p className="text-zinc-300 text-[14px] sm:text-sm leading-relaxed max-w-sm font-normal">
                Elevate your daily style with our curated collection of luxury, ethically-crafted apparel and modern silhouettes.
              </p>
            </div>

            {/* Newsletter */}
            <div className="max-w-md w-full">
              <h5 className="text-[14px] uppercase tracking-[0.25em] text-[#b8860b]   mb-3">Join The Inner Circle</h5>
              <div className="flex gap-0">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-400 text-[14px] outline-none focus:border-zinc-400 transition-colors rounded-none"
                />
                <button className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#b8860b] hover:text-white transition-all duration-300 shrink-0 rounded-none cursor-pointer">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN NAVIGATION & CONTACT GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-14">

          {/* Shop */}
          <div>
            <h4 className="text-[14px]   uppercase tracking-[0.25em] text-[#b8860b] mb-5">Shop</h4>
            <ul className="flex flex-col gap-2.5">
              {['New Arrivals', 'Best Sellers', 'Men', 'Women', 'Accessories', 'Sale'].map((item) => (
                <li key={item}>
                  <Link to="/shop" className="text-[14px] sm:text-sm text-zinc-300 hover:text-white transition-colors duration-300 font-medium">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[14px]   uppercase tracking-[0.25em] text-[#b8860b] mb-5">Help</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'My Account', path: '/account' },
                { label: 'Track Order', path: '/track' },
                { label: 'Return Policy', path: '/return-policy' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Contact Us', path: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-[14px] sm:text-sm text-zinc-300 hover:text-white transition-colors duration-300 font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[14px]   uppercase tracking-[0.25em] text-[#b8860b] mb-5">Company</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Our Story', path: '/about' },
                { label: 'Contact', path: '/contact' },
                { label: 'Return Policy', path: '/return-policy' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' }
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-[14px] sm:text-sm text-zinc-300 hover:text-white transition-colors duration-300 font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Clean Single Line Address */}
          <div>
            <h4 className="text-[14px]   uppercase tracking-[0.25em] text-[#b8860b] mb-5">Contact</h4>
            <div className="flex flex-col gap-3.5 mb-6">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#b8860b] flex-shrink-0" />
                <p className="text-[14px] sm:text-sm text-zinc-300 font-medium">Worldwide Online Store (Global Shipping)</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#b8860b] flex-shrink-0" />
                <a href="tel:+918959041514" className="text-[14px] sm:text-sm text-zinc-300 font-mono hover:text-white transition-colors">+91 8959041514</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#b8860b] flex-shrink-0" />
                <a href="mailto:pasoja.help@gmail.com" className="text-[14px] sm:text-sm text-zinc-300 font-medium hover:text-white transition-colors">pasoja.help@gmail.com</a>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-300 hover:text-black hover:bg-white hover:border-white transition-all duration-300 rounded-none"
                >
                  <Icon size={15} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── BENEFITS STRIP ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-y border-zinc-800/80 mb-10">
          {[
            { icon: Truck, title: 'Free Shipping', sub: 'On all orders over ₹1999' },
            { icon: Zap, title: 'Fast Delivery', sub: 'Delivered in 3–5 working days' },
            { icon: RotateCcw, title: 'Easy Returns', sub: '7–10 day hassle-free returns' },
            { icon: ShieldCheck, title: 'Secure Checkout', sub: 'Encrypted payment gateway' },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3.5 p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-none hover:border-zinc-700 transition-colors">
              <div className="p-2.5 border border-zinc-700/60 bg-zinc-800/80 text-[#b8860b] shrink-0">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-[14px]   text-white uppercase tracking-wider mb-0.5">{title}</h4>
                <p className="text-[11px] text-zinc-400 font-light">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── BOTTOM LEGAL & DESIGNED BY CREDIT ── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-5 pt-2">
          <p className="text-zinc-400 text-[14px] tracking-wide text-center md:text-left">
            © {currentYear} Pasoja. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 text-[14px]">
            <Link to="/privacy" className="text-zinc-400 hover:text-white transition-colors font-medium tracking-wide">
              Privacy Policy
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/terms" className="text-zinc-400 hover:text-white transition-colors font-medium tracking-wide">
              Terms of Service
            </Link>
            <span className="text-zinc-700">•</span>
            <Link to="/return-policy" className="text-zinc-400 hover:text-white transition-colors font-medium tracking-wide">
              Return & Refund
            </Link>
            <span className="text-zinc-700">•</span>
            <a
              href="https://www.letskillify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b8860b] hover:underline font-semibold tracking-wide transition-colors"
            >
              Designed by LetSkillify
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
              document.documentElement.scrollTop = 0;
              document.body.scrollTop = 0;
            }}
            className="w-10 h-10 border border-zinc-700 bg-zinc-900 text-zinc-300 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 order-first md:order-last cursor-pointer rounded-none"
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
