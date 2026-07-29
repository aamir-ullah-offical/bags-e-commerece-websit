import { useSettings } from "../../context/SettingsContext";

function brandParts(name = "MAISON SAC") {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return { first: name, last: "" };
  return { first: words.slice(0, -1).join(" "), last: words[words.length - 1] };
}

export default function PageLoader() {
  const { settings } = useSettings();
  const storeName = settings?.storeName || "MAISON SAC";
  const { first, last } = brandParts(storeName.toUpperCase());

  return (
    <div className="page-loader-overlay">

      {/* Brand mark */}
      <div className="page-loader-brand flex flex-col items-center gap-8">

        {/* Logo ring + monogram */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full"
            style={{
              width: 88, height: 88,
              background: "conic-gradient(from 0deg, transparent 0%, #d97706 30%, #fbbf24 50%, transparent 70%)",
              borderRadius: "50%",
              animation: "loader-ring-spin 1.4s linear infinite",
              padding: 3,
            }}
          >
            <div className="w-full h-full rounded-full bg-stone-50" />
          </div>
          <div className="relative z-10 w-[82px] h-[82px] rounded-full bg-stone-50 flex items-center justify-center">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
              <rect x="6" y="14" width="26" height="20" rx="4" fill="none" stroke="#d97706" strokeWidth="1.8"/>
              <path d="M13 14 Q13 7 19 6 Q25 7 25 14" stroke="#d97706" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <rect x="15.5" y="21" width="7" height="5" rx="1.5" stroke="#f59e0b" strokeWidth="1.4" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1 select-none">
          <div className="flex items-baseline gap-2">
            <span
              className="font-sans font-black tracking-[0.18em] text-stone-950"
              style={{ fontSize: "1.05rem", letterSpacing: "0.2em" }}
            >
              {first}
            </span>
            {last && (
              <span
                className="font-sans font-black tracking-[0.18em] text-amber-500"
                style={{ fontSize: "1.05rem", letterSpacing: "0.2em" }}
              >
                {last}
              </span>
            )}
          </div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <span
            className="font-mono text-stone-400 uppercase"
            style={{ fontSize: "0.52rem", letterSpacing: "0.22em" }}
          >
            LUXURY BOUTIQUE
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col items-center gap-4">
          <div className="page-loader-bar-track">
            <div className="page-loader-bar-fill" />
          </div>

          {/* Animated dots */}
          <div className="flex items-center gap-2">
            <span className="loader-dot" />
            <span className="loader-dot" />
            <span className="loader-dot" />
          </div>
        </div>

      </div>

      {/* Subtle bottom tagline */}
      <p
        className="absolute bottom-10 font-mono text-stone-300 tracking-[0.15em] uppercase select-none"
        style={{ fontSize: "0.5rem" }}
      >
        Crafting your experience&hellip;
      </p>

    </div>
  );
}
