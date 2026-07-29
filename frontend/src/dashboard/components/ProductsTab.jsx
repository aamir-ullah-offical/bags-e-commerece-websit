import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Eye, X, Save, Loader2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import { MultiImageUpload } from "../../components/ImageUpload";
import { formatPKR, calcSalePrice } from "../../utils/currency";

export default function ProductsTab({
  products,
  categories,
  onRefreshProducts,
  triggerToast,
  autoOpenAdd,
  onClearAutoOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStockStatus, setSelectedStockStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Default");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [detailProduct, setDetailProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const EMPTY_FORM = {
    name: "",
    sku: "",
    description: "",
    category: "",
    brand: "",
    material: "",
    color: "",
    price: 25000,
    discount: 0,
    stock: 35,
    images: [],
    tags: "",
    specs: [{ key: "", value: "" }],
    isFeatured: false,
    isTopPick: false,
    isTopSelling: false,
  };

  const [formData, setFormData] = useState(EMPTY_FORM);

  const normalizeImages = (imgs) => {
    if (!Array.isArray(imgs)) return [];
    return imgs.map((img) => (typeof img === "string" ? { url: img, publicId: "" } : img));
  };

  const normalizeSpecs = (specs) => {
    if (!specs) return [{ key: "", value: "" }];
    if (Array.isArray(specs)) return specs.length > 0 ? specs : [{ key: "", value: "" }];
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  };

  const handleOpenAdd = () => {
    setFormData({
      ...EMPTY_FORM,
      sku: `MSC-${Math.floor(Math.random() * 9000 + 1000)}`,
      category: categories[0]?.name || "",
      brand: "Maison Sac",
      material: "Full-Grain Leather",
      color: "Black",
      tags: "leather, premium",
      specs: [
        { key: "Material", value: "" },
        { key: "Hardware", value: "" },
      ],
    });
    setIsAddMode(true);
  };

  useEffect(() => {
    if (autoOpenAdd) {
      handleOpenAdd();
      if (onClearAutoOpen) onClearAutoOpen();
    }
  }, [autoOpenAdd]);

  const handleOpenEdit = (p) => {
    setEditProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku || "",
      description: p.description || "",
      category: p.category,
      brand: p.brand || "Maison Sac",
      material: p.material || "Leather",
      color: p.color || "Black",
      price: p.price,
      discount: p.discount || 0,
      stock: p.stock,
      images: normalizeImages(p.images),
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || ""),
      specs: normalizeSpecs(p.specifications),
      isFeatured: !!p.isFeatured,
      isTopPick: !!p.isTopPick,
      isTopSelling: !!p.isTopSelling,
    });
  };

  const addSpec = () =>
    setFormData((prev) => ({ ...prev, specs: [...prev.specs, { key: "", value: "" }] }));

  const removeSpec = (i) =>
    setFormData((prev) => ({ ...prev, specs: prev.specs.filter((_, idx) => idx !== i) }));

  const updateSpec = (i, field, val) =>
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    }));

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerToast("Product Name is required", "info");
      return;
    }

    const payload = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      material: formData.material,
      color: formData.color,
      price: Number(formData.price),
      discount: Number(formData.discount),
      stock: Number(formData.stock),
      images: formData.images.map((img) => img.url).filter(Boolean),
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      specifications: formData.specs.filter((s) => s.key.trim()),
      isFeatured: formData.isFeatured,
      isTopPick: formData.isTopPick,
      isTopSelling: formData.isTopSelling,
    };

    setSaving(true);
    try {
      if (isAddMode) {
        await adminService.createProduct(payload);
        triggerToast(`Added "${payload.name}" to catalog`, "success");
        setIsAddMode(false);
      } else if (editProduct) {
        await adminService.updateProduct(editProduct._id, payload);
        triggerToast(`Updated "${payload.name}"`, "success");
        setEditProduct(null);
      }
      await onRefreshProducts?.();
    } catch (err) {
      triggerToast(err?.response?.data?.message || "Save failed", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Remove "${p.name}" from the catalog?`)) return;
    try {
      await adminService.deleteProduct(p._id);
      triggerToast("Product removed from registry", "success");
      await onRefreshProducts?.();
    } catch (err) {
      triggerToast(err?.response?.data?.message || "Delete failed", "info");
    }
  };

  let filteredProducts = [...products];

  if (searchTerm.trim()) {
    const query = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query))
    );
  }

  if (selectedCategory !== "All") {
    filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory);
  }

  if (selectedStockStatus !== "All") {
    if (selectedStockStatus === "inStock") {
      filteredProducts = filteredProducts.filter((p) => p.stock > 10);
    } else if (selectedStockStatus === "lowStock") {
      filteredProducts = filteredProducts.filter((p) => p.stock > 0 && p.stock <= 10);
    } else if (selectedStockStatus === "outOfStock") {
      filteredProducts = filteredProducts.filter((p) => p.stock === 0);
    }
  }

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
        filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStockBadge = (stockCount) => {
    if (stockCount === 0)
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider font-mono">Out of Stock</span>;
    if (stockCount <= 10)
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider font-mono">Low ({stockCount})</span>;
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider font-mono">Stock: {stockCount}</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-xs p-6" id="products-tab-panel">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products by Name, SKU, Tag or Category..."
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:border-amber-500 bg-stone-50/50"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-amber-500 bg-white"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-amber-500 bg-white"
              value={selectedStockStatus}
              onChange={(e) => { setSelectedStockStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Stock Levels</option>
              <option value="inStock">Healthy Stock (&gt;10)</option>
              <option value="lowStock">Low Inventory (1-10)</option>
              <option value="outOfStock">Out of Stock (0)</option>
            </select>

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

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          Add Exquisite Bag
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              <th className="py-3 px-4">Image & SKU</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Metadata</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-center">Discount</th>
              <th className="py-3 px-4 text-center">Stock</th>
              <th className="py-3 px-4 text-center">Flags</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => {
                const discountPrice = calcSalePrice(p.price, p.discount);
                return (
                  <tr key={p._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=200&q=80"}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 object-cover object-center rounded-xl bg-stone-50 border border-stone-200"
                        />
                        <span className="font-mono text-[9px] text-amber-600 font-extrabold tracking-wider uppercase">
                          {p.sku || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans font-bold text-stone-900 max-w-xs truncate">
                      {p.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-stone-800">{p.category}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{p.brand || "Maison Sac"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                      {p.discount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span>{formatPKR(discountPrice)}</span>
                          <span className="text-[10px] text-stone-400 line-through font-normal">{formatPKR(p.price)}</span>
                        </div>
                      ) : (
                        <span>{formatPKR(p.price)}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-amber-600">
                      {p.discount > 0 ? `${p.discount}% OFF` : "-"}
                    </td>

                    <td className="py-3.5 px-4 text-center">{getStockBadge(p.stock)}</td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-40 mx-auto">
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-blue-50 text-blue-700 tracking-wider font-mono">FEATURED</span>
                        )}
                        {p.isTopPick && (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-amber-50 text-amber-700 tracking-wider font-mono">TOP PICK</span>
                        )}
                        {p.isTopSelling && (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-stone-900 text-stone-100 tracking-wider font-mono">SELLING</span>
                        )}
                        {!p.isFeatured && !p.isTopPick && !p.isTopSelling && (
                          <span className="text-stone-400 text-[11px]">-</span>
                        )}
                      </div>
                    </td>

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
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove"
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

      {/* Pagination */}
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

      {/* ================= MODAL: ADD / EDIT ================= */}
      {(isAddMode || editProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
              <h3 className="font-sans font-bold text-stone-900 text-base">
                {isAddMode ? "Introduce Elegant Bag to Catalog" : "Modify Mastercraft Product Details"}
              </h3>
              <button
                onClick={() => { setIsAddMode(false); setEditProduct(null); }}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">SKU ID Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="e.g. MSC-PROD-510"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Collection Category</label>
                  <select
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Brand</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    value={formData.brand}
                    placeholder="Maison Sac"
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Material</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Full-grain Italian Calfskin"
                    value={formData.material}
                    onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Color</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Cognac Brown"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Retail Price (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="e.g. 15"
                    value={formData.discount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number(e.target.value) }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-mono"
                    value={formData.stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    placeholder="leather, classy, office, hand-craft"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  placeholder="Tell clients about the craftsmanship, stitching elegance, and pocket partitions..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono">Specifications</label>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.specs.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Key (e.g. Material)"
                        className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-mono"
                        value={spec.key}
                        onChange={(e) => updateSpec(i, "key", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Full-Grain Leather)"
                        className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                        value={spec.value}
                        onChange={(e) => updateSpec(i, "value", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Images */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider font-mono block">
                  Product Photography
                </label>
                <MultiImageUpload
                  folder="image"
                  values={formData.images}
                  onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
                  max={8}
                />
              </div>

              {/* Showcase Flags */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest font-mono block">Showcase Placement</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">Featured</span>
                      <span className="text-[9px] text-stone-400">Homepage Carousel</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      checked={formData.isTopPick}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isTopPick: e.target.checked }))}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">Top Pick</span>
                      <span className="text-[9px] text-stone-400">Elite seasonal ribbon</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                      checked={formData.isTopSelling}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isTopSelling: e.target.checked }))}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-900">Best Seller</span>
                      <span className="text-[9px] text-stone-400">High-demand badge</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => { setIsAddMode(false); setEditProduct(null); }}
                  className="px-4 py-2 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-6 py-2 bg-stone-900 hover:bg-stone-855 text-white rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-amber-400" />}
                  {saving ? "Saving..." : "Save Portfolio Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRODUCT DETAIL ================= */}
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
              <div className="w-full sm:w-1/3 flex-shrink-0">
                <img
                  src={detailProduct.images?.[0] || "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80"}
                  alt=""
                  className="w-full aspect-square object-cover rounded-xl border border-stone-200 shadow-sm"
                />
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {detailProduct.images?.slice(1).map((imgUrl, idx) => (
                    <img key={idx} src={imgUrl} className="aspect-square object-cover rounded-lg border border-stone-200" alt="" />
                  ))}
                </div>
              </div>

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
                    <span className="text-stone-400 font-medium block">Category</span>
                    <strong className="text-stone-800">{detailProduct.category}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Material</span>
                    <strong className="text-stone-800">{detailProduct.material}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Color</span>
                    <strong className="text-stone-800">{detailProduct.color}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Rating</span>
                    <strong className="text-stone-800">★ {detailProduct.rating?.toFixed(1) || "5.0"}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Base Price</span>
                    <strong className="text-stone-800">{formatPKR(detailProduct.price)}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium block">Discount</span>
                    <strong className="text-amber-600 font-mono font-bold">
                      {detailProduct.discount > 0 ? `${detailProduct.discount}% OFF` : "No Promotion"}
                    </strong>
                  </div>
                </div>

                {Array.isArray(detailProduct.specifications) && detailProduct.specifications.length > 0 && (
                  <div className="pt-3 border-t border-stone-100">
                    <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono block mb-2">Specifications</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {detailProduct.specifications.map((s, i) => (
                        <div key={i} className="text-xs">
                          <span className="text-stone-400 font-medium">{s.key}: </span>
                          <strong className="text-stone-800">{s.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span>Stock:</span>
                  <strong>{getStockBadge(detailProduct.stock)}</strong>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">
                    Client Testimonials ({detailProduct.reviews?.length || 0})
                  </span>
                  {detailProduct.reviews?.length > 0 ? (
                    <div className="space-y-2 mt-2 max-h-36 overflow-y-auto">
                      {detailProduct.reviews.map((rev, rIdx) => (
                        <div key={rIdx} className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-[11px] leading-normal text-stone-700">
                          <div className="flex items-center justify-between font-bold text-stone-900 mb-0.5">
                            <span>{rev.name || rev.user?.fullName}</span>
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
