import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "./Home/PageHeader";
import { useStore } from "./StoreProvider";
import { db } from "./Firebase";
import { doc, getDoc } from "firebase/firestore";

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart, loading } = useStore();
  const navigate = useNavigate();
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [productStocks, setProductStocks] = useState({});

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stocksMap = {};
        for (const item of wishlist) {
          const docSnap = await getDoc(doc(db, "products", item.id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            stocksMap[item.id] = {
              stock: data.stock !== undefined ? data.stock : 10,
              stock_status: data.stock_status || "In Stock"
            };
          }
        }
        setProductStocks(stocksMap);
      } catch (err) {
        console.error("Error fetching wishlist stocks:", err);
      }
    };
    if (wishlist.length > 0) {
      fetchStocks();
    }
  }, [wishlist]);

  const triggerToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleMoveToCart = async (product) => {
    const defaultSize = product.size_prices && product.size_prices.length > 0
      ? (product.size_prices.find(s => s.size?.toUpperCase() === 'L') || product.size_prices[0])
      : null;
    await addToCart(product, defaultSize);
    await removeFromWishlist(product.id);
    triggerToast("Moved to your bag!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PageHeader
        title="Wishlist"
        subtitle="Your saved favourites"
        breadcrumbItems={[{ label: 'Home', path: '/' }, { label: 'Shop', path: '/shop' }, { label: 'Wishlist' }]}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14 py-10 md:py-14">
        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 border border-white/10 flex items-center justify-center text-white/25 mx-auto mb-5">
              <Heart size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-light text-white tracking-widest uppercase mb-2">Your wishlist is empty</h3>
            <p className="text-[13px] text-white/35 leading-relaxed mb-6">Save items you love and come back to them anytime.</p>
            <Link to="/shop" className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-black font-semibold text-[10px] uppercase tracking-[0.2em] hover:bg-white/85 transition-all">
              Explore Collection <ArrowRight size={13} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
                {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} Saved
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-5 md:gap-y-8">
              {wishlist.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.4 }}
                  className="group relative flex flex-col"
                >
                  <button
                    onClick={() => { removeFromWishlist(item.id); triggerToast("Removed from wishlist"); }}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white/40 hover:bg-red-900/50 hover:text-red-400 flex items-center justify-center transition-all duration-300"
                  >
                    <X size={13} strokeWidth={2} />
                  </button>

                  {
                    (() => {
                      const stockInfo = productStocks[item.id] || { stock: 999, stock_status: "In Stock" };
                      const isOutOfStock = stockInfo.stock === 0 || stockInfo.stock_status === "Out of Stock";

                      return (
                        <>
                          <div onClick={() => navigate(`/product/${item.id}`)} className="relative w-full aspect-[3/4] overflow-hidden bg-[#1a1a1a] cursor-pointer">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            {isOutOfStock && (
                              <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
                                <span className="bg-white text-black font-black uppercase text-[10px] tracking-widest px-3 py-1.5">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 flex-grow flex flex-col">
                            {item.category && <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-1">{item.category}</span>}
                            <h3 onClick={() => navigate(`/product/${item.id}`)}
                              className="text-[13px] sm:text-sm font-semibold text-white/80 leading-snug mb-2 group-hover:text-white transition-colors cursor-pointer line-clamp-2"
                            >{item.name}</h3>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-sm font-bold text-white">₹{Number(item.price).toLocaleString("en-IN")}</span>
                              <button 
                                onClick={() => !isOutOfStock && handleMoveToCart(item)}
                                disabled={isOutOfStock}
                                className={`w-9 h-9 flex items-center justify-center transition-all ${
                                  isOutOfStock 
                                    ? 'bg-[#1a1a1a] text-white/20 border border-white/5 cursor-not-allowed' 
                                    : 'bg-white text-black hover:bg-white/85'
                                }`}
                              >
                                <ShoppingBag size={14} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()
                  }
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {feedbackMessage && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-5 py-3 shadow-2xl flex items-center gap-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-40 hover:opacity-100 ml-1"><X size={13} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
