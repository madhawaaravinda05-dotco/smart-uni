import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitAdminRequest, getMyAdminRequestStatus } from "../api/api";
import { Button, PageHeader, Card, Badge } from "../components/ui";
import { useToast } from "../components/Toast";
import { UserIcon, MailIcon, MapPinIcon, BuildingIcon, ShieldCheckIcon, LogOutIcon, StarIcon, IdCardIcon, CameraIcon, CheckIcon, ClockIcon, XIcon } from "../components/Icons";

const ROLE_META = {
  ROLE_STUDENT:      { label: "Student",      color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", desc: "Browse boardings, food & transport near your campus." },
  ROLE_ADMIN:        { label: "Campus Admin",  color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC", desc: "Moderate listings submitted for your assigned university." },
  ROLE_MASTER_ADMIN: { label: "Master Admin",  color: "#7C3AED", bg: "#FAF5FF", border: "#DDD6FE", desc: "Manage all universities and approve campus admin access." },
};

const YEAR_LABELS = { 1: "Year 1 — First Year", 2: "Year 2 — Second Year", 3: "Year 3 — Third Year", 4: "Year 4 — Fourth Year", 5: "Year 5 — Postgraduate" };

export default function Profile() {
  const { user, logout, isMasterAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { show, ToastEl } = useToast();
  const [confirmLogout, setConfirmLogout] = useState(false);

  // ── Admin Application State ───────────────────────────────────────────────
  const [adminRequestStatus, setAdminRequestStatus] = useState(null); // null | "PENDING" | "APPROVED" | "REJECTED"
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [idCardError, setIdCardError] = useState("");
  const [applying, setApplying] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const fileInputRef = useRef(null);

  const role = ROLE_META[user?.role] || ROLE_META.ROLE_STUDENT;
  const yearOfStudy = user?.yearOfStudy || 0;
  const isEligibleForAdmin = user?.role === "ROLE_STUDENT" && yearOfStudy >= 3;
  const isStudentButNotEligible = user?.role === "ROLE_STUDENT" && yearOfStudy < 3 && yearOfStudy > 0;

  // Check existing admin request status on mount
  useEffect(() => {
    if (isEligibleForAdmin) {
      setCheckingStatus(true);
      getMyAdminRequestStatus().then((res) => {
        setCheckingStatus(false);
        if (res.success && res.data?.status && res.data.status !== "NONE") {
          setAdminRequestStatus(res.data.status);
        } else {
          setAdminRequestStatus(null);
        }
      });
    }
  }, [isEligibleForAdmin]);

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── File handling ─────────────────────────────────────────────────────────
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

  const validateAndSetFile = (file) => {
    setIdCardError("");
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setIdCardError("Only JPG and PNG images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setIdCardError("File size must be under 5 MB.");
      return;
    }
    setIdCardFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setIdCardPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const removeFile = () => {
    setIdCardFile(null);
    setIdCardPreview(null);
    setIdCardError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit admin application ──────────────────────────────────────────────
  const handleApply = async () => {
    if (!idCardFile) {
      setIdCardError("Please upload your university ID card photo.");
      return;
    }
    setApplying(true);
    const formData = new FormData();
    formData.append("idCard", idCardFile);
    formData.append("university", user?.university || "");
    formData.append("yearOfStudy", yearOfStudy);

    const res = await submitAdminRequest(formData);
    setApplying(false);

    if (!res.success) {
      show(res.message || "Failed to submit request. Please try again.", "error");
      return;
    }
    setAdminRequestStatus("PENDING");
    show("Your admin request has been submitted! The master admin will review your application.", "success");
  };

  // Build info fields based on role
  const fields = [
    { label: "Full Name",    value: user?.name,       Icon: UserIcon },
    { label: "Email",        value: user?.email,      Icon: MailIcon },
    ...(isMasterAdmin ? [] : [
      { label: "University", value: user?.university, Icon: BuildingIcon },
      { label: "Campus Area",value: user?.area,       Icon: MapPinIcon },
    ]),
    ...(user?.role === "ROLE_STUDENT" && user?.yearOfStudy ? [
      { label: "Year of Study", value: YEAR_LABELS[user.yearOfStudy] || `Year ${user.yearOfStudy}`, Icon: StarIcon },
    ] : []),
  ];

  // ── Status display config ─────────────────────────────────────────────────
  const STATUS_CONFIG = {
    PENDING:  { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: <ClockIcon size={18} color="#D97706" />, label: "Application Pending", desc: "Your admin request is being reviewed by the master admin. You'll be notified once a decision is made." },
    APPROVED: { color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC", icon: <CheckIcon size={18} color="#16A34A" />, label: "Application Approved!", desc: "Congratulations! Your admin access has been approved. Please log out and log back in to access your admin features." },
    REJECTED: { color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", icon: <XIcon size={18} color="#DC2626" />,    label: "Application Declined", desc: "Unfortunately your admin request was declined. If you believe this was a mistake, please contact the university administration." },
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {ToastEl}
      <PageHeader title="My Profile" subtitle="Your account details and session." />

      {/* Avatar + Role hero */}
      <Card style={{ padding: "28px 30px", marginBottom: 16, overflow: "hidden", position: "relative" }}>
        {/* Decorative gradient bg */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${role.bg} 0%, white 60%)`, opacity: 0.5 }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 28, color: "white", flexShrink: 0, boxShadow: "0 8px 20px rgba(37,99,235,0.3)" }}>
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 8, letterSpacing: "-0.3px" }}>{user?.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: role.bg, color: role.color,
                border: `1px solid ${role.border}`,
                fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
              }}>
                <ShieldCheckIcon size={11} color={role.color} /> {role.label}
              </span>
              {!isMasterAdmin && user?.university && (
                <span style={{ fontSize: 11.5, color: "#64748B", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                  <BuildingIcon size={11} color="#94A3B8" /> {user.university}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 8, lineHeight: 1.5 }}>{role.desc}</p>
          </div>
        </div>
      </Card>

      {/* Info Fields */}
      <Card style={{ padding: "20px 24px", marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Account Details</h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {fields.map(({ label, value, Icon }, i) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "13px 0",
              borderBottom: i < fields.length - 1 ? "1px solid #F8FAFC" : "none",
            }}>
              <div style={{ width: 36, height: 36, background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", flexShrink: 0 }}>
                <Icon size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#334155" }}>{value || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Apply for Campus Admin ── */}
      {isEligibleForAdmin && (
        <Card style={{ padding: "24px 26px", marginBottom: 16, overflow: "hidden", position: "relative" }}>
          {/* Decorative gradient accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #7C3AED, #2563EB, #16A34A)", borderRadius: "16px 16px 0 0" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #FAF5FF, #EDE9FE)", border: "1.5px solid #DDD6FE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheckIcon size={17} color="#7C3AED" />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>Apply for Campus Admin</h3>
              <p style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>As a senior student (Year {yearOfStudy}), you're eligible to moderate content for your campus.</p>
            </div>
          </div>

          {/* ── Already applied — show status ── */}
          {adminRequestStatus && STATUS_CONFIG[adminRequestStatus] && (
            <div style={{
              background: STATUS_CONFIG[adminRequestStatus].bg,
              border: `1.5px solid ${STATUS_CONFIG[adminRequestStatus].border}`,
              borderRadius: 12, padding: "16px 18px",
              display: "flex", gap: 14, alignItems: "flex-start",
              animation: "slideDown 0.3s ease",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${STATUS_CONFIG[adminRequestStatus].bg}`,
                border: `1px solid ${STATUS_CONFIG[adminRequestStatus].border}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {STATUS_CONFIG[adminRequestStatus].icon}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: STATUS_CONFIG[adminRequestStatus].color, marginBottom: 4 }}>
                  {STATUS_CONFIG[adminRequestStatus].label}
                </div>
                <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
                  {STATUS_CONFIG[adminRequestStatus].desc}
                </p>
              </div>
            </div>
          )}

          {/* ── Application form ── */}
          {!adminRequestStatus && !checkingStatus && (
            <div style={{ animation: "slideDown 0.25s ease" }}>
              {/* Info banner */}
              <div style={{
                background: "linear-gradient(135deg, #EFF6FF, #FAF5FF)",
                border: "1.5px solid #DBEAFE",
                borderRadius: 11, padding: "12px 15px", marginBottom: 16,
                display: "flex", gap: 10, alignItems: "center",
              }}>
                <IdCardIcon size={16} color="#2563EB" />
                <span style={{ fontSize: 12, color: "#1E40AF", fontWeight: 500, lineHeight: 1.5 }}>
                  Upload your <strong>university ID card photo</strong> for verification. Only JPG/PNG, max 5 MB.
                </span>
              </div>

              {/* Upload area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !idCardFile && fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${idCardError ? "#FCA5A5" : dragOver ? "#7C3AED" : idCardFile ? "#86EFAC" : "#DDD6FE"}`,
                  borderRadius: 14,
                  padding: idCardFile ? "0" : "28px 20px",
                  textAlign: "center",
                  cursor: idCardFile ? "default" : "pointer",
                  background: idCardError ? "#FEF2F2" : dragOver ? "#FAF5FF" : idCardFile ? "#F0FDF4" : "#FAFBFC",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                {!idCardFile ? (
                  <>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: dragOver ? "linear-gradient(135deg, #EDE9FE, #FAF5FF)" : "linear-gradient(135deg, #F1F5F9, #F8FAFC)",
                      border: `1.5px solid ${dragOver ? "#DDD6FE" : "#E2E8F0"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px",
                      transition: "all 0.2s",
                    }}>
                      <CameraIcon size={22} color={dragOver ? "#7C3AED" : "#94A3B8"} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: dragOver ? "#7C3AED" : "#475569", marginBottom: 4 }}>
                      {dragOver ? "Drop your ID card here" : "Click to upload or drag & drop"}
                    </p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>JPG or PNG · Max 5 MB</p>
                  </>
                ) : (
                  <div style={{ position: "relative" }}>
                    {/* Preview image */}
                    <img
                      src={idCardPreview}
                      alt="University ID Card"
                      style={{
                        width: "100%", maxHeight: 220, objectFit: "cover",
                        borderRadius: 12, display: "block",
                      }}
                    />
                    {/* Overlay bar */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                      padding: "24px 14px 12px",
                      borderRadius: "0 0 12px 12px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckIcon size={14} color="#86EFAC" />
                        <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>
                          {idCardFile.name}
                        </span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                          ({(idCardFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        style={{
                          background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
                          borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                          color: "#fff", fontSize: 11, fontWeight: 600,
                          backdropFilter: "blur(4px)",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.7)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                      >
                        <XIcon size={11} color="#fff" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {idCardError && (
                <p style={{
                  fontSize: 11.5, color: "#DC2626", fontWeight: 500, marginTop: 8,
                  display: "flex", alignItems: "center", gap: 5,
                  animation: "slideDown 0.2s ease",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {idCardError}
                </p>
              )}

              {/* Submit button */}
              <div style={{ marginTop: 18 }}>
                <Button
                  fullWidth
                  loading={applying}
                  onClick={handleApply}
                  style={{
                    background: applying ? undefined : "linear-gradient(135deg, #7C3AED, #2563EB)",
                    boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
                  }}
                >
                  <ShieldCheckIcon size={14} color="#fff" />
                  Submit Admin Application
                </Button>
              </div>

              {/* Fine print */}
              <p style={{ fontSize: 10.5, color: "#CBD5E1", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
                Your request will be reviewed by the master admin. You'll receive a notification once approved.
              </p>
            </div>
          )}

          {/* Loading state */}
          {checkingStatus && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 32, height: 32, border: "3px solid #EDE9FE", borderTopColor: "#7C3AED",
                borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 10px",
              }} />
              <p style={{ fontSize: 12, color: "#94A3B8" }}>Checking application status...</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Not eligible yet — Year 1 or 2 ── */}
      {isStudentButNotEligible && (
        <Card style={{ padding: "22px 24px", marginBottom: 16, opacity: 0.75 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheckIcon size={16} color="#CBD5E1" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Campus Admin</h3>
              <p style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2, lineHeight: 1.5 }}>
                Students in <strong style={{ color: "#64748B" }}>Year 3, 4, or 5</strong> can apply to become a campus admin.
                You're currently in Year {yearOfStudy} — keep going!
              </p>
            </div>
            <Badge color="gray">Year {yearOfStudy}</Badge>
          </div>
        </Card>
      )}

      {/* Sign Out */}
      <Card style={{ padding: "20px 24px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>Sign out</h3>
        {!confirmLogout ? (
          <Button variant="secondary" onClick={() => setConfirmLogout(true)}>
            <LogOutIcon size={14} /> Sign out of my account
          </Button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "slideDown 0.2s ease" }}>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 10, padding: "12px 14px" }}>
              Are you sure you want to sign out? You'll need your email and password to sign back in.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setConfirmLogout(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleLogout}><LogOutIcon size={14} /> Yes, sign out</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
