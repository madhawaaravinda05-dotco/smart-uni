import React, { useState, useEffect } from "react";
import { getAdminRequests, getPlatformStats } from "../api/api";
import { PageHeader, Card, LoadingScreen, ErrorBox } from "../components/ui";
import { useToast } from "../components/Toast";
import { BuildingIcon, UserIcon, ShieldCheckIcon, TrendingUpIcon } from "../components/Icons";

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

// Helper component for the circular meter
function CircularMeter({ value, max, label, color, Icon }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = max === 0 ? circumference : circumference - (value / max) * circumference;

  return (
    <Card style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="90" height="90" style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
          {/* Background Ring */}
          <circle
            cx="45" cy="45" r={radius}
            stroke="#F1F5F9"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx="45" cy="45" r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div style={{ color: color }}>
          <Icon size={24} />
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{value.toLocaleString()}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginTop: 4 }}>{label}</div>
      </div>
    </Card>
  );
}


export default function MasterPanel() {
  const { ToastEl } = useToast();
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [uniTab, setUniTab]             = useState("all");   // "all" | "state" | "private"
  const [expandedUni, setExpandedUni]   = useState(null);

  const [platformStats, setPlatformStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);

  const load = async () => {
    setLoading(true); setError("");
    const [reqRes, statsRes] = await Promise.all([
      getAdminRequests(),
      getPlatformStats()
    ]);
    setLoading(false);
    
    if (reqRes.success && reqRes.data) { 
      setPendingRequests(reqRes.data.filter(r => r.status === "PENDING").length); 
    }
    if (statsRes.success) {
      setPlatformStats(statsRes.data);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Platform-wide stats ────────────────────────────────────────────────────
  const totalStudents  = platformStats?.totalStudents || 0;
  const totalAdmins    = platformStats?.totalAdmins || 0;
  const totalMasterAdmins = platformStats?.totalMasterAdmins || 1;
  const totalUnis      = ALL_UNIVERSITIES.length;
  const activeUnis     = platformStats?.activeUnis || 0;
  const maxMetersVal   = Math.max(totalStudents, 50);

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

      {loading && <LoadingScreen message="Loading platform stats..." />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {/* ── Circular Meters ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
            <CircularMeter 
              value={totalStudents} 
              max={maxMetersVal} 
              label="Total Students" 
              color="#2563EB" 
              Icon={UserIcon} 
            />
            <CircularMeter 
              value={totalAdmins} 
              max={maxMetersVal} 
              label="Campus Admins" 
              color="#16A34A" 
              Icon={ShieldCheckIcon} 
            />
            <CircularMeter 
              value={activeUnis} 
              max={totalUnis} 
              label="Active Universities" 
              color="#7C3AED" 
              Icon={BuildingIcon} 
            />
            <CircularMeter 
              value={pendingRequests} 
              max={Math.max(pendingRequests, 10)} 
              label="Pending Requests" 
              color="#D97706" 
              Icon={TrendingUpIcon} 
            />
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
                const total = totalStudents + totalAdmins + totalMasterAdmins;
                return [
                  { value: totalStudents, color: "#2563EB" },
                  { value: totalAdmins,   color: "#16A34A" },
                  { value: totalMasterAdmins, color: "#7C3AED" },
                ].map(({ value, color }, i) => (
                  <div key={i} style={{ width: `${(value / Math.max(total, 1)) * 100}%`, background: color, transition: "width 0.8s ease" }} />
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
        </>
      )}
    </div>
  );
}
