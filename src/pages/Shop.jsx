import React, { useState, useEffect } from "react";
import { db } from "../components/Firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Search, Heart, ArrowUpRight, X, ShoppingBag, Eye, SlidersHorizontal, ChevronDown, ShoppingCart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Home/PageHeader";
import { useStore } from "../components/StoreProvider";

const ProductCard = ({ product, idx, triggerToast }) => {
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
      triggerToast("Added to bag");
    } else {
      if (isWishlisted) { await removeFromWishlist(product.id); triggerToast("Removed from wishlist"); }
      else { await addToWishlist(product); triggerToast("Saved to wishlist"); }
    }
  };

  const rating = product.rating || (4.5 + (idx % 5) * 0.1);
  const badgeText = product.tag || (idx % 2 === 0 ? 'BEST SELLER' : 'NEW');
  const displayedImage = isHovered && product.images && product.images.length > 1
    ? product.images[1]
    : (product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.04, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative cursor-pointer flex flex-col bg-transparent transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#151515] border border-white/[0.04]">
        <img
          src={displayedImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-black font-bold uppercase text-[9px] tracking-[0.2em] px-3.5 py-2">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top-left Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-white text-black font-extrabold uppercase text-[8px] tracking-[0.18em] px-2.5 py-1 shadow-sm">
            {badgeText}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => handleAction(e, 'wishlist')}
          className="absolute top-2.5 right-2.5 z-30 text-white hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          <Heart 
            size={15} 
            strokeWidth={2} 
            fill={isWishlisted ? "#ef4444" : "none"} 
            stroke={isWishlisted ? "#ef4444" : "#ffffff"} 
            className="transition-colors duration-300"
          />
        </button>
      </div>

      {/* Info */}
      <div className="pt-3.5 flex flex-col flex-grow">
        {product.category && (
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#c9a962] font-semibold mb-1">
            {product.category}
          </span>
        )}
        <h3 className="text-[12px] font-light text-white uppercase tracking-wider mb-1 line-clamp-1 group-hover:text-[#c9a962] transition-colors duration-300">
          {product.name}
        </h3>
        
        {/* Stars - Minimal */}
        <div className="flex items-center gap-1 mb-2.5 text-[10px] text-white/40">
          <span className="text-[#c9a962]">★</span>
          <span className="font-semibold">{rating.toFixed(1)}</span>
        </div>

        {/* Price & Cart row */}
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-white/[0.04]">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-wide text-white">₹{displayPrice?.toLocaleString('en-IN')}</span>
            {originalPrice !== displayPrice && (
              <span className="text-[11px] text-white/30 line-through">₹{originalPrice?.toLocaleString('en-IN')}</span>
            )}
            {savingsPercent > 0 && (
              <span className="hidden md:inline text-red-400 text-[9px] font-bold">
                ({savingsPercent}% OFF)
              </span>
            )}
          </div>

          {/* Cart Icon Button */}
          <button
            onClick={(e) => handleAction(e, 'cart')}
            disabled={isOutOfStock}
            className={`w-9 h-9 border flex items-center justify-center transition-all duration-300 z-30 cursor-pointer relative pointer-events-auto ${
              isOutOfStock
                ? 'bg-transparent text-white/20 border-white/5 cursor-not-allowed'
                : isInCart
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/80 border-white/10 hover:bg-white hover:text-black hover:border-white'
            }`}
          >
            <ShoppingCart size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const categories = ["All", "Men", "Women", "T-Shirts", "Jeans", "Jackets", "Sweaters", "Shirts", "Coats"];

  let filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  if (sortBy === "price-low") filteredProducts = [...filteredProducts].sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sortBy === "price-high") filteredProducts = [...filteredProducts].sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sortBy === "name") filteredProducts = [...filteredProducts].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PageHeader
        title="Shop All"
        subtitle={`Browse our curated collection of premium apparel`}
        breadcrumbItems={[{ label: 'Home', path: '/' }, { label: 'Shop' }]}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14 pb-20 md:pb-24 pt-8 md:pt-12">

        {/* Filter Bar */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={15} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-[#141414] border border-white/10 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-white/25"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#141414] border border-white/10 px-4 py-3 pr-9 text-[11px] font-bold uppercase tracking-wider text-white/60 outline-none focus:border-white/30 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 bg-[#141414] border border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white/60"
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>
          </div>

          {/* Category Pills */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 border ${
                    selectedCategory === cat
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/35 border-white/10 hover:border-white/25 hover:text-white/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-[10px] text-white/25 font-medium">
            <span>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</span>
            {(searchTerm || selectedCategory !== "All") && (
              <button
                onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
                className="text-white/40 hover:text-white transition-colors uppercase tracking-wider font-bold"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-white/5 animate-pulse" />
                <div className="h-3 bg-white/5 animate-pulse w-2/3" />
                <div className="h-3 bg-white/5 animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-5 md:gap-y-8">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} idx={idx} triggerToast={triggerToast} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-14 h-14 border border-white/10 flex items-center justify-center text-white/25 mx-auto mb-5">
              <Search size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-light text-white tracking-widest uppercase mb-2">No Products Found</h3>
            <p className="text-[13px] text-white/35 leading-relaxed mb-6">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:text-white/60 transition-colors"
            >
              Reset All Filters
              <ArrowUpRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-5 py-3 shadow-2xl flex items-center gap-3"
          >
            <p className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-40 hover:opacity-100 ml-1"><X size={13} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
