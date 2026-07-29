import React, { useState, useEffect } from "react";
import { useAuth } from "../components/useAuth";
import { auth, db } from "../components/Firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where, updateDoc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Package, Heart, LogOut, ChevronRight, Settings, ShoppingBag,
  CreditCard, MapPin, Bell, Award, Camera, Plus, Trash2, X, ShieldCheck, Truck, RotateCcw
} from "lucide-react";

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ cart: 0, wishlist: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, profile, orders, payments, addresses, notifications
  
  // Modals / Selection states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Profile Forms
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  
  // Saved Addresses
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Stored Payments (Mock)
  const [payments, setPayments] = useState([
    { id: "p1", cardHolder: "MEMBER USER", cardNumber: "•••• •••• •••• 4242", expiry: "12/29", brand: "Visa" }
  ]);
  const [newCard, setNewCard] = useState({ cardHolder: "", cardNumber: "", expiry: "", brand: "Visa" });
  const [showCardForm, setShowCardForm] = useState(false);

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotionalOffers: false,
    newsletter: true,
    securityAlerts: true
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        const d = userSnap.data();
        setUserData(d);
        setDisplayName(d.displayName || user.displayName || "");
        setPhone(d.phone || "");
        setBio(d.bio || "");
      }
      const cartSnap = await getDocs(collection(db, "users", user.uid, "cart"));
      const wishlistSnap = await getDocs(collection(db, "users", user.uid, "wishlist"));
      const ordersSnap = await getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)));
      const ordersList = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      ordersList.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setRecentOrders(ordersList);
      setStats({ cart: cartSnap.size, wishlist: wishlistSnap.size });

      // Fetch shipping addresses
      const addressSnap = await getDocs(collection(db, "users", user.uid, "addresses"));
      setAddresses(addressSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading account data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try { await logout(); navigate("/"); }
      catch (error) { console.error("Logout failed:", error); }
    }
  };

  // Profile image upload directly to Cloudinary
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "Mahanta_group");
      
      const response = await fetch("https://api.cloudinary.com/v1_1/dlsbj8nug/image/upload", {
        method: "POST",
        body: data
      });
      if (!response.ok) throw new Error("Failed to upload image");
      const resData = await response.json();
      const imageUrl = resData.secure_url;

      // Update auth profile
      await updateProfile(auth.currentUser, { photoURL: imageUrl });
      // Update Firestore user document
      await updateDoc(doc(db, "users", user.uid), { photoURL: imageUrl });
      
      setUserData(prev => ({ ...prev, photoURL: imageUrl }));
      alert("Profile picture updated successfully!");
    } catch (err) {
      alert("Error uploading avatar: " + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Profile fields submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        phone,
        bio
      });
      setUserData(prev => ({ ...prev, displayName, phone, bio }));
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error saving profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Manage Addresses
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address || !newAddress.city || !newAddress.pincode) return;
    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "addresses"), newAddress);
      setAddresses(prev => [...prev, { id: docRef.id, ...newAddress }]);
      setNewAddress({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
      setShowAddressForm(false);
      alert("Address saved!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", id));
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Manage Payment card additions
  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCard.cardNumber || !newCard.cardHolder) return;
    const maskedCard = `•••• •••• •••• ${newCard.cardNumber.slice(-4)}`;
    const cardData = { ...newCard, id: Date.now().toString(), cardNumber: maskedCard };
    setPayments(prev => [...prev, cardData]);
    setNewCard({ cardHolder: "", cardNumber: "", expiry: "", brand: "Visa" });
    setShowCardForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px] md:pt-[80px] pb-24 px-5 md:px-10 lg:px-14 font-sans select-none selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto pt-10 md:pt-14">

        {/* PROFILE HEADER PANEL */}
        <div className="bg-[#0c0c0c] border border-white/[0.08] p-6 sm:p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="relative group">
                <div className="w-24 h-24 bg-[#111] border border-white/10 flex items-center justify-center text-white overflow-hidden relative">
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} strokeWidth={1.2} className="text-white/30" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Camera size={18} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-2xl font-light text-white uppercase tracking-widest">
                    {userData?.displayName || "Atelier Guest"}
                  </h1>
                  <span className="px-2 py-0.5 bg-[#c9a962]/10 border border-[#c9a962]/30 text-[#c9a962] text-[8px] font-black uppercase tracking-widest">Member</span>
                </div>
                <p className="text-xs text-white/40">{user?.email}</p>
                {userData?.bio && <p className="text-[11px] text-white/30 italic max-w-sm leading-relaxed">{userData.bio}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTab !== "overview" && (
                <button onClick={() => setActiveTab("overview")} className="h-10 px-5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider hover:text-white transition-all">
                  Overview
                </button>
              )}
              <button onClick={handleLogout}
                className="h-10 px-5 bg-white/5 border border-white/10 text-white/50 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/30 transition-all flex items-center gap-2"
              >
                <LogOut size={12} strokeWidth={2} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* CONTAINER GRID */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* NAVIGATION SIDEBAR */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/cart" className="group bg-[#0c0c0c] border border-white/[0.06] p-5 hover:border-white/[0.14] transition-all">
                <div className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/35 mb-3 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all">
                  <ShoppingBag size={14} strokeWidth={1.5} />
                </div>
                <p className="text-2xl font-light text-white tracking-wider">{stats.cart}</p>
                <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest mt-0.5">In Cart</p>
              </Link>
              <Link to="/wishlist" className="group bg-[#0c0c0c] border border-white/[0.06] p-5 hover:border-white/[0.14] transition-all">
                <div className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/35 mb-3 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all">
                  <Heart size={14} strokeWidth={1.5} />
                </div>
                <p className="text-2xl font-light text-white tracking-wider">{stats.wishlist}</p>
                <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest mt-0.5">Wishlist</p>
              </Link>
            </div>

            {/* Nav Menu */}
            <div className="bg-[#0c0c0c] border border-white/[0.06] p-1.5">
              <span className="block px-3 py-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Account Panel</span>
              {[
                { id: "profile", icon: Settings, label: "Profile Settings" },
                { id: "orders", icon: Package, label: "Order History" },
                { id: "payments", icon: CreditCard, label: "Payment Methods" },
                { id: "addresses", icon: MapPin, label: "Addresses" },
                { id: "notifications", icon: Bell, label: "Notifications" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 transition-all group text-left ${activeTab === item.id ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 border flex items-center justify-center transition-colors ${activeTab === item.id ? 'bg-white text-black border-white' : 'border-white/10 text-white/25 group-hover:bg-white group-hover:text-black group-hover:border-white'}`}>
                      <item.icon size={11} strokeWidth={1.5} />
                    </div>
                    <span className={`text-[12px] font-semibold transition-colors ${activeTab === item.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{item.label}</span>
                  </div>
                  <ChevronRight size={11} className={`text-white/15 group-hover:text-white/35 transition-all ${activeTab === item.id ? 'translate-x-1 text-white/50' : 'group-hover:translate-x-0.5'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* MAIN DYNAMIC CONTENT */}
          <div className="lg:col-span-8">

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="bg-[#0c0c0c] border border-white/[0.06] p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-lg font-light text-white uppercase tracking-widest">Recent Orders</h3>
                    <p className="text-[11px] text-white/30 mt-0.5">Track and manage your latest purchases</p>
                  </div>
                  {recentOrders.length > 0 && (
                    <button onClick={() => setActiveTab("orders")} className="h-8 px-4 border border-white/10 text-[10px] font-semibold text-white/35 uppercase tracking-wider hover:border-white/30 hover:text-white transition-all flex items-center">
                      View All
                    </button>
                  )}
                </div>

                {recentOrders.length > 0 ? (
                  <div className="divide-y divide-white/[0.06]">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="group py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.01] px-2 rounded transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/25">
                            <Package size={16} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-[11px] text-white/25">
                              {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto flex sm:flex-col justify-between sm:items-end items-center gap-1">
                          <p className="text-sm font-bold text-white">₹{order.total}</p>
                          <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                            order.status === 'confirmed' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/30'
                            : order.status === 'failed' ? 'bg-red-950/50 text-red-400 border-red-800/30'
                            : 'bg-amber-950/50 text-amber-400 border-amber-800/30'
                          }`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-14">
                    <div className="w-14 h-14 border border-white/10 flex items-center justify-center text-white/20 mx-auto mb-4">
                      <ShoppingBag size={22} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-base font-light text-white uppercase tracking-widest mb-1">No orders yet</h4>
                    <p className="text-[12px] text-white/30 mb-5">Start shopping to see your orders here.</p>
                    <Link to="/shop" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black font-semibold text-[10px] uppercase tracking-[0.15em] hover:bg-white/85 transition-all">
                      Browse Shop <ChevronRight size={11} />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE SETTINGS */}
            {activeTab === "profile" && (
              <div className="bg-[#0c0c0c] border border-white/[0.06] p-6 md:p-8">
                <div className="pb-4 border-b border-white/[0.06] mb-6">
                  <h3 className="text-lg font-light text-white uppercase tracking-widest">Profile Details</h3>
                  <p className="text-[11px] text-white/30">Update your account information</p>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Display Name</label>
                      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 text-xs text-white focus:border-white/20 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Phone Number</label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 text-xs text-white focus:border-white/20 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address (Read-only)</label>
                    <input type="email" value={user?.email || ""} disabled
                      className="w-full px-4 py-3 bg-[#111] border border-white/5 text-xs text-white/40 cursor-not-allowed outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Short Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Fashion aesthetics lover..." rows={3}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 text-xs text-white focus:border-white/20 outline-none transition-colors resize-none"
                    />
                  </div>

                  <button type="submit" disabled={savingProfile}
                    className="px-6 py-3.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/80 transition-colors disabled:opacity-50"
                  >
                    {savingProfile ? "Saving Profile..." : "Update Profile"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: ORDER HISTORY */}
            {activeTab === "orders" && (
              <div className="bg-[#0c0c0c] border border-white/[0.06] p-6 md:p-8">
                <div className="pb-4 border-b border-white/[0.06] mb-6">
                  <h3 className="text-lg font-light text-white uppercase tracking-widest">Purchase History</h3>
                  <p className="text-[11px] text-white/30">View details and tracking details of your orders</p>
                </div>

                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="p-5 bg-[#0a0a0a] border border-white/5 hover:border-white/15 transition-all cursor-pointer space-y-4 rounded"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
                          <div>
                            <span className="text-[9px] text-[#c9a962] font-black uppercase tracking-widest">Order ID</span>
                            <h4 className="text-xs font-bold text-white uppercase">#{order.id.slice(0, 12).toUpperCase()}</h4>
                          </div>
                          <span className={`px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${
                            order.status === 'confirmed' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30'
                            : 'bg-amber-950/30 text-amber-400 border-amber-900/30'
                          }`}>{order.status}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px] text-white/40">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-600 font-bold mb-0.5">Ordered On</span>
                            <span className="text-white/75">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN') : 'Recently'}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-600 font-bold mb-0.5">Total Amount</span>
                            <span className="text-white/75 font-semibold">₹{order.total}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-zinc-600 font-bold mb-0.5">Payment Method</span>
                            <span className="text-white/75 uppercase">{order.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-14">
                    <p className="text-white/20 text-xs uppercase tracking-widest">No order records found.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PAYMENT METHODS */}
            {activeTab === "payments" && (
              <div className="bg-[#0c0c0c] border border-white/[0.06] p-6 md:p-8 space-y-6">
                <div className="pb-4 border-b border-white/[0.06] flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-light text-white uppercase tracking-widest">Saved Cards</h3>
                    <p className="text-[11px] text-white/30">Manage your cards stored for checks</p>
                  </div>
                  <button onClick={() => setShowCardForm(!showCardForm)}
                    className="h-8 px-4 border border-white/10 text-[9px] font-bold text-[#c9a962] uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-1.5"
                  >
                    <Plus size={10} /> Add Card
                  </button>
                </div>

                {showCardForm && (
                  <form onSubmit={handleAddCard} className="bg-[#0a0a0a] border border-white/5 p-5 space-y-4 rounded">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Cardholder Name</label>
                        <input type="text" value={newCard.cardHolder} onChange={(e) => setNewCard({...newCard, cardHolder: e.target.value})} required placeholder="John Doe"
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Card Number</label>
                        <input type="text" value={newCard.cardNumber} onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})} required maxLength={16} placeholder="4242 4242 4242 4242"
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Expiry Date</label>
                        <input type="text" value={newCard.expiry} onChange={(e) => setNewCard({...newCard, expiry: e.target.value})} required placeholder="MM/YY" maxLength={5}
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Brand</label>
                        <select value={newCard.brand} onChange={(e) => setNewCard({...newCard, brand: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        >
                          <option value="Visa">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="Rupay">Rupay</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2 bg-white text-black text-[9px] font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">Save Card</button>
                      <button type="button" onClick={() => setShowCardForm(false)} className="px-4 py-2 border border-white/10 text-white/50 text-[9px] font-bold uppercase tracking-wider hover:text-white transition-colors">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {payments.map((p) => (
                    <div key={p.id} className="p-5 bg-gradient-to-br from-[#121212] to-[#0d0d0d] border border-white/5 rounded relative overflow-hidden flex flex-col justify-between h-40">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-[20px]" />
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-white/40 tracking-[0.25em] uppercase">{p.brand}</span>
                        <CreditCard size={20} strokeWidth={1.2} className="text-white/20" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-mono tracking-widest text-white">{p.cardNumber}</p>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="block text-[7px] uppercase tracking-wider text-zinc-600 font-bold">Holder</span>
                            <span className="text-[10px] font-bold text-white/60">{p.cardHolder}</span>
                          </div>
                          <div>
                            <span className="block text-[7px] uppercase tracking-wider text-zinc-600 font-bold">Expiry</span>
                            <span className="text-[10px] font-mono font-bold text-white/60">{p.expiry}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="bg-[#0c0c0c] border border-white/[0.06] p-6 md:p-8 space-y-6">
                <div className="pb-4 border-b border-white/[0.06] flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-light text-white uppercase tracking-widest">Billing & Shipping</h3>
                    <p className="text-[11px] text-white/30">Set up default locations for shipping</p>
                  </div>
                  <button onClick={() => setShowAddressForm(!showAddressForm)}
                    className="h-8 px-4 border border-white/10 text-[9px] font-bold text-[#c9a962] uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all flex items-center gap-1.5"
                  >
                    <Plus size={10} /> Add Address
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-[#0a0a0a] border border-white/5 p-5 space-y-4 rounded">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Contact Name</label>
                        <input type="text" value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} required placeholder="John Doe"
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Contact Phone</label>
                        <input type="text" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} required placeholder="9876543210"
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Street Address</label>
                      <input type="text" value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} required placeholder="Flat No / Lane / Area"
                        className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">City</label>
                        <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} required placeholder="City"
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">State</label>
                        <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} required placeholder="State"
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Pincode</label>
                        <input type="text" value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} required placeholder="Pincode" maxLength={6}
                          className="w-full px-3 py-2 bg-[#111] border border-white/5 text-xs text-white focus:border-white/10 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2 bg-white text-black text-[9px] font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">Add Address</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 border border-white/10 text-white/50 text-[9px] font-bold uppercase tracking-wider hover:text-white transition-colors">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div key={a.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded flex justify-between items-start">
                      <div className="space-y-2 text-xs">
                        <h4 className="font-bold text-white tracking-wide uppercase">{a.name}</h4>
                        <p className="text-white/40 leading-relaxed">{a.address}, {a.city}, {a.state} - {a.pincode}</p>
                        <p className="text-[10px] text-[#c9a962] font-semibold">Phone: {a.phone}</p>
                      </div>
                      <button onClick={() => handleDeleteAddress(a.id)} className="p-2 text-white/35 hover:text-red-400 transition-colors">
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <div className="col-span-2 text-center py-10">
                      <p className="text-white/20 text-xs uppercase tracking-widest">No saved addresses found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="bg-[#0c0c0c] border border-white/[0.06] p-6 md:p-8 space-y-6">
                <div className="pb-4 border-b border-white/[0.06]">
                  <h3 className="text-lg font-light text-white uppercase tracking-widest">Notification Preferences</h3>
                  <p className="text-[11px] text-white/30">Decide how and when you receive brand alerts</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: "orderUpdates", title: "Order status & updates", sub: "Receive realtime updates on active order timeline tracking" },
                    { key: "promotionalOffers", title: "Personalised offers & campaigns", sub: "Receive updates on signature collection drop launches & coupons" },
                    { key: "newsletter", title: "Atelier newsletter subscriptions", sub: "Regular drop highlights and curated brand stories" },
                    { key: "securityAlerts", title: "Critical security notifications", sub: "Immediate account settings modifications or verification flags" }
                  ].map((notif) => (
                    <div key={notif.key} className="flex justify-between items-center p-4 bg-[#0a0a0a] border border-white/5 rounded">
                      <div className="max-w-[80%]">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{notif.title}</h4>
                        <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{notif.sub}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[notif.key]}
                        onChange={(e) => setNotifications({ ...notifications, [notif.key]: e.target.checked })}
                        className="rounded text-[#c9a962] focus:ring-0 w-4 h-4 cursor-pointer bg-black border-white/10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* TRACKING MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0c0c0c] border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[9px] text-[#c9a962] font-black uppercase tracking-widest">TIMELINE TRACKING</span>
                <h3 className="text-xs font-bold uppercase tracking-widest">Order #{selectedOrder.id.slice(0, 16).toUpperCase()}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-white/5 rounded text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 text-xs">
              {/* Timeline status bar */}
              <div className="space-y-4 bg-black/40 border border-white/5 p-4 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Active Shipment Status</span>
                  <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border border-[#c9a962]/40 text-[#c9a962] rounded">{selectedOrder.status}</span>
                </div>
                <div className="relative pt-2">
                  <div className="h-1 bg-white/10 w-full rounded" />
                  <div className={`absolute top-2 h-1 bg-[#c9a962] rounded transition-all duration-500 ${
                    selectedOrder.status === 'confirmed' ? 'w-1/3' : selectedOrder.status === 'shipping' ? 'w-2/3' : 'w-full'
                  }`} />
                  <div className="flex justify-between text-[9px] uppercase tracking-wider mt-3 text-white/30">
                    <span className={selectedOrder.status ? 'text-white' : ''}>Confirmed</span>
                    <span className={selectedOrder.status === 'shipping' || selectedOrder.status === 'delivered' ? 'text-white' : ''}>Transit</span>
                    <span className={selectedOrder.status === 'delivered' ? 'text-white' : ''}>Delivered</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block">Purchased Items</span>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center bg-[#0a0a0a] border border-white/5 p-3">
                      <div className="w-12 h-14 bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white/80 truncate uppercase tracking-wider">{item.name}</h4>
                        <p className="text-[10px] text-white/35 uppercase">Qty: {item.quantity || 1} | Size: {item.size || 'L'}</p>
                      </div>
                      <span className="font-bold text-white">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                <div className="space-y-1">
                  <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Shipping Destination</span>
                  <p className="text-white/60 leading-relaxed">
                    {selectedOrder.shipping?.name}<br />
                    {selectedOrder.shipping?.address}, {selectedOrder.shipping?.city}, {selectedOrder.shipping?.state} - {selectedOrder.shipping?.pincode}
                  </p>
                </div>
                <div className="space-y-2 text-right">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Subtotal Amount</span>
                    <span className="text-white/70">₹{selectedOrder.total}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Total Paid</span>
                    <span className="text-sm font-bold text-white">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
