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
function StatCard({ label, value, sub, icon: Icon, accentClass, iconBgClass, featured = false, delayClass = "" }) {
  return (
    <div className={`relative group p-5 rounded-[20px] transition-all duration-300 hover:-translate-y-1 ${featured ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-primary-500/30' : 'bg-card border border-border hover:shadow-glass-hover'} ${delayClass} animate-fadeInUp`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${featured ? 'bg-white/20 text-white' : iconBgClass}`}>
        <Icon size={24} className={featured ? 'text-white' : accentClass} />
      </div>
      <div className={`text-3xl font-black tracking-tight leading-none mb-1.5 ${featured ? 'text-white' : accentClass}`}>
        {value}
      </div>
      <div className={`text-sm font-bold ${featured ? 'text-white/90' : 'text-slate-700 dark:text-slate-200'}`}>
        {label}
      </div>
      {sub && <div className={`text-xs mt-1 ${featured ? 'text-white/60' : 'text-slate-500'}`}>{sub}</div>}
    </div>
  );
}

/* ─── Category card ──────────────────────────────────────────────────────────── */
function CategoryCard({ to, label, sub, Icon, accentClass, bgClass, hoverBorderClass, delayClass = "" }) {
  return (
    <Link to={to} className={`block group animate-fadeInUp ${delayClass}`}>
      <div className={`bg-card border border-border rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover ${hoverBorderClass}`}>
        <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${bgClass}`}>
          <Icon size={24} className={accentClass} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-extrabold text-slate-900 dark:text-slate-100 truncate">{label}</div>
          <div className="text-xs text-slate-500 mt-0.5 truncate">{sub}</div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
          <ChevronRightIcon size={14} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
        </div>
      </div>
    </Link>
  );
}

/* ─── Listing mini card ──────────────────────────────────────────────────────── */
function ListingCard({ item, gradientClass, type }) {
  return (
    <div className="bg-card border border-border rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glass-hover hover:border-primary-300 dark:hover:border-primary-700 group cursor-pointer">
      <div className={`h-24 relative overflow-hidden ${gradientClass}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {item.genderType && (
          <span className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[9.5px] font-black text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {item.genderType}
          </span>
        )}
        {(item.verified || item.status === "APPROVED") && (
          <span className="absolute top-2.5 right-2.5 bg-gradient-to-br from-green-500 to-green-600 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-[0_2px_8px_rgba(22,163,74,0.4)]">
            <ShieldCheckIcon size={10} className="text-white" /> Verified
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 truncate">
          {item.title}
        </div>
        {type === "boarding" ? (
          <div className="flex justify-between items-center">
            <span className="text-sm font-black text-primary-600 dark:text-primary-400">
              Rs. {(item.price || 8500).toLocaleString()}
              <span className="text-[10px] font-medium text-slate-500">/mo</span>
            </span>
            <span className="text-[10.5px] text-slate-500 flex items-center gap-1">
              <MapPinIcon size={11} className="text-slate-400" />{item.distance || "< 1 km"}
            </span>
          </div>
        ) : (
          <>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {(item.tags || []).slice(0,3).map((t) => (
                <span key={t} className="text-[9.5px] font-bold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">{t}</span>
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
    "bg-gradient-to-br from-primary-200 to-primary-300",
    "bg-gradient-to-br from-cyan-300 to-cyan-400",
    "bg-gradient-to-br from-cyan-200 to-cyan-300",
    "bg-gradient-to-br from-teal-200 to-teal-300",
  ];
  const fGrads = [
    "bg-gradient-to-br from-green-200 to-green-300",
    "bg-gradient-to-br from-orange-200 to-orange-300",
    "bg-gradient-to-br from-amber-200 to-amber-300",
    "bg-gradient-to-br from-pink-200 to-pink-300",
  ];

  const firstName = user?.name?.split(" ")[0] || "Student";
  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 shadow-2xl min-h-[200px] mb-8 animate-fadeInUp p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Animated background blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-500/20 blur-3xl mix-blend-screen animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute -bottom-32 left-10 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl mix-blend-screen animate-[float_8s_ease-in-out_infinite]" />

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
            <span className="text-[11px] font-bold text-white/90 uppercase tracking-wide">{greeting}, {firstName}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            Your campus, at your fingertips 🎓
          </h1>
          <p className="text-sm md:text-base text-white/70 leading-relaxed mb-6 max-w-[380px]">
            Find boardings, food & transport near <strong className="text-white">{user?.area || "campus"}</strong>.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/boardings">
              <button className="bg-white text-slate-900 hover:bg-slate-50 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)]">
                Explore Boardings
              </button>
            </Link>
            <Link to="/submit">
              <button className="bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-300">
                + Add Listing
              </button>
            </Link>
          </div>
        </div>

        {/* Hero stat chips */}
        <div className="relative z-10 flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar snap-x">
          {[
            { val: totalBoardings.length, lbl: "Boardings",  Icon: HouseIcon },
            { val: totalFood.length,      lbl: "Food Spots", Icon: FoodIcon  },
            { val: totalTransport.length, lbl: "Routes",     Icon: BusIcon   },
          ].map(({ val, lbl, Icon }, i) => (
            <div key={lbl} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-5 text-center min-w-[100px] snap-center shrink-0 animate-slideDown" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
              <div className="flex justify-center mb-2.5">
                <Icon size={22} className="text-white/90" />
              </div>
              <div className="text-2xl font-black text-white leading-none">{val}</div>
              <div className="text-[11px] text-white/60 font-semibold mt-1.5">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick categories ── */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Explore</h2>
          <Link to="/map" className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-full px-3.5 py-1.5 flex items-center gap-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
            <MapIcon size={14} className="text-primary-600 dark:text-primary-400" /> View on map
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CategoryCard to="/boardings" label="Boardings"    sub={`${totalBoardings.length} verified listings`} Icon={HouseIcon} accentClass="text-primary-500" bgClass="bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800" hoverBorderClass="hover:border-primary-400" delayClass="delay-[0ms]" />
          <CategoryCard to="/food"      label="Food & Dining" sub={`${totalFood.length} spots near campus`}    Icon={FoodIcon}  accentClass="text-orange-500" bgClass="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800" hoverBorderClass="hover:border-orange-400" delayClass="delay-[75ms]" />
          <CategoryCard to="/transport" label="Transport"     sub={`${totalTransport.length} live routes`}     Icon={BusIcon}   accentClass="text-green-500" bgClass="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800" hoverBorderClass="hover:border-green-400" delayClass="delay-[150ms]" />
        </div>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Boardings" value={totalBoardings.length} sub="Available now" icon={HouseIcon} accentClass="text-primary-600" iconBgClass="bg-primary-50 dark:bg-primary-900/30 border-primary-200" featured delayClass="delay-[0ms]" />
        <StatCard label="Food Spots"      value={totalFood.length}      sub="Near campus"   icon={FoodIcon}  accentClass="text-orange-500" iconBgClass="bg-orange-50 dark:bg-orange-900/30 border-orange-200" delayClass="delay-[75ms]" />
        <StatCard label="Transport"       value={totalTransport.length} sub="Active routes" icon={BusIcon}   accentClass="text-green-600" iconBgClass="bg-green-50 dark:bg-green-900/30 border-green-200" delayClass="delay-[150ms]" />
        <StatCard label="Total Listings"  value={posts.length}          sub="All categories"icon={MapPinIcon} accentClass="text-blue-500" iconBgClass="bg-blue-50 dark:bg-blue-900/30 border-blue-200" delayClass="delay-[225ms]" />
      </div>

      {loading && <LoadingScreen message="Loading listings near you..." />}
      {error   && <ErrorBox message={error} onRetry={load} />}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Boardings */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
                  <TrendingUpIcon size={16} className="text-primary-600 dark:text-primary-400" />
                </span>
                Trending Boardings
              </h2>
              <Link to="/boardings" className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                See all <ChevronRightIcon size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {displayBoardings.length > 0
                ? displayBoardings.map((b, i) => <ListingCard key={b._id} item={b} gradientClass={bGrads[i % 4]} type="boarding" />)
                : [0,1,2,3].map(i => <div key={i} className={`h-40 rounded-[20px] opacity-40 animate-pulse ${bGrads[i]}`} />)
              }
            </div>
          </div>

          {/* Trending Food */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 flex items-center justify-center">
                  <TrendingUpIcon size={16} className="text-orange-500 dark:text-orange-400" />
                </span>
                Trending Food
              </h2>
              <Link to="/food" className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                See all <ChevronRightIcon size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {displayFood.length > 0
                ? displayFood.map((f, i) => <ListingCard key={f._id} item={f} gradientClass={fGrads[i % 4]} type="food" />)
                : [0,1,2,3].map(i => <div key={i} className={`h-40 rounded-[20px] opacity-40 animate-pulse ${fGrads[i]}`} />)
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
