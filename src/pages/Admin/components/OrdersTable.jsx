import React, { useEffect, useState } from 'react';
import { db } from '../../../components/Firebase';
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Download } from 'lucide-react';
import { exportToCSV } from '../../../utils/exportUtils';

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

const OrdersTable = ({ onRefresh }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleExportOrders = () => {
    const keys = ['id', 'userEmail', 'total', 'paymentMethod', 'status', 'shipping.name', 'shipping.phone', 'shipping.address', 'shipping.city', 'shipping.state', 'shipping.postalCode'];
    const headers = ['Order ID', 'Customer Email', 'Total Amount (INR)', 'Payment Method', 'Status', 'Shipping Name', 'Shipping Phone', 'Shipping Address', 'Shipping City', 'Shipping State', 'Shipping Postal Code'];
    exportToCSV(orders, keys, headers, 'pasoja_orders');
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected orders?`)) return;
    try {
      setLoading(true);
      for (const id of selectedIds) {
        await deleteDoc(doc(db, "orders", id));
      }
      alert("Selected orders deleted!");
      setSelectedIds([]);
      fetchOrders();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Bulk delete failed: " + err.message);
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (!window.confirm(`Are you sure you want to change status to ${status} for ${selectedIds.length} selected orders?`)) return;
    try {
      setLoading(true);
      for (const id of selectedIds) {
        await updateDoc(doc(db, "orders", id), {
          status: status
        });
      }
      alert(`Updated status to ${status} for ${selectedIds.length} orders!`);
      setSelectedIds([]);
      fetchOrders();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Bulk status change failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-200">
        <div>
          <h2 className="text-lg font-poppins text-zinc-900">Recent Orders</h2>
          <p className="text-[14px] text-zinc-500 mt-0.5">Latest customer transactions</p>
        </div>
        <button
          type="button"
          onClick={handleExportOrders}
          className="flex items-center gap-1.5 px-4 py-2 border border-zinc-300 rounded-lg bg-white hover:bg-zinc-50 text-[13px] font-semibold text-zinc-700 cursor-pointer transition-all shadow-sm"
        >
          <Download size={14} /> Export Orders
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="mx-6 my-4 flex flex-col sm:flex-row justify-between items-center bg-zinc-50 border border-zinc-200 p-4 rounded-xl gap-3 animate-fadeIn">
          <div className="text-[13px] font-semibold text-zinc-700">
            {selectedIds.length} order(s) selected
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatusChange("confirmed")}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-[13px] font-semibold cursor-pointer transition-colors"
            >
              Mark Confirmed
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange("pending")}
              className="px-3 py-1.5 bg-[#D9A036]/10 text-[#D9A036] border border-[#D9A036]/20 hover:bg-amber-100 rounded text-[13px] font-semibold cursor-pointer transition-colors"
            >
              Mark Pending
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange("failed")}
              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded text-[13px] font-semibold cursor-pointer transition-colors"
            >
              Mark Failed
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded text-[13px] font-semibold cursor-pointer transition-colors"
            >
              Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded text-[13px] font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-[14px]">
          <thead className="bg-zinc-100">
            <tr className="text-[11px] text-zinc-700 uppercase tracking-widest">
              <th className="px-6 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selectedIds.length === orders.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-black cursor-pointer rounded border-zinc-300"
                />
              </th>
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
                <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">Loading orders...</td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className={`hover:bg-zinc-50/80 transition-colors font-sans ${selectedIds.includes(order.id) ? 'bg-zinc-50' : ''}`}>
                  <td className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelectRow(order.id)}
                      className="w-4 h-4 accent-black cursor-pointer rounded border-zinc-300"
                    />
                  </td>
                  <td className="px-6 py-4 text-zinc-900">
                    #{order.id.slice(0, 6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-900 font-semibold">{order.shipping?.name || "Member"}</p>
                    <p className="text-[11px] text-zinc-500">{order.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-zinc-900 text-[14px]">₹{order.total}</td>
                  <td className="px-6 py-4 text-zinc-600 uppercase text-[11px] tracking-wider">{order.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-md border text-[11px] uppercase tracking-wider ${statusBadgeClasses(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">No recent orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrdersTable;
