import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getPendingPosts, getActivePosts, updatePostStatus, deletePost } from "../api/api";
import { Button, PageHeader, Card, StatusBadge, LoadingScreen, EmptyState, ErrorBox, ConfirmModal } from "../components/ui";
import { useToast } from "../components/Toast";
import { ShieldCheckIcon, HouseIcon, FoodIcon, BusIcon, MapPinIcon, CheckIcon, XIcon, FlagIcon, ClockIcon } from "../components/Icons";

const CATEGORY_META = {
  BOARDING:  { Icon: HouseIcon,  color: "#2563EB", bg: "#EFF6FF", label: "Boarding" },
  FOOD:      { Icon: FoodIcon,   color: "#EA580C", bg: "#FFF7ED", label: "Food Spot" },
  TRANSPORT: { Icon: BusIcon,    color: "#16A34A", bg: "#F0FDF4", label: "Transport" },
};


export default function AdminDesk() {
  const { user } = useAuth();
  const { show, ToastEl } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const load = async () => {
    setLoading(true); setError("");
    const [pendingRes, activeRes] = await Promise.all([
      getPendingPosts(user?.university),
      getActivePosts(user?.university)
    ]);
    setLoading(false);
    
    let allPosts = [];
    if (pendingRes.success && pendingRes.data) allPosts = [...allPosts, ...pendingRes.data];
    if (activeRes.success && activeRes.data) allPosts = [...allPosts, ...activeRes.data];

    setPosts(allPosts);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    const res = await updatePostStatus(id, status);
    setActionLoading("");
    if (!res.success) { show(res.message, "error"); return; }
    
    setPosts((prev) => prev.map(p => p.id === id ? { ...p, status } : p));
    setSelected(null);
    show(
      status === "APPROVED"
        ? "Listing approved and is now active."
        : "Listing rejected and hidden.",
      status === "APPROVED" ? "success" : "info"
    );
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Listing",
      message: "Are you sure you want to permanently delete this post? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        const res = await deletePost(id);
        if (!res.success) { 
          show(res.message, "error"); 
          setConfirmModal({ isOpen: false }); 
          return; 
        }
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setSelected(null);
        show("Listing deleted successfully.", "success");
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const filtered = filter === "ALL" ? posts : posts.filter((p) => p.category === filter);

  const stats = {
    total: posts.length,
    boardings: posts.filter((p) => p.category === "BOARDING").length,
    food: posts.filter((p) => p.category === "FOOD").length,
    transport: posts.filter((p) => p.category === "TRANSPORT").length,
  };

  return (
    <div>
      {ToastEl}
      <PageHeader
        title="Admin Moderation Desk"
        subtitle={`Reviewing pending listings for ${user?.university || "your campus"}`}
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Listings", value: stats.total,     color: "#D97706", bg: "#FFFBEB" },
          { label: "Boardings",      value: stats.boardings, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Food Spots",     value: stats.food,      color: "#EA580C", bg: "#FFF7ED" },
          { label: "Transport",      value: stats.transport, color: "#16A34A", bg: "#F0FDF4" },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</div>
            <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 4, fontWeight: 500 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["ALL", "BOARDING", "FOOD", "TRANSPORT"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 18px", borderRadius: 20, border: `1.5px solid ${filter === f ? "#2563EB" : "#E2E8F0"}`, background: filter === f ? "#EFF6FF" : "#fff", fontSize: 12, fontWeight: 600, color: filter === f ? "#2563EB" : "#64748B", cursor: "pointer", transition: "all 0.15s" }}>
            {f === "ALL" ? "All types" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading && <LoadingScreen message="Loading pending submissions..." />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<ShieldCheckIcon size={48} color="#CBD5E1" />}
          title="No listings found"
          description="There are no listings for your university at the moment."
        />
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((post) => {
            const meta = CATEGORY_META[post.category] || CATEGORY_META.BOARDING;
            const { Icon, color, bg, label } = meta;
            const date = new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

            return (
              <Card key={post.id} style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ width: 44, height: 44, background: bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{post.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, background: bg, color, padding: "2px 8px", borderRadius: 20 }}>{label}</span>
                      <StatusBadge status={post.status} />
                    </div>
                    <p style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.6, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.description}</p>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                      {post.price && <span style={{ fontSize: 12, fontWeight: 700, color: color }}>Rs. {Number(post.price).toLocaleString()}/mo</span>}
                      {post.priceRange && <span style={{ fontSize: 12, fontWeight: 700, color: color }}>{post.priceRange}</span>}
                      {post.area && <span style={{ fontSize: 11.5, color: "#94A3B8", display: "flex", alignItems: "center", gap: 3 }}><MapPinIcon size={11} color="#94A3B8" />{post.area}</span>}
                      {post.genderType && <span style={{ fontSize: 11, fontWeight: 600, background: "#EFF6FF", color: "#1E40AF", padding: "2px 8px", borderRadius: 20 }}>{post.genderType}</span>}
                      <span style={{ fontSize: 11, color: "#CBD5E1", display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}><ClockIcon size={11} color="#CBD5E1" />{date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                    <Button size="sm" variant="ghost" onClick={() => setSelected(selected?.id === post.id ? null : post)} style={{ color: "#64748B", fontSize: 12 }}>
                      Details
                    </Button>
                    {post.status === "PENDING" ? (
                      <>
                        <Button size="sm" variant="danger"
                          loading={actionLoading === post.id + "REJECTED"}
                          onClick={() => handleAction(post.id, "REJECTED")}>
                          <XIcon size={12} /> Reject
                        </Button>
                        <Button size="sm" variant="success"
                          loading={actionLoading === post.id + "APPROVED"}
                          onClick={() => handleAction(post.id, "APPROVED")}>
                          <CheckIcon size={12} /> Approve
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="danger"
                        loading={actionLoading === post.id + "DELETE"}
                        onClick={() => handleDelete(post.id)}>
                        <XIcon size={12} /> Delete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === post.id && (
                  <div style={{ borderTop: "1px solid #F1F5F9", padding: "16px 20px 18px", background: "#FAFBFC" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                      {[
                        post.genderType && ["For", post.genderType],
                        post.hasKitchen !== undefined && ["Kitchen", post.hasKitchen ? "Yes" : "No"],
                        post.contact && ["Contact", post.contact],
                        post.tags?.length && ["Tags", post.tags.join(", ")],
                        post.routeNumber && ["Route #", post.routeNumber],
                        post.from && ["From", post.from],
                        post.to && ["To", post.to],
                        post.area && ["Area", post.area],
                      ].filter(Boolean).map(([k, v]) => (
                        <div key={k} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #F1F5F9" }}>
                          <div style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 600, marginBottom: 3, textTransform: "uppercase" }}>{k}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#334155" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      {/* ── Confirm Modal ── */}
      <ConfirmModal 
        {...confirmModal}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  );
}
