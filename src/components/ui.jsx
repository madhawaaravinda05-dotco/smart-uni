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
export function Select({ label, error, options = [], icon, className = "", value, onChange, ...props }) {
  const hasError = !!error;
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${hasError ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
          {label}
        </label>
      )}
      <div className="relative w-full group">
        {icon && (
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${hasError ? 'text-red-500' : (open ? 'text-primary-500' : 'text-slate-400 group-hover:text-primary-500')}`}>
            {icon}
          </span>
        )}
        
        {/* trigger */}
        <div
          onClick={() => setOpen(!open)}
          className={`w-full rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer flex items-center justify-between select-none
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3
            ${hasError 
              ? 'bg-red-50 border-2 border-red-300 text-slate-900 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
              : 'bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-primary-400'
            }
            ${open && !hasError ? 'bg-white dark:bg-slate-800 border-primary-500 ring-4 ring-primary-500/20' : ''}`}
        >
          <span className={selected?.value === "" ? "text-slate-400" : ""}>{selected?.label || "Select..."}</span>
          <span className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-primary-500' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>

        {/* dropdown menu */}
        {open && (
          <>
            <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[100] py-2 animate-slideDown overflow-y-auto max-h-60 origin-top flex flex-col">
              {options.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => { if (onChange) onChange({ target: { value: opt.value } }); setOpen(false); }}
                  className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors flex items-center justify-between ${
                    value === opt.value 
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className={opt.value === "" ? "text-slate-400" : ""}>{opt.label}</span>
                  {value === opt.value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary-600 dark:text-primary-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </>
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
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", hover = false, onClick, glass = false, style, ...props }) {
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
      style={style}
      {...props}
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

// ─── Dropdown ─────────────────────────────────────────────────────────────────
export function Dropdown({ value, onChange, options = [], className = "" }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className={`relative w-full md:w-48 ${className}`}>
      {/* trigger button */}
      <div 
        onClick={() => setOpen(!open)}
        className={`px-4 py-3 rounded-xl border bg-card text-sm font-medium cursor-pointer transition-all flex items-center justify-between group select-none ${open ? 'border-orange-500 ring-2 ring-orange-500/20 text-slate-800 dark:text-white' : 'border-border text-slate-600 dark:text-slate-300 hover:border-orange-300 hover:shadow-sm'}`}
      >
        <span className="truncate mr-2">{selected?.label}</span>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-orange-500' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* dropdown menu */}
      {open && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[100] py-2 animate-slideDown overflow-hidden flex flex-col origin-top">
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors flex items-center justify-between ${
                  value === opt.value 
                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
