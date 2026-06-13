import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Boardings from "./pages/Boardings";
import Food from "./pages/Food";
import Transport from "./pages/Transport";
import MapView from "./pages/MapView";
import Submit from "./pages/Submit";
import Profile from "./pages/Profile";
import AdminDesk from "./pages/AdminDesk";
import MasterPanel from "./pages/MasterPanel";
import AdminManagement from "./pages/AdminManagement";

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

function RootRedirect() {
  const { user, isAdmin, isMasterAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (isMasterAdmin) return <Navigate to="/master" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Student */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/boardings" element={<PrivateRoute><Boardings /></PrivateRoute>} />
      <Route path="/food"      element={<PrivateRoute><Food /></PrivateRoute>} />
      <Route path="/transport" element={<PrivateRoute><Transport /></PrivateRoute>} />
      <Route path="/map"       element={<PrivateRoute><MapView /></PrivateRoute>} />
      <Route path="/submit"    element={<PrivateRoute><Submit /></PrivateRoute>} />
      <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminDesk /></AdminRoute>} />

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
