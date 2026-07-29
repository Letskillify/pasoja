import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../components/Firebase';
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { useAuth } from '../components/useAuth';
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, Star, Truck, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from "../components/StoreProvider";

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
      } catch (error) { console.error("Error:", error); }
      finally { setLoading(false); }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
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
      else { await addToWishlist(product); triggerToast("Added to wishlist!"); }
    }
  };

  const rawImages = product?.images && product.images.length > 0
    ? [...product.images]
    : [product?.image || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop'];

  if (product?.model_image && !rawImages.includes(product.model_image)) {
    rawImages.push(product.model_image);
  }
  const images = rawImages;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border border-white/10 border-t-white rounded-full animate-spin" />
          <div className="text-white/25 tracking-widest text-[10px] uppercase font-bold">Loading</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-6">
        <h3 className="text-sm font-light tracking-widest uppercase text-white mb-4">Product Not Found</h3>
        <Link to="/shop" className="px-8 py-3 bg-white text-black font-semibold text-[10px] uppercase tracking-widest hover:bg-white/85 transition-all">
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
    { id: 'description', label: 'Description' },
    { id: 'size', label: 'Size Guide' },
    { id: 'spec', label: 'Product Specifications' },
    { id: 'style', label: 'Style Note' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'return', label: 'Returns & Exchanges' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px] md:pt-[80px] pb-20">
      {/* Toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 bg-white text-black px-6 py-3.5 shadow-2xl flex items-center gap-3 min-w-[280px]"
          >
            <ShoppingBag size={14} className="shrink-0" />
            <p className="text-[11px] font-semibold uppercase tracking-wider flex-1">{feedbackMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Gallery */}
          <div className="lg:sticky lg:top-28 space-y-3">
            <div className="aspect-square bg-[#141414] overflow-hidden relative group">
              <img src={images[selectedImage]} alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-white text-black px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider">-{discountPercent}%</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden transition-all duration-300 bg-[#141414] border ${selectedImage === idx ? 'border-white opacity-100' : 'border-white/10 opacity-40 hover:opacity-80'}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[9px] tracking-widest font-black uppercase px-2.5 py-1 bg-white/5 border border-white/10 text-white/50">Natural Fabrics</span>
                <span className="text-[9px] tracking-widest font-black uppercase px-2.5 py-1 bg-white/5 border border-white/10 text-white/50 flex items-center gap-1">
                  <Star size={9} fill="currentColor" strokeWidth={0} /> 4.8 Studio Choice
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-light tracking-widest text-white uppercase mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-3.5">
                <span className="text-2xl font-light tracking-widest text-white">
                  ₹{(selectedSize?.price || product.price)?.toLocaleString()}
                </span>
                {(selectedSize?.original_price || product.original_price) && (
                  <span className="text-sm text-white/30 line-through">
                    ₹{(selectedSize?.original_price || product.original_price)?.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/25 tracking-wide mt-1.5">Tax included. Free shipping protected.</p>
              
              {/* Stock Status Badge */}
              <div className="mt-3 flex items-center gap-3">
                <span className={`text-[10px] tracking-widest font-black uppercase px-2.5 py-1 rounded-sm border ${
                  isOutOfStock 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : (product.stock <= 5 || product.stock_status === 'Low Stock')
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-green-500/10 border-green-500/20 text-green-400'
                }`}>
                  {isOutOfStock 
                    ? 'Out of Stock' 
                    : (product.stock <= 5 || product.stock_status === 'Low Stock')
                      ? `Low Stock: Only ${product.stock ?? 3} left`
                      : 'In Stock'
                  }
                </span>
                {product.stock !== undefined && product.stock > 0 && (
                  <span className="text-[11px] text-white/40 font-medium">
                    ({product.stock} items available)
                  </span>
                )}
              </div>
            </div>

            {/* Size Selector */}
            {product.size_prices && product.size_prices.length > 0 && (
              <div className="border-t border-white/[0.06] pt-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-black text-white/30">Select Size</span>
                  <button className="text-[10px] text-white/25 hover:text-white flex items-center gap-1 transition-colors">
                    <Ruler size={11} />
                    <span className="underline underline-offset-4">Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.size_prices.map((sp, idx) => (
                    <button key={idx} onClick={() => setSelectedSize(sp)}
                      className={`w-12 h-11 flex items-center justify-center border text-[11px] font-semibold tracking-wider transition-all duration-200 ${
                        selectedSize?.size === sp.size
                           ? 'border-white bg-white text-black'
                           : 'border-white/15 bg-transparent text-white/50 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      {sp.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Wishlist */}
            <div className="border-t border-white/[0.06] pt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-between border ${isOutOfStock ? 'border-white/5 opacity-30 pointer-events-none' : 'border-white/15'} h-11 px-1 w-28 bg-transparent`}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    disabled={isOutOfStock || quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center text-white/35 hover:text-white transition-colors disabled:opacity-20"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-[12px] font-bold text-white w-5 text-center tabular-nums">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(prev => {
                      const maxStock = product.stock !== undefined ? product.stock : 999;
                      return Math.min(maxStock, prev + 1);
                    })} 
                    disabled={isOutOfStock || (product.stock !== undefined && quantity >= product.stock)}
                    className="w-7 h-7 flex items-center justify-center text-white/35 hover:text-white transition-colors disabled:opacity-20"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => addToCollection('wishlist')}
                  className="flex-1 h-11 flex items-center justify-center border border-white/15 hover:border-white/35 transition-all"
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-white/40">
                    <Heart size={13} fill={isWishlisted ? 'white' : 'none'} className={isWishlisted ? 'text-white' : 'text-white/35'} />
                    {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-white/30">
                <Truck size={13} className="text-white/25 shrink-0" />
                <span>Delivery: Priority transit (Est. 3–5 working days)</span>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => !isOutOfStock && addToCollection('cart')}
                  disabled={isOutOfStock}
                  className={`w-full h-12 border-2 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ${
                    isOutOfStock
                      ? 'border-white/10 text-white/20 bg-transparent cursor-not-allowed'
                      : 'border-white text-white bg-transparent hover:bg-white hover:text-black'
                  }`}
                >
                  {isOutOfStock ? 'Sold Out' : isInCart ? 'View Bag' : 'Add to Shopping Bag'}
                </button>
                {!isOutOfStock && (
                  <button 
                    onClick={() => addToCollection('cart')}
                    className="w-full h-12 bg-white text-black font-semibold text-[10px] uppercase tracking-widest hover:bg-white/85 transition-all duration-300"
                  >
                    Buy it Now
                  </button>
                )}
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-white/[0.06] pt-2 divide-y divide-white/[0.06]">
              {accordions.map((acc) => (
                <div key={acc.id}>
                  <button onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                    className="w-full flex items-center justify-between py-4 text-left group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">{acc.label}</span>
                    <ChevronRight size={12} className={`text-white/25 transition-transform duration-300 ease-out ${activeAccordion === acc.id ? 'rotate-90 text-white/50' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {activeAccordion === acc.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }} className="overflow-hidden"
                      >
                        <div className="pb-5 pt-1 text-[12px] text-white/35 leading-relaxed space-y-1">
                          {acc.id === 'description' && <p>{product.description || 'Premium quality apparel constructed with precise detailing for supreme comfort.'}</p>}
                          {acc.id === 'size' && <p>Fits accurate to standard premium metrics. We recommend checking the size chart before ordering.</p>}
                          {acc.id === 'spec' && <div><p><strong className="text-white/50">Material:</strong> {product.material || 'Premium Eco Blend'}</p><p><strong className="text-white/50">Care:</strong> Machine gentle, cold wash.</p></div>}
                          {acc.id === 'style' && <p>Crafted to transition elegantly from refined daywear into sophisticated evening looks.</p>}
                          {acc.id === 'shipping' && <p>Free shipping on orders over ₹1,999. Priority delivery in 3–5 working days.</p>}
                          {acc.id === 'return' && <p>30-day return window. Initiate returns directly from your account dashboard.</p>}
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
          <div className="mt-24 border-t border-white/[0.06] pt-16">
            <div className="pb-10 mb-10">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25 block mb-3">You May Also Like</span>
              <h2 className="text-3xl font-light text-white uppercase tracking-widest">Complete The Collection</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((item) => {
                const itemDiscount = item.original_price
                  ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
                  : 0;
                return (
                  <Link key={item.id} to={`/product/${item.id}`} className="group">
                    <div className="relative aspect-[3/4] bg-[#141414] mb-3 overflow-hidden">
                      <img
                        src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                      />
                      {itemDiscount > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-white text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5">-{itemDiscount}%</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-[11px] font-bold tracking-wide uppercase text-white/60 truncate mb-1 group-hover:text-white transition-colors">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-white">₹{item.price?.toLocaleString()}</span>
                      {item.original_price && <span className="text-[11px] text-white/25 line-through">₹{item.original_price?.toLocaleString()}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;