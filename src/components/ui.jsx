import React, { useState, useRef, useEffect } from "react";

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", loading = false, fullWidth = false, style: customStyle = {}, ...props }) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 7, fontWeight: 600, border: "none",
    cursor: loading || props.disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", lineHeight: 1, position: "relative", overflow: "hidden",
    opacity: props.disabled || loading ? 0.6 : 1,
    width: fullWidth ? "100%" : "auto",
    transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
    transform: pressed ? "scale(0.97)" : hovered ? "scale(1.02) translateY(-1px)" : "scale(1)",
    letterSpacing: "0.01em",
    userSelect: "none",
  };

  const sizes = {
    xs: { padding: "6px 12px",  fontSize: 11.5, borderRadius: 8,  gap: 5 },
    sm: { padding: "8px 16px",  fontSize: 12.5, borderRadius: 9,  gap: 6 },
    md: { padding: "10px 22px", fontSize: 13.5, borderRadius: 11, gap: 7 },
    lg: { padding: "13px 30px", fontSize: 14.5, borderRadius: 13, gap: 8 },
    xl: { padding: "16px 36px", fontSize: 15.5, borderRadius: 14, gap: 9 },
  };

  const variants = {
    primary: {
      background: hovered ? "linear-gradient(135deg,#1D4ED8,#2563EB)" : "linear-gradient(135deg,#2563EB,#3B82F6)",
      color: "#fff",
      boxShadow: hovered ? "0 8px 25px rgba(37,99,235,0.45)" : "0 4px 14px rgba(37,99,235,0.3)",
    },
    secondary: {
      background: hovered ? "#E2E8F0" : "#F1F5F9",
      color: "#334155",
      boxShadow: "none",
      border: "1.5px solid #E2E8F0",
    },
    danger: {
      background: hovered ? "linear-gradient(135deg,#DC2626,#EF4444)" : "linear-gradient(135deg,#EF4444,#F87171)",
      color: "#fff",
      boxShadow: hovered ? "0 8px 20px rgba(239,68,68,0.4)" : "0 4px 12px rgba(239,68,68,0.25)",
    },
    ghost: {
      background: hovered ? "#EFF6FF" : "transparent",
      color: "#2563EB",
      boxShadow: "none",
    },
    success: {
      background: hovered ? "linear-gradient(135deg,#15803D,#16A34A)" : "linear-gradient(135deg,#16A34A,#22C55E)",
      color: "#fff",
      boxShadow: hovered ? "0 8px 20px rgba(22,163,74,0.4)" : "0 4px 12px rgba(22,163,74,0.25)",
    },
    outline: {
      background: hovered ? "#EFF6FF" : "transparent",
      color: "#2563EB",
      border: "2px solid #2563EB",
      boxShadow: hovered ? "0 4px 14px rgba(37,99,235,0.2)" : "none",
    },
    white: {
      background: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
      color: "#1D4ED8",
      boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.15)" : "0 4px 12px rgba(0,0,0,0.1)",
      backdropFilter: "blur(8px)",
    },
  };

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...customStyle }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      {loading ? <Spinner size={parseInt(sizes[size].fontSize) - 1} /> : children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon, hint, suffix, ...props }) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{
          fontSize: 12.5, fontWeight: 600,
          color: focused ? "#2563EB" : error ? "#DC2626" : "#475569",
          transition: "color 0.2s",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
            color: focused ? "#2563EB" : error ? "#EF4444" : "#94A3B8",
            display: "flex", transition: "color 0.2s", zIndex: 1,
          }}>
            {icon}
          </span>
        )}
        <input
          style={{
            width: "100%",
            padding: icon ? "12px 14px 12px 40px" : "12px 14px",
            paddingRight: suffix ? "44px" : "14px",
            border: `2px solid ${focused ? "#3B82F6" : error ? "#FCA5A5" : "#E2E8F0"}`,
            borderRadius: 12,
            fontSize: 13.5,
            background: error ? "#FEF2F2" : focused ? "#fff" : "#FAFBFC",
            color: "#0F172A",
            outline: "none",
            transition: "all 0.2s ease",
            boxShadow: focused ? "0 0 0 4px rgba(59,130,246,0.12)" : "none",
          }}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...props}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p style={{
          fontSize: 11.5, color: "#DC2626", fontWeight: 500,
          display: "flex", alignItems: "center", gap: 4,
          animation: "slideDown 0.2s ease",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
      {hint && !error && <p style={{ fontSize: 11.5, color: "#94A3B8" }}>{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, options = [], icon, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{
          fontSize: 12.5, fontWeight: 600,
          color: focused ? "#2563EB" : error ? "#DC2626" : "#475569",
          transition: "color 0.2s",
        }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: focused ? "#2563EB" : "#94A3B8", display: "flex", transition: "color 0.2s", zIndex: 1 }}>
            {icon}
          </span>
        )}
        <select
          style={{
            width: "100%",
            padding: icon ? "12px 38px 12px 40px" : "12px 38px 12px 14px",
            border: `2px solid ${focused ? "#3B82F6" : error ? "#FCA5A5" : "#E2E8F0"}`,
            borderRadius: 12, fontSize: 13.5,
            background: error ? "#FEF2F2" : focused ? "#fff" : "#FAFBFC",
            color: props.value ? "#0F172A" : "#94A3B8",
            outline: "none", cursor: "pointer",
            appearance: "none",
            transition: "all 0.2s ease",
            boxShadow: focused ? "0 0 0 4px rgba(59,130,246,0.12)" : "none",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        >
          {options.map(({ value, label: l }) => (
            <option key={value} value={value}>{l}</option>
          ))}
        </select>
        <span style={{ position: "absolute", right: 13, top: "50%", transform: `translateY(-50%) ${focused ? "rotate(180deg)" : "rotate(0deg)"}`, color: "#94A3B8", pointerEvents: "none", transition: "transform 0.2s" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>
      {error && (
        <p style={{ fontSize: 11.5, color: "#DC2626", fontWeight: 500, display: "flex", alignItems: "center", gap: 4, animation: "slideDown 0.2s ease" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, hover = false, onClick, glass = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: glass ? "rgba(255,255,255,0.7)" : "#fff",
        backdropFilter: glass ? "blur(12px)" : "none",
        borderRadius: 16,
        border: `1px solid ${hovered ? "#BFDBFE" : "#F1F5F9"}`,
        boxShadow: hovered
          ? "0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(37,99,235,0.08)"
          : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "blue" }) {
  const colors = {
    blue:   { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
    green:  { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC" },
    orange: { bg: "#FFF7ED", text: "#9A3412", border: "#FED7AA" },
    red:    { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
    purple: { bg: "#FAF5FF", text: "#6B21A8", border: "#DDD6FE" },
    gray:   { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" },
    yellow: { bg: "#FEFCE8", text: "#854D0E", border: "#FDE68A" },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 700,
      padding: "3px 9px", borderRadius: 20,
      letterSpacing: "0.2px", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="animate-fadeInUp" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13.5, color: "#64748B", marginTop: 5, lineHeight: 1.6 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="animate-fadeInUp" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center", gap: 14 }}>
      {icon && (
        <div style={{ color: "#CBD5E1", marginBottom: 4, animation: "float 3s ease-in-out infinite" }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#475569" }}>{title}</h3>
      {description && <p style={{ fontSize: 13.5, color: "#94A3B8", maxWidth: 340, lineHeight: 1.7 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: 18 }}>
      <div style={{ position: "relative", width: 52, height: 52 }}>
        <div style={{ position: "absolute", inset: 0, border: "3px solid #EFF6FF", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, border: "3px solid transparent", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ position: "absolute", inset: 8, background: "#EFF6FF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 8, height: 8, background: "#2563EB", borderRadius: "50%", animation: "pulse-ring 1.5s ease infinite" }} />
        </div>
      </div>
      <p style={{ color: "#64748B", fontSize: 13.5, fontWeight: 500 }}>{message}</p>
    </div>
  );
}

// ─── ErrorBox ─────────────────────────────────────────────────────────────────
export function ErrorBox({ message, onRetry }) {
  return (
    <div className="animate-slideDown" style={{
      background: "linear-gradient(135deg,#FEF2F2,#FFF5F5)",
      border: "1.5px solid #FCA5A5", borderRadius: 14,
      padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start",
      boxShadow: "0 4px 12px rgba(239,68,68,0.1)",
    }}>
      <div style={{ width: 36, height: 36, background: "#FEE2E2", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: "#DC2626", fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} style={{
            marginTop: 10, background: "none", border: "1.5px solid #FCA5A5",
            color: "#DC2626", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            transition: "all 0.15s",
          }}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  if (!label) return <div style={{ height: 1, background: "#F1F5F9", margin: "20px 0" }} />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
      <span style={{ fontSize: 11.5, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    PENDING:  { color: "yellow", label: "Pending Review" },
    APPROVED: { color: "green",  label: "Approved" },
    REJECTED: { color: "red",    label: "Rejected" },
  };
  const s = map[status] || map.PENDING;
  return <Badge color={s.color}>{s.label}</Badge>;
}

// ─── StarRating ───────────────────────────────────────────────────────────────
export function StarRating({ rating, size = 14, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= (hover || rating);
        return (
          <svg key={s} width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ cursor: interactive ? "pointer" : "default", transition: "all 0.15s", transform: hover === s ? "scale(1.2)" : "scale(1)" }}
            onMouseEnter={() => interactive && setHover(s)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(s)}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      })}
      {rating > 0 && <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginLeft: 4 }}>{Number(rating).toFixed(1)}</span>}
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", variant = "danger", loading = false }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, padding: "24px",
          maxWidth: 420, width: "90%",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          animation: "slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 10, letterSpacing: "-0.5px" }}>{title}</h3>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>{cancelText}</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
