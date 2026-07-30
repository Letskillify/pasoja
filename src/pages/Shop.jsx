import React, { useState, useEffect, useMemo } from "react";
import { db } from "../components/Firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  Search,
  Heart,
  ArrowUpRight,
  X,
  SlidersHorizontal,
  ChevronDown,
  ShoppingCart,
  Filter
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Home/PageHeader";
import { useStore } from "../components/StoreProvider";
import ShopFilterSidebar, { DEFAULT_CATEGORIES } from "../components/ShopFilterSidebar";

const ProductCard = ({ product, idx, triggerToast }) => {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart } = useStore();
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const [isHovered, setIsHovered] = useState(false);

  const defaultSize =
    product.size_prices && product.size_prices.length > 0
      ? product.size_prices.find(s => s.size?.toUpperCase() === "L") || product.size_prices[0]
      : null;

  const displayPrice = defaultSize ? defaultSize.price : product.price;
  const originalPrice =
    product.mrp || product.original_price || Math.round((displayPrice || 999) * 1.25);
  const savingsPercent = displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;
  const cartItemId = defaultSize ? `${product.id}-${defaultSize.size}` : product.id;
  const isInCart = cart.some(item => (item.cartId || item.id) === cartItemId);
  const isOutOfStock = product.stock === 0 || product.stock_status === "Out of Stock";

  const handleAction = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "cart") {
      if (isInCart) return;
      await addToCart(product, defaultSize);
      triggerToast("Added to bag");
    } else {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        triggerToast("Removed from wishlist");
      } else {
        await addToWishlist(product);
        triggerToast("Saved to wishlist");
      }
    }
  };

  const rating = product.rating || 4.5 + (idx % 5) * 0.1;
  const badgeText = product.tag || (idx % 2 === 0 ? "BEST SELLER" : "NEW");
  const displayedImage =
    isHovered && product.images && product.images.length > 1
      ? product.images[1]
      : product.image ||
        product.images?.[0] ||
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.03, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative cursor-pointer flex flex-col bg-white border border-zinc-200 transition-all duration-300 hover:border-black/30"
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-100 border-b border-zinc-200">
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
          <span className="bg-black text-white font-extrabold uppercase text-[8px] tracking-[0.18em] px-2.5 py-1 shadow-sm">
            {badgeText}
          </span>
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={e => handleAction(e, "wishlist")}
          className="absolute top-2.5 right-2.5 z-30 text-zinc-700 hover:text-black hover:scale-110 drop-shadow-sm transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          <Heart
            size={15}
            strokeWidth={2}
            fill={isWishlisted ? "#ef4444" : "none"}
            stroke={isWishlisted ? "#ef4444" : "currentColor"}
            className="transition-colors duration-300"
          />
        </button>
      </div>

      {/* Info */}
      <div className="pt-3.5 pb-4 px-3 flex flex-col flex-grow bg-white">
        {product.category && (
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#b8860b] font-semibold mb-1">
            {product.category}
          </span>
        )}
        <h3 className="text-[12px] font-bold text-zinc-900 uppercase tracking-wider mb-1 line-clamp-1 group-hover:text-[#b8860b] transition-colors duration-300">
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2.5 text-[10px] text-zinc-500">
          <span className="text-[#b8860b]">★</span>
          <span className="font-semibold">{rating.toFixed(1)}</span>
        </div>

        {/* Price & Cart row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-200">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-wide text-zinc-900">
              ₹{displayPrice?.toLocaleString("en-IN")}
            </span>
            {originalPrice !== displayPrice && (
              <span className="text-[11px] text-zinc-400 line-through">
                ₹{originalPrice?.toLocaleString("en-IN")}
              </span>
            )}
            {savingsPercent > 0 && (
              <span className="hidden md:inline text-red-600 text-[9px] font-bold">
                ({savingsPercent}% OFF)
              </span>
            )}
          </div>

          {/* Cart Icon Button */}
          <button
            type="button"
            onClick={e => handleAction(e, "cart")}
            disabled={isOutOfStock}
            className={`w-9 h-9 border flex items-center justify-center transition-all duration-300 z-30 cursor-pointer relative pointer-events-auto ${
              isOutOfStock
                ? "bg-transparent text-zinc-300 border-zinc-200 cursor-not-allowed"
                : isInCart
                ? "bg-black text-white border-black"
                : "bg-white text-zinc-800 border-zinc-300 hover:bg-black hover:text-white hover:border-black"
            }`}
          >
            <ShoppingCart size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const INITIAL_FILTERS = {
  category: "All",
  gender: "All",
  minPrice: 0,
  maxPrice: 25000,
  colors: [],
  sizes: [],
  materials: [],
  inStockOnly: false,
  onSaleOnly: false,
  minRating: 0
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // ── Read URL query params into state on mount / URL change ──
  useEffect(() => {
    const newFilters = { ...INITIAL_FILTERS };

    const cat = searchParams.get("category");
    if (cat) newFilters.category = cat;

    const gender = searchParams.get("gender");
    if (gender) newFilters.gender = gender;

    const minPrice = searchParams.get("minPrice");
    if (minPrice) newFilters.minPrice = Number(minPrice);

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) newFilters.maxPrice = Number(maxPrice);

    const colors = searchParams.get("color") || searchParams.get("colors");
    if (colors) newFilters.colors = colors.split(",").map(c => c.trim()).filter(Boolean);

    const sizes = searchParams.get("size") || searchParams.get("sizes");
    if (sizes) newFilters.sizes = sizes.split(",").map(s => s.trim()).filter(Boolean);

    const materials = searchParams.get("material") || searchParams.get("materials");
    if (materials) newFilters.materials = materials.split(",").map(m => m.trim()).filter(Boolean);

    if (searchParams.get("inStock") === "true") newFilters.inStockOnly = true;
    if (searchParams.get("onSale") === "true") newFilters.onSaleOnly = true;

    const minRating = searchParams.get("minRating");
    if (minRating) newFilters.minRating = Number(minRating);

    const q = searchParams.get("search") || searchParams.get("q");
    setSearchTerm(q || "");

    const sort = searchParams.get("sort");
    if (sort) setSortBy(sort);

    setFilters(newFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const triggerToast = msg => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Dynamically compute unique values from products
  const maxPriceLimit = useMemo(() => {
    if (!products.length) return 25000;
    const max = Math.max(...products.map(p => p.price || 0));
    return Math.max(5000, Math.ceil(max / 1000) * 1000);
  }, [products]);

  const dynamicCategories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    products.forEach(p => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [products]);

  const availableColors = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.colors) {
        p.colors.split(",").forEach(c => {
          const trimmed = c.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }, [products]);

  const availableMaterials = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.material) set.add(p.material.trim());
    });
    return Array.from(set);
  }, [products]);

  // ── Write filter state back to URL query params ──
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.category !== "All") params.set("category", filters.category);
    if (filters.gender !== "All") params.set("gender", filters.gender);
    if (filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice < maxPriceLimit) params.set("maxPrice", String(filters.maxPrice));
    if (filters.colors.length > 0) params.set("color", filters.colors.join(","));
    if (filters.sizes.length > 0) params.set("size", filters.sizes.join(","));
    if (filters.materials.length > 0) params.set("material", filters.materials.join(","));
    if (filters.inStockOnly) params.set("inStock", "true");
    if (filters.onSaleOnly) params.set("onSale", "true");
    if (filters.minRating > 0) params.set("minRating", String(filters.minRating));
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (sortBy !== "newest") params.set("sort", sortBy);

    setSearchParams(params, { replace: true });
  }, [filters, searchTerm, sortBy, maxPriceLimit, setSearchParams]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({ ...INITIAL_FILTERS, maxPrice: maxPriceLimit });
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search term
        if (searchTerm && !p.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        // Category
        if (
          filters.category !== "All" &&
          p.category?.toLowerCase() !== filters.category.toLowerCase()
        ) {
          return false;
        }

        // Gender
        if (
          filters.gender !== "All" &&
          p.gender &&
          p.gender.toLowerCase() !== filters.gender.toLowerCase() &&
          p.gender !== "Unisex"
        ) {
          return false;
        }

        // Price range
        const price = p.price || 0;
        if (price < filters.minPrice || price > filters.maxPrice) {
          return false;
        }

        // Colors
        if (filters.colors.length > 0) {
          if (!p.colors) return false;
          const productColors = p.colors.toLowerCase().split(",").map(c => c.trim());
          const hasMatch = filters.colors.some(c =>
            productColors.includes(c.toLowerCase())
          );
          if (!hasMatch) return false;
        }

        // Sizes
        if (filters.sizes.length > 0) {
          const productSizes = (
            p.sizes || p.size_prices?.map(sp => sp.size).join(",") || ""
          )
            .toUpperCase()
            .split(",")
            .map(s => s.trim());
          const hasSizeMatch = filters.sizes.some(s =>
            productSizes.includes(s.toUpperCase())
          );
          if (!hasSizeMatch) return false;
        }

        // Materials
        if (filters.materials.length > 0) {
          if (!p.material) return false;
          const hasMatMatch = filters.materials.some(m =>
            p.material.toLowerCase().includes(m.toLowerCase())
          );
          if (!hasMatMatch) return false;
        }

        // In Stock Only
        if (filters.inStockOnly) {
          if (p.stock === 0 || p.stock_status === "Out of Stock") return false;
        }

        // On Sale Only
        if (filters.onSaleOnly) {
          if (!p.original_price || p.original_price <= (p.price || 0)) return false;
        }

        // Rating
        if (filters.minRating > 0) {
          if ((p.rating || 4.5) < filters.minRating) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        return 0;
      });
  }, [products, searchTerm, filters, sortBy]);

  // Active filter pills count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "All") count++;
    if (filters.gender !== "All") count++;
    if (filters.maxPrice < maxPriceLimit || filters.minPrice > 0) count++;
    if (filters.colors.length) count += filters.colors.length;
    if (filters.sizes.length) count += filters.sizes.length;
    if (filters.materials.length) count += filters.materials.length;
    if (filters.inStockOnly) count++;
    if (filters.onSaleOnly) count++;
    if (filters.minRating > 0) count++;
    if (searchTerm) count++;
    return count;
  }, [filters, searchTerm, maxPriceLimit]);

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <PageHeader
        title="Shop Collection"
        subtitle="Explore our luxury attire crafted with precision"
        breadcrumbItems={[{ label: "Home", path: "/" }, { label: "Shop" }]}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14 pb-20 md:pb-24 pt-8 md:pt-12">
        {/* Top Control Bar: Search, Sort, Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8 pb-6 border-b border-zinc-200">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search by name, fabric, or style..."
              className="w-full bg-white border border-zinc-300 pl-10 pr-9 py-3 text-xs text-zinc-900 outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-zinc-300 px-4 py-3 pr-9 text-[10px] font-bold uppercase tracking-wider text-zinc-800 outline-none focus:border-zinc-500 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-low">Sort: Price (Low to High)</option>
                <option value="price-high">Sort: Price (High to Low)</option>
                <option value="name">Sort: Name (A–Z)</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center justify-center gap-2 bg-white border border-zinc-300 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-800 hover:bg-zinc-100 transition-all"
            >
              <SlidersHorizontal size={13} className="text-[#b8860b]" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-extrabold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Applied Active Filter Pills Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-3 border border-zinc-200 shadow-sm">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mr-1">
              Active Filters:
            </span>

            {filters.category !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[9px] font-bold uppercase tracking-wider border border-zinc-300">
                Category: {filters.category}
                <button
                  type="button"
                  onClick={() => setFilters(p => ({ ...p, category: "All" }))}
                  className="hover:text-[#b8860b]"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {filters.gender !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[9px] font-bold uppercase tracking-wider border border-zinc-300">
                Gender: {filters.gender}
                <button
                  type="button"
                  onClick={() => setFilters(p => ({ ...p, gender: "All" }))}
                  className="hover:text-[#b8860b]"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {(filters.minPrice > 0 || filters.maxPrice < maxPriceLimit) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[9px] font-bold uppercase tracking-wider border border-zinc-300">
                Max ₹{filters.maxPrice.toLocaleString("en-IN")}
                <button
                  type="button"
                  onClick={() => setFilters(p => ({ ...p, minPrice: 0, maxPrice: maxPriceLimit }))}
                  className="hover:text-[#b8860b]"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {filters.sizes.map(sz => (
              <span
                key={sz}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[9px] font-bold uppercase tracking-wider border border-zinc-300"
              >
                Size: {sz}
                <button
                  type="button"
                  onClick={() =>
                    setFilters(p => ({ ...p, sizes: p.sizes.filter(x => x !== sz) }))
                  }
                  className="hover:text-[#b8860b]"
                >
                  <X size={10} />
                </button>
              </span>
            ))}

            {filters.colors.map(col => (
              <span
                key={col}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[9px] font-bold uppercase tracking-wider border border-zinc-300"
              >
                Color: {col}
                <button
                  type="button"
                  onClick={() =>
                    setFilters(p => ({ ...p, colors: p.colors.filter(x => x !== col) }))
                  }
                  className="hover:text-[#b8860b]"
                >
                  <X size={10} />
                </button>
              </span>
            ))}

            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[9px] font-bold uppercase tracking-wider border border-zinc-300">
                In Stock Only
                <button
                  type="button"
                  onClick={() => setFilters(p => ({ ...p, inStockOnly: false }))}
                  className="hover:text-[#b8860b]"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {filters.onSaleOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[9px] font-bold uppercase tracking-wider border border-zinc-300">
                On Sale
                <button
                  type="button"
                  onClick={() => setFilters(p => ({ ...p, onSaleOnly: false }))}
                  className="hover:text-[#b8860b]"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="text-[9px] font-bold uppercase tracking-widest text-[#b8860b] hover:underline ml-auto"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 items-start">
          {/* Filter Sidebar (Desktop Sticky + Mobile Drawer) */}
          <ShopFilterSidebar
            isOpen={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            totalResults={filteredProducts.length}
            allCategories={dynamicCategories}
            availableColors={availableColors}
            availableMaterials={availableMaterials}
            maxPriceLimit={maxPriceLimit}
          />

          {/* Product Grid Container */}
          <div className="lg:col-span-3">
            {/* Grid Header Info */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest mb-6 font-semibold">
              <span>Showing {filteredProducts.length} Results</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-zinc-200 animate-pulse" />
                    <div className="h-3 bg-zinc-200 animate-pulse w-2/3" />
                    <div className="h-3 bg-zinc-200 animate-pulse w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 md:gap-x-5 md:gap-y-8">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    idx={idx}
                    triggerToast={triggerToast}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white border border-zinc-200 p-8 max-w-md mx-auto shadow-sm">
                <div className="w-14 h-14 border border-zinc-300 flex items-center justify-center text-zinc-400 mx-auto mb-5">
                  <Filter size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-light text-zinc-900 tracking-widest uppercase mb-2">
                  No Products Match
                </h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed mb-6">
                  Try clearing or adjusting your search keywords, price slider, or selected options.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white px-6 py-3 hover:bg-zinc-800 transition-all"
                >
                  Reset All Filters
                  <ArrowUpRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 shadow-2xl flex items-center gap-3"
          >
            <p className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap">
              {feedbackMessage}
            </p>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="opacity-40 hover:opacity-100 ml-1"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
