import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Award,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
} from "lucide-react";

import { productService } from "../utils/productService";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter";
import QuickViewModal from "../components/QuickViewModal";

export default function Home() {
  const banners = productService.getBanners();
  const categories = productService.getCategories();
  const topPicks = productService.getTopPicks();
  const featured = productService.getFeaturedProducts();
  const topSelling = productService.getTopSelling();
  const newArrivals = productService.getNewArrivals();
  const testimonials = productService.getTestimonials();

  // Banners Slider State
  const [slideIdx, setSlideIdx] = useState(0);
  // Quick View selected Product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Testimonial State
  const [testIdx, setTestIdx] = useState(0);

  // Auto transition for banner hero
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 6050);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div id="home-page" className="bg-stone-50 overflow-hidden">
      {/* 1. HERO SLIDER */}
      <section className="relative h-[80vh] sm:h-[85vh] bg-stone-900 border-b border-stone-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center"
          >
            {/* Dark translucent cover */}
            <div className="absolute inset-0 bg-stone-950/40 z-10" />

            {/* Slide Background Image */}
            <img
              src={banners[slideIdx].image}
              alt=""
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center scale-102 filter brightness-[0.7]"
            />

            {/* Slider Content Wrapper */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 flex flex-col items-start gap-4 text-white">
              {/* Promotional Badge */}
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-extrabold font-mono tracking-widest uppercase shadow-lg"
              >
                <Sparkles className="w-3 h-3 fill-stone-950" />
                {banners[slideIdx].badge || "SEASONAL RELEASE"}
              </motion.span>

              {/* Slider Title */}
              <motion.h1
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none"
              >
                {banners[slideIdx].title}
              </motion.h1>

              {/* Slider Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-xl text-stone-200 text-xs sm:text-sm md:text-base leading-relaxed"
              >
                {banners[slideIdx].subtitle}
              </motion.p>

              {/* Discount / CTA row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4"
              >
                <Link
                  to={banners[slideIdx].ctaLink}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-amber-500 text-stone-950 hover:text-stone-950 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl"
                >
                  {banners[slideIdx].ctaText}
                  <ArrowRight className="w-4 h-4 text-inherit" />
                </Link>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-stone-400 font-mono tracking-wider uppercase">
                    Launch Special
                  </span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {banners[slideIdx].discountText}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows (desktop) */}
        <button
          onClick={() => setSlideIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white text-white hover:text-stone-950 border border-white/20 hover:border-transparent transition-all shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={() => setSlideIdx((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white text-white hover:text-stone-950 border border-white/20 hover:border-transparent transition-all shadow-xl"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Floating indicators panel */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 flex gap-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlideIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                slideIdx === idx ? "w-8 bg-amber-400" : "w-2.5 bg-white/45"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. CATEGORIES SECTIONS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="home-categories">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            Design Classifications
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-stone-950 tracking-tight mt-3">
            Shop By Bag Architecture
          </h2>
          <div className="w-12 h-1 bg-amber-400 mt-4 rounded-full" />
        </div>

        {/* Categories Grid (Glassmorphism layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border border-stone-100 flex flex-col justify-end"
            >
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-center filter grayscale group-hover:grayscale-0 group-hover:scale-103 transition-all duration-500"
              />
              {/* Bottom glassmorphic overlay strip */}
              <div className="relative p-3.5 sm:p-5 bg-white/90 backdrop-blur-md border-t border-stone-100 m-3 rounded-xl flex items-center justify-between shadow-sm group-hover:border-amber-105 transition-colors">
                <div>
                  <h3 className="font-sans font-bold text-xs sm:text-sm text-stone-900 leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-medium font-mono">
                    {cat.count} Products
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-stone-900 group-hover:bg-amber-500 text-white group-hover:text-stone-900 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TOP PICKS SECTION */}
      <section className="bg-stone-900 text-white py-20 border-y border-stone-800" id="home-toppicks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-mono">
                Curator Choice
              </span>
              <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-2">
                The Heritage Top Picks
              </h2>
            </div>
            <Link
              to="/shop?sort=Top Picks"
              className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-amber-400 hover:text-white transition-colors"
            >
              Browse All Top Picks
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topPicks.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS GRID */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in" id="home-featured">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            Selected Craft
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-stone-950 tracking-tight mt-3">
            Featured Capsule Products
          </h2>
          <div className="w-12 h-1 bg-amber-400 mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 8).map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER SECTION */}
      <section className="relative overflow-hidden bg-stone-950 py-24 my-6 text-white max-w-7xl mx-auto rounded-3xl border border-stone-850 shadow-2xl" id="promo-banner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.1),transparent_50%)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center px-4 flex flex-col items-center">
          <span className="text-[10px] font-bold px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/25 mb-4 tracking-widest uppercase font-mono">
            LIMITED MID-SEASON PROMO
          </span>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none text-white mb-4">
            Exclusive Flat 15% Welcome Discount
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md leading-relaxed mb-8 font-serif">
            Enter the code <span className="font-mono text-amber-400 font-bold bg-stone-900 border border-stone-800 px-2 py-1 rounded mx-1 uppercase">MAISONSAC15</span> during checkout to claim your luxury sign-up reduction of choice.
          </p>
          <div className="flex gap-4">
            <Link
              to="/shop"
              className="bg-amber-505 bg-amber-500 hover:bg-amber-605 text-stone-950 font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="border border-stone-800 text-stone-200 hover:text-white hover:bg-stone-900 font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* 6. TOP SELLING PRODUCTS */}
      <section className="py-20 bg-stone-100 border-y border-stone-200" id="home-topselling">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-10 pb-4 border-b border-stone-200">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-655 text-amber-600 uppercase font-mono">
                Market Favorites
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight mt-1.5">
                Top Selling Collections
              </h2>
            </div>
            <Link
              to="/shop?sort=Best Selling"
              className="text-xs font-bold tracking-widest uppercase text-stone-600 hover:text-stone-950 transition-colors"
            >
              Browse Best Sellers
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {topSelling.slice(0, 4).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS PRODUCTS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="home-newarrivals">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            FRESH RELEASES
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-stone-950 tracking-tight mt-3">
            New Arrival Showcase
          </h2>
          <div className="w-12 h-1 bg-amber-400 mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {newArrivals.slice(0, 4).map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 8. WHY CHOOSE US (VALUES SECTIONS) */}
      <section className="py-20 bg-white border-t border-stone-100" id="home-values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-[10px] font-bold tracking-widest text-amber-635 text-amber-600 uppercase font-mono bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              The Atelier Philosophy
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-stone-900 tracking-tight mt-3">
              Why Discerning Buyers Choose Us
            </h2>
            <div className="w-12 h-1 bg-amber-400 mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="p-3 rounded-xl bg-stone-900 text-amber-500 shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-base text-stone-900">
                Premium Grade Sourcing
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Vegetable-tanned full-grain cowhide leather, custom alloy hardware, and organic canvas threads, sourced exclusively from certified ethical suppliers.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="p-3 rounded-xl bg-stone-900 text-amber-500 shadow-md">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-base text-stone-900">
                Tracked Express Delivery
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                All order sets are processed in high-security boxes and dispatched via registered express courier, offering continuous SMS and GPS tracking.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="p-3 rounded-xl bg-stone-900 text-amber-500 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-base text-stone-900">
                Fully Encrypted Payments
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Our electronic gateways adhere fully to international safety standards, incorporating certified multi-channel security controls.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="p-3 rounded-xl bg-stone-900 text-amber-500 shadow-md">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-base text-stone-900">
                Easy Refund Policy
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                If the stitching density, feel, or sizing doesn't meet your absolute criteria, return the item within 30 days for a full, hassle-free refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS (TESTIMONIALS SLIDER) */}
      <section className="py-20 bg-stone-950 text-white leading-relaxed relative overflow-hidden" id="home-testimonials">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(217,119,6,0.06),transparent_40%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-mono block mb-3">
            Verbatim Reviews
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl tracking-tight text-white mb-12">
            Discerning Customers Share
          </h2>

          <div className="relative min-h-[14rem] flex flex-col justify-center items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={testIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-6"
              >
                {/* Review Stars */}
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonials[testIdx].rating ? "text-amber-400 fill-amber-400" : "text-stone-700"}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </motion.svg>
                  ))}
                </div>

                {/* Comment quote structure */}
                <p className="text-sm sm:text-base md:text-lg text-stone-200 font-serif font-light max-w-2xl leading-relaxed italic">
                  "{testimonials[testIdx].comment}"
                </p>

                {/* Profile row */}
                <div className="flex items-center gap-4 mt-2">
                  <img
                    src={testimonials[testIdx].photo}
                    alt={testimonials[testIdx].name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-stone-800"
                  />
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white">{testimonials[testIdx].name}</h4>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold block">
                      {testimonials[testIdx].role}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators row */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  testIdx === idx ? "w-8 bg-amber-400" : "bg-stone-700"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER INCORPORATION */}
      <Newsletter />

      {/* QUICK VIEW PORTAL OVERLAY */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
