import React, { useState, useEffect } from 'react';
import { db } from '../../../components/Firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { ClipboardCheck, Search, Plus, Minus, Save, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import OptimizedCloudinaryImage from '../../../components/OptimizedCloudinaryImage';

const InventoryView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'low', 'out', 'in'
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'products'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(list);
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (id, delta) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const current = parseInt(p.stock) || 0;
        const newStock = Math.max(0, current + delta);
        const newStatus = newStock === 0 ? "Out of Stock" : newStock <= 5 ? "Low Stock" : "In Stock";
        return { ...p, stock: newStock, stock_status: newStatus };
      }
      return p;
    }));
  };

  const handleManualStockInput = (id, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    const newStatus = num === 0 ? "Out of Stock" : num <= 5 ? "Low Stock" : "In Stock";
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: num, stock_status: newStatus } : p));
  };

  const handleSaveStock = async (product) => {
    setSavingId(product.id);
    try {
      const stockNum = parseInt(product.stock) || 0;
      const statusStr = stockNum === 0 ? "Out of Stock" : stockNum <= 5 ? "Low Stock" : "In Stock";
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        stock: stockNum,
        stock_status: statusStr
      });
      alert(`Stock updated for ${product.name}!`);
    } catch (err) {
      alert("Failed to save stock: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const stockNum = parseInt(p.stock) || 0;
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "low") return stockNum > 0 && stockNum <= 5;
    if (filter === "out") return stockNum === 0;
    if (filter === "in") return stockNum > 5;
    return true;
  });

  const totalStockCount = products.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0);
  const lowStockCount = products.filter(p => (parseInt(p.stock) || 0) > 0 && (parseInt(p.stock) || 0) <= 5).length;
  const outOfStockCount = products.filter(p => (parseInt(p.stock) || 0) === 0).length;

  return (
    <div className="space-y-6 text-zinc-900 font-['Inter',sans-serif]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <h2 className="text-xl   font-poppins text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <ClipboardCheck className="text-[#b8860b]" size={22} /> Inventory & Stock Control Center
          </h2>
          <p className="text-[14px] text-zinc-500 mt-1">Live stock levels, inventory valuation, and instant stock update controls.</p>
        </div>
      </div>

      {/* Stock Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px]   text-zinc-400 uppercase tracking-widest block">Total Inventory Stock</span>
            <h3 className="text-2xl   text-zinc-900 mt-1">{totalStockCount} units</h3>
          </div>
          <div className="p-3 bg-zinc-100 rounded-xl text-zinc-700"><Package size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px]   text-amber-600 uppercase tracking-widest block">Low Stock Alerts</span>
            <h3 className="text-2xl   text-amber-700 mt-1">{lowStockCount} items</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><AlertTriangle size={20} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px]   text-red-600 uppercase tracking-widest block">Out of Stock Items</span>
            <h3 className="text-2xl   text-red-700 mt-1">{outOfStockCount} items</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertTriangle size={20} /></div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-[14px] outline-none focus:border-black focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 text-[14px]   rounded-lg transition-all ${filter === "all" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`px-3.5 py-1.5 text-[14px]   rounded-lg transition-all ${filter === "low" ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 hover:bg-amber-100"}`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter("out")}
            className={`px-3.5 py-1.5 text-[14px]   rounded-lg transition-all ${filter === "out" ? "bg-red-600 text-white shadow-sm" : "text-red-700 hover:bg-red-100"}`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-[14px] text-zinc-500">Loading live stock data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr className="text-[10px]   uppercase tracking-widest text-zinc-400 border-b border-zinc-200">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Adjust Quantity</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((p) => {
                  const stockNum = parseInt(p.stock) || 0;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <OptimizedCloudinaryImage src={p.image || p.images?.[0]} preset="avatar" className="w-10 h-10 object-cover rounded-lg bg-zinc-100 border border-zinc-200" alt={p.name} />
                          <div>
                            <p className="  text-zinc-900">{p.name}</p>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: #{p.id?.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-zinc-600 font-semibold">{p.category || 'General'}</td>
                      <td className="py-3.5 px-3   text-zinc-900">₹{(p.price || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded text-[9px]   ${stockNum === 0 ? "bg-red-100 text-red-800 border border-red-200" :
                          stockNum <= 5 ? "bg-amber-100 text-amber-800 border border-amber-200" :
                            "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}>
                          {stockNum === 0 ? "OUT OF STOCK" : stockNum <= 5 ? "LOW STOCK" : "IN STOCK"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockChange(p.id, -1)}
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            value={p.stock ?? 0}
                            onChange={(e) => handleManualStockInput(p.id, e.target.value)}
                            className="w-16 px-2 py-1 text-center   bg-zinc-50 border border-zinc-300 rounded-lg text-[14px] outline-none focus:border-black"
                          />
                          <button
                            onClick={() => handleStockChange(p.id, 1)}
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={savingId === p.id}
                          className="px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white   text-[14px] rounded-lg transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-sm"
                        >
                          <Save size={13} />
                          <span>{savingId === p.id ? "Saving..." : "Save Stock"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-[14px]">No matching inventory items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryView;
