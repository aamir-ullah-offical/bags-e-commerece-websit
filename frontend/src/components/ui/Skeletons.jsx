/* ══════════════════════════════════════════════════════
   MAISON SAC — SHAPE-MATCHED SKELETON LIBRARY
   Every skeleton exactly mirrors its real component's
   layout so there is zero layout shift on load.
   ══════════════════════════════════════════════════════ */

/* ─── Hero Banner Skeleton ─── */
export function SkeletonHero() {
  return (
    <div className="relative h-[82vh] sm:h-[88vh] bg-stone-900 overflow-hidden">
      {/* Background pulse */}
      <div className="absolute inset-0 skeleton skeleton-img" style={{ borderRadius: 0 }} />
      {/* Dark overlay (matches real hero) */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-stone-950/20 z-10" />

      {/* Left-side text skeletons */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full flex flex-col gap-5">
          {/* Badge pill */}
          <div className="skeleton h-6 w-36 rounded-full" style={{ background: "rgba(255,255,255,0.12)", backgroundSize: "200% 100%", animationName: "shimmer" }} />
          {/* H1 — two lines */}
          <div className="flex flex-col gap-3">
            <div className="skeleton h-12 sm:h-14 lg:h-16 w-[68%] rounded-xl" style={{ background: "rgba(255,255,255,0.10)" }} />
            <div className="skeleton h-12 sm:h-14 lg:h-16 w-[45%] rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>
          {/* Subtitle */}
          <div className="flex flex-col gap-2">
            <div className="skeleton h-4 w-[48%] rounded-lg" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="skeleton h-4 w-[36%] rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>
          {/* CTA buttons */}
          <div className="flex gap-3 mt-2">
            <div className="skeleton h-12 w-44 rounded-xl" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="skeleton h-12 w-36 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>
        </div>
      </div>

      {/* Slide dots at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`rounded-full ${i === 1 ? "w-6 bg-amber-500/60" : "w-2 bg-white/25"} h-2`} />
        ))}
      </div>
    </div>
  );
}

/* ─── Category Card Skeleton ─── */
export function SkeletonCategoryCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-stone-200 h-64 sm:h-72">
      <div className="skeleton skeleton-img absolute inset-0" style={{ borderRadius: 0 }} />
      {/* Bottom overlay matches the real gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-stone-900/40 to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-2">
        <div className="skeleton h-5 w-[60%] rounded-lg" style={{ background: "rgba(255,255,255,0.18)" }} />
        <div className="skeleton h-3 w-[35%] rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
      </div>
    </div>
  );
}

/* ─── Product Card Skeleton ─── */
export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 flex flex-col">
      <div className="skeleton skeleton-img aspect-square w-full" style={{ borderRadius: 0 }} />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="skeleton skeleton-text w-[40%]" />
        <div className="skeleton skeleton-title w-[85%]" />
        <div className="skeleton skeleton-text w-[65%]" />
        <div className="flex gap-1 mt-1">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton w-3.5 h-3.5 rounded-sm" />)}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="skeleton h-6 w-24 rounded-lg" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Product Detail Page Skeleton ─── */
export function SkeletonProductDetail() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Breadcrumb */}
      <div className="flex gap-2 mb-8 items-center">
        <div className="skeleton skeleton-text w-12" />
        <div className="skeleton w-3 h-3 rounded-full" />
        <div className="skeleton skeleton-text w-16" />
        <div className="skeleton w-3 h-3 rounded-full" />
        <div className="skeleton skeleton-text w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left — image stack */}
        <div className="flex flex-col gap-4">
          <div className="skeleton skeleton-img aspect-square w-full rounded-2xl" style={{ borderRadius: "1rem" }} />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right — info column */}
        <div className="flex flex-col gap-5">
          {/* Brand + badges */}
          <div className="flex gap-2">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
          {/* Title */}
          <div className="flex flex-col gap-2">
            <div className="skeleton skeleton-title w-[90%]" style={{ height: "1.75rem" }} />
            <div className="skeleton skeleton-title w-[65%]" style={{ height: "1.75rem" }} />
          </div>
          {/* Stars + review count */}
          <div className="flex gap-3 items-center">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton w-4 h-4 rounded-sm" />)}
            </div>
            <div className="skeleton skeleton-text w-24" />
          </div>
          {/* Price block */}
          <div className="flex items-baseline gap-3">
            <div className="skeleton h-9 w-28 rounded-xl" />
            <div className="skeleton h-5 w-20 rounded-lg" />
          </div>
          {/* Color swatches */}
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton w-8 h-8 rounded-full" />)}
          </div>
          {/* Qty + CTA */}
          <div className="flex gap-3">
            <div className="skeleton h-12 w-28 rounded-xl" />
            <div className="skeleton h-12 flex-1 rounded-xl" />
          </div>
          {/* Trust checklist */}
          <div className="flex flex-col gap-2 mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="skeleton w-4 h-4 rounded-full" />
                <div className="skeleton skeleton-text w-[55%]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Item Skeleton ─── */
export function SkeletonCartItem() {
  return (
    <div className="flex gap-4 py-5 border-b border-stone-100 animate-fade-in">
      <div className="skeleton w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1 py-1">
        <div className="skeleton skeleton-text w-[35%]" />
        <div className="skeleton skeleton-title w-[65%]" />
        <div className="skeleton skeleton-text w-[25%]" />
      </div>
      <div className="flex flex-col items-end justify-between py-1 gap-3">
        <div className="skeleton h-7 w-20 rounded-xl" />
        <div className="skeleton h-6 w-16 rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Order Card Skeleton ─── */
export function SkeletonOrderCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-28 rounded-lg" />
          <div className="skeleton skeleton-text w-32" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      {/* Item thumbnails */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton w-14 h-14 rounded-xl" />
        ))}
        <div className="skeleton w-14 h-14 rounded-xl" style={{ opacity: 0.5 }} />
      </div>
      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-50">
        <div className="skeleton skeleton-text w-24" />
        <div className="skeleton h-8 w-28 rounded-xl" />
      </div>
    </div>
  );
}

/* ─── Dashboard Stat Card Skeleton ─── */
export function SkeletonDashboardStat() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton skeleton-text w-[55%]" />
          <div className="skeleton h-8 w-[45%] rounded-xl" style={{ height: "2rem" }} />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
      {/* Trend bar */}
      <div className="flex items-center gap-2">
        <div className="skeleton w-14 h-4 rounded-full" />
        <div className="skeleton skeleton-text w-[40%]" />
      </div>
    </div>
  );
}

/* ─── Testimonial Card Skeleton ─── */
export function SkeletonTestimonial() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6 flex flex-col gap-4 shadow-sm">
      {/* Avatar + meta */}
      <div className="flex items-center gap-3">
        <div className="skeleton skeleton-circle w-12 h-12" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="skeleton skeleton-text w-[45%]" />
          <div className="skeleton skeleton-text w-[35%]" style={{ opacity: 0.7 }} />
        </div>
        {/* Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton w-3.5 h-3.5 rounded-sm" />)}
        </div>
      </div>
      {/* Quote text */}
      <div className="flex flex-col gap-2">
        <div className="skeleton skeleton-text w-full" />
        <div className="skeleton skeleton-text w-[92%]" />
        <div className="skeleton skeleton-text w-[75%]" />
      </div>
    </div>
  );
}

/* ─── Table Row Skeleton ─── */
export function SkeletonTableRow({ cols = 5 }) {
  const widths = ["w-8", "w-24", "w-32", "w-20", "w-16", "w-12"];
  return (
    <tr className="border-b border-stone-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`skeleton skeleton-text ${widths[i % widths.length]}`} />
        </td>
      ))}
    </tr>
  );
}

/* ─── Banner / Collection Card Skeleton ─── */
export function SkeletonBannerSlide() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-48 sm:h-56 bg-stone-200">
      <div className="skeleton skeleton-img absolute inset-0" style={{ borderRadius: 0 }} />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/50 to-transparent" />
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <div className="skeleton h-4 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="skeleton h-7 w-40 rounded-xl" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="skeleton h-9 w-28 rounded-xl mt-2" style={{ background: "rgba(255,255,255,0.2)" }} />
      </div>
    </div>
  );
}

/* ─── Stats Strip Skeleton ─── */
export function SkeletonStatsStrip() {
  return (
    <div className="bg-stone-900 py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="skeleton w-8 h-8 rounded-lg" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="skeleton h-6 w-20 rounded-lg" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="skeleton h-3.5 w-24 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
