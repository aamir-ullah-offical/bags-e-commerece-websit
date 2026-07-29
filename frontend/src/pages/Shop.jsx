import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal, X, Search, Sparkles, Info, Check, RotateCcw, Star,
} from "lucide-react";

import { productService, filterProducts } from "../services/productService";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import Breadcrumb from "../components/Breadcrumb";
import QuickViewModal from "../components/QuickViewModal";
import useDebounce from "../hooks/useDebounce";
import { formatPKR } from "../utils/currency";

/* ── Skeleton grid ── */
function GridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Color map ── */
const COLOR_HEX = {
  "Tan Brown":      "#B45309",
  "Saddle Tan":     "#B45309",
  "Forest Green":   "#065F46",
  "Emerald Green":  "#047857",
  "Mineral Black":  "#1c1917",
  "Dark Charcoal":  "#292524",
  "Navy Blue":      "#1E3A8A",
  "Cobalt Blue":    "#1D4ED8",
  "Natural Cream":  "#E7E5E4",
  "Natural Straw":  "#E7E5E4",
  "Blush Pink":     "#FBCFE8",
  "Burgundy":       "#4C0519",
  "Maroon":         "#6B0F1A",
};

/* ──────────────────────────────────────────────────────────────────────────
   FilterSidebar — defined OUTSIDE Shop so React reuses the same component
   type across renders instead of remounting it on every Shop state change.
   ────────────────────────────────────────────────────────────────────────── */
const FilterSidebar = memo(function FilterSidebar({
  categories,
  totalCount,
  selectedCategory,
  onCategorySelect,
  maxPrice,
  setMaxPrice,
  maxPriceLimit,
  availableColors,
  selectedColors,
  toggleColor,
  availableMaterials,
  selectedMaterials,
  toggleMaterial,
  selectedRatings,
  toggleRating,
  showDiscountsOnly,
  setShowDiscountsOnly,
  showInStockOnly,
  setShowInStockOnly,
}) {
  return (
    <>
      {/* CATEGORY */}
      <div className="mb-7">
        <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.14em] mb-3 flex items-center gap-1.5">
          <span className="w-1 h-3.5 bg-amber-500 rounded-full block" />
          Categories
        </h3>
        <div className="flex flex-col gap-0.5 text-xs">
          <button
            onClick={() => onCategorySelect("All")}
            className={`text-left py-2 px-3 rounded-xl font-semibold transition-all ${
              selectedCategory === "All"
                ? "bg-stone-950 text-white"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
            }`}
          >
            All Accessories ({totalCount})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.name)}
              className={`text-left py-2 px-3 rounded-xl font-semibold transition-all flex justify-between items-center ${
                selectedCategory === cat.name
                  ? "bg-stone-950 text-white"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 rounded-md ${
                selectedCategory === cat.name ? "bg-stone-800 text-amber-400" : "bg-stone-100 text-stone-400"
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PRICE RANGE */}
      <div className="mb-7">
        <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.14em] mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-amber-500 rounded-full block" />
            Max Price
          </span>
          <span className="font-mono text-amber-600 font-bold text-xs">{formatPKR(maxPrice)}</span>
        </h3>
        <input
          type="range" min="0" max={maxPriceLimit} step={Math.max(500, Math.round(maxPriceLimit / 100))} value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          className="w-full accent-amber-500 h-1.5 bg-stone-200 rounded-full cursor-pointer luxury-range"
        />
        <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1.5">
          <span>Rs. 0</span><span>{formatPKR(maxPriceLimit)}</span>
        </div>
      </div>

      {/* COLORS */}
      {availableColors.length > 0 && (
        <div className="mb-7">
          <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.14em] mb-3 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-amber-500 rounded-full block" />
            Filter by Color
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(clr => {
              const selected = selectedColors.includes(clr);
              return (
                <button
                  key={clr}
                  onClick={() => toggleColor(clr)}
                  title={clr}
                  style={{ backgroundColor: COLOR_HEX[clr] ?? "#888" }}
                  className={`w-7 h-7 rounded-full cursor-pointer relative transition-all duration-200 hover:scale-110 active:scale-95 ${
                    selected ? "ring-2 ring-stone-950 ring-offset-2 scale-110 shadow-md" : "border border-stone-300/50"
                  }`}
                >
                  {selected && (
                    <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow stroke-[3px]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MATERIALS */}
      {availableMaterials.length > 0 && (
        <div className="mb-7">
          <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.14em] mb-3 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-amber-500 rounded-full block" />
            Material
          </h3>
          <div className="flex flex-col gap-2">
            {availableMaterials.map(mat => (
              <label key={mat} className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer">
                <div
                  onClick={() => toggleMaterial(mat)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                    selectedMaterials.includes(mat)
                      ? "bg-amber-500 border-amber-500"
                      : "border-stone-300 hover:border-amber-400"
                  }`}
                >
                  {selectedMaterials.includes(mat) && (
                    <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                  )}
                </div>
                <span className="font-medium">{mat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* RATING */}
      <div className="mb-7">
        <h3 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.14em] mb-3 flex items-center gap-1.5">
          <span className="w-1 h-3.5 bg-amber-500 rounded-full block" />
          Min Rating
        </h3>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2].map(r => (
            <button
              key={r}
              onClick={() => toggleRating(r)}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${
                selectedRatings.includes(r)
                  ? "bg-amber-50 border border-amber-200 text-amber-700"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < r ? "text-amber-400 fill-amber-400" : "text-stone-200 fill-stone-200"}`} />
                ))}
              </div>
              <span className="font-semibold">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* TOGGLES */}
      <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
        {[
          { label: "Sale & Discounts Only", state: showDiscountsOnly, set: setShowDiscountsOnly },
          { label: "In Stock Only",         state: showInStockOnly,   set: setShowInStockOnly   },
        ].map(({ label, state, set }) => (
          <button
            key={label}
            onClick={() => set(!state)}
            className="flex items-center gap-3 text-xs text-stone-700 font-semibold cursor-pointer text-left"
          >
            <div className={`w-9 h-5 rounded-full transition-colors duration-250 flex-shrink-0 relative ${state ? "bg-amber-500" : "bg-stone-200"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-250 ${state ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </>
  );
});

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProducts,        setAllProducts]        = useState([]);
  const [categories,         setCategories]         = useState([]);
  const [availableColors,    setAvailableColors]    = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);

  const [selectedCategory,  setSelectedCategory]  = useState("All");
  const [searchQuery,       setSearchQuery]        = useState("");
  const [maxPriceLimit,     setMaxPriceLimit]      = useState(100000);
  const [maxPrice,          setMaxPrice]           = useState(100000);
  const [selectedColors,    setSelectedColors]     = useState([]);
  const [selectedMaterials, setSelectedMaterials]  = useState([]);
  const [selectedRatings,   setSelectedRatings]    = useState([]);
  const [showDiscountsOnly, setShowDiscountsOnly]  = useState(false);
  const [showInStockOnly,   setShowInStockOnly]    = useState(false);
  const [sortBy,            setSortBy]             = useState("Latest");

  const [loading,          setLoading]          = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedProduct,  setSelectedProduct]  = useState(null);

  /* ── Initial data load ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [products, cats] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
        ]);
        setAllProducts(products);
        setCategories(cats);
        setAvailableColors(Array.from(new Set(products.map(p => p.color).filter(Boolean))));
        setAvailableMaterials(Array.from(new Set(products.map(p => p.material).filter(Boolean))));
        // Detect max price from actual product data — ensures no product is filtered out
        if (products.length > 0) {
          const detectedMax = Math.max(...products.map(p => p.price));
          const roundedMax = Math.ceil(detectedMax / 5000) * 5000;
          setMaxPriceLimit(roundedMax);
          setMaxPrice(roundedMax);
        }
      } catch {
        // productService already falls back to local JSON on error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── URL param sync ── */
  useEffect(() => {
    const search = searchParams.get("search");
    const cat    = searchParams.get("category");
    const brand  = searchParams.get("brand");
    const sort   = searchParams.get("sort");
    if (search) setSearchQuery(search);
    if (cat)    setSelectedCategory(cat);
    if (brand)  setSearchQuery(brand);
    if (sort)   setSortBy(sort);
  }, [searchParams]);

  /* ── Debounce search so filtering doesn't fire on every keystroke ── */
  const debouncedSearch = useDebounce(searchQuery, 350);

  /* ── Client-side filtering — replaces per-filter API calls ── */
  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];
    return filterProducts(allProducts, {
      search: debouncedSearch,
      category: selectedCategory,
      colors: selectedColors,
      materials: selectedMaterials,
      maxPrice,
      ratings: selectedRatings,
      discountsOnly: showDiscountsOnly,
      inStockOnly: showInStockOnly,
      sort: sortBy,
    });
  }, [allProducts, debouncedSearch, selectedCategory, selectedColors, selectedMaterials, maxPrice, selectedRatings, showDiscountsOnly, showInStockOnly, sortBy]);

  const isFiltering = debouncedSearch !== searchQuery;

  /* ── Stable callbacks (required for FilterSidebar memo to be effective) ── */
  const toggleColor = useCallback(
    (c) => setSelectedColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]),
    []
  );
  const toggleMaterial = useCallback(
    (m) => setSelectedMaterials(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]),
    []
  );
  const toggleRating = useCallback(
    (r) => setSelectedRatings(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]),
    []
  );

  const handleCategorySelect = useCallback((name) => {
    setSelectedCategory(name);
    setSearchParams(prev => {
      const np = new URLSearchParams(prev);
      if (name === "All") np.delete("category"); else np.set("category", name);
      return np;
    });
  }, [setSearchParams]);

  const handleReset = useCallback(() => {
    setSelectedCategory("All"); setSearchQuery(""); setMaxPrice(maxPriceLimit);
    setSelectedColors([]); setSelectedMaterials([]); setSelectedRatings([]);
    setShowDiscountsOnly(false); setShowInStockOnly(false); setSortBy("Latest");
    setSearchParams({});
  }, [setSearchParams, maxPriceLimit]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setSearchParams(prev => {
      const np = new URLSearchParams(prev);
      if (e.target.value) np.set("search", e.target.value); else np.delete("search");
      return np;
    }, { replace: true });
  }, [setSearchParams]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setSearchParams(prev => {
      const np = new URLSearchParams(prev);
      np.delete("search");
      return np;
    });
  }, [setSearchParams]);

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedColors.length > 0,
    selectedMaterials.length > 0,
    showDiscountsOnly,
    showInStockOnly,
    selectedRatings.length > 0,
    maxPrice < maxPriceLimit,
  ].filter(Boolean).length;

  const filterProps = {
    categories,
    totalCount: allProducts.length,
    selectedCategory,
    onCategorySelect: handleCategorySelect,
    maxPrice,
    setMaxPrice,
    maxPriceLimit,
    availableColors,
    selectedColors,
    toggleColor,
    availableMaterials,
    selectedMaterials,
    toggleMaterial,
    selectedRatings,
    toggleRating,
    showDiscountsOnly,
    setShowDiscountsOnly,
    showInStockOnly,
    setShowInStockOnly,
  };

  return (
    <div id="shop-page" className="min-h-screen bg-stone-50 pb-20 text-stone-900">
      <Breadcrumb items={[{ label: "Shop Catalog" }]} />

      {/* ── SHOP HEADER ── */}
      <section className="bg-white py-8 px-4 border-b border-stone-100 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="font-sans font-black text-2xl sm:text-3xl text-stone-950 tracking-tight flex items-center gap-2">
              The Luxury Atelier
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">
              Meticulously crafted handbags, travel duffles, and commuter accessories.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search boutique items..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-stone-50 text-stone-900 text-xs py-3.5 pl-10 pr-9 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
        {/* ── DESKTOP FILTER SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white p-6 rounded-2xl border border-stone-150 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <span className="text-xs font-black tracking-[0.12em] uppercase text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {activeFilterCount > 0 && (
                <span className="bg-amber-500 text-stone-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <button
              onClick={handleReset}
              className="text-[10px] text-stone-400 hover:text-amber-600 uppercase font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <FilterSidebar {...filterProps} />
        </aside>

        {/* ── MAIN RESULTS ── */}
        <section className="flex-1 min-w-0">
          {/* Sort / count bar */}
          <div className="bg-white rounded-xl py-3 px-4 mb-5 border border-stone-100 shadow-xs flex items-center justify-between gap-4">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold hover:bg-stone-50 text-stone-700 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <span className="text-xs text-stone-500 font-mono hidden sm:block">
              {isFiltering ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  Filtering…
                </span>
              ) : (
                <>
                  <span className="font-bold text-stone-900">{filteredProducts.length}</span>
                  {" of "}
                  {allProducts.length} pieces
                </>
              )}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <span className="hidden sm:inline text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-amber-500 text-stone-800 font-semibold cursor-pointer transition-all"
              >
                <option value="Latest">New Arrivals</option>
                <option value="Price Low to High">Price: Low → High</option>
                <option value="Price High to Low">Price: High → Low</option>
                <option value="Best Selling">Best Selling</option>
                <option value="Top Picks">Atelier Top Picks</option>
                <option value="Highest Rated">Customer Rated</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {(selectedCategory !== "All" || selectedColors.length > 0 || selectedMaterials.length > 0 || showDiscountsOnly || showInStockOnly || selectedRatings.length > 0) && (
            <div className="flex flex-wrap gap-2 items-center mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">Active:</span>
              {selectedCategory !== "All" && (
                <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-stone-200">
                  {selectedCategory}
                  <button onClick={() => handleCategorySelect("All")} className="hover:text-rose-500 ml-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {selectedColors.map(c => (
                <span key={c} className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-stone-200">
                  {c}<button onClick={() => toggleColor(c)} className="hover:text-rose-500 ml-0.5"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
              {selectedMaterials.map(m => (
                <span key={m} className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-stone-200">
                  {m}<button onClick={() => toggleMaterial(m)} className="hover:text-rose-500 ml-0.5"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
              {showDiscountsOnly && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  On Sale<button onClick={() => setShowDiscountsOnly(false)} className="hover:text-rose-500 ml-0.5"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {showInStockOnly && (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  In Stock<button onClick={() => setShowInStockOnly(false)} className="hover:text-rose-500 ml-0.5"><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <GridSkeleton count={12} />
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center max-w-md mx-auto my-12 flex flex-col items-center gap-5">
              <div className="p-4 bg-stone-100 rounded-full text-stone-400">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="font-sans font-bold text-lg text-stone-900">No Matching Pieces Found</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                We couldn't find handcrafted items matching your selection. Reset filters to continue exploring.
              </p>
              <button
                onClick={handleReset}
                className="bg-stone-950 hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-[0.1em] transition-colors shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 max-w-xs w-full bg-white z-50 flex flex-col border-l border-stone-100 shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filter Console
                </span>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <FilterSidebar {...filterProps} />
              </div>

              <div className="p-5 border-t border-stone-100 flex flex-col gap-2.5">
                <button
                  onClick={handleReset}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 rounded-xl text-xs uppercase tracking-[0.1em] transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-stone-950 hover:bg-stone-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-[0.1em] transition-colors"
                >
                  View {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <QuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
