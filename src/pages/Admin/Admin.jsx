import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { db } from "../../components/Firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  where,
  limit
} from "firebase/firestore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import {
  X, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle,
  User, Calendar, DollarSign, ShoppingBag, Eye, Printer,
  Download, PlusCircle, Check, HelpCircle, FileText,
  Shirt, AlertCircle, Mail, Lock, ArrowRight, Image as ImageIcon
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

// Import components
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import MetricCards from "./components/MetricCards";
import ProductsTable from "./components/ProductsTable";
import OrdersTable from "./components/OrdersTable";
import UsersTable from "./components/UsersTable";
import ClothingProductForm from "./components/ProductForm";
import AnalyticsView from "./components/AnalyticsView";
import ReportsView from "./components/ReportsView";
import InventoryView from "./components/InventoryView";
import ReturnsRefundsManager from "./components/ReturnsRefundsManager";

import BillingSystem from "./components/BillingSystem";
import AdminProfileSettings from "./components/AdminProfileSettings";
import CloudinaryMediaPickerModal from "../../components/CloudinaryMediaPickerModal";

import uploadToCloudinary from "../../utils/cloudinary";
import OptimizedCloudinaryImage from "../../components/OptimizedCloudinaryImage";
export { uploadToCloudinary };

// Default Seed Data for Firebase Firestore
const DEFAULT_SEED_DATA = {
  categories: [
    { id: 'cat_tshirts', name: 'T-Shirts', slug: 't-shirts', description: 'Graphic & Solid Tees', is_active: true, sort_order: 1 },
    { id: 'cat_shirts', name: 'Shirts', slug: 'shirts', description: 'Casual & Formal Shirts', is_active: true, sort_order: 2 },
    { id: 'cat_jeans', name: 'Jeans', slug: 'jeans', description: 'Slim & Relaxed Fit Denim', is_active: true, sort_order: 3 },
    { id: 'cat_jackets', name: 'Jackets', slug: 'jackets', description: 'Coats & Outerwear', is_active: true, sort_order: 4 },
    { id: 'cat_sweaters', name: 'Sweaters', slug: 'sweaters', description: 'Knitwear & Hoodies', is_active: true, sort_order: 5 },
    { id: 'cat_shorts', name: 'Shorts', slug: 'shorts', description: 'Casual Shorts & Athleisure', is_active: true, sort_order: 6 },
    { id: 'cat_accessories', name: 'Accessories', slug: 'accessories', description: 'Hats, Caps & Belts', is_active: true, sort_order: 7 }
  ],
  subcategories: [
    { id: 'sub_oversized', name: 'Oversized Tees', slug: 'oversized-tees', parent_category: 'T-Shirts', is_active: true, sort_order: 1 },
    { id: 'sub_graphic', name: 'Graphic Tees', slug: 'graphic-tees', parent_category: 'T-Shirts', is_active: true, sort_order: 2 },
    { id: 'sub_casualshirts', name: 'Casual Shirts', slug: 'casual-shirts', parent_category: 'Shirts', is_active: true, sort_order: 3 },
    { id: 'sub_formalshirts', name: 'Formal Shirts', slug: 'formal-shirts', parent_category: 'Shirts', is_active: true, sort_order: 4 },
    { id: 'sub_cargo', name: 'Cargo Pants', slug: 'cargo-pants', parent_category: 'Jeans', is_active: true, sort_order: 5 },
    { id: 'sub_denimjackets', name: 'Denim Jackets', slug: 'denim-jackets', parent_category: 'Jackets', is_active: true, sort_order: 6 }
  ],
  collections: [
    { id: 'col_new', name: 'New Arrivals', slug: 'new-arrivals', description: 'Fresh drops for the new season', is_active: true, sort_order: 1 },
    { id: 'col_bestsellers', name: 'Bestsellers', slug: 'bestsellers', description: 'Most loved styles by community', is_active: true, sort_order: 2 },
    { id: 'col_artisan', name: 'The Artisan Edit', slug: 'the-artisan-edit', description: 'Limited handcrafted exclusives', is_active: true, sort_order: 3 },
    { id: 'col_summer', name: 'Summer Edition', slug: 'summer-edition', description: 'Lightweight breathable fits', is_active: true, sort_order: 4 }
  ],
  attributes: [
    { id: 'attr_size', name: 'Size', values: 'S, M, L, XL, XXL, 28, 30, 32, 34, 36', is_active: true, sort_order: 1 },
    { id: 'attr_color', name: 'Color', values: 'Black, White, Beige, Red, Blue, Green, Brown, Grey', is_active: true, sort_order: 2 },
    { id: 'attr_material', name: 'Material', values: '100% Cotton, Denim, Fleece, Poly Blend, Linen, Wool', is_active: true, sort_order: 3 }
  ],
  shop_by_category: [
    { id: 'cat_sbc_1', name: 'OVERSIZED T-SHIRT', title: 'OVERSIZED T-SHIRT', slug: 'oversized-t-shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', link: '/shop?category=T-Shirts', sort_order: 1, is_active: true },
    { id: 'cat_sbc_2', name: 'SHIRTS', title: 'SHIRTS', slug: 'shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Shirts', sort_order: 2, is_active: true },
    { id: 'cat_sbc_3', name: 'WAFFLE KNIT', title: 'WAFFLE KNIT', slug: 'waffle-knit', image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Sweaters', sort_order: 3, is_active: true },
    { id: 'cat_sbc_4', name: 'QUARTER ZIP', title: 'QUARTER ZIP', slug: 'quarter-zip', image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Jackets', sort_order: 4, is_active: true }
  ],
  mobile_categories: [
    { id: 'm_cat_1', name: 'SHIRTS', title: 'SHIRTS', badge: '', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Shirts', sort_order: 1, is_active: true },
    { id: 'm_cat_2', name: 'TROUSERS', title: 'TROUSERS', badge: '', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Trousers', sort_order: 2, is_active: true },
    { id: 'm_cat_3', name: 'POLOS', title: 'POLOS', badge: '', image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Polos', sort_order: 3, is_active: true },
    { id: 'm_cat_4', name: 'JEANS', title: 'JEANS', badge: '', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Jeans', sort_order: 4, is_active: true },
    { id: 'm_cat_5', name: 'CARGOS', title: 'CARGOS', badge: '', image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Cargos', sort_order: 5, is_active: true },
    { id: 'm_cat_6', name: 'T-SHIRTS', title: 'T-SHIRTS', badge: '', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', link: '/shop?category=T-Shirts', sort_order: 6, is_active: true },
    { id: 'm_cat_7', name: 'SHORTS', title: 'SHORTS', badge: '', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Shorts', sort_order: 7, is_active: true },
    { id: 'm_cat_8', name: 'PLUS SIZE', title: 'PLUS SIZE', badge: '3XL TO 6XL', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Plus-Size', sort_order: 8, is_active: true },
    { id: 'm_cat_9', name: 'SHOES', title: 'SHOES', badge: 'JUST LAUNCHED', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Shoes', sort_order: 9, is_active: true }
  ]
};

// Generic CMS Manager helper
const GenericCRUDManager = ({ collectionName, title, fields, defaultItem }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultItem);
  const [uploading, setUploading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activePickerField, setActivePickerField] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, collectionName));
      const snap = await getDocs(q);
      if (snap.empty && DEFAULT_SEED_DATA[collectionName]) {
        const seedItems = DEFAULT_SEED_DATA[collectionName];
        for (const item of seedItems) {
          await setDoc(doc(db, collectionName, item.id), item);
        }
        setItems(seedItems);
      } else {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
        setItems(list);
      }
    } catch (err) {
      console.error("Error fetching or seeding collection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [collectionName]);

  const handleInputChange = (fieldKey, value, isNumber = false) => {
    setFormData(prev => {
      const finalVal = isNumber ? (parseFloat(value) || 0) : value;
      const updated = { ...prev, [fieldKey]: finalVal };
      const hasSlug = fields.some(f => f.key === 'slug');
      if ((fieldKey === 'name' || fieldKey === 'title' || fieldKey === 'code') && hasSlug) {
        const generatedSlug = String(value)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        updated.slug = generatedSlug;
      }
      return updated;
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      alert("Deleted successfully!");
      fetchItems();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setFormData(defaultItem);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file, field) => {
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docData = { ...formData };
      if (editingItem) {
        await setDoc(doc(db, collectionName, editingItem.id), docData);
        alert("Updated successfully!");
      } else {
        const newId = doc(collection(db, collectionName)).id;
        await setDoc(doc(db, collectionName, newId), { ...docData, id: newId });
        alert("Created successfully!");
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 text-zinc-900 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg   text-zinc-900 uppercase tracking-wider">{title}</h2>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[14px]   rounded-lg hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-zinc-500 text-[14px]">Loading items...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-widest text-[10px]">
                {fields.map(f => (
                  <th key={f.key} className="py-3 px-4">{f.label}</th>
                ))}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50/80 transition-colors">
                  {fields.map(f => (
                    <td key={f.key} className="py-3.5 px-4 font-medium text-zinc-800">
                      {f.type === 'image' ? (
                        <OptimizedCloudinaryImage src={item[f.key]} preset="avatar" className="w-10 h-10 object-cover rounded bg-zinc-100 border border-zinc-200" alt="thumb" />
                      ) : f.type === 'boolean' ? (
                        <span className={`px-2 py-0.5 rounded text-[9px]   ${item[f.key] ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                          {item[f.key] ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      ) : (
                        item[f.key] || '-'
                      )}
                    </td>
                  ))}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} className="py-8 text-center text-zinc-500">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <h3 className="text-sm   uppercase tracking-wider text-zinc-900">{editingItem ? "Edit Item" : "Create Item"}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black p-1 rounded-full hover:bg-zinc-100">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {fields.map(f => (
                <div key={f.key} className="space-y-1">
                  <label className="text-[10px]   text-zinc-500 uppercase tracking-wider block">{f.label}</label>
                  {f.type === 'image' ? (
                    <div className="space-y-2">
                      {formData[f.key] && (
                        <OptimizedCloudinaryImage src={formData[f.key]} preset="category" className="w-20 h-20 object-cover rounded-lg border border-zinc-200 bg-zinc-50" alt="preview" />
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-zinc-900 cursor-pointer transition-all">
                          Upload from Device
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], f.key)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setActivePickerField(f.key);
                            setIsPickerOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-[11px] font-semibold text-zinc-900 cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <ImageIcon size={13} className="text-[#b8860b]" /> Choose from Cloudinary
                        </button>
                      </div>
                      {uploading && (
                        <p className="text-[10px] text-[#b8860b]   animate-pulse">Uploading image...</p>
                      )}
                    </div>
                  ) : f.type === 'boolean' ? (
                    <select
                      value={formData[f.key] ? 'true' : 'false'}
                      onChange={(e) => setFormData(prev => ({ ...prev, [f.key]: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-[14px] text-zinc-900 focus:bg-white focus:border-black outline-none transition-all"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      value={formData[f.key] || ''}
                      onChange={(e) => handleInputChange(f.key, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-[14px] text-zinc-900 focus:bg-white focus:border-black outline-none transition-all"
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={formData[f.key] ?? ''}
                      onChange={(e) => handleInputChange(f.key, e.target.value, f.type === 'number')}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-[14px] text-zinc-900 focus:bg-white focus:border-black outline-none transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 text-[14px]   rounded-lg hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 bg-black text-white text-[14px]   rounded-lg hover:bg-zinc-800 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {uploading ? "Uploading..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <CloudinaryMediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => {
          if (activePickerField) {
            setFormData(prev => ({ ...prev, [activePickerField]: url }));
          }
        }}
        isMultiSelect={false}
      />
    </div>
  );
};

// Testimonials Manager
const CommunityManager = () => {
  const [subTab, setSubTab] = useState("settings");

  const [settings, setSettings] = useState({
    eyebrow: "",
    heading: "",
    description_line_1: "",
    description_line_2: "",
    is_active: true
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [savingImgId, setSavingImgId] = useState(null);
  const [uploadingImgId, setUploadingImgId] = useState(null);

  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [savingStatId, setSavingStatId] = useState(null);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'community_settings'));
      if (!snap.empty) {
        setSettings(snap.docs[0].data());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchImages = async () => {
    setImagesLoading(true);
    try {
      const q = query(collection(db, 'community_images'), orderBy('sort_order', 'asc'));
      const snap = await getDocs(q);
      setImages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setImagesLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const q = query(collection(db, 'community_stats'), orderBy('sort_order', 'asc'));
      const snap = await getDocs(q);
      setStats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchImages();
    fetchStats();
  }, []);

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await setDoc(doc(db, 'community_settings', 'main'), settings);
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleImageChange = (id, field, value) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
  };

  const handleImageUpload = async (id, file) => {
    if (!file) return;
    try {
      setUploadingImgId(id);
      const url = await uploadToCloudinary(file);
      handleImageChange(id, 'image', url);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImgId(null);
    }
  };

  const handleSaveImage = async (img) => {
    setSavingImgId(img.id);
    try {
      await setDoc(doc(db, 'community_images', img.id), {
        image: img.image || '',
        link: img.link || '',
        sort_order: parseInt(img.sort_order) || 0,
        is_active: img.is_active !== false
      });
      alert("Image saved!");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSavingImgId(null);
    }
  };

  const handleDeleteImage = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'community_images', id));
      setImages(prev => prev.filter(img => img.id !== id));
      alert("Deleted!");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleAddImage = () => {
    const newId = 'img_' + Date.now();
    const newImg = { id: newId, image: '', link: '', sort_order: images.length + 1, is_active: true };
    setImages(prev => [...prev, newImg]);
  };

  const handleStatChange = (id, field, value) => {
    setStats(prev => prev.map(st => st.id === id ? { ...st, [field]: value } : st));
  };

  const handleSaveStat = async (stat) => {
    setSavingStatId(stat.id);
    try {
      await setDoc(doc(db, 'community_stats', stat.id), {
        icon: stat.icon || 'Star',
        value: stat.value || '',
        label: stat.label || '',
        sort_order: parseInt(stat.sort_order) || 0,
        is_active: stat.is_active !== false
      });
      alert("Stat saved successfully!");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSavingStatId(null);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 text-zinc-900 shadow-sm">
      <div className="flex border-b border-zinc-200 mb-6 text-[14px]">
        <button
          onClick={() => setSubTab("settings")}
          className={`px-4 py-2   border-b-2 transition-all ${subTab === "settings" ? "border-black text-zinc-900 font-extrabold" : "border-transparent text-zinc-500 hover:text-black"}`}
        >
          Section Settings
        </button>
        <button
          onClick={() => setSubTab("gallery")}
          className={`px-4 py-2   border-b-2 transition-all ${subTab === "gallery" ? "border-black text-zinc-900 font-extrabold" : "border-transparent text-zinc-500 hover:text-black"}`}
        >
          Gallery Images
        </button>
        <button
          onClick={() => setSubTab("stats")}
          className={`px-4 py-2   border-b-2 transition-all ${subTab === "stats" ? "border-black text-zinc-900 font-extrabold" : "border-transparent text-zinc-500 hover:text-black"}`}
        >
          Social Proof Stats
        </button>
      </div>

      {subTab === "settings" && !settingsLoading && (
        <div className="max-w-xl space-y-4 text-[14px]">
          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="settings-active"
              checked={settings.is_active !== false}
              onChange={(e) => setSettings(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
            />
            <label htmlFor="settings-active" className="  text-zinc-800 cursor-pointer">Section Active</label>
          </div>
          <div className="space-y-1">
            <label className="text-[10px]   text-zinc-500 uppercase tracking-wider block">Eyebrow</label>
            <input
              type="text"
              value={settings.eyebrow}
              onChange={(e) => setSettings(prev => ({ ...prev, eyebrow: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded text-zinc-900 focus:bg-white focus:border-black outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px]   text-zinc-500 uppercase tracking-wider block">Heading</label>
            <input
              type="text"
              value={settings.heading}
              onChange={(e) => setSettings(prev => ({ ...prev, heading: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded text-zinc-900 focus:bg-white focus:border-black outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px]   text-zinc-500 uppercase tracking-wider block">Description Line 1</label>
            <input
              type="text"
              value={settings.description_line_1}
              onChange={(e) => setSettings(prev => ({ ...prev, description_line_1: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded text-zinc-900 focus:bg-white focus:border-black outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px]   text-zinc-500 uppercase tracking-wider block">Description Line 2</label>
            <input
              type="text"
              value={settings.description_line_2}
              onChange={(e) => setSettings(prev => ({ ...prev, description_line_2: e.target.value }))}
              className="w-full px-3 py-2 bg-[#161616] border border-[#222] rounded text-white"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={settingsSaving}
            className="px-6 py-2.5 bg-[#c9a962] text-[#090909] hover:bg-white hover:text-black rounded text-[14px]   transition-all"
          >
            {settingsSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}

      {subTab === "gallery" && !imagesLoading && (
        <div className="space-y-6 text-[14px]">
          <div className="flex justify-end">
            <button onClick={handleAddImage} className="px-4 py-2 bg-[#c9a962] text-[#090909] hover:bg-white hover:text-black rounded   transition-all">Add New Image</button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {images.map((img, idx) => (
              <div key={img.id} className="border border-[#1a1a1a] rounded-xl p-5 bg-[#161616] space-y-4">
                <div className="flex items-center justify-between border-b border-[#222] pb-3">
                  <span className="  text-zinc-300">Image #{idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id={`img-active-${img.id}`}
                        checked={img.is_active !== false}
                        onChange={(e) => handleImageChange(img.id, 'is_active', e.target.checked)}
                        className="rounded text-[#c9a962] focus:ring-[#c9a962] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor={`img-active-${img.id}`} className="  text-zinc-400 cursor-pointer">Active</label>
                    </div>
                    <button onClick={() => handleDeleteImage(img.id)} className="text-red-400 hover:text-red-300  ">Delete</button>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-[#0f0f0f] border border-[#222] rounded overflow-hidden flex items-center justify-center shrink-0">
                    {img.image ? <OptimizedCloudinaryImage src={img.image} preset="category" className="w-full h-full object-cover" alt="look" /> : <span className="text-[9px] text-zinc-600">No Image</span>}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(img.id, e.target.files[0])} className="hidden" id={`gallery-file-${img.id}`} />
                    <label htmlFor={`gallery-file-${img.id}`} className="inline-block px-3 py-1.5 border border-zinc-700 rounded   text-zinc-300 bg-[#0f0f0f] hover:bg-zinc-800 cursor-pointer">
                      {uploadingImgId === img.id ? "Uploading..." : "Change Image"}
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Destination Link</label>
                  <input type="text" value={img.link || ''} onChange={(e) => handleImageChange(img.id, 'link', e.target.value)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Sort Order</label>
                  <input type="number" value={img.sort_order} onChange={(e) => handleImageChange(img.id, 'sort_order', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white" />
                </div>

                <button onClick={() => handleSaveImage(img)} disabled={savingImgId === img.id || uploadingImgId === img.id} className="w-full py-2 bg-[#c9a962] text-[#090909] hover:bg-white hover:text-black   rounded">
                  {savingImgId === img.id ? "Saving..." : "Save"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === "stats" && !statsLoading && (
        <div className="grid gap-6 md:grid-cols-2 text-[14px]">
          {stats.map((stat, idx) => (
            <div key={stat.id} className="border border-[#1a1a1a] rounded-xl p-5 bg-[#161616] space-y-4">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <span className="  text-zinc-300">Stat #{idx + 1}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`stat-active-${stat.id}`}
                    checked={stat.is_active !== false}
                    onChange={(e) => handleStatChange(stat.id, 'is_active', e.target.checked)}
                    className="rounded text-[#c9a962] focus:ring-[#c9a962] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor={`stat-active-${stat.id}`} className="  text-zinc-400 cursor-pointer">Active</label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Icon</label>
                <select value={stat.icon} onChange={(e) => handleStatChange(stat.id, 'icon', e.target.value)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white">
                  <option value="Star">Star (Rating)</option>
                  <option value="Award">Award (Badge)</option>
                  <option value="MessageSquare">Message (Reviews)</option>
                  <option value="RefreshCw">Refresh (Retention)</option>
                  <option value="Heart">Heart (Likes)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Primary Value</label>
                <input type="text" value={stat.value} onChange={(e) => handleStatChange(stat.id, 'value', e.target.value)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Label</label>
                <input type="text" value={stat.label} onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Sort Order</label>
                <input type="number" value={stat.sort_order} onChange={(e) => handleStatChange(stat.id, 'sort_order', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white" />
              </div>

              <button onClick={() => handleSaveStat(stat)} disabled={savingStatId === stat.id} className="w-full py-2 bg-[#c9a962] text-[#090909] hover:bg-white hover:text-black   rounded">
                {savingStatId === stat.id ? "Saving..." : "Save"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CMSManager = ({ collectionName, title }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, collectionName), orderBy('sort_order', 'asc'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error loading CMS items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [collectionName]);

  const handleChange = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleImageUpload = async (id, file) => {
    if (!file) return;
    try {
      setUploadingId(id);
      const url = await uploadToCloudinary(file);
      handleChange(id, 'image', url);
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = async (item) => {
    try {
      setSavingId(item.id);
      if (!item.title) {
        alert("Title is required");
        return;
      }
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, {
        title: item.title,
        image: item.image || '',
        link: item.link || '',
        sort_order: parseInt(item.sort_order) || 0,
        is_active: item.is_active !== undefined ? item.is_active : true
      });
      alert(`${item.title} saved successfully!`);
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 text-[14px]">Loading CMS data...</div>;
  }

  return (
    <div className="bg-[#121212] border border-[#1a1a1a] rounded-xl p-6 text-white text-[14px]">
      <h2 className="text-base   text-white mb-6 uppercase tracking-wider">{title}</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={item.id} className="border border-[#1a1a1a] rounded-xl p-5 bg-[#161616] space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <span className="  text-zinc-300">Panel 0{index + 1} ({item.id})</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`active-${item.id}`}
                  checked={item.is_active !== false}
                  onChange={(e) => handleChange(item.id, 'is_active', e.target.checked)}
                  className="rounded text-[#c9a962] focus:ring-[#c9a962] w-4 h-4 cursor-pointer"
                />
                <label htmlFor={`active-${item.id}`} className="  text-zinc-400 cursor-pointer">Active</label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Image</label>
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 bg-[#090909] border border-[#222] rounded overflow-hidden flex items-center justify-center">
                  {item.image ? <OptimizedCloudinaryImage src={item.image} preset="category" alt={item.title} className="w-full h-full object-cover" /> : <span className="text-[10px] text-zinc-600">No Image</span>}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(item.id, e.target.files[0])} className="hidden" id={`file-input-${item.id}`} />
                  <label htmlFor={`file-input-${item.id}`} className="inline-block px-3 py-1.5 border border-zinc-700 rounded   text-zinc-300 bg-[#090909] hover:bg-zinc-800 cursor-pointer">
                    {uploadingId === item.id ? "Uploading..." : "Change Image"}
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Title</label>
              <input type="text" value={item.title} onChange={(e) => handleChange(item.id, 'title', e.target.value)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Destination Link</label>
              <input type="text" value={item.link} onChange={(e) => handleChange(item.id, 'link', e.target.value)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px]   text-zinc-400 uppercase tracking-wider block">Sort Order</label>
              <input type="number" value={item.sort_order} onChange={(e) => handleChange(item.id, 'sort_order', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-[#090909] border border-[#222] rounded text-white" />
            </div>

            <button onClick={() => handleSave(item)} disabled={savingId === item.id || uploadingId === item.id} className="w-full py-2 bg-[#c9a962] text-[#090909] hover:bg-white hover:text-black   rounded">
              {savingId === item.id ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Activity Log Viewer
const ActivityLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(15)));
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        // Fallback mock logs
        setLogs([
          { id: '1', admin: 'superadmin@pasoja.com', action: 'Product Created', entity: 'Black Oversized Tee', timestamp: { toDate: () => new Date() } },
          { id: '2', admin: 'superadmin@pasoja.com', action: 'Stock Adjusted', entity: 'White Graphic Tee (+5)', timestamp: { toDate: () => new Date() } }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="bg-[#121212] border border-[#1a1a1a] rounded-xl p-6 text-white text-[14px]">
      <h2 className="text-base   text-white mb-6 uppercase tracking-wider">System Activity Logs</h2>
      {loading ? <div className="text-zinc-500">Loading...</div> : (
        <div className="space-y-3.5">
          {logs.map(log => (
            <div key={log.id} className="p-3 bg-[#161616] border border-[#222] rounded flex justify-between items-center">
              <div>
                <p className="  text-[#c9a962]">{log.action}</p>
                <p className="text-zinc-400 text-[10px] mt-0.5">Admin: {log.admin} | target: {log.entity}</p>
              </div>
              <span className="text-[10px] text-zinc-500">
                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : new Date().toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem("adminToken") === "PASOJA_SUPER_ADMIN" ||
    sessionStorage.getItem("adminToken") === "PASOJA_SUPER_ADMIN"
  );
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminEmail === "super@pasoja.in" && adminPassword === "Super@321.Admin") {
      sessionStorage.setItem("adminToken", "PASOJA_SUPER_ADMIN");
      setIsAdminLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid Administrator Credentials.");
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "Overview";
  const [activeItem, setActiveItemState] = useState(tabFromUrl);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && currentTab !== activeItem) {
      setActiveItemState(currentTab);
    } else if (!currentTab && activeItem !== "Overview") {
      setActiveItemState("Overview");
    }
  }, [searchParams]);

  const setActiveItem = (newItem) => {
    setActiveItemState(newItem);
    setSearchParams({ tab: newItem });
  };
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats / executive summary
  const [statsSummary, setStatsSummary] = useState({
    revenue: 395420,
    orders: 248,
    customers: 1486,
    products: 256
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const prodSnap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
      const prodList = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(prodList);

      const userSnap = await getDocs(query(collection(db, "users")));
      const userList = userSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(userList);

      const orderSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
      const orderList = orderSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(orderList);

      // Aggregate revenue
      const totalRev = orderList.reduce((acc, curr) => acc + (parseFloat(curr.total || curr.grandTotal || 0)), 0);
      setStatsSummary({
        revenue: totalRev || 395420,
        orders: orderList.length || 248,
        customers: userList.length || 1486,
        products: prodList.length || 256
      });
    } catch (error) {
      console.log("Error loading dashboard metrics, using fallback metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleAddProductSubmit = async (docData) => {
    const newDoc = {
      ...docData,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "products"), newDoc);
    setIsProductModalOpen(false);
    await loadData();
    // Log Activity
    await addDoc(collection(db, "activity_logs"), {
      admin: "superadmin@pasoja.com",
      action: "Product Created",
      entity: docData.name,
      timestamp: serverTimestamp()
    });
  };

  const handleEditProductSubmit = async (docData) => {
    if (!editingProduct?.id) return;
    await updateDoc(doc(db, "products", editingProduct.id), docData);
    setIsEditModalOpen(false);
    setEditingProduct(null);
    await loadData();
    // Log Activity
    await addDoc(collection(db, "activity_logs"), {
      admin: "superadmin@pasoja.com",
      action: "Product Updated",
      entity: docData.name,
      timestamp: serverTimestamp()
    });
  };

  // Filtered lists
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchVal.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.id?.toLowerCase().includes(searchVal.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(searchVal.toLowerCase())
  );

  const renderDashboardCharts = () => {
    // Generate simple chart data
    const chartData = [
      { name: "May 20", Revenue: 30000, Orders: 20 },
      { name: "May 25", Revenue: 50000, Orders: 32 },
      { name: "May 30", Revenue: 42000, Orders: 25 },
      { name: "Jun 4", Revenue: 60000, Orders: 45 },
      { name: "Jun 9", Revenue: 85000, Orders: 55 },
      { name: "Jun 14", Revenue: 70000, Orders: 38 },
      { name: "Jun 18", Revenue: 95000, Orders: 60 },
    ];

    return (
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* Revenue Chart */}
        <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
          <h3 className="text-[14px]   uppercase tracking-wider text-zinc-500 mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b8860b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#b8860b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} />
                <YAxis stroke="#a1a1aa" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#111111", borderRadius: 8, fontSize: 11, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="Revenue" stroke="#b8860b" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
          <h3 className="text-[14px]   uppercase tracking-wider text-zinc-500 mb-4">Orders Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} />
                <YAxis stroke="#a1a1aa" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e4e4e7", color: "#111111", borderRadius: 8, fontSize: 11, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="Orders" fill="#111111" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <p className="text-[10px]   text-zinc-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-xl   text-zinc-900 mt-1">₹{statsSummary.revenue.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-emerald-600   block mt-1">+18.5% vs last month</span>
          </div>
          <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <p className="text-[10px]   text-zinc-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-xl   text-zinc-900 mt-1">{statsSummary.orders}</h3>
            <span className="text-[10px] text-emerald-600   block mt-1">+22.4% vs last month</span>
          </div>
          <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <p className="text-[10px]   text-zinc-500 uppercase tracking-wider">Total Customers</p>
            <h3 className="text-xl   text-zinc-900 mt-1">{statsSummary.customers}</h3>
            <span className="text-[10px] text-emerald-600   block mt-1">+15.3% vs last month</span>
          </div>
          <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
            <p className="text-[10px]   text-zinc-500 uppercase tracking-wider">Total Products</p>
            <h3 className="text-xl   text-zinc-900 mt-1">{statsSummary.products}</h3>
            <span className="text-[10px] text-zinc-500   block mt-1">Flat stock index</span>
          </div>
        </div>

        {renderDashboardCharts()}

        {/* Dynamic widgets */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          {/* Low Stock Alerts */}
          <div className="bg-white border border-zinc-200 p-5 rounded-xl text-[14px] space-y-4 shadow-sm">
            <h4 className="  text-zinc-500 uppercase tracking-wider">Low Stock Alerts</h4>
            <div className="space-y-3">
              {products.filter(p => (parseInt(p.stock) || 0) <= 5).slice(0, 3).map(p => (
                <div key={p.id} className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <div>
                    <p className="font-semibold text-zinc-900">{p.name}</p>
                    <p className="text-[10px] text-zinc-500">Category: {p.category}</p>
                  </div>
                  <span className="text-red-600  ">Stock: {p.stock || 0}</span>
                </div>
              ))}
              {products.filter(p => (parseInt(p.stock) || 0) <= 5).length === 0 && (
                <p className="text-zinc-500 text-center">No products are low in stock.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-zinc-200 p-5 rounded-xl text-[14px] space-y-4 shadow-sm">
            <h4 className="  text-zinc-500 uppercase tracking-wider">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setActiveItem("Products"); setIsProductModalOpen(true); }} className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-100 hover:text-black rounded-lg text-center cursor-pointer transition-all">Add Product</button>
              <button onClick={() => setActiveItem("Collections")} className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-100 hover:text-black rounded-lg text-center cursor-pointer transition-all">Add Collection</button>
              <button onClick={() => setActiveItem("Categories")} className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-100 hover:text-black rounded-lg text-center cursor-pointer transition-all">Categories</button>
              <button onClick={() => setActiveItem("Coupons / Offers")} className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-100 hover:text-black rounded-lg text-center cursor-pointer transition-all">Add Coupon</button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-zinc-200 p-5 rounded-xl text-[14px] space-y-4 shadow-sm">
            <h4 className="  text-zinc-500 uppercase tracking-wider">Recent Orders</h4>
            <div className="space-y-3">
              {orders.slice(0, 3).map(o => (
                <div key={o.id} className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <div>
                    <p className="font-semibold text-zinc-900">#{o.id?.slice(0, 8)}</p>
                    <p className="text-[10px] text-zinc-500">{o.customerName || 'Guest User'}</p>
                  </div>
                  <span className="text-[#b8860b]  ">₹{(o.total || o.grandTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {orders.length === 0 && <p className="text-zinc-500 text-center">No orders placed yet.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeItem) {
      case "Analytics":
        return <AnalyticsView />;
      case "Reports":
        return <ReportsView />;
      case "Inventory":
        return <InventoryView />;
      case "Returns / Refunds":
        return <ReturnsRefundsManager />;
      case "Billing & Invoices":
        return <BillingSystem />;
      case "Profile Settings":
        return <AdminProfileSettings />;
      case "Products":
        return (
          <>
            <ProductsTable
              products={filteredProducts}
              onEdit={handleEditClick}
              onDelete={handleDeleteProduct}
            />
          </>
        );
      case "Orders":
        return (
          <>
            <OrdersTable />
          </>
        );
      case "Users":
      case "Customers":
        return (
          <>
            <UsersTable users={users} />
          </>
        );
      case "Categories":
        return (
          <GenericCRUDManager
            collectionName="categories"
            title="Category Management"
            fields={[
              { key: 'name', label: 'Name' },
              { key: 'slug', label: 'Slug' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ name: '', slug: '', description: '', is_active: true, sort_order: 1 }}
          />
        );
      case "Subcategories":
        return (
          <GenericCRUDManager
            collectionName="subcategories"
            title="Subcategory Management"
            fields={[
              { key: 'name', label: 'Name' },
              { key: 'slug', label: 'Slug' },
              { key: 'parent_category', label: 'Parent Category' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ name: '', slug: '', parent_category: '', is_active: true, sort_order: 1 }}
          />
        );
      case "Collections":
        return (
          <GenericCRUDManager
            collectionName="collections"
            title="Collection Management"
            fields={[
              { key: 'name', label: 'Name' },
              { key: 'slug', label: 'Slug' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ name: '', slug: '', description: '', is_active: true, sort_order: 1 }}
          />
        );
      case "Attributes":
        return (
          <GenericCRUDManager
            collectionName="attributes"
            title="Catalog Attributes"
            fields={[
              { key: 'name', label: 'Attribute Name' },
              { key: 'values', label: 'Allowed Values (Comma-separated)' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ name: '', values: '', is_active: true, sort_order: 1 }}
          />
        );
      case "Coupons / Offers":
        return (
          <GenericCRUDManager
            collectionName="coupons"
            title="Store Coupons & Promotional Code Manager"
            fields={[
              { key: 'code', label: 'Coupon Code' },
              { key: 'discount_type', label: 'Type (Percentage / Fixed)' },
              { key: 'discount_val', label: 'Discount Value' },
              { key: 'min_order', label: 'Min Order Requirement' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ code: '', discount_type: 'Percentage', discount_val: '10', min_order: '999', is_active: true }}
          />
        );
      case "Blogs":
        return (
          <GenericCRUDManager
            collectionName="blogs"
            title="Brand Editorial Blogs"
            fields={[
              { key: 'image', label: 'Featured Image', type: 'image' },
              { key: 'title', label: 'Blog Title' },
              { key: 'slug', label: 'Slug' },
              { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
              { key: 'content', label: 'Blog Content (HTML)', type: 'textarea' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ image: '', title: '', slug: '', excerpt: '', content: '', is_active: true }}
          />
        );
      case "Mobile Category":
        return (
          <GenericCRUDManager
            collectionName="mobile_categories"
            title="Mobile Categories (Featured Grid)"
            fields={[
              { key: 'image', label: 'Category Card Image', type: 'image' },
              { key: 'name', label: 'Category Name / Title' },
              { key: 'badge', label: 'Badge / Tag (e.g. 3XL TO 6XL)' },
              { key: 'link', label: 'Destination Route / Link' },
              { key: 'sort_order', label: 'Sort Order', type: 'number' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ image: '', name: 'SHIRTS', badge: '', link: '/shop?category=Shirts', sort_order: 1, is_active: true }}
          />
        );
      case "Pages":
        return (
          <GenericCRUDManager
            collectionName="pages"
            title="Static Brand Pages"
            fields={[
              { key: 'title', label: 'Page Title' },
              { key: 'slug', label: 'Slug' },
              { key: 'content', label: 'Content', type: 'textarea' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ title: '', slug: '', content: '', is_active: true }}
          />
        );
      case "Shop By Category":
        return (
          <GenericCRUDManager
            collectionName="shop_by_category"
            title="Shop By Category (Home Page Grid)"
            fields={[
              { key: 'image', label: 'Category Card Image', type: 'image' },
              { key: 'name', label: 'Category Name / Title' },
              { key: 'slug', label: 'Slug' },
              { key: 'link', label: 'Destination Route / Link' },
              { key: 'sort_order', label: 'Sort Order', type: 'number' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ image: '', name: 'OVERSIZED T-SHIRT', slug: 'oversized-t-shirt', link: '/shop?category=T-Shirts', sort_order: 1, is_active: true }}
          />
        );
      case "Shop The Look":
        return (
          <GenericCRUDManager
            collectionName="shop_the_look"
            title="Shop The Look Panel CRUD"
            fields={[
              { key: 'image', label: 'Panel Image', type: 'image' },
              { key: 'category', label: 'Tag / Category Subtitle' },
              { key: 'title', label: 'Product Title' },
              { key: 'price', label: 'Price (INR)', type: 'number' },
              { key: 'link', label: 'Destination Link' },
              { key: 'sort_order', label: 'Sort Order', type: 'number' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ image: '', category: 'STREETWEAR', title: 'Product Name', price: 2499, link: '/shop', sort_order: 1, is_active: true }}
          />
        );
      case "Community Gallery":
      case "Reviews":
        return <CommunityManager />;
      case "Hero Slides":
        return (
          <GenericCRUDManager
            collectionName="hero_slides"
            title="Homepage Hero Slides CMS"
            fields={[
              { key: 'image', label: 'Desktop Banner Image', type: 'image' },
              { key: 'tabletImage', label: 'Tablet Banner Image (Optional)', type: 'image' },
              { key: 'mobileImage', label: 'Mobile Banner Image (Optional)', type: 'image' },
              { key: 'tag', label: 'Tag / Eyebrow' },
              { key: 'title', label: 'Title (use \\n for line breaks)' },
              { key: 'subtitle', label: 'Subtitle' },
              { key: 'cta', label: 'CTA Text' },
              { key: 'ctaLink', label: 'CTA Link' },
              { key: 'sort_order', label: 'Sort Order', type: 'number' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ image: '', tabletImage: '', mobileImage: '', tag: 'NEW IN', title: 'Brand Title', subtitle: 'Description details...', cta: 'Shop Collection', ctaLink: '/shop', sort_order: 1, is_active: true }}
          />
        );
      case "Benefits Strip":
        return (
          <GenericCRUDManager
            collectionName="benefits_strip"
            title="Homepage Benefits Info Strip CMS"
            fields={[
              { key: 'icon', label: 'Icon (Truck, Zap, RotateCcw, ShieldCheck)' },
              { key: 'text', label: 'Benefit text' },
              { key: 'sort_order', label: 'Sort Order', type: 'number' },
              { key: 'is_active', label: 'Status', type: 'boolean' }
            ]}
            defaultItem={{ icon: 'Truck', text: 'Free Delivery', sort_order: 1, is_active: true }}
          />
        );
      case "Activity Logs":
        return <ActivityLogsView />;
      case "Store Settings":
      case "Payment Settings":
      case "Shipping Settings":
      case "Tax Settings":
      case "SEO Settings":
        return (
          <div className="bg-[#121212] border border-[#1a1a1a] rounded-xl p-6 text-white text-[14px] max-w-lg space-y-4">
            <h2 className="text-base   uppercase tracking-wider text-[#c9a962]">{activeItem}</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-widest text-[9px] block">Primary Parameter</label>
                <input type="text" defaultValue="Pasoja E-Commerce" className="w-full px-3 py-2 bg-[#161616] border border-[#222] rounded text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-500 uppercase tracking-widest text-[9px] block">Fallback Mode</label>
                <select className="w-full px-3 py-2 bg-[#161616] border border-[#222] rounded text-white">
                  <option>Enabled (Production)</option>
                  <option>Disabled (Staging)</option>
                </select>
              </div>
            </div>
            <button onClick={() => alert("Settings updated!")} className="px-5 py-2.5 bg-[#c9a962] text-[#090909]   rounded">Save Configuration</button>
          </div>
        );
      case "Help / Documentation":
        return (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 text-zinc-900 text-[14px] space-y-4 max-w-xl shadow-sm">
            <h2 className="text-base   uppercase tracking-wider text-[#b8860b]">Pasoja Suite Help Center</h2>
            <p className="text-zinc-600 font-light leading-relaxed">This dashboard controls the storefront sections, database lists, order timelines, inventory, and promotions in real time. All changes are saved automatically to Firebase Firestore.</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#f5f5f5] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-['Inter',sans-serif]">
        {/* Subtle Ambient Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#c9a962]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-black/[0.03] blur-2xl rounded-full pointer-events-none" />

        {/* Centered Admin Card Container */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-zinc-200/90 p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-3xl relative z-10 space-y-7 transition-all duration-500">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-xl shadow-black/10 ring-4 ring-black/5 mx-auto mb-4 transform hover:scale-105 transition-transform duration-300">
              <Shirt size={26} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-poppins font-extrabold tracking-[0.2em] text-zinc-900 uppercase">
              PASOJA ADMIN
            </h1>
            <p className="text-[10px] text-[#b8860b] uppercase tracking-[0.3em] font-extrabold">
              ATELIER CONTROL CENTRE
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-[11px]   flex items-center gap-2.5">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px]   uppercase tracking-[0.25em] text-zinc-500 block pl-0.5">
                Admin ID
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="super@pasoja.in"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/80 border border-zinc-300 rounded-xl text-[14px] font-medium text-zinc-900 outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all duration-300 placeholder:text-zinc-400 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px]   uppercase tracking-[0.25em] text-zinc-500 block pl-0.5">
                Security Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-50/80 border border-zinc-300 rounded-xl text-[14px] font-medium text-zinc-900 outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 transition-all duration-300 placeholder:text-zinc-400 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-black text-white font-extrabold text-[11px] uppercase tracking-[0.2em] transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-black/10 rounded-xl mt-2"
            >
              <span>Authenticate Admin</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Card Footer Badge */}
          <div className="pt-2 text-center border-t border-zinc-100">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">
              Secured Atelier Gateway • Pasoja Luxury
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f5f5f5] text-zinc-900 selection:bg-black selection:text-white">
      <AdminSidebar activeItem={activeItem} setActiveItem={setActiveItem} isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <main className="flex-1 px-4 py-6 md:px-8 lg:px-12 overflow-auto bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto">
          <AdminHeader activeItem={activeItem} searchVal={searchVal} setSearchVal={setSearchVal} onMenuClick={() => setIsMobileSidebarOpen(true)} />

          {activeItem === "Products" && (
            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="px-6 py-3 rounded-lg bg-black text-white text-[14px]   hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus size={14} /> Add New Product
              </button>
            </div>
          )}

          {renderMainContent()}
        </div>
      </main>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-7 py-5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-poppins   text-zinc-900 uppercase tracking-wider">
                  Add New Clothing Product
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-black cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-7 py-6">
              <ClothingProductForm
                onSuccess={handleAddProductSubmit}
              />
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-7 py-5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-poppins   text-zinc-900 uppercase tracking-wider">
                  Edit Product
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-black cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-7 py-6">
              <ClothingProductForm
                product={editingProduct}
                isEdit={true}
                onSuccess={handleEditProductSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
