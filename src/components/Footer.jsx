import React from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowUpRight,
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
    <footer className="bg-[#E6D8C3] pt-20 lg:pt-28 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* ================= MAIN FOOTER GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-12 gap-x-8 mb-20">

          {/* BRAND COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-4">
              <img
                src="https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png"
                alt="Pasoja Logo"
                className="h-16 md:h-20 object-contain"
              />
            </Link>
            <p className="text-[#333333]/80 font-poppins text-[15px] leading-relaxed">
              Elevate your style with our curated collection of premium, ethically-made apparel. Crafted with attention to detail and quality.
            </p>
            
            {/* SOCIAL LINKS */}
            <div className="flex gap-3 mt-4">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-11 h-11 rounded-full border border-[#5A2D0C]/20 bg-[#F7F2EA] flex items-center justify-center text-[#5A2D0C] hover:bg-[#A85721] hover:text-[#F7F2EA] hover:border-[#A85721] transition-all duration-300 shadow-sm"
                >
                  <Icon size={18} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {/* SHOP LINKS */}
          <div className="lg:col-span-2">
            <h4 className="text-[13px] font-poppins font-bold uppercase tracking-[0.3em] text-[#A85721] mb-6">
              Shop
            </h4>
            <ul className="flex flex-col gap-2.5">
              {['New Arrivals', 'Best Sellers', 'Men', 'Women', 'Accessories', 'Sale'].map((item) => (
                <li key={item}>
                  <Link to="/shop" className="text-sm font-poppins text-[#5A2D0C]/80 hover:text-[#A85721] transition-colors flex items-center gap-1.5">
                    <span>{item}</span>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* HELP LINKS */}
          <div className="lg:col-span-2">
            <h4 className="text-[13px] font-poppins font-bold uppercase tracking-[0.3em] text-[#A85721] mb-6">
              Help
            </h4>
            <ul className="flex flex-col gap-2.5">
              {['My Account', 'Track Order', 'Shipping Info', 'Returns & Exchanges', 'Size Guide', 'FAQs'].map((item) => (
                <li key={item}>
                  <Link to="/account" className="text-sm font-poppins text-[#5A2D0C]/80 hover:text-[#A85721] transition-colors flex items-center gap-1.5">
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT & NEWSLETTER */}
          <div className="lg:col-span-4">
            <h4 className="text-[13px] font-poppins font-bold uppercase tracking-[0.3em] text-[#A85721] mb-6">
              Get In Touch
            </h4>
            
            <div className="flex flex-col gap-5 mb-8">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#A85721] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#5A2D0C]/80">123 Fashion Street, Mumbai, Maharashtra 400001</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#A85721] flex-shrink-0" />
                <p className="text-sm text-[#5A2D0C]/80">+91 98765 43210</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#A85721] flex-shrink-0" />
                <p className="text-sm text-[#5A2D0C]/80">hello@pasoja.com</p>
              </div>
            </div>

            {/* NEWSLETTER */}
            <div>
              <h5 className="text-sm font-poppins font-semibold text-[#5A2D0C] mb-3">
                Subscribe to our Newsletter
              </h5>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 bg-[#F7F2EA] border border-[#E6D8C3] rounded-xl text-[#5A2D0C] placeholder:text-[#5A2D0C]/40 focus:outline-none focus:border-[#A85721] transition-all"
                />
                <button className="bg-[#A85721] text-[#F7F2EA] px-6 py-3 rounded-xl font-semibold hover:bg-[#C87A3A] transition-all shadow-md">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= USER BENEFIT STRIP ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10 border-y border-[#5A2D0C]/10 mb-10">
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-[#F7F2EA] text-[#A85721] shadow-sm border border-[#E6D8C3]">
              <Truck size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-poppins font-semibold text-[#5A2D0C]">Free Shipping</h4>
              <p className="text-sm font-poppins text-[#333333]/70">On all orders over ₹1999</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-[#F7F2EA] text-[#A85721] shadow-sm border border-[#E6D8C3]">
              <Zap size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-poppins font-semibold text-[#5A2D0C]">Fast Delivery</h4>
              <p className="text-sm font-poppins text-[#333333]/70">Delivered in 3-5 working days</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-[#F7F2EA] text-[#A85721] shadow-sm border border-[#E6D8C3]">
              <RotateCcw size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-poppins font-semibold text-[#5A2D0C]">Easy Returns</h4>
              <p className="text-sm font-poppins text-[#333333]/70">30-day hassle-free returns</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-[#F7F2EA] text-[#A85721] shadow-sm border border-[#E6D8C3]">
              <ShieldCheck size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h4 className="text-sm font-poppins font-semibold text-[#5A2D0C]">Secure Checkout</h4>
              <p className="text-sm font-poppins text-[#333333]/70">Encrypted payment gateway</p>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM LEGAL & COPYRIGHT ================= */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#333333]/70 font-poppins text-sm text-center md:text-left">
            © {currentYear} Pasoja. All rights reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a key={item} href="#" className="text-[#5A2D0C]/70 hover:text-[#A85721] transition-colors font-medium">
                {item}
              </a>
            ))}
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-[#A85721] text-[#F7F2EA] rounded-full flex items-center justify-center hover:bg-[#C87A3A] transition-all shadow-md order-first md:order-last"
            aria-label="Scroll back to top"
          >
            <ChevronUp size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
