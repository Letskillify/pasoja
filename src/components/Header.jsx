import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { User, Search, Menu, X, Heart, ArrowRight, ShoppingBag, ChevronDown, Compass, HelpCircle, Tag, ShoppingCart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useStore } from './StoreProvider';
import { db } from './Firebase';
import { collection, getDocs } from 'firebase/firestore';
import OptimizedCloudinaryImage from './OptimizedCloudinaryImage';

const easing = [0.22, 1, 0.36, 1];

const DEFAULT_COLLECTIONS = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Jackets',
  'Dresses',
  'Sweaters',
  'Shorts',
  'Accessories'
];

const POPULAR_SEARCHES = [
  'T-Shirts',
  'Jackets',
  'Jeans',
  'Dresses',
  'Cotton',
  'New Season'
];

const SEARCH_PLACEHOLDERS = [
  'POLO SHIRTS',
  'OVERSIZED TEES',
  'DENIM JEANS',
  'CARGO PANTS',
  'CASUAL SHIRTS',
  'SUMMER SHORTS',
  'PLUS SIZE',
  'SHOES'
];

const AnimatedSearchBox = ({ searchQuery, setSearchQuery, onSubmit, onFocus }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <form onSubmit={onSubmit} className="relative flex items-center w-full">
      <div className="relative w-full flex items-center bg-white border border-zinc-900 rounded-none px-3.5 py-2 transition-all duration-300 shadow-none">
        <Search size={18} className="text-zinc-900 shrink-0 mr-2.5" strokeWidth={1.8} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={onFocus}
          className="w-full bg-transparent text-zinc-900 outline-none font-medium text-[14px] tracking-wide z-10"
        />
        {!searchQuery && (
          <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden h-5 flex items-center z-0">
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-zinc-500 text-[14px] tracking-wide whitespace-nowrap font-normal"
              >
                Search &quot;{SEARCH_PLACEHOLDERS[index]}&quot;
              </motion.span>
            </AnimatePresence>
          </div>
        )}
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="p-1 text-zinc-400 hover:text-black transition-colors z-20"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </form>
  );
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollectionsDropdownOpen, setIsCollectionsDropdownOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
  const [collections, setCollections] = useState(DEFAULT_COLLECTIONS);
  const [allProducts, setAllProducts] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, wishlist } = useStore();
  const { scrollY } = useScroll();

  // Hide search bar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 25) {
        setShowSearchBar(true);
      } else {
        if (currentScrollY > lastScrollY + 5) {
          setShowSearchBar(false);
        } else if (currentScrollY < lastScrollY - 5) {
          setShowSearchBar(true);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    setIsCollectionsDropdownOpen(false);
    setIsSearchActive(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Handle Escape key to close search overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchActive) {
        setIsSearchActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchActive]);

  // Fetch all products for live search & categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products for search autocomplete
        const snap = await getDocs(collection(db, 'products'));
        const productsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllProducts(productsList);

        // Fetch categories dynamically rather than relying on defaults
        try {
          const catSnap = await getDocs(collection(db, 'categories'));
          if (!catSnap.empty) {
            const categoriesList = catSnap.docs
              .map(doc => doc.data())
              .filter(cat => cat.is_active !== false)
              .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
              .map(cat => cat.name)
              .filter(Boolean);
            if (categoriesList.length > 0) {
              setCollections(categoriesList);
            }
          }
        } catch (catErr) {
          console.warn("Could not fetch categories collection", catErr);
        }
      } catch (err) {
        console.error('Error loading header data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    const term = searchQuery.trim();
    setIsSearchActive(false);
    setSearchQuery('');
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  const handleQuickTagClick = (tag) => {
    setIsSearchActive(false);
    setSearchQuery('');
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
  };

  const handleProductClick = (productId) => {
    setIsSearchActive(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleCollectionSelect = (col) => {
    setIsCollectionsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (col === 'All') {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${encodeURIComponent(col)}`);
    }
  };

  // Filter live search matches
  const liveSearchResults = searchQuery.trim()
    ? allProducts.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q) ||
        p.colors?.toLowerCase().includes(q)
      );
    })
    : [];

  const rightNavLinks = [
    { name: 'Track Order', path: '/track' },
    { name: 'Our Story', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const tickerItems = [
    'COMPLIMENTARY SHIPPING OVER ₹1999',
    'SLOW FASHION • ETHICALLY SOURCED',
    'NEW ARRIVALS — SHOP NOW',
    'EASY RETURNS WITHIN 7 TO 10 DAYS',
    'PREMIUM QUALITY GUARANTEED',
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100] flex flex-col pointer-events-auto font-['Inter',sans-serif]">

        {/* ── ANNOUNCEMENT TICKER ── */}
        <motion.div
          style={{ height: topbarHeight, opacity: topbarOpacity }}
          className="bg-[#111111] text-white text-[11px] font-semibold tracking-[0.18em] uppercase overflow-hidden hidden md:flex items-center"
        >
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
            className="flex gap-14 whitespace-nowrap"
          >
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-5">
                <span className="w-1 h-1 bg-[#c9a962] rounded-full inline-block" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── MAIN NAV ── */}
        <motion.nav
          style={{ boxShadow: headerShadow }}
          className="bg-white/95 backdrop-blur-md h-[72px] md:h-[80px] px-5 md:px-12 flex items-center border-b border-black/[0.08] w-full"
        >
          <div className="max-w-7xl mx-auto w-full grid grid-cols-3 items-center">

            {/* Left Nav */}
            <div className="hidden lg:flex items-center gap-9 justify-start">
              <Link
                to="/shop"
                className={`relative text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 py-2 group ${location.pathname === '/shop' && !location.search ? 'text-black' : 'text-zinc-600 hover:text-black'
                  }`}
              >
                Shop All
                <span className={`absolute bottom-0 left-0 h-[1px] bg-black transition-all duration-400 ${location.pathname === '/shop' && !location.search ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>

              {/* Collections Dropdown Trigger */}
              <div
                className="relative py-2"
                onMouseEnter={() => setIsCollectionsDropdownOpen(true)}
                onMouseLeave={() => setIsCollectionsDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 group cursor-pointer ${location.search.includes('category=') || isCollectionsDropdownOpen ? 'text-black' : 'text-zinc-600 hover:text-black'
                    }`}
                >
                  <span>Collections</span>
                  <ChevronDown size={13} className={`transition-transform duration-300 ${isCollectionsDropdownOpen ? 'rotate-180 text-black' : 'text-zinc-400'}`} />
                  <span className={`absolute bottom-0 left-0 h-[1px] bg-black transition-all duration-400 ${location.search.includes('category=') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isCollectionsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: easing }}
                      className="absolute top-full left-0 w-56 bg-white border border-zinc-200 shadow-2xl p-2 z-50 rounded-sm"
                    >
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => handleCollectionSelect('All')}
                          className="w-full text-left px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#b8860b] hover:bg-zinc-100/70 transition-colors border-b border-zinc-200 mb-1 flex items-center justify-between"
                        >
                          <span>All Collections</span>
                          <ArrowRight size={11} />
                        </button>
                        {collections.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => handleCollectionSelect(col)}
                            className="w-full text-left px-4 py-2 text-[11px] uppercase tracking-wider text-zinc-600 hover:text-black hover:bg-zinc-100/70 transition-colors flex items-center justify-between group"
                          >
                            <span>{col}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[#b8860b] text-[10px]">→</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Burger */}
            <div className="flex lg:hidden justify-start">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-zinc-900 p-2 -ml-2 hover:bg-zinc-100 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu size={26} strokeWidth={1.5} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex justify-center">
              <Link to="/" className="flex items-center">
                <OptimizedCloudinaryImage
                  src="https://res.cloudinary.com/dcjn4y284/image/upload/v1786029668/p3jd3nuet4vkqbfd5qaz.png"
                  alt="Pasoja"
                  preset="logo"
                  priority={true}
                  className="h-12 md:h-[52px] w-auto object-cover brightness-0 transition-opacity duration-300 hover:opacity-80"
                />
              </Link>
            </div>

            {/* Right Nav */}
            <div className="hidden lg:flex items-center gap-9 justify-end">
              {rightNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600 hover:text-black transition-colors duration-300 group py-2"
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-[1px] bg-black transition-all duration-400 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              ))}

              {/* Icons */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => setIsSearchActive(!isSearchActive)}
                  className="p-2 text-zinc-600 hover:text-black transition-colors duration-300"
                  aria-label="Search"
                >
                  <Search size={19} strokeWidth={1.8} />
                </button>
                <Link to="/wishlist" className="p-2 text-zinc-600 hover:text-black transition-colors duration-300 relative">
                  <Heart size={19} strokeWidth={1.8} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="p-2 text-zinc-600 hover:text-black transition-colors duration-300 relative">
                  <ShoppingBag size={19} strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/account" className="p-2 text-zinc-600 hover:text-black transition-colors duration-300">
                  <User size={19} strokeWidth={1.8} />
                </Link>
              </div>
            </div>

            {/* Mobile Right Icons */}
            <div className="flex lg:hidden justify-end items-center gap-1">
              <Link to="/cart" className="p-2 text-zinc-900 hover:text-black relative" aria-label="Cart">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </motion.nav>

        {/* ── MOBILE HEADER BOTTOM BAR (SCREENSHOT 1 SEARCH BAR & PINCODE) ── */}
        <motion.div
          initial={false}
          animate={{
            height: (showSearchBar || isSearchActive) ? 'auto' : 0,
            opacity: (showSearchBar || isSearchActive) ? 1 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden block md:hidden bg-[#f8f7f4] border-b border-zinc-200 w-full"
        >
          {/* Top Line: Enter Pincode - to check delivery */}
          <div className="px-4 pt-2 pb-1 text-[11px]   text-zinc-900 flex items-center gap-1">
            <span>Enter Pincode -</span>
            <button
              type="button"
              onClick={() => {
                const pin = prompt("Enter Pincode to check delivery availability:");
                if (pin) alert(`Pincode ${pin}: Express delivery available!`);
              }}
              className="underline font-normal text-zinc-700 hover:text-black cursor-pointer"
            >
              to check delivery
            </button>
          </div>

          <div className="px-4 pb-3 pt-1 flex items-center gap-2.5">
            <div className="flex-1">
              <AnimatedSearchBox
                searchQuery={searchQuery}
                setSearchQuery={(val) => {
                  setSearchQuery(val);
                  if (!isSearchActive && val.trim().length > 0) {
                    setIsSearchActive(true);
                  }
                }}
                onSubmit={handleSearchSubmit}
                onFocus={() => setIsSearchActive(true)}
              />
            </div>
          </div>
        </motion.div>

        {/* ── FULL FUNCTIONAL LIVE SEARCH OVERLAY ── */}
        <AnimatePresence>
          {isSearchActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: easing }}
              className="absolute left-0 top-full w-full bg-white border-b border-zinc-200 px-6 md:px-14 py-6 z-[90] shadow-2xl max-h-[85vh] overflow-y-auto text-zinc-900"
            >
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Mobile Header in Overlay */}
                <div className="flex md:hidden items-center justify-between border-b border-zinc-200 pb-3">
                  <span className="text-[11px] uppercase tracking-widest text-[#b8860b] font-semibold">
                    {searchQuery.trim() ? 'Search Results' : 'Explore Collections'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSearchActive(false)}
                    className="text-[11px] uppercase tracking-[0.15em] text-zinc-500 hover:text-black   transition-colors flex items-center gap-1"
                  >
                    <span>Close</span>
                    <X size={14} />
                  </button>
                </div>

                {/* Desktop Search Form Input */}
                <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-4 border-b border-zinc-200 pb-4">
                  <Search size={22} className="text-[#b8860b] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search apparel by name, fabric, category..."
                    className="bg-transparent border-none outline-none w-full text-lg md:text-2xl text-zinc-900 placeholder-zinc-400 font-light tracking-wide"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-zinc-400 hover:text-black transition-colors"
                      title="Clear text"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-black text-white font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shrink-0"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchActive(false)}
                    className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-black   shrink-0 transition-colors pl-2"
                  >
                    Close
                  </button>
                </form>

                {/* Popular Search Tags when query is empty */}
                {!searchQuery.trim() && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-zinc-400 text-[10px]   uppercase tracking-[0.25em]">
                      <Tag size={12} className="text-[#b8860b]" />
                      <span>Popular Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleQuickTagClick(tag)}
                          className="px-3.5 py-1.5 bg-zinc-100 border border-zinc-200 hover:border-zinc-400 text-zinc-700 hover:text-black text-[11px] uppercase tracking-wider transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Search Instant Results */}
                {searchQuery.trim() !== '' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-[10px]   uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-2">
                      <span>Products Found ({liveSearchResults.length})</span>
                      {liveSearchResults.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="text-[#b8860b] hover:underline"
                        >
                          View All Results →
                        </button>
                      )}
                    </div>

                    {liveSearchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {liveSearchResults.slice(0, 4).map((product) => {
                          const image = product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800';
                          return (
                            <div
                              key={product.id}
                              onClick={() => handleProductClick(product.id)}
                              className="group bg-zinc-50 border border-zinc-200 hover:border-zinc-400 p-3 cursor-pointer transition-all flex flex-col justify-between"
                            >
                              <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-3 relative">
                                <OptimizedCloudinaryImage
                                  src={image}
                                  alt={product.name}
                                  preset="product-card"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {product.stock === 0 && (
                                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[8px]   uppercase tracking-wider px-2 py-0.5">
                                    Sold Out
                                  </span>
                                )}
                              </div>

                              <div>
                                {product.category && (
                                  <span className="text-[9px] uppercase tracking-widest text-[#b8860b] font-semibold block mb-0.5">
                                    {product.category}
                                  </span>
                                )}
                                <h4 className="text-[14px]   text-zinc-900 uppercase tracking-wide truncate group-hover:text-[#b8860b] transition-colors">
                                  {product.name}
                                </h4>
                                <p className="text-[14px] font-mono   text-zinc-800 mt-1">
                                  ₹{product.price?.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <p className="text-sm text-zinc-500 font-light">
                          No items match "<span className="text-zinc-900">{searchQuery}</span>"
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Try searching by broader terms like "shirt", "cotton", or "jackets".
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
              className="fixed inset-0 bg-[#f5f5f5] text-zinc-900 z-[200] flex flex-col"
            >
              {/* Menu Header */}
              <div className="w-full px-5 h-[72px] flex items-center justify-between border-b border-zinc-200 shrink-0">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <OptimizedCloudinaryImage
                    src="https://res.cloudinary.com/dcjn4y284/image/upload/v1786029668/p3jd3nuet4vkqbfd5qaz.png"
                    alt="Pasoja"
                    preset="logo"
                    priority={true}
                    className="h-12 w-auto object-cover brightness-0"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-zinc-900 p-2 -mr-2 hover:bg-zinc-200/50 rounded-lg transition-colors"
                >
                  <X size={26} strokeWidth={1.5} />
                </button>
              </div>

              {/* Nav Links */}
              <div className="px-8 pt-10 flex-1 overflow-y-auto pb-36">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Navigation</p>

                {/* Shop All */}
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-5 border-b border-zinc-200 group"
                >
                  <span className="text-[16px] tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                    Shop All
                  </span>
                  <ArrowRight size={20} className="text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
                </Link>

                {/* Collections Accordion */}
                <div className="border-b border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setIsMobileCollectionsOpen(!isMobileCollectionsOpen)}
                    className="w-full flex items-center justify-between py-5 group text-left"
                  >
                    <span className="text-[14px] tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                      Collections
                    </span>
                    <ChevronDown size={20} className={`text-zinc-400 transition-transform duration-300 ${isMobileCollectionsOpen ? 'rotate-180 text-black' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isMobileCollectionsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pb-4 space-y-3 pl-4"
                      >
                        <button
                          type="button"
                          onClick={() => handleCollectionSelect('All')}
                          className="block text-sm uppercase tracking-widest text-[#b8860b]   py-1"
                        >
                          All Collections →
                        </button>
                        {collections.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => handleCollectionSelect(col)}
                            className="block w-full text-left text-sm uppercase tracking-wider text-zinc-600 hover:text-black py-1 transition-colors"
                          >
                            {col}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Other Nav Links */}
                {rightNavLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 + 0.1, duration: 0.45, ease: easing }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-5 border-b border-zinc-200 group"
                    >
                      <span className="text-[14px] tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors duration-300">
                        {link.name}
                      </span>
                      <ArrowRight size={20} className="text-zinc-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-12 space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400   mb-4">Support & Account</p>
                  <div className="flex items-center gap-4 text-zinc-600">
                    <User size={18} strokeWidth={1.5} />
                    <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-black transition-colors">My Account</Link>
                  </div>
                  <div className="flex items-center gap-4 text-[#b8860b]">
                    <Search size={18} strokeWidth={1.5} />
                    <Link to="/track" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold hover:text-[#b8860b] transition-colors uppercase tracking-wider">Track Order</Link>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-600">
                    <Compass size={18} strokeWidth={1.5} />
                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-black transition-colors">About Us</Link>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-600">
                    <HelpCircle size={18} strokeWidth={1.5} />
                    <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-black transition-colors">Help & Contact</Link>
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