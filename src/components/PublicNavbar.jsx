import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { UnifyLogoIcon } from "./Icons";

export default function PublicNavbar({ transparentOnTop = false }) {
  const { user, isMasterAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(!transparentOnTop);

  useEffect(() => {
    if (!transparentOnTop) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // init
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparentOnTop]);

  const getDashboardLink = () => {
    if (isMasterAdmin) return "/master";
    if (isAdmin) return "/admin";
    return "/dashboard";
  };

  const isDarkBg = !scrolled && transparentOnTop;

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    if (isDarkBg) {
      return `text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-white/80 hover:text-white'}`;
    }
    return `text-sm font-semibold transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300'}`;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo & Links */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3">
            <UnifyLogoIcon size={32} className={isDarkBg ? "text-white" : "text-primary-600 dark:text-primary-400"} />
            <span className={`text-xl font-black tracking-tight hidden sm:block ${isDarkBg ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Unify
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={getLinkClasses("/")}>Home</Link>
            <Link to="/about" className={getLinkClasses("/about")}>About</Link>
            <Link to="/pricing" className={getLinkClasses("/pricing")}>Pricing</Link>
            <Link to="/feedback" className={getLinkClasses("/feedback")}>Feedback</Link>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => navigate(getDashboardLink())}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              Dashboard
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-5 py-2.5 text-sm font-bold transition-colors ${isDarkBg ? 'text-white/90 hover:text-white' : 'text-slate-700 dark:text-slate-200 hover:text-primary-600'}`}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${isDarkBg ? 'bg-white text-primary-600 hover:bg-slate-50' : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white'}`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
