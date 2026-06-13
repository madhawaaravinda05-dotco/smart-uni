import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitAdminRequest, getMyAdminRequestStatus } from "../api/api";
import { Button, PageHeader, Card, Badge } from "../components/ui";
import { useToast } from "../components/Toast";
import { UserIcon, MailIcon, MapPinIcon, BuildingIcon, ShieldCheckIcon, LogOutIcon, StarIcon, IdCardIcon, CameraIcon, CheckIcon, ClockIcon, XIcon } from "../components/Icons";

const ROLE_META = {
  ROLE_STUDENT:      { label: "Student",      color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", desc: "Browse boardings, food & transport near your campus." },
  ROLE_ADMIN:        { label: "Campus Admin",  color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", desc: "Moderate listings submitted for your assigned university." },
  ROLE_MASTER_ADMIN: { label: "Master Admin",  color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800", desc: "Manage all universities and approve campus admin access." },
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
    PENDING:  { color: "text-amber-600 dark:text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", icon: <ClockIcon size={18} className="text-amber-600 dark:text-amber-500" />, label: "Application Pending", desc: "Your admin request is being reviewed by the master admin. You'll be notified once a decision is made." },
    APPROVED: { color: "text-green-600 dark:text-green-500", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", icon: <CheckIcon size={18} className="text-green-600 dark:text-green-500" />, label: "Application Approved!", desc: "Congratulations! Your admin access has been approved. Please log out and log back in to access your admin features." },
    REJECTED: { color: "text-red-600 dark:text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", icon: <XIcon size={18} className="text-red-600 dark:text-red-500" />,    label: "Application Declined", desc: "Unfortunately your admin request was declined. If you believe this was a mistake, please contact the university administration." },
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {ToastEl}
      <PageHeader title="My Profile" subtitle="Your account details and session." />

      {/* Avatar + Role hero */}
      <Card className="p-6 md:p-8 mb-6 overflow-hidden relative">
        {/* Decorative gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/10 dark:to-transparent pointer-events-none" />
        
        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center font-black text-3xl text-white shrink-0 shadow-lg shadow-primary-500/30">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{user?.name}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${role.bg} ${role.color} ${role.border}`}>
                <ShieldCheckIcon size={14} /> {role.label}
              </span>
              {!isMasterAdmin && user?.university && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BuildingIcon size={14} className="text-slate-400" /> {user.university}
                </span>
              )}
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2.5 font-medium leading-relaxed">{role.desc}</p>
          </div>
        </div>
      </Card>

      {/* Info Fields */}
      <Card className="p-6 md:p-8 mb-6">
        <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Account Details</h3>
        <div className="flex flex-col gap-4">
          {fields.map(({ label, value, Icon }, i) => (
            <div key={label} className={`flex items-center gap-4 pb-4 ${i < fields.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200">{value || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Apply for Campus Admin ── */}
      {isEligibleForAdmin && (
        <Card className="p-6 md:p-8 mb-6 overflow-hidden relative">
          {/* Decorative gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500" />

          <div className="flex items-center gap-4 mb-6 mt-2">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
              <ShieldCheckIcon size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Apply for Campus Admin</h3>
              <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">As a senior student (Year {yearOfStudy}), you're eligible to moderate content for your campus.</p>
            </div>
          </div>

          {/* ── Already applied — show status ── */}
          {adminRequestStatus && STATUS_CONFIG[adminRequestStatus] && (
            <div className={`p-4 rounded-xl border-2 flex gap-4 items-start ${STATUS_CONFIG[adminRequestStatus].bg} ${STATUS_CONFIG[adminRequestStatus].border} animate-slide-down`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-white/50 dark:bg-slate-900/50 ${STATUS_CONFIG[adminRequestStatus].border}`}>
                {STATUS_CONFIG[adminRequestStatus].icon}
              </div>
              <div>
                <div className={`text-[13.5px] font-bold mb-1 ${STATUS_CONFIG[adminRequestStatus].color}`}>
                  {STATUS_CONFIG[adminRequestStatus].label}
                </div>
                <p className="text-[12.5px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {STATUS_CONFIG[adminRequestStatus].desc}
                </p>
              </div>
            </div>
          )}

          {/* ── Application form ── */}
          {!adminRequestStatus && !checkingStatus && (
            <div className="animate-slide-down space-y-4">
              {/* Info banner */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800/50">
                <IdCardIcon size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-[12.5px] text-blue-800 dark:text-blue-300 font-medium leading-snug">
                  Upload your <strong className="font-bold">university ID card photo</strong> for verification. Only JPG/PNG, max 5 MB.
                </span>
              </div>

              {/* Upload area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !idCardFile && fileInputRef.current?.click()}
                className={`relative overflow-hidden rounded-2xl border-2 border-dashed text-center transition-all duration-200 ${
                  idCardFile ? 'p-0 border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10 cursor-default' : 
                  dragOver ? 'p-8 border-primary-500 bg-primary-50 dark:bg-primary-900/20 cursor-pointer' : 
                  idCardError ? 'p-8 border-red-300 bg-red-50 dark:bg-red-900/20 cursor-pointer' : 
                  'p-8 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!idCardFile ? (
                  <>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                      dragOver ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <CameraIcon size={24} />
                    </div>
                    <p className={`text-[13.5px] font-bold mb-1 ${dragOver ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {dragOver ? "Drop your ID card here" : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-[11.5px] font-medium text-slate-400">JPG or PNG · Max 5 MB</p>
                  </>
                ) : (
                  <div className="relative group">
                    {/* Preview image */}
                    <img
                      src={idCardPreview}
                      alt="University ID Card"
                      className="w-full max-h-[260px] object-cover block"
                    />
                    {/* Overlay bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-4 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckIcon size={16} className="text-green-400" />
                        <span className="text-[13px] font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">
                          {idCardFile.name}
                        </span>
                        <span className="text-[11px] font-medium text-white/60">
                          ({(idCardFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-red-500/80 text-white text-[11.5px] font-bold backdrop-blur-md transition-colors"
                      >
                        <XIcon size={14} /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {idCardError && (
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-red-600 dark:text-red-400 mt-2 animate-slide-down">
                  <XIcon size={14} /> {idCardError}
                </p>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <Button
                  fullWidth
                  loading={applying}
                  onClick={handleApply}
                  className="bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-700 hover:to-primary-700 border-none shadow-lg shadow-purple-500/20"
                >
                  <ShieldCheckIcon size={16} />
                  Submit Admin Application
                </Button>
              </div>

              {/* Fine print */}
              <p className="text-[11px] font-medium text-slate-400 text-center leading-relaxed">
                Your request will be reviewed by the master admin.<br/>You'll receive a notification once approved.
              </p>
            </div>
          )}

          {/* Loading state */}
          {checkingStatus && (
            <div className="text-center py-8">
              <div className="w-8 h-8 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin mx-auto mb-3" />
              <p className="text-[12.5px] font-medium text-slate-500">Checking application status...</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Not eligible yet — Year 1 or 2 ── */}
      {isStudentButNotEligible && (
        <Card className="p-5 md:p-6 mb-6 opacity-90 border-dashed">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <ShieldCheckIcon size={18} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-[13.5px] font-bold text-slate-700 dark:text-slate-300">Campus Admin Requirements</h3>
              <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                Students in <strong className="font-bold text-slate-700 dark:text-slate-300">Year 3, 4, or 5</strong> can apply to become a campus admin. You're currently in Year {yearOfStudy} — keep going!
              </p>
            </div>
            <div className="shrink-0">
              <Badge variant="outline" color="gray">Year {yearOfStudy}</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Sign Out */}
      <Card className="p-6 md:p-8">
        <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white mb-5 uppercase tracking-wider">Sign out</h3>
        {!confirmLogout ? (
          <Button variant="secondary" onClick={() => setConfirmLogout(true)} className="w-full sm:w-auto">
            <LogOutIcon size={16} /> Sign out of my account
          </Button>
        ) : (
          <div className="animate-slide-down space-y-4">
            <p className="text-[13px] font-medium text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 rounded-xl p-4">
              Are you sure you want to sign out? You'll need your email and password to sign back in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" onClick={() => setConfirmLogout(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleLogout} className="flex-1 sm:flex-none">
                <LogOutIcon size={16} /> Yes, sign out
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
