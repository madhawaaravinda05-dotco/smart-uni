import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getActivePosts, reportPost, deletePost } from "../api/api";
import { PageHeader, EmptyState, LoadingScreen } from "../components/ui";
import { BusIcon, ClockIcon, MapPinIcon, SearchIcon, XIcon, FlagIcon } from "../components/Icons";
import { useToast } from "../components/Toast";

export default function Transport() {
  const { user } = useAuth();
  const { show, ToastEl } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleReport = async (id) => {
    const res = await reportPost(id);
    if (res.success) show("Thank you — this listing has been flagged for admin review.", "success");
    else show(res.message, "error");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this route?")) return;
    const res = await deletePost(id);
    if (res.success) {
      show("Route deleted successfully.", "success");
      setRoutes((prev) => prev.filter(p => p.id !== id));
      setExpanded(null);
    } else {
      show(res.message, "error");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getActivePosts(user?.university, "TRANSPORT");
      setLoading(false);
      if (res.success && res.data) {
        const mapped = res.data.map(p => ({
          id: p.id || p._id,
          name: p.title || p.routeNumber || "Unknown Route",
          from: p.fromLocation || p.area || "Unknown",
          to: p.toLocation || p.university || "Unknown",
          via: [], 
          departures: [], 
          lastBus: "N/A",
          frequency: "N/A",
          type: p.title?.toLowerCase().includes("train") ? "Train" : "Bus",
          description: p.description
        }));
        setRoutes(mapped);
      } else {
        setRoutes([]);
      }
    };
    load();
  }, [user]);

  const filtered = routes.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.from.toLowerCase().includes(search.toLowerCase()) && !r.to.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto">
      {ToastEl}
      <PageHeader title="Transport Timetables" subtitle="Verified bus and train schedules connecting to your campus" />

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-1 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <SearchIcon size={16} className="text-slate-400" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by route or destination..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground py-2.5 w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <XIcon size={14} />
            </button>
          )}
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {["Bus", "Train"].map((t) => (
            <button 
              key={t} 
              onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                typeFilter === t 
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm' 
                  : 'bg-card text-slate-500 border-border hover:border-emerald-300 hover:text-emerald-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingScreen message="Finding transport routes..." />}

      {!loading && filtered.length === 0 && (
        <EmptyState 
          icon={<BusIcon size={48} />} 
          title="No routes found" 
          description="Try a different search term or remove the type filter." 
          action={<button className="mt-4 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl font-bold hover:bg-emerald-100 transition-colors" onClick={() => { setSearch(""); setTypeFilter(""); }}>Clear filters</button>} 
        />
      )}

      {/* ── Route List ── */}
      {!loading && (
        <div className="flex flex-col gap-4">
          {filtered.map((r, i) => (
            <div 
              key={r.id} 
              className="glass-card rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-glass-hover animate-fadeInUp"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center ${r.type === "Train" ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}`}>
                  <BusIcon size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-base font-extrabold text-foreground truncate">{r.name}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${r.type === "Train" ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}`}>
                      {r.type}
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 text-[13px] text-slate-500 font-medium">
                    <MapPinIcon size={14} className="text-slate-400" />
                    <span>{r.from}</span>
                    <span className="text-slate-300 dark:text-slate-600">→</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{r.to}</span>
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col justify-between sm:items-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 mt-3 sm:mt-0">
                  <div className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5">
                    <ClockIcon size={14} className="text-slate-400" /> {r.frequency}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">Last bus: {r.lastBus}</div>
                </div>
                
                <div className="hidden sm:flex text-slate-300 dark:text-slate-600 shrink-0 ml-2">
                  <svg 
                    width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-300 ${expanded === r.id ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {expanded === r.id && (
                <div className="border-t border-border bg-slate-50/50 dark:bg-slate-900/20 p-5 sm:p-6 animate-slideDown">
                  <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                    {r.description}
                  </p>
                  
                  {/* Maps embed */}
                  <div className="mb-5 rounded-2xl overflow-hidden border border-border shadow-sm">
                    <iframe 
                      title="map"
                      width="100%" 
                      height="180" 
                      className="block"
                      loading="lazy" 
                      allowFullScreen 
                      referrerPolicy="no-referrer-when-downgrade" 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${r.from} to ${r.to}, ${user?.university || ""}`)}&t=m&z=13&output=embed&iwloc=near`}
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    {user && (user.isAdmin || user.role === "ROLE_MASTER_ADMIN") && (
                      <button onClick={() => handleDelete(r.id)} className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors text-sm">
                        <XIcon size={14} /> Delete
                      </button>
                    )}
                    <button onClick={() => handleReport(r.id)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors text-sm">
                      <FlagIcon size={14} /> Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
