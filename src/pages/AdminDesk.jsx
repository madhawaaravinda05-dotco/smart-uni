import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getPendingPosts, getActivePosts, getAdminReports } from "../api/api";
import { PageHeader, Card, LoadingScreen, ErrorBox } from "../components/ui";
import { HouseIcon, FoodIcon, BusIcon, ShieldCheckIcon, FlagIcon } from "../components/Icons";

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
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginTop: 4 }}>{label}</div>
      </div>
    </Card>
  );
}

export default function AdminDesk() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [stats, setStats] = useState({
    total: 0,
    boardings: 0,
    food: 0,
    transport: 0,
    reports: 0,
    pending: 0,
    active: 0
  });

  const load = async () => {
    setLoading(true);
    setError("");
    const [pendingRes, activeRes, reportsRes] = await Promise.all([
      getPendingPosts(user?.university),
      getActivePosts(user?.university),
      getAdminReports(user?.university),
    ]);
    setLoading(false);

    let allPosts = [];
    let pendingCount = 0;
    let activeCount = 0;

    if (pendingRes.success && pendingRes.data) {
       allPosts = [...allPosts, ...pendingRes.data];
       pendingCount = pendingRes.data.length;
    }
    if (activeRes.success && activeRes.data) {
       allPosts = [...allPosts, ...activeRes.data];
       activeCount = activeRes.data.length;
    }

    setStats({
      total: allPosts.length,
      boardings: allPosts.filter((p) => p.category === "BOARDING").length,
      food: allPosts.filter((p) => p.category === "FOOD").length,
      transport: allPosts.filter((p) => p.category === "TRANSPORT").length,
      reports: reportsRes.success && reportsRes.data ? reportsRes.data.length : 0,
      pending: pendingCount,
      active: activeCount
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        subtitle={`Dashboard metrics for ${user?.university || "your campus"}`}
      />

      {loading && <LoadingScreen message="Loading dashboard metrics..." />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top High-level Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <Card style={{ padding: 24, background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "white" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>Total Listings</div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{stats.total}</div>
            </Card>
            <Card style={{ padding: 24, background: "linear-gradient(135deg, #16A34A, #22C55E)", color: "white" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>Active Listings</div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{stats.active}</div>
            </Card>
            <Card style={{ padding: 24, background: "linear-gradient(135deg, #D97706, #F59E0B)", color: "white" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>Pending Review</div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{stats.pending}</div>
            </Card>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 8 }}>Listing Categories Breakdown</h3>
          
          {/* Circular Meters */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <CircularMeter 
               value={stats.boardings} 
               max={stats.total} 
               label="Boardings" 
               color="#2563EB" 
               Icon={HouseIcon} 
            />
            <CircularMeter 
               value={stats.food} 
               max={stats.total} 
               label="Food Spots" 
               color="#EA580C" 
               Icon={FoodIcon} 
            />
            <CircularMeter 
               value={stats.transport} 
               max={stats.total} 
               label="Transport" 
               color="#16A34A" 
               Icon={BusIcon} 
            />
            <CircularMeter 
               value={stats.reports} 
               max={Math.max(stats.total, 10)} // Arbitrary max for reports so ring is scaled nicely
               label="Pending Reports" 
               color="#DC2626" 
               Icon={FlagIcon} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
