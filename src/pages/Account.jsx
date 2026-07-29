import React, { useState, useEffect } from "react";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Package, Heart, LogOut, ChevronRight, Settings, ShoppingBag,
  CreditCard, MapPin, Bell, Award
} from "lucide-react";

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ cart: 0, wishlist: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchData = async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) setUserData(userSnap.data());
        const cartSnap = await getDocs(collection(db, "users", user.uid, "cart"));
        const wishlistSnap = await getDocs(collection(db, "users", user.uid, "wishlist"));
        const ordersSnap = await getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)));
        const ordersList = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        ordersList.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setRecentOrders(ordersList.slice(0, 5));
        setStats({ cart: cartSnap.size, wishlist: wishlistSnap.size });
      } catch (error) { console.error("Error:", error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    try { await logout(); navigate("/"); }
    catch (error) { console.error("Logout failed:", error); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[72px] md:pt-[80px] pb-24 px-5 md:px-10 lg:px-14">
      <div className="max-w-6xl mx-auto pt-10 md:pt-14">

        {/* ACCOUNT HEADER */}
        <div className="bg-[#0c0c0c] border border-white/[0.08] p-6 sm:p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="relative">
                <div className="w-20 h-20 bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white overflow-hidden">
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={30} strokeWidth={1.2} className="text-white/30" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white flex items-center justify-center">
                  <Award size={11} strokeWidth={2} className="text-black" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-light text-white uppercase tracking-widest">
                  {userData?.displayName || "Member"}
                </h1>
                <p className="text-sm text-white/35">{user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                  <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-white text-[9px] font-medium uppercase tracking-widest">Member</span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout}
              className="h-10 px-5 bg-white/5 border border-white/10 text-white/50 font-semibold text-[10px] uppercase tracking-[0.2em] hover:bg-red-950/50 hover:text-red-400 hover:border-red-800/30 transition-all flex items-center gap-2"
            >
              <LogOut size={12} strokeWidth={2} />
              Logout
            </button>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* LEFT */}
          <div className="lg:col-span-4 space-y-4">
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

            <div className="bg-[#0c0c0c] border border-white/[0.06] p-1.5">
              <span className="block px-3 py-2 text-[9px] font-semibold text-white/20 uppercase tracking-[0.3em]">Quick Links</span>
              {[
                { icon: Settings, label: "Profile Settings" },
                { icon: Package, label: "Order History" },
                { icon: CreditCard, label: "Payment Methods" },
                { icon: MapPin, label: "Addresses" },
                { icon: Bell, label: "Notifications" },
              ].map((item, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-3 hover:bg-white/[0.04] transition-all group text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 border border-white/10 text-white/25 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:border-white transition-colors">
                      <item.icon size={11} strokeWidth={1.5} />
                    </div>
                    <span className="text-[13px] font-semibold text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                  </div>
                  <ChevronRight size={11} className="text-white/15 group-hover:text-white/35 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Recent Orders */}
          <div className="lg:col-span-8">
            <div className="bg-[#0c0c0c] border border-white/[0.06] p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-lg font-light text-white uppercase tracking-widest">Recent Orders</h3>
                  <p className="text-[12px] text-white/30 mt-0.5">Track and manage your latest purchases</p>
                </div>
                <Link to="/orders" className="self-start h-8 px-4 border border-white/10 text-[10px] font-semibold text-white/35 uppercase tracking-wider hover:border-white/30 hover:text-white transition-all flex items-center">
                  View All
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="divide-y divide-white/[0.06]">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="group py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/25">
                          <Package size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white/80 group-hover:text-white transition-colors">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-white/25">
                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto flex sm:flex-col justify-between sm:items-end items-center gap-1">
                        <p className="text-sm font-semibold text-white">₹{order.total}</p>
                        <span className={`px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
