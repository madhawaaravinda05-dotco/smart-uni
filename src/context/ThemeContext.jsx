import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const THEMES = {
  light: {
    id: "light", name: "Light", dark: false,
    // Sidebar
    sidebar:          "linear-gradient(180deg, #5B21B6 0%, #7C3AED 50%, #9333EA 100%)",
    sidebarSolid:     "#7C3AED",
    // Accent
    accent:           "#7C3AED",
    accentHover:      "#6D28D9",
    accentLight:      "#A78BFA",
    accentBg:         "#F5F3FF",
    accentBorder:     "#DDD6FE",
    accentSoft:       "#EDE9FE",
    accentGlow:       "rgba(124,58,237,.18)",
    // Nav
    navActive:        "rgba(255,255,255,0.2)",
    navActiveText:    "#ffffff",
    navText:          "rgba(255,255,255,0.6)",
    navHover:         "rgba(255,255,255,0.1)",
    // Brand
    brandGrad:        "linear-gradient(135deg,#7C3AED,#9333EA)",
    avatarGrad:       "linear-gradient(135deg,#7C3AED,#6366F1)",
    heroGrad:         "linear-gradient(135deg,#5B21B6 0%,#7C3AED 50%,#9333EA 100%)",
    // Page
    pageBg:           "#F8F7FF",
    // Cards
    cardBg:           "#ffffff",
    cardBorder:       "rgba(124,58,237,.09)",
    cardBorderHover:  "rgba(124,58,237,.22)",
    cardShadow:       "0 2px 12px rgba(124,58,237,.08)",
    cardShadowHover:  "0 12px 36px rgba(124,58,237,.18)",
    // Topbar
    topbarBg:         "rgba(255,255,255,.85)",
    topbarBorder:     "rgba(124,58,237,.1)",
    topbarShadow:     "0 1px 24px rgba(124,58,237,.08)",
    // Text
    textPrimary:      "#1E1B4B",
    textSecondary:    "#4C1D95",
    textMuted:        "#6B7280",
    textFaint:        "#9CA3AF",
    // Inputs
    inputBg:          "#F9FAFB",
    inputBorder:      "#E5E7EB",
    inputFocus:       "#7C3AED",
    inputShadow:      "0 0 0 3px rgba(124,58,237,.12)",
    // Misc
    divider:          "rgba(124,58,237,.08)",
    skeletonBase:     "#F0EEF8",
    skeletonShimmer:  "#E4E0F0",
  },
  dark: {
    id: "dark", name: "Dark", dark: true,
    sidebar:          "linear-gradient(180deg, #1E0A40 0%, #2D1B6E 50%, #3B1F8C 100%)",
    sidebarSolid:     "#2D1B6E",
    accent:           "#A78BFA",
    accentHover:      "#C4B5FD",
    accentLight:      "#C4B5FD",
    accentBg:         "rgba(167,139,250,.1)",
    accentBorder:     "rgba(167,139,250,.2)",
    accentSoft:       "rgba(167,139,250,.15)",
    accentGlow:       "rgba(167,139,250,.2)",
    navActive:        "rgba(167,139,250,.22)",
    navActiveText:    "#C4B5FD",
    navText:          "rgba(255,255,255,.45)",
    navHover:         "rgba(255,255,255,.07)",
    brandGrad:        "linear-gradient(135deg,#7C3AED,#A855F7)",
    avatarGrad:       "linear-gradient(135deg,#7C3AED,#6366F1)",
    heroGrad:         "linear-gradient(135deg,#1E0A40 0%,#2D1B6E 50%,#4C1D95 100%)",
    pageBg:           "#0A0818",
    cardBg:           "#120F2A",
    cardBorder:       "rgba(167,139,250,.1)",
    cardBorderHover:  "rgba(167,139,250,.25)",
    cardShadow:       "0 2px 12px rgba(0,0,0,.4)",
    cardShadowHover:  "0 12px 36px rgba(0,0,0,.6)",
    topbarBg:         "rgba(18,15,42,.85)",
    topbarBorder:     "rgba(167,139,250,.1)",
    topbarShadow:     "0 1px 24px rgba(0,0,0,.3)",
    textPrimary:      "#F5F3FF",
    textSecondary:    "#C4B5FD",
    textMuted:        "#9CA3AF",
    textFaint:        "#6B7280",
    inputBg:          "#1E1B4B",
    inputBorder:      "rgba(167,139,250,.2)",
    inputFocus:       "#A78BFA",
    inputShadow:      "0 0 0 3px rgba(167,139,250,.15)",
    divider:          "rgba(167,139,250,.08)",
    skeletonBase:     "#1E1B4B",
    skeletonShimmer:  "#2D2A5E",
  },
};

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const s = localStorage.getItem("uc_theme");
    return (s === "light" || s === "dark") ? s : "light";
  });

  const theme     = THEMES[themeId] || THEMES.light;
  const setTheme  = (id) => {
    if (id !== "light" && id !== "dark") return;
    setThemeId(id);
    localStorage.setItem("uc_theme", id);
  };
  const toggleTheme = () => setTheme(theme.dark ? "light" : "dark");

  useEffect(() => {
    document.body.style.background = theme.pageBg;
    document.documentElement.style.setProperty("--accent",   theme.accent);
    document.documentElement.style.setProperty("--page-bg",  theme.pageBg);
    document.documentElement.style.setProperty("--card-bg",  theme.cardBg);
    document.documentElement.setAttribute("data-theme", themeId);
  }, [theme, themeId]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
