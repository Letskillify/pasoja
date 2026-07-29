import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { User, Search, Menu, X, Heart, ArrowRight, ShoppingBag, Sparkles, Compass, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useStore } from './StoreProvider';

const easing = [0.22, 1, 0.36, 1];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user } = useAuth();
  const { cart, wishlist } = useStore();
  const { scrollY } = useScroll();

  const cartCount = cart.length;
  const wishlistCount = wishlist.length;

  const headerShadow = useTransform(
    scrollY,
    [0, 80],
    ['0 0 0 rgba(0,0,0,0)', '0 1px 0 rgba(255,255,255,0.06)']
  );

  const topbarHeight = useTransform(scrollY, [0, 60], ['44px', '0px']);
  const topbarOpacity = useTransform(scrollY, [0, 40], [1, 0]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const leftNavLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'New Arrivals', path: '/shop?filter=new' },
    { name: 'Collections', path: '/collections' },
  ];

  const rightNavLinks = [
    { name: 'Our Story', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];


  const tickerItems = [
    'COMPLIMENTARY SHIPPING OVER ₹1999',
    'SLOW FASHION • ETHICALLY SOURCED',
    'NEW ARRIVALS — SHOP NOW',
    'FREE RETURNS WITHIN 30 DAYS',
    'PREMIUM QUALITY GUARANTEED',
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100] flex flex-col pointer-events-auto font-['Inter',sans-serif]">

        {/* ── ANNOUNCEMENT TICKER ── */}
        <motion.div
          style={{ height: topbarHeight, opacity: topbarOpacity }}
          className="bg-white text-black text-[11px] font-semibold tracking-[0.18em] uppercase overflow-hidden hidden md:flex items-center"
        >
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
            className="flex gap-14 whitespace-nowrap"
          >
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-5">
                <span className="w-1 h-1 bg-black rounded-full inline-block" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── MAIN NAV ── */}
        <motion.nav
          style={{ boxShadow: headerShadow }}
          className="bg-[#0a0a0a] h-[72px] md:h-[80px] px-5 md:px-12 flex items-center border-b border-white/[0.06] w-full"
        >
          <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">

            {/* Left Nav */}
            <div className="hidden lg:flex items-center gap-9 justify-start">
              {leftNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors duration-300 group py-2"
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-[1px] bg-white transition-all duration-400 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              ))}
            </div>

            {/* Mobile Burger */}
            <div className="flex lg:hidden justify-start">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-white p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu size={26} strokeWidth={1.5} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex justify-center">
              <Link to="/" className="flex items-center">
                <img
                  src="https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png"
                  alt="Pasoja"
                  className="h-10 md:h-[52px] w-auto object-contain brightness-0 invert transition-opacity duration-300 hover:opacity-80"
                />
              </Link>
            </div>

            {/* Right Nav */}
            <div className="hidden lg:flex items-center gap-9 justify-end">
              {rightNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors duration-300 group py-2"
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-[1px] bg-white transition-all duration-400 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              ))}

              {/* Icons */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => setIsSearchActive(!isSearchActive)}
                  className="p-2 text-white/60 hover:text-white transition-colors duration-300"
                  aria-label="Search"
                >
                  <Search size={19} strokeWidth={1.8} />
                </button>
                <Link to="/wishlist" className="p-2 text-white/60 hover:text-white transition-colors duration-300 relative">
                  <Heart size={19} strokeWidth={1.8} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="p-2 text-white/60 hover:text-white transition-colors duration-300 relative">
                  <ShoppingBag size={19} strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/account" className="p-2 text-white/60 hover:text-white transition-colors duration-300">
                  <User size={19} strokeWidth={1.8} />
                </Link>
              </div>
            </div>

            {/* Mobile Right Icons */}
            <div className="flex lg:hidden justify-end items-center gap-1">
              <button onClick={() => setIsSearchActive(!isSearchActive)} className="p-2 text-white/60 hover:text-white">
                <Search size={22} strokeWidth={1.5} />
              </button>
              <Link to="/cart" className="p-2 text-white/60 hover:text-white relative">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </motion.nav>

        {/* ── SEARCH OVERLAY ── */}
        <AnimatePresence>
          {isSearchActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: easing }}
              className="absolute left-0 top-full w-full bg-[#0d0d0d] border-b border-white/10 px-6 md:px-14 py-7 z-[90]"
            >
              <div className="max-w-3xl mx-auto flex items-center gap-4">
                <Search size={22} className="text-white/30 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collections, products..."
                  className="bg-transparent border-none outline-none w-full text-lg md:text-2xl text-white placeholder-white/25 font-light tracking-wide"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchActive(false)}
                  className="text-[11px] uppercase tracking-[0.2em] text-white/40 hover:text-white font-bold shrink-0 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MOBILE FULL-SCREEN MENU ── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ duration: 0.5, ease: easing }}
              className="fixed inset-0 bg-[#080808] z-[200] flex flex-col"
            >
              {/* Menu Header */}
              <div className="w-full px-5 h-[72px] flex items-center justify-between border-b border-white/[0.06] shrink-0">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src="/img/Pasoja option-01.png" alt="Pasoja" className="h-9 w-auto object-contain brightness-0 invert" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white p-2 -mr-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={26} strokeWidth={1.5} />
                </button>
              </div>

              {/* Nav Links */}
              <div className="px-8 pt-10 flex-1 overflow-y-auto pb-36">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold mb-8">Navigation</p>
                {[...leftNavLinks, ...rightNavLinks].map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 + 0.1, duration: 0.45, ease: easing }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-5 border-b border-white/[0.06] group"
                    >
                      <span className="text-2xl font-bold tracking-tight text-white group-hover:text-white/60 transition-colors duration-300">
                        {link.name}
                      </span>
                      <ArrowRight size={20} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-12 space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold mb-4">Support</p>
                  <div className="flex items-center gap-4 text-white/50">
                    <Compass size={18} strokeWidth={1.5} />
                    <Link to="/stores" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-white transition-colors">Find a Store</Link>
                  </div>
                  <div className="flex items-center gap-4 text-white/50">
                    <HelpCircle size={18} strokeWidth={1.5} />
                    <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-white transition-colors">Help & Support</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;