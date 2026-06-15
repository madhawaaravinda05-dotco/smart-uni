import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getActivePosts } from "../api/api";
import { PageHeader, Card, Button, Badge, LoadingScreen, ErrorBox } from "../components/ui";
import MapPicker from "../components/MapPicker";
import { MapIcon, ListIcon, MapPinIcon, HouseIcon, FoodIcon, BusIcon, ShieldCheckIcon, SearchIcon, XIcon, FilterIcon } from "../components/Icons";

// ─── University centre coordinates ───────────────────────────────────────────
const UNI_CENTERS = {
  "University of Moratuwa":                        [6.7955, 79.9012],
  "University of Colombo":                         [6.9022, 79.8607],
  "University of Kelaniya":                        [7.0013, 79.9207],
  "University of Peradeniya":                      [7.2545, 80.5954],
  "University of Sri Jayewardenepura":             [6.8719, 79.8989],
  "University of Jaffna":                          [9.6615, 80.0255],
  "University of Ruhuna":                          [5.9485, 80.5376],
  "Eastern University Sri Lanka":                  [7.7102, 81.6924],
  "South Eastern University of Sri Lanka":         [7.3002, 81.6774],
  "Rajarata University of Sri Lanka":              [8.3467, 80.5135],
  "Sabaragamuwa University of Sri Lanka":          [6.7341, 80.3615],
  "Wayamba University of Sri Lanka":               [7.4748, 80.0437],
  "Uva Wellassa University":                       [6.9938, 81.0532],
  "Open University of Sri Lanka":                  [6.8720, 79.8988],
  "General Sir John Kotelawala Defence University":[6.8216, 79.9760],
  "SLIIT":                                         [6.9147, 79.9729],
  "NSBM Green University":                         [6.8290, 80.0370],
  "APIIT Sri Lanka":                               [6.9108, 79.8477],
  "Informatics Institute of Technology":           [6.8869, 79.8615],
  "CINEC Campus":                                  [6.9147, 79.9729],
  "Horizon Campus":                                [6.9147, 79.9729],
  "ICBT Campus":                                   [6.9147, 79.8477],
  "NIBM":                                          [6.9147, 79.8477],
  default:                                         [6.7955, 79.9012],
};



const TYPE_COLORS = { BOARDING: "#2563EB", FOOD: "#EA580C", TRANSPORT: "#16A34A" };
const TYPE_LABELS = { BOARDING: "Boarding", FOOD: "Food Spot", TRANSPORT: "Transport" };
const TYPE_ICONS  = { BOARDING: HouseIcon,  FOOD: FoodIcon,   TRANSPORT: BusIcon };

export default function MapView() {
  const { user } = useAuth();
  const [view, setView]               = useState("map");
  const [activeType, setActiveType]   = useState("");
  const [search, setSearch]           = useState("");
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [selectedPin, setSelectedPin] = useState(null);

  // Get map centre from user's university
  const mapCenter = UNI_CENTERS[user?.university] || UNI_CENTERS.default;

  // Load real posts, fall back to demo
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getActivePosts(user?.university);
      setLoading(false);
      if (res.success && res.data?.length > 0) {
        // Transform API posts to marker format (they need lat/lng from location field)
        const mapped = res.data
          .filter((p) => p.location?.latitude && p.location?.longitude)
          .map((p) => ({
            id: p._id,
            type: p.category,
            label: p.title,
            price: p.price ? `Rs. ${Number(p.price).toLocaleString()}/mo` : p.priceRange || null,
            lat: p.location.latitude,
            lng: p.location.longitude,
            verified: p.status === "APPROVED",
            distance: null,
          }));
        setPosts(mapped);
      } else {
        setPosts([]);
      }
    };
    load();
  }, [user?.university]);

  // Filter markers
  const filtered = posts.filter((p) => {
    if (activeType && p.type !== activeType) return false;
    if (search && !p.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    BOARDING:  posts.filter((p) => p.type === "BOARDING").length,
    FOOD:      posts.filter((p) => p.type === "FOOD").length,
    TRANSPORT: posts.filter((p) => p.type === "TRANSPORT").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      {/* ── Header ── */}
      <PageHeader
        title="Campus Map"
        subtitle={`Live listings around ${user?.area || "your campus"} · ${filtered.length} showing`}
        action={
          <div style={{ display: "flex", gap: 6, background: "#F1F5F9", borderRadius: 10, padding: 3 }}>
            {[{ v: "map", label: "Map", Icon: MapIcon }, { v: "list", label: "List", Icon: ListIcon }].map(({ v, label, Icon }) => (
              <button key={v} onClick={() => setView(v)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "none", background: view === v ? "#fff" : "transparent", color: view === v ? "#0F172A" : "#64748B", fontWeight: 600, fontSize: 12.5, cursor: "pointer", boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        }
      />

      {/* ── Search + Filter toolbar ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search box */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "0 14px" }}>
          <SearchIcon size={14} color="#94A3B8" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings on map..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, padding: "9px 0", background: "transparent", color: "#0F172A" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#94A3B8", display: "flex", cursor: "pointer" }}><XIcon size={13} /></button>}
        </div>

        {/* Type filters */}
        {Object.entries(TYPE_LABELS).map(([type, label]) => {
          const Icon = TYPE_ICONS[type];
          const color = TYPE_COLORS[type];
          const active = activeType === type;
          return (
            <button key={type} onClick={() => setActiveType(active ? "" : type)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${active ? color : "#E2E8F0"}`, background: active ? color + "14" : "#fff", color: active ? color : "#64748B", fontWeight: 600, fontSize: 12.5, cursor: "pointer", transition: "all 0.18s" }}>
              <Icon size={13} color={active ? color : "#94A3B8"} />
              {label}
              <span style={{ fontSize: 10.5, background: active ? color + "25" : "#F1F5F9", color: active ? color : "#94A3B8", padding: "1px 7px", borderRadius: 99, fontWeight: 700 }}>
                {counts[type]}
              </span>
            </button>
          );
        })}
        {activeType && (
          <button onClick={() => setActiveType("")}
            style={{ padding: "8px 14px", borderRadius: 20, border: "1.5px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            Clear
          </button>
        )}
      </div>

      {loading && <LoadingScreen message="Loading listings near you..." />}
      {error && <ErrorBox message={error} />}

      {!loading && view === "map" && (
        <div className="grid-map" style={{ gap: 14, flex: 1, minHeight: 0 }}>

          {/* ── Real Map ── */}
          <div style={{ minWidth: 0, borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0" }}>
            <MapPicker
              center={mapCenter}
              zoom={15}
              markers={filtered}
              height="calc(100vh - 280px)"
              style={{ minHeight: 480 }}
            />
          </div>

          {/* ── Sidebar listing ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: "calc(100vh - 280px)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 4, paddingLeft: 2 }}>
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""} nearby
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 16px", color: "#94A3B8", fontSize: 13 }}>
                No listings match your filters.
              </div>
            )}
            {filtered.map((pin) => {
              const Icon  = TYPE_ICONS[pin.type];
              const color = TYPE_COLORS[pin.type];
              const sel   = selectedPin?.id === pin.id;
              return (
                <button key={pin.id} onClick={() => setSelectedPin(sel ? null : pin)}
                  style={{
                    display: "flex", alignItems: "center", gap: 11,
                    background: sel ? color + "0F" : "#fff",
                    border: `1.5px solid ${sel ? color : "#F1F5F9"}`,
                    borderRadius: 13, padding: "11px 14px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: sel ? "translateX(3px)" : "none",
                    boxShadow: sel ? `0 4px 16px ${color}20` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <div style={{ width: 36, height: 36, background: color + "14", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                    <Icon size={17} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pin.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      {pin.price && <span style={{ fontSize: 11.5, color, fontWeight: 700 }}>{pin.price}</span>}
                      {pin.distance && <span style={{ fontSize: 10.5, color: "#94A3B8" }}>{pin.distance}</span>}
                    </div>
                  </div>
                  {pin.verified && (
                    <ShieldCheckIcon size={13} color="#16A34A" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!loading && view === "list" && (
        <div className="responsive-grid" style={{ gap: 14 }}>
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "#94A3B8", fontSize: 13.5 }}>
              No listings match your search or filters.
            </div>
          )}
          {filtered.map((pin) => {
            const Icon  = TYPE_ICONS[pin.type];
            const color = TYPE_COLORS[pin.type];
            return (
              <Card key={pin.id} hover style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 46, height: 46, background: color + "14", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pin.label}</div>
                  {pin.price && <div style={{ fontSize: 12.5, color, fontWeight: 700 }}>{pin.price}</div>}
                  <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, background: color + "14", color, padding: "2px 8px", borderRadius: 20 }}>{TYPE_LABELS[pin.type]}</span>
                    {pin.verified && <span style={{ fontSize: 10.5, fontWeight: 700, background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC", padding: "2px 8px", borderRadius: 20 }}>Verified</span>}
                    {pin.distance && <span style={{ fontSize: 10.5, color: "#94A3B8" }}>{pin.distance}</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Legend bar at the bottom */}
      {!loading && view === "map" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, padding: "8px 0", borderTop: "1px solid #F1F5F9" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748B", fontWeight: 500 }}>
            <ShieldCheckIcon size={14} color="#16A34A" /> Verified listings
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, letterSpacing: "0.5px", marginRight: 4 }}>MAP LEGEND</span>
            {Object.entries(TYPE_COLORS).map(([type, color]) => {
              const Icon = TYPE_ICONS[type];
              return (
                <span key={type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: color, fontWeight: 600, background: color + "14", padding: "5px 12px", borderRadius: 20 }}>
                  <Icon size={12} color={color} />
                  {TYPE_LABELS[type]}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
