import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getActivePosts, reportPost, deletePost } from "../api/api";
import { Card, Badge, Button, PageHeader, LoadingScreen, ErrorBox, EmptyState, Input, Select, StarRating } from "../components/ui";
import { HouseIcon, MapPinIcon, ShieldCheckIcon, FilterIcon, SearchIcon, FlagIcon, XIcon } from "../components/Icons";
import { useToast } from "../components/Toast";
import RatingModal from "../components/RatingModal";

const gradients = [
  "linear-gradient(135deg,#C4B5FD,#A78BFA)",
  "linear-gradient(135deg,#BFDBFE,#93C5FD)",
  "linear-gradient(135deg,#FEE2E2,#FECACA)",
  "linear-gradient(135deg,#D1FAE5,#6EE7B7)",
  "linear-gradient(135deg,#FDE68A,#FCD34D)",
  "linear-gradient(135deg,#FBCFE8,#F9A8D4)",
];

export default function Boardings() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { show, ToastEl } = useToast();

  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [filters,     setFilters]     = useState({ gender: "", kitchen: "", maxPrice: "", sortBy: "distance" });
  const [showFilters, setShowFilters] = useState(false);
  const [selected,    setSelected]    = useState(null);  // detail modal
  const [ratingPost,  setRatingPost]  = useState(null);  // rating modal
  const [ratingIdx,   setRatingIdx]   = useState(0);

  // Optimistic ratings map: postId → { rating, count }
  const [localRatings, setLocalRatings] = useState({});

  const load = async () => {
    setLoading(true); setError("");
    const res = await getActivePosts(user?.university, "BOARDING");
    setLoading(false);
    if (!res.success) { setPosts([]); return; }
    setPosts(res.data || []);
  };

  useEffect(() => { load(); }, []);

  const filtered = posts
    .filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.area?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.gender && p.genderType !== filters.gender) return false;
      if (filters.kitchen === "yes" && !p.hasKitchen) return false;
      if (filters.maxPrice && (p.price || 0) > Number(filters.maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === "price_asc")   return (a.price || 0) - (b.price || 0);
      if (filters.sortBy === "price_desc")  return (b.price || 0) - (a.price || 0);
      if (filters.sortBy === "rating")      return ((localRatings[b._id]?.avg || b.rating || 0)) - ((localRatings[a._id]?.avg || a.rating || 0));
      return (a.distance || 0) - (b.distance || 0);
    });

  const handleReport = async (id) => {
    const res = await reportPost(id);
    if (res.success) show("Thank you — this listing has been flagged for admin review.", "success");
    else show(res.message, "error");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    const res = await deletePost(id);
    if (res.success) {
      show("Listing deleted successfully.", "success");
      setPosts((prev) => prev.filter(p => p.id !== id && p._id !== id));
      setSelected(null);
    } else {
      show(res.message, "error");
    }
  };

  const handleRated = (post, { rating }) => {
    const id = post._id || post.id;
    setLocalRatings(prev => {
      const cur = prev[id] || { avg: post.rating || 0, count: post.reviews?.length || 0 };
      const newCount = cur.count + 1;
      const newAvg = ((cur.avg * cur.count) + rating) / newCount;
      return { ...prev, [id]: { avg: parseFloat(newAvg.toFixed(1)), count: newCount } };
    });
    show("Your rating has been submitted! 🌟", "success");
  };

  // Effective rating for a post
  const getRating = (p) => localRatings[p._id || p.id]?.avg || p.rating || 0;
  const getCount  = (p) => localRatings[p._id || p.id]?.count || p.reviews?.length || 0;

  return (
    <div>
      {ToastEl}

      <PageHeader
        title="Boardings near you"
        subtitle={`Showing verified listings around ${user?.area || "your campus"}`}
      />

      {/* ── Search + Filter Bar ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 8,
          background: theme.cardBg, border: `1.5px solid ${theme.inputBorder}`,
          borderRadius: 12, padding: "0 14px",
          boxShadow: theme.cardShadow,
        }}>
          <SearchIcon size={15} color={theme.textFaint} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or area..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, padding: "11px 0", background: "transparent", color: theme.textPrimary }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: theme.textFaint, display: "flex", padding: 2, cursor: "pointer" }}><XIcon size={13} /></button>}
        </div>
        <Button variant="secondary" size="md" onClick={() => setShowFilters(!showFilters)}>
          <FilterIcon size={14} /> Filters {showFilters ? "▲" : "▼"}
        </Button>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="responsive-grid" style={{
          background: theme.cardBg, borderRadius: 16, padding: "18px 20px", marginBottom: 20,
          border: `1px solid ${theme.cardBorder}`, gap: 14,
          boxShadow: theme.cardShadow,
          animation: "slideDown .2s ease both",
        }}>
          <Select label="Gender" value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            options={[{ value: "", label: "Any" }, { value: "Boys", label: "Boys only" }, { value: "Girls", label: "Girls only" }]} />
          <Select label="Kitchen" value={filters.kitchen} onChange={(e) => setFilters({ ...filters, kitchen: e.target.value })}
            options={[{ value: "", label: "Any" }, { value: "yes", label: "Has kitchen" }]} />
          <Input label="Max price (Rs.)" type="number" placeholder="e.g. 10000" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
          <Select label="Sort by" value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            options={[{ value: "distance", label: "Distance" }, { value: "rating", label: "Highest Rated" }, { value: "price_asc", label: "Price: Low → High" }, { value: "price_desc", label: "Price: High → Low" }]} />
        </div>
      )}

      {loading && <LoadingScreen message="Finding boardings near you..." />}
      {error   && <ErrorBox message={error} onRetry={load} />}

      {!loading && filtered.length === 0 && (
        <EmptyState icon={<HouseIcon size={48} />}
          title="No boardings found"
          description="Try adjusting your filters or search terms."
          action={<Button variant="secondary" onClick={() => { setSearch(""); setFilters({ gender: "", kitchen: "", maxPrice: "", sortBy: "distance" }); }}>Clear filters</Button>}
        />
      )}

      {/* ── Cards Grid ── */}
      {!loading && (
        <div className="responsive-grid" style={{ gap: 16 }}>
          {filtered.map((b, i) => {
            const grad = gradients[i % gradients.length];
            const rating = getRating(b);
            const count  = getCount(b);
            return (
              <div
                key={b._id}
                style={{
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.cardBorder}`,
                  borderRadius: 20, overflow: "hidden",
                  boxShadow: theme.cardShadow,
                  transition: "all 0.24s cubic-bezier(0.34,1.56,0.64,1)",
                  cursor: "pointer",
                  animation: `fadeInUp .35s ${.04 * (i % 6)}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = theme.cardShadowHover; e.currentTarget.style.borderColor = theme.cardBorderHover; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = theme.cardShadow; e.currentTarget.style.borderColor = theme.cardBorder; }}
                onClick={() => setSelected(b)}
              >
                {/* Gradient/Image header */}
                <div style={{ height: 130, background: grad, position: "relative", overflow: "hidden" }}>
                  {b.images && b.images.length > 0 ? (
                    <img src={b.images[0]} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                        <HouseIcon size={32} color="white" />
                      </div>
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), transparent 40%, rgba(0,0,0,0.5))" }} />
                  
                  <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,.9)", backdropFilter: "blur(6px)", fontSize: 9.5, fontWeight: 700, color: "#4C1D95", padding: "3px 9px", borderRadius: 99 }}>
                    {b.genderType || "Mixed"}
                  </span>
                  {b.verified && (
                    <span style={{ position: "absolute", top: 10, right: 10, background: "linear-gradient(135deg,#16A34A,#22C55E)", color: "white", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 99, display: "flex", alignItems: "center", gap: 3 }}>
                      <ShieldCheckIcon size={9} color="white" /> Verified
                    </span>
                  )}
                  {/* Rating badge on image */}
                  {rating > 0 && (
                    <div style={{
                      position: "absolute", bottom: 10, right: 10,
                      background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)",
                      borderRadius: 99, padding: "3px 9px",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{Number(rating).toFixed(1)}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,.7)" }}>({count})</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.textPrimary, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: theme.accent }}>
                      Rs. {(b.price || 0).toLocaleString()}
                      <span style={{ fontSize: 10.5, fontWeight: 500, color: theme.textFaint }}>/mo</span>
                    </span>
                    <span style={{ fontSize: 11, color: theme.textFaint, display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPinIcon size={11} color={theme.textFaint} />{b.distance} km
                    </span>
                  </div>

                  {/* Tags row */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                    {b.hasKitchen && <span style={{ fontSize: 9.5, fontWeight: 600, background: "#F0FDF4", color: "#15803D", padding: "2px 8px", borderRadius: 99 }}>Kitchen</span>}
                    <span style={{ fontSize: 9.5, fontWeight: 600, background: theme.accentBg, color: theme.accent, padding: "2px 8px", borderRadius: 99 }}>{b.area}</span>
                  </div>

                  {/* ⭐ Rate button */}
                  <button
                    onClick={e => { e.stopPropagation(); setRatingPost(b); setRatingIdx(i); }}
                    style={{
                      width: "100%", padding: "8px 0",
                      border: `1.5px solid ${theme.accentBorder}`,
                      borderRadius: 10, background: theme.accentBg,
                      color: theme.accent, fontSize: 12.5, fontWeight: 700,
                      cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 6,
                      transition: "all .18s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = theme.accentSoft; e.currentTarget.style.borderColor = theme.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.background = theme.accentBg; e.currentTarget.style.borderColor = theme.accentBorder; }}
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {rating > 0 ? `${Number(rating).toFixed(1)} · Rate & Reviews` : "Rate this listing"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <>
          {/* Decoupled Background Overlay to prevent Chrome scrolling bugs */}
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", zIndex: 100 }} />
          
          {/* Scrollable Container (Block layout, no flexbox vertical centering bugs) */}
          <div style={{ position: "fixed", inset: 0, zIndex: 101, overflowY: "auto", padding: "40px 24px" }}
            onClick={() => setSelected(null)}>
            
            {/* The Modal */}
            <div style={{ margin: "0 auto", background: theme.cardBg, borderRadius: 24, maxWidth: 520, width: "100%", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.25)", border: `1px solid ${theme.cardBorder}`, position: "relative" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ height: 180, background: gradients[0], position: "relative", overflow: "hidden", flexShrink: 0 }}>
              {selected.images && selected.images.length > 0 ? (
                <img src={selected.images[0]} alt={selected.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <HouseIcon size={40} color="white" />
                  </div>
                </div>
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6))" }} />
              
              {getRating(selected) > 0 && (
                <div style={{ position: "absolute", bottom: 12, right: 14, background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)", borderRadius: 99, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{Number(getRating(selected)).toFixed(1)}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>({getCount(selected)} reviews)</span>
                </div>
              )}
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: theme.textPrimary, maxWidth: "80%" }}>{selected.title}</h2>
                <button onClick={() => setSelected(null)} style={{ background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: 9, padding: 7, cursor: "pointer", color: theme.accent }}><XIcon size={15} /></button>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: theme.accent, marginBottom: 12 }}>
                Rs. {(selected.price || 0).toLocaleString()}
                <span style={{ fontSize: 13, fontWeight: 500, color: theme.textFaint }}>/month</span>
              </div>
              <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {selected.verified && <span style={{ fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: "#15803D", padding: "4px 10px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4 }}><ShieldCheckIcon size={11} /> Verified</span>}
                <span style={{ fontSize: 11, fontWeight: 600, background: theme.accentBg, color: theme.accent, padding: "4px 10px", borderRadius: 99 }}>{selected.genderType}</span>
                {selected.hasKitchen && <span style={{ fontSize: 11, fontWeight: 600, background: "#F0FDF4", color: "#15803D", padding: "4px 10px", borderRadius: 99 }}>Kitchen included</span>}
                <span style={{ fontSize: 11, fontWeight: 600, background: theme.accentBg, color: theme.textMuted, padding: "4px 10px", borderRadius: 99, display: "flex", alignItems: "center", gap: 3 }}><MapPinIcon size={10} color={theme.textMuted} />{selected.area}</span>
              </div>

              {/* Maps embed */}
              <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: `1px solid ${theme.cardBorder}` }}>
                <iframe 
                  title="map"
                  width="100%" 
                  height="160" 
                  style={{ border: 0, display: "block" }} 
                  loading="lazy" 
                  allowFullScreen 
                  referrerPolicy="no-referrer-when-downgrade" 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${selected.title}, ${selected.area}, ${user?.university || ""}`)}&t=m&z=15&output=embed&iwloc=near`}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <a href={`tel:${selected.contact}`} style={{ flex: 1, textDecoration: "none" }}>
                  <Button fullWidth>Contact Landlord</Button>
                </a>
                <Button variant="secondary" onClick={() => { setRatingPost(selected); setSelected(null); }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  Rate
                </Button>
                {user && (user.isAdmin || user.role === "ROLE_MASTER_ADMIN") && (
                  <Button variant="danger" onClick={() => handleDelete(selected.id || selected._id)}>
                    <XIcon size={13} /> Delete
                  </Button>
                )}
                <Button variant="secondary" onClick={() => { handleReport(selected.id || selected._id); setSelected(null); }}>
                  <FlagIcon size={13} /> Report
                </Button>
              </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Rating Modal ── */}
      {ratingPost && (
        <RatingModal
          post={ratingPost}
          gradient={gradients[ratingIdx % gradients.length]}
          onClose={() => setRatingPost(null)}
          onRated={(data) => { handleRated(ratingPost, data); setRatingPost(null); }}
        />
      )}

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
