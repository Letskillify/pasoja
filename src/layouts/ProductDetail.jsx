import React, { useEffect, useState, useRef } from 'react';
import MiniLoader from '../components/MiniLoader';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../components/Firebase';
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { useAuth } from '../components/useAuth';
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, ChevronLeft, Star, Truck, Ruler, Sparkles, Share2, Tag, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from "../components/StoreProvider";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Mousewheel, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState('description');
  const swiperRef = useRef(null);

  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  const isWishlisted = wishlist.some(item => item.id === id);
  const currentCartId = selectedSize ? `${id}-${selectedSize.size}` : id;
  const isInCart = cart.some(item => (item.cartId || item.id) === currentCartId);
  const isOutOfStock = product?.stock === 0 || product?.stock_status === 'Out of Stock';

  useEffect(() => {
    if (product) {
      if (product.stock === 0 || product.stock_status === 'Out of Stock') {
        setQuantity(0);
      } else {
        setQuantity(1);
      }
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docSnap = await getDoc(doc(db, "products", id));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          if (data.size_prices && data.size_prices.length > 0) {
            const lSize = data.size_prices.find(s => s.size?.toUpperCase() === 'L');
            setSelectedSize(lSize || data.size_prices[0]);
          }
          const q = query(collection(db, "products"), limit(5));
          const snap = await getDocs(q);
          setRelatedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id).slice(0, 4));
        }
      } catch (error) { console.error("Error fetching product:", error); }
      finally { setLoading(false); }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const addToCollection = async (type) => {
    if (!product) return;
    if (type === 'cart') {
      const cartItemId = selectedSize ? `${product.id}-${selectedSize.size}` : product.id;
      if (cart.some(item => item.cartId === cartItemId)) { navigate('/cart'); return; }
      for (let i = 0; i < quantity; i++) await addToCart(product, selectedSize);
      triggerToast(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to your bag!`);
    } else {
      if (isWishlisted) { await removeFromWishlist(product.id); triggerToast("Removed from wishlist!"); }
      else { await addToWishlist(product); triggerToast("Saved to wishlist!"); }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Link copied to clipboard!");
    }
  };

  const rawImages = product?.images && product.images.length > 0
    ? [...product.images]
    : [product?.image || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop'];

  if (product?.model_image && !rawImages.includes(product.model_image)) {
    rawImages.push(product.model_image);
  }
  
  // Guarantee at least 3 slides for 3rd image Style Spotlight showcase
  while (rawImages.length < 3) {
    rawImages.push(rawImages[0]);
  }
  const images = rawImages;

  // Key product attributes for 3rd slide "Style Spotlight"
  const spotlightDetails = [
    { label: 'Fit', value: product?.fit || 'Regular / Oversized' },
    { label: 'Pattern', value: product?.pattern || 'Graphic Printed' },
    { label: 'Color', value: product?.color || product?.colors || 'Natural / Multi' },
    { label: 'Size', value: 'Model is wearing size L' },
    { label: 'Material', value: product?.material || '100% Super-Combed Cotton' },
  ];

  if (loading) {
    return <MiniLoader message="Loading Product Details" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center text-center p-6">
        <h3 className="text-sm font-light tracking-widest uppercase text-zinc-900 mb-4">Product Not Found</h3>
        <Link to="/shop" className="px-8 py-3 bg-black text-white font-semibold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm">
          Return To Collection
        </Link>
      </div>
    );
  }

  const discountPercent = selectedSize?.original_price
    ? Math.round(((selectedSize.original_price - selectedSize.price) / selectedSize.original_price) * 100)
    : product.original_price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  const accordions = [
    { id: 'description', label: 'DETAILS', content: product.description || 'Premium quality apparel constructed with precise detailing for supreme comfort and enduring style.' },
    { id: 'size', label: 'REVIEWS', content: '4.8 / 5 based on 808 customer ratings & verified reviews.' },
    { id: 'shipping', label: 'DELIVERY', content: 'FREE 1-2 day priority shipping available on 5k+ pincodes. Standard transit 3–5 days.' },
    { id: 'return', label: 'RETURNS', content: 'Easy 30-day hassle-free return and exchange window. Initiate directly from your account.' }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] text-zinc-900 pt-[131px] sm:pt-[96px] pb-24 md:pb-20 selection:bg-black selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="fixed bottom-20 md:bottom-10 left-1/2 z-50 bg-black text-white px-6 py-3.5 shadow-2xl flex items-center gap-3 min-w-[280px]"
          >
            <ShoppingBag size={14} className="shrink-0 text-[#c9a962]" />
            <p className="text-[11px] font-bold uppercase tracking-wider flex-1">{feedbackMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── LEFT GALLERY SECTION (SNITCH SCREENSHOT 3 & 4 STYLE) ── */}
          <div className="lg:col-span-7 lg:sticky lg:top-28 self-start flex gap-4 w-full">
            
            {/* Desktop Vertical Thumbnails Column */}
            <div className="hidden md:flex flex-col gap-2.5 w-16 shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(idx);
                    swiperRef.current?.slideTo(idx);
                  }}
                  className={`aspect-[3/4] w-full overflow-hidden transition-all duration-300 bg-zinc-100 border ${
                    selectedImage === idx ? 'border-black ring-1 ring-black opacity-100' : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Swiper Hero Image View */}
            <div className="relative flex-1 w-full aspect-[3/4] sm:aspect-[3/4] min-h-[62vh] sm:min-h-[72vh] bg-zinc-100 overflow-hidden border border-zinc-200 shadow-sm group">

              {/* Discount Tag (Fixed Screenshot 1 & 3 Padding / Margin Issue) */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-30">
                  <span className="bg-[#d92323] text-white px-3 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-md">
                    SAVE {discountPercent}%
                  </span>
                </div>
              )}

              {/* Top-Right Wishlist & Share Action Icons */}
              <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                <button
                  onClick={() => addToCollection('wishlist')}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-zinc-800 hover:text-black hover:scale-110 shadow-sm transition-all duration-300 cursor-pointer"
                  aria-label="Wishlist"
                >
                  <Heart
                    size={17}
                    strokeWidth={1.8}
                    fill={isWishlisted ? '#d92323' : 'none'}
                    stroke={isWishlisted ? '#d92323' : 'currentColor'}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-zinc-800 hover:text-black hover:scale-110 shadow-sm transition-all duration-300 cursor-pointer"
                  aria-label="Share"
                >
                  <Share2 size={16} strokeWidth={1.8} />
                </button>
              </div>

              {/* Navigation Circular Arrow Buttons (< and >) */}
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/75 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm cursor-pointer shadow-md"
                aria-label="Previous Image"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/75 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm cursor-pointer shadow-md"
                aria-label="Next Image"
              >
                <ChevronRight size={18} />
              </button>

              {/* Touchpad / Touch Swiper Slider */}
              <Swiper
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
                slidesPerView={1}
                pagination={{ clickable: true }}
                mousewheel={{ forceToAxis: true }}
                modules={[Pagination, Mousewheel, Navigation]}
                className="w-full h-full"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx} className="w-full h-full relative">
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* 3rd Image (Index 2) Style Spotlight Overlay (Snitch Screenshot 2, 3 & 4 Style) */}
              <AnimatePresence>
                {selectedImage === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-5 sm:p-7 pt-14 text-white pointer-events-none"
                  >
                    <motion.h3
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                      className="text-base sm:text-lg font-bold text-white mb-2 tracking-wide"
                    >
                      Style Spotlight
                    </motion.h3>

                    <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm font-medium tracking-wide">
                      {spotlightDetails.map((detail, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 75 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.15 + i * 0.12,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                          className="flex items-center gap-1.5"
                        >
                          <span className="font-extrabold text-white/90">{detail.label} :</span>
                          <span className="text-zinc-200 font-normal">{detail.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT PRODUCT DETAILS SECTION (SNITCH SCREENSHOT 3 STYLE) ── */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Title & Price Header */}
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-zinc-900 uppercase mb-2 leading-snug">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3">
                <span className="text-lg sm:text-xl font-extrabold text-zinc-900">
                  ₹{(selectedSize?.price || product.price)?.toLocaleString('en-IN')}
                </span>
                {(selectedSize?.original_price || product.original_price) && (
                  <span className="text-xs sm:text-sm text-zinc-400 line-through font-normal">
                    ₹{(selectedSize?.original_price || product.original_price)?.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Ratings Badge (Snitch Style) */}
              <div className="mt-3 flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-none">
                  <span>4.4</span>
                  <Star size={9} fill="white" strokeWidth={0} />
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  808 Ratings and 476 Reviews
                </span>
              </div>
            </div>

            {/* Offer Coupons Strip (Snitch Screenshot 3 Style) */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 bg-[#faf5ed] border border-[#e8ded0] flex flex-col justify-between rounded-none">
                <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase text-zinc-900 mb-1">
                  <span className="flex items-center gap-1">
                    <Tag size={11} className="text-[#b8860b]" />
                    TRYPASOJA5
                  </span>
                  <Copy size={10} className="text-zinc-400 cursor-pointer" />
                </div>
                <p className="text-[10px] text-zinc-600 font-normal leading-tight">
                  Enjoy 5% off on your first web order.
                </p>
              </div>

              <div className="p-3 bg-[#faf5ed] border border-[#e8ded0] flex flex-col justify-between rounded-none">
                <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase text-zinc-900 mb-1">
                  <span className="flex items-center gap-1">
                    <Tag size={11} className="text-[#b8860b]" />
                    NEW10
                  </span>
                  <Copy size={10} className="text-zinc-400 cursor-pointer" />
                </div>
                <p className="text-[10px] text-zinc-600 font-normal leading-tight">
                  Enjoy 10% off on orders over ₹1,999.
                </p>
              </div>
            </div>

            {/* Sizes Grid */}
            {product.size_prices && product.size_prices.length > 0 && (
              <div className="border-t border-zinc-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">SIZES</span>
                  <button type="button" className="text-[10px] text-zinc-600 hover:text-black flex items-center gap-1 transition-colors uppercase font-bold tracking-wider">
                    <Ruler size={11} />
                    <span>SIZE CHART</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.size_prices.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSize(sp)}
                      className={`w-12 h-11 flex items-center justify-center border text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                        selectedSize?.size === sp.size
                          ? 'border-black bg-black text-white'
                          : 'border-zinc-300 bg-white text-zinc-800 hover:border-black'
                      }`}
                    >
                      {sp.size}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 font-medium mt-3">
                  FREE 1-2 day delivery on 5k+ pincodes
                </p>
              </div>
            )}

            {/* Desktop Add to Bag CTA (Hidden on mobile where sticky bar handles it) */}
            <div className="hidden md:block pt-2">
              <button
                type="button"
                onClick={() => !isOutOfStock && addToCollection('cart')}
                disabled={isOutOfStock}
                className={`w-full h-12 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-800'
                }`}
              >
                {isOutOfStock ? 'OUT OF STOCK' : isInCart ? 'VIEW IN BAG' : 'ADD TO BAG'}
              </button>
            </div>

            {/* Snitch-style Accordions */}
            <div className="border-t border-zinc-200 pt-2 divide-y divide-zinc-200">
              {accordions.map((acc) => (
                <div key={acc.id}>
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                    className="w-full flex items-center justify-between py-4 text-left group"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-800 group-hover:text-black transition-colors">
                      {acc.label}
                    </span>
                    <Plus size={14} className={`text-zinc-500 transition-transform duration-300 ${activeAccordion === acc.id ? 'rotate-45 text-black' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {activeAccordion === acc.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 text-xs text-zinc-600 font-light leading-relaxed">
                          {acc.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-zinc-200 pt-14">
            <div className="pb-8">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#b8860b] block mb-1">RECOMMENDED</span>
              <h2 className="text-xl sm:text-2xl font-extralight text-zinc-900 uppercase tracking-[0.15em]">COMPLETE THE LOOK</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <Link key={item.id} to={`/product/${item.id}`} className="group">
                  <div className="relative aspect-[3/4] bg-zinc-100 border border-zinc-200 mb-3 overflow-hidden">
                    <img
                      src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    />
                  </div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-900 truncate mb-1 group-hover:text-black transition-colors">{item.name}</h3>
                  <span className="text-xs font-bold text-zinc-900">₹{item.price?.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR (SNITCH SCREENSHOT 4 STYLE) ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 p-3 flex items-center gap-3 md:hidden shadow-2xl">
        <button
          type="button"
          onClick={() => addToCollection('wishlist')}
          className="w-12 h-12 border border-zinc-300 bg-white flex items-center justify-center text-zinc-800 hover:border-black shrink-0 transition-colors"
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            strokeWidth={1.8}
            fill={isWishlisted ? '#d92323' : 'none'}
            stroke={isWishlisted ? '#d92323' : 'currentColor'}
          />
        </button>

        <button
          type="button"
          onClick={() => !isOutOfStock && addToCollection('cart')}
          disabled={isOutOfStock}
          className={`flex-1 h-12 bg-black text-white text-xs font-extrabold uppercase tracking-[0.2em] flex items-center justify-center transition-all ${
            isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'active:bg-zinc-800'
          }`}
        >
          {isOutOfStock ? 'OUT OF STOCK' : isInCart ? 'VIEW BAG' : 'ADD TO BAG'}
        </button>
      </div>

    </div>
  );
};

export default ProductDetail;