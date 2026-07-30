import React, { useEffect, useState } from 'react';
import { db } from '../../../components/Firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const statusBadgeClasses = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "failed":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-amber-50 text-amber-700 border-amber-100";
  }
};

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(10));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-200">
        <div>
          <h2 className="text-lg font-poppins font-bold text-zinc-900">Recent Orders</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Latest customer transactions</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100">
            <tr className="text-[11px] font-bold text-zinc-700 uppercase tracking-widest">
              <th className="px-6 py-3.5">ID</th>
              <th className="px-6 py-3.5">Customer</th>
              <th className="px-6 py-3.5">Total</th>
              <th className="px-6 py-3.5">Method</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">Loading orders...</td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors font-sans">
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    #{order.id.slice(0, 6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-900 font-semibold">{order.shipping?.name || "Member"}</p>
                    <p className="text-[11px] text-zinc-500">{order.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-zinc-900 font-bold text-[14px]">₹{order.total}</td>
                  <td className="px-6 py-4 text-zinc-600 uppercase text-[11px] font-bold tracking-wider">{order.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider ${statusBadgeClasses(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">No recent orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrdersTable;
