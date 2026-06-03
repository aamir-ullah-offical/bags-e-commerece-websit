import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal,
  X,
  Search,
  Grid,
  Sparkles,
  Info,
  Check,
  RotateCcw,
} from "lucide-react";

import { productService } from "../utils/productService";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Breadcrumb from "../components/Breadcrumb";
import QuickViewModal from "../components/QuickViewModal";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Load static resources
  const allProducts = productService.getProducts();
  const categories = productService.getCategories();

  // Retrieve dynamic lists of colors and materials to prevent static hardcoding
  const availableColors = Array.from(new Set(allProducts.map((p) => p.color)));
  const availableMaterials = Array.from(new Set(allProducts.map((p) => p.material)));

  // UI / Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(300);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(false);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("Latest");

  // Mobile Filter Sidebar Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Quick View State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Initial Sync with Search Query and Category from URL
  useEffect(() => {
    const searchParam = searchParams.get("search");
    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const sortParam = searchParams.get("sort");

    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (brandParam) {
      setSearchQuery(brandParam); // Search acts as search/brand
    }
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // Combined Reactive filtering using Product Service
  const filteredProducts = productService.queryProducts({
    search: searchQuery,
    category: selectedCategory,
    colors: selectedColors,
    materials: selectedMaterials,
    maxPrice: maxPrice,
    ratings: selectedRatings,
    discountsOnly: showDiscountsOnly,
    inStockOnly: showInStockOnly,
    sort: sortBy,
  });

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setMaxPrice(300);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedRatings([]);
    setShowDiscountsOnly(false);
    setShowInStockOnly(false);
    setSortBy("Latest");
    setSearchParams({});
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Sync with URL query silently without full page refresh
    if (e.target.value) {
      searchParams.set("search", e.target.value);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div id="shop-page" className="min-h-screen bg-stone-50 pb-20">
      {/* Dynamic Navigation Line */}
      <Breadcrumb items={[{ label: "Shop Catalog" }]} />

      {/* SHOP INTRO HEADER */}
      <section className="bg-white py-10 px-4 md:px-8 border-b border-stone-100 mb-8" id="shop-intro">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-sans font-black text-3xl text-stone-900 tracking-tight flex items-center gap-2">
              The Luxury Atelier
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-stone-500 max-w-md mt-1 leading-relaxed">
              Explore meticulously detailed handbags, lightweight voyager travel duffles, and commuter computer sleeves.
            </p>
          </div>

          {/* Search form inside shop page */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search boutique items..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-stone-50 text-xs py-3.5 pl-10 pr-4 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 transition-all font-sans font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchParams.delete("search");
                  setSearchParams(searchParams);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-950 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CATALOG WORKSPACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white p-6 rounded-2xl border border-stone-150 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <span className="text-xs font-black tracking-widest uppercase text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters Console
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-stone-400 hover:text-amber-600 uppercase font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* SIDEBAR BLOCK: CATEGORY */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider mb-3">Categories</h3>
            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  searchParams.delete("category");
                  setSearchParams(searchParams);
                }}
                className={`text-left py-1.5 px-2.5 rounded-lg font-medium transition-all ${
                  selectedCategory === "All"
                    ? "bg-stone-900 text-white font-semibold"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                }`}
              >
                All Accessories ({allProducts.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    searchParams.set("category", cat.name);
                    setSearchParams(searchParams);
                  }}
                  className={`text-left py-1.5 px-2.5 rounded-lg font-medium transition-all flex justify-between items-center ${
                    selectedCategory === cat.name
                      ? "bg-stone-900 text-white font-semibold animate-duration-150"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 rounded-md ${
                    selectedCategory === cat.name ? "bg-stone-800 text-amber-400" : "bg-stone-100 text-stone-500"
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* SIDEBAR BLOCK: PRICE RANGE SLIDER */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider mb-2 flex justify-between">
              <span>Max Price</span>
              <span className="font-mono text-amber-600 font-bold">${maxPrice}</span>
            </h3>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>$0</span>
              <span>$300</span>
            </div>
          </div>

          {/* SIDEBAR BLOCK: COLOR */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider mb-3">Filter by Color</h3>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((clr) => {
                const isSelected = selectedColors.includes(clr);
                let clrHex = "bg-stone-500";
                if (clr === "Tan Brown" || clr === "Saddle Tan") clrHex = "bg-amber-850";
                else if (clr === "Forest Green" || clr === "Emerald Green") clrHex = "bg-emerald-800";
                else if (clr === "Mineral Black" || clr === "Dark Charcoal") clrHex = "bg-stone-950";
                else if (clr === "Navy Blue" || clr === "Cobalt Blue") clrHex = "bg-blue-900";
                else if (clr === "Natural Cream" || clr === "Natural Straw") clrHex = "bg-stone-200 border border-stone-300";
                else if (clr === "Blush Pink") clrHex = "bg-rose-200";
                else if (clr === "Burgundy" || clr === "Maroon" || clr === "Burgundy") clrHex = "bg-rose-950";

                return (
                  <button
                    key={clr}
                    onClick={() => toggleColor(clr)}
                    className={`w-6 h-6 rounded-full cursor-pointer relative ${clrHex} hover:scale-110 active:scale-95 transition-all ${
                      isSelected ? "ring-2 ring-stone-950 ring-offset-2 scale-110" : ""
                    }`}
                    title={clr}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR BLOCK: MATERIAL */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider mb-3">Material</h3>
            <div className="flex flex-col gap-1.5">
              {availableMaterials.map((mat) => {
                const isChecked = selectedMaterials.includes(mat);
                return (
                  <label key={mat} className="flex items-center gap-2 text-xs text-stone-600 hover:text-stone-900 pointer-events-auto cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMaterial(mat)}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="font-medium">{mat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR BLOCK: OTHER PREFERENCES */}
          <div className="mb-6 pt-4 border-t border-stone-100 flex flex-col gap-2.5">
            <label className="flex items-center gap-2 text-xs text-stone-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={showDiscountsOnly}
                onChange={() => setShowDiscountsOnly(!showDiscountsOnly)}
                className="accent-amber-500 rounded"
              />
              <span>Sale & Discounts Only</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-stone-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={() => setShowInStockOnly(!showInStockOnly)}
                className="accent-amber-500 rounded"
              />
              <span>Exclude Sold Out</span>
            </label>
          </div>
        </aside>

        {/* MAIN RESULTS GRID AND CONTROLS CONTAINER */}
        <section className="flex-1">
          {/* SORTING BAR / CONTROLS PANEL */}
          <div className="bg-white rounded-xl py-3.5 px-4 mb-6 border border-stone-100 shadow-xxs flex items-center justify-between gap-4">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            <span className="text-xs text-stone-500 font-mono">
              Displaying <span className="font-bold text-stone-900">{filteredProducts.length}</span> of{" "}
              {allProducts.length} boutique models
            </span>

            {/* Sorting trigger dropdown */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-amber-500 text-stone-850 font-semibold font-sans transition-all cursor-pointer"
              >
                <option value="Latest">New Arrivals</option>
                <option value="Price Low to High">Price: Low to High</option>
                <option value="Price High to Low">Price: High to Low</option>
                <option value="Best Selling">Best Selling</option>
                <option value="Top Picks">Atelier Top Picks</option>
                <option value="Highest Rated">Customer Rated</option>
              </select>
            </div>
          </div>

          {/* ACTIVE FILTER DISMISS BLOCKS (REDUCER CHUNKS) */}
          {(selectedCategory !== "All" ||
            selectedColors.length > 0 ||
            selectedMaterials.length > 0 ||
            showDiscountsOnly ||
            showInStockOnly) && (
            <div className="flex flex-wrap gap-2 items-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Active Limits:
              </span>
              {selectedCategory !== "All" && (
                <span className="text-xxs font-bold uppercase bg-stone-100 text-stone-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedColors.map((col) => (
                <span key={col} className="text-xxs font-bold uppercase bg-stone-150 text-stone-700 px-2 py-1 rounded-full flex items-center gap-1">
                  Color: {col}
                  <button onClick={() => toggleColor(col)} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedMaterials.map((mat) => (
                <span key={mat} className="text-xxs font-bold uppercase bg-stone-150 text-stone-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {mat}
                  <button onClick={() => toggleMaterial(mat)} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {showDiscountsOnly && (
                <span className="text-xxs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-full flex items-center gap-1">
                  On Sale
                  <button onClick={() => setShowDiscountsOnly(false)} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {showInStockOnly && (
                <span className="text-xxs font-bold uppercase bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full flex items-center gap-1 animate-duration-150">
                  In Stock Only
                  <button onClick={() => setShowInStockOnly(false)} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* SYSTEM GRID VIEWPORTS */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          ) : (
            /* NO RESULTS PLACEHOLDER */
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center max-w-md mx-auto my-12 flex flex-col items-center gap-4">
              <div className="p-4 bg-stone-100 rounded-full text-stone-400">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="font-sans font-bold text-lg text-stone-900 leading-tight">No Matching Pieces Found</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                We couldn't locate any handcrafted items that match your selection. Reset filters or modify your keywords to continue exploring.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-stone-900 hover:bg-stone-850 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* MOBILE CONSOL DRAWER BLOCK */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 max-w-xs w-full bg-white z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Filter Console
                  </span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-lg hover:bg-stone-100 text-stone-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories inside mobile */}
                <div className="my-6">
                  <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider mb-2">Category</h4>
                  <div className="flex flex-col gap-1 text-xs">
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={`text-left py-1.5 px-3 rounded-lg font-medium ${
                        selectedCategory === "All" ? "bg-stone-900 text-white" : "text-stone-600"
                      }`}
                    >
                      All Accessories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.name)}
                        className={`text-left py-1.5 px-3 rounded-lg font-medium ${
                          selectedCategory === c.name ? "bg-stone-900 text-white" : "text-stone-600"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range inside mobile */}
                <div className="mb-6">
                  <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Max Price</span>
                    <span className="font-mono text-amber-600 font-bold">${maxPrice}</span>
                  </h4>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-stone-100 rounded-lg"
                  />
                </div>

                {/* Color indicators mobile */}
                <div className="mb-6">
                  <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-wider mb-3">Colors</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {availableColors.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => toggleColor(clr)}
                        className={`w-5 h-5 rounded-full relative ${
                          selectedColors.includes(clr) ? "ring-2 ring-stone-900 ring-offset-2" : ""
                        }`}
                        style={{
                          backgroundColor:
                            clr === "Tan Brown" || clr === "Saddle Tan"
                              ? "#B45309"
                              : clr === "Forest Green" || clr === "Emerald Green"
                                ? "#065F46"
                                : clr === "Mineral Black" || clr === "Dark Charcoal"
                                  ? "#1c1917"
                                  : clr === "Navy Blue" || clr === "Cobalt Blue"
                                    ? "#1E3A8A"
                                    : clr === "Blush Pink"
                                      ? "#FBCFE8"
                                      : clr === "Natural Cream" || clr === "Natural Straw"
                                        ? "#E7E5E4"
                                        : "#888",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset / Actions bottom mobile */}
              <div className="pt-6 border-t border-stone-100 flex flex-col gap-2.5">
                <button
                  onClick={handleResetFilters}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-850 font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors font-mono"
                >
                  Reset Active Filters
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-stone-950 hover:bg-stone-850 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors"
                >
                  View {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DETAILED QUICKVIEW PORTAL LINK */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
