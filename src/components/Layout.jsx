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
  { to: "/dashboard", label: "Dashboard",   Icon: HomeIcon,        color: "text-purple-500" },
  { to: "/boardings", label: "Boardings",   Icon: HouseIcon,       color: "text-indigo-400" },
  { to: "/food",      label: "Food & Dining",Icon: FoodIcon,       color: "text-red-400" },
  { to: "/transport", label: "Transport",   Icon: BusIcon,         color: "text-emerald-400" },
  { to: "/map",       label: "Map View",    Icon: MapIcon,         color: "text-blue-400" },
  { to: "/submit",    label: "Add Listing", Icon: PlusIcon,        color: "text-amber-400", hot: true },
  { to: "/profile",   label: "My Profile",  Icon: UserIcon,        color: "text-pink-400" },
];
const adminNav = [
  { to: "/admin",   label: "Admin Desk",  Icon: ShieldCheckIcon, color: "text-emerald-400" },
  { to: "/profile", label: "My Profile",  Icon: UserIcon,        color: "text-pink-400" },
];
const masterNav = [
  { to: "/master",  label: "Master Panel",Icon: BuildingIcon,    color: "text-red-400" },
  { to: "/admin-management", label: "Manage Admins", Icon: ShieldCheckIcon, color: "text-emerald-400" },
  { to: "/profile", label: "My Profile",  Icon: UserIcon,        color: "text-pink-400" },
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

/* ─── Nav Item ───────────────────────────────────────────────────────────────── */
function NavItem({ item, isActive, collapsed }) {
  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center transition-all duration-300 ease-out rounded-xl ${collapsed ? "justify-center py-3" : "justify-start px-3 py-2.5 gap-3"}
        ${isActive 
          ? "bg-white/20 dark:bg-white/10 text-white font-bold shadow-[0_4px_18px_rgba(0,0,0,0.14)] border border-white/20" 
          : "text-white/60 font-medium hover:bg-white/10 hover:text-white border border-transparent"}
      `}
    >
      {isActive && !collapsed && (
        <div className="absolute -left-px top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-md shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
      )}

      <span className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-lg transition-all duration-200
        ${isActive ? "bg-white/20 shadow-md" : "bg-transparent group-hover:bg-white/10"}
      `}>
        <item.Icon size={16} className={isActive ? "text-white" : "text-white/60 group-hover:text-white"} />
      </span>

      {!collapsed && (
        <>
          <span className="flex-1 tracking-tight">{item.label}</span>
          {item.hot && (
            <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white tracking-wider uppercase animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              NEW
            </span>
          )}
        </>
      )}
    </Link>
  );
}

/* ─── Notification Panel ─────────────────────────────────────────────────────── */
function NotifPanel({ notifications, unreadCount, markAllRead, markRead, dismissNotification, onClose, anchorRect }) {
  const navigate = useNavigate();
  const top = (anchorRect?.bottom ?? 62) + 10;
  const right = Math.max(window.innerWidth - (anchorRect?.right ?? 0), 8);

  const handleClick = (n) => {
    markRead(n.id);
    if (n.title.includes("🏠")) { onClose(); navigate("/boardings"); }
    else if (n.title.includes("🍽️")) { onClose(); navigate("/food"); }
    else if (n.title.includes("🚌")) { onClose(); navigate("/transport"); }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[1000]" />
      <div 
        style={{ top, right }}
        className="fixed w-[380px] max-w-[calc(100vw-16px)] glass-card rounded-[22px] z-[1001] overflow-hidden shadow-[0_24px_64px_rgba(8,145,178,0.22),0_4px_16px_rgba(0,0,0,0.08)] animate-slideDown"
      >
        <div className="px-5 py-4 border-b border-border bg-gradient-to-br from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-foreground">Notifications</h3>
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full px-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-[livePulse_1.8s_ease_infinite]" />
                <span className="text-[9.5px] font-bold text-green-700 dark:text-green-400">LIVE</span>
              </div>
            </div>
            {unreadCount > 0
              ? <p className="text-[11.5px] text-primary-600 dark:text-primary-400 mt-0.5 font-semibold">{unreadCount} new listings</p>
              : <p className="text-[11px] text-slate-500 mt-0.5">Polling every 30s</p>
            }
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11.5px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg px-3 py-1.5 hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors">
              <XIcon size={13} />
            </button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto no-scrollbar bg-card">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-100 dark:border-primary-800 mx-auto flex items-center justify-center animate-[float_3s_ease-in-out_infinite] mb-4">
                <BellIcon size={28} className="text-primary-500" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">We'll notify you when new listings<br/>appear at your university.</p>
            </div>
          ) : (
            notifications.map((n, idx) => (
              <div key={n.id} onClick={() => handleClick(n)} className={`flex gap-3 px-4 py-3.5 border-b border-border cursor-pointer transition-colors group relative ${n.read ? 'bg-transparent' : 'bg-primary-50/50 dark:bg-primary-900/10'} hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
                {!n.read && <div className="absolute top-5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_6px_#06b6d4]" />}
                <div className="w-10 h-10 rounded-xl shrink-0 ml-1.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-lg shadow-sm">
                  {n.title.match(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{26FF}]/u)?.[0] || "📌"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[12.5px] ${n.read ? 'font-medium' : 'font-bold'} text-foreground mb-1 leading-tight truncate`}>
                    {n.title.replace(/^[\s\S]{2}\s/, "")}
                  </div>
                  <div className="text-[11.5px] text-slate-500 leading-relaxed mb-1.5">{n.body}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] text-slate-400">{n.time}</span>
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-full px-2 py-0.5">Alert</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md self-start transition-colors">
                  <XIcon size={11} />
                </button>
              </div>
            ))
          )}
        </div>
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
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary-200 selection:text-primary-900 font-sans">
      
      {/* ══════════ SIDEBAR (Desktop) ══════════ */}
      <aside className={`hidden md:flex flex-col shrink-0 bg-slate-900 relative z-20 rounded-r-[28px] shadow-[8px_0_40px_rgba(8,145,178,0.25)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'w-[72px]' : 'w-[244px]'}`}>
        
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

        <div className={`flex items-center shrink-0 min-h-[70px] border-b border-white/10 relative z-10 transition-all duration-300 ${collapsed ? 'justify-center py-4 px-0' : 'justify-start py-5 px-4 gap-2.5'}`}>
          <div className="flex items-center justify-center shrink-0 text-primary-400">
            <SucLogoIcon size={collapsed ? 36 : 40} />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden ml-1">
              <div className="text-base font-black text-white tracking-tight">UniCompanion</div>
              <div className="text-[9px] text-white/50 tracking-[1.2px] uppercase mt-0.5">Smart Campus</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} className={`w-7 h-7 rounded-lg shrink-0 bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all ${collapsed ? 'mt-2' : 'ml-auto'}`}>
            <MenuIcon size={13} />
          </button>
        </div>

        {/* User Card */}
        <div className="relative z-10">
          {!collapsed ? (
            <div className="mx-3 my-3 bg-white/10 border border-white/20 rounded-2xl p-3 flex items-center gap-2.5 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 flex items-center justify-center font-black text-primary-200 text-base shrink-0 shadow-lg">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                  <span className="text-[10px] text-white/60 font-medium">{roleLabel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center font-black text-primary-200 text-sm">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="px-4.5 pt-3 pb-1 shrink-0 relative z-10">
            <span className="text-[9px] font-extrabold text-white/30 uppercase tracking-[1.8px]">Navigation</span>
          </div>
        )}

        <nav className={`flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar relative z-10 ${collapsed ? 'px-2' : 'px-3'}`}>
          {nav.map(item => <NavItem key={item.to} item={item} isActive={location.pathname === item.to} collapsed={collapsed} />)}
        </nav>

        <div className={`shrink-0 border-t border-white/10 relative z-10 ${collapsed ? 'p-2 pb-5' : 'p-3 pb-5'}`}>
          <button onClick={() => { logout(); navigate("/login"); }} title={collapsed ? "Sign out" : undefined} className={`flex items-center w-full rounded-xl border-none bg-white/5 text-white/50 font-medium cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-300 ${collapsed ? 'justify-center py-3' : 'justify-start px-3.5 py-2.5 gap-2.5'}`}>
            <LogOutIcon size={16} />
            {!collapsed && <span className="text-sm">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ══════════ MOBILE BOTTOM NAV ══════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 z-50 flex items-center justify-around border-t border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]">
        {nav.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center justify-center flex-1 h-full relative text-white/60 hover:text-white transition-colors">
              <item.Icon size={22} className={isActive ? "text-white" : ""} />
              <span className={`text-[10px] mt-1 ${isActive ? "font-bold text-white" : "font-medium"}`}>
                {item.label === "Add Listing" ? "Post" : item.label.split(" ")[0]}
              </span>
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-b-md" />}
            </Link>
          );
        })}
      </nav>

      {/* ══════════ MAIN ══════════ */}
      <div className="flex-1 flex flex-col min-w-0 pb-[env(safe-area-inset-bottom)] md:pb-0 h-screen overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-16 shrink-0 glass border-b shadow-sm flex items-center justify-between px-4 md:px-7 relative z-10">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-lg font-extrabold text-foreground tracking-tight leading-none">{pageTitle}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPinIcon size={11} className="text-primary-500" />
                <span className="text-[11px] text-slate-500 font-medium">{areaLabel} · {uniLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:rotate-12 transition-all">
              {theme.dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>

            <button ref={bellRef} onClick={() => notifOpen ? setNotifOpen(false) : openNotif()} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${notifOpen ? 'bg-primary-100 dark:bg-primary-900/50 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'}`}>
              <BellIcon size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 px-1 shadow-sm animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <Link to="/profile" className={`hidden md:flex items-center gap-2 rounded-xl p-1.5 pr-3.5 transition-all ${location.pathname === '/profile' ? 'bg-primary-100 dark:bg-primary-900/50 border border-primary-300 dark:border-primary-700' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-105 hover:border-primary-300'}`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shrink-0 flex items-center justify-center text-white font-black text-xs shadow-md">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <div className="leading-none">
                <div className="text-[12px] font-bold text-foreground">{user?.name?.split(" ")[0]}</div>
                <div className="text-[9.5px] text-primary-600 dark:text-primary-400 font-bold mt-0.5">{roleLabel}</div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 relative">
          <div className="animate-fadeInUp mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {notifOpen && (
        <NotifPanel
          notifications={notifications} unreadCount={unreadCount}
          markAllRead={markAllRead} markRead={markRead}
          dismissNotification={dismissNotification}
          onClose={() => setNotifOpen(false)}
          anchorRect={bellRect}
        />
      )}
    </div>
  );
}
