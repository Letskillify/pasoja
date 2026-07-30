import React, { useEffect, useState } from "react";
import MiniLoader from "../components/MiniLoader";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import { collection, getDocs, addDoc, serverTimestamp, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, MapPin, User, Phone, Mail, CheckCircle, X, ShieldCheck, Zap, Sparkles, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/Home/PageHeader";

const Checkout = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
    paymentMethod: "online",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    const load = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "cart"));
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setFormData(prev => ({ ...prev, name: user.displayName || "", email: user.email || "" }));

        // Fetch saved user addresses from Firestore
        const addressSnap = await getDocs(collection(db, "users", user.uid, "addresses"));
        const addrs = addressSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          setFormData(prev => ({
            ...prev,
            name: defaultAddr.name || user.displayName || prev.name,
            phone: defaultAddr.phone || prev.phone,
            address: defaultAddr.address || "",
            city: defaultAddr.city || "",
            state: defaultAddr.state || "",
            pincode: defaultAddr.pincode || ""
          }));
        }
      } catch (error) { console.error("Error:", error); }
      finally { setLoading(false); }
    };
    load();
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [user]);

  const triggerToast = (msg) => { setFeedbackMessage(msg); setTimeout(() => setFeedbackMessage(null), 4000); };
  const handleInputChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const total = items.reduce((sum, i) => sum + ((Number(i.price) || 0) * (i.quantity || 1)), 0);

  const clearCart = async () => {
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "cart"));
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "users", user.uid, "cart", d.id))));
    } catch (e) { console.error("Error clearing cart:", e); }
  };

  const saveOrder = async (paymentId = "COD", status = "confirmed", paymentStatus = "captured") => {
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid, userEmail: user.email, items, total,
        shipping: formData, paymentMethod: formData.paymentMethod,
        paymentId, status, paymentStatus, createdAt: serverTimestamp(),
      });
      if (status === "confirmed") { 
        // Update product stocks
        for (const item of items) {
          try {
            // Find base product id (robust fallback if it's cartId format)
            const productId = item.id || item.cartId?.split("-")[0];
            if (productId) {
              const productRef = doc(db, "products", productId);
              const productSnap = await getDoc(productRef);
              if (productSnap.exists()) {
                const currentStock = Number(productSnap.data().stock) || 0;
                const quantityPurchased = Number(item.quantity) || 1;
                const newStock = Math.max(0, currentStock - quantityPurchased);
                
                // Set matching status
                let newStatus = "In Stock";
                if (newStock === 0) {
                  newStatus = "Out of Stock";
                } else if (newStock <= 5) {
                  newStatus = "Low Stock";
                }

                await updateDoc(productRef, {
                  stock: newStock,
                  stock_status: newStatus
                });
              }
            }
          } catch (stockErr) {
            console.error("Failed to update stock for item", item.id, stockErr);
          }
        }
        await clearCart(); 
        setOrderStatus("success"); 
      }
      else { setOrderStatus("failed"); }
    } catch (error) { console.error("Error saving order:", error); triggerToast("Order save failed. Please contact support."); }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) { triggerToast("Your bag is empty!"); return; }
    setIsProcessing(true);
    if (formData.paymentMethod === "online") {
      const options = {
        key: "rzp_test_YOUR_KEY_HERE", amount: total * 100, currency: "INR",
        name: "Pasoja", description: "Premium Apparel Order", image: "https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png",
        handler: async (response) => { await saveOrder(response.razorpay_payment_id, "confirmed", "captured"); setIsProcessing(false); },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: "#000000" },
        modal: { ondismiss: () => setIsProcessing(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => { await saveOrder(response.error.metadata.payment_id, "failed", "failed"); setIsProcessing(false); });
      rzp.open();
    } else {
      await saveOrder("COD", "confirmed", "pending");
      setIsProcessing(false);
    }
  };

  const inputClass = "w-full bg-white border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-400";

  if (loading) return <MiniLoader message="Preparing Checkout" />;

  if (!user) return (
    <div className="min-h-screen bg-[#faf9f5]">
      <PageHeader title="Checkout" subtitle="Secure your order" breadcrumbItems={[{ label: "Home", path: "/" }, { label: "Checkout" }]} />
      <div className="flex flex-col items-center justify-center py-28 px-6 text-center">
        <div className="w-16 h-16 border border-zinc-300 flex items-center justify-center mb-5 bg-white shadow-sm">
          <ShieldCheck size={26} strokeWidth={1.2} className="text-zinc-500" />
        </div>
        <h2 className="text-xl font-light text-zinc-900 tracking-widest uppercase mb-2">Sign in Required</h2>
        <p className="text-[13px] text-zinc-500 max-w-xs mb-6 leading-relaxed">Please sign in to proceed with your order.</p>
        <Link to="/login?redirect=checkout" className="px-8 py-3.5 bg-black text-white font-semibold text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-sm">Sign In</Link>
      </div>
    </div>
  );

  if (orderStatus === "success") return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center px-6">
      <div className="max-w-md text-center py-20 bg-white border border-zinc-200 p-8 shadow-sm">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 border border-zinc-300 flex items-center justify-center mx-auto mb-6 bg-zinc-50"
        >
          <CheckCircle size={36} className="text-emerald-600" />
        </motion.div>
        <h2 className="text-3xl font-light text-zinc-900 tracking-widest uppercase mb-3">Order Confirmed!</h2>
        <p className="text-[14px] text-zinc-600 mb-8 leading-relaxed">Thank you. We're preparing your order for shipment.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="px-6 py-3.5 bg-black text-white font-semibold text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-sm">View Orders</Link>
          <Link to="/shop" className="px-6 py-3.5 bg-white border border-zinc-300 text-zinc-700 font-semibold text-[10px] uppercase tracking-[0.2em] hover:border-black hover:text-black transition-all shadow-sm">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );

  if (orderStatus === "failed") return (
    <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center px-6">
      <div className="max-w-md text-center py-20 bg-white border border-zinc-200 p-8 shadow-sm">
        <div className="w-20 h-20 border border-red-300 bg-red-50 flex items-center justify-center mx-auto mb-6">
          <X size={36} className="text-red-600" />
        </div>
        <h2 className="text-3xl font-light text-zinc-900 tracking-widest uppercase mb-3">Payment Failed</h2>
        <p className="text-[14px] text-zinc-600 mb-8 leading-relaxed">The transaction could not be completed. Please try again.</p>
        <button onClick={() => setOrderStatus(null)} className="px-8 py-3.5 bg-black text-white font-semibold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <PageHeader title="Checkout" subtitle="Complete your purchase" breadcrumbItems={[{ label: "Home", path: "/" }, { label: "Cart", path: "/cart" }, { label: "Checkout" }]} />

      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14 py-10 md:py-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handlePlaceOrder} className="space-y-8">

              {/* Shipping */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-200">
                  <div className="w-9 h-9 border border-zinc-300 text-zinc-600 flex items-center justify-center bg-white"><MapPin size={15} /></div>
                  <h2 className="text-[13px] font-light text-zinc-900 uppercase tracking-widest">Shipping Address</h2>
                </div>

                {/* SAVED ADDRESS SELECTOR */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3 mb-6 bg-white border border-zinc-200 p-4 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#b8860b] uppercase tracking-widest">
                        Choose Saved Shipping Address
                      </span>
                      <Link to="/account" className="text-[9px] text-zinc-500 hover:text-black uppercase tracking-wider underline">
                        Manage Addresses
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setFormData(prev => ({
                                ...prev,
                                name: addr.name || prev.name,
                                phone: addr.phone || prev.phone,
                                address: addr.address || "",
                                city: addr.city || "",
                                state: addr.state || "",
                                pincode: addr.pincode || ""
                              }));
                              triggerToast(`Selected: ${addr.name}`);
                            }}
                            className={`p-3.5 border cursor-pointer transition-all relative rounded ${
                              isSelected
                                ? 'border-black bg-zinc-50 shadow-sm'
                                : 'border-zinc-200 bg-white hover:border-zinc-400'
                            }`}
                          >
                            {addr.isDefault && (
                              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#b8860b]/15 border border-[#b8860b]/30 text-[#b8860b] text-[8px] font-bold uppercase tracking-wider">
                                Default
                              </span>
                            )}
                            <div className="flex items-start gap-2.5">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                                isSelected ? 'border-black bg-black text-white' : 'border-zinc-400'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              <div className="space-y-1 text-xs pr-10">
                                <p className="font-bold text-zinc-900 uppercase tracking-wide">{addr.name}</p>
                                <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-2">
                                  {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <p className="text-[10px] text-[#b8860b] font-semibold">Ph: {addr.phone}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div
                        onClick={() => {
                          setSelectedAddressId("custom");
                          setFormData(prev => ({
                            ...prev,
                            address: "",
                            city: "",
                            state: "",
                            pincode: ""
                          }));
                        }}
                        className={`p-3.5 border cursor-pointer transition-all flex items-center justify-center gap-2 rounded ${
                          selectedAddressId === "custom"
                            ? 'border-black bg-zinc-50'
                            : 'border-dashed border-zinc-300 bg-white hover:border-zinc-400'
                        }`}
                      >
                        <Plus size={14} className="text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                          + Enter Custom Address
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Full Name</label>
                    <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" /><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="Your name" /></div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Email</label>
                    <div className="relative"><Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" /><input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="email@example.com" /></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Phone Number</label>
                  <div className="relative"><Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" /><input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="+91 00000 00000" /></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Full Address</label>
                  <textarea name="address" required rows={3} value={formData.address} onChange={handleInputChange} className={`${inputClass} resize-none`} placeholder="Street, house number, area" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["city", "state", "pincode"].map((field) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 capitalize">{field}</label>
                      <input type="text" name={field} required value={formData[field]} onChange={handleInputChange} className={inputClass} placeholder={field === 'pincode' ? "000000" : ""} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment */}
              <section className="space-y-5 pt-6 border-t border-zinc-200">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-200">
                  <div className="w-9 h-9 border border-zinc-300 text-zinc-600 flex items-center justify-center bg-white"><CreditCard size={15} /></div>
                  <h2 className="text-[13px] font-light text-zinc-900 uppercase tracking-widest">Payment Method</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "online", label: "Online Payment", desc: "Cards, UPI, Netbanking", icon: Zap },
                    { id: "cod", label: "Cash on Delivery", desc: "Pay when delivered", icon: Sparkles }
                  ].map((method) => {
                    const Icon = method.icon;
                    const active = formData.paymentMethod === method.id;
                    return (
                      <button key={method.id} type="button" onClick={() => setFormData(p => ({ ...p, paymentMethod: method.id }))}
                        className={`p-4 border-2 transition-all flex items-start gap-3 text-left ${active ? 'border-black bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}
                      >
                        <div className={`w-9 h-9 flex items-center justify-center shrink-0 border ${active ? 'bg-black text-white border-black' : 'text-zinc-500 border-zinc-300 bg-white'}`}><Icon size={15} /></div>
                        <div>
                          <p className={`text-[11px] font-semibold uppercase tracking-wider ${active ? 'text-zinc-900' : 'text-zinc-600'}`}>{method.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{method.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <button type="submit" disabled={isProcessing}
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-semibold text-[11px] uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2.5"
              >
                {isProcessing ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Processing...</> : <>Place Order</>}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-zinc-200 p-6 sticky top-28 shadow-sm">
              <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.25em] mb-5 pb-4 border-b border-zinc-200">Order Summary</h3>
              <div className="space-y-4 mb-6 max-h-[300px] overflow-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-zinc-100 shrink-0 border border-zinc-200 p-1.5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 py-0.5">
                      <h4 className="text-[12px] font-bold text-zinc-900 line-clamp-1">{item.name}</h4>
                      {item.size && <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Size: {item.size}</p>}
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[12px] font-bold text-zinc-900">₹{item.price}</span>
                        <span className="text-[9px] text-zinc-600 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5">×{item.quantity || 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5 pt-4 border-t border-zinc-200">
                <div className="flex justify-between text-[12px]"><span className="text-zinc-600">Subtotal</span><span className="font-bold text-zinc-900">₹{total}</span></div>
                <div className="flex justify-between text-[12px]"><span className="text-zinc-600">Delivery</span><span className="text-zinc-900 font-bold">Free</span></div>
                <div className="flex justify-between pt-4 border-t border-dashed border-zinc-300 items-baseline">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.2em]">Total</span>
                  <span className="text-2xl font-light text-zinc-900 tracking-widest font-heading">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 shadow-2xl flex items-center gap-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">{feedbackMessage}</p>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-40 hover:opacity-100 ml-1"><X size={13} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
