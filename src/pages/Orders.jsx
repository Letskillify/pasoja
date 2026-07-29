import React, { useState, useEffect } from "react";
import { useAuth } from "../components/useAuth";
import { db } from "../components/Firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Package, ChevronRight, ShoppingBag, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/Home/PageHeader";

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login?redirect=orders"); return; }
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const ordersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        ordersList.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setOrders(ordersList);
      } catch (error) { console.error("Error fetching orders:", error); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PageHeader
        title="My Orders"
        subtitle="Track and manage your purchases"
        breadcrumbItems={[{ label: 'Home', path: '/' }, { label: 'Account', path: '/account' }, { label: 'Orders' }]}
      />

      <div className="max-w-4xl mx-auto px-5 md:px-10 py-10 md:py-14">
        <Link to="/account" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={12} /> Back to Account
        </Link>

        {orders.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 border border-white/10 flex items-center justify-center text-white/25 mx-auto mb-5">
              <ShoppingBag size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-light text-white tracking-widest uppercase mb-2">No orders found</h3>
            <p className="text-[13px] text-white/35 leading-relaxed mb-6">You haven't placed any orders yet.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black font-semibold text-[10px] uppercase tracking-[0.2em] hover:bg-white/85 transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#0c0c0c] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all">
                <div className="p-5 md:p-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/30">
                        <Package size={16} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">Order ID</p>
                        <p className="text-[13px] font-semibold text-white">#{order.id.slice(0, 10).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">Placed On</p>
                        <p className="text-[12px] font-medium text-white/60">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider flex items-center gap-1.5 border ${
                        order.status === 'confirmed' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/30'
                        : order.status === 'failed' ? 'bg-red-950/50 text-red-400 border-red-800/30'
                        : 'bg-amber-950/50 text-amber-400 border-amber-800/30'
                      }`}>
                        {order.status === 'confirmed' ? <CheckCircle2 size={10} /> : order.status === 'failed' ? <XCircle size={10} /> : <Clock size={10} />}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-1.5">
                        <div className="w-14 h-14 bg-[#1a1a1a] p-1.5 border border-white/[0.06] shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[13px] font-bold text-white/80">{item.name}</h4>
                          <p className="text-[11px] text-white/30 font-medium">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="text-[13px] font-bold text-white">₹{item.price}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">Total</p>
                      <p className="text-xl font-light tracking-widest text-white">₹{order.total}</p>
                    </div>
                    <Link to="/shop" className="text-[10px] font-semibold text-white/30 hover:text-white flex items-center gap-1 group uppercase tracking-wider transition-colors">
                      Reorder <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
