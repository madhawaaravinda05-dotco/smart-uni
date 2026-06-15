import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAdminReports,
  resolveReport,
  deletePost,
} from "../api/api";
import {
  Button,
  PageHeader,
  Card,
  LoadingScreen,
  EmptyState,
  ErrorBox,
  ConfirmModal,
} from "../components/ui";
import { useToast } from "../components/Toast";
import {
  ShieldCheckIcon,
  FlagIcon,
  XIcon,
} from "../components/Icons";

export default function AdminReports() {
  const { user } = useAuth();
  const { show, ToastEl } = useToast();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const load = async () => {
    setLoading(true);
    setError("");
    const reportsRes = await getAdminReports(user?.university);
    setLoading(false);

    if (reportsRes.success && reportsRes.data) {
      setReports(reportsRes.data);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleResolveReport = async (id, status) => {
    setActionLoading(id + status);
    const res = await resolveReport(id, status);
    setActionLoading("");
    if (!res.success) {
      show(res.message, "error");
      return;
    }
    setReports((prev) => prev.filter((r) => r.id !== id && r._id !== id));
    show("Report resolved successfully.", "success");
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
        show("Listing deleted successfully.", "success");
        setConfirmModal({ isOpen: false });
      },
    });
  };

  return (
    <div>
      {ToastEl}
      <PageHeader
        title="User Reports"
        subtitle={`Review flagged listings for ${user?.university || "your campus"}`}
      />

      {loading && <LoadingScreen message="Loading reports..." />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && reports.length === 0 && (
        <EmptyState
          icon={<FlagIcon size={48} color="#CBD5E1" />}
          title="No pending reports"
          description="There are no user reports for your university at the moment."
        />
      )}

      {!loading && reports.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map((report) => (
            <Card key={report.id || report._id} style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: "#FEF2F2", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626", flexShrink: 0 }}>
                      <FlagIcon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>
                        {report.post?.title || "Unknown Post"}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                        Reported by: <span style={{ fontWeight: 600 }}>{report.reportedBy?.name || report.reportedBy?.email || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button size="sm" variant="ghost" loading={actionLoading === (report.id || report._id) + "DISMISSED"} onClick={() => handleResolveReport(report.id || report._id, "DISMISSED")}>
                      Dismiss Report
                    </Button>
                    <Button size="sm" variant="danger" loading={actionLoading === (report.post?.id || report.post?._id) + "DELETE"} onClick={() => {
                        handleResolveReport(report.id || report._id, "RESOLVED");
                        if(report.post) handleDelete(report.post.id || report.post._id);
                    }}>
                      <XIcon size={12} /> Delete Post
                    </Button>
                  </div>
                </div>
                <div style={{ background: "#FAFBFC", padding: "12px 16px", borderRadius: 12, border: "1px solid #F1F5F9" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", marginBottom: 4 }}>Reason: {report.reason}</div>
                  {report.message && <div style={{ fontSize: 13, color: "#334155" }}>{report.message}</div>}
                </div>
              </div>
            </Card>
          ))}
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
