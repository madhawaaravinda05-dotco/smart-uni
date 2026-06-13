import React, { useState } from "react";

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 18, className = "" }) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "md", loading = false, fullWidth = false, className = "", ...props }) {
  const sizes = {
    xs: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    sm: "px-4 py-2 text-sm rounded-xl gap-2",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-7 py-3 text-base rounded-2xl gap-2.5",
    xl: "px-9 py-4 text-lg rounded-2xl gap-3",
  };

  const variants = {
    primary: "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glass hover:shadow-glass-hover hover:-translate-y-0.5",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700",
    danger: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5",
    ghost: "text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30",
    success: "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_4px_12px_rgba(22,163,74,0.25)] hover:shadow-[0_8px_20px_rgba(22,163,74,0.4)] hover:-translate-y-0.5",
    outline: "text-primary-600 dark:text-primary-400 border-2 border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30",
    white: "glass text-primary-700 hover:-translate-y-0.5 hover:shadow-glass-hover",
  };

  const baseClasses = "inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 ease-out active:scale-95 select-none";
  const widthClass = fullWidth ? "w-full" : "w-auto";
  const stateClass = (loading || props.disabled) ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer";

  return (
    <button
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${widthClass} ${stateClass} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={size === 'xs' ? 14 : size === 'sm' ? 16 : 18} /> : children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon, hint, suffix, className = "", ...props }) {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${hasError ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
          {label}
        </label>
      )}
      <div className="relative w-full group">
        {icon && (
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${hasError ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`}>
            {icon}
          </span>
        )}
        <input
          className={`w-full rounded-xl text-sm transition-all duration-200 outline-none
            ${icon ? 'pl-10' : 'pl-3.5'} ${suffix ? 'pr-11' : 'pr-3.5'} py-3
            ${hasError 
              ? 'bg-red-50 border-2 border-red-300 text-slate-900 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
              : 'bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
            } ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1 animate-slideDown">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, options = [], icon, className = "", ...props }) {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${hasError ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
          {label}
        </label>
      )}
      <div className="relative w-full group">
        {icon && (
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${hasError ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`}>
            {icon}
          </span>
        )}
        <select
          className={`w-full rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer appearance-none
            ${icon ? 'pl-10' : 'pl-3.5'} pr-10 py-3
            ${hasError 
              ? 'bg-red-50 border-2 border-red-300 text-slate-900 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
              : 'bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
            } ${className}`}
          {...props}
        >
          {options.map(({ value, label: l }) => (
            <option key={value} value={value}>{l}</option>
          ))}
        </select>
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1 animate-slideDown">
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
export function Card({ children, className = "", hover = false, onClick, glass = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl transition-all duration-300 ease-out overflow-hidden
        ${glass ? "glass" : "bg-card border border-border shadow-sm"}
        ${hover ? "hover:-translate-y-1 hover:shadow-glass-hover hover:border-primary-300 dark:hover:border-primary-700" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "blue", className = "" }) {
  const colors = {
    blue:   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    green:  "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    orange: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    red:    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    gray:   "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide whitespace-nowrap border ${colors[color] || colors.blue} ${className}`}>
      {children}
    </span>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between mb-8 gap-4 animate-fadeInUp">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center gap-4 animate-fadeInUp">
      {icon && (
        <div className="text-slate-300 dark:text-slate-600 mb-2 animate-[float_3s_ease-in-out_infinite]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      {description && <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[340px] leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-[55vh] gap-5 animate-fadeIn">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-primary-50 dark:border-primary-900/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
        <div className="absolute inset-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

// ─── ErrorBox ─────────────────────────────────────────────────────────────────
export function ErrorBox({ message, onRetry }) {
  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex gap-4 items-start shadow-sm animate-slideDown">
      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600 dark:text-red-400" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300 leading-relaxed">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 bg-transparent border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-4 py-1.5 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  if (!label) return <div className="h-px bg-slate-100 dark:bg-slate-800 my-5 w-full" />;
  return (
    <div className="flex items-center gap-3 my-6 w-full">
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">{label}</span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
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
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= (hover || rating);
        return (
          <svg key={s} width={size} height={size} viewBox="0 0 24 24"
            className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:scale-125' : ''} ${filled ? 'fill-amber-400 stroke-amber-400' : 'fill-none stroke-amber-300 dark:stroke-amber-600/50'}`}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            onMouseEnter={() => interactive && setHover(s)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(s)}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      })}
      {rating > 0 && <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1.5">{Number(rating).toFixed(1)}</span>}
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", variant = "danger", loading = false }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-[420px] w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-slideDown"
      >
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>{cancelText}</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
