import React, { useEffect, useState } from "react";
import MiniLoader from "../components/MiniLoader";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import {
  collection, getDocs, addDoc, serverTimestamp,
  doc, deleteDoc, getDoc, updateDoc, query, where
} from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, User, Phone, Mail, CheckCircle, X,
  ShieldCheck, ChevronRight, Plus, Check, Lock, Tag,
  ArrowRight, Package, Truck, Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "../components/SEOHead";
import OptimizedCloudinaryImage from "../components/OptimizedCloudinaryImage";
import { getOptimizedCloudinaryUrl } from "../utils/cloudinaryUtils";

/* ─── Payment method icons (inline SVG logos) ───────────────────────────── */
const UPIIcon = () => (
  <svg viewBox="0 0 64 40" width="40" height="25" fill="none">
    <rect width="64" height="40" rx="4" fill="#fff" />
    <text x="32" y="26" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#6B3FA0" fontFamily="sans-serif">UPI</text>
  </svg>
);
const GPayIcon = () => (
  <svg viewBox="0 0 80 32" width="48" height="22" fill="none">
    <text x="0" y="22" fontSize="14" fontWeight="800" fontFamily="sans-serif">
      <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan>
      <tspan fill="#5F6368" fontSize="12"> Pay</tspan>
    </text>
  </svg>
);
const PhonePeIcon = () => (
  <svg viewBox="0 0 80 32" width="52" height="22" fill="none">
    <rect width="80" height="32" rx="4" fill="#5F259F" />
    <text x="40" y="22" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#fff" fontFamily="sans-serif">PhonePe</text>
  </svg>
);
const PaytmIcon = () => (
  <svg viewBox="0 0 80 32" width="48" height="22" fill="none">
    <rect width="80" height="32" rx="4" fill="#00BAF2" />
    <text x="40" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff" fontFamily="sans-serif">Paytm</text>
  </svg>
);
const VisaIcon = () => (
  <svg viewBox="0 0 60 20" width="40" height="16" fill="none">
    <text x="0" y="16" fontSize="17" fontWeight="900" fill="#1A1F71" fontFamily="sans-serif" letterSpacing="-1">VISA</text>
  </svg>
);
const MasterIcon = () => (
  <svg viewBox="0 0 38 24" width="32" height="22">
    <circle cx="14" cy="12" r="11" fill="#EB001B" opacity="0.9" />
    <circle cx="24" cy="12" r="11" fill="#F79E1B" opacity="0.9" />
    <path d="M19 4.5a11 11 0 0 1 0 15 11 11 0 0 1 0-15z" fill="#FF5F00" />
  </svg>
);

/* ─── Order Status pages ─────────────────────────────────────────────────── */
const OrderSuccess = ({ navigate }) => (
  <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 pt-[145px] md:pt-[105px] pb-16">
    <SEOHead title="Order Confirmed | Pasoja" robots="noindex" url="https://pasoja.in/checkout" />
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-sm border border-zinc-200 max-w-md w-full overflow-hidden"
    >
      {/* Green banner */}
      <div className="bg-emerald-500 px-8 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Order Confirmed!</h1>
        <p className="text-emerald-100 text-sm">Thank you for shopping with Pasoja</p>
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Steps */}
        {[
          { icon: Package, label: "Order Placed", desc: "Your order has been received", done: true },
          { icon: Truck, label: "Processing", desc: "We're preparing your items", done: false },
          { icon: Home, label: "Delivery", desc: "Estimated 3–5 business days", done: false },
        ].map(({ icon: Icon, label, desc, done }, i) => (
          <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${done ? "bg-emerald-50 border border-emerald-100" : "bg-zinc-50 border border-zinc-100"}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-500" : "bg-zinc-200"}`}>
              <Icon size={16} className={done ? "text-white" : "text-zinc-500"} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${done ? "text-emerald-700" : "text-zinc-600"}`}>{label}</p>
              <p className="text-xs text-zinc-500">{desc}</p>
            </div>
            {done && <Check size={16} className="text-emerald-500 ml-auto shrink-0" />}
          </div>
        ))}

        <div className="pt-2 flex flex-col gap-2.5">
          <Link to="/orders" className="w-full py-3.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Package size={15} /> View My Orders
          </Link>
          <Link to="/shop" className="w-full py-3 border border-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 transition-colors text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </motion.div>
  </div>
);

const OrderFailed = ({ onRetry }) => (
  <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 pt-[145px] md:pt-[105px] pb-16">
    <SEOHead title="Payment Failed | Pasoja" robots="noindex" url="https://pasoja.in/checkout" />
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-sm border border-zinc-200 max-w-md w-full overflow-hidden"
    >
      <div className="bg-red-500 px-8 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          <X size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Payment Failed</h1>
        <p className="text-red-100 text-sm">The transaction could not be completed</p>
      </div>
      <div className="px-8 py-6 space-y-3">
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-sm text-red-700">
          Your payment was not processed. No amount has been deducted from your account.
        </div>
        <button onClick={onRetry} className="w-full py-3.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors">
          Try Again <ArrowRight size={14} />
        </button>
        <Link to="/cart" className="w-full py-3 border border-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 transition-colors text-center block">
          Back to Cart
        </Link>
      </div>
    </motion.div>
  </div>
);

/* ─── Main Checkout Component ────────────────────────────────────────────── */
const Checkout = () => {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
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
  const [toast, setToast] = useState(null);

  // Suggested states for postal lookup API
  const [citySearchSuggestions, setCitySearchSuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Suggested states for Coupon System
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const total = items.reduce((sum, i) => sum + ((Number(i.price) || 0) * (i.quantity || 1)), 0);

  const handleCityChange = async (val) => {
    setFormData(prev => ({ ...prev, city: val }));
    if (val.trim().length <= 2) {
      setCitySearchSuggestions([]);
      setShowCitySuggestions(false);
      return;
    }
    try {
      setSearchLoading(true);
      const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      if (data && data[0] && data[0].PostOffice) {
        setCitySearchSuggestions(data[0].PostOffice);
        setShowCitySuggestions(true);
      } else {
        setCitySearchSuggestions([]);
      }
    } catch (e) {
      console.error("Error fetching city postal info:", e);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectCitySuggestion = (office) => {
    setFormData(prev => ({
      ...prev,
      city: office.District || office.Block || office.Name || prev.city,
      state: office.State || prev.state,
      pincode: office.Pincode || prev.pincode
    }));
    setCitySearchSuggestions([]);
    setShowCitySuggestions(false);
  };

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    const cleanCode = codeToApply.toUpperCase().trim();
    if (!cleanCode) return;
    try {
      const snap = await getDoc(doc(db, "coupons", cleanCode));
      if (!snap.exists()) {
        showToast("Invalid coupon code.", "error");
        return;
      }
      const data = snap.data();
      if (!data.is_active) {
        showToast("This coupon is no longer active.", "error");
        return;
      }

      // Check min order threshold
      const subtotal = items.reduce((sum, i) => sum + ((Number(i.price) || 0) * (i.quantity || 1)), 0);
      if (subtotal < (Number(data.min_order) || 0)) {
        showToast(`Minimum order of ₹${data.min_order} required.`, "error");
        return;
      }

      // Check applicable products
      if (data.applicableProducts && data.applicableProducts.length > 0) {
        const matchingItems = items.filter(item => {
          const productId = item.id || item.cartId?.split("-")[0];
          return data.applicableProducts.includes(productId);
        });

        if (matchingItems.length === 0) {
          showToast("This coupon is not applicable to any items in your bag.", "error");
          return;
        }
      }

      setAppliedCoupon(data);
      localStorage.setItem("applied_coupon_code", cleanCode);
      showToast("Coupon applied successfully!");
    } catch (e) {
      console.error(e);
      showToast("Error checking coupon.", "error");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    localStorage.removeItem("applied_coupon_code");
    showToast("Coupon removed.");
  };

  // Recalculate coupon discount if items or coupon changes
  useEffect(() => {
    if (appliedCoupon && items.length > 0) {
      const subtotal = items.reduce((sum, i) => sum + ((Number(i.price) || 0) * (i.quantity || 1)), 0);
      let eligibleSubtotal = subtotal;

      if (appliedCoupon.applicableProducts && appliedCoupon.applicableProducts.length > 0) {
        const matchingItems = items.filter(item => {
          const productId = item.id || item.cartId?.split("-")[0];
          return appliedCoupon.applicableProducts.includes(productId);
        });

        eligibleSubtotal = matchingItems.reduce((sum, i) => sum + ((Number(i.price) || 0) * (i.quantity || 1)), 0);
      }

      let discountAmount = 0;
      if (appliedCoupon.discount_type === "Percentage") {
        discountAmount = eligibleSubtotal * (Number(appliedCoupon.discount_val) / 100);
      } else {
        discountAmount = Math.min(eligibleSubtotal, Number(appliedCoupon.discount_val));
      }
      setCouponDiscount(Math.round(discountAmount));
    } else {
      setCouponDiscount(0);
    }
  }, [items, appliedCoupon]);

  // Global listener to close suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[name="city"]')) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const sendOrderConfirmationEmail = async (emailAddress, fullName, orderId, orderTotal, tempPassword = "") => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        const itemsSummary = items
          .map((item) => `${item.name} (${item.size ? "Size: " + item.size + ", " : ""}Qty: ${item.quantity || 1}) - ₹${item.price}`)
          .join("\n");

        let messageText = `Thank you for your order, ${fullName}!\n\nOrder ID: ${orderId}\nTotal Amount: ₹${orderTotal.toLocaleString("en-IN")}\n\nItems ordered:\n${itemsSummary}\n\nWe will process and ship your order within 3-5 business days.`;

        if (tempPassword) {
          messageText += `\n\nAn account has been automatically created for you!\nYour login details are:\nEmail: ${emailAddress}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password in your profile settings.`;
        }

        const templateParams = {
          to_email: emailAddress.toLowerCase().trim(),
          to_name: fullName,
          order_id: orderId,
          order_total: `₹${orderTotal.toLocaleString("en-IN")}`,
          items_summary: itemsSummary,
          temp_password: tempPassword,
          account_created: tempPassword ? "Yes" : "No",
          project_name: "Pasoja Atelier",
          reply_to: "pasoja.help@gmail.com",
          message: messageText
        };

        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        console.log("Order confirmation email sent successfully.");
      } catch (err) {
        console.error("Order confirmation email delivery failed:", err);
      }
    } else {
      console.log(`[Dev Mode - EmailJS Order Confirmation] To: ${emailAddress}, Order: ${orderId}, Total: ₹${orderTotal}`);
      if (tempPassword) {
        console.log(`[Dev Mode - Auto Account Created] Password: ${tempPassword}`);
      }
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const load = async () => {
      if (!user) {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        setItems(guestCart);
        setLoading(false);

        // Auto apply coupon if present in localstorage
        const storedCoupon = localStorage.getItem("applied_coupon_code");
        if (storedCoupon) {
          setTimeout(() => handleApplyCoupon(storedCoupon), 150);
        }
        return;
      }
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "cart"));
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setFormData(prev => ({ ...prev, name: user.displayName || prev.name || "", email: user.email || prev.email || "" }));

        const addressSnap = await getDocs(collection(db, "users", user.uid, "addresses"));
        const addrs = addressSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          const def = addrs.find(a => a.isDefault) || addrs[0];
          setSelectedAddressId(def.id);
          setFormData(prev => ({
            ...prev,
            name: def.name || user.displayName || prev.name,
            phone: def.phone || prev.phone,
            address: def.address || "",
            city: def.city || "",
            state: def.state || "",
            pincode: def.pincode || ""
          }));
        }

        const storedCoupon = localStorage.getItem("applied_coupon_code");
        if (storedCoupon) {
          setTimeout(() => handleApplyCoupon(storedCoupon), 150);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [user]);

  const clearCart = async (targetUser) => {
    if (targetUser && !targetUser.isGuestPlaceholder) {
      try {
        const snap = await getDocs(collection(db, "users", targetUser.uid, "cart"));
        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "users", targetUser.uid, "cart", d.id))));
      } catch (e) { console.error("Error clearing cart:", e); }
    }
    localStorage.removeItem("guest_cart");
  };

  const saveOrder = async (buyerUser, paymentId = "COD", status = "confirmed", paymentStatus = "captured", tempPassword = "") => {
    try {
      const finalUid = buyerUser ? buyerUser.uid : "GUEST_" + Math.random().toString(36).substr(2, 9);
      const finalEmail = buyerUser ? buyerUser.email : formData.email;

      const orderRef = await addDoc(collection(db, "orders"), {
        userId: finalUid,
        userEmail: finalEmail,
        items,
        total: Math.max(0, total - couponDiscount),
        shipping: formData,
        paymentMethod: formData.paymentMethod,
        paymentId,
        status,
        paymentStatus,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        couponDiscount,
        createdAt: serverTimestamp(),
      });

      if (status === "confirmed") {
        for (const item of items) {
          try {
            const productId = item.id || item.cartId?.split("-")[0];
            if (productId) {
              const ref = doc(db, "products", productId);
              const snap = await getDoc(ref);
              if (snap.exists()) {
                const cur = Number(snap.data().stock) || 0;
                const qty = Number(item.quantity) || 1;
                const newStock = Math.max(0, cur - qty);
                await updateDoc(ref, {
                  stock: newStock,
                  stock_status: newStock === 0 ? "Out of Stock" : newStock <= 5 ? "Low Stock" : "In Stock"
                });
              }
            }
          } catch (e) { console.error(e); }
        }
        await clearCart(buyerUser);
        await sendOrderConfirmationEmail(finalEmail, formData.name, orderRef.id, Math.max(0, total - couponDiscount), tempPassword);
        setOrderStatus("success");
      } else {
        setOrderStatus("failed");
      }
    } catch (e) {
      console.error(e);
      showToast("Order save failed. Please contact support.", "error");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) { showToast("Your bag is empty!", "error"); return; }
    setIsProcessing(true);

    let buyerUser = user;
    let tempPassword = "";

    if (!user) {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", formData.email.toLowerCase().trim()));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const existingUserDoc = querySnap.docs[0];
          buyerUser = { uid: existingUserDoc.id, email: formData.email.toLowerCase().trim() };
        } else {
          tempPassword = `Pasoja@${Math.floor(100000 + Math.random() * 900000)}`;
          console.log("Creating user automatically for guest checkout email:", formData.email);
          const cred = await signup(formData.email.toLowerCase().trim(), tempPassword, formData.name);
          buyerUser = cred.user;
        }
      } catch (authErr) {
        console.error("Auto signup/verification failed; placing order as guest metadata fallback", authErr);
        buyerUser = { uid: "GUEST_" + Math.random().toString(36).substr(2, 9), email: formData.email.toLowerCase().trim(), isGuestPlaceholder: true };
      }
    }

    if (formData.paymentMethod === "online") {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.max(0, total - couponDiscount) * 100,
        currency: "INR",
        name: "Pasoja",
        description: "Premium Fashion Order",
        image: getOptimizedCloudinaryUrl("https://res.cloudinary.com/dcjn4y284/image/upload/v1786029668/p3jd3nuet4vkqbfd5qaz.png", { width: 150 }),
        handler: async (response) => {
          await saveOrder(buyerUser, response.razorpay_payment_id, "confirmed", "captured", tempPassword);
          setIsProcessing(false);
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: "#111111" },
        modal: {
          ondismiss: async () => {
            await saveOrder(buyerUser, "CANCELLED_BY_USER", "failed", "cancelled", tempPassword);
            setIsProcessing(false);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response) => {
        await saveOrder(buyerUser, response.error.metadata?.payment_id || "FAILED", "failed", "failed", tempPassword);
        setIsProcessing(false);
      });
      rzp.open();
    } else {
      await saveOrder(buyerUser, "COD", "confirmed", "pending", tempPassword);
      setIsProcessing(false);
    }
  };

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputCls = "w-full bg-white border border-zinc-300 rounded-lg px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800/10 transition-all placeholder:text-zinc-400";

  /* ── Guards ── */
  if (loading) return <MiniLoader message="Preparing Checkout" />;

  if (orderStatus === "success") return <OrderSuccess navigate={navigate} />;
  if (orderStatus === "failed") return <OrderFailed onRetry={() => setOrderStatus(null)} />;

  /* ── Main checkout UI ── */
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SEOHead
        title="Checkout | Pasoja"
        description="Complete your order securely on Pasoja."
        robots="noindex, follow"
        url="https://pasoja.in/checkout"
      />

      {/* Header offset + breadcrumb */}
      <div className="mt-[145px] md:mt-[130px]" />
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider">
          <Link to="/" className="hover:text-zinc-700 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/cart" className="hover:text-zinc-700 transition-colors">Cart</Link>
          <ChevronRight size={12} />
          <span className="text-zinc-700">Checkout</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <h1 className="text-xl font-bold text-zinc-900 mb-6">Secure Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="w-full lg:flex-1 min-w-0 space-y-4">

              {/* Shipping address section */}
              <div className="bg-white rounded-xl border border-zinc-200">
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold shrink-0">1</div>
                  <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Shipping Address</h2>
                </div>

                <div className="px-5 py-5 space-y-4">
                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Saved Addresses</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {savedAddresses.map((addr) => {
                          const sel = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                setFormData(p => ({ ...p, name: addr.name || p.name, phone: addr.phone || p.phone, address: addr.address || "", city: addr.city || "", state: addr.state || "", pincode: addr.pincode || "" }));
                              }}
                              className={`p-3.5 border-2 rounded-xl cursor-pointer transition-all relative ${sel ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-400"}`}
                            >
                              {addr.isDefault && <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider bg-zinc-900 text-white px-1.5 py-0.5 rounded">Default</span>}
                              <div className="flex items-start gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${sel ? "border-zinc-900 bg-zinc-900" : "border-zinc-300"}`}>
                                  {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <div className="text-xs space-y-0.5 pr-8">
                                  <p className="font-semibold text-zinc-900">{addr.name}</p>
                                  <p className="text-zinc-500 leading-relaxed">{addr.address}, {addr.city}, {addr.state} – {addr.pincode}</p>
                                  <p className="text-zinc-700 font-medium">{addr.phone}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div
                          onClick={() => { setSelectedAddressId("custom"); setFormData(p => ({ ...p, address: "", city: "", state: "", pincode: "" })); }}
                          className={`p-3.5 border-2 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all ${selectedAddressId === "custom" ? "border-zinc-900 bg-zinc-50" : "border-dashed border-zinc-300 hover:border-zinc-500"}`}
                        >
                          <Plus size={14} className="text-zinc-500" />
                          <span className="text-xs font-semibold text-zinc-600">Enter New Address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="text" name="name" required value={formData.name} onChange={handleInput} className={`${inputCls} pl-10`} placeholder="Your full name" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Email *</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="email" name="email" required value={formData.email} onChange={handleInput} className={`${inputCls} pl-10`} placeholder="email@example.com" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleInput} className={`${inputCls} pl-10`} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Street Address *</label>
                    <textarea name="address" required rows={2} value={formData.address} onChange={handleInput} className={`${inputCls} resize-none`} placeholder="House no., street, area, landmark" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        onFocus={() => { if (citySearchSuggestions.length > 0) setShowCitySuggestions(true); }}
                        className={inputCls}
                        placeholder="e.g. Indore"
                        autoComplete="off"
                      />
                      {searchLoading && (
                        <div className="absolute right-3 top-[41px] flex items-center justify-center">
                          <div className="w-3.5 h-3.5 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
                        </div>
                      )}

                      {/* Suggestion Dropdown */}
                      {showCitySuggestions && citySearchSuggestions.length > 0 && (
                        <div className="absolute left-0 md:-left-4 right-0 md:w-[360px] top-full mt-1.5 bg-white border border-zinc-200 shadow-2xl rounded-xl max-h-56 overflow-y-auto divide-y divide-zinc-100" style={{ zIndex: 999999 }}>
                          {citySearchSuggestions.slice(0, 15).map((office, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectCitySuggestion(office)}
                              className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors text-xs space-y-0.5 block cursor-pointer"
                            >
                              <div className="font-bold text-zinc-950 truncate">{office.Name || office.District}, {office.District}</div>
                              <div className="text-zinc-500 font-medium font-mono text-[9px]">{office.State} – Pin: {office.Pincode}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInput}
                        className={inputCls}
                        placeholder="e.g. Madhya Pradesh"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        value={formData.pincode}
                        onChange={handleInput}
                        className={inputCls}
                        placeholder="e.g. 452001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment section */}
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold shrink-0">2</div>
                  <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Payment Method</h2>
                </div>

                <div className="px-5 py-5 space-y-3">
                  {/* Online payment option */}
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, paymentMethod: "online" }))}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${formData.paymentMethod === "online" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-400"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === "online" ? "border-zinc-900 bg-zinc-900" : "border-zinc-300"}`}>
                        {formData.paymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-zinc-900">Online Payment</p>
                        <p className="text-xs text-zinc-500 mt-0.5">UPI, Cards, Net Banking, Wallets</p>
                      </div>
                    </div>
                    {/* Payment logos */}
                    {formData.paymentMethod === "online" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-zinc-100"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">Accepted Payments</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="h-8 px-2 bg-white border border-zinc-200 rounded-md flex items-center justify-center">
                            <GPayIcon />
                          </div>
                          <div className="h-8 px-2 bg-[#5F259F] border border-[#5F259F] rounded-md flex items-center justify-center">
                            <span className="text-white text-xs font-bold tracking-wide">PhonePe</span>
                          </div>
                          <div className="h-8 px-2 bg-[#00BAF2] border border-[#00BAF2] rounded-md flex items-center justify-center">
                            <span className="text-white text-xs font-bold">Paytm</span>
                          </div>
                          <div className="h-8 px-3 bg-white border border-zinc-200 rounded-md flex items-center justify-center">
                            <span className="text-[#1A1F71] text-sm font-black tracking-tight">VISA</span>
                          </div>
                          <div className="h-8 px-2 bg-white border border-zinc-200 rounded-md flex items-center justify-center">
                            <MasterIcon />
                          </div>
                          <div className="h-8 px-3 bg-white border border-zinc-200 rounded-md flex items-center justify-center">
                            <span className="text-[#F26821] text-xs font-black tracking-tight">RuPay</span>
                          </div>
                          <div className="h-8 px-3 bg-[#0B5ED7] border border-[#0B5ED7] rounded-md flex items-center justify-center">
                            <span className="text-white text-[10px] font-black tracking-wide">NET BANKING</span>
                          </div>
                          <div className="h-8 px-2 bg-[#6B3FA0] border border-[#6B3FA0] rounded-md flex items-center justify-center">
                            <span className="text-white text-xs font-bold">UPI</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-3 flex items-center gap-1.5">
                          <Lock size={10} /> Powered by Razorpay · 256-bit SSL encryption
                        </p>
                      </motion.div>
                    )}
                  </button>

                  {/* COD option */}
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, paymentMethod: "cod" }))}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${formData.paymentMethod === "cod" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-400"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === "cod" ? "border-zinc-900 bg-zinc-900" : "border-zinc-300"}`}>
                        {formData.paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">Cash on Delivery</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Pay when your order arrives</p>
                      </div>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-1 rounded-full">COD</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Order Summary ── */}
            <aside className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-28 space-y-4">

              {/* Order items */}
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden font-['Inter',sans-serif]">
                <div className="px-5 py-4 border-b border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                    Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
                  </h3>
                </div>
                <div className="px-5 py-4 max-h-[280px] overflow-auto space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg bg-[#f0eeeb] shrink-0 overflow-hidden border border-zinc-100">
                        <OptimizedCloudinaryImage src={item.image} alt={item.name} preset="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 line-clamp-1">{item.name}</p>
                        {item.size && <p className="text-xs text-zinc-500 mt-0.5">Size: {item.size}</p>}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-zinc-900">₹{Number(item.price).toLocaleString("en-IN")}</span>
                          <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">×{item.quantity || 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 border-t border-zinc-100 space-y-2.5">
                  <div className="flex justify-between text-sm"><span className="text-zinc-600">Subtotal</span><span className="font-medium">₹{total.toLocaleString("en-IN")}</span></div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-[#b8860b] font-bold">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm"><span className="text-zinc-600">Delivery</span><span className="font-bold text-emerald-600">FREE</span></div>
                  <div className="flex justify-between text-sm"><span className="text-zinc-600">GST (Included)</span><span className="font-medium">₹0</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                    <span className="text-base font-bold text-zinc-900">Total</span>
                    <span className="text-xl font-bold text-zinc-900">₹{Math.max(0, total - couponDiscount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Promo Coupon Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3 font-['Inter',sans-serif]">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-[#b8860b]" />
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Apply Promo Code</span>
                </div>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON"
                      className="flex-1 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-900 outline-none focus:border-zinc-800 focus:bg-white transition-all uppercase placeholder:text-zinc-400 placeholder:font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="bg-black text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[#b8860b]/5 border border-[#b8860b]/20 p-2.5 rounded-lg">
                    <div className="min-w-0 text-left">
                      <span className="text-xs font-bold text-[#b8860b] font-mono tracking-wider">{appliedCoupon.code}</span>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                        {appliedCoupon.discount_type === "Percentage" ? `${appliedCoupon.discount_val}% Extra Discount` : `Flat ₹${appliedCoupon.discount_val} Discount`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-zinc-400 hover:text-red-650 transition-colors p-1 rounded-full hover:bg-zinc-150 shrink-0"
                      title="Remove Coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={isProcessing || items.length === 0}
                className={`w-full py-4 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 ${isProcessing || items.length === 0 ? "bg-zinc-300 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 hover:bg-black text-white active:scale-[0.98]"}`}
              >
                {isProcessing ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                ) : (
                  <>{formData.paymentMethod === "cod" ? "Place Order" : "Pay Now"} <ArrowRight size={15} /></>
                )}
              </button>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                <Lock size={12} />
                <span>100% Secure & Encrypted Payments</span>
              </div>
            </aside>
          </div>
        </form>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${toast.type === "error" ? "bg-red-600 text-white" : "bg-zinc-900 text-white"}`}
          >
            <p className="text-sm font-semibold whitespace-nowrap">{toast.msg}</p>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 ml-1">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
