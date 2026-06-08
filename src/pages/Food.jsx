import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getActivePosts, reportPost, deletePost } from "../api/api";
import { Button, PageHeader, LoadingScreen, ErrorBox, EmptyState, StarRating } from "../components/ui";
import { FoodIcon, MapPinIcon, SearchIcon, XIcon, FlagIcon } from "../components/Icons";
import { useToast } from "../components/Toast";
import RatingModal from "../components/RatingModal";

const foodGradients = [
  "linear-gradient(135deg,#BBF7D0,#6EE7B7)",
  "linear-gradient(135deg,#FED7AA,#FDBA74)",
  "linear-gradient(135deg,#FDE68A,#FCD34D)",
  "linear-gradient(135deg,#FBCFE8,#F9A8D4)",
  "linear-gradient(135deg,#BAE6FD,#7DD3FC)",
  "linear-gradient(135deg,#E9D5FF,#C4B5FD)",
];

export default function Food() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { show, ToastEl } = useToast();

  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterTag,  setFilterTag]  = useState("");
  const [sortBy,     setSortBy]     = useState("rating");
  const [selected,   setSelected]   = useState(null);
  const [ratingPost, setRatingPost] = useState(null);
  const [ratingIdx,  setRatingIdx]  = useState(0);

  // Optimistic local ratings map
  const [localRatings, setLocalRatings] = useState({});

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getActivePosts(user?.university, "FOOD");
      setLoading(false);
      setPosts(res.success && res.data ? res.data : []);
    };
    load();
  }, []);

  const allTags = ["Vegetarian", "Veg-Only", "Non-Veg"];

  const filtered = posts
    .filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterTag && !(p.tags || []).includes(filterTag)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (getRating(b)) - (getRating(a));
      return a.title.localeCompare(b.title);
    });

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

  function getRating(p) { return localRatings[p._id || p.id]?.avg || p.rating || 0; }
  function getCount(p)  { return localRatings[p._id || p.id]?.count || p.reviews?.length || 0; }

  return (
    <div>
      {ToastEl}
      <PageHeader
        title="Food & Dining near campus"
        subtitle={`Local restaurants and food stalls around ${user?.area || "your campus"}`}
      />

      {/* ── Search + Tags ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 8,
          background: theme.cardBg, border: `1.5px solid ${theme.inputBorder}`,
          borderRadius: 12, padding: "0 14px", boxShadow: theme.cardShadow,
        }}>
          <SearchIcon size={15} color={theme.textFaint} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food spots..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, padding: "11px 0", background: "transparent", color: theme.textPrimary }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: theme.textFaint, display: "flex", cursor: "pointer" }}><XIcon size={13} /></button>}
        </div>

        {/* Tag pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {allTags.map((t) => (
            <button key={t} onClick={() => setFilterTag(filterTag === t ? "" : t)}
              style={{
                padding: "7px 14px", borderRadius: 99,
                border: `1.5px solid ${filterTag === t ? "#EA580C" : theme.inputBorder}`,
                background: filterTag === t ? "#FFF7ED" : theme.cardBg,
                fontSize: 11.5, fontWeight: 600,
                color: filterTag === t ? "#EA580C" : theme.textMuted,
                cursor: "pointer", transition: "all .15s",
              }}>
              {t}
            </button>
          ))}
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "10px 14px", borderRadius: 12,
            border: `1.5px solid ${theme.inputBorder}`,
            fontSize: 12.5, background: theme.cardBg,
            color: theme.textMuted, cursor: "pointer", outline: "none",
          }}>
          <option value="rating">Highest Rated</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {loading && <LoadingScreen message="Finding food spots near you..." />}

      {!loading && filtered.length === 0 && (
        <EmptyState icon={<FoodIcon size={48} />}
          title="No food spots found"
          description="Try removing your filters or searching a different keyword."
          action={<Button variant="secondary" onClick={() => { setSearch(""); setFilterTag(""); }}>Clear search</Button>}
        />
      )}

      {/* ── Cards Grid ── */}
      {!loading && (
        <div className="responsive-grid" style={{ gap: 16 }}>
          {filtered.map((f, i) => {
            const grad   = foodGradients[i % foodGradients.length];
            const rating = getRating(f);
            const count  = getCount(f);
            return (
              <div key={f._id}
                style={{
                  background: theme.cardBg, border: `1.5px solid ${theme.cardBorder}`,
                  borderRadius: 20, overflow: "hidden",
                  boxShadow: theme.cardShadow,
                  transition: "all 0.24s cubic-bezier(0.34,1.56,0.64,1)",
                  cursor: "pointer",
                  animation: `fadeInUp .35s ${.04 * (i % 6)}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = theme.cardShadowHover; e.currentTarget.style.borderColor = theme.cardBorderHover; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = theme.cardShadow; e.currentTarget.style.borderColor = theme.cardBorder; }}
                onClick={() => setSelected(f)}
              >
                {/* Header */}
                <div style={{ height: 120, background: grad, position: "relative", overflow: "hidden" }}>
                  {f.images && f.images.length > 0 ? (
                    <img src={f.images[0]} alt={f.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                        <FoodIcon size={32} color="white" />
                      </div>
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))" }} />
                  
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
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.textPrimary, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}</div>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 7 }}>
                    {(f.tags || []).map((t) => (
                      <span key={t} style={{ fontSize: 9.5, fontWeight: 600, background: "#F0FDF4", color: "#15803D", padding: "2px 8px", borderRadius: 99 }}>{t}</span>
                    ))}
                  </div>

                  {/* Rating row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <StarRating rating={rating} size={13} />
                    <span style={{ fontSize: 11, color: theme.textFaint, fontWeight: 500 }}>{f.priceRange}</span>
                  </div>

                  <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 10, display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPinIcon size={10} color={theme.textFaint} />{f.area}
                  </div>

                  {/* Rate button */}
                  <button
                    onClick={e => { e.stopPropagation(); setRatingPost(f); setRatingIdx(i); }}
                    style={{
                      width: "100%", padding: "8px 0",
                      border: "1.5px solid #FED7AA", borderRadius: 10,
                      background: "#FFF7ED", color: "#EA580C",
                      fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "all .18s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#FFEDD5"; e.currentTarget.style.borderColor = "#EA580C"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#FFF7ED"; e.currentTarget.style.borderColor = "#FED7AA"; }}
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {rating > 0 ? `${Number(rating).toFixed(1)} · Rate & Reviews` : "Rate this place"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: theme.cardBg, borderRadius: 24, maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.25)", border: `1px solid ${theme.cardBorder}` }}
            onClick={e => e.stopPropagation()}>
            <div style={{ height: 160, background: foodGradients[0], position: "relative", overflow: "hidden" }}>
              {selected.images && selected.images.length > 0 ? (
                <img src={selected.images[0]} alt={selected.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <FoodIcon size={40} color="white" />
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
                <h2 style={{ fontSize: 17, fontWeight: 800, color: theme.textPrimary }}>{selected.title}</h2>
                <button onClick={() => setSelected(null)} style={{ background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, borderRadius: 9, padding: 7, cursor: "pointer", color: theme.accent }}><XIcon size={15} /></button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <StarRating rating={getRating(selected)} size={16} />
                <span style={{ fontSize: 12, color: theme.textFaint, marginLeft: 8 }}>({getCount(selected)} reviews)</span>
              </div>
              <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7, margin: "12px 0" }}>{selected.description}</p>
              <div className="grid-2-cols" style={{ gap: 10, marginBottom: 20 }}>
                {[["Price Range", selected.priceRange], ["Open Hours", selected.openHours], ["Area", selected.area], ["Dietary", (selected.tags || []).join(", ")]].map(([k, v]) => (
                  <div key={k} style={{ background: theme.accentBg, borderRadius: 12, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10.5, color: theme.textFaint, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.textPrimary }}>{v}</div>
                  </div>
                ))}
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
                <button onClick={() => { setRatingPost(selected); setSelected(null); }}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#7C3AED,#9333EA)", color: "#fff",
                    fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: "0 6px 20px rgba(124,58,237,.35)",
                  }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  Rate & Reviews
                </button>
                <Button variant="secondary" onClick={() => { handleReport(selected.id || selected._id); setSelected(null); }}>
                  <FlagIcon size={13} /> Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rating Modal ── */}
      {ratingPost && (
        <RatingModal
          post={ratingPost}
          gradient={foodGradients[ratingIdx % foodGradients.length]}
          onClose={() => setRatingPost(null)}
          onRated={(data) => { handleRated(ratingPost, data); setRatingPost(null); }}
        />
      )}

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
