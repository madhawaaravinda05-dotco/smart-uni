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
  SucLogoIcon,
  HouseIcon,
  FoodIcon,
  BusIcon
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
              <SucLogoIcon size={32} className={scrolled ? "text-primary-600 dark:text-primary-400" : "text-white"} />
              <span className={`text-xl font-black tracking-tight hidden sm:block ${scrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                UniCompanion
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection("home")} className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-600 hover:text-primary-600 dark:text-slate-300' : 'text-white/80 hover:text-white'}`}>Home</button>
              <button onClick={() => scrollToSection("about")} className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-600 hover:text-primary-600 dark:text-slate-300' : 'text-white/80 hover:text-white'}`}>What is this?</button>
              <button onClick={() => scrollToSection("team")} className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-600 hover:text-primary-600 dark:text-slate-300' : 'text-white/80 hover:text-white'}`}>About Us</button>
              <button onClick={() => scrollToSection("feedback")} className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-600 hover:text-primary-600 dark:text-slate-300' : 'text-white/80 hover:text-white'}`}>Feedback</button>
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
                  className={`px-5 py-2.5 text-sm font-bold transition-colors ${scrolled ? 'text-slate-700 dark:text-slate-200 hover:text-primary-600' : 'text-white/90 hover:text-white'}`}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${scrolled ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white' : 'bg-white text-primary-600 hover:bg-slate-50'}`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-32 pb-32 md:pt-40 md:pb-40 px-6 flex items-center min-h-[90vh] bg-gradient-to-br from-[#0bd3d3] via-[#7831f5] to-[#f83689] overflow-hidden">
        {/* Dotted / Mesh Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        
        {/* Floating CSS Elements */}
        <motion.div animate={{ y: [0, -30, 0], x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 blur-sm opacity-60 shadow-[0_0_40px_rgba(236,72,153,0.8)]"></motion.div>
        <motion.div animate={{ y: [0, 40, 0], x: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }} className="absolute bottom-1/4 right-20 w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 blur-sm opacity-60 shadow-[0_0_50px_rgba(6,182,212,0.8)]"></motion.div>
        <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }} className="absolute top-1/3 right-1/3 w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 blur-sm opacity-50"></motion.div>

        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center relative z-10 gap-16">
          {/* Left Text Content */}
          <motion.div 
            style={{ opacity: opacityHero, y: y1 }}
            className="flex-1 text-left"
            initial="hidden" animate="visible" variants={staggerContainer}
          >
            <motion.p variants={fadeInUp} className="text-white/80 font-bold tracking-[0.2em] uppercase text-sm mb-4">
              Smart Campus Navigation
            </motion.p>
            
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9] text-white uppercase drop-shadow-xl">
              Unify <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Your Campus <br />
              </span>
              Life
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/90 mb-10 max-w-lg leading-relaxed font-medium">
              Discover boardings, food spots, and transport routes tailored to your university. A platform built by students, for students.
            </motion.p>
          </motion.div>

          {/* Right 3D Image Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 relative w-full max-w-2xl"
          >
            <motion.img 
              animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              src="/hero_3d.png" 
              alt="3D Campus Elements" 
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Circular Bottom Button */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
          <motion.button 
            onClick={() => scrollToSection("about")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(74,222,128,0.6)] border-4 border-white/20 flex items-center justify-center backdrop-blur-md transition-shadow hover:shadow-[0_0_50px_rgba(74,222,128,0.8)]"
          >
            Start
          </motion.button>
        </div>
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
              <div className="aspect-square rounded-3xl border border-white/50 dark:border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                <img src="/campus_students.png" alt="University Students" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                
                {/* Floating elements */}
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-8 right-8 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <ShieldCheckIcon size={28} className="text-green-500" />
                </motion.div>
                <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }} className="absolute bottom-8 left-8 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <BuildingIcon size={28} className="text-indigo-500" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-100 dark:bg-slate-900 relative z-10 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-black mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Your comprehensive guide to university essentials, actively curated and verified by senior students for utmost reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <HouseIcon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Boardings</h3>
              <p className="text-slate-600 dark:text-slate-400">Discover safe, affordable, and highly-rated accommodations near your campus. Filter by price, distance, and amenities.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
                <FoodIcon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Food & Dining</h3>
              <p className="text-slate-600 dark:text-slate-400">Find the best local eateries, budget-friendly meal spots, and hidden culinary gems recommended by your seniors.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <BusIcon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Transport</h3>
              <p className="text-slate-600 dark:text-slate-400">Never miss a bus or train. Access curated transport routes, schedules, and specific pathways right to the university gates.</p>
            </motion.div>
          </div>
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
