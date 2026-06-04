import React, { useEffect } from "react";
import { CheckIcon, XIcon, AlertTriangleIcon, InfoIcon } from "./Icons";

const ICONS = {
  success: <CheckIcon size={16} />,
  error: <XIcon size={16} />,
  warning: <AlertTriangleIcon size={16} />,
  info: <InfoIcon size={16} />,
};

const COLORS = {
  success: { bg: "#F0FDF4", border: "#86EFAC", text: "#15803D", icon: "#16A34A" },
  error:   { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626", icon: "#EF4444" },
  warning: { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E", icon: "#D97706" },
  info:    { bg: "#EFF6FF", border: "#93C5FD", text: "#1E40AF", icon: "#2563EB" },
};

export default function Toast({ message, type = "info", onClose, duration = 4500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, onClose, duration]);

  if (!message) return null;

  const c = COLORS[type];

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      display: "flex", alignItems: "flex-start", gap: 12,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: "14px 18px", maxWidth: 400,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      animation: "slideUp 0.22s ease",
    }}>
      <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>{ICONS[type]}</span>
      <p style={{ color: c.text, fontSize: 13, fontWeight: 500, lineHeight: 1.5, flex: 1 }}>{message}</p>
      <button onClick={onClose} style={{ background: "none", border: "none", color: c.text, opacity: 0.6, padding: 0, lineHeight: 1, flexShrink: 0 }}>
        <XIcon size={14} />
      </button>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// Hook for easy toast management
import { useState, useCallback } from "react";
export function useToast() {
  const [toast, setToast] = useState({ message: "", type: "info" });
  const show = useCallback((message, type = "info") => setToast({ message, type }), []);
  const hide = useCallback(() => setToast({ message: "", type: "info" }), []);
  const ToastEl = <Toast message={toast.message} type={toast.type} onClose={hide} />;
  return { show, ToastEl };
}
