import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Shuffle, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../Firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useStore } from '../StoreProvider';
import OptimizedCloudinaryImage from '../OptimizedCloudinaryImage';

const DEFAULT_PRODUCTS = [
  {
    id: 'rnd-1',
    name: 'Oversized Vintage Acid Wash Tee',
    price: 1499,
    original_price: 1999,
    category: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    stock: 10
  },
  {
    id: 'rnd-2',
    name: 'Heavyweight Graphic Fleece Hoodie',
    price: 2799,
    original_price: 3499,
    category: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    stock: 8
  },
  {
    id: 'rnd-3',
    name: 'Relaxed Fit Cargo Trousers',
    price: 2499,
    original_price: 2999,
    category: 'Pants',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    stock: 12
  },
  {
    id: 'rnd-4',
    name: 'Minimalist Boxy Shirt',
    price: 1899,
    original_price: 2299,
    category: 'Shirts',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    stock: 5
  },
  {
    id: 'rnd-5',
    name: 'Distressed Denim Jacket',
    price: 3999,
    original_price: 4999,
    category: 'Jackets',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
    stock: 7
  },
  {
    id: 'rnd-6',
    name: 'Classic Ribbed Knit Beanie',
    price: 799,
    original_price: 999,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop',
    stock: 15
  },
  {
    id: 'rnd-7',
    name: 'Artisan Embroidered Sweatshirt',
    price: 2299,
    original_price: 2799,
    category: 'Sweaters',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
    stock: 6
  },
  {
    id: 'rnd-8',
    name: 'Tailored Wide Leg Trousers',
    price: 2999,
    original_price: 3699,
    category: 'Pants',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=800&auto=format&fit=crop',
    stock: 9
  }
];

// Helper: Fisher-Yates random shuffle
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const RandomProductCard = ({ product, idx, triggerToast }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const [isHovered, setIsHovered] = useState(false);

  const defaultSize = product.size_prices && product.size_prices.length > 0
    ? (product.size_prices.find(s => s.size?.toUpperCase() === 'L') || product.size_prices[0])
    : null;

  const displayPrice = defaultSize ? defaultSize.price : product.price;
  const originalPrice = product.mrp || product.original_price || Math.round((displayPrice || 999) * 1.25);
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, delay: idx * 0.04 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative cursor-pointer flex flex-col bg-white border border-zinc-200 transition-all duration-300 hover:border-black/40 hover:shadow-md"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#fff] flex items-center justify-center">
        <OptimizedCloudinaryImage
          src={displayedImage}
          alt={product.name}
          preset="product-card"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/[0.02] pointer-events-none" />

        {/* Out of Stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-black/75 flex items-center justify-center">
            <span className="bg-white text-black font-extrabold uppercase text-[9px] tracking-[0.2em] px-3 py-1.5">
              Out of Stock
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {savingsPercent > 0 && !isOutOfStock && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-black text-white   uppercase text-[8px] tracking-wider px-2.5 py-1 rounded-none shadow-sm">
              {savingsPercent}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => handleAction(e, 'wishlist')}
          className="absolute top-3 right-3 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full text-zinc-700 hover:text-black hover:scale-110 transition-all duration-300 shadow-sm"
          aria-label="Wishlist"
        >
          <Heart
            size={15}
            strokeWidth={1.8}
            fill={isWishlisted ? '#e53e3e' : 'none'}
            stroke={isWishlisted ? '#e53e3e' : 'currentColor'}
          />
        </button>

        {/* Slide-up Add to Cart */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 z-20 overflow-hidden h-10 pointer-events-auto">
            <button
              onClick={(e) => handleAction(e, 'cart')}
              className={`w-full h-full bg-black text-white text-[10px]   tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center ${isHovered ? 'translate-y-0' : 'translate-y-full'
                } hover:bg-zinc-800`}
            >
              {isInCart ? 'IN BAG' : 'ADD TO CART'}
            </button>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col text-left bg-white flex-1 justify-between">
        <div>
          {product.category && (
            <span className="text-[10px] font-semibold tracking-widest text-[#b8860b] uppercase block mb-1">
              {product.category}
            </span>
          )}
          <h3 className="text-[14px] sm:text-sm   text-zinc-900 uppercase tracking-wider line-clamp-1 leading-snug mb-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-baseline gap-2.5 pt-1 border-t border-zinc-100">
          <span className="text-[14px] text-zinc-400 line-through">
            ₹{Number(originalPrice).toLocaleString('en-IN')}
          </span>
          <span className="text-sm text-[#e53e3e] font-semibold">
            ₹{Number(displayPrice).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const RandomProducts = () => {
  const [allRawProducts, setAllRawProducts] = useState([]);
  const [randomizedProducts, setRandomizedProducts] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleShuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      setRandomizedProducts(prev => shuffleArray(prev.length > 0 ? prev : DEFAULT_PRODUCTS));
      setShuffleKey(k => k + 1);
      setIsShuffling(false);
    }, 200);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setAllRawProducts(list);
          setRandomizedProducts(shuffleArray(list));
        } else {
          setAllRawProducts(DEFAULT_PRODUCTS);
          setRandomizedProducts(shuffleArray(DEFAULT_PRODUCTS));
        }
      } catch (err) {
        console.warn('Using default products for random showcase:', err);
        setAllRawProducts(DEFAULT_PRODUCTS);
        setRandomizedProducts(shuffleArray(DEFAULT_PRODUCTS));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-[#f5f5f5] border-t border-zinc-200">
        <div className="w-full max-w-[1800px] mx-auto px-1 sm:px-6 lg:px-8">
          <div className="h-4 w-32 bg-zinc-200 animate-pulse mb-3" />
          <div className="h-8 w-64 bg-zinc-200 animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-zinc-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-[#f5f5f5] relative border-t border-zinc-200 overflow-hidden">
      <div className="w-full max-w-[1800px] mx-auto px-1 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="flex-1 flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] sm:text-[14px] tracking-[0.3em] text-[#b8860b] uppercase  ">
                  CURATED DISCOVERIES
                </p>
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extralight tracking-[0.15em] text-zinc-900 uppercase whitespace-nowrap">
                EXPLORE ALL STYLES
              </h2>
            </div>
            <div className="hidden md:block flex-1 h-[1px] bg-zinc-200 mb-3" />
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto">
            <button
              type="button"
              onClick={handleShuffle}
              disabled={isShuffling}
              className="flex items-center gap-2 px-4 py-2.5 border border-zinc-300 bg-white text-zinc-800 hover:text-black hover:border-black transition-all duration-300 text-[14px] font-semibold uppercase tracking-wider shadow-sm rounded-none cursor-pointer group shrink-0"
            >
              <Shuffle
                size={14}
                className={`transition-transform duration-500 ${isShuffling ? 'rotate-180 text-[#b8860b]' : 'group-hover:rotate-45'}`}
              />
              <span>Shuffle Order</span>
            </button>
          </div>
        </div>

        {/* Randomized Grid Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={shuffleKey}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-5 md:gap-6"
          >
            {randomizedProducts.map((product, idx) => (
              <RandomProductCard
                key={product.id}
                product={product}
                idx={idx}
                triggerToast={triggerToast}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All CTA */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 border border-zinc-900 bg-zinc-900 text-white text-[11px]   uppercase tracking-[0.25em] transition-all duration-300 hover:bg-white hover:text-black rounded-none shadow-sm"
          >
            <span>View Full Catalogue</span>
            <ArrowRight size={15} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
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
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-black text-white px-5 py-3 rounded-none shadow-2xl flex items-center gap-3"
          >
            <p className="text-[14px] font-black uppercase tracking-wider whitespace-nowrap">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-60 hover:opacity-100 ml-1">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default RandomProducts;
