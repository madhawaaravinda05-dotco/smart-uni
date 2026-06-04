import React, {
  createContext, useContext, useState, useCallback,
  useEffect, useRef,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ─── Helpers ─────────────────────────────────────────────────────────────────*/
const SEEN_KEY = "uc_seen_posts"; // sessionStorage key for known post IDs

function getSeenIds() {
  try { return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]")); }
  catch { return new Set(); }
}
function saveSeenIds(set) {
  try { sessionStorage.setItem(SEEN_KEY, JSON.stringify([...set])); } catch {}
}

const CATEGORY_LABELS = {
  BOARDING:  { emoji: "🏠", label: "New Boarding",  type: "info"    },
  FOOD:      { emoji: "🍽️",  label: "New Food Spot", type: "success" },
  TRANSPORT: { emoji: "🚌", label: "New Transport",  type: "info"    },
};

function formatTime(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 60000);
  if (diff < 1)  return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/* ─── Provider ────────────────────────────────────────────────────────────────*/
export function AuthProvider({ children }) {

  const [user,  setUser]  = useState(() => {
    try { const s = sessionStorage.getItem("uc_user"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const [notifications, setNotifications] = useState([]);

  // Keep a ref for the polling interval so we can clear it
  const pollRef   = useRef(null);
  // Tracks whether first poll has run (to avoid "all existing posts = new" on first load)
  const firstPoll = useRef(true);

  const login = (userData) => {
    setUser(userData);
    setNotifications([]);
    sessionStorage.setItem("uc_user", JSON.stringify(userData));
    firstPoll.current = true; // reset so we re-baseline on next login
  };

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setNotifications([]);
    sessionStorage.removeItem("uc_user");
    sessionStorage.removeItem(SEEN_KEY);
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  /* ── Notification helpers ── */
  const markAllRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);

  const markRead = useCallback((id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);

  const dismissNotification = useCallback((id) =>
    setNotifications(prev => prev.filter(n => n.id !== id)), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ── Poll for new posts ── */
  const checkNewPosts = useCallback(async (currentUser) => {
    if (!currentUser?.university) return;

    try {
      const res = await axios.get(
        `${BASE_URL}/api/posts/active/${encodeURIComponent(currentUser.university)}`,
        { withCredentials: true }
      );

      const posts = Array.isArray(res.data) ? res.data : [];
      const seenIds = getSeenIds();

      if (firstPoll.current) {
        // On the very first poll after login: just baseline all current posts as "seen"
        // so we don't spam the user with every existing listing
        posts.forEach(p => seenIds.add(p._id || p.id));
        saveSeenIds(seenIds);
        firstPoll.current = false;
        return;
      }

      // On subsequent polls: find posts we've never seen
      const newPosts = posts.filter(p => !seenIds.has(p._id || p.id));

      if (newPosts.length > 0) {
        const newNotifs = newPosts.map(p => {
          const cat = CATEGORY_LABELS[p.category] || { emoji: "📌", label: "New Listing", type: "info" };
          const now = new Date();
          return {
            id: `notif_${p._id || p.id}_${now.getTime()}`,
            postId: p._id || p.id,
            type: cat.type,
            title: `${cat.emoji} ${cat.label} — ${p.title}`,
            body:  `Posted near ${p.area || currentUser.area || "your campus"} · ${currentUser.university}`,
            time:  formatTime(now),
            timestamp: now,
            read: false,
          };
        });

        setNotifications(prev => {
          // Prepend new notifications, cap at 50 total
          const merged = [...newNotifs, ...prev].slice(0, 50);
          return merged;
        });

        // Mark all new posts as seen
        newPosts.forEach(p => seenIds.add(p._id || p.id));
        saveSeenIds(seenIds);
      }
    } catch (_) {
      // Silently ignore network errors during polling
    }
  }, []);

  /* ── Start / stop polling when user changes ── */
  useEffect(() => {
    if (!user) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }

    // Run immediately, then every 30 seconds
    checkNewPosts(user);
    pollRef.current = setInterval(() => checkNewPosts(user), 30_000);

    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [user, checkNewPosts]);

  /* ── Update notification timestamps every minute (for "X min ago") ── */
  useEffect(() => {
    const t = setInterval(() => {
      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          time: n.timestamp ? formatTime(new Date(n.timestamp)) : n.time,
        }))
      );
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const isStudent     = user?.role === "ROLE_STUDENT";
  const isAdmin       = user?.role === "ROLE_ADMIN";
  const isMasterAdmin = user?.role === "ROLE_MASTER_ADMIN";

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      isStudent, isAdmin, isMasterAdmin,
      notifications, unreadCount, markAllRead, markRead, dismissNotification,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
