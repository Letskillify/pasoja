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
    <section className="bg-white rounded-2xl border border-[#D9D3C7] shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-[#D9D3C7]">
        <div>
          <h2 className="text-lg font-poppins font-bold text-[#1C2B21]">Recent Orders</h2>
          <p className="text-sm text-[#707A72] mt-1">Latest customer transactions</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#EFECE6]">
            <tr className="text-[12px] font-bold text-[#4A5D4E] uppercase tracking-widest">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C7]">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading orders...</td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors font-sans">
                  <td className="px-6 py-4 font-bold text-[#1C2B21]">
                    #{order.id.slice(0, 6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#1C2B21] font-medium">{order.shipping?.name || "Member"}</p>
                    <p className="text-[12px] text-[#707A72]">{order.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-[#1C2B21] font-bold text-[15px]">₹{order.total}</td>
                  <td className="px-6 py-4 text-[#707A72] uppercase text-[12px] font-bold tracking-wider">{order.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-widest ${statusBadgeClasses(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No recent orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrdersTable;
