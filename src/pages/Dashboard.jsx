import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getActivePosts } from "../api/api";
import { StarRating, LoadingScreen, ErrorBox } from "../components/ui";
import {
  HouseIcon, FoodIcon, BusIcon, MapPinIcon, ShieldCheckIcon,
  TrendingUpIcon, PlusIcon, ChevronRightIcon, MapIcon,
} from "../components/Icons";

/* ─── Stat card ──────────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, accent, featured = false, delay = 0 }) {
  const [hov, setHov] = useState(false);
  const bg = featured
    ? `linear-gradient(135deg, ${accent}, ${accent}BB)`
    : "#fff";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: bg, borderRadius: 20, padding: "22px 22px 18px",
        border: featured ? "none" : `1.5px solid ${accent}20`,
        boxShadow: hov
          ? `0 16px 40px ${accent}30`
          : featured ? `0 8px 28px ${accent}45` : `0 2px 14px ${accent}12`,
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hov ? "translateY(-5px) scale(1.02)" : "none",
        cursor: "default",
        animationDelay: `${delay}s`,
      }}
      className="anim-fadeInUp"
    >
      <div style={{
        width: 50, height: 50, borderRadius: 16, marginBottom: 16,
        background: featured ? "rgba(255,255,255,.22)" : `${accent}18`,
        border: featured ? "1px solid rgba(255,255,255,.32)" : `1px solid ${accent}28`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: featured ? `0 4px 16px rgba(0,0,0,.12)` : `0 2px 8px ${accent}18`,
      }}>
        <Icon size={23} color={featured ? "#fff" : accent} />
      </div>
      <div style={{
        fontSize: 30, fontWeight: 900, color: featured ? "#fff" : accent,
        letterSpacing: "-1.2px", lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: featured ? "rgba(255,255,255,.88)" : "#374151", marginTop: 6 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: featured ? "rgba(255,255,255,.6)" : "#9CA3AF", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* ─── Category card ──────────────────────────────────────────────────────────── */
function CategoryCard({ to, label, sub, Icon, accent, bg, delay = 0 }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to} style={{ textDecoration: "none", animationDelay: `${delay}s` }} className="anim-fadeInUp">
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? bg : "#fff",
          border: `1.5px solid ${hov ? accent : accent + "22"}`,
          borderRadius: 20, padding: "20px",
          display: "flex", alignItems: "center", gap: 14,
          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transform: hov ? "translateY(-4px)" : "none",
          boxShadow: hov ? `0 12px 32px ${accent}25` : "0 2px 12px rgba(124,58,237,.06)",
          cursor: "pointer",
        }}
      >
        <div style={{
          width: 50, height: 50, borderRadius: 16, flexShrink: 0,
          background: hov ? `${accent}25` : bg,
          border: `1.5px solid ${accent}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.22s", boxShadow: hov ? `0 4px 16px ${accent}30` : "none",
        }}>
          <Icon size={23} color={accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "#1E1B4B" }}>{label}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 9, background: hov ? `${accent}18` : "#F9FAFB",
          border: `1px solid ${hov ? accent + "30" : "#E5E7EB"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s", transform: hov ? "translateX(3px)" : "none",
        }}>
          <ChevronRightIcon size={14} color={hov ? accent : "#CBD5E1"} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Listing mini card ──────────────────────────────────────────────────────── */
function ListingCard({ item, gradient, type, theme }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: theme.cardBg,
        border: `1.5px solid ${hov ? theme.accent + "35" : theme.cardBorder}`,
        borderRadius: 18, overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov ? theme.cardShadowHover : theme.cardShadow,
        cursor: "pointer",
      }}
    >
      <div style={{ height: 96, background: gradient, position: "relative" }}>
        {/* Shimmer overlay on hover */}
        {hov && <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,.12), transparent)",
        }}/>}
        {item.genderType && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(255,255,255,.92)", backdropFilter: "blur(6px)",
            fontSize: 9.5, fontWeight: 700, color: "#4C1D95",
            padding: "3px 9px", borderRadius: 99,
          }}>
            {item.genderType}
          </span>
        )}
        {(item.verified || item.status === "APPROVED") && (
          <span style={{
            position: "absolute", top: 8, right: 8,
            background: "linear-gradient(135deg,#16A34A,#22C55E)",
            color: "#fff", fontSize: 9, fontWeight: 700,
            padding: "3px 9px", borderRadius: 99,
            display: "flex", alignItems: "center", gap: 3,
            boxShadow: "0 2px 8px rgba(22,163,74,.4)",
          }}>
            <ShieldCheckIcon size={9} color="white" /> Verified
          </span>
        )}
      </div>
      <div style={{ padding: "11px 13px 13px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.textPrimary, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title}
        </div>
        {type === "boarding" ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>
              Rs. {(item.price || 8500).toLocaleString()}
              <span style={{ fontSize: 10, fontWeight: 400, color: theme.textFaint }}>/mo</span>
            </span>
            <span style={{ fontSize: 10.5, color: theme.textFaint, display: "flex", alignItems: "center", gap: 3 }}>
              <MapPinIcon size={10} color={theme.textFaint} />{item.distance || "< 1 km"}
            </span>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
              {(item.tags || []).map((t) => (
                <span key={t} style={{ fontSize: 9.5, fontWeight: 600, background: "#F0FDF4", color: "#16A34A", padding: "2px 8px", borderRadius: 99 }}>{t}</span>
              ))}
            </div>
            <StarRating rating={item.rating || 4.5} size={12} />
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [time,    setTime]    = useState(new Date());

  const load = async () => {
    setLoading(true); setError("");
    const res = await getActivePosts(user?.university || "University of Moratuwa");
    setLoading(false);
    if (!res.success) { setError(res.message); return; }
    setPosts(res.data || []);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(t); }, []);

  const totalBoardings = posts.filter(p => p.category === "BOARDING");
  const totalFood      = posts.filter(p => p.category === "FOOD");
  const totalTransport = posts.filter(p => p.category === "TRANSPORT");
  const displayBoardings = totalBoardings.slice(0, 4);
  const displayFood      = totalFood.slice(0, 4);

  const bGrads = [
    "linear-gradient(135deg,#C4B5FD,#A78BFA)",
    "linear-gradient(135deg,#93C5FD,#60A5FA)",
    "linear-gradient(135deg,#DDD6FE,#C4B5FD)",
    "linear-gradient(135deg,#D1FAE5,#6EE7B7)",
  ];
  const fGrads = [
    "linear-gradient(135deg,#BBF7D0,#6EE7B7)",
    "linear-gradient(135deg,#FED7AA,#FDBA74)",
    "linear-gradient(135deg,#FDE68A,#FCD34D)",
    "linear-gradient(135deg,#FBCFE8,#F9A8D4)",
  ];

  const firstName = user?.name?.split(" ")[0] || "Student";
  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div style={{
        background: theme.heroGrad,
        borderRadius: 28, padding: "32px 36px",
        marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        overflow: "hidden", position: "relative",
        boxShadow: "0 10px 40px rgba(92,33,182,.35)",
        minHeight: 160,
      }} className="anim-fadeInUp">
        {/* Animated background blobs */}
        <div style={{ position: "absolute", top: -50, right: 200, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.06)", pointerEvents: "none", animation: "float 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -60, right: 80, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none", animation: "float 5s ease-in-out infinite .5s" }} />
        <div style={{ position: "absolute", top: 20, right: 420, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.08)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)",
            borderRadius: 99, padding: "4px 13px", marginBottom: 14,
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }} />
            <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.9)", fontWeight: 600 }}>{greeting}, {firstName}</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: "-0.8px", marginBottom: 8, lineHeight: 1.15 }}>
            Your campus, at your fingertips 🎓
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.72)", maxWidth: 380, lineHeight: 1.65, marginBottom: 22 }}>
            Find boardings, food & transport near <strong style={{ color: "#fff" }}>{user?.area || "campus"}</strong>.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/boardings" style={{ textDecoration: "none" }}>
              <button style={{
                background: "#fff", color: "#7C3AED",
                border: "none", borderRadius: 12, padding: "11px 22px",
                fontSize: 13.5, fontWeight: 800, cursor: "pointer",
                boxShadow: "0 4px 18px rgba(0,0,0,.18)", transition: "all .22s cubic-bezier(0.34,1.56,0.64,1)",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04) translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.22)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,.18)"; }}
              >
                Explore Boardings
              </button>
            </Link>
            <Link to="/submit" style={{ textDecoration: "none" }}>
              <button style={{
                background: "rgba(255,255,255,.16)", color: "#fff",
                border: "1.5px solid rgba(255,255,255,.32)", borderRadius: 12, padding: "11px 22px",
                fontSize: 13.5, fontWeight: 600, cursor: "pointer", transition: "all .2s",
                backdropFilter: "blur(8px)",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.26)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.16)"; }}
              >
                + Add Listing
              </button>
            </Link>
          </div>
        </div>

        {/* Hero stat chips */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 12 }}>
          {[
            { val: totalBoardings.length, lbl: "Boardings",  Icon: HouseIcon },
            { val: totalFood.length,      lbl: "Food Spots", Icon: FoodIcon  },
            { val: totalTransport.length, lbl: "Routes",     Icon: BusIcon   },
          ].map(({ val, lbl, Icon }, i) => (
            <div key={lbl} style={{
              background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)",
              borderRadius: 20, padding: "16px 20px", textAlign: "center",
              backdropFilter: "blur(12px)", minWidth: 90,
              animation: `fadeInUp .4s ${.1 + i * .08}s both`,
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <Icon size={20} color="rgba(255,255,255,.92)" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick categories ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: theme.textPrimary, letterSpacing: "-0.4px" }}>
            Explore
          </h2>
          <Link to="/map" style={{
            fontSize: 12.5, fontWeight: 600, color: theme.accent,
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 13px", borderRadius: 99,
            background: theme.accentBg, border: `1px solid ${theme.accentBorder}`,
            transition: "all .18s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentSoft; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = theme.accentBg; }}
          >
            <MapIcon size={13} color={theme.accent} /> View on map
          </Link>
        </div>
        <div className="responsive-grid stagger" style={{ gap: 14 }}>
          <CategoryCard to="/boardings" label="Boardings"    sub={`${totalBoardings.length} verified listings`} Icon={HouseIcon} accent="#7C3AED" bg="#F5F3FF" delay={0} />
          <CategoryCard to="/food"      label="Food & Dining" sub={`${totalFood.length} spots near campus`}    Icon={FoodIcon}  accent="#EA580C" bg="#FFF7ED" delay={.06} />
          <CategoryCard to="/transport" label="Transport"     sub={`${totalTransport.length} live routes`}     Icon={BusIcon}   accent="#16A34A" bg="#F0FDF4" delay={.12} />
        </div>
      </div>

      {/* ── Stat row ── */}
      <div className="responsive-grid stagger" style={{ gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Boardings" value={totalBoardings.length} sub="Available now" icon={HouseIcon} accent="#7C3AED" featured delay={0} />
        <StatCard label="Food Spots"      value={totalFood.length}      sub="Near campus"   icon={FoodIcon}  accent="#EA580C" delay={.06} />
        <StatCard label="Transport"       value={totalTransport.length} sub="Active routes" icon={BusIcon}   accent="#16A34A" delay={.12} />
        <StatCard label="Total Listings"  value={posts.length}          sub="All categories"icon={MapPinIcon} accent="#2563EB" delay={.18} />
      </div>

      {loading && <LoadingScreen message="Loading listings near you..." />}
      {error   && <ErrorBox message={error} onRetry={load} />}

      {!loading && (
        <div className="grid-2-cols">

          {/* Trending Boardings */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15.5, fontWeight: 800, color: theme.textPrimary, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 28, height: 28, borderRadius: 9, background: "#F5F3FF", border: "1.5px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUpIcon size={14} color="#7C3AED" />
                </span>
                Trending Boardings
              </h2>
              <Link to="/boardings" style={{
                fontSize: 12.5, fontWeight: 600, color: theme.accent, display: "flex", alignItems: "center", gap: 3,
              }}>
                See all <ChevronRightIcon size={13} color={theme.accent} />
              </Link>
            </div>
            <div className="responsive-grid stagger" style={{ gap: 12 }}>
              {displayBoardings.length > 0
                ? displayBoardings.map((b, i) => <ListingCard key={b._id} item={b} gradient={bGrads[i % 4]} type="boarding" theme={theme} />)
                : [0,1,2,3].map(i => <div key={i} style={{ height: 160, borderRadius: 18, background: bGrads[i], opacity: .4 }} className="skeleton" />)
              }
            </div>
          </div>

          {/* Trending Food */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15.5, fontWeight: 800, color: theme.textPrimary, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 28, height: 28, borderRadius: 9, background: "#FFF7ED", border: "1.5px solid #FED7AA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUpIcon size={14} color="#EA580C" />
                </span>
                Trending Food
              </h2>
              <Link to="/food" style={{ fontSize: 12.5, fontWeight: 600, color: theme.accent, display: "flex", alignItems: "center", gap: 3 }}>
                See all <ChevronRightIcon size={13} color={theme.accent} />
              </Link>
            </div>
            <div className="responsive-grid stagger" style={{ gap: 12 }}>
              {displayFood.length > 0
                ? displayFood.map((f, i) => <ListingCard key={f._id} item={f} gradient={fGrads[i % 4]} type="food" theme={theme} />)
                : [0,1,2,3].map(i => <div key={i} style={{ height: 160, borderRadius: 18, background: fGrads[i], opacity: .4 }} className="skeleton" />)
              }
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .anim-fadeInUp{animation:fadeInUp .4s cubic-bezier(.2,0,0,1) both}
        .stagger>*:nth-child(1){animation-delay:.04s}
        .stagger>*:nth-child(2){animation-delay:.09s}
        .stagger>*:nth-child(3){animation-delay:.14s}
        .stagger>*:nth-child(4){animation-delay:.19s}
      `}</style>
    </div>
  );
}
