import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Boardings from "./pages/Boardings";
import Food from "./pages/Food";
import Transport from "./pages/Transport";
import MapView from "./pages/MapView";
import Submit from "./pages/Submit";
import Profile from "./pages/Profile";
import AdminDesk from "./pages/AdminDesk";
import AdminPosts from "./pages/AdminPosts";
import AdminReports from "./pages/AdminReports";
import MasterPanel from "./pages/MasterPanel";
import AdminManagement from "./pages/AdminManagement";
import LandingPage from "./pages/LandingPage";

// ─── Route Guards ─────────────────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function StudentRoute({ children }) {
  const { user, isStudent } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function MasterRoute({ children }) {
  const { user, isMasterAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isMasterAdmin) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Student */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/boardings" element={<PrivateRoute><Boardings /></PrivateRoute>} />
      <Route path="/food"      element={<PrivateRoute><Food /></PrivateRoute>} />
      <Route path="/transport" element={<PrivateRoute><Transport /></PrivateRoute>} />
      <Route path="/map"       element={<PrivateRoute><MapView /></PrivateRoute>} />
      <Route path="/submit"    element={<PrivateRoute><Submit /></PrivateRoute>} />
      <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin"         element={<AdminRoute><AdminDesk /></AdminRoute>} />
      <Route path="/admin/posts"   element={<AdminRoute><AdminPosts /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

      {/* Master Admin */}
      <Route path="/master" element={<MasterRoute><MasterPanel /></MasterRoute>} />
      <Route path="/admin-management" element={<MasterRoute><AdminManagement /></MasterRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
