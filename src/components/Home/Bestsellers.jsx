import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useStore } from '../../components/StoreProvider';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';

import 'swiper/css';

const ProductCard = ({ product, idx, triggerToast }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const [isHovered, setIsHovered] = useState(false);

  const defaultSize = product.size_prices && product.size_prices.length > 0
    ? (product.size_prices.find(s => s.size?.toUpperCase() === 'L') || product.size_prices[0])
    : null;

  const displayPrice = defaultSize ? defaultSize.price : product.price;
  const originalPrice = product.original_price || Math.round((displayPrice || 999) * 1.25);
  const savingsPercent = displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  const cartItemId = defaultSize ? `${product.id}-${defaultSize.size}` : product.id;
  const isInCart = cart.some(item => (item.cartId || item.id) === cartItemId);
  const isOutOfStock = product.stock === 0 || product.stock_status === 'Out of Stock';

  const handleAction = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'cart') {
      if (isInCart) return;
      await addToCart(product, defaultSize);
      triggerToast('Added to bag');
    } else {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        triggerToast('Removed from wishlist');
      } else {
        await addToWishlist(product);
        triggerToast('Saved to wishlist');
      }
    }
  };

  const displayedImage = isHovered && product.images && product.images.length > 1
    ? product.images[1]
    : (product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800');

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative cursor-pointer flex flex-col bg-[#0f0f0f] border border-white/[0.04] transition-all duration-500 hover:border-white/10 w-full"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#131313] flex items-center justify-center">
        <img
          src={displayedImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
        />

        {/* Dark subtle overlay */}
        <div className="absolute inset-0 bg-black/[0.02] pointer-events-none" />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-black/75 flex items-center justify-center">
            <span className="bg-white text-black font-extrabold uppercase text-[9px] tracking-[0.2em] px-3 py-1.5">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top-left Save Percentage Badge */}
        {savingsPercent > 0 && !isOutOfStock && (
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="bg-[#cc2222] text-white font-bold uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-sm">
              SAVE {savingsPercent}%
            </span>
          </div>
        )}

        {/* Wishlist Heart Icon */}
        <button
          onClick={(e) => handleAction(e, 'wishlist')}
          className="absolute top-3.5 right-3.5 z-30 text-white hover:scale-110 transition-transform duration-300 pointer-events-auto cursor-pointer"
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            fill={isWishlisted ? "#e53e3e" : "none"}
            stroke={isWishlisted ? "#e53e3e" : "#ffffff"}
          />
        </button>

        {/* Hover Slide-up ADD TO CART overlay */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 z-20 overflow-hidden h-10 pointer-events-auto">
            <button
              onClick={(e) => handleAction(e, 'cart')}
              className={`w-full h-full bg-[#111111] text-white text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center ${
                isHovered ? 'translate-y-0' : 'translate-y-full'
              } hover:bg-white hover:text-black`}
            >
              {isInCart ? 'IN BAG' : 'ADD TO CART'}
            </button>
          </div>
        )}
      </div>

      {/* Info Area (Text displays below product) */}
      <div className="pt-4 pb-5 px-1 flex flex-col text-left">
        <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider line-clamp-1 leading-snug mb-1">
          {product.name}
        </h3>
        
        {/* Prices */}
        <div className="flex items-baseline gap-2.5">
          <span className="text-xs text-zinc-500 line-through">
            Rs.{originalPrice?.toLocaleString('en-IN')}.00
          </span>
          <span className="text-sm font-bold text-[#e53e3e]">
            Rs.{displayPrice?.toLocaleString('en-IN')}.00
          </span>
        </div>
      </div>
    </div>
  );
};

const BestsellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const swiperRef = useRef(null);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 8));
      } catch {
        setProducts([
          { id: '1', name: 'Classic Woolen Coat', price: 4999, category: 'Coats' },
          { id: '2', name: 'Premium Cotton T-Shirt', price: 1299, category: 'T-Shirts' },
          { id: '3', name: 'Slim Fit Denim Jeans', price: 2999, category: 'Jeans' },
          { id: '4', name: 'Italian Leather Jacket', price: 7999, category: 'Jackets' },
          { id: '5', name: 'Cashmere Blend Sweater', price: 3999, category: 'Sweaters' },
          { id: '6', name: 'Oxford Formal Shirt', price: 1899, category: 'Shirts' },
          { id: '7', name: 'Structured Cargo Pants', price: 2499, category: 'Pants' },
          { id: '8', name: 'Premium Fleece Hoodie', price: 2299, category: 'Hoodies' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-[#080808]">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="h-3 w-24 bg-white/5 mb-4 animate-pulse" />
              <div className="h-8 w-52 bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-white/5 animate-pulse" />
                <div className="h-3 bg-white/5 animate-pulse w-2/3" />
                <div className="h-3 bg-white/5 animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-[#080808] overflow-hidden">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Premium Header Layout */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1 flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
            <div>
              <p className="text-[10px] sm:text-xs tracking-[0.3em] text-zinc-500 uppercase mb-2 font-medium">
                NEW ARRIVALS
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight tracking-[0.15em] text-white uppercase whitespace-nowrap leading-none">
                FRESH DROPS
              </h2>
            </div>
            <div className="hidden md:block flex-1 h-[1px] bg-zinc-800/80 mb-3" />
          </div>
          
          <div className="flex items-center gap-6 self-start md:self-auto">
            <p className="text-zinc-400 text-xs sm:text-sm tracking-wide max-w-[280px] font-light leading-relaxed text-left md:text-right">
              The latest arrivals crafted for those who set the trend.
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all duration-300 cursor-pointer"
              >
                &larr;
              </button>
              <button 
                onClick={() => swiperRef.current?.slideNext()}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all duration-300 cursor-pointer"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Swiper Carousel */}
        <div className="w-full">
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            spaceBetween={14}
            slidesPerView={1.15}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2.2,
                spaceBetween: 14,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              1200: {
                slidesPerView: 4,
                spaceBetween: 18,
              },
            }}
            modules={[Mousewheel]}
            className="w-full overflow-visible"
          >
            {products.map((product, idx) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} idx={idx} triggerToast={triggerToast} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Centered Outlined CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            to="/shop"
            className="group flex items-center justify-center gap-3 px-10 h-[54px] border border-white/20 bg-transparent text-white text-[11px] font-semibold uppercase tracking-[0.27em] transition-all duration-300 hover:bg-white hover:text-black hover:border-white rounded-none"
          >
            View All New Arrivals
            <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-white text-black px-5 py-3 rounded-none shadow-2xl flex items-center gap-3"
          >
            <p className="text-[12px] font-black uppercase tracking-wider whitespace-nowrap">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-40 hover:opacity-100 ml-1">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default BestsellerProducts;
export { BestsellerProducts as Bestsellers };
