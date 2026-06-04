/**
 * RatingModal.jsx
 *
 * A beautiful, interactive rating modal that lets students:
 *  - Rate a listing 1–5 stars with animated star picker
 *  - Write an optional review comment
 *  - See the existing average rating + review count
 *  - View recent reviews from other students
 *
 * Uses the existing `addReview` API endpoint.
 * Local state is used for optimistic updates after submission.
 */
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { addReview, getReviews } from "../api/api";
import { XIcon } from "./Icons";

/* ─── Animated interactive star picker ──────────────────────────────────────── */
function StarPicker({ value, onChange, size = 36 }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const colors = ["", "#EF4444", "#F97316", "#EAB308", "#22C55E", "#16A34A"];
  const active = hover || value;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map((s) => {
          const filled = s <= active;
          return (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(s)}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 4,
                transform: hover === s ? "scale(1.3)" : s <= active ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1)",
                filter: filled ? "drop-shadow(0 2px 6px rgba(245,158,11,.5))" : "none",
              }}
            >
              <svg width={size} height={size} viewBox="0 0 24 24"
                fill={filled ? "#F59E0B" : "none"}
                stroke={filled ? "#F59E0B" : "#D1D5DB"}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>
      {active > 0 && (
        <div style={{
          fontSize: 14, fontWeight: 700, color: colors[active],
          animation: "ratingLabel .2s ease both",
        }}>
          {labels[active]}
        </div>
      )}
    </div>
  );
}

/* ─── Single review row ──────────────────────────────────────────────────────── */
function ReviewRow({ review, theme }) {
  const initials = (review.studentName || "Student")[0].toUpperCase();
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Recently";

  return (
    <div style={{
      display: "flex", gap: 12, padding: "14px 0",
      borderBottom: `1px solid ${theme.divider}`,
    }}>
      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,#7C3AED,#9333EA)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: 14,
        boxShadow: "0 3px 10px rgba(124,58,237,.25)",
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary }}>
            {review.studentName || "Anonymous"}
          </span>
          <span style={{ fontSize: 11, color: theme.textFaint }}>{date}</span>
        </div>
        {/* Stars */}
        <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
          {[1,2,3,4,5].map(s => (
            <svg key={s} width={12} height={12} viewBox="0 0 24 24"
              fill={s <= review.rating ? "#F59E0B" : "none"}
              stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        {review.comment && (
          <p style={{ fontSize: 12.5, color: theme.textMuted, lineHeight: 1.65, margin: 0 }}>
            "{review.comment}"
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Rating bar (for distribution) ─────────────────────────────────────────── */
function RatingBar({ star, count, total, theme }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 11.5, color: theme.textMuted, width: 10, textAlign: "right", fontWeight: 600 }}>{star}</span>
      <svg width={11} height={11} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <div style={{ flex: 1, height: 6, background: theme.divider, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
          borderRadius: 99, transition: "width .5s ease",
        }} />
      </div>
      <span style={{ fontSize: 11, color: theme.textFaint, width: 28 }}>{count}</span>
    </div>
  );
}

/* ─── Main RatingModal ───────────────────────────────────────────────────────── */
export default function RatingModal({ post, gradient, onClose, onRated }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [userRating, setUserRating]   = useState(0);
  const [comment,    setComment]      = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitted,  setSubmitted]    = useState(false);
  const [error,      setError]        = useState("");

  // Local reviews state (seed with post.reviews from backend if any)
  const [reviews,   setReviews]   = useState(post.reviews || []);
  const [loadingRv, setLoadingRv] = useState(false);

  // Fetch reviews from backend on open
  useEffect(() => {
    const postId = post._id || post.id;
    if (!postId) return;
    setLoadingRv(true);
    getReviews(postId).then(res => {
      if (res.success && Array.isArray(res.data)) setReviews(res.data);
      setLoadingRv(false);
    });
  }, [post._id, post.id]);

  // Derived stats
  const totalRatings = reviews.length;
  const avgRating    = totalRatings > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
    : (post.rating || 0).toFixed(1);

  const dist = [5,4,3,2,1].map(s => ({
    star: s, count: reviews.filter(r => r.rating === s).length,
  }));

  const handleSubmit = async () => {
    if (!userRating) { setError("Please pick a star rating before submitting."); return; }
    setError(""); setSubmitting(true);
    const res = await addReview(post._id || post.id, { rating: userRating, comment: comment.trim() });
    setSubmitting(false);
    if (!res.success) { setError(res.message); return; }

    // Optimistic update
    const newReview = {
      rating: userRating,
      comment: comment.trim(),
      studentName: user?.name || "You",
      createdAt: new Date().toISOString(),
    };
    setReviews(prev => [newReview, ...prev]);
    setSubmitted(true);
    onRated?.({ rating: userRating, comment: comment.trim() });
  };

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(6px)",
          zIndex: 200,
          animation: "fadeIn .2s ease both",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 201,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, pointerEvents: "none",
      }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: theme.cardBg,
            borderRadius: 28, width: "100%", maxWidth: 540,
            maxHeight: "90vh", overflow: "hidden",
            display: "flex", flexDirection: "column",
            boxShadow: "0 32px 80px rgba(0,0,0,.3)",
            border: `1px solid ${theme.cardBorder}`,
            animation: "modalIn .28s cubic-bezier(0.34,1.56,0.64,1) both",
            pointerEvents: "auto",
          }}
        >
          {/* ── Header gradient banner ── */}
          <div style={{
            height: 140, background: gradient || "linear-gradient(135deg,#7C3AED,#9333EA)",
            position: "relative", flexShrink: 0,
          }}>
            {/* Close */}
            <button onClick={onClose} style={{
              position: "absolute", top: 14, right: 14,
              width: 34, height: 34, borderRadius: 11,
              background: "rgba(255,255,255,.2)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,.3)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", transition: "all .15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.3)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
            >
              <XIcon size={14} />
            </button>

            {/* Avg rating badge */}
            <div style={{
              position: "absolute", bottom: -22, left: 22,
              background: theme.cardBg, borderRadius: 16,
              border: `2px solid ${theme.cardBorder}`,
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#F59E0B", lineHeight: 1 }}>{avgRating}</div>
                <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width={11} height={11} viewBox="0 0 24 24"
                      fill={s <= Math.round(parseFloat(avgRating)) ? "#F59E0B" : "none"}
                      stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
              <div style={{ width: 1, height: 36, background: theme.divider }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: theme.textPrimary, lineHeight: 1 }}>{totalRatings}</div>
                <div style={{ fontSize: 10.5, color: theme.textMuted, marginTop: 2 }}>reviews</div>
              </div>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "38px 24px 24px" }} className="no-scroll">

            {/* Title */}
            <h2 style={{ fontSize: 18, fontWeight: 900, color: theme.textPrimary, letterSpacing: "-0.4px", marginBottom: 4 }}>
              {post.title}
            </h2>
            <p style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 20 }}>
              {post.area && `📍 ${post.area}`}
            </p>

            {/* Rating distribution bars */}
            {totalRatings > 0 && (
              <div style={{
                background: theme.accentBg, borderRadius: 16, padding: "14px 16px",
                border: `1px solid ${theme.accentBorder}`, marginBottom: 22,
              }}>
                {dist.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={totalRatings} theme={theme} />
                ))}
              </div>
            )}

            {/* ── Rate form ── */}
            {!submitted ? (
              <div style={{
                background: theme.dark ? "rgba(255,255,255,.04)" : "#FAFAFA",
                border: `1.5px solid ${theme.divider}`,
                borderRadius: 20, padding: "20px",
                marginBottom: 22,
              }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: theme.textPrimary, marginBottom: 16, textAlign: "center" }}>
                  Rate this listing
                </h3>
                <StarPicker value={userRating} onChange={setUserRating} size={36} />

                {userRating > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, textTransform: "uppercase", letterSpacing: ".6px", display: "block", marginBottom: 7 }}>
                      Your review (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your experience — what did you like or dislike?"
                      maxLength={300}
                      rows={3}
                      style={{
                        width: "100%", padding: "12px 14px",
                        border: `1.5px solid ${theme.inputBorder}`,
                        borderRadius: 12, fontSize: 13, lineHeight: 1.65,
                        background: theme.inputBg, color: theme.textPrimary,
                        outline: "none", resize: "none", fontFamily: "inherit",
                        transition: "border-color .15s, box-shadow .15s",
                      }}
                      onFocus={e => { e.target.style.borderColor = theme.accent; e.target.style.boxShadow = theme.inputShadow; }}
                      onBlur={e => { e.target.style.borderColor = theme.inputBorder; e.target.style.boxShadow = "none"; }}
                    />
                    <div style={{ fontSize: 10.5, color: theme.textFaint, textAlign: "right", marginTop: 4 }}>
                      {comment.length}/300
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{
                    background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10,
                    padding: "10px 14px", marginTop: 12,
                    fontSize: 12.5, color: "#DC2626", fontWeight: 500,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!userRating || submitting}
                  style={{
                    width: "100%", marginTop: 14,
                    padding: "13px 0", borderRadius: 14, border: "none",
                    background: !userRating
                      ? "#E5E7EB"
                      : "linear-gradient(135deg,#7C3AED,#9333EA)",
                    color: !userRating ? "#9CA3AF" : "#fff",
                    fontSize: 14, fontWeight: 700, cursor: !userRating ? "not-allowed" : "pointer",
                    boxShadow: userRating ? "0 6px 20px rgba(124,58,237,.35)" : "none",
                    transition: "all .2s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: userRating && !submitting ? "none" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                  onMouseEnter={e => { if (userRating) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(124,58,237,.45)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = userRating ? "0 6px 20px rgba(124,58,237,.35)" : "none"; }}
                >
                  {submitting
                    ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spinAnim .7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Submitting...</>
                    : "Submit Rating"
                  }
                </button>
              </div>
            ) : (
              /* ── Success state ── */
              <div style={{
                background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
                border: "1.5px solid #86EFAC", borderRadius: 20, padding: "22px",
                marginBottom: 22, textAlign: "center",
                animation: "bounceIn .45s cubic-bezier(0.34,1.56,0.64,1) both",
              }}>
                <div style={{
                  width: 52, height: 52, background: "#16A34A", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                  animation: "checkPop .5s .1s cubic-bezier(0.34,1.56,0.64,1) both",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#15803D", marginBottom: 4 }}>
                  Thanks for rating!
                </div>
                <div style={{ fontSize: 12.5, color: "#16A34A" }}>
                  Your {userRating}-star review has been submitted.
                </div>
              </div>
            )}

            {/* ── Reviews list ── */}
            {reviews.length > 0 ? (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: theme.textPrimary, marginBottom: 4 }}>
                  Student Reviews
                  <span style={{ fontSize: 12, fontWeight: 500, color: theme.textFaint, marginLeft: 8 }}>({reviews.length})</span>
                </h3>
                <div>
                  {reviews.map((r, i) => <ReviewRow key={i} review={r} theme={theme} />)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
                <p style={{ fontSize: 13.5, color: theme.textMuted, fontWeight: 600 }}>No reviews yet</p>
                <p style={{ fontSize: 12, color: theme.textFaint, marginTop: 4 }}>Be the first to rate this listing!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:scale(.88) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes bounceIn { 0%{opacity:0;transform:scale(.6)} 60%{opacity:1;transform:scale(1.06)} 80%{transform:scale(.97)} 100%{transform:scale(1)} }
        @keyframes checkPop { 0%{transform:scale(0) rotate(-12deg);opacity:0} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes ratingLabel { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinAnim { to{transform:rotate(360deg)} }
        .no-scroll::-webkit-scrollbar{display:none}
        .no-scroll{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </>
  );
}
