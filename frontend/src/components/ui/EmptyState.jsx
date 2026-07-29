import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ══════════════════════════════════════════════════════
   INLINE SVG ILLUSTRATIONS — stone / amber palette
   Each precisely matches its context so the empty state
   feels like a natural part of the page, not an error.
   ══════════════════════════════════════════════════════ */

function IllustrationCart() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="12" y="36" width="72" height="52" rx="8" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M36 36 Q36 16 48 14 Q60 16 60 36" stroke="#d6d3d1" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="48" y1="36" x2="48" y2="88" stroke="#e7e5e4" strokeWidth="1.5" strokeDasharray="4 3"/>
      <rect x="39" y="58" width="18" height="11" rx="3.5" stroke="#f59e0b" strokeWidth="1.5" fill="#fef3c7"/>
      <circle cx="26" cy="16" r="4" fill="#fbbf24" opacity="0.45"/>
      <circle cx="76" cy="20" r="2.5" fill="#fbbf24" opacity="0.35"/>
      <path d="M82 56 L84 51 L86 56 L84 61 Z" fill="#fbbf24" opacity="0.3"/>
      <circle cx="14" cy="72" r="2" fill="#e7e5e4" opacity="0.6"/>
    </svg>
  );
}

function IllustrationWishlist() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M48 78 C48 78 14 59 14 38 C14 27 22 20 32 20 C38.5 20 44.5 23.5 48 29 C51.5 23.5 57.5 20 64 20 C74 20 82 27 82 38 C82 59 48 78 48 78Z" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.8" opacity="0.85"/>
      {/* Small heart top-right */}
      <path d="M78 15 C78 15 70 10 70 5 C70 3 72 2 74 2 C75.5 2 77 2.8 78 4.5 C79 2.8 80.5 2 82 2 C84 2 86 3 86 5 C86 10 78 15 78 15Z" fill="#fbbf24" opacity="0.5"/>
      {/* Tiny heart top-left */}
      <path d="M16 26 C16 26 11 23 11 20 C11 18.5 12.5 17.5 14 17.5 C15 17.5 15.8 18 16 19 C16.2 18 17 17.5 18 17.5 C19.5 17.5 21 18.5 21 20 C21 23 16 26 16 26Z" fill="#fcd34d" opacity="0.4"/>
      <path d="M30 22 L31.2 18.5 L32.4 22 L31.2 25.5 Z" fill="#fbbf24" opacity="0.6"/>
      <path d="M87 56 L88.5 52 L90 56 L88.5 60 Z" fill="#fcd34d" opacity="0.5"/>
    </svg>
  );
}

function IllustrationOrders() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Package body */}
      <rect x="14" y="34" width="68" height="54" rx="7" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="2"/>
      {/* Package top flaps */}
      <path d="M14 44 L48 54 L82 44" stroke="#e7e5e4" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <line x1="48" y1="54" x2="48" y2="88" stroke="#e7e5e4" strokeWidth="1.5" strokeDasharray="3 3"/>
      {/* Tape strip on lid */}
      <rect x="36" y="34" width="24" height="8" rx="2" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.2" opacity="0.8"/>
      {/* Content lines inside box */}
      <line x1="24" y1="66" x2="72" y2="66" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="74" x2="62" y2="74" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="82" x2="50" y2="82" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Star sparkle top right */}
      <path d="M80 20 L81.5 16 L83 20 L81.5 24 Z" fill="#fbbf24" opacity="0.55"/>
      <circle cx="15" cy="26" r="3" fill="#fbbf24" opacity="0.35"/>
    </svg>
  );
}

function IllustrationSearch() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="40" cy="40" r="26" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="2"/>
      {/* Crosshair / X inside */}
      <line x1="32" y1="32" x2="48" y2="48" stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round"/>
      <line x1="48" y1="32" x2="32" y2="48" stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round"/>
      {/* Handle */}
      <line x1="60" y1="60" x2="80" y2="80" stroke="#d6d3d1" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Sparkle at top */}
      <path d="M72 16 L73.5 12 L75 16 L73.5 20 Z" fill="#fbbf24" opacity="0.55"/>
      <circle cx="20" cy="22" r="3" fill="#fbbf24" opacity="0.4"/>
      <circle cx="80" cy="30" r="2" fill="#fde68a" opacity="0.4"/>
    </svg>
  );
}

function IllustrationProducts() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6"  y="6"  width="38" height="38" rx="7" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="1.5"/>
      <rect x="52" y="6"  width="38" height="38" rx="7" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="1.5"/>
      <rect x="6"  y="52" width="38" height="38" rx="7" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="1.5"/>
      {/* Fourth card highlighted (the "empty" slot) */}
      <rect x="52" y="52" width="38" height="38" rx="7" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 2.5"/>
      {/* Plus icon in the dashed card */}
      <line x1="71" y1="63" x2="71" y2="79" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
      <line x1="63" y1="71" x2="79" y2="71" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
      {/* Tiny image placeholder lines in filled cards */}
      <line x1="16" y1="20" x2="34" y2="20" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="27" x2="28" y2="27" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="62" y1="20" x2="80" y2="20" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="62" y1="27" x2="72" y2="27" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="66" x2="34" y2="66" stroke="#d6d3d1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="73" x2="26" y2="73" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationReviews() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="14" width="80" height="58" rx="12" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="2"/>
      {/* Chat bubble tail */}
      <path d="M28 72 L36 72 L32 82 Z" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Stars row */}
      <path d="M24 38 L26 33 L28 38 L33 38 L29.5 41 L30.5 46 L26 43 L21.5 46 L22.5 41 L19 38 Z" fill="#fbbf24" opacity="0.75"/>
      <path d="M40 38 L42 33 L44 38 L49 38 L45.5 41 L46.5 46 L42 43 L37.5 46 L38.5 41 L35 38 Z" fill="#fbbf24" opacity="0.75"/>
      <path d="M56 38 L58 33 L60 38 L65 38 L61.5 41 L62.5 46 L58 43 L53.5 46 L54.5 41 L51 38 Z" fill="#fbbf24" opacity="0.35"/>
      {/* Text lines */}
      <line x1="18" y1="56" x2="78" y2="56" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="64" x2="62" y2="64" stroke="#e7e5e4" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IllustrationError() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="48" cy="48" r="34" fill="#fef2f2" stroke="#fca5a5" strokeWidth="2"/>
      <line x1="36" y1="36" x2="60" y2="60" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="60" y1="36" x2="36" y2="60" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="80" cy="18" r="3" fill="#fbbf24" opacity="0.45"/>
      <path d="M14 26 L15.5 22 L17 26 L15.5 30 Z" fill="#fbbf24" opacity="0.4"/>
    </svg>
  );
}

function IllustrationDefault() {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="48" cy="48" r="34" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="2"/>
      <path d="M38 42 C38 42 43 32 48 32 C53 32 55 37 55 41 C55 46 48 50 48 55" stroke="#d6d3d1" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="48" cy="63" r="2.5" fill="#d6d3d1"/>
      <path d="M26 22 L27.5 18 L29 22 L27.5 26 Z" fill="#fbbf24" opacity="0.55"/>
      <circle cx="72" cy="28" r="3" fill="#fbbf24" opacity="0.4"/>
      <circle cx="80" cy="58" r="2" fill="#fde68a" opacity="0.35"/>
    </svg>
  );
}

const VARIANTS = {
  cart:     { Illustration: IllustrationCart,     color: "amber" },
  wishlist: { Illustration: IllustrationWishlist, color: "amber" },
  orders:   { Illustration: IllustrationOrders,   color: "stone" },
  search:   { Illustration: IllustrationSearch,   color: "stone" },
  products: { Illustration: IllustrationProducts, color: "amber" },
  reviews:  { Illustration: IllustrationReviews,  color: "amber" },
  error:    { Illustration: IllustrationError,    color: "red"   },
  default:  { Illustration: IllustrationDefault,  color: "stone" },
};

const ACCENT_CLASSES = {
  amber: "bg-amber-50 border-amber-100",
  stone: "bg-stone-50 border-stone-100",
  red:   "bg-red-50 border-red-100",
};

/**
 * EmptyState — reusable empty / error state component.
 *
 * @param {string}  variant   — "cart" | "wishlist" | "orders" | "search" | "products" | "reviews" | "error" | "default"
 * @param {string}  title     — Primary headline
 * @param {string}  description — Supporting copy
 * @param {{ label: string, to?: string, onClick?: fn }} action — Optional CTA button
 * @param {string}  className — Extra wrapper classes
 */
export default function EmptyState({
  variant = "default",
  title,
  description,
  action,
  className = "",
}) {
  const { Illustration, color } = VARIANTS[variant] ?? VARIANTS.default;
  const accentClass = ACCENT_CLASSES[color] ?? ACCENT_CLASSES.stone;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in ${className}`}
    >
      {/* Floating illustration */}
      <div className={`empty-state-icon p-6 rounded-3xl border ${accentClass} mb-6`}
        style={{ width: 112, height: 112 }}
      >
        <Illustration />
      </div>

      {/* Headline */}
      {title && (
        <h3 className="font-sans font-black text-xl text-stone-900 mb-2 tracking-tight">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-stone-500 max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* CTA */}
      {action && (
        action.to ? (
          <Link
            to={action.to}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 font-bold px-7 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-amber-glow"
          >
            {action.label}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 font-bold px-7 py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-200 shadow-md"
          >
            {action.label}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )
      )}
    </div>
  );
}
