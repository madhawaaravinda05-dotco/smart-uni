import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  BuildingIcon,
  ShieldCheckIcon,
  MapPinIcon,
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  MailIcon,
  SucLogoIcon
} from "../components/Icons";
import { useToast } from "../components/Toast";

// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

// ─── Team Data Placeholder ─────────────────────────────────────────────────────
const TEAM_MEMBERS = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: `Team Member ${i + 1}`,
  role: "Software Engineer",
  image: `https://ui-avatars.com/api/?name=Team+Member+${i + 1}&background=random&color=fff&size=256`,
  github: "#",
  linkedin: "#",
  instagram: "#",
  email: "mailto:someone@example.com"
}));

export default function LandingPage() {
  const { user, isMasterAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { show, ToastEl } = useToast();
  const [scrolled, setScrolled] = useState(false);

  // Parallax effect for hero
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (isMasterAdmin) return "/master";
    if (isAdmin) return "/admin";
    return "/dashboard";
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans overflow-hidden selection:bg-primary-500 selection:text-white">
      {ToastEl}
      
      {/* ── Navigation ───────────────────────────────────────────────────────── */}
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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("home")}>
              <SucLogoIcon size={32} className="text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white hidden sm:block">
                UniCompanion
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection("home")} className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">Home</button>
              <button onClick={() => scrollToSection("about")} className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">What is this?</button>
              <button onClick={() => scrollToSection("team")} className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">About Us</button>
              <button onClick={() => scrollToSection("feedback")} className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors">Feedback</button>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate(getDashboardLink())}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 active:translate-y-0"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex items-center min-h-[90vh]">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            style={{ y: y1 }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/20 dark:bg-primary-600/20 rounded-full blur-3xl" 
          />
          <motion.div 
            style={{ y: useTransform(scrollY, [0, 1000], [0, -200]) }}
            className="absolute top-40 -left-20 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl" 
          />
        </div>

        <motion.div 
          style={{ opacity: opacityHero }}
          className="max-w-4xl mx-auto text-center relative z-10"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-primary-700 dark:text-primary-400 font-semibold text-sm shadow-sm">
            <ShieldCheckIcon size={16} /> <span>Smart Campus Navigation</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            Connecting University Life, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
              One Campus at a Time.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover boardings, food spots, and transport routes tailored to your university. A platform built by students, for students, to make campus living effortless.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={user ? getDashboardLink() : "/register"} className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold rounded-full transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1">
              Get Started Now
            </Link>
            <button onClick={() => scrollToSection("about")} className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 text-lg font-bold rounded-full transition-all hover:-translate-y-1">
              Learn More
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── What is this / About Section ─────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl font-black mb-6">What is our goal?</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Finding a good boarding place, knowing the best local food spots, and figuring out the quickest bus routes shouldn't be a hassle. 
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                UniCompanion centralizes this information. We empower senior students to act as Campus Admins, verifying and maintaining a pristine directory of resources specific to their university, ensuring new students have a seamless transition into campus life.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <BuildingIcon size={32} className="text-primary-500 mb-4" />
                  <div className="text-3xl font-black mb-1">31+</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Universities</div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <MapPinIcon size={32} className="text-indigo-500 mb-4" />
                  <div className="text-3xl font-black mb-1">1000+</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Local Listings</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              {/* Decorative Image/Graphic container */}
              <div className="aspect-square bg-gradient-to-tr from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-3xl border border-white/50 dark:border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <SucLogoIcon size={180} className="text-primary-600/20 dark:text-primary-400/20" />
                
                {/* Floating elements */}
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-10 right-10 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
                  <ShieldCheckIcon size={32} className="text-green-500" />
                </motion.div>
                <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute bottom-20 left-10 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
                  <BuildingIcon size={32} className="text-indigo-500" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Team Section ─────────────────────────────────────────────────────── */}
      <section id="team" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Meet Our Team</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The passionate minds behind UniCompanion. We are a dedicated group of 9 students striving to make university life better for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
              >
                {/* Decorative background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-50/50 dark:to-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="w-32 h-32 rounded-full mb-6 p-1 bg-gradient-to-tr from-primary-500 to-indigo-500 relative z-10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full border-4 border-white dark:border-slate-800" />
                </div>
                
                <h3 className="text-xl font-black mb-1 relative z-10 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{member.name}</h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 relative z-10 uppercase tracking-wide">{member.role}</p>

                <div className="flex items-center gap-3 relative z-10 mt-auto">
                  <a href={member.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors">
                    <GithubIcon size={18} />
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors">
                    <LinkedinIcon size={18} />
                  </a>
                  <a href={member.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-500 transition-colors">
                    <InstagramIcon size={18} />
                  </a>
                  <a href={member.email} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-colors">
                    <MailIcon size={18} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feedback Section ─────────────────────────────────────────────────── */}
      <section id="feedback" className="py-24 bg-white dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 relative z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-4">Send Us Feedback</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We'd love to hear your thoughts, suggestions, or any issues you've faced.
            </p>
          </div>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={(e) => {
              e.preventDefault();
              show("Thank you for your feedback!", "success");
              e.target.reset();
            }}
            className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Email</label>
                <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Message</label>
              <textarea required rows={4} placeholder="Your message here..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-500/30">
              Send Feedback
            </button>
          </motion.form>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 relative z-10">
        <p>© {new Date().getFullYear()} UniCompanion. Built by students, for students.</p>
      </footer>
    </div>
  );
}
