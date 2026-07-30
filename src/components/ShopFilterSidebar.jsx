import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, RotateCcw, Filter, Check, Star } from "lucide-react";

export const DEFAULT_CATEGORIES = [
  "All",
  "T-Shirts",
  "Shirts",
  "Jeans",
  "Jackets",
  "Dresses",
  "Skirts",
  "Shorts",
  "Sweaters",
  "Accessories"
];

export const DEFAULT_GENDERS = ["All", "Men", "Women", "Unisex"];

export const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

export const COLOR_MAP = {
  black: "#000000",
  white: "#ffffff",
  blue: "#1e3a8a",
  navy: "#0f172a",
  red: "#991b1b",
  grey: "#6b7280",
  gray: "#6b7280",
  green: "#14532d",
  gold: "#c9a962",
  beige: "#f5f5dc",
  brown: "#451a03",
  pink: "#f472b6",
  yellow: "#eab308",
  purple: "#581c87"
};

const FilterSection = ({ title, children, defaultOpen = true, activeCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-200 py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 group-hover:text-black transition-colors">
            {title}
          </span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#b8860b] text-white shop-sidebar-badge flex items-center justify-center font-extrabold shrink-0">
              {activeCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={14} className="text-zinc-400 group-hover:text-black transition-colors shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-zinc-400 group-hover:text-black transition-colors shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShopFilterSidebar = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  resetFilters,
  totalResults,
  allCategories = DEFAULT_CATEGORIES,
  availableColors = [],
  availableSizes = DEFAULT_SIZES,
  availableMaterials = [],
  maxPriceLimit = 25000
}) => {
  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category && filters.category !== "All") count++;
    if (filters.gender && filters.gender !== "All") count++;
    if (filters.maxPrice < maxPriceLimit || filters.minPrice > 0) count++;
    if (filters.colors && filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes && filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.inStockOnly) count++;
    if (filters.onSaleOnly) count++;
    if (filters.minRating > 0) count++;
    if (filters.materials && filters.materials.length > 0) count += filters.materials.length;
    return count;
  };

  const activeCount = getActiveFilterCount();

  const toggleArrayFilter = (field, item) => {
    const current = filters[field] || [];
    if (current.includes(item)) {
      setFilters(prev => ({ ...prev, [field]: current.filter(x => x !== item) }));
    } else {
      setFilters(prev => ({ ...prev, [field]: [...current, item] }));
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full space-y-2 text-zinc-900">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#b8860b]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
              Refine By
            </h2>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 hover:text-[#b8860b] transition-colors"
            >
              <RotateCcw size={11} />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {activeCount > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#b8860b]/10 border border-[#b8860b]/30 rounded-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#b8860b] shop-sidebar-badge">
              {activeCount} Filter{activeCount > 1 ? "s" : ""} Active
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-black"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Filter Sections Scroll Container */}
      <div className="flex-1 overflow-y-auto pr-1 text-xs scrollbar-hide space-y-1">
        
        {/* Category Filter */}
        <FilterSection
          title="Categories"
          defaultOpen={true}
          activeCount={filters.category !== "All" ? 1 : 0}
        >
          <div className="space-y-1">
            {allCategories.map(cat => {
              const isSelected = filters.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                  className={`w-full flex items-center justify-between py-2 px-3 text-left uppercase transition-all rounded-sm ${
                    isSelected
                      ? "bg-zinc-100 text-zinc-900 font-bold border-l-2 border-[#b8860b]"
                      : "text-zinc-600 hover:text-black hover:bg-zinc-50"
                  }`}
                >
                  <span className="shop-sidebar-label">{cat}</span>
                  {isSelected && <Check size={13} className="text-[#b8860b] shrink-0" />}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Gender Filter */}
        <FilterSection
          title="Gender"
          defaultOpen={true}
          activeCount={filters.gender !== "All" ? 1 : 0}
        >
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_GENDERS.map(g => {
              const isSelected = filters.gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, gender: g }))}
                  className={`py-2 px-2 text-center border uppercase transition-all ${
                    isSelected
                      ? "bg-black text-white border-black font-bold"
                      : "bg-white text-zinc-600 border-zinc-300 hover:border-black hover:text-black"
                  }`}
                >
                  <span className="shop-sidebar-label">{g}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Price Slider & Presets */}
        <FilterSection
          title="Price Range"
          defaultOpen={true}
          activeCount={filters.maxPrice < maxPriceLimit || filters.minPrice > 0 ? 1 : 0}
        >
          <div className="space-y-3.5">
            {/* Price values readout */}
            <div className="flex items-center justify-between text-xs font-mono text-zinc-700">
              <span>₹{filters.minPrice?.toLocaleString("en-IN")}</span>
              <span className="text-[#b8860b] font-bold">₹{filters.maxPrice?.toLocaleString("en-IN")}</span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={maxPriceLimit}
                step={500}
                value={filters.maxPrice || maxPriceLimit}
                onChange={e =>
                  setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))
                }
                className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#b8860b]"
              />
            </div>

            {/* Price Presets */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Under ₹1,500", max: 1500, min: 0 },
                { label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
                { label: "₹3,000 – ₹5,000", min: 3000, max: 5000 },
                { label: "Above ₹5,000", min: 5000, max: maxPriceLimit }
              ].map(preset => {
                const isSelected =
                  filters.minPrice === preset.min && filters.maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setFilters(prev => ({
                        ...prev,
                        minPrice: preset.min,
                        maxPrice: preset.max
                      }))
                    }
                    className={`py-2 px-2 border text-center uppercase transition-all rounded-sm flex items-center justify-center ${
                      isSelected
                        ? "border-[#b8860b] bg-[#b8860b]/10 text-[#b8860b] font-bold"
                        : "border-zinc-300 text-zinc-600 hover:border-black hover:text-black"
                    }`}
                  >
                    <span className="shop-sidebar-preset-btn">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </FilterSection>

        {/* Sizes Filter */}
        <FilterSection
          title="Sizes"
          defaultOpen={true}
          activeCount={filters.sizes?.length || 0}
        >
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(sz => {
              const isSelected = filters.sizes?.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleArrayFilter("sizes", sz)}
                  className={`w-10 h-10 flex items-center justify-center border font-bold uppercase transition-all ${
                    isSelected
                      ? "bg-black text-white border-black shadow"
                      : "bg-white text-zinc-600 border-zinc-300 hover:border-black hover:text-black"
                  }`}
                >
                  <span className="shop-sidebar-label">{sz}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Colors Swatches Filter */}
        {availableColors.length > 0 && (
          <FilterSection
            title="Colors"
            defaultOpen={true}
            activeCount={filters.colors?.length || 0}
          >
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map(colorName => {
                const lower = colorName.toLowerCase().trim();
                const hexColor = COLOR_MAP[lower] || "#333333";
                const isSelected = filters.colors?.includes(colorName);
                const isWhite = hexColor === "#ffffff" || lower === "white";

                return (
                  <button
                    key={colorName}
                    type="button"
                    title={colorName}
                    onClick={() => toggleArrayFilter("colors", colorName)}
                    className={`group relative w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-[#b8860b] ring-offset-white scale-110"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: hexColor }}
                  >
                    {isWhite && (
                      <span className="absolute inset-0 rounded-full border border-zinc-300" />
                    )}
                    {isSelected && (
                      <Check
                        size={12}
                        className={isWhite ? "text-black" : "text-white drop-shadow"}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Material Filter */}
        {availableMaterials.length > 0 && (
          <FilterSection
            title="Material"
            defaultOpen={false}
            activeCount={filters.materials?.length || 0}
          >
            <div className="space-y-1.5">
              {availableMaterials.map(mat => {
                const isSelected = filters.materials?.includes(mat);
                return (
                  <label
                    key={mat}
                    className="flex items-center gap-2.5 text-zinc-600 hover:text-black cursor-pointer py-1 uppercase tracking-wider"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArrayFilter("materials", mat)}
                      className="w-3.5 h-3.5 accent-[#b8860b] bg-white border-zinc-300 rounded-sm"
                    />
                    <span className="shop-sidebar-label">{mat}</span>
                  </label>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Availability & Offers */}
        <FilterSection
          title="Availability & Offers"
          defaultOpen={false}
          activeCount={(filters.inStockOnly ? 1 : 0) + (filters.onSaleOnly ? 1 : 0)}
        >
          <div className="space-y-2">
            <label className="flex items-center justify-between text-zinc-600 uppercase tracking-wider cursor-pointer hover:text-black py-1">
              <span className="shop-sidebar-label">In Stock Only</span>
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={e =>
                  setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))
                }
                className="w-4 h-4 accent-[#b8860b] bg-white border-zinc-300"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-600 uppercase tracking-wider cursor-pointer hover:text-black py-1">
              <span className="shop-sidebar-label">On Sale / Discounted</span>
              <input
                type="checkbox"
                checked={filters.onSaleOnly}
                onChange={e =>
                  setFilters(prev => ({ ...prev, onSaleOnly: e.target.checked }))
                }
                className="w-4 h-4 accent-[#b8860b] bg-white border-zinc-300"
              />
            </label>
          </div>
        </FilterSection>

        {/* Minimum Rating */}
        <FilterSection
          title="Rating"
          defaultOpen={false}
          activeCount={filters.minRating > 0 ? 1 : 0}
        >
          <div className="space-y-1">
            {[4.5, 4.0, 3.5].map(stars => {
              const isSelected = filters.minRating === stars;
              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      minRating: isSelected ? 0 : stars
                    }))
                  }
                  className={`w-full flex items-center justify-between py-2 px-3 uppercase transition-colors rounded-sm ${
                    isSelected
                      ? "bg-zinc-100 text-zinc-900 font-bold"
                      : "text-zinc-600 hover:text-black hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[#b8860b]">
                    <Star size={12} fill="currentColor" />
                    <span className="shop-sidebar-label">{stars} & Above</span>
                  </div>
                  {isSelected && <Check size={13} className="text-[#b8860b] shrink-0" />}
                </button>
              );
            })}
          </div>
        </FilterSection>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block w-full sticky top-28 space-y-6">
        {sidebarContent}
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xs sm:max-w-sm bg-[#faf9f5] border-r border-zinc-200 h-full p-6 flex flex-col justify-between shadow-2xl z-10 text-zinc-900"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8860b]">
                  Filter Products
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-zinc-400 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>

              {sidebarContent}

              {/* Mobile Drawer Bottom Actions */}
              <div className="pt-4 border-t border-zinc-200 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    onClose();
                  }}
                  className="w-1/3 py-3 border border-zinc-300 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-black"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-2/3 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                >
                  Show ({totalResults})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShopFilterSidebar;
