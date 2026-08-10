import React from 'react';
import { Edit2, Trash2, Tag, Eye } from 'lucide-react';
import OptimizedCloudinaryImage from '../../../components/OptimizedCloudinaryImage';

const statusBadgeClasses = (status) => {
  switch (status) {
    case "In Stock":
      return "bg-[#4A5D4E]/10 text-[#4A5D4E] border-[#4A5D4E]/20";
    case "Low Stock":
      return "bg-[#D9A036]/10 text-[#D9A036] border-[#D9A036]/20";
    default:
      return "bg-red-100 text-red-700 border-red-200";
  }
};

const ProductsTable = ({ products, onEdit, onDelete }) => {
  return (
    <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-200">
        <div>
          <h2 className="text-lg font-poppins   text-zinc-900">Clothing Products</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            Manage your clothing catalog
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-[12px]  ">
          {products.length} Products
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100">
            <tr className="text-[11px]   text-zinc-700 uppercase tracking-widest">
              <th className="px-6 py-3.5">Product</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Gender</th>
              <th className="px-6 py-3.5">Price</th>
              <th className="px-6 py-3.5">Qty</th>
              <th className="px-6 py-3.5">Stock</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {products.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-6 py-4 text-zinc-900 font-medium">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-10 h-12 rounded overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200 shadow-sm">
                      <OptimizedCloudinaryImage
                        src={row.image || row.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=200&auto=format&fit=crop'}
                        alt={row.name}
                        preset="avatar"
                        className="w-full h-full object-cover"
                      />
                      {row.model_image && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#b8860b] rounded-bl-sm" title="Model photo included" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 block">{row.name}</span>
                      {row.model_image && (
                        <span className="text-[10px] text-[#b8860b]   uppercase tracking-wider block">
                          ✦ Model Photo
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-600">
                  {row.category || "-"}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px]   ${row.gender === 'Men' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    row.gender === 'Women' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                      'bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}>
                    {row.gender || "Unisex"}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-900  ">
                  ₹{Number(row.price || 0).toFixed(0)}
                </td>
                <td className="px-6 py-4 text-zinc-900   tabular-nums">
                  {row.stock ?? '—'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full border text-[12px]   ${statusBadgeClasses(row.stock_status || "In Stock")}`}
                  >
                    {row.stock_status || "In Stock"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="p-2 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black transition-colors border border-zinc-200"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm text-zinc-500"
                >
                  No products yet. Click &quot;Add Product&quot; to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProductsTable;
