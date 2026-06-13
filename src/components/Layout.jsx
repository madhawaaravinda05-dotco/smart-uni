import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  HomeIcon, MapIcon, UserIcon, LogOutIcon, BusIcon, FoodIcon,
  HouseIcon, PlusIcon, BuildingIcon, ShieldCheckIcon, MenuIcon,
  XIcon, BellIcon, MapPinIcon, CheckIcon, AlertTriangleIcon,
  InfoIcon, SparkleIcon, SunIcon, MoonIcon, SucLogoIcon
} from "./Icons";

const studentNav = [
  { to: "/dashboard", label: "Dashboard",   Icon: HomeIcon,        color: "#A78BFA" },
  { to: "/boardings", label: "Boardings",   Icon: HouseIcon,       color: "#C4B5FD" },
  { to: "/food",      label: "Food & Dining",Icon: FoodIcon,       color: "#FCA5A5" },
  { to: "/transport", label: "Transport",   Icon: BusIcon,         color: "#6EE7B7" },
  { to: "/map",       label: "Map View",    Icon: MapIcon,         color: "#93C5FD" },
  { to: "/submit",    label: "Add Listing", Icon: PlusIcon,        color: "#FDE68A", hot: true },
  { to: "/profile",   label: "My Profile",  Icon: UserIcon,        color: "#F9A8D4" },
];
const adminNav = [
  { to: "/admin",   label: "Admin Desk",  Icon: ShieldCheckIcon, color: "#6EE7B7" },
  { to: "/profile", label: "My Profile",  Icon: UserIcon,        color: "#F9A8D4" },
];
const masterNav = [
  { to: "/master",  label: "Master Panel",Icon: BuildingIcon,    color: "#FCA5A5" },
  { to: "/admin-management", label: "Manage Admins", Icon: ShieldCheckIcon, color: "#6EE7B7" },
  { to: "/profile", label: "My Profile",  Icon: UserIcon,        color: "#F9A8D4" },
];

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/boardings": "Boardings",
  "/food":      "Food & Dining",
  "/transport": "Transport",
  "/map":       "Map View",
  "/submit":    "Add Listing",
  "/profile":   "My Profile",
  "/admin":     "Admin Desk",
  "/master":    "Master Panel",
  "/admin-management": "Manage Admins",
};

const NOTIF_STYLE = {
  success: { color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC", Icon: CheckIcon },
  info:    { color: "var(--p600)", bg: "var(--p50)", border: "var(--p200)", Icon: InfoIcon  },
  warning: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", Icon: AlertTriangleIcon },
  danger:  { color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", Icon: AlertTriangleIcon },
};

/* ─── Nav Item ───────────────────────────────────────────────────────────────── */
function NavItem({ item, isActive, collapsed }) {
  const [hov, setHov] = useState(false);
  const active = isActive || hov;

  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center",
        gap: collapsed ? 0 : 11,
        padding: collapsed ? "10px 0" : "10px 13px",
        borderRadius: 14,
        textDecoration: "none",
        justifyContent: collapsed ? "center" : "flex-start",
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative",
        background: isActive
          ? "rgba(255,255,255,.18)"
          : hov ? "rgba(255,255,255,.1)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,.58)",
        fontWeight: isActive ? 700 : 500,
        fontSize: 13,
        boxShadow: isActive ? "0 4px 18px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.15)" : "none",
        border: isActive ? "1px solid rgba(255,255,255,.18)" : "1px solid transparent",
      }}
    >
      {/* Active glow dot */}
      {isActive && !collapsed && (
        <div style={{
          position: "absolute", left: -1, top: "50%", transform: "translateY(-50%)",
          width: 3, height: 22, borderRadius: "0 3px 3px 0",
          background: "rgba(255,255,255,.9)",
          boxShadow: "0 0 8px rgba(255,255,255,.7)",
        }}/>
      )}

      {/* Icon */}
      <span style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 32, height: 32, flexShrink: 0, borderRadius: 10,
        background: isActive ? "rgba(255,255,255,.22)" : hov ? "rgba(255,255,255,.1)" : "transparent",
        transition: "all 0.2s ease",
        boxShadow: isActive ? "0 2px 8px rgba(0,0,0,.12)" : "none",
      }}>
        <item.Icon size={16} color={active ? "#fff" : "rgba(255,255,255,.6)"} />
      </span>

      {!collapsed && (
        <>
          <span style={{ flex: 1, letterSpacing: "-0.1px" }}>{item.label}</span>
          {item.hot && (
            <span style={{
              fontSize: 8.5, fontWeight: 900, padding: "2px 7px", borderRadius: 99,
              background: "linear-gradient(135deg,#F59E0B,#EF4444)",
              color: "#fff", letterSpacing: "0.6px", textTransform: "uppercase",
              animation: "glowPulse 2s ease infinite",
            }}>
              NEW
            </span>
          )}
        </>
      )}
    </Link>
  );
}

/* ─── Notification Panel ─────────────────────────────────────────────────────── */
function NotifPanel({ notifications, unreadCount, markAllRead, markRead,
                      dismissNotification, onClose, theme, anchorRect }) {
  const navigate = useNavigate();
  const top   = (anchorRect?.bottom ?? 62) + 10;
  const right = Math.max(window.innerWidth - (anchorRect?.right ?? 0), 8);

  // Category → route mapping
  const POST_ROUTES = { BOARDING: "/boardings", FOOD: "/food", TRANSPORT: "/transport" };

  // Derive icon background colour per notification type
  const NOTIF_COLORS = {
    success: { bg: "#F0FDF4", border: "#86EFAC", dot: "#16A34A", icon: "#16A34A" },
    info:    { bg: "var(--p50)", border: "var(--p200)", dot: "var(--p600)", icon: "var(--p600)" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", dot: "#D97706", icon: "#D97706" },
    danger:  { bg: "#FEF2F2", border: "#FCA5A5", dot: "#DC2626", icon: "#DC2626" },
  };

  const handleClick = (n) => {
    markRead(n.id);
    // Navigate to the relevant page if we know the category
    if (n.title.includes("🏠")) { onClose(); navigate("/boardings"); }
    else if (n.title.includes("🍽️")) { onClose(); navigate("/food"); }
    else if (n.title.includes("🚌")) { onClose(); navigate("/transport"); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000 }} />
      <div style={{
        position: "fixed", top, right,
        width: 380, maxWidth: "calc(100vw - 16px)",
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 22,
        boxShadow: "0 24px 64px rgba(8,145,178,.22), 0 4px 16px rgba(0,0,0,.08)",
        zIndex: 1001, overflow: "hidden",
        animation: "slideDown 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "15px 18px 12px",
          borderBottom: `1px solid ${theme.divider}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: `linear-gradient(135deg, ${theme.accentBg}, ${theme.cardBg})`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: theme.textPrimary }}>
                  Notifications
                </h3>
                {/* Live pulse indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 4,
                  background: "#F0FDF4", border: "1px solid #86EFAC",
                  borderRadius: 99, padding: "2px 8px" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%",
                    background: "#16A34A", boxShadow: "0 0 0 0 #16A34A",
                    animation: "livePulse 1.8s ease infinite" }} />
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "#15803D" }}>LIVE</span>
                </div>
              </div>
              {unreadCount > 0
                ? <p style={{ fontSize: 11.5, color: theme.accent, marginTop: 2, fontWeight: 600 }}>
                    {unreadCount} new {unreadCount === 1 ? "listing" : "listings"} near you
                  </p>
                : <p style={{ fontSize: 11, color: theme.textFaint, marginTop: 2 }}>
                    Polling every 30s for new posts
                  </p>
              }
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                fontSize: 11.5, fontWeight: 700, color: theme.accent,
                background: theme.accentBg, border: `1px solid ${theme.accentBorder}`,
                borderRadius: 9, padding: "5px 12px", cursor: "pointer", transition: "all .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = theme.accentSoft}
                onMouseLeave={e => e.currentTarget.style.background = theme.accentBg}
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 9,
              background: theme.accentBg, border: `1px solid ${theme.accentBorder}`,
              cursor: "pointer", color: theme.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <XIcon size={13} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxHeight: 420, overflowY: "auto" }} className="no-scroll">
          {notifications.length === 0 ? (
            <div style={{ padding: "48px 16px", textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: theme.accentBg,
                margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
                animation: "float 3s ease-in-out infinite",
                border: `2px solid ${theme.accentBorder}`,
              }}>
                <BellIcon size={28} color={theme.accent} />
              </div>
              <p style={{ fontSize: 14, color: theme.textMuted, fontWeight: 700 }}>All caught up!</p>
              <p style={{ fontSize: 12, color: theme.textFaint, marginTop: 4, lineHeight: 1.6 }}>
                We'll notify you when new listings<br />appear at your university.
              </p>
            </div>
          ) : (
            notifications.map((n, idx) => {
              const c = NOTIF_COLORS[n.type] || NOTIF_COLORS.info;
              // Pick emoji from title
              const emoji = n.title.match(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]/u)?.[0] || "📌";
              const cleanTitle = n.title.replace(/^[\s\S]{2}\s/, ""); // remove leading emoji+space
              return (
                <div key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: "flex", gap: 12, padding: "13px 18px",
                    borderBottom: `1px solid ${theme.divider}`,
                    background: n.read ? "transparent" : `${c.bg}CC`,
                    cursor: "pointer", transition: "all 0.15s", position: "relative",
                    animation: idx < 3 ? `slideInNotif .3s ${idx * .05}s both` : "none",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.accentSoft; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.read ? "transparent" : `${c.bg}CC`; }}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{
                      position: "absolute", top: 18, left: 7,
                      width: 6, height: 6, borderRadius: "50%",
                      background: c.dot, boxShadow: `0 0 6px ${c.dot}`,
                    }} />
                  )}

                  {/* Emoji icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 13, flexShrink: 0, marginLeft: 6,
                    background: c.bg, border: `1.5px solid ${c.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, boxShadow: `0 2px 8px ${c.dot}22`,
                  }}>
                    {emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5,
                      fontWeight: n.read ? 500 : 700,
                      color: theme.textPrimary,
                      marginBottom: 3, lineHeight: 1.35,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {cleanTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: theme.textMuted, lineHeight: 1.5, marginBottom: 4 }}>
                      {n.body}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10.5, color: theme.textFaint }}>{n.time}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: c.icon,
                        background: c.bg, border: `1px solid ${c.border}`,
                        borderRadius: 99, padding: "1px 7px",
                      }}>
                        {n.title.includes("🏠") ? "Boarding"
                          : n.title.includes("🍽️") ? "Food"
                          : n.title.includes("🚌") ? "Transport"
                          : "Listing"}
                      </span>
                      <span style={{ fontSize: 10, color: theme.accent, fontWeight: 600, marginLeft: "auto" }}>
                        View →
                      </span>
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={e => { e.stopPropagation(); dismissNotification(n.id); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: theme.textFaint, padding: 3, display: "flex", flexShrink: 0,
                      alignSelf: "flex-start", marginTop: 2, borderRadius: 6,
                      transition: "all .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "#FEF2F2"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = theme.textFaint; e.currentTarget.style.background = "none"; }}
                  >
                    <XIcon size={11} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        {notifications.length > 0 && (
          <div style={{
            padding: "10px 18px",
            borderTop: `1px solid ${theme.divider}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: `${theme.accentBg}50`,
          }}>
            <span style={{ fontSize: 11, color: theme.textFaint }}>
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            </span>
            <button onClick={() => { notifications.forEach(n => dismissNotification(n.id)); onClose(); }}
              style={{ fontSize: 11, color: theme.textFaint, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
              onMouseLeave={e => e.currentTarget.style.color = theme.textFaint}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}


/* ─── Main Layout ─────────────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout, isAdmin, isMasterAdmin, notifications, unreadCount, markAllRead, markRead, dismissNotification } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [collapsed,  setCollapsed]  = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [bellRect,   setBellRect]   = useState(null);
  const bellRef = useRef(null);

  const nav       = isMasterAdmin ? masterNav : isAdmin ? adminNav : studentNav;
  const roleLabel = isMasterAdmin ? "Master Admin" : isAdmin ? "Campus Admin" : "Student";
  const uniLabel  = isMasterAdmin ? "All Universities" : (user?.university || "University");
  const areaLabel = isMasterAdmin ? "Global Platform"  : (user?.area       || "Campus");
  const pageTitle = PAGE_TITLES[location.pathname] || "UniCompanion";

  const openNotif = useCallback(() => {
    if (bellRef.current) setBellRect(bellRef.current.getBoundingClientRect());
    setNotifOpen(true);
  }, []);

  return (
    <div className="app-layout">

      {/* ══════════ SIDEBAR (Desktop) ══════════ */}
      <aside className="hide-on-mobile" style={{
        width: collapsed ? 72 : 244,
        flexShrink: 0,
        background: theme.sidebar,
        flexDirection: "column",
        height: "100vh",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        position: "relative", zIndex: 20,
        borderRadius: "0 28px 28px 0",
        boxShadow: "8px 0 40px rgba(8,145,178,.35)",
      }}>

        {/* Decorative blobs inside sidebar */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 200, height: 200,
          borderRadius: "50%", background: "rgba(255,255,255,.05)", pointerEvents: "none",
        }}/>
        <div style={{
          position: "absolute", bottom: 40, left: -40, width: 160, height: 160,
          borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none",
        }}/>

        <div style={{
          display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          padding: collapsed ? "22px 0 18px" : "20px 16px 16px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255,255,255,.1)",
          flexShrink: 0, minHeight: 70, position: "relative", zIndex: 1,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <SucLogoIcon size={44} />
          </div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: "hidden", marginLeft: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: "-0.4px" }}>UniCompanion</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.55)", letterSpacing: "1.2px", textTransform: "uppercase", marginTop: 1 }}>Smart Campus</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              width: 28, height: 28, borderRadius: 9, flexShrink: 0,
              background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,.7)", cursor: "pointer", transition: "all .18s",
              marginLeft: collapsed ? 0 : "auto",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.22)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
          >
            <MenuIcon size={13} />
          </button>
        </div>

        {/* ── User card ── */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {!collapsed ? (
            <div style={{
              margin: "14px 12px 6px",
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.18)",
              borderRadius: 18, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
              backdropFilter: "blur(10px)",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,.15))",
                border: "2px solid rgba(255,255,255,.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "var(--p600)", fontSize: 16, flexShrink: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,.15)",
              }}>
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }} />
                  <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", fontWeight: 500 }}>{roleLabel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "rgba(255,255,255,.22)", border: "2px solid rgba(255,255,255,.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "var(--p600)", fontSize: 15,
              }}>
                {(user?.name || "U")[0].toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* ── Section label ── */}
        {!collapsed && (
          <div style={{ padding: "14px 18px 4px", flexShrink: 0, position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "1.8px" }}>
              Navigation
            </span>
          </div>
        )}

        {/* ── Nav items ── */}
        <nav style={{
          flex: 1,
          padding: collapsed ? "6px 8px" : "4px 10px",
          display: "flex", flexDirection: "column", gap: 2,
          overflowY: "auto", overflowX: "hidden",
          position: "relative", zIndex: 1,
        }} className="no-scroll">
          {nav.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              isActive={location.pathname === item.to}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* ── Sign out ── */}
        <div style={{
          padding: collapsed ? "8px 8px 20px" : "6px 10px 20px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          flexShrink: 0, position: "relative", zIndex: 1,
        }}>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            title={collapsed ? "Sign out" : undefined}
            style={{
              display: "flex", alignItems: "center",
              gap: collapsed ? 0 : 10,
              width: "100%",
              padding: collapsed ? "11px 0" : "10px 13px",
              borderRadius: 12, border: "none",
              background: "rgba(255,255,255,.07)",
              color: "rgba(255,255,255,.45)",
              fontFamily: "inherit", fontSize: 13, fontWeight: 500,
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all .18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,.2)"; e.currentTarget.style.color = "#FCA5A5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "rgba(255,255,255,.45)"; }}
          >
            <LogOutIcon size={16} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ══════════ MOBILE BOTTOM NAV ══════════ */}
      <nav className="mobile-bottom-nav">
        {nav.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                flex: 1, height: "100%", color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                textDecoration: "none", position: "relative"
              }}
            >
              <item.Icon size={22} color={isActive ? "#fff" : "rgba(255,255,255,0.6)"} />
              <span style={{ fontSize: 10, marginTop: 4, fontWeight: isActive ? 700 : 500 }}>
                {item.label === "Add Listing" ? "Post" : item.label.split(" ")[0]}
              </span>
              {isActive && (
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 32, height: 3, background: "#fff", borderRadius: "0 0 4px 4px" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "env(safe-area-inset-bottom)" }}>

        {/* ── Top bar ── */}
        <header style={{
          height: 64, flexShrink: 0,
          background: theme.topbarBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.topbarBorder}`,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          boxShadow: theme.topbarShadow,
          position: "relative", zIndex: 10,
        }}>
          {/* Left — page title + location */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.textPrimary, letterSpacing: "-0.4px", lineHeight: 1 }}>
                {pageTitle}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <MapPinIcon size={11} color={theme.accent} />
                <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 500 }}>{areaLabel} · {uniLabel}</span>
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme.dark ? "Light mode" : "Dark mode"}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: theme.accentBg, border: `1.5px solid ${theme.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: theme.accent, cursor: "pointer", transition: "all .2s var(--ease-spring)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.transform = "scale(1.07) rotate(15deg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = theme.accentBg; e.currentTarget.style.transform = "scale(1) rotate(0)"; }}
            >
              {theme.dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>

            {/* Bell */}
            <button
              ref={bellRef}
              onClick={() => notifOpen ? setNotifOpen(false) : openNotif()}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: notifOpen ? theme.accentSoft : theme.accentBg,
                border: `1.5px solid ${notifOpen ? theme.accent : theme.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: theme.accent, cursor: "pointer", transition: "all .2s var(--ease-spring)",
                position: "relative",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.transform = "scale(1.07)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = notifOpen ? theme.accentSoft : theme.accentBg; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <BellIcon size={17} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5,
                  background: "linear-gradient(135deg,#EF4444,#F97316)",
                  color: "white", fontSize: 9, fontWeight: 900,
                  minWidth: 18, height: 18, borderRadius: 99,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid white", padding: "0 3px",
                  animation: "pulseRing 2s ease infinite",
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Profile chip */}
            <Link
              to="/profile"
              style={{
                display: "flex", alignItems: "center", gap: 9,
                background: location.pathname === "/profile" ? theme.accentSoft : theme.accentBg,
                border: `1.5px solid ${location.pathname === "/profile" ? theme.accent : theme.accentBorder}`,
                borderRadius: 14, padding: "7px 14px 7px 8px",
                textDecoration: "none", transition: "all .2s var(--ease-spring)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => {
                if (location.pathname !== "/profile") {
                  e.currentTarget.style.background = theme.accentBg;
                  e.currentTarget.style.borderColor = theme.accentBorder;
                }
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: theme.brandGrad, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 800, fontSize: 12,
                boxShadow: `0 3px 10px ${theme.accent}40`,
              }}>
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textPrimary, lineHeight: 1 }}>
                  {user?.name?.split(" ")[0]}
                </div>
                <div style={{ fontSize: 10, color: theme.accent, marginTop: 2, fontWeight: 600 }}>{roleLabel}</div>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          className="main-content no-scroll"
          key={location.pathname}
        >
          <div className="anim-fadeInUp">
            {children}
          </div>
        </main>
      </div>

      {/* Notification panel */}
      {notifOpen && (
        <NotifPanel
          notifications={notifications} unreadCount={unreadCount}
          markAllRead={markAllRead} markRead={markRead}
          dismissNotification={dismissNotification}
          onClose={() => setNotifOpen(false)}
          theme={theme} anchorRect={bellRect}
        />
      )}

      <style>{`
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.5)} 50%{box-shadow:0 0 0 6px rgba(245,158,11,0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-12px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pulseRing { 0%{transform:scale(.92);box-shadow:0 0 0 0 rgba(239,68,68,.5)} 70%{transform:scale(1);box-shadow:0 0 0 8px rgba(239,68,68,0)} 100%{transform:scale(.92)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,.4)} 50%{box-shadow:0 0 0 6px rgba(22,163,74,0)} }
        @keyframes slideInNotif { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .anim-fadeInUp { animation: fadeInUp 0.4s cubic-bezier(0.2,0,0,1) both; }
        .no-scroll::-webkit-scrollbar{display:none}
        .no-scroll{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}
