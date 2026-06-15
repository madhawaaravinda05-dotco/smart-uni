import React, { useState, useEffect } from "react";
import { getActiveAdmins, getAdminActivities, downgradeAdmin, deleteAdmin, getAdminRequests, approveAdminRequest } from "../api/api";
import { PageHeader, LoadingScreen, ErrorBox, Button, EmptyState, Card, Badge, ConfirmModal } from "../components/ui";
import { SearchIcon, XIcon, ShieldCheckIcon, UserIcon, InfoIcon, BuildingIcon, MapPinIcon, StarIcon, ClockIcon, IdCardIcon, CheckIcon, ImageIcon } from "../components/Icons";
import { useToast } from "../components/Toast";

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

export default function AdminManagement() {
  const { show, ToastEl } = useToast();

  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "active"
  
  // Data State
  const [admins, setAdmins] = useState([]);
  const [requests, setRequests] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [search, setSearch] = useState("");
  
  // Modals & Details
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [idCardModal, setIdCardModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const loadData = async () => {
    setLoading(true);
    const [reqRes, adminsRes] = await Promise.all([
      getAdminRequests(),
      getActiveAdmins()
    ]);
    setLoading(false);
    
    if (reqRes.success && reqRes.data) {
      setRequests(reqRes.data.filter(r => r.status === "PENDING"));
    }
    if (adminsRes.success && adminsRes.data) {
      setAdmins(adminsRes.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Actions ──
  const handleApprove = async (id, name) => {
    setActionLoading(id);
    const res = await approveAdminRequest(id);
    setActionLoading("");
    if (!res.success) { show(res.message, "error"); return; }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    show(`${name}'s admin access has been approved.`, "success");
    loadData(); // refresh lists
  };

  const handleDecline = (id, name) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    show(`${name}'s admin request has been declined.`, "info");
  };

  const handleAdminClick = async (admin) => {
    setSelectedAdmin(admin);
    setActivities(null);
    setLoadingActivities(true);
    const res = await getAdminActivities(admin.id || admin._id);
    setLoadingActivities(false);
    if (res.success) {
      setActivities(res.data);
    }
  };

  const handleDowngrade = async (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Downgrade Admin",
      message: `Are you sure you want to downgrade ${name || 'this user'} to a student?`,
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
        setAdmins((prev) => prev.filter((a) => (a.id || a._id) !== id));
        setSelectedAdmin(null);
        show(`${name || 'User'} has been downgraded to a student.`, "success");
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const handleDeleteAdmin = async (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Account",
      message: `Are you sure you want to completely delete ${name || 'this user'}'s account? This action cannot be undone.`,
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
        setAdmins((prev) => prev.filter((a) => (a.id || a._id) !== id));
        setSelectedAdmin(null);
        show(`${name || 'User'}'s account has been completely deleted.`, "success");
        setConfirmModal({ isOpen: false });
      }
    });
  };

  // ── Filters ──
  const filteredAdmins = admins.filter(a => {
    const term = search.toLowerCase();
    return (a.name?.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term) || a.university?.toLowerCase().includes(term));
  });

  const typeColor = (type) => type === "state"
    ? { color: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE", label: "State" }
    : { color: "#6B21A8", bg: "#FAF5FF", border: "#DDD6FE", label: "Private" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
      {ToastEl}
      
      <PageHeader title="Manage Admins" subtitle="Review requests and manage active campus moderators." />
      
      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
        <button 
          onClick={() => { setActiveTab("pending"); setSelectedAdmin(null); setSearch(""); }}
          style={{
            padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 14,
            background: activeTab === "pending" ? "var(--surface2)" : "transparent",
            color: activeTab === "pending" ? "var(--text-h)" : "var(--text-s)",
            border: "none", cursor: "pointer", transition: "all 0.2s"
          }}
        >
          Pending Requests ({requests.length})
        </button>
        <button 
          onClick={() => setActiveTab("active")}
          style={{
            padding: "8px 16px", borderRadius: 8, fontWeight: 600, fontSize: 14,
            background: activeTab === "active" ? "var(--surface2)" : "transparent",
            color: activeTab === "active" ? "var(--text-h)" : "var(--text-s)",
            border: "none", cursor: "pointer", transition: "all 0.2s"
          }}
        >
          Active Admins ({admins.length})
        </button>
      </div>

      {loading && <LoadingScreen message="Loading data..." />}

      {/* ── Pending Requests Tab ── */}
      {!loading && activeTab === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {requests.length === 0 ? (
            <EmptyState
              icon={<ShieldCheckIcon size={44} color="#CBD5E1" />}
              title="All caught up!"
              description="No pending admin requests right now."
            />
          ) : (
            requests.map((req) => {
              const date = new Date(req.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              const uniMeta = ALL_UNIVERSITIES.find(u => u.name === req.university);
              const tc = typeColor(uniMeta?.type || "state");
              
              return (
                <Card key={req.id} style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#2563EB,#7C3AED)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                      {req.name[0].toUpperCase()}
                    </div>

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

                    <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                      <Button size="sm" variant="ghost" onClick={() => setIdCardModal({ name: req.name, imageUrl: req.idCardUrl })}>
                        <IdCardIcon size={12} /> View ID
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDecline(req.id, req.name)}>
                        <XIcon size={12} /> Decline
                      </Button>
                      <Button size="sm" loading={actionLoading === req.id} onClick={() => handleApprove(req.id, req.name)}>
                        <CheckIcon size={12} /> Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── Active Admins Tab ── */}
      {!loading && activeTab === "active" && (
        <div style={{ display: "flex", gap: 20, flex: 1, minHeight: 0 }}>
          {/* Left List */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 15, overflowY: "auto", paddingRight: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "0 15px", boxShadow: "var(--shadow-sm)" }}>
              <SearchIcon size={15} color="var(--text-ph)" />
              <input 
                value={search} onChange={e => setSearch(e.target.value)} 
                placeholder="Search admins by name, email, or university..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, padding: "12px 0", background: "transparent", color: "var(--text-h)", fontFamily: "inherit" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text-ph)", cursor: "pointer", display: "flex" }}><XIcon size={14}/></button>}
            </div>

            {filteredAdmins.length === 0 ? (
              <EmptyState icon={<ShieldCheckIcon size={44} />} title="No admins found" description="Try adjusting your search terms." action={<Button variant="secondary" onClick={() => setSearch("")}>Clear Search</Button>} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredAdmins.map((admin, i) => {
                  const isSelected = selectedAdmin && (selectedAdmin.id || selectedAdmin._id) === (admin.id || admin._id);
                  return (
                    <div key={admin.id || admin._id || i} 
                      onClick={() => handleAdminClick(admin)}
                      style={{ background: isSelected ? "var(--surface2)" : "var(--surface)", border: `1.5px solid ${isSelected ? "var(--indigo)" : "var(--border)"}`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 15, cursor: "pointer", transition: "all .2s", boxShadow: isSelected ? "0 4px 12px rgba(91,103,248,.15)" : "var(--shadow-sm)", animation: `fadeInUp .3s ${0.05 * i}s both` }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--indigo-l)", border: "1px solid rgba(91,103,248,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--indigo)", fontWeight: 800, fontSize: 16 }}>
                        {(admin.name || "A")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-h)", marginBottom: 4 }}>{admin.name}</div>
                        <div style={{ fontSize: 12.5, color: "var(--text-s)", display: "flex", alignItems: "center", gap: 6 }}>
                          <BuildingIcon size={12} color="var(--text-ph)" /> {admin.university || "No university assigned"}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span className="chip chip-indigo" style={{ fontSize: 10 }}>Admin</span>
                        <span style={{ fontSize: 11, color: "var(--text-ph)" }}>{admin.email}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Detail Panel */}
          {selectedAdmin && (
            <div style={{ width: 380, flexShrink: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", gap: 20, animation: "slideInRight .3s ease both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, var(--indigo), #8B9FFF)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 24, boxShadow: "0 8px 24px rgba(91,103,248,.3)" }}>
                  {(selectedAdmin.name || "A")[0].toUpperCase()}
                </div>
                <button onClick={() => setSelectedAdmin(null)} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-s)", transition: "all .15s" }}>
                  <XIcon size={14} />
                </button>
              </div>

              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-h)", marginBottom: 6 }}>{selectedAdmin.name}</h2>
                <div style={{ fontSize: 13, color: "var(--text-s)", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <UserIcon size={14} color="var(--text-ph)" /> {selectedAdmin.email}
                </div>
                <div style={{ background: "var(--indigo-l)", border: "1px solid rgba(91,103,248,.2)", borderRadius: 12, padding: "10px 14px", display: "inline-flex", alignItems: "center", gap: 8, color: "var(--indigo)", fontSize: 12, fontWeight: 600 }}>
                  <BuildingIcon size={14} /> {selectedAdmin.university || "Global Access"}
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--divider)", margin: "0" }} />

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-h)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <InfoIcon size={15} color="var(--text-ph)" /> Activity Report
                </h3>
                
                {loadingActivities ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-ph)", fontSize: 13 }}>Loading report...</div>
                ) : activities ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "var(--surface2)", borderRadius: 14, padding: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-h)", marginBottom: 4 }}>{activities.totalPosts}</div>
                      <div style={{ fontSize: 11, color: "var(--text-ph)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Total Posts</div>
                    </div>
                    <div style={{ background: "rgba(56,201,160,.1)", borderRadius: 14, padding: "16px", border: "1px solid rgba(56,201,160,.2)", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#38C9A0", marginBottom: 4 }}>{activities.approved}</div>
                      <div style={{ fontSize: 11, color: "var(--text-s)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Approved</div>
                    </div>
                    <div style={{ background: "rgba(248,118,109,.1)", borderRadius: 14, padding: "16px", border: "1px solid rgba(248,118,109,.2)", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#F8766D", marginBottom: 4 }}>{activities.rejected}</div>
                      <div style={{ fontSize: 11, color: "var(--text-s)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Rejected</div>
                    </div>
                    <div style={{ background: "rgba(245,158,11,.1)", borderRadius: 14, padding: "16px", border: "1px solid rgba(245,158,11,.2)", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B", marginBottom: 4 }}>{activities.pending}</div>
                      <div style={{ fontSize: 11, color: "var(--text-s)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Pending</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-ph)", fontSize: 13, background: "var(--surface2)", borderRadius: 14, border: "1px dashed var(--border)" }}>
                    Failed to load activity report.
                  </div>
                )}
              </div>

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                <Button variant="secondary" onClick={() => handleDowngrade(selectedAdmin.id || selectedAdmin._id, selectedAdmin.name)} style={{ padding: "12px" }}>
                  Downgrade to Student
                </Button>
                <Button variant="danger" onClick={() => handleDeleteAdmin(selectedAdmin.id || selectedAdmin._id, selectedAdmin.name)} style={{ padding: "12px" }}>
                  <XIcon size={14} /> Delete Account
                </Button>
              </div>
            </div>
          )}
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

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
