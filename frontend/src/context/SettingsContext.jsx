import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const DEFAULTS = {
  storeName:       "Maison de Sac",
  storeTagline:    "Luxury Bags & Accessories",
  logoMain:        "",
  footerText:      "",
  contactEmail:    "",
  contactPhone:    "",
  storeAddress:    "",
  workingHours:    "",
  socialFacebook:  "",
  socialInstagram: "",
  socialLinkedin:  "",
  primaryColor:    "#d97706",
  secondaryColor:  "#1c1917",
  accentColor:     "#b45309",
  borderRadius:    "medium",
  shadowIntensity: "medium",
  announcementBar: "Free Priority Shipping On Orders Over Rs. 20,000 • Enjoy 15% Welcome Discount",
  announcementEnabled: true,
  currency:        "PKR",
  currencySymbol:  "Rs.",
};

// Map CSS pixel values saved by the appearance form to semantic names
const normalizeBorderRadius = (v) => {
  if (!v) return "medium";
  const map = { "12px": "medium", "4px": "small", "9999px": "pill", "1rem": "large" };
  return map[v] || (["small", "medium", "large", "pill"].includes(v) ? v : "medium");
};

const SettingsContext = createContext({ settings: DEFAULTS, loading: true, refresh: () => {} });

/* ─── Apply CSS custom properties to :root so ALL components inherit live theming ─── */
function applyThemeToCss(settings) {
  const root = document.documentElement;

  if (settings.primaryColor) {
    root.style.setProperty("--accent-color", settings.primaryColor);
  }
  if (settings.accentColor) {
    root.style.setProperty("--accent-dark", settings.accentColor);
  }

  const lightHex = settings.primaryColor ?? "#d97706";
  root.style.setProperty("--accent-light", hexToAlpha(lightHex, 0.08));

  // Border radius scale
  const radii = { small: "0.5rem", medium: "0.75rem", large: "1rem", pill: "9999px" };
  root.style.setProperty("--card-radius", radii[settings.borderRadius] ?? radii.medium);

  // Shadow intensity — write to the luxury-card vars
  const shadows = {
    none:   "none",
    light:  "0 1px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
    medium: "0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
    heavy:  "0 4px 20px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.07)",
  };
  root.style.setProperty("--shadow-card", shadows[settings.shadowIntensity] ?? shadows.medium);

  // Document title
  if (settings.storeName) {
    document.title = settings.storeName;
  }
}

/* Hex → rgba helper */
function hexToAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading,  setLoading]  = useState(true);

  const applySettings = useCallback((s = {}) => {
    const w = s.website    || {};
    const c = s.contact    || {};
    const a = s.appearance || {};

    const merged = {
      storeName:       w.storeName            || DEFAULTS.storeName,
      storeTagline:    w.storeTagline         || DEFAULTS.storeTagline,
      logoMain:        a.logoMain             || "",
      footerText:      w.footerText           || "",
      contactEmail:    w.contactEmail         || c.email            || "",
      contactPhone:    w.contactPhone         || c.phone            || "",
      storeAddress:    c.address              || "",
      workingHours:    c.workingHours         || "",
      socialFacebook:  w.socialFacebook       || "",
      socialInstagram: w.socialInstagram      || "",
      socialLinkedin:  w.socialLinkedin       || "",
      primaryColor:    a.primaryColor         || DEFAULTS.primaryColor,
      secondaryColor:  a.secondaryColor       || DEFAULTS.secondaryColor,
      accentColor:     a.accentColor          || DEFAULTS.accentColor,
      borderRadius:    normalizeBorderRadius(a.borderRadius),
      shadowIntensity: a.shadowIntensity      || DEFAULTS.shadowIntensity,
      announcementBar:     w.announcementBar     || DEFAULTS.announcementBar,
      announcementEnabled: w.announcementEnabled ?? DEFAULTS.announcementEnabled,
      currency:        w.currency             || DEFAULTS.currency,
      currencySymbol:  w.currencySymbol       || DEFAULTS.currencySymbol,
    };

    setSettings(merged);
    applyThemeToCss(merged);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get("/settings/public");
      applySettings(data.settings || {});
    } catch {
      // Backend offline — apply defaults to CSS anyway
      applyThemeToCss(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, [applySettings]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
