import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getPendingPosts,
  getActivePosts,
  updatePostStatus,
  deletePost,
} from "../api/api";
import {
  Button,
  PageHeader,
  Card,
  StatusBadge,
  LoadingScreen,
  EmptyState,
  ErrorBox,
  ConfirmModal,
} from "../components/ui";
import { useToast } from "../components/Toast";
import {
  ShieldCheckIcon,
  HouseIcon,
  FoodIcon,
  BusIcon,
  MapPinIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
} from "../components/Icons";

const CATEGORY_META = {
  BOARDING: {
    Icon: HouseIcon,
    color: "#2563EB",
    bg: "#EFF6FF",
    label: "Boarding",
  },
  FOOD: { Icon: FoodIcon, color: "#EA580C", bg: "#FFF7ED", label: "Food Spot" },
  TRANSPORT: {
    Icon: BusIcon,
    color: "#16A34A",
    bg: "#F0FDF4",
    label: "Transport",
  },
};

export default function AdminPosts() {
  const { user } = useAuth();
  const { show, ToastEl } = useToast();
  
  const [pendingPosts, setPendingPosts] = useState([]);
  const [activePosts, setActivePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  
  // Tabs: "PENDING" or "APPROVED"
  const [activeTab, setActiveTab] = useState("PENDING");
  const [filter, setFilter] = useState("ALL");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const load = async () => {
    setLoading(true);
    setError("");
    const [pendingRes, activeRes] = await Promise.all([
      getPendingPosts(user?.university),
      getActivePosts(user?.university),
    ]);
    setLoading(false);

    if (pendingRes.success && pendingRes.data) setPendingPosts(pendingRes.data);
    if (activeRes.success && activeRes.data) setActivePosts(activeRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    const res = await updatePostStatus(id, status);
    setActionLoading("");
    if (!res.success) {
      show(res.message, "error");
      return;
    }

    if (status === "APPROVED") {
      const approvedPost = pendingPosts.find(p => p.id === id);
      if(approvedPost) {
        approvedPost.status = "APPROVED";
        setPendingPosts(prev => prev.filter(p => p.id !== id));
        setActivePosts(prev => [approvedPost, ...prev]);
      }
    } else {
       setPendingPosts(prev => prev.filter(p => p.id !== id));
    }
    
    setSelected(null);
    show(
      status === "APPROVED"
        ? "Listing approved and is now active."
        : "Listing rejected and hidden.",
      status === "APPROVED" ? "success" : "info",
    );
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Listing",
      message:
        "Are you sure you want to permanently delete this post? This action cannot be undone.",
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
        
        setActivePosts((prev) => prev.filter((p) => p.id !== id));
        setPendingPosts((prev) => prev.filter((p) => p.id !== id));
        setSelected(null);
        show("Listing deleted successfully.", "success");
        setConfirmModal({ isOpen: false });
      },
    });
  };

  const currentList = activeTab === "PENDING" ? pendingPosts : activePosts;
  const filtered = filter === "ALL" ? currentList : currentList.filter((p) => p.category === filter);

  return (
    <div>
      {ToastEl}
      <PageHeader
        title="Manage Listings"
        subtitle={`Review and manage posts for ${user?.university || "your campus"}`}
      />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, borderBottom: "1px solid #E2E8F0" }}>
        <button
          onClick={() => {setActiveTab("PENDING"); setSelected(null);}}
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 700,
            color: activeTab === "PENDING" ? "#2563EB" : "#64748B",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "PENDING" ? "3px solid #2563EB" : "3px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Pending Review ({pendingPosts.length})
        </button>
        <button
          onClick={() => {setActiveTab("APPROVED"); setSelected(null);}}
          style={{
             padding: "10px 16px",
             fontSize: 14,
             fontWeight: 700,
             color: activeTab === "APPROVED" ? "#16A34A" : "#64748B",
             background: "transparent",
             border: "none",
             borderBottom: activeTab === "APPROVED" ? "3px solid #16A34A" : "3px solid transparent",
             cursor: "pointer",
             transition: "all 0.2s"
          }}
        >
          Active / Approved ({activePosts.length})
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["ALL", "BOARDING", "FOOD", "TRANSPORT"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: `1.5px solid ${filter === f ? "#2563EB" : "#E2E8F0"}`,
              background: filter === f ? "#EFF6FF" : "#fff",
              fontSize: 12,
              fontWeight: 600,
              color: filter === f ? "#2563EB" : "#64748B",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {f === "ALL" ? "All types" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading && <LoadingScreen message="Loading listings..." />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<ShieldCheckIcon size={48} color="#CBD5E1" />}
          title={`No ${activeTab.toLowerCase()} listings found`}
          description={`There are no ${activeTab.toLowerCase()} listings for your university at the moment.`}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((post) => {
            const meta = CATEGORY_META[post.category] || CATEGORY_META.BOARDING;
            const { Icon, color, bg, label } = meta;
            const date = new Date(post.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card key={post.id} style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: bg,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        {post.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: bg,
                          color,
                          padding: "2px 8px",
                          borderRadius: 20,
                        }}
                      >
                        {label}
                      </span>
                      <StatusBadge status={post.status} />
                    </div>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "#64748B",
                        lineHeight: 1.6,
                        marginBottom: 8,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {post.price && (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: color,
                          }}
                        >
                          Rs. {Number(post.price).toLocaleString()}/mo
                        </span>
                      )}
                      {post.priceRange && (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: color,
                          }}
                        >
                          {post.priceRange}
                        </span>
                      )}
                      {post.area && (
                        <span
                          style={{
                            fontSize: 11.5,
                            color: "#94A3B8",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <MapPinIcon size={11} color="#94A3B8" />
                          {post.area}
                        </span>
                      )}
                      {post.genderType && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: "#EFF6FF",
                            color: "#1E40AF",
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}
                        >
                          {post.genderType}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          color: "#CBD5E1",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          marginLeft: "auto",
                        }}
                      >
                        <ClockIcon size={11} color="#CBD5E1" />
                        {date}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexShrink: 0,
                      alignItems: "center",
                    }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setSelected(selected?.id === post.id ? null : post)
                      }
                      style={{ color: "#64748B", fontSize: 12 }}
                    >
                      Details
                    </Button>
                    {activeTab === "PENDING" ? (
                      <>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={actionLoading === post.id + "REJECTED"}
                          onClick={() => handleAction(post.id, "REJECTED")}
                        >
                          <XIcon size={12} /> Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          loading={actionLoading === post.id + "APPROVED"}
                          onClick={() => handleAction(post.id, "APPROVED")}
                        >
                          <CheckIcon size={12} /> Approve
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={actionLoading === post.id + "DELETE"}
                        onClick={() => handleDelete(post.id)}
                      >
                        <XIcon size={12} /> Delete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === post.id && (
                  <div
                    style={{
                      borderTop: "1px solid #F1F5F9",
                      padding: "16px 20px 18px",
                      background: "#FAFBFC",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: 12,
                      }}
                    >
                      {[
                        post.genderType && ["For", post.genderType],
                        post.hasKitchen !== undefined && [
                          "Kitchen",
                          post.hasKitchen ? "Yes" : "No",
                        ],
                        post.contact && ["Contact", post.contact],
                        post.tags?.length && ["Tags", post.tags.join(", ")],
                        post.routeNumber && ["Route #", post.routeNumber],
                        post.from && ["From", post.fromLocation || post.from],
                        post.to && ["To", post.toLocation || post.to],
                        post.area && ["Area", post.area],
                        post.frequency && ["Frequency", post.frequency],
                        post.lastBus && ["Last Bus", post.lastBus],
                      ]
                        .filter(Boolean)
                        .map(([k, v]) => (
                          <div
                            key={k}
                            style={{
                              background: "#fff",
                              borderRadius: 10,
                              padding: "10px 14px",
                              border: "1px solid #F1F5F9",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10.5,
                                color: "#94A3B8",
                                fontWeight: 600,
                                marginBottom: 3,
                                textTransform: "uppercase",
                              }}
                            >
                              {k}
                            </div>
                            <div
                              style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: "#334155",
                              }}
                            >
                              {v}
                            </div>
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
