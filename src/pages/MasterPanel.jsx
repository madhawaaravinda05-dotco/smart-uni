import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAdminRequests, approveAdminRequest, getPlatformStats, getActiveAdmins, downgradeAdmin, deleteAdmin, getAdminActivities } from "../api/api";
import { Button, PageHeader, Card, LoadingScreen, EmptyState, ErrorBox, Badge, ConfirmModal } from "../components/ui";
import { useToast } from "../components/Toast";
import { BuildingIcon, UserIcon, ShieldCheckIcon, CheckIcon, ClockIcon, MapPinIcon, TrendingUpIcon, XIcon, ImageIcon, EyeIcon, StarIcon, IdCardIcon } from "../components/Icons";

// ─── All universities on the platform ────────────────────────────────────────
const ALL_UNIVERSITIES = [
  // State
  { name: "University of Moratuwa",                        short: "UOM",    type: "state",   admins: 2, students: 312 },
  { name: "University of Colombo",                         short: "UOC",    type: "state",   admins: 2, students: 287 },
  { name: "University of Kelaniya",                        short: "UOK",    type: "state",   admins: 1, students: 241 },
  { name: "University of Peradeniya",                      short: "UOP",    type: "state",   admins: 2, students: 198 },
  { name: "University of Sri Jayewardenepura",             short: "USJP",   type: "state",   admins: 1, students: 176 },
  { name: "University of Jaffna",                          short: "UOJ",    type: "state",   admins: 1, students: 143 },
  { name: "University of Ruhuna",                          short: "UOR",    type: "state",   admins: 1, students: 119 },
  { name: "Eastern University Sri Lanka",                  short: "EUSL",   type: "state",   admins: 1, students: 88  },
  { name: "South Eastern University of Sri Lanka",         short: "SEUSL",  type: "state",   admins: 1, students: 72  },
  { name: "Rajarata University of Sri Lanka",              short: "RUSL",   type: "state",   admins: 1, students: 65  },
  { name: "Sabaragamuwa University of Sri Lanka",          short: "SUSL",   type: "state",   admins: 1, students: 58  },
  { name: "Wayamba University of Sri Lanka",               short: "WUSL",   type: "state",   admins: 1, students: 54  },
  { name: "Uva Wellassa University",                       short: "UWU",    type: "state",   admins: 0, students: 43  },
  { name: "University of the Visual & Performing Arts",   short: "UVPA",   type: "state",   admins: 0, students: 28  },
  { name: "Open University of Sri Lanka",                  short: "OUSL",   type: "state",   admins: 1, students: 97  },
  { name: "General Sir John Kotelawala Defence University",short: "KDU",    type: "state",   admins: 1, students: 81  },
  { name: "Buddhasravaka Bhikkhu University",              short: "BBU",    type: "state",   admins: 0, students: 12  },
  // Private
  { name: "SLIIT",                                         short: "SLIIT",  type: "private", admins: 2, students: 203 },
  { name: "NSBM Green University",                         short: "NSBM",   type: "private", admins: 1, students: 134 },
  { name: "APIIT Sri Lanka",                               short: "APIIT",  type: "private", admins: 1, students: 89  },
  { name: "Informatics Institute of Technology",           short: "IIT",    type: "private", admins: 1, students: 76  },
  { name: "CINEC Campus",                                  short: "CINEC",  type: "private", admins: 1, students: 61  },
  { name: "Horizon Campus",                                short: "Horizon",type: "private", admins: 0, students: 45  },
  { name: "KAATSU International University",               short: "KAATSU", type: "private", admins: 0, students: 38  },
  { name: "Esoft Metro Campus",                            short: "Esoft",  type: "private", admins: 1, students: 52  },
  { name: "BCI Campus",                                    short: "BCI",    type: "private", admins: 0, students: 29  },
  { name: "IIHE",                                          short: "IIHE",   type: "private", admins: 0, students: 24  },
  { name: "ICBT Campus",                                   short: "ICBT",   type: "private", admins: 1, students: 41  },
  { name: "Cardiff Metropolitan University Sri Lanka",     short: "CardiffMet", type: "private", admins: 0, students: 18 },
  { name: "NIBM",                                          short: "NIBM",   type: "private", admins: 1, students: 63  },
  { name: "SLTC Research University",                      short: "SLTC",   type: "private", admins: 0, students: 21  },
];


export default function MasterPanel() {
  const { show, ToastEl } = useToast();
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [uniTab, setUniTab]             = useState("all");   // "all" | "state" | "private"
  const [expandedUni, setExpandedUni]   = useState(null);
  const [idCardModal, setIdCardModal]   = useState(null);    // null | { name, imageUrl }

  const [platformStats, setPlatformStats] = useState(null);

  const [activeAdmins, setActiveAdmins] = useState([]);
  const [activityModal, setActivityModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const load = async () => {
    setLoading(true); setError("");
    const [reqRes, statsRes, adminsRes] = await Promise.all([
      getAdminRequests(),
      getPlatformStats(),
      getActiveAdmins()
    ]);
    setLoading(false);
    if (!reqRes.success) { setRequests([]); }
    else { setRequests(reqRes.data || []); }
    
    if (statsRes.success) {
      setPlatformStats(statsRes.data);
    }
    if (adminsRes.success) {
      setActiveAdmins(adminsRes.data || []);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id, name) => {
    setActionLoading(id);
    const res = await approveAdminRequest(id);
    setActionLoading("");
    if (!res.success) { show(res.message, "error"); return; }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    show(`${name}'s admin access has been approved. They can now moderate their campus.`, "success");
  };

  const handleDecline = (id, name) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    show(`${name}'s admin request has been declined.`, "info");
  };

  const handleDowngrade = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Downgrade Admin",
      message: `Are you sure you want to downgrade ${name} to a student?`,
      confirmText: "Downgrade",
      variant: "secondary",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        const res = await downgradeAdmin(id);
        if (!res.success) { 
          show(res.message, "error"); 
          setConfirmModal({ isOpen: false }); 
          return; 
        }
        setActiveAdmins((prev) => prev.filter((a) => a.id !== id));
        show(`${name} has been downgraded to a student.`, "success");
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const handleDeleteAdmin = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Account",
      message: `Are you sure you want to completely delete ${name}'s account? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        const res = await deleteAdmin(id);
        if (!res.success) { 
          show(res.message, "error"); 
          setConfirmModal({ isOpen: false }); 
          return; 
        }
        setActiveAdmins((prev) => prev.filter((a) => a.id !== id));
        show(`${name}'s account has been completely deleted.`, "success");
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const handleViewActivities = async (id) => {
    setActionLoading(id + "-activity");
    const res = await getAdminActivities(id);
    setActionLoading("");
    if (!res.success) { show(res.message, "error"); return; }
    setActivityModal(res.data);
  };

  const pending = requests.filter((r) => r.status === "PENDING");

  // ── Platform-wide stats ────────────────────────────────────────────────────
  const totalStudents  = platformStats?.totalStudents || 0;
  const totalAdmins    = platformStats?.totalAdmins || 0;
  const totalMasterAdmins = platformStats?.totalMasterAdmins || 1;
  const totalUnis      = ALL_UNIVERSITIES.length;
  const activeUnis     = platformStats?.activeUnis || 0;

  const visibleUnis = (uniTab === "state"   ? ALL_UNIVERSITIES.filter(u => u.type === "state")
                    : uniTab === "private" ? ALL_UNIVERSITIES.filter(u => u.type === "private")
                    : ALL_UNIVERSITIES).map(u => {
                      const dynamic = platformStats?.universityStats?.[u.name];
                      return { ...u, students: dynamic?.students || 0, admins: dynamic?.admins || 0 };
                    });

  // ── Color per type ─────────────────────────────────────────────────────────
  const typeColor = (type) => type === "state"
    ? { color: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE", label: "State" }
    : { color: "#6B21A8", bg: "#FAF5FF", border: "#DDD6FE", label: "Private" };

  return (
    <div>
      {ToastEl}
      <PageHeader
        title="Master Admin Panel"
        subtitle="Full platform overview — all universities, users, and admin requests."
      />

      {/* ── Platform Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Students",    value: totalStudents.toLocaleString(), color: "#2563EB", bg: "#EFF6FF", sub: "across all campuses" },
          { label: "Campus Admins",     value: totalAdmins,                    color: "#16A34A", bg: "#F0FDF4", sub: "active moderators" },
          { label: "Universities",      value: totalUnis,                      color: "#7C3AED", bg: "#FAF5FF", sub: `${activeUnis} active` },
          { label: "Pending Requests",  value: pending.length,                 color: "#D97706", bg: "#FFFBEB", sub: "awaiting approval" },
        ].map(({ label, value, color, bg, sub }) => (
          <Card key={label} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
              <div style={{ width: 34, height: 34, background: bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUpIcon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* ── User breakdown bar ── */}
      <Card style={{ padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Platform Users</h3>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Students",     value: totalStudents, color: "#2563EB" },
              { label: "Campus Admins",value: totalAdmins,   color: "#16A34A" },
              { label: "Master Admins",value: totalMasterAdmins, color: "#7C3AED" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{value.toLocaleString()} {label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Stacked bar */}
        <div style={{ height: 12, borderRadius: 99, overflow: "hidden", display: "flex", background: "#F1F5F9" }}>
          {(() => {
            const total = totalStudents + totalAdmins + 1;
            return [
              { value: totalStudents, color: "#2563EB" },
              { value: totalAdmins,   color: "#16A34A" },
              { value: totalMasterAdmins, color: "#7C3AED" },
            ].map(({ value, color }, i) => (
              <div key={i} style={{ width: `${(value / total) * 100}%`, background: color, transition: "width 0.8s ease" }} />
            ));
          })()}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Total platform users: <strong style={{ color: "#0F172A" }}>{(totalStudents + totalAdmins + totalMasterAdmins).toLocaleString()}</strong></span>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Students: <strong style={{ color: "#2563EB" }}>{((totalStudents / Math.max(1, totalStudents + totalAdmins + totalMasterAdmins)) * 100).toFixed(1)}%</strong></span>
        </div>
      </Card>

      {/* ── Universities breakdown ── */}
      <Card style={{ padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Universities on Platform</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "state", "private"].map((tab) => (
              <button key={tab} onClick={() => setUniTab(tab)}
                style={{
                  padding: "6px 14px", borderRadius: 20,
                  border: `1.5px solid ${uniTab === tab ? "#2563EB" : "#E2E8F0"}`,
                  background: uniTab === tab ? "#EFF6FF" : "#fff",
                  fontSize: 11.5, fontWeight: 600,
                  color: uniTab === tab ? "#2563EB" : "#64748B",
                  cursor: "pointer", transition: "all 0.15s",
                  textTransform: "capitalize",
                }}>
                {tab === "all" ? `All (${ALL_UNIVERSITIES.length})` : tab === "state" ? `State (${ALL_UNIVERSITIES.filter(u=>u.type==="state").length})` : `Private (${ALL_UNIVERSITIES.filter(u=>u.type==="private").length})`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, maxHeight: 460, overflowY: "auto", paddingRight: 4 }}>
          {visibleUnis.map((uni) => {
            const tc = typeColor(uni.type);
            const isExpanded = expandedUni === uni.short;
            return (
              <div key={uni.short}
                onClick={() => setExpandedUni(isExpanded ? null : uni.short)}
                style={{
                  background: isExpanded ? tc.bg : "#F8FAFC",
                  border: `1.5px solid ${isExpanded ? tc.border : "#F1F5F9"}`,
                  borderRadius: 12, padding: "12px 14px",
                  cursor: "pointer", transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { if (!isExpanded) { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.borderColor = "#E2E8F0"; } }}
                onMouseLeave={(e) => { if (!isExpanded) { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#F1F5F9"; } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BuildingIcon size={16} color={tc.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={uni.name}>{uni.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, padding: "1px 7px", borderRadius: 20 }}>{tc.label}</span>
                      <span style={{ fontSize: 10.5, color: "#94A3B8" }}>{uni.students} students</span>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${tc.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, animation: "slideDown 0.2s ease" }}>
                    {[
                      { label: "Students",    value: uni.students, color: "#2563EB" },
                      { label: "Admins",      value: uni.admins,   color: "#16A34A" },
                      { label: "Short",       value: uni.short,    color: tc.color  },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Pending Admin Requests ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <ShieldCheckIcon size={16} color="#D97706" />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Pending Admin Access Requests</h3>
          {pending.length > 0 && (
            <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #FDE68A" }}>
              {pending.length} pending
            </span>
          )}
        </div>

        {loading && <LoadingScreen message="Loading admin requests..." />}
        {error && <ErrorBox message={error} onRetry={load} />}

        {!loading && pending.length === 0 && (
          <EmptyState
            icon={<ShieldCheckIcon size={44} color="#CBD5E1" />}
            title="All caught up!"
            description="No pending admin requests right now. New requests from campus admins will appear here automatically."
          />
        )}

        {!loading && pending.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((req) => {
              const date = new Date(req.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              // Find uni type
              const uniMeta = ALL_UNIVERSITIES.find(u => u.name === req.university);
              const tc = typeColor(uniMeta?.type || "state");
              return (
                <Card key={req.id} style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    {/* Avatar */}
                    <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#2563EB,#7C3AED)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                      {req.name[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{req.name}</span>
                        <Badge color="yellow">Pending</Badge>
                        {uniMeta && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, padding: "2px 8px", borderRadius: 20 }}>
                            {tc.label} University
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                          <UserIcon size={11} color="#94A3B8" /> {req.email}
                        </span>
                        <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                          <BuildingIcon size={11} color="#94A3B8" /> {req.university}
                        </span>
                        <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPinIcon size={11} color="#94A3B8" /> {req.area}
                        </span>
                        {req.yearOfStudy && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, background: "#FAF5FF", color: "#7C3AED", border: "1px solid #DDD6FE", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
                            <StarIcon size={10} color="#7C3AED" /> Year {req.yearOfStudy}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: "#CBD5E1", display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                          <ClockIcon size={11} color="#CBD5E1" /> {date}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                      <Button size="sm" variant="ghost"
                        onClick={() => setIdCardModal({ name: req.name, imageUrl: req.idCardUrl })}>
                        <IdCardIcon size={12} /> View ID
                      </Button>
                      <Button size="sm" variant="secondary"
                        onClick={() => handleDecline(req.id, req.name)}>
                        <XIcon size={12} /> Decline
                      </Button>
                      <Button size="sm" loading={actionLoading === req.id}
                        onClick={() => handleApprove(req.id, req.name)}>
                        <CheckIcon size={12} /> Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Active University Admins ── */}
      <div style={{ marginTop: 40, marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <UserIcon size={16} color="#16A34A" />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Active University Admins</h3>
        </div>

        {activeAdmins.length === 0 && !loading && (
          <EmptyState
            icon={<UserIcon size={44} color="#CBD5E1" />}
            title="No active admins"
            description="There are currently no active university admins."
          />
        )}

        {activeAdmins.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeAdmins.map((admin) => (
              <Card key={admin.id} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ width: 44, height: 44, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                    {admin.name[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{admin.name}</span>
                      <Badge color="green">Active Admin</Badge>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                        <UserIcon size={11} color="#94A3B8" /> {admin.email}
                      </span>
                      <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                        <BuildingIcon size={11} color="#94A3B8" /> {admin.university}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <Button size="sm" variant="ghost" loading={actionLoading === admin.id + "-activity"}
                      onClick={() => handleViewActivities(admin.id)}>
                      <EyeIcon size={12} /> Activities
                    </Button>
                    <Button size="sm" variant="secondary" loading={actionLoading === admin.id}
                      onClick={() => handleDowngrade(admin.id, admin.name)}>
                      <XIcon size={12} /> Downgrade
                    </Button>
                    <Button size="sm" variant="danger" loading={actionLoading === admin.id}
                      onClick={() => handleDeleteAdmin(admin.id, admin.name)}>
                      <XIcon size={12} /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Activity Modal ── */}
      {activityModal && (
        <div
          onClick={() => setActivityModal(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 18, padding: "24px",
              maxWidth: 400, width: "90%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              animation: "slideDown 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Moderation Activities</h3>
              <button
                onClick={() => setActivityModal(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <XIcon size={16} color="#64748B" />
              </button>
            </div>
            
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
              Statistics for <strong>{activityModal.university}</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#F1F5F9", borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Total Posts</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{activityModal.totalPosts}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#F0FDF4", borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#16A34A" }}>Approved</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>{activityModal.approved}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#FFFBEB", borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#D97706" }}>Pending</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#D97706" }}>{activityModal.pending}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "#FEF2F2", borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#DC2626" }}>Rejected</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#DC2626" }}>{activityModal.rejected}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      <ConfirmModal 
        {...confirmModal}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />

      {/* ── ID Card Modal ── */}
      {idCardModal && (
        <div
          onClick={() => setIdCardModal(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 18, padding: "24px",
              maxWidth: 520, width: "90%", maxHeight: "85vh",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              animation: "slideDown 0.3s ease",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, background: "#FAF5FF", border: "1px solid #DDD6FE", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IdCardIcon size={16} color="#7C3AED" />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>University ID Card</h3>
                  <p style={{ fontSize: 11.5, color: "#94A3B8" }}>{idCardModal.name}'s verification</p>
                </div>
              </div>
              <button
                onClick={() => setIdCardModal(null)}
                style={{
                  background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 8,
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#E2E8F0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
              >
                <XIcon size={14} color="#64748B" />
              </button>
            </div>

            {idCardModal.imageUrl ? (
              <img
                src={idCardModal.imageUrl}
                alt={`${idCardModal.name}'s University ID Card`}
                style={{
                  width: "100%", borderRadius: 12,
                  border: "1.5px solid #F1F5F9",
                  objectFit: "contain", maxHeight: 400,
                }}
              />
            ) : (
              <div style={{
                background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)",
                border: "2px dashed #E2E8F0", borderRadius: 12,
                padding: "48px 24px", textAlign: "center",
              }}>
                <ImageIcon size={36} color="#CBD5E1" />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginTop: 12 }}>ID card image not available</p>
                <p style={{ fontSize: 11.5, color: "#CBD5E1", marginTop: 4 }}>The image may not have been uploaded yet or the URL has expired.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
