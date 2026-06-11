import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getActiveAdmins, getAdminActivities, downgradeAdmin, deleteAdmin } from "../api/api";
import { PageHeader, LoadingScreen, ErrorBox, Button, EmptyState } from "../components/ui";
import { SearchIcon, XIcon, ShieldCheckIcon, UserIcon, InfoIcon, BuildingIcon } from "../components/Icons";
import { useToast } from "../components/Toast";

export default function AdminManagement() {
  const { user } = useAuth();
  const { show, ToastEl } = useToast();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const res = await getActiveAdmins();
    setLoading(false);
    if (res.success && res.data) {
      setAdmins(res.data);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

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

  const handleDowngrade = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this user's admin privileges? They will become a regular student.")) return;
    const res = await downgradeAdmin(id);
    if (res.success) {
      show("Admin privileges revoked.", "success");
      setSelectedAdmin(null);
      fetchAdmins();
    } else {
      show(res.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: This will completely delete the user's account from the system. Proceed?")) return;
    const res = await deleteAdmin(id);
    if (res.success) {
      show("User account deleted.", "success");
      setSelectedAdmin(null);
      fetchAdmins();
    } else {
      show(res.message, "error");
    }
  };

  const filteredAdmins = admins.filter(a => {
    const term = search.toLowerCase();
    return (a.name?.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term) || a.university?.toLowerCase().includes(term));
  });

  return (
    <div style={{ display: "flex", gap: 20, height: "100%" }}>
      {ToastEl}
      
      {/* Left List */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 15, overflowY: "auto", paddingRight: 5 }}>
        <PageHeader title="Manage Admins" subtitle={`Active University Admins: ${admins.length}`} />
        
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "0 15px", boxShadow: "var(--shadow-sm)" }}>
          <SearchIcon size={15} color="var(--text-ph)" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)} 
            placeholder="Search admins by name, email, or university..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, padding: "12px 0", background: "transparent", color: "var(--text-h)", fontFamily: "inherit" }}
          />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text-ph)", cursor: "pointer", display: "flex" }}><XIcon size={14}/></button>}
        </div>

        {loading && <LoadingScreen message="Loading active admins..." />}

        {!loading && filteredAdmins.length === 0 && (
          <EmptyState icon={<ShieldCheckIcon size={44} />} title="No admins found" description="Try adjusting your search terms." action={<Button variant="secondary" onClick={() => setSearch("")}>Clear Search</Button>} />
        )}

        {!loading && (
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
        <div style={{ width: 380, flexShrink: 0, background: "var(--surface)", borderLeft: "1px solid var(--border)", padding: "24px", display: "flex", flexDirection: "column", gap: 20, animation: "slideInRight .3s ease both" }}>
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
            <Button variant="secondary" onClick={() => handleDowngrade(selectedAdmin.id || selectedAdmin._id)} style={{ padding: "12px" }}>
              Downgrade to Student
            </Button>
            <Button variant="danger" onClick={() => handleDelete(selectedAdmin.id || selectedAdmin._id)} style={{ padding: "12px" }}>
              <XIcon size={14} /> Delete Account
            </Button>
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
