import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, Edit2, Trash2, Eye, X, Check, Save } from "lucide-react";
import { Product, Category, Review } from "../../types";

interface Props {
  products: Product[];
  categories: Category[];
  onSaveProducts: (list: Product[]) => void;
  triggerToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
  autoOpenAdd?: boolean;
  onClearAutoOpen?: () => void;
}

export default function ProductsTab({
  products,
  categories,
  onSaveProducts,
  triggerToast,
  autoOpenAdd,
  onClearAutoOpen,
}: Props) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStockStatus, setSelectedStockStatus] = useState("All"); // All, inStock, lowStock, outOfStock
  const [sortBy, setSortBy] = useState("Default"); // Default, priceAsc, priceDesc, stockAsc, stockDesc, ratingDesc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    brand: "",
    material: "",
    color: "",
    price: 0,
    discount: 0,
    stock: 0,
    images: [] as string[],
    tags: "",
    isFeatured: false,
    isTopPick: false,
    isTopSelling: false,
  });

  const [imageUrlInput, setImageUrlInput] = useState("");

  const handleOpenAdd = () => {
    const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setFormData({
      name: "",
      sku: `MSC-${nextId}-${Math.floor(Math.random() * 900 + 100)}`,
      description: "",
      category: categories[0]?.name || "Backpacks",
      brand: "Maison Sac",
      material: "Full-Grain Leather",
      color: "Black",
      price: 250,
      discount: 0,
      stock: 35,
      images: ["https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80"],
      tags: "leather, premium, travel",
      isFeatured: false,
      isTopPick: false,
      isTopSelling: false,
    });
    setImageUrlInput("");
    setIsAddMode(true);
  };

  useEffect(() => {
    if (autoOpenAdd) {
      handleOpenAdd();
      if (onClearAutoOpen) {
        onClearAutoOpen();
      }
    }
  }, [autoOpenAdd]);

  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku || `MSC-${p.id}`,
      description: p.description || "",
      category: p.category,
      brand: p.brand || "Maison Sac",
      material: p.material || "Leather",
      color: p.color || "Black",
      price: p.price,
      discount: p.discount || 0,
      stock: p.stock,
      images: p.images || [],
      tags: Object.keys(p.specifications || {}).join(", ") || "leather, premium",
      isFeatured: !!p.isFeatured,
      isTopPick: !!p.isTopPick,
      isTopSelling: !!p.isTopSelling,
    });
    setImageUrlInput("");
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()],
      }));
      setImageUrlInput("");
      triggerToast("Image added to pool", "info");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      triggerToast("Product Name is required", "warning");
      return;
    }

    if (isAddMode) {
      const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct: Product = {
        id: nextId,
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        price: Number(formData.price),
        discount: Number(formData.discount),
        rating: 5.0, // default rating for new items
        stock: Number(formData.stock),
        material: formData.material,
        color: formData.color,
        isFeatured: formData.isFeatured,
        isTopPick: formData.isTopPick,
        isTopSelling: formData.isTopSelling,
        soldCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80"],
        description: formData.description,
        specifications: {
          Brand: formData.brand,
          Material: formData.material,
          Color: formData.color,
          SKU: formData.sku,
        },
        reviews: [],
      };

      onSaveProducts([newProduct, ...products]);
      setIsAddMode(false);
      triggerToast(`Added product "${newProduct.name}" successfully`, "success");
    } else if (editProduct) {
      const updatedList = products.map((p) => {
        if (p.id === editProduct.id) {
          return {
            ...p,
            name: formData.name,
            category: formData.category,
            brand: formData.brand,
            price: Number(formData.price),
            discount: Number(formData.discount),
            stock: Number(formData.stock),
            material: formData.material,
            color: formData.color,
            isFeatured: formData.isFeatured,
            isTopPick: formData.isTopPick,
            isTopSelling: formData.isTopSelling,
            images: formData.images.length > 0 ? formData.images : p.images,
            description: formData.description,
            specifications: {
              ...p.specifications,
              Brand: formData.brand,
              Material: formData.material,
              Color: formData.color,
              SKU: formData.sku,
            },
          };
        }
        return p;
      });

      onSaveProducts(updatedList);
      setEditProduct(null);
      triggerToast(`Updated product "${formData.name}" successfully`, "success");
    }
  };

  const handleDeleteProduct = (id: number) => {
    const confirmation = window.confirm("Are you absolutely sure you want to delete this exquisite product?");
    if (confirmation) {
      const filtered = products.filter((p) => p.id !== id);
      onSaveProducts(filtered);
      triggerToast("Exquisite item removed from registry", "success");
    }
  };

  // Filter application
  let filteredProducts = [...products];

  // Search filter
  if (searchTerm.trim()) {
    const query = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (selectedCategory !== "All") {
    filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory);
  }

  // Stock status filter
  if (selectedStockStatus !== "All") {
    if (selectedStockStatus === "inStock") {
      filteredProducts = filteredProducts.filter((p) => p.stock > 10);
    } else if (selectedStockStatus === "lowStock") {
      filteredProducts = filteredProducts.filter((p) => p.stock > 0 && p.stock <= 10);
    } else if (selectedStockStatus === "outOfStock") {
      filteredProducts = filteredProducts.filter((p) => p.stock === 0);
    }
  }

  // Sort filter
  if (sortBy !== "Default") {
    switch (sortBy) {
      case "priceAsc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "stockAsc":
        filteredProducts.sort((a, b) => a.stock - b.stock);
        break;
      case "stockDesc":
        filteredProducts.sort((a, b) => b.stock - a.stock);
        break;
      case "ratingDesc":
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  // Pagination bounds
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStockBadge = (stockCount: number) => {
    if (stockCount === 0) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider font-mono">Out of Stock</span>;
    }
    if (stockCount <= 10) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider font-mono">Low ({stockCount})</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider font-mono">Stock: {stockCount}</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-6" id="products-tab-panel">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Universal Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 relative h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products by Name, SKU, Tag or Category..."
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-amber-500 bg-stone-50/50"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filtering Dropdowns */}
          <div className="flex items-center gap-2">
            {/* Category dropdown */}
            <select
              className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-amber-500 bg-white"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Stock status filter dropdown */}
            <select
              className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-amber-500 bg-white"
              value={selectedStockStatus}
              onChange={(e) => {
                setSelectedStockStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Stock Levels</option>
              <option value="inStock">Healthy Stock (&gt;10)</option>
              <option value="lowStock">Low Inventory (1-10)</option>
              <option value="outOfStock">Out of Stock (0)</option>
            </select>

            {/* Sorter dropdown */}
            <select
              className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-amber-500 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Default">Sort Matrix</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="stockAsc">Stock: Empty to Full</option>
              <option value="stockDesc">Stock: Full to Empty</option>
              <option value="ratingDesc">Ratings: Star Count</option>
            </select>
          </div>
        </div>

        {/* Add Product Button */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          Add Exquisite Bag
        </button>
      </div>

      {/* Database Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              <th className="py-3 px-4">Image & Bag SKU</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Metadata</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-center">Discount</th>
              <th className="py-3 px-4 text-center">Stock Quality</th>
              <th className="py-3 px-4 text-center">Toggles</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => {
                const discountPrice = p.price * (1 - p.discount / 100);
                return (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors group">
                    {/* Image & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=200&q=80"}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 object-cover object-center rounded-xl bg-stone-50 border border-stone-200"
                        />
                        <div className="flex flex-col">
                          <span className="font-mono text-[9px] text-amber-600 font-extrabold tracking-wider uppercase">
                            {p.sku || `MSC-${p.id}`}
                          </span>
                          <span className="text-[10px] font-semibold text-stone-400">ID: #{p.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-sans font-bold text-stone-900 max-w-xs truncate">
                      {p.name}
                    </td>

                    {/* Category & Brand */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-stone-800">{p.category}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{p.brand || "Maison Sac"}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                      {p.discount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span>${discountPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-stone-400 line-through font-normal">
                            ${p.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span>${p.price.toFixed(2)}</span>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-amber-600">
                      {p.discount > 0 ? `${p.discount}% OFF` : "-"}
                    </td>

                    {/* Stock status */}
                    <td className="py-3.5 px-4 text-center">{getStockBadge(p.stock)}</td>

                    {/* Feature Toggles indicator */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-40 mx-auto">
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-blue-50 text-blue-700 tracking-wider font-mono">
                            FEATURED
                          </span>
                        )}
                        {p.isTopPick && (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-amber-50 text-amber-700 tracking-wider font-mono">
                            TOP PICK
                          </span>
                        )}
                        {p.isTopSelling && (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-stone-900 text-stone-100 tracking-wider font-mono">
                            SELLING
                          </span>
                        )}
                        {!p.isFeatured && !p.isTopPick && !p.isTopSelling && (
                          <span className="text-stone-400 text-[11px]">-</span>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailProduct(p)}
                          className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Portfolio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-stone-400 font-medium font-sans">
                  No matching products inside the atelier database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between border-t border-stone-100 pt-5 mt-4 text-xs font-semibold text-stone-600">
        <span>
          Showing <strong className="text-stone-900">{filteredProducts.length > 0 ? startIndex + 1 : 0}</strong> to{" "}
          <strong className="text-stone-900">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</strong> of{" "}
          <strong className="text-stone-900">{filteredProducts.length}</strong> items
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border font-mono ${
                currentPage === idx + 1
                  ? "bg-stone-900 text-white border-stone-900"
                  : "border-stone-200 hover:bg-stone-50 text-stone-700"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {(isAddMode || editProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
              <h3 className="font-sans font-bold text-stone-900 text-base">
                {isAddMode ? "Introduce Elegant Bag to Catalog" : `Modify Mastercraft Product Details`}
              </h3>
              <button
                onClick={() => {
                  setIsAddMode(false);
                  setEditProduct(null);
                }}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
                    placeholder="e.g. Saffiano Leather Structured Tote"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* SKU Code */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">SKU ID Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="e.g. MSC-PROD-510"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Collection Category</label>
                  <select
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Aesthetic Sourced Brand</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    value={formData.brand}
                    placeholder="Maison Sac"
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  />
                </div>

                {/* Material Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Atelier Raw Material</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Full-grain Italian Calfskin"
                    value={formData.material}
                    onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
                  />
                </div>

                {/* Color option */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Dominant Palette Color</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Cognac Brown"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  />
                </div>

                {/* Original Retail Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Retail Price (Base USD)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>

                {/* Discount price */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Promotion Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="e.g. 15 for 15% Off"
                    value={formData.discount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number(e.target.value) }))}
                  />
                </div>

                {/* Stock on hand */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">In-Stock Quantity count</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    value={formData.stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  />
                </div>

                {/* SEO Tags */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Keywords Tags (commas)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="leather, classy, office, hand-craft"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>

              {/* Product description */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Heritage Story description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  placeholder="Tell clients about the craftsmanship, stitching elegance, and pocket partitions..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Toggle indicators */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono block">Showcase Placement Settings</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Featured */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">Featured Placement</span>
                      <span className="text-[9px] text-stone-400">Add to Homepage Carousel</span>
                    </div>
                  </label>

                  {/* Top Pick */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      checked={formData.isTopPick}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isTopPick: e.target.checked }))}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">Concierge Top Pick</span>
                      <span className="text-[9px] text-stone-400">Elite seasonal choices ribbon</span>
                    </div>
                  </label>

                  {/* Top Selling */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      checked={formData.isTopSelling}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isTopSelling: e.target.checked }))}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">High-volume Best Seller</span>
                      <span className="text-[9px] text-stone-400">Affix high-demand dynamic badge</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dynamic Images list URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono block">Portfolio Photography Showcase</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Insert luxury image URL..."
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-stone-200 text-stone-800 text-xs font-bold rounded-xl hover:bg-stone-350 transition-colors"
                  >
                    Inject Image
                  </button>
                </div>

                {/* Rendered Image Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative aspect-square border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1 right-1 p-0.5 bg-stone-900/80 rounded-md text-white hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMode(false);
                    setEditProduct(null);
                  }}
                  className="px-4 py-2 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 bg-stone-900 hover:bg-stone-855 text-white rounded-xl shadow-md transition-all active:scale-98"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  Save Portfolio Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAILED PRODUCT VIEW ================= */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-100 max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setDetailProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Product illustration */}
              <div className="w-full sm:w-1/3 flex-shrink-0">
                <img
                  src={detailProduct.images[0] || "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80"}
                  alt=""
                  className="w-full aspect-square object-cover rounded-xl border border-stone-200 shadow-sm"
                />
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {detailProduct.images.slice(1).map((imgUrl, idx) => (
                    <img key={idx} src={imgUrl} className="aspect-square object-cover rounded-lg border border-stone-200" alt="" />
                  ))}
                </div>
              </div>

              {/* Specs */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="font-mono text-[9px] text-amber-600 font-extrabold tracking-widest uppercase">
                    {detailProduct.sku || "MSC-PROD-UNKN"}
                  </span>
                  <h3 className="font-sans font-extrabold text-stone-900 text-lg leading-snug">{detailProduct.name}</h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">{detailProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400 font-medium block">Collection Class</span>
                    <strong className="text-stone-800">{detailProduct.category}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Sourced Material</span>
                    <strong className="text-stone-800">{detailProduct.material}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Color Tone</span>
                    <strong className="text-stone-800">{detailProduct.color}</strong>
                  </div>
                  <div>
                    <span className="text-stone-300 font-medium font-mono text-[10px] block">Star Rating</span>
                    <strong className="text-stone-800">★ {detailProduct.rating?.toFixed(1) || "5.0"}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Atelier Base Value</span>
                    <strong className="text-stone-800">${detailProduct.price.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Rebate Applied</span>
                    <strong className="text-amber-600 font-mono font-bold">
                      {detailProduct.discount > 0 ? `${detailProduct.discount}% OFF` : "No Promotion"}
                    </strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span>Atelier stock state:</span>
                  <strong>{getStockBadge(detailProduct.stock)}</strong>
                </div>

                {/* Sub reviews */}
                <div className="pt-4 border-t border-stone-100">
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">Client Testimonials ({detailProduct.reviews?.length || 0})</span>
                  {detailProduct.reviews && detailProduct.reviews.length > 0 ? (
                    <div className="space-y-2 mt-2 max-h-36 overflow-y-auto">
                      {detailProduct.reviews.map((rev, rIdx) => (
                        <div key={rIdx} className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-[11px] leading-normal text-stone-700">
                          <div className="flex items-center justify-between font-bold text-stone-900 mb-0.5">
                            <span>{rev.name}</span>
                            <span className="text-amber-500 font-mono">{"★".repeat(rev.rating)}</span>
                          </div>
                          <p className="text-stone-500 italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-400 italic mt-1">This luxury piece hasn't received public remarks yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
