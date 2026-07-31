import React, { useState, useEffect } from 'react';
import { db } from '../../../components/Firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Undo2, Plus, CheckCircle, Clock, XCircle, AlertCircle, Trash2, Search, X } from 'lucide-react';

const DEFAULT_RETURNS_SEED = [
  {
    id: "RET-1001",
    orderId: "ORD-9842",
    customerName: "Aarav Sharma",
    customerEmail: "aarav@gmail.com",
    productName: "Oversized Vintage Cotton Tee",
    reason: "Size too large (Ordered L, need M)",
    amount: 1499,
    status: "Requested",
    requestDate: "2026-07-30"
  },
  {
    id: "RET-1002",
    orderId: "ORD-9815",
    customerName: "Sneha Reddy",
    customerEmail: "sneha@yahoo.com",
    productName: "Linen Relaxed Casual Shirt",
    reason: "Slight color variation from photo",
    amount: 2199,
    status: "Approved",
    requestDate: "2026-07-28"
  },
  {
    id: "RET-1003",
    orderId: "ORD-9780",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram@outlook.com",
    productName: "Heavyweight Quarter Zip Hoodie",
    reason: "Defective zipper slider",
    amount: 2999,
    status: "Refunded",
    requestDate: "2026-07-25"
  }
];

const ReturnsRefundsManager = () => {
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    orderId: "",
    customerName: "",
    customerEmail: "",
    productName: "",
    reason: "Size Issue",
    amount: 0,
    status: "Requested"
  });

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'returns'));
      if (snap.empty) {
        for (const item of DEFAULT_RETURNS_SEED) {
          await setDoc(doc(db, 'returns', item.id), item);
        }
        setReturnsList(DEFAULT_RETURNS_SEED);
      } else {
        setReturnsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error("Error fetching returns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const item = returnsList.find(r => r.id === id);
      if (!item) return;
      const updated = { ...item, status: newStatus };
      await setDoc(doc(db, 'returns', id), updated);
      setReturnsList(prev => prev.map(r => r.id === id ? updated : r));
      alert(`Return ${id} status updated to ${newStatus}!`);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteReturn = async (id) => {
    if (!confirm("Are you sure you want to delete this return record?")) return;
    try {
      await deleteDoc(doc(db, 'returns', id));
      setReturnsList(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const newId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
      const docData = {
        id: newId,
        ...formData,
        amount: Number(formData.amount) || 0,
        requestDate: new Date().toISOString().slice(0, 10)
      };
      await setDoc(doc(db, 'returns', newId), docData);
      alert("Return request created!");
      setIsModalOpen(false);
      fetchReturns();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filteredReturns = returnsList.filter(r => {
    const matchesSearch = r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    return r.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 text-zinc-900 font-['Inter',sans-serif]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-poppins text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Undo2 className="text-[#b8860b]" size={22} /> Customer Returns & Refund Operations
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Manage return tickets, review customer dispute claims, and authorize refunds.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus size={15} /> Create Return Ticket
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search return by ticket ID, order ID, or customer name..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs outline-none focus:border-black focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === "all" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("requested")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === "requested" ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 hover:bg-amber-100"}`}
          >
            Requested
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === "approved" ? "bg-blue-600 text-white shadow-sm" : "text-blue-700 hover:bg-blue-100"}`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter("refunded")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === "refunded" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700 hover:bg-emerald-100"}`}
          >
            Refunded
          </button>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading returns tickets...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-200">
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Item Name</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-zinc-900">{r.id}</td>
                    <td className="py-3.5 px-3 font-mono text-zinc-500">{r.orderId}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-zinc-900">{r.customerName}</p>
                      <p className="text-[10px] text-zinc-400">{r.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-800">{r.productName}</td>
                    <td className="py-3.5 px-3 text-zinc-600 max-w-[180px] truncate" title={r.reason}>{r.reason}</td>
                    <td className="py-3.5 px-3 font-bold text-zinc-900">₹{(r.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                        r.status === "Refunded" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                        r.status === "Approved" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                        r.status === "Rejected" ? "bg-red-100 text-red-800 border border-red-200" :
                        "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {r.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {r.status === "Requested" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "Approved")}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold transition-all"
                          >
                            Approve
                          </button>
                        )}
                        {(r.status === "Requested" || r.status === "Approved") && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "Refunded")}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold transition-all"
                          >
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReturn(r.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReturns.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 text-xs">No return records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateSubmit} className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Create Return Ticket</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black p-1 rounded-full">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 uppercase tracking-wider block">Order ID</label>
                <input type="text" value={formData.orderId} onChange={e => setFormData(prev => ({ ...prev, orderId: e.target.value }))} required className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg" placeholder="ORD-9842" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 uppercase tracking-wider block">Customer Name</label>
                <input type="text" value={formData.customerName} onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))} required className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg" placeholder="Aarav Sharma" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 uppercase tracking-wider block">Customer Email</label>
                <input type="email" value={formData.customerEmail} onChange={e => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))} required className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg" placeholder="aarav@gmail.com" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 uppercase tracking-wider block">Product Name</label>
                <input type="text" value={formData.productName} onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))} required className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg" placeholder="Oversized Cotton Tee" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 uppercase tracking-wider block">Refund Amount (₹)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))} required className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg" placeholder="1499" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 uppercase tracking-wider block">Return Reason</label>
                <input type="text" value={formData.reason} onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))} required className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg" placeholder="Size Issue / Defect" />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-zinc-300 rounded-lg text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-black text-white rounded-lg text-xs font-bold">Create Ticket</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReturnsRefundsManager;
