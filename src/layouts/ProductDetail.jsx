import React, { useEffect, useState, useRef } from 'react';
import MiniLoader from '../components/MiniLoader';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../components/Firebase';
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { useAuth } from '../components/useAuth';
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, ChevronLeft, Star, Truck, Ruler, Sparkles, Share2, Tag, Copy, X, ThumbsUp, Check, ShieldCheck, RefreshCw, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from "../components/StoreProvider";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Mousewheel, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import SEOHead from '../components/SEOHead';
import OptimizedCloudinaryImage from '../components/OptimizedCloudinaryImage';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState('description');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState('style');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
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
          if (data.colors) {
            const cols = typeof data.colors === 'string' ? data.colors.split(',').map(c => c.trim()) : data.colors;
            if (cols.length > 0) setSelectedColor(cols[0]);
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
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Link copied to clipboard!");
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    triggerToast(`Coupon ${code} copied to clipboard!`);
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length < 6) {
      setPincodeStatus({ success: false, msg: 'Please enter a valid 6-digit pincode.' });
      return;
    }
    setPincodeStatus({ success: true, msg: `Express delivery available for pincode ${pincode}! Delivered in 1-2 days.` });
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
    { label: 'Color', value: selectedColor || product?.color || product?.colors || 'Natural / Multi' },
    { label: 'Size', value: 'Model is wearing size L' },
    { label: 'Material', value: product?.material || '100% Super-Combed Cotton' },
  ];

  const colorList = product?.colors
    ? (typeof product.colors === 'string' ? product.colors.split(',').map(c => c.trim()).filter(Boolean) : product.colors)
    : [];

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

  return (
    <div className="min-h-screen bg-[#faf9f5] text-zinc-900 pt-[155px] sm:pt-[140px] pb-36 sm:pb-32 selection:bg-black selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="fixed bottom-24 md:bottom-10 left-1/2 z-50 bg-black text-white px-6 py-3.5 shadow-2xl flex items-center gap-3 min-w-[280px]"
          >
            <ShoppingBag size={14} className="shrink-0 text-[#c9a962]" />
            <p className="text-[11px] uppercase tracking-wider flex-1">{feedbackMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsSizeChartOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-lg w-full p-6 shadow-2xl relative border border-zinc-200"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
                <h3 className="text-sm   uppercase tracking-widest text-zinc-900">SIZE CHART (INCHES)</h3>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(false)}
                  className="p-1 text-zinc-500 hover:text-black transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-[12px] text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-900   uppercase tracking-wider">
                      <th className="p-2.5">SIZE</th>
                      <th className="p-2.5">CHEST</th>
                      <th className="p-2.5">SHOULDER</th>
                      <th className="p-2.5">LENGTH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    <tr><td className="p-2.5  ">XS</td><td className="p-2.5">36"</td><td className="p-2.5">17.0"</td><td className="p-2.5">27.0"</td></tr>
                    <tr><td className="p-2.5  ">S</td><td className="p-2.5">38"</td><td className="p-2.5">17.5"</td><td className="p-2.5">27.5"</td></tr>
                    <tr><td className="p-2.5  ">M</td><td className="p-2.5">40"</td><td className="p-2.5">18.0"</td><td className="p-2.5">28.0"</td></tr>
                    <tr><td className="p-2.5  ">L</td><td className="p-2.5">42"</td><td className="p-2.5">18.5"</td><td className="p-2.5">28.5"</td></tr>
                    <tr><td className="p-2.5  ">XL</td><td className="p-2.5">44"</td><td className="p-2.5">19.0"</td><td className="p-2.5">29.0"</td></tr>
                    <tr><td className="p-2.5  ">XXL</td><td className="p-2.5">46"</td><td className="p-2.5">19.5"</td><td className="p-2.5">29.5"</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-zinc-50 p-3 border border-zinc-200 text-[11px] text-zinc-600 font-medium">
                <p>💡 <strong>Note:</strong> Standard relaxed fit. Model is 6'1" wearing size <strong>L</strong>.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {product && (
        <SEOHead
          title={`${product.name} | Pasoja`}
          description={product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || `Buy ${product.name} online at Pasoja. Premium quality clothing.`}
          image={images[0] || product.image}
          url={`https://pasoja.in/product/${id}`}
          type="product"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": images[0] || product.image,
            "description": product.description?.replace(/<[^>]*>?/gm, ''),
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR",
              "price": selectedSize?.price || product.price,
              "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              "url": `https://pasoja.in/product/${id}`
            }
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── LEFT GALLERY SECTION ── */}
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
                  className={`aspect-[3/4] w-full overflow-hidden transition-all duration-300 bg-zinc-100 border cursor-pointer ${selectedImage === idx ? 'border-black ring-1 ring-black opacity-100' : 'border-zinc-200 opacity-60 hover:opacity-100'
                    }`}
                >
                  <OptimizedCloudinaryImage src={img} alt={`Thumbnail ${idx + 1}`} preset="avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Swiper Hero Image View */}
            <div className="relative flex-1 w-full aspect-[3/4] sm:aspect-[3/4] min-h-[62vh] sm:min-h-[72vh] bg-zinc-100 overflow-hidden border border-zinc-200 shadow-sm group">

              {/* Discount Tag */}
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
                  <SwiperSlide key={idx} className="w-full h-full relative cursor-zoom-in" onClick={() => setIsZoomOpen(true)}>
                    <OptimizedCloudinaryImage
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      preset="product-details"
                      priority={idx === 0}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute bottom-4 right-4 z-20 bg-black/60 text-white p-2 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn size={18} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* 3rd Image (Index 2) Style Spotlight Overlay */}
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
                      className="text-base sm:text-lg text-white mb-2 tracking-wide font-medium"
                    >
                      Style Spotlight
                    </motion.h3>

                    <div className="space-y-1 sm:space-y-1.5 text-[12px] sm:text-sm font-medium tracking-wide">
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

          {/* ── RIGHT PRODUCT DETAILS SECTION (SNITCH SCREENSHOT 3 & 4 STYLE) ── */}
          <div className="lg:col-span-5 flex flex-col space-y-6">

            {/* Title & Price Header */}
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl   tracking-wide text-zinc-900 uppercase mb-2 leading-snug">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline justify-between sm:justify-start gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-xl sm:text-2xl   text-zinc-900">
                    ₹{(selectedSize?.price || product.price)?.toLocaleString('en-IN')}
                  </span>
                  {(selectedSize?.original_price || product.original_price) && (
                    <span className="text-sm text-zinc-400 line-through font-normal">
                      ₹{(selectedSize?.original_price || product.original_price)?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Ratings Badge (Snitch Style) */}
              <div className="mt-3 flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black text-white text-[11px]   rounded-none">
                  <span>{product.rating || 4.4}</span>
                  <Star size={10} fill="white" strokeWidth={0} />
                </div>
                <span className="text-[12px] text-zinc-600 font-medium">
                  808 Ratings and 476 Reviews
                </span>
              </div>
            </div>

            {/* Offer Coupons Strip (Snitch Screenshot 3 Style) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div
                onClick={() => handleCopyCoupon('TRYPASOJA5')}
                className="p-3 bg-[#faf5ed] border border-[#e8ded0] flex flex-col justify-between rounded-none cursor-pointer hover:border-[#c9a962] transition-colors group"
              >
                <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase text-zinc-900 mb-1">
                  <span className="flex items-center gap-1">
                    <Tag size={11} className="text-[#b8860b]" />
                    TRYPASOJA5
                  </span>
                  <Copy size={10} className="text-zinc-400 group-hover:text-black transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-600 font-normal leading-tight">
                  Enjoy 5% off on your first web order.
                </p>
              </div>

              <div
                onClick={() => handleCopyCoupon('NEW10')}
                className="p-3 bg-[#faf5ed] border border-[#e8ded0] flex flex-col justify-between rounded-none cursor-pointer hover:border-[#c9a962] transition-colors group"
              >
                <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase text-zinc-900 mb-1">
                  <span className="flex items-center gap-1">
                    <Tag size={11} className="text-[#b8860b]" />
                    NEW10
                  </span>
                  <Copy size={10} className="text-zinc-400 group-hover:text-black transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-600 font-normal leading-tight">
                  Enjoy 10% off on orders over ₹1,999.
                </p>
              </div>
            </div>

            {/* COLORS Selection Section (Snitch Screenshot 3 Style) */}
            {colorList.length > 0 && (
              <div className="border-t border-zinc-200 pt-5">
                <div className="flex items-center justify-center mb-3">
                  <span className="text-[12px]   uppercase tracking-[0.2em] text-zinc-900">COLORS</span>
                </div>
                <div className="flex items-center justify-center flex-wrap gap-2.5">
                  {colorList.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 border text-[11px] font-medium uppercase tracking-wider transition-all cursor-pointer ${selectedColor === col || (idx === 0 && !selectedColor)
                          ? 'border-black bg-black text-white shadow-sm'
                          : 'border-zinc-300 bg-white text-zinc-700 hover:border-black'
                        }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZES Selection Grid (Snitch Screenshot 3 Style) */}
            <div className="border-t border-zinc-200 pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px]   uppercase tracking-wider text-zinc-900">SIZES</span>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="text-[10px] text-zinc-600 hover:text-black flex items-center gap-1 transition-colors uppercase   tracking-wider cursor-pointer underline underline-offset-2"
                >
                  <Ruler size={11} />
                  <span>SIZE CHART</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(product.size_prices && product.size_prices.length > 0
                  ? product.size_prices
                  : [{ size: 'S' }, { size: 'M' }, { size: 'L' }, { size: 'XL' }, { size: 'XXL' }]
                ).map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSize(sp)}
                    className={`w-12 h-11 flex items-center justify-center border text-[12px]   uppercase tracking-wider transition-all duration-200 cursor-pointer ${selectedSize?.size === sp.size
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-zinc-300 bg-white text-zinc-800 hover:border-black'
                      }`}
                  >
                    {sp.size}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-600 font-medium mt-3 flex items-center gap-1.5">
                <Truck size={12} className="text-zinc-700" />
                <span>FREE 1-2 day delivery on 5k+ pincodes</span>
              </p>
            </div>

            {/* Desktop Add to Bag CTA */}
            <div className="hidden md:block pt-2">
              <button
                type="button"
                onClick={() => !isOutOfStock && addToCollection('cart')}
                disabled={isOutOfStock}
                className={`w-full h-12 bg-black text-white text-[12px] font-extrabold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-800'
                  }`}
              >
                {isOutOfStock ? 'OUT OF STOCK' : isInCart ? 'VIEW IN BAG' : 'ADD TO BAG'}
              </button>
            </div>

            {/* Snitch-style Accordions (Screenshot 4 & 5 Style) */}
            <div className="border-t border-zinc-200 pt-2 divide-y divide-zinc-200">

              {/* 1. DETAILS Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'description' ? null : 'description')}
                  className="w-full flex items-center justify-between py-4 text-left group cursor-pointer"
                >
                  <span className="text-[12px]   uppercase tracking-[0.2em] text-zinc-800 group-hover:text-black transition-colors">
                    DETAILS
                  </span>
                  {activeAccordion === 'description' ? (
                    <Minus size={14} className="text-black" />
                  ) : (
                    <Plus size={14} className="text-zinc-500 group-hover:text-black transition-colors" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === 'description' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 space-y-4 text-[12px] text-zinc-700 font-normal leading-relaxed">

                        {/* Dynamic TinyMCE Rich HTML Description */}
                        {product.description ? (
                          <div
                            className="prose prose-sm max-w-none text-zinc-700 font-sans leading-relaxed text-[12px] [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_h3]: "
                            dangerouslySetInnerHTML={{ __html: product.description }}
                          />
                        ) : (
                          <p>Crafted with premium fabric, combining breathable comfort with a sleek design. Perfect for smart casual occasions with refined yet approachable style.</p>
                        )}

                        {/* Size & Fit Specs */}
                        <div className="space-y-1 pt-2 border-t border-zinc-100">
                          <p className="  text-zinc-900 uppercase tracking-wider text-[11px]">Size & Fit</p>
                          <p>Fit - {product.fit || 'Regular Fit'}</p>
                          <p>Size - Model Is Wearing Size L</p>
                        </div>

                        {/* Wash care */}
                        <div className="space-y-1 pt-1">
                          <p className="  text-zinc-900 uppercase tracking-wider text-[11px]">Wash care</p>
                          <p>{product.wash_care || 'Machine Wash'}</p>
                        </div>

                        {/* Specifications */}
                        <div className="space-y-1 pt-1">
                          <p className="  text-zinc-900 uppercase tracking-wider text-[11px]">Specification</p>
                          <p>Pattern - {product.pattern || 'Embroidered / Solid'}</p>
                          <p>Collar - {product.collar || 'Classic'}</p>
                          <p>Sleeve - {product.sleeve || 'Full Sleeve'}</p>
                          <p className="pt-1 text-zinc-500 font-mono text-[11px]">SKU: {product.sku || `${product.id?.slice(0, 10)?.toUpperCase() || '4SFS145-01'}`}</p>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. REVIEWS Accordion (Snitch Screenshot 4 & 5) */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'reviews' ? null : 'reviews')}
                  className="w-full flex items-center justify-between py-4 text-left group cursor-pointer"
                >
                  <span className="text-[12px]   uppercase tracking-[0.2em] text-zinc-800 group-hover:text-black transition-colors">
                    REVIEWS
                  </span>
                  {activeAccordion === 'reviews' ? (
                    <Minus size={14} className="text-black" />
                  ) : (
                    <Plus size={14} className="text-zinc-500 group-hover:text-black transition-colors" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === 'reviews' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 space-y-5">

                        {/* Tabs: STYLE REVIEWS | CATEGORY REVIEWS */}
                        <div className="flex border-b border-zinc-200">
                          <button
                            type="button"
                            onClick={() => setReviewTab('style')}
                            className={`flex-1 py-2.5 text-[11px]   uppercase tracking-wider transition-colors ${reviewTab === 'style'
                                ? 'text-black border-b-2 border-[#d92323]'
                                : 'text-zinc-400 hover:text-zinc-700'
                              }`}
                          >
                            STYLE REVIEWS
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewTab('category')}
                            className={`flex-1 py-2.5 text-[11px]   uppercase tracking-wider transition-colors ${reviewTab === 'category'
                                ? 'text-black border-b-2 border-[#d92323]'
                                : 'text-zinc-400 hover:text-zinc-700'
                              }`}
                          >
                            CATEGORY REVIEWS
                          </button>
                        </div>

                        {/* Overall Rating Box */}
                        <div className="text-center py-3 bg-zinc-50 border border-zinc-200">
                          <div className="flex items-center justify-center gap-1 text-xl font-black text-zinc-900">
                            <span>4.4</span>
                            <div className="flex text-black">
                              <Star size={16} fill="black" strokeWidth={0} />
                              <Star size={16} fill="black" strokeWidth={0} />
                              <Star size={16} fill="black" strokeWidth={0} />
                              <Star size={16} fill="black" strokeWidth={0} />
                              <Star size={16} fill="none" stroke="black" strokeWidth={1.5} />
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-600 font-medium mt-1">
                            Loved by our users! <strong>74 out of 128</strong> rated 5 stars
                          </p>
                        </div>

                        {/* Sample Verified Customer Review (Snitch Screenshot 5) */}
                        <div className="p-3.5 bg-white border border-zinc-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-zinc-900 text-white text-[10px]   flex items-center gap-0.5">
                                5 <Star size={8} fill="white" strokeWidth={0} />
                              </span>
                              <span className="text-[11px]   text-zinc-900">AAKASH</span>
                              <span className="text-[10px] text-[#d92323] font-semibold">Verified User</span>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-500 text-[11px]">
                              <span>2</span>
                              <ThumbsUp size={12} className="cursor-pointer hover:text-black" />
                            </div>
                          </div>
                          <p className="text-[12px] text-zinc-700">Good material, looks rich</p>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. DELIVERY Accordion (Snitch Screenshot 5) */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'delivery' ? null : 'delivery')}
                  className="w-full flex items-center justify-between py-4 text-left group cursor-pointer"
                >
                  <span className="text-[12px]   uppercase tracking-[0.2em] text-zinc-800 group-hover:text-black transition-colors">
                    DELIVERY
                  </span>
                  {activeAccordion === 'delivery' ? (
                    <Minus size={14} className="text-black" />
                  ) : (
                    <Plus size={14} className="text-zinc-500 group-hover:text-black transition-colors" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === 'delivery' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 space-y-3">
                        <form onSubmit={handlePincodeCheck} className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter Pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className="flex-1 px-3 py-2 border border-zinc-300 text-[12px] focus:outline-none focus:border-black"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-black text-white text-[11px]   uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            Check
                          </button>
                        </form>
                        {pincodeStatus && (
                          <p className={`text-[11px] font-medium ${pincodeStatus.success ? 'text-emerald-700' : 'text-red-600'}`}>
                            {pincodeStatus.msg}
                          </p>
                        )}
                        <ul className="text-[11px] text-zinc-600 space-y-1.5 pt-1">
                          <li className="flex items-center gap-2">
                            <Truck size={13} className="text-zinc-800 shrink-0" />
                            <span>FREE 1-2 day express shipping on 5k+ pincodes.</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <ShieldCheck size={13} className="text-zinc-800 shrink-0" />
                            <span>Cash on Delivery (COD) available nationwide.</span>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. RETURNS Accordion (Snitch Screenshot 5) */}
              <div>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === 'returns' ? null : 'returns')}
                  className="w-full flex items-center justify-between py-4 text-left group cursor-pointer"
                >
                  <span className="text-[12px]   uppercase tracking-[0.2em] text-zinc-800 group-hover:text-black transition-colors">
                    RETURNS
                  </span>
                  {activeAccordion === 'returns' ? (
                    <Minus size={14} className="text-black" />
                  ) : (
                    <Plus size={14} className="text-zinc-500 group-hover:text-black transition-colors" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === 'returns' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 text-[12px] text-zinc-600 font-light leading-relaxed space-y-2">
                        <p className="flex items-start gap-2">
                          <RefreshCw size={13} className="text-zinc-800 shrink-0 mt-0.5" />
                          <span>Hassle-free <strong>30-day return & exchange</strong> window. Doorstep pickup scheduled automatically upon request.</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </div>

        {/* YOU MAY ALSO LIKE Section (Snitch Screenshot 5 Style) */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 border-t border-zinc-200 pt-12">
            <div className="text-center pb-8">
              <h2 className="text-base sm:text-lg   text-zinc-900 uppercase tracking-[0.25em]">YOU MAY ALSO LIKE</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-4">
              {relatedProducts.map((item) => (
                <Link key={item.id} to={`/product/${item.id}`} className="group block">
                  <div className="relative aspect-[3/4] bg-zinc-100 border border-zinc-200 mb-2.5 overflow-hidden">
                    <OptimizedCloudinaryImage
                      src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800'}
                      alt={item.name}
                      preset="product-card"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToWishlist(item);
                        triggerToast("Saved to wishlist!");
                      }}
                      className="absolute bottom-2.5 right-2.5 p-2 bg-white/90 rounded-full text-zinc-800 hover:text-black shadow-sm cursor-pointer"
                    >
                      <Heart size={14} />
                    </button>
                  </div>
                  <h3 className="text-[12px] font-medium tracking-wider uppercase text-zinc-900 truncate mb-0.5 group-hover:text-black transition-colors">{item.name}</h3>
                  <span className="text-[12px]   text-zinc-900">₹{item.price?.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR (SNITCH SCREENSHOT 4 & 5 STYLE) ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 p-3 flex items-center gap-3 md:hidden shadow-2xl">
        <button
          type="button"
          onClick={() => addToCollection('wishlist')}
          className="w-12 h-12 border border-zinc-300 bg-white flex items-center justify-center text-zinc-800 hover:border-black shrink-0 transition-colors cursor-pointer"
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
          className={`flex-1 h-12 bg-black text-white text-[12px] font-extrabold uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'active:bg-zinc-800'
            }`}
        >
          {isOutOfStock ? 'OUT OF STOCK' : isInCart ? 'VIEW BAG' : 'ADD TO BAG'}
        </button>
      </div>

      {/* ── HIGH-RESOLUTION ZOOM MODAL ── */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsZoomOpen(false)}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-10 cursor-pointer"
            >
              <X size={28} />
            </button>
            <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center overflow-auto" onClick={(e) => e.stopPropagation()}>
              <OptimizedCloudinaryImage
                src={images[selectedImage]}
                alt={product.name}
                preset="zoom"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;