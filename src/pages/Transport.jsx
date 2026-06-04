import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getActivePosts, reportPost, deletePost } from "../api/api";
import { Card, PageHeader, EmptyState, Button, LoadingScreen } from "../components/ui";
import { BusIcon, ClockIcon, MapPinIcon, SearchIcon, XIcon, FlagIcon } from "../components/Icons";

export default function Transport() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleReport = async (id) => {
    const res = await reportPost(id);
    if (res.success) alert("Thank you — this listing has been flagged for admin review.");
    else alert(res.message);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this route?")) return;
    const res = await deletePost(id);
    if (res.success) {
      alert("Route deleted successfully.");
      setRoutes((prev) => prev.filter(p => p.id !== id));
      setExpanded(null);
    } else {
      alert(res.message);
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
    <div>
      <PageHeader title="Transport Timetables" subtitle="Verified bus and train schedules connecting to your campus" />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "0 14px" }}>
          <SearchIcon size={15} color="#94A3B8" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by route or destination..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, padding: "10px 0", background: "transparent", color: "#0F172A" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><XIcon size={13} /></button>}
        </div>
        {["Bus", "Train"].map((t) => (
          <button key={t} onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
            style={{ padding: "8px 18px", borderRadius: 20, border: `1.5px solid ${typeFilter === t ? "#2563EB" : "#E2E8F0"}`, background: typeFilter === t ? "#EFF6FF" : "#fff", fontSize: 12, fontWeight: 600, color: typeFilter === t ? "#2563EB" : "#64748B", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {loading && <LoadingScreen message="Finding transport routes..." />}

      {!loading && filtered.length === 0 && (
        <EmptyState icon={<BusIcon size={48} />} title="No routes found" description="Try a different search term or remove the type filter." action={<Button variant="secondary" onClick={() => { setSearch(""); setTypeFilter(""); }}>Clear filters</Button>} />
      )}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => (
            <Card key={r.id} style={{ overflow: "hidden" }}>
              <div
                style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div style={{ width: 44, height: 44, background: r.type === "Train" ? "#EFF6FF" : "#FFF7ED", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: r.type === "Train" ? "#2563EB" : "#EA580C", flexShrink: 0 }}>
                  <BusIcon size={20} color={r.type === "Train" ? "#2563EB" : "#EA580C"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{r.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, background: r.type === "Train" ? "#EFF6FF" : "#FFF7ED", color: r.type === "Train" ? "#1E40AF" : "#9A3412", padding: "2px 8px", borderRadius: 20 }}>{r.type}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}>
                    <MapPinIcon size={12} color="#94A3B8" />
                    <span>{r.from}</span>
                    <span style={{ color: "#CBD5E1" }}>→</span>
                    <span style={{ fontWeight: 600, color: "#334155" }}>{r.to}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <ClockIcon size={12} color="#94A3B8" /> {r.frequency}
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Last bus: {r.lastBus}</div>
                </div>
                <div style={{ color: "#CBD5E1", fontSize: 16 }}>{expanded === r.id ? "▲" : "▼"}</div>
              </div>

              {expanded === r.id && (
                <div style={{ borderTop: "1px solid #F1F5F9", padding: "16px 20px 20px", background: "#FAFBFC" }}>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>{r.description}</p>
                  
                  {/* Maps embed */}
                  <div style={{ marginBottom: 16, borderRadius: 10, overflow: "hidden", border: `1px solid #E2E8F0` }}>
                    <iframe 
                      title="map"
                      width="100%" 
                      height="160" 
                      style={{ border: 0, display: "block" }} 
                      loading="lazy" 
                      allowFullScreen 
                      referrerPolicy="no-referrer-when-downgrade" 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${r.from} to ${r.to}, ${user?.university || ""}`)}&t=m&z=13&output=embed&iwloc=near`}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    {user && (user.isAdmin || user.role === "ROLE_MASTER_ADMIN") && (
                      <Button variant="danger" size="sm" onClick={() => handleDelete(r.id)}>
                        <XIcon size={12} /> Delete
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => handleReport(r.id)}>
                      <FlagIcon size={12} /> Report
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
