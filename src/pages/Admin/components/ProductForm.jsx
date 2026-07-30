import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { uploadToCloudinary } from "../Admin";

const ClothingProductForm = ({ onSuccess, isEdit = false, product = null }) => {
  // Initialize size_prices from existing product or default with empty array
  const initialSizePrices = product?.size_prices || [];
  const [sizePrices, setSizePrices] = useState(initialSizePrices.length > 0 ? initialSizePrices : [{ size: "", price: 0, original_price: 0 }]);

  const getInitialImages = () => {
    if (product) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images.map(url => ({ type: 'existing', url }));
      } else if (product.image) {
        return [{ type: 'existing', url: product.image }];
      }
    }
    return [];
  };

  const [imagePreviews, setImagePreviews] = useState(getInitialImages());
  const [primaryIndex, setPrimaryIndex] = useState(0);

  // Model Image state (1 image)
  const [modelImagePreview, setModelImagePreview] = useState(product?.model_image || null);
  const [modelImageFile, setModelImageFile] = useState(null);

  const { register, handleSubmit, reset, formState, setValue, watch } = useForm({
    defaultValues: {
      name: product?.name || "",
      category: product?.category || "",
      gender: product?.gender || "Unisex",
      description: product?.description || "",
      price: product?.price || 0,
      original_price: product?.original_price || 0,
      stock: product?.stock ?? 10,
      stock_status: product?.stock_status || "In Stock",
      sizes: product?.sizes || "",
      colors: product?.colors || "",
      material: product?.material || "",
      rating: product?.rating || 4.5,
    },
  });

  const stockValue = watch("stock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      const initialImgs = [];
      if (Array.isArray(product.images) && product.images.length > 0) {
        product.images.forEach(url => initialImgs.push({ type: 'existing', url }));
      } else if (product.image) {
        initialImgs.push({ type: 'existing', url: product.image });
      }
      setImagePreviews(initialImgs);
      setPrimaryIndex(0);
      setModelImagePreview(product.model_image || null);
      setModelImageFile(null);
      setSizePrices(product.size_prices && product.size_prices.length > 0 ? product.size_prices : [{ size: "", price: 0, original_price: 0 }]);
      reset({
        name: product.name || "",
        category: product.category || "",
        gender: product.gender || "Unisex",
        description: product.description || "",
        price: product.price || 0,
        original_price: product.original_price || 0,
        stock: product.stock ?? 10,
        stock_status: product.stock_status || "In Stock",
        sizes: product.sizes || "",
        colors: product.colors || "",
        material: product.material || "",
        rating: product.rating || 4.5,
      });
    } else {
      setImagePreviews([]);
      setPrimaryIndex(0);
      setModelImagePreview(null);
      setModelImageFile(null);
      setSizePrices([{ size: "", price: 0, original_price: 0 }]);
      reset({
        name: "",
        category: "",
        gender: "Unisex",
        description: "",
        price: 0,
        original_price: 0,
        stock: 10,
        stock_status: "In Stock",
        sizes: "",
        colors: "",
        material: "",
        rating: 4.5,
      });
    }
  }, [product, reset]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => ({
      type: 'new',
      url: URL.createObjectURL(file),
      file
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleModelImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setModelImageFile(file);
      setModelImagePreview(URL.createObjectURL(file));
    }
  };

  const removeModelImage = () => {
    setModelImageFile(null);
    setModelImagePreview(null);
  };

  const removeImage = (indexToRemove) => {
    setImagePreviews(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (primaryIndex >= updated.length) {
        setPrimaryIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const selectPrimary = (idx) => {
    setPrimaryIndex(idx);
  };

  const categories = [
    "T-Shirts",
    "Shirts",
    "Jeans",
    "Jackets",
    "Dresses",
    "Skirts",
    "Shorts",
    "Sweaters",
    "Accessories"
  ];

  const addSizePrice = () => {
    setSizePrices([...sizePrices, { size: "", price: 0, original_price: 0 }]);
  };

  const removeSizePrice = (index) => {
    setSizePrices(sizePrices.filter((_, i) => i !== index));
  };

  const updateSizePrice = (index, field, value) => {
    const updated = [...sizePrices];
    updated[index][field] = value;
    setSizePrices(updated);
  };

  const onSubmit = async (values) => {
    setError("");
    setLoading(true);
    try {
      const uploadUrls = [];
      for (const item of imagePreviews) {
        if (item.type === 'existing') {
          uploadUrls.push(item.url);
        } else if (item.type === 'new' && item.file) {
          const url = await uploadToCloudinary(item.file);
          uploadUrls.push(url);
        }
      }

      // Upload model image if selected (Optional - 1 Image)
      let modelImageUrl = product?.model_image || "";
      if (modelImageFile) {
        modelImageUrl = await uploadToCloudinary(modelImageFile);
      } else if (!modelImagePreview) {
        modelImageUrl = "";
      }

      // Re-order the images array so that the primary image is first!
      let orderedUrls = [...uploadUrls];
      if (uploadUrls.length > 0) {
        const primaryUrl = uploadUrls[primaryIndex] || uploadUrls[0];
        const remainingUrls = uploadUrls.filter((_, idx) => idx !== primaryIndex);
        orderedUrls = [primaryUrl, ...remainingUrls];
      }

      // Process size_prices - filter out empty sizes
      const validSizePrices = sizePrices.filter(sp => sp.size.trim() !== "");
      
      // Use the first size price as default price if available
      const defaultPrice = validSizePrices.length > 0 ? validSizePrices[0].price : Number(values.price) || 0;
      const defaultOriginalPrice = validSizePrices.length > 0 ? validSizePrices[0].original_price : Number(values.original_price) || 0;

      const stockQty = Number(values.stock) || 0;
      const autoStatus = stockQty === 0 ? "Out of Stock" : stockQty <= 5 ? "Low Stock" : "In Stock";

      const docData = {
        name: values.name,
        category: values.category,
        gender: values.gender || "Unisex",
        description: values.description,
        price: defaultPrice,
        original_price: defaultOriginalPrice,
        size_prices: validSizePrices,
        stock: stockQty,
        stock_status: autoStatus,
        sizes: validSizePrices.map(sp => sp.size).join(", "),
        colors: values.colors,
        material: values.material,
        rating: Number(values.rating) || 4.5,
        images: orderedUrls,
        image: orderedUrls[0] || "",
        model_image: modelImageUrl,
      };

      if (onSuccess) {
        onSuccess(docData);
      }
      reset();
      setImagePreviews([]);
      setPrimaryIndex(0);
      setModelImagePreview(null);
      setModelImageFile(null);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-1">
          <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
            Product Name
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none transition-all text-sm bg-white"
            placeholder="e.g. Premium Cotton T-Shirt"
            {...register("name", { required: true })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
            Category
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none transition-all text-sm bg-white"
            {...register("category", { required: true })}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
            Gender
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none transition-all text-sm bg-white"
            {...register("gender")}
          >
            <option value="Unisex">Unisex</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
          Description
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none transition-all text-sm bg-white min-h-[100px]"
          placeholder="Describe the clothing item, materials, and style..."
          rows={4}
          {...register("description")}
        />
      </div>

      {/* Size-Price Pairs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
            Size & Price
          </label>
          <button
            type="button"
            onClick={addSizePrice}
            className="px-4 py-2 bg-[#c9a962]/10 text-[#c9a962] text-sm font-bold rounded-lg hover:bg-[#c9a962]/20 transition-colors"
          >
            + Add Size
          </button>
        </div>

        {sizePrices.map((sp, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white border border-gray-200 p-4 rounded-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Size</label>
              <input
                type="text"
                value={sp.size}
                onChange={(e) => updateSizePrice(index, "size", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none text-sm"
                placeholder="e.g. S"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Original Price</label>
              <input
                type="number"
                value={sp.original_price}
                onChange={(e) => updateSizePrice(index, "original_price", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none text-sm"
                placeholder="2999"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sale Price</label>
              <input
                type="number"
                value={sp.price}
                onChange={(e) => updateSizePrice(index, "price", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none text-sm"
                placeholder="1999"
              />
            </div>
            {sizePrices.length > 1 && (
              <button
                type="button"
                onClick={() => removeSizePrice(index)}
                className="px-3 py-2 bg-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
            Stock Quantity
          </label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none transition-all text-sm bg-white"
            placeholder="e.g. 20"
            {...register("stock")}
          />
          {/* Auto-derived status preview */}
          <p className={`text-xs font-bold mt-1 ${
            Number(stockValue) === 0 ? 'text-red-500' :
            Number(stockValue) <= 5 ? 'text-amber-500' : 'text-green-600'
          }`}>
            Status: {Number(stockValue) === 0 ? 'Out of Stock' : Number(stockValue) <= 5 ? 'Low Stock' : 'In Stock'}
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
            Colors
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none transition-all text-sm bg-white"
            placeholder="e.g. Black, White, Blue"
            {...register("colors")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
            Material
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none transition-all text-sm bg-white"
            placeholder="e.g. 100% Cotton"
            {...register("material")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
            Rating
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] outline-none transition-all text-sm bg-white"
            placeholder="4.5"
            {...register("rating")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-[#71717b] uppercase tracking-wide">
          Product Images (Select first image display)
        </label>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full px-4 py-3 rounded-xl border border-dashed border-zinc-300 hover:border-black transition-colors text-sm file:mr-4 file:py-2 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-100 file:text-zinc-900 cursor-pointer bg-white"
            onChange={handleFileChange}
          />
        </div>

        {/* Image previews grid */}
        {imagePreviews.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              Manage Images (Click on image to mark as Primary display thumbnail)
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              {imagePreviews.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => selectPrimary(idx)}
                  className={`relative group aspect-square rounded-lg border overflow-hidden bg-white cursor-pointer transition-all ${
                    primaryIndex === idx ? 'border-4 border-black' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-1.5 right-1.5 z-30 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs shadow transition-opacity"
                    title="Remove Image"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Primary indicator badge */}
                  {primaryIndex === idx && (
                    <span className="absolute bottom-1.5 left-1.5 bg-black text-white text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-sm uppercase">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Model Image Section (1 Image) */}
      <div className="space-y-3 pt-3 border-t border-zinc-200">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-zinc-700 uppercase tracking-wide flex items-center gap-2">
            <span>Model Image (Optional)</span>
          </label>
          <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
            Optional — 1 Image for lookbook view
          </span>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            className="w-full px-4 py-3 rounded-xl border border-dashed border-zinc-300 hover:border-black transition-colors text-sm file:mr-4 file:py-2 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-100 file:text-zinc-900 cursor-pointer bg-white"
            onChange={handleModelImageChange}
          />
        </div>

        {/* Model Image Preview */}
        {modelImagePreview && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              Selected Model Image
            </span>
            <div className="relative w-36 aspect-[3/4] rounded-xl border-2 border-black overflow-hidden bg-zinc-50 shadow-md">
              <img src={modelImagePreview} alt="Model Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeModelImage}
                className="absolute top-1.5 right-1.5 z-30 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs shadow transition-opacity"
                title="Remove Model Image"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="absolute bottom-1.5 left-1.5 bg-black text-white text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-sm uppercase">
                Model Photo
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200 mt-4">
        {formState.isSubmitted && !loading && !error && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Product {isEdit ? "Updated" : "Created"} Successfully
          </span>
        )}
        {error && (
          <span className="text-sm font-bold text-red-600">
            Error: {error}
          </span>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-black text-white text-sm font-bold shadow-md hover:bg-zinc-800 transition-all disabled:opacity-60 disabled:translate-y-0 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-[#71717b]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isEdit ? "Saving..." : "Uploading..."}
            </span>
          ) : isEdit ? "Save Changes" : "Publish Product"}
        </button>
      </div>
    </form>
  );
};

export default ClothingProductForm;
