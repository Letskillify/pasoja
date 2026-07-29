import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, ShieldCheck, Truck, RotateCcw, ChevronRight, Gift, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Home/PageHeader";
import { useStore } from "../components/StoreProvider";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import { doc, getDoc } from "firebase/firestore";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, loading } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGiftNoteOpen, setIsGiftNoteOpen] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  const total = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);
  const [productStocks, setProductStocks] = useState({});

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stocksMap = {};
        for (const item of cart) {
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
        console.error("Error fetching cart stock:", err);
      }
    };
    if (cart.length > 0) {
      fetchStocks();
    }
  }, [cart]);

  const hasOutOfStockItem = cart.some(item => {
    const stockInfo = productStocks[item.id];
    if (!stockInfo) return false;
    return stockInfo.stock === 0 || stockInfo.stock_status === "Out of Stock" || item.quantity > stockInfo.stock;
  });

  const handleCheckout = () => {
    if (!user) navigate("/login?redirect=checkout");
    else navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">Loading your bag...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PageHeader
        title="Shopping Bag"
        subtitle="Review your selections before checkout"
        breadcrumbItems={[{ label: 'Home', path: '/' }, { label: 'Shop', path: '/shop' }, { label: 'Cart' }]}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Cart Items */}
          <div className="lg:col-span-8 w-full">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 max-w-md mx-auto">
                  <div className="w-16 h-16 border border-white/10 flex items-center justify-center text-white/25 mx-auto mb-5">
                    <ShoppingBag size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-light text-white tracking-widest uppercase mb-2">Your bag is empty</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed mb-6">Start exploring our collection.</p>
                  <Link to="/shop" className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-black font-semibold text-[10px] uppercase tracking-[0.2em] hover:bg-white/85 transition-all">
                    Continue Shopping <ArrowRight size={13} />
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
                      {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                    </h2>
                  </div>
                  <motion.div layout className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {cart.map((item, idx) => {
                        const stockInfo = productStocks[item.id] || { stock: 999, stock_status: "In Stock" };
                        const isOutOfStock = stockInfo.stock === 0 || stockInfo.stock_status === "Out of Stock";

                        return (
                          <motion.div
                          key={`${item.cartId || item.id}-${idx}`}
                          layout
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.4 }}
                          className="group bg-[#0d0d0d] border border-white/[0.06] p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-white/[0.12] transition-all"
                        >
                          <Link to={`/product/${item.id}`} className="w-20 h-24 bg-[#1a1a1a] shrink-0 overflow-hidden border border-white/[0.06]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </Link>
                          <div className="flex-1 text-center sm:text-left space-y-0.5">
                            {item.category && <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">{item.category}</span>}
                            <h3 className="text-sm font-bold text-white/85 group-hover:text-white transition-colors leading-tight">{item.name}</h3>
                            {item.size && <p className="text-[11px] font-medium text-white/35 uppercase tracking-wider">Size: {item.size}</p>}
                            <div className="flex flex-wrap items-center gap-2 mt-1 sm:justify-start justify-center">
                              <p className="text-sm font-bold text-white">₹{Number(item.price).toLocaleString("en-IN")}</p>
                              {isOutOfStock ? (
                                <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">Out of Stock</span>
                              ) : item.quantity > stockInfo.stock ? (
                                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">Only {stockInfo.stock} left</span>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center bg-[#1a1a1a] border border-white/10 h-9">
                            <button 
                              onClick={() => updateQuantity(item.cartId || item.id, -1)} 
                              disabled={item.quantity <= 1}
                              className="w-8 h-full flex items-center justify-center text-white/35 hover:text-white transition-colors text-sm font-bold disabled:opacity-20"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-[13px] font-bold text-white">{item.quantity || 1}</span>
                            <button 
                              onClick={() => {
                                if (item.quantity < stockInfo.stock) {
                                  updateQuantity(item.cartId || item.id, 1);
                                }
                              }} 
                              disabled={isOutOfStock || item.quantity >= stockInfo.stock}
                              className="w-8 h-full flex items-center justify-center text-white/35 hover:text-white transition-colors text-sm font-bold disabled:opacity-20"
                            >
                              +
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.cartId || item.id)}
                            className="p-2.5 bg-[#1a1a1a] text-white/25 border border-white/10 hover:bg-red-900/30 hover:text-red-400 hover:border-red-500/20 transition-all"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </motion.div>
                      );
                    })}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <aside className="lg:col-span-4 w-full sticky top-28">
              <div className="bg-[#0c0c0c] border border-white/[0.06] p-6">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30 mb-5 pb-4 border-b border-white/[0.06]">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-[12px] text-white/35">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[12px] text-white/35">
                    <span>Shipping</span>
                    <span className="text-white font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-[12px] text-white/35">
                    <span>GST (Included)</span>
                    <span className="font-bold text-white">₹0</span>
                  </div>

                  {/* Gift Note */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <button onClick={() => setIsGiftNoteOpen(!isGiftNoteOpen)}
                      className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/35 hover:text-white transition-colors"
                    >
                      <Gift size={12} strokeWidth={1.5} />
                      {isGiftNoteOpen ? 'Remove gift note' : 'Add a gift note'}
                    </button>
                    <AnimatePresence>
                      {isGiftNoteOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2">
                          <textarea value={giftNote} onChange={(e) => setGiftNote(e.target.value)}
                            placeholder="Write your message..." maxLength={180}
                            className="w-full h-16 bg-[#0a0a0a] border border-white/10 p-2.5 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-white/25 resize-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-4 mt-2 border-t border-dashed border-white/[0.08] flex justify-between items-end">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.2em]">Total</span>
                    <span className="text-2xl font-light text-white tracking-widest font-heading">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button 
                  onClick={() => !hasOutOfStockItem && handleCheckout()}
                  disabled={hasOutOfStockItem}
                  className={`w-full py-4 font-semibold text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 mb-5 ${
                    hasOutOfStockItem
                      ? 'bg-white/10 text-white/20 cursor-not-allowed'
                      : 'bg-white hover:bg-white/85 text-black'
                  }`}
                >
                  {hasOutOfStockItem ? 'Remove Out of Stock Items' : 'Checkout'} <ChevronRight size={14} />
                </button>

                <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                  {[
                    { icon: ShieldCheck, title: 'Secure Checkout', sub: '256-bit encryption' },
                    { icon: Truck, title: 'Free Shipping', sub: 'On orders ₹1999+' },
                    { icon: RotateCcw, title: 'Easy Returns', sub: '30-day hassle-free' },
                  ].map(({ icon: Icon, title, sub }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/25 shrink-0">
                        <Icon size={13} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide">{title}</p>
                        <p className="text-[10px] text-white/25">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;